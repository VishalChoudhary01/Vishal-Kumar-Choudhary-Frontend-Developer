const puppeteer = require("puppeteer-core");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const HOME = "http://localhost:3000/";
const DETAIL = "http://localhost:3000/projects/spendwise";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const failures = [];
const notes = [];

function fail(msg) {
    failures.push(msg);
}

async function open(browser, url, viewport, { reduced = false } = {}) {
    const page = await browser.newPage();
    page.__errors = [];
    page.on("pageerror", (e) => page.__errors.push("pageerror: " + e.message));
    page.on("console", (m) => {
        const t = m.text();
        if (m.type() === "error") page.__errors.push("console: " + t);
        if (/hydrat|did not match|Warning: /i.test(t)) page.__errors.push("hydration: " + t);
    });
    await page.setViewport(viewport);
    if (reduced) {
        await page.emulateMediaFeatures([
            { name: "prefers-reduced-motion", value: "reduce" },
        ]);
    }
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    return page;
}

/* Read every ProjectResumeButton in the page. */
const readButtons = (page) =>
    page.evaluate(() => {
        const links = [...document.querySelectorAll("a")].filter((a) =>
            a.querySelector(":scope > span.rounded-full")
        );
        links.forEach((a, i) => a.setAttribute("data-test-btn", String(i)));
        return links.map((a, i) => {
            const kids = a.children;
            const arrow = kids[kids.length - 1];
            const circle = a.querySelector(":scope > span.rounded-full");
            return {
                id: i,
                label: (a.textContent || "").trim(),
                href: a.getAttribute("href"),
                target: a.getAttribute("target"),
                rel: a.getAttribute("rel"),
                isAnchor: a.tagName === "A",
                nestedAnchors: a.querySelectorAll("a").length,
                arrowTransform: getComputedStyle(arrow).transform,
                circleTransform: circle ? getComputedStyle(circle).transform : null,
                width: Math.round(a.getBoundingClientRect().width),
                height: Math.round(a.getBoundingClientRect().height),
            };
        });
    });

const translateX = (transform) => {
    if (!transform || transform === "none") return 0;
    const m = transform.match(/matrix\(([^)]+)\)/);
    if (m) return Number(m[1].split(",")[4]);
    const t = transform.match(/translateX\((-?[\d.]+)px\)/);
    return t ? Number(t[1]) : 0;
};

/*
 * Re-tag on demand: React can remount the hero actions during its
 * entrance, which would drop attributes set earlier.
 */
const report = (label, fn) =>
    fn().catch((e) => fail(`${label}: ${e.message}`));
const tagByLabel = async (page, needle) => {
    for (let attempt = 0; attempt < 5; attempt++) {
        const sel = await page.evaluate((n) => {
            const links = [...document.querySelectorAll("a")].filter((a) =>
                a.querySelector(":scope > span.rounded-full")
            );
            const target = links.find((a) => a.textContent.includes(n));
            if (!target) return null;
            links.forEach((a, i) => a.setAttribute("data-test-btn", String(i)));
            return `[data-test-btn="${links.indexOf(target)}"]`;
        }, needle);

        if (sel) {
            const exists = await page.$(sel);
            if (exists) return sel;
        }
        await sleep(300);
    }
    return null;
};

(async () => {
    const browser = await puppeteer.launch({
        executablePath: CHROME,
        headless: true,
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });

    /* ---------------- HOME — desktop ---------------- */
    {
        const page = await open(browser, HOME, { width: 1440, height: 900 });
        await page.waitForFunction(
            () => [...document.querySelectorAll("a")].some((a) => a.textContent.includes("Explore Projects")),
            { timeout: 60000 }
        );
        await sleep(1500);

        const before = await readButtons(page);
        notes.push(`home desktop buttons: ${before.map((b) => `${b.label}→${b.href}`).join(" | ")}`);

        const explore = before.find((b) => b.label === "Explore Projects");
        if (!explore) fail("hero CTA 'Explore Projects' missing");
        else {
            if (explore.href !== "#projects") fail(`hero CTA href changed: ${explore.href}`);
            if (explore.height < 36 || explore.height > 52)
                fail(`hero CTA height unexpected: ${explore.height}`);
        }

        const resume = before.find((b) => b.label === "Resume");
        if (!resume) fail("navbar Resume button missing");
        else {
            if (resume.href !== "/resume/vishal_kumar_choudhary_frontend_developer.pdf")
                fail(`Resume destination changed: ${resume.href}`);
            if (resume.target !== "_blank") fail("Resume should open in a new tab");
        }

        /* nested anchors anywhere */
        const nested = await page.evaluate(() => document.querySelectorAll("a a").length);
        if (nested > 0) fail(`${nested} nested <a> elements on home`);

        /* ---- hover: only the right arrow moves ---- */
        const hoverTarget = (await tagByLabel(page, "Explore Projects")) || '[data-test-btn="0"]';

        const readGesture = async () =>
            page.evaluate((sel) => {
                const a = document.querySelector(sel);
                if (!a) return null;
                const kids = a.children;
                return {
                    arrow: getComputedStyle(kids[kids.length - 1]).transform,
                    circle: getComputedStyle(
                        a.querySelector(":scope > span.rounded-full")
                    ).transform,
                    label: getComputedStyle(kids[3]).transform,
                };
            }, (await tagByLabel(page, "Explore Projects")) || hoverTarget);

        const restState = await readGesture();
        if (!restState) {
            fail("Explore Projects button not found for gesture test");
        } else {
            await page.hover((await tagByLabel(page, "Explore Projects")) || hoverTarget);
            await sleep(600);
            const hoverState = await readGesture();

            const arrowDelta = translateX(hoverState.arrow) - translateX(restState.arrow);
            if (arrowDelta < 4 || arrowDelta > 6.5)
                fail(`hover arrow moved ${arrowDelta.toFixed(2)}px (expected 4-6px)`);
            if (Math.abs(translateX(hoverState.circle) - translateX(restState.circle)) > 0.5)
                fail("left circular icon moved on hover");
            if (Math.abs(translateX(hoverState.label) - translateX(restState.label)) > 0.5)
                fail("label moved on hover");
            notes.push(`hover arrow delta=${arrowDelta.toFixed(2)}px`);

            /* ---- focus: same arrow interaction + ring ---- */
            const focusSel = (await tagByLabel(page, "Explore Projects")) || hoverTarget;
            await page.evaluate((sel) => document.querySelector(sel).focus(), focusSel);
            await sleep(500);
            const focusState = await page.evaluate((sel) => {
                const a = document.querySelector(sel);
                const kids = a.children;
                return {
                    arrow: getComputedStyle(kids[kids.length - 1]).transform,
                    outlineWidth: getComputedStyle(a).outlineWidth,
                    boxShadow: getComputedStyle(a).boxShadow,
                };
            }, focusSel);
            const focusDelta = translateX(focusState.arrow) - translateX(restState.arrow);
            if (focusDelta < 4 || focusDelta > 6.5)
                fail(`focus arrow moved ${focusDelta.toFixed(2)}px (expected 4-6px)`);
            if (focusState.outlineWidth === "0px" && focusState.boxShadow === "none")
                fail("no visible focus indicator");
            notes.push(
                `focus arrow delta=${focusDelta.toFixed(2)}px ring=${focusState.boxShadow.slice(0, 40)}`
            );
        }

        /* ---- Explore Projects actually scrolls to #projects ---- */
        const scrolled = await page.evaluate(async () => {
            const link = [...document.querySelectorAll("a")].find(
                (a) => a.textContent.trim() === "Explore Projects"
            );
            link.click();
            await new Promise((r) => setTimeout(r, 1200));
            return { y: Math.round(window.scrollY), hash: window.location.hash };
        });
        if (scrolled.hash !== "#projects" || scrolled.y < 100)
            fail(`Explore Projects did not scroll to #projects (y=${scrolled.y}, hash=${scrolled.hash})`);
        else notes.push(`Explore Projects scrolled to y=${scrolled.y} hash=${scrolled.hash}`);

        /* ---- project card overlay ---- */
        const foundCard = await page.evaluate(() => {
            const media = [...document.querySelectorAll('[role="img"]')].find((m) =>
                m.querySelector('a[href^="/projects/"]')
            );
            if (!media) return null;
            media.setAttribute("data-test-media", "");
            media.scrollIntoView({ block: "center" });
            return media.getAttribute("aria-label") || "";
        });

        if (!foundCard) fail("project card media not found");
        else {
            await sleep(700);

            const readOverlay = () =>
                page.evaluate(() => {
                    const media = document.querySelector("[data-test-media]");
                    const a = media && media.querySelector('a[href^="/projects/"]');
                    if (!a) return null;
                    const entrance = a.parentElement && a.parentElement.parentElement;
                    return {
                        href: a.getAttribute("href"),
                        label: a.textContent.trim(),
                        opacity: entrance ? getComputedStyle(entrance).opacity : null,
                        inert: entrance ? entrance.hasAttribute("inert") : null,
                    };
                });

            const overlayBefore = await readOverlay();

            if (!overlayBefore) fail("project card 'View Project' action not found");
            else {
                if (!/^\/projects\//.test(overlayBefore.href))
                    fail(`card action href unexpected: ${overlayBefore.href}`);
                if (!overlayBefore.inert)
                    fail("hidden card action is not inert (focusable while invisible)");

                await page.hover("[data-test-media]");
                await sleep(700);

                const overlayAfter = await readOverlay();

                if (Number(overlayAfter.opacity) < 0.9)
                    fail(`card action did not become visible on hover (opacity ${overlayAfter.opacity})`);
                if (overlayAfter.inert)
                    fail("card action still inert after hover");
                if (overlayAfter.label !== "View Project")
                    fail(`card action label changed: "${overlayAfter.label}"`);
                notes.push(
                    `card action: ${overlayBefore.href} opacity ${overlayBefore.opacity}→${overlayAfter.opacity} inert ${overlayBefore.inert}→${overlayAfter.inert}`
                );
            }
        }

        /* ---- responsive overflow sweep (home) ---- */
        for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
            await page.setViewport({ width, height: width < 768 ? 844 : 900 });
            await sleep(700);
            const m = await page.evaluate(() => {
                const links = [...document.querySelectorAll("a")].filter((a) =>
                    a.querySelector(":scope > span.rounded-full")
                );
                const doc = document.documentElement;
                return {
                    overflow: doc.scrollWidth > window.innerWidth + 1,
                    widest: links.reduce(
                        (acc, a) => Math.max(acc, Math.round(a.getBoundingClientRect().width)),
                        0
                    ),
                    clipped: links.some(
                        (a) => a.scrollWidth > a.clientWidth + 1
                    ),
                    viewport: window.innerWidth,
                };
            });
            if (m.overflow) fail(`home ${width}px: horizontal page overflow`);
            if (m.clipped) fail(`home ${width}px: button label clipped`);
            if (m.widest > m.viewport - 16)
                fail(`home ${width}px: button (${m.widest}px) wider than viewport`);
        }

        if (page.__errors.length)
            page.__errors.slice(0, 5).forEach((e) => fail("home console: " + e));

        await page.close();
    }

    /* ---------------- PROJECT DETAIL ---------------- */
    {
        const page = await open(browser, DETAIL, { width: 1440, height: 900 });
        await page.waitForFunction(
            () => [...document.querySelectorAll("a")].some((a) => a.textContent.includes("View Live")),
            { timeout: 60000 }
        );
        await sleep(800);

        const detailButtons = await readButtons(page);
        notes.push(`detail buttons: ${detailButtons.map((b) => `${b.label}→${b.href}`).join(" | ")}`);

        const live = detailButtons.find((b) => b.label.includes("Live"));
        const source = detailButtons.find((b) => b.label.includes("Source"));

        if (!live) fail("detail hero 'View Live' action missing");
        else {
            if (live.href !== "https://spendwise-shop.vercel.app/")
                fail(`Live destination changed: ${live.href}`);
            if (live.target !== "_blank" || !/noopener/.test(live.rel || ""))
                fail("Live link must open in a new tab with rel=noopener");
        }

        if (!source) fail("detail hero 'View Source' action missing");
        else {
            if (source.href !== "https://github.com/VishalChoudhary01/spendwise")
                fail(`Source destination changed: ${source.href}`);
            /* desktop-only rule */
            const sourceSelDesktop = await tagByLabel(page, "Source");
            if (!sourceSelDesktop) fail("Source action not found on desktop");
            const visibleAtDesktop = sourceSelDesktop
                ? await page.evaluate((sel) => {
                      const a = document.querySelector(sel);
                      return a ? getComputedStyle(a.parentElement).display !== "none" : false;
                  }, sourceSelDesktop)
                : false;
            if (!visibleAtDesktop) fail("Source should be visible on desktop");

            await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
            await sleep(900);
            const sourceSelMobile = await tagByLabel(page, "Source");
            const visibleAtMobile = sourceSelMobile
                ? await page.evaluate((sel) => {
                      const a = document.querySelector(sel);
                      if (!a) return { display: "missing", focusable: false };
                      const wrap = a.parentElement;
                      return {
                          display: getComputedStyle(wrap).display,
                          focusable: !a.closest("[inert]") && a.tabIndex !== -1,
                      };
                  }, sourceSelMobile)
                : { display: "missing", focusable: false };
            if (visibleAtMobile.display !== "none")
                fail(`Source must be hidden on mobile (display=${visibleAtMobile.display})`);
            notes.push(`source display on mobile = ${visibleAtMobile.display}`);

            const mobileMetrics = await page.evaluate(() => ({
                overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
                buttons: [...document.querySelectorAll("a")]
                    .filter((a) => a.querySelector(":scope > span.rounded-full"))
                    .map((a) => ({
                        label: a.textContent.trim(),
                        w: Math.round(a.getBoundingClientRect().width),
                    })),
            }));
            if (mobileMetrics.overflow) fail("detail 390px: horizontal page overflow");
            notes.push(`detail 390px buttons: ${JSON.stringify(mobileMetrics.buttons)}`);
        }

        const nested = await page.evaluate(() => document.querySelectorAll("a a").length);
        if (nested > 0) fail(`${nested} nested <a> elements on detail`);

        if (page.__errors.length)
            page.__errors.slice(0, 5).forEach((e) => fail("detail console: " + e));

        await page.close();
    }

    /* ---------------- REDUCED MOTION ---------------- */
    {
        const page = await open(browser, HOME, { width: 1440, height: 900 }, { reduced: true });
        await page.waitForFunction(
            () => [...document.querySelectorAll("a")].some((a) => a.textContent.includes("Explore Projects")),
            { timeout: 60000 }
        );
        await sleep(1500);

        const sel = await tagByLabel(page, "Explore Projects");
        if (!sel) {
            fail("reduced motion: Explore Projects button not found");
        } else {
            await page.hover(sel);
            await sleep(600);
            const state = await page.evaluate((s) => {
                const a = document.querySelector(s);
                if (!a) return null;
                const kids = a.children;
                return getComputedStyle(kids[kids.length - 1]).transform;
            }, sel);
            const moved = state === null ? NaN : translateX(state);
            if (state === null) fail("reduced motion: button disappeared before hover measurement");
            else if (Math.abs(moved) > 0.5)
                fail(`reduced motion: arrow still moved ${moved}px on hover`);
            else notes.push("reduced motion: arrow stays at rest on hover");
        }

        if (page.__errors.length)
            page.__errors.slice(0, 5).forEach((e) => fail("reduced console: " + e));

        await page.close();
    }

    await browser.close();

    console.log("\nNOTES");
    notes.forEach((n) => console.log("  · " + n));
    console.log(failures.length === 0 ? "\nALL BUTTON CHECKS PASS" : "\nFAILURES:");
    failures.forEach((f) => console.log("  ✗ " + f));
    process.exit(failures.length === 0 ? 0 : 1);
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
