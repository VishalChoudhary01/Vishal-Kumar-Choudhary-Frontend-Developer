const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");
const os = require("os");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const HOME = "http://localhost:3000/";
const DETAIL = "http://localhost:3000/projects/spendwise";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const failures = [];
const notes = [];
const fail = (m) => failures.push(m);

/* Shared page-side helper: only real ProjectResumeButtons —
   a large rounded-full circle containing an svg + visible text.
   Excludes nav ActiveDots (3-4px) and social icon circles (no text). */
const PAGE_HELPERS = `
    window.__btns = () => [...document.querySelectorAll("a")].filter((a) => {
        const c = a.querySelector(":scope > span.rounded-full");
        if (!c) return false;
        if (c.getBoundingClientRect().width < 20) return false;
        if (!c.querySelector("svg")) return false;
        if (!a.textContent.trim()) return false;
        return true;
    });
    window.__read = (a) => {
        const circle = a.querySelector(":scope > span.rounded-full");
        const r = a.getBoundingClientRect();
        const cr = circle.getBoundingClientRect();
        const label = [...a.children].find(
            (c) => c !== circle && !c.hasAttribute("aria-hidden")
        );
        const lr = label ? label.getBoundingClientRect() : null;
        return {
            label: (a.textContent || "").trim(),
            href: a.getAttribute("href"),
            target: a.getAttribute("target"),
            download: a.getAttribute("download"),
            w: Math.round(r.width),
            h: Math.round(r.height),
            left: Math.round(r.left),
            right: Math.round(r.right),
            bottom: Math.round(r.bottom),
            circle: Math.round(cr.width),
            circleLeftEdge: Math.round(cr.left - r.left),
            restGap: lr ? Math.round(lr.left - cr.right) : null,
            rightPad: lr ? Math.round(r.right - lr.right) : null,
            fontSize: label ? getComputedStyle(label).fontSize : null,
            fontWeight: label ? getComputedStyle(label).fontWeight : null,
            clipped: a.scrollWidth > a.clientWidth + 1,
            opacity: getComputedStyle(a.parentElement).opacity,
        };
    };
`;

async function open(browser, url, viewport) {
    const page = await browser.newPage();
    page.__errors = [];
    page.on("pageerror", (e) => page.__errors.push("pageerror: " + e.message));
    page.on("console", (m) => {
        if (m.type() === "error") page.__errors.push("console: " + m.text());
    });
    page.on("framenavigated", (f) => {
        if (f === page.mainFrame()) notes.push("navigated: " + f.url());
    });
    await page.setViewport(viewport);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(PAGE_HELPERS);
    return page;
}

/* Every helper-using evaluate re-injects the helpers, so a dev-server
   reload can never leave us calling an undefined window function. */
const ev = (page, fn) =>
    page.evaluate(`(() => {\n${PAGE_HELPERS}\nreturn (${fn.toString()})();\n})()`);

const evh = (page, fn) =>
    page.evaluateHandle(`(() => {\n${PAGE_HELPERS}\nreturn (${fn.toString()})();\n})()`);

const readAll = (page) => page.evaluate(() => window.__btns().map(window.__read));

const tx = (transform) => {
    if (!transform || transform === "none") return 0;
    const m = transform.match(/matrix\(([^)]+)\)/);
    if (m) return Number(m[1].split(",")[4]);
    const t = transform.match(/translateX\((-?[\d.]+)px\)/);
    return t ? Number(t[1]) : 0;
};

/* Check one default/sm button against its breakpoint expectations. */
function checkGeometry(tag, b, expect) {
    if (b.h !== expect.h) fail(`${tag} "${b.label}": height ${b.h} (expected ${expect.h})`);
    if (b.circle !== expect.c) fail(`${tag} "${b.label}": circle ${b.circle} (expected ${expect.c})`);
    if (b.clipped) fail(`${tag} "${b.label}": label clipped`);
    if (b.circleLeftEdge !== 4) fail(`${tag} "${b.label}": circle starts ${b.circleLeftEdge}px from left (expected 4)`);
    if (b.restGap !== null && b.restGap < 2)
        fail(`${tag} "${b.label}": circle touches label at rest (gap ${b.restGap}px)`);
    const hoverGap = b.rightPad - (4 + b.circle);
    if (hoverGap < 2)
        fail(`${tag} "${b.label}": circle would cover label on hover (gap ${hoverGap}px)`);
}

(async () => {
    const browser = await puppeteer.launch({
        executablePath: CHROME,
        headless: true,
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });

    /* ================= HOME ================= */
    const page = await open(browser, HOME, { width: 1440, height: 900 });
    await page.waitForFunction(
        () =>
            [...document.querySelectorAll("a")].some((a) =>
                a.textContent.includes("Explore Projects")
            ),
        { timeout: 60000 }
    );
    await sleep(1500);

    /* ---- responsive size matrix (default/sm buttons) ---- */
    const sizes = [
        { w: 320, h: 40, c: 32 },
        { w: 375, h: 40, c: 32 },
        { w: 430, h: 40, c: 32 },
        { w: 640, h: 44, c: 36 },
        { w: 768, h: 44, c: 36 },
        { w: 912, h: 44, c: 36 },
        { w: 1024, h: 48, c: 40 },
        { w: 1440, h: 48, c: 40 },
        { w: 1920, h: 48, c: 40 },
    ];

    for (const s of sizes) {
        await page.setViewport({ width: s.w, height: s.w < 768 ? 844 : 900 });
        await sleep(900);
        const data = await ev(page, () => ({
            overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
            buttons: window.__btns().map(window.__read),
        }));
        if (data.overflow) fail(`${s.w}px: horizontal page overflow`);
        for (const b of data.buttons) checkGeometry(`${s.w}px`, b, s);
        notes.push(
            `${s.w}px: ` +
                data.buttons
                    .map((b) => `${b.label} ${b.w}x${b.h} circle${b.circle} ${b.fontSize}`)
                    .join(" | ")
        );
    }

    await page.setViewport({ width: 1440, height: 900 });
    await sleep(800);

    /* ---- travel math: circle 4px left → 4px right on hover ---- */
    {
        const rest = await ev(page, () => {
            const a = window.__btns().find((x) => x.textContent.includes("Explore Projects"));
            if (!a) return null;
            const c = a.querySelector(":scope > span.rounded-full");
            return {
                w: Math.round(a.getBoundingClientRect().width),
                circle: Math.round(c.getBoundingClientRect().width),
                t: getComputedStyle(c).transform,
            };
        });
        if (!rest) fail("hero CTA not found for travel test");
        else {
            await ev(page, () => {
                const a = window.__btns().find((x) => x.textContent.includes("Explore Projects"));
                a.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
            });
            const handle = await evh(page, () =>
                window.__btns().find((x) => x.textContent.includes("Explore Projects"))
            );
            await handle.asElement().hover();
            await sleep(700);
            const hover = await ev(page, () => {
                const a = window.__btns().find((x) => x.textContent.includes("Explore Projects"));
                const c = a.querySelector(":scope > span.rounded-full");
                return {
                    t: getComputedStyle(c).transform,
                    gapFromRight: Math.round(
                        a.getBoundingClientRect().right - c.getBoundingClientRect().right
                    ),
                };
            });
            const moved = tx(hover.t) - tx(rest.t);
            const expected = rest.w - rest.circle - 8;
            if (Math.abs(moved - expected) > 1.5)
                fail(`travel ${moved.toFixed(1)}px != expected ${expected}px`);
            if (Math.abs(hover.gapFromRight - 4) > 1.5)
                fail(`hover circle ends ${hover.gapFromRight}px from right edge (expected 4)`);
            notes.push(
                `travel ${moved.toFixed(1)}px (expected ${expected}), hover right gap ${hover.gapFromRight}px`
            );
        }
    }

    /* ---- main page: Source is gone; pill always visible ---- */
    {
        const srcAnchors = await page.evaluate(() =>
            [...document.querySelectorAll("a")].filter((a) =>
                a.textContent.includes("Source")
            ).map((a) => a.textContent.trim())
        );
        if (srcAnchors.length)
            fail(`main page still shows Source action: ${JSON.stringify(srcAnchors)}`);

        const readPill = () =>
            page.evaluate(() => {
                const media = [...document.querySelectorAll('[role="img"]')].find((m) =>
                    m.querySelector('a[href^="/projects/"]')
                );
                if (!media) return null;
                media.scrollIntoView({ block: "center" });
                const a = media.querySelector('a[href^="/projects/"]');
                const wrap = a.parentElement;
                return {
                    opacity: getComputedStyle(wrap).opacity,
                    inert: wrap.hasAttribute("inert") || a.hasAttribute("inert"),
                };
            });

        await sleep(600);
        const pill = await readPill();
        if (!pill) fail("card pill not found");
        else {
            if (Number(pill.opacity) < 0.9)
                fail(`desktop card pill not visible without hover (opacity ${pill.opacity})`);
            if (pill.inert) fail("card pill is inert while visible");
            notes.push(`desktop card pill: opacity ${pill.opacity}, inert ${pill.inert}`);
        }
    }

    /* ---- MOBILE MENU: nav variant at every mobile width ---- */
    const navExpect = [
        { w: 320, h: 56, c: 44 },
        { w: 360, h: 56, c: 44 },
        { w: 375, h: 56, c: 44 },
        { w: 390, h: 56, c: 44 },
        { w: 430, h: 56, c: 44 },
        { w: 640, h: 64, c: 48 },
        { w: 768, h: 64, c: 48 },
        { w: 912, h: 64, c: 48 },
    ];

    let downloadVerified = false;

    for (const s of navExpect) {
        await page.setViewport({
            width: s.w,
            height: s.w < 768 ? 844 : 900,
            isMobile: s.w < 768,
            hasTouch: s.w < 768,
        });
        await sleep(700);

        await page.evaluate(() => {
            const btn = document.querySelector('button[aria-label="Open menu"]');
            if (btn) btn.click();
        });
        await page.waitForFunction(() => document.getElementById("mobile-menu"), {
            timeout: 10000,
        });
        await sleep(900);

        const m = await ev(page, () => {
            const dialog = document.getElementById("mobile-menu");
            const a = dialog && dialog.querySelector("a[download]");
            if (!a) return { open: Boolean(dialog), hasBtn: false };
            const read = window.__read(a);
            const expectedWidth = Math.min(window.innerWidth - 40, 384);
            return {
                open: true,
                hasBtn: true,
                ...read,
                expectedWidth,
                centeredDelta: Math.abs(
                    read.left - (window.innerWidth - read.w) / 2
                ),
                inViewport: read.bottom <= window.innerHeight + 1 && read.left >= 0,
                overflow:
                    document.documentElement.scrollWidth > window.innerWidth + 1,
                hrefOk:
                    a.getAttribute("href") ===
                    "/resume/vishal_kumar_choudhary_frontend_developer.pdf",
                downloadName: a.getAttribute("download"),
            };
        });

        if (!m.open) fail(`${s.w}px: mobile menu did not open`);
        else if (!m.hasBtn) fail(`${s.w}px: nav Download Resume button missing`);
        else {
            if (m.h !== s.h)
                fail(`${s.w}px nav: height ${m.h} (expected ${s.h})`);
            if (m.circle !== s.c)
                fail(`${s.w}px nav: circle ${m.circle} (expected ${s.c})`);
            if (Number(m.fontWeight) < 600)
                fail(`${s.w}px nav: label weight ${m.fontWeight} (expected >= 600)`);
            if (parseFloat(m.fontSize) < 13)
                fail(`${s.w}px nav: label ${m.fontSize} (expected >= 13px)`);
            if (Math.abs(m.w - m.expectedWidth) > 2)
                fail(`${s.w}px nav: width ${m.w} (expected ~${m.expectedWidth})`);
            if (m.centeredDelta > 2)
                fail(`${s.w}px nav: not centered (delta ${m.centeredDelta.toFixed(1)}px)`);
            if (m.left < 16)
                fail(`${s.w}px nav: only ${m.left}px margin from viewport edge`);
            if (!m.inViewport) fail(`${s.w}px nav: button outside viewport`);
            if (m.overflow) fail(`${s.w}px: horizontal overflow with menu open`);
            if (m.clipped) fail(`${s.w}px nav: label clipped`);
            if (!m.hrefOk) fail(`${s.w}px nav: href ${m.href}`);
            if (m.downloadName !== "vishal_kumar_choudhary_frontend_developer.pdf")
                fail(`${s.w}px nav: download attr ${m.downloadName}`);
            if (m.circleLeftEdge !== 4)
                fail(`${s.w}px nav: circle starts ${m.circleLeftEdge}px from left`);
            if (m.restGap !== null && m.restGap < 2)
                fail(`${s.w}px nav: circle touches label at rest (gap ${m.restGap}px)`);
            const hoverGap = m.rightPad - (4 + m.circle);
            if (hoverGap < 2)
                fail(`${s.w}px nav: circle would cover label on hover (gap ${hoverGap}px)`);
            notes.push(
                `menu ${s.w}px: nav ${m.w}x${m.h} circle${m.circle} ${m.fontSize} w${m.fontWeight} marginL=${m.left} centered±${m.centeredDelta.toFixed(1)}`
            );

            /* real download at 390px */
            if (s.w === 390 && !downloadVerified) {
                const dlDir = fs.mkdtempSync(path.join(os.tmpdir(), "resume-dl-"));
                const cdp = await page.target().createCDPSession();
                await cdp.send("Browser.setDownloadBehavior", {
                    behavior: "allow",
                    downloadPath: dlDir,
                    eventsEnabled: true,
                });
                await page.evaluate(() => {
                    const a = document.querySelector('#mobile-menu a[download]');
                    a.click();
                });
                for (let i = 0; i < 40 && !downloadVerified; i++) {
                    await sleep(250);
                    const files = fs.readdirSync(dlDir);
                    if (files.length) {
                        const f = path.join(dlDir, files[0]);
                        const size = fs.statSync(f).size;
                        if (size > 1000) {
                            downloadVerified = true;
                            notes.push(
                                `download OK: ${files[0]} (${size} bytes, ${size > 50000 ? "plausible PDF" : "small file"})`
                            );
                        }
                    }
                }
                if (!downloadVerified)
                    fail("mobile menu resume click did not produce a downloaded file");
                else fs.rmSync(dlDir, { recursive: true, force: true });
            }
        }

        await page.keyboard.press("Escape");
        await sleep(600);
        const closed = await page.evaluate(() => !document.getElementById("mobile-menu"));
        if (!closed && s.w === 390) fail("mobile menu did not close on Escape");
    }

    /* ---- reduced motion: circle must not move on hover ---- */
    {
        const rm = await browser.newPage();
        await rm.setViewport({ width: 1440, height: 900 });
        await rm.emulateMediaFeatures([
            { name: "prefers-reduced-motion", value: "reduce" },
        ]);
        await rm.goto(HOME, { waitUntil: "domcontentloaded", timeout: 60000 });
        await rm.evaluate(PAGE_HELPERS);
        await rm.waitForFunction(
            () =>
                [...document.querySelectorAll("a")].some((a) =>
                    a.textContent.includes("Explore Projects")
                ),
            { timeout: 60000 }
        );
        await sleep(1200);
        const before = await ev(rm, () => {
            const a = window.__btns().find((x) => x.textContent.includes("Explore Projects"));
            return getComputedStyle(a.querySelector(":scope > span.rounded-full")).transform;
        });
        const h = await evh(rm, () =>
            window.__btns().find((x) => x.textContent.includes("Explore Projects"))
        );
        await h.asElement().hover();
        await sleep(700);
        const after = await ev(rm, () => {
            const a = window.__btns().find((x) => x.textContent.includes("Explore Projects"));
            return getComputedStyle(a.querySelector(":scope > span.rounded-full")).transform;
        });
        const delta = Math.abs(tx(after) - tx(before));
        if (delta > 0.5) fail(`reduced motion: circle moved ${delta}px on hover`);
        else notes.push("reduced motion: circle stays at rest");
        await rm.close();
    }

    if (page.__errors.length)
        page.__errors.slice(0, 5).forEach((e) => fail("home console: " + e));
    await page.close();

    /* ================= DETAIL PAGE ================= */
    {
        const p2 = await open(browser, DETAIL, { width: 1440, height: 900 });
        await p2.waitForFunction(
            () => document.body.innerText.includes("View Live"),
            { timeout: 60000 }
        );
        await sleep(1200);

        const desktop = await ev(p2, () => {
            const btns = window.__btns();
            const find = (t) => btns.find((b) => b.textContent.includes(t));
            const src = find("Source");
            return {
                labels: btns.map((b) => b.label),
                live: Boolean(find("View Live")),
                figma: Boolean(find("Figma")),
                sourceVisible: src
                    ? getComputedStyle(src.parentElement).display !== "none"
                    : false,
                sourceTarget: src && src.getAttribute("target"),
                heights: btns.map((b) => b.h),
            };
        });
        notes.push(`detail desktop: ${desktop.labels.join(" | ")} heights ${desktop.heights.join(",")}`);
        if (!desktop.live) fail("detail desktop: View Live missing");
        if (!desktop.sourceVisible) fail("detail desktop: Source not visible");
        if (desktop.sourceTarget !== "_blank") fail("detail: Source must open in new tab");
        if (desktop.heights.some((h) => h !== 48))
            fail(`detail desktop: button heights ${desktop.heights.join(",")} (expected 48)`);

        await p2.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
        await sleep(1200);
        const mobile = await ev(p2, () => {
            const btns = window.__btns();
            /* Source is wrapper-hidden (display:none) on mobile, so it has no
               box — search raw anchors instead of the sized-button filter. */
            const srcAll = [...document.querySelectorAll("a")].filter((a) =>
                a.textContent.includes("Source")
            );
            return {
                labels: btns.map((b) => b.label),
                sourceDisplay: srcAll.length
                    ? getComputedStyle(srcAll[0].parentElement).display
                    : "missing",
                overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
                clipped: btns.some((b) => b.clipped),
                heights: btns.map((b) => b.h),
                circles: btns.map((b) => b.circle),
            };
        });
        notes.push(
            `detail mobile: ${mobile.labels.join(" | ")} heights ${mobile.heights.join(",")} source=${mobile.sourceDisplay}`
        );
        if (!mobile.labels.some((l) => l.includes("View Live")))
            fail("detail mobile: View Live missing");
        if (!["none", "missing"].includes(mobile.sourceDisplay))
            fail(`detail mobile: Source must stay hidden (display=${mobile.sourceDisplay})`);
        if (mobile.overflow) fail("detail 390px: horizontal overflow");
        if (mobile.clipped) fail("detail 390px: label clipped");
        if (mobile.heights.some((h) => h !== 40))
            fail(`detail mobile: heights ${mobile.heights.join(",")} (expected 40)`);
        if (mobile.circles.some((c) => c !== 32))
            fail(`detail mobile: circles ${mobile.circles.join(",")} (expected 32)`);

        if (p2.__errors.length)
            p2.__errors.slice(0, 5).forEach((e) => fail("detail console: " + e));
        await p2.close();
    }

    await browser.close();

    console.log("\nNOTES");
    notes.forEach((n) => console.log("  · " + n));
    console.log(failures.length === 0 ? "\nALL CHECKS PASS" : "\nFAILURES:");
    failures.forEach((f) => console.log("  ✗ " + f));
    process.exit(failures.length === 0 ? 0 : 1);
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
