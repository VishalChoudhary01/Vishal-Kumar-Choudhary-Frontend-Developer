/*
 * Phase 12 — heading hierarchy + SEO structure verifier.
 *
 * For each route it checks, against the SERVED html:
 *   1. exactly one <h1>
 *   2. no heading level (h2/h3) appears before the first <h1>
 *   3. no skipped levels on the way down (h1 -> h3 without an h2)
 *   4. brand/logo text ("V Kr.") is NOT a heading
 *   5. title, meta description, canonical, og:title, twitter:card present
 *   6. JSON-LD parses and lists its @type values
 *
 * Exits 1 if any route fails, so it can gate a build.
 *
 * Usage: node scripts/p12-heading-check.cjs [baseUrl]
 */
const BASE = process.argv[2] || "http://localhost:3010";

const ROUTES = [
    "/",
    "/projects/class-fuse",
    "/projects/spendwise",
    "/projects/system-canvas",
    "/projects/nextjs-master",
];

/* Build the accessibility-tree text of `html`: elements carrying
   aria-hidden="true" contribute nothing, because screen readers and
   crawlers skip them. This project paints decorative animation layers
   (a per-character outline of the hero title) with aria-hidden, so a naive
   "strip all tags" scraper would count that as a second copy of the text.

   Single left-to-right scan: accumulate text only while hiddenDepth is 0,
   and track the depth of nested aria-hidden subtrees. */
const VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;
const ARIA_HIDDEN = /aria-hidden\s*=\s*["']true["']/i;

/*
 * Accessibility-tree text of `html`.
 *
 * Elements carrying aria-hidden="true" contribute nothing: screen readers
 * and crawlers skip them, so including them would fabricate duplication that
 * does not exist. The hero paints its title twice on purpose (a solid layer
 * plus a per-character outline layer), with the outline aria-hidden.
 *
 * The depth counter records the nesting level *at which the hidden subtree
 * started* and restores exactly that level on its matching close, so spans
 * nested inside the hidden subtree cannot corrupt it. A plain incrementing
 * counter does corrupt: each nested <span> opens at depth 1 and its </span>
 * then drops depth back to 0, letting the hidden subtree's remaining text
 * leak into the result.
 */
const a11yText = (html) => {
    const re = /<\s*(\/)?\s*([a-z0-9]+)((?:"[^"]*"|'[^']*'|[^"'>])*)>/gi;
    let hiddenAtDepth = null; /* depth at which the hidden subtree began */
    let depth = 0; /* total open-element depth */
    let pos = 0;
    let text = "";
    let m;
    while ((m = re.exec(html))) {
        if (hiddenAtDepth === null) text += html.slice(pos, m.index);

        const closing = Boolean(m[1]);
        const tag = m[2];
        const attrs = m[3];
        const isVoid = VOID.test(tag) || /\/\s*$/.test(attrs);

        if (closing) {
            depth -= 1;
            if (hiddenAtDepth !== null && depth === hiddenAtDepth) hiddenAtDepth = null;
        } else {
            if (hiddenAtDepth === null && ARIA_HIDDEN.test(attrs) && !isVoid) {
                hiddenAtDepth = depth;
            }
            if (!isVoid) depth += 1;
        }

        pos = re.lastIndex;
    }
    text += html.slice(pos);
    return text.replace(/\s+/g, " ").trim();
};

/* Strip tags + collapse whitespace so we compare visible text. */
const textOf = (html) => a11yText(html);

async function audit(pathname) {
    const res = await fetch(`${BASE}${pathname}`);
    const html = await res.text();
    const problems = [];

    if (res.status !== 200) problems.push(`status ${res.status}`);

    /* ---- headings, in document order ---- */
    const headings = [...html.matchAll(/<(h[1-3])\b[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => ({
        level: Number(m[1][1]),
        text: textOf(m[2]),
    }));

    const h1s = headings.filter((h) => h.level === 1);
    if (h1s.length !== 1) problems.push(`expected exactly 1 h1, found ${h1s.length}`);

    /* The single h1 must state its phrase once. A title painted across
       decorative layers (solid text + per-character outline + aria-label)
       leaks into the accessible name and reads as 2-3x duplication to a
       crawler and a screen reader. */
    if (h1s.length === 1) {
        const flat = h1s[0].text.toUpperCase().replace(/\s+/g, "");
        const n = flat.length;
        /* If the whole heading text is two identical halves
           ("FRONTENDDEVELOPER" + "FRONTENDDEVELOPER"), the title is
           exposed to assistive tech more than once. */
        if (n >= 4 && n % 2 === 0 && flat.slice(0, n / 2) === flat.slice(n / 2))
            problems.push(`h1 text duplicated verbatim: "${h1s[0].text.slice(0, 60)}"`);
        /* A per-character outline layer that is not aria-hidden repeats the
           phrase letter-spaced, e.g. "FRONTENDDEVELOPERF R O N T E N D…". */
        if (/([A-Z])\s(?:\1\s){3,}/.test(h1s[0].text.toUpperCase()))
            problems.push(`h1 exposes a letter-spaced duplicate layer: "${h1s[0].text.slice(0, 60)}"`);
    }

    const firstH1Idx = headings.findIndex((h) => h.level === 1);
    const beforeH1 = headings.slice(0, firstH1Idx === -1 ? headings.length : firstH1Idx);
    if (firstH1Idx === -1) problems.push("no h1 at all");
    else if (beforeH1.length)
        problems.push(`${beforeH1.length} heading(s) before h1: ${beforeH1.map((h) => `h${h.level}"${h.text.slice(0, 20)}"`).join(", ")}`);

    let prev = 0;
    for (const h of headings) {
        if (prev && h.level > prev + 1)
            problems.push(`skipped level h${prev} -> h${h.level} at "${h.text.slice(0, 30)}"`);
        prev = h.level;
    }

    /* brand mark must not be a heading */
    const brandHeading = headings.find((h) => /v\s*kr\.?/i.test(h.text));
    if (brandHeading) problems.push(`brand "V Kr." is a heading (h${brandHeading.level})`);

    /* ---- metadata ---- */
    /* Match the whole tag first, then pull the attribute out of it. The page
       ships very long single-line HTML, so a pattern that assumes the
       attribute ends near the tag start false-negatives. */
    const tagHas = (reTag, reAttr) => {
        const tag = html.match(reTag);
        if (!tag) return false;
        /* "/>"'s slash is outside the attribute capture, so include it.
           HTML void elements are written without a slash in this codebase
           ("<meta …>"), so classify them as self-closing too. */
        return reAttr.test(`${tag[0].slice(0, -1)}/`) ||
            /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(tag);
    };
    if (!/<title>[^<]+<\/title>/.test(html)) problems.push("missing <title>");
    if (!tagHas(/<meta\s+name="description"[^>]*>/, /content="[^"]+"/))
        problems.push("missing meta description");
    if (!tagHas(/<link\s+rel="canonical"[^>]*>/, /href="[^"]+"/))
        problems.push("missing canonical");
    if (!tagHas(/<meta\s+property="og:title"[^>]*>/, /content="[^"]+"/))
        problems.push("missing og:title");
    if (!tagHas(/<meta\s+name="twitter:card"[^>]*>/, /content="[^"]+"/))
        problems.push("missing twitter:card");

    /* ---- structured data ---- */
    const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    const ldTypes = [];
    for (const b of ldBlocks) {
        try {
            const parsed = JSON.parse(b[1]);
            const collect = (node) => {
                if (Array.isArray(node)) return node.forEach(collect);
                if (node && typeof node === "object") {
                    if (node["@type"]) ldTypes.push([].concat(node["@type"]).join("|"));
                    if (node["@graph"]) collect(node["@graph"]);
                }
            };
            collect(parsed);
        } catch {
            problems.push("JSON-LD failed to parse");
        }
    }

    return {
        path: pathname,
        ok: problems.length === 0,
        h1: h1s[0] ? h1s[0].text.slice(0, 40) : null,
        outline: headings.map((h) => `h${h.level}:${h.text.slice(0, 24)}`).slice(0, 8),
        ldTypes,
        problems,
    };
}

(async () => {
    let failed = false;
    for (const r of ROUTES) {
        const out = await audit(r);
        console.log(`${out.ok ? "PASS" : "FAIL"}  ${out.path}  h1="${out.h1}"  ld=[${out.ldTypes.join(", ")}]`);
        if (!out.ok) {
            failed = true;
            out.problems.forEach((p) => console.log(`        - ${p}`));
        }
    }
    process.exit(failed ? 1 : 0);
})();
