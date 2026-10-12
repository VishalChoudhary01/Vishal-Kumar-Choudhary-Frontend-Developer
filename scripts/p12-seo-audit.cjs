/* Phase 12 — SEO audit harness.
 * Extracts, per route: title, description, canonical, robots meta, OG/Twitter
 * tags, JSON-LD blocks (@type list), H1 text(s), heading outline (h1-h3),
 * lang attr, and img alt coverage.
 * Usage: node scripts/p12-seo-audit.cjs [baseUrl]  (default http://localhost:3010)
 */
const BASE = process.argv[2] || "http://localhost:3010";
const ROUTES = ["/", "/projects/class-fuse", "/projects/spendwise", "/projects/system-canvas", "/projects/nextjs-master"];

(async () => {
    for (const route of ROUTES) {
        const res = await fetch(BASE + route);
        const html = await res.text();
        const g = (re) => (html.match(re) || [])[1]?.trim() || null;
        const all = (re) => [...html.matchAll(re)].map(m => m[1].trim());
        const jsonld = all(/<script type="application\/ld\+json">(.*?)<\/script>/gs).map(s => {
            try { const j = JSON.parse(s); return { types: [].concat(j["@type"]).join(","), keys: Object.keys(j).length }; }
            catch (e) { return { types: "PARSE_ERROR", keys: 0 }; }
        });
        const outline = [];
        for (const m of html.matchAll(/<(h[1-3])[^>]*>(.*?)<\/\1>/gs)) {
            outline.push(`${m[1]}:${m[2].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 60)}`);
        }
        const imgs = [...html.matchAll(/<img[^>]*>/g)].map(m => m[0]);
        const noAlt = imgs.filter(t => !/alt="[^"]+"/.test(t)).length;
        console.log(JSON.stringify({
            route, status: res.status,
            title: g(/<title>(.*?)<\/title>/s),
            description: g(/<meta name="description" content="(.*?)"/s),
            canonical: g(/<link rel="canonical" href="(.*?)"/s),
            robots: g(/<meta name="robots" content="(.*?)"/s),
            ogTitle: g(/<meta property="og:title" content="(.*?)"/s),
            ogImage: g(/<meta property="og:image" content="(.*?)"/s),
            twCard: g(/<meta name="twitter:card" content="(.*?)"/s),
            lang: g(/<html[^>]*lang="(.*?)"/s),
            h1s: all(/<h1[^>]*>(.*?)<\/h1>/gs).map(t => t.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 70)),
            outline: outline.slice(0, 14),
            jsonld,
            imgCount: imgs.length, imgNoAlt: noAlt,
        }, null, 1));
    }
})();
