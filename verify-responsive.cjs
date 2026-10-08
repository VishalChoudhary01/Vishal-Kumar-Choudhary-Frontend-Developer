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
            /* offset metrics are layout-based, so a scaled ancestor
               (e.g. the Live overlay's rest scale 0.97) can't skew them */
            w: a.offsetWidth,
            h: a.offsetHeight,
            left: Math.round(r.left),
            right: Math.round(r.right),
            bottom: Math.round(r.bottom),
            circle: circle.offsetWidth,
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

    /* ---- keyboard focus: circle travels to the right edge ---- */
    {
        const readResumeCircle = () =>
            ev(page, () => {
                const a =
                    window.__btns().find((b) => b.label === "Resume") ||
                    window.__btns()[0];
                if (!a) return null;
                const c = a.querySelector(":scope > span.rounded-full");
                return {
                    t: getComputedStyle(c).transform,
                    ring: getComputedStyle(a).boxShadow,
                };
            });

        const before = await readResumeCircle();
        const handle = await evh(page, () =>
            window.__btns().find((b) => b.label === "Resume") || window.__btns()[0]
        );
        const el = await handle.asElement();
        if (el) await el.evaluate((a) => a.focus());
        await sleep(600);
        const after = await readResumeCircle();

        if (!el || !before || !after) fail("focus test: no button found");
        else {
            const focusDelta = tx(after.t) - tx(before.t);
            if (focusDelta < 50)
                fail(`focus: circle only moved ${focusDelta.toFixed(1)}px on keyboard focus`);
            else notes.push(`focus: circle moved ${focusDelta.toFixed(1)}px`);
        }
        await ev(page, () => document.activeElement?.blur?.());
    }

    /* ---- press / tap: button 0.98, circle 0.96, circle travels ---- */
    {
        /* Wait until the pill is fully rendered AND styled (a dev-server
           reload can land mid-run with Tailwind CSS not yet applied, which
           shrinks the circle below the detection threshold). */
        await page.waitForFunction(
            `(() => {
                const links = [...document.querySelectorAll("a")].filter((a) => {
                    const c = a.querySelector(":scope > span.rounded-full");
                    if (!c) return false;
                    if (c.getBoundingClientRect().width < 20) return false;
                    if (!c.querySelector("svg")) return false;
                    if (!a.textContent.trim()) return false;
                    return true;
                });
                return links.some((a) => a.textContent.trim() === "Explore Projects");
            })()`,
            { timeout: 30000 }
        );
        const explore = await evh(page, () =>
            window.__btns().find((b) => b.label === "Explore Projects")
        );
        const el = await explore.asElement();
        if (!el) {
            fail("tap test: Explore Projects button not found");
        } else {
        await el.hover();
        await sleep(500);
        await page.mouse.down();
        await sleep(500);

        const pressed = await ev(page, () => {
            const a = window
                .__btns()
                .find((b) => b.label === "Explore Projects");
            const c = a.querySelector(":scope > span.rounded-full");
            const scaleOf = (tr) => {
                if (!tr || tr === "none") return 1;
                const m = tr.match(/matrix\(([^)]+)\)/);
                return m ? Number(m[1].split(",")[0]) : 1;
            };
            return {
                buttonScale: scaleOf(getComputedStyle(a).transform),
                circleScale: scaleOf(getComputedStyle(c).transform),
                circleX: (() => {
                    const tr = getComputedStyle(c).transform;
                    if (!tr || tr === "none") return 0;
                    const m = tr.match(/matrix\(([^)]+)\)/);
                    return m ? Number(m[1].split(",")[4]) : 0;
                })(),
            };
        });
        await page.mouse.up();
        await sleep(500);

        const restAfter = await ev(page, () => {
            const a = window
                .__btns()
                .find((b) => b.label === "Explore Projects");
            const c = a.querySelector(":scope > span.rounded-full");
            const tr = getComputedStyle(a).transform;
            if (!tr || tr === "none") return { buttonScale: 1 };
            const m = tr.match(/matrix\(([^)]+)\)/);
            return { buttonScale: m ? Number(m[1].split(",")[0]) : 1 };
        });

        if (Math.abs(pressed.buttonScale - 0.98) > 0.01)
            fail(`tap: button scale ${pressed.buttonScale} (expected 0.98)`);
        if (Math.abs(pressed.circleScale - 0.96) > 0.01)
            fail(`tap: circle scale ${pressed.circleScale} (expected 0.96)`);
        if (pressed.circleX < 50)
            fail(`tap: circle did not travel on press (x=${pressed.circleX.toFixed(1)})`);
        if (Math.abs(restAfter.buttonScale - 1) > 0.01)
            fail(`tap: button did not return to rest (scale ${restAfter.buttonScale})`);
        notes.push(
            `tap: buttonScale=${pressed.buttonScale} circleScale=${pressed.circleScale} circleX=${pressed.circleX.toFixed(1)} released=${restAfter.buttonScale}`
        );
        }
    }

    /* ---- main page: Source gone, one View Project below image,
           contextual Live revealed on desktop image hover ---- */
    {
        const srcAnchors = await page.evaluate(() =>
            [...document.querySelectorAll("a")].filter((a) =>
                a.textContent.includes("Source")
            ).map((a) => a.textContent.trim())
        );
        if (srcAnchors.length)
            fail(`main page still shows Source action: ${JSON.stringify(srcAnchors)}`);

        /* Old text-style "View Project →" link must be gone — every action
           is now a ProjectResumeButton (anchor with a rounded-full circle). */
        const staleTextLinks = await page.evaluate(() =>
            [...document.querySelectorAll("a")]
                .filter(
                    (a) =>
                        !a.querySelector(":scope > span.rounded-full") &&
                        /View Project|Live|Source/.test(a.textContent)
                )
                .map((a) => a.textContent.trim())
        );
        if (staleTextLinks.length)
            fail(`main page still has text-style actions: ${JSON.stringify(staleTextLinks)}`);

        const readCard = () =>
            ev(page, () => {
                const media = [...document.querySelectorAll('[role="img"]')].find(
                    (m) => m.querySelector("a") || m.closest("article")?.querySelector("a")
                );
                if (!media) return null;
                media.setAttribute("data-test-media", "");
                const inside = [...media.querySelectorAll("a")].map((a) => ({
                    label: a.textContent.trim(),
                    target: a.getAttribute("target"),
                    rel: a.getAttribute("rel"),
                    hasRects: a.getClientRects().length > 0,
                    /* anchor → button wrapper → overlay motion.div */
                    wrapperOpacity: Number(
                        getComputedStyle(a.parentElement.parentElement).opacity
                    ),
                    inert: Boolean(a.closest("[inert]")),
                }));
                const article = media.closest("article");
                const row = article
                    ? [...article.querySelectorAll("a")]
                          .filter((a) => !media.contains(a))
                          .map((a) => ({
                              label: a.textContent.trim(),
                              pill: Boolean(
                                  a.querySelector(":scope > span.rounded-full")
                              ),
                              h: Math.round(a.getBoundingClientRect().height),
                              target: a.getAttribute("target"),
                          }))
                    : [];
                media.scrollIntoView({ block: "center" });
                return { inside, row };
            });

        await sleep(600);
        /* park the cursor away from the cards so no media is hovered
           while we read the resting state */
        await page.mouse.move(2, 2);
        await sleep(300);
        const card = await readCard();
        if (!card) fail("project card not found");
        else {
            /* exactly one View Project, below the image, never over it */
            if (card.inside.some((b) => b.label === "View Project"))
                fail("card: View Project still floats over the image");

            const rowPills = card.row.filter((r) => r.pill).map((r) => r.label);
            if (rowPills.filter((l) => l === "View Project").length !== 1)
                fail(
                    `card: expected exactly one View Project below image, got ${JSON.stringify(rowPills)}`
                );
            if (card.row.some((r) => r.label === "Live"))
                fail("card: Live must not be a permanent button below the image");

            /* contextual Live overlay: exists, hidden and inert at rest */
            const live = card.inside.find((b) => b.label === "Live");
            if (!live) fail("card: contextual Live overlay missing over image");
            else {
                if (live.target !== "_blank" || !/noopener/.test(live.rel || ""))
                    fail("card: Live must open in a new tab with rel=noopener");
                if (live.wrapperOpacity > 0.1)
                    fail(`card: Live visible at rest (opacity ${live.wrapperOpacity})`);
                if (!live.inert)
                    fail("card: hidden Live overlay is not inert");
                notes.push(
                    `card rest: row=${JSON.stringify(rowPills)} liveOpacity=${live.wrapperOpacity} liveInert=${live.inert}`
                );
            }

            /* desktop image hover reveals Live */
            await page.hover("[data-test-media]");
            await sleep(700);
            const hoverState = await ev(page, () => {
                const media = document.querySelector("[data-test-media]");
                const a =
                    media &&
                    [...media.querySelectorAll("a")].find(
                        (x) => x.textContent.trim() === "Live"
                    );
                if (!a) return null;
                return {
                    opacity: Number(
                        getComputedStyle(a.parentElement.parentElement).opacity
                    ),
                    inert: Boolean(a.closest("[inert]")),
                };
            });
            if (!hoverState) fail("card: Live overlay missing on image hover");
            else {
                if (hoverState.opacity < 0.9)
                    fail(`card: Live not revealed on hover (opacity ${hoverState.opacity})`);
                if (hoverState.inert) fail("card: Live still inert after hover");
                notes.push(`card hover: liveOpacity=${hoverState.opacity}`);
            }
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
        /* NOTE: never toggle isMobile/hasTouch — Puppeteer reloads the page
           when those change, which races the dev server. */
        await page.setViewport({ width: s.w, height: s.w < 768 ? 844 : 900 });
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
                    const files = fs.readdirSync(dlDir).filter((f) => !f.endsWith(".crdownload"));
                    if (files.length) {
                        const f = path.join(dlDir, files[0]);
                        const size = fs.statSync(f).size;
                        if (size > 1000) {
                            downloadVerified = true;
                            notes.push(`download OK: ${files[0]} (${size} bytes)`);
                        }
                    }
                }
                if (!downloadVerified)
                    fail("mobile menu resume click did not produce a downloaded file");
                else fs.rmSync(dlDir, { recursive: true, force: true });
            }
        }

        await page.keyboard.press("Escape");
        await sleep(1300);
        const closed = await page.evaluate(() => !document.getElementById("mobile-menu"));
        if (!closed) fail(`${s.w}px: mobile menu did not close on Escape`);
    }

    /* ---- mobile card hierarchy: no overlay CTA, one View Project,
           no permanent Live button ---- */
    {
        await page.setViewport({ width: 390, height: 844 });
        await sleep(900);
        const m = await ev(page, () => {
            const cards = [...document.querySelectorAll("article")]
                .map((article) => {
                    const media = article.querySelector('[role="img"]');
                    if (!media) return null;
                    const inside = [...media.querySelectorAll("a")].map((a) => ({
                        label: a.textContent.trim(),
                        visible: a.getClientRects().length > 0,
                    }));
                    const row = [...article.querySelectorAll("a")]
                        .filter((a) => !media.contains(a))
                        .map((a) => ({
                            label: a.textContent.trim(),
                            pill: Boolean(
                                a.querySelector(":scope > span.rounded-full")
                            ),
                            h: Math.round(a.getBoundingClientRect().height),
                        }));
                    return { inside, row };
                })
                .filter(
                    (x) =>
                        x &&
                        (x.inside.length || x.row.some((r) => r.pill))
                );
            return {
                cards,
                overflow:
                    document.documentElement.scrollWidth >
                    window.innerWidth + 1,
            };
        });

        if (m.overflow) fail("home 390px: horizontal overflow");
        if (!m.cards.length) fail("home 390px: no project cards found");
        for (const c of m.cards) {
            const visibleInside = c.inside.filter((i) => i.visible);
            if (visibleInside.length)
                fail(
                    `home 390px: overlay action visible on image: ${JSON.stringify(visibleInside)}`
                );
            const pills = c.row.filter((r) => r.pill).map((r) => r.label);
            if (pills.filter((l) => l === "View Project").length !== 1)
                fail(
                    `home 390px: expected one View Project below image, got ${JSON.stringify(pills)}`
                );
            if (pills.includes("Live"))
                fail("home 390px: Live must not be a permanent card button");
            for (const r of c.row.filter((r) => r.pill)) {
                if (r.h !== 40)
                    fail(
                        `home 390px: card button ${r.label} height ${r.h} (expected 40)`
                    );
            }
        }
        notes.push(
            `mobile card rows: ${JSON.stringify(
                m.cards.map((c) =>
                    c.row.filter((r) => r.pill).map((r) => r.label)
                )
            )}`
        );
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
            () =>
                [...document.querySelectorAll("a")].some(
                    (a) => a.textContent.trim() === "Live"
                ),
            { timeout: 60000 }
        );
        await sleep(1200);

        const desktop = await ev(p2, () => {
            const raw = window.__btns();
            const btns = raw.map(window.__read);
            const find = (t) => btns.find((b) => b.label.includes(t));
            const srcRaw = raw.find((b) => b.textContent.includes("Source"));
            return {
                labels: btns.map((b) => b.label),
                live: Boolean(find("Live")),
                figma: Boolean(find("Figma")),
                selfLink: Boolean(find("View Project")),
                sourceVisible: srcRaw
                    ? getComputedStyle(srcRaw.parentElement).display !== "none"
                    : false,
                sourceTarget: srcRaw && srcRaw.getAttribute("target"),
                heights: btns.map((b) => b.h),
            };
        });
        notes.push(`detail desktop: ${desktop.labels.join(" | ")} heights ${desktop.heights.join(",")}`);
        if (!desktop.live) fail("detail desktop: Live action missing");
        if (desktop.selfLink) fail("detail: must not render a View Project self-link");
        if (!desktop.sourceVisible) fail("detail desktop: Source not visible");
        if (desktop.sourceTarget !== "_blank") fail("detail: Source must open in new tab");
        if (desktop.figma) fail("detail: Figma rendered even though links.figma is null");
        if (desktop.heights.some((h) => h !== 48))
            fail(`detail desktop: button heights ${desktop.heights.join(",")} (expected 48)`);

        await p2.setViewport({ width: 390, height: 844 });
        /* A dev-server reload can race the viewport switch — wait until the
           hero actions are actually in the DOM before asserting. */
        const heroReady = await p2
            .waitForFunction(
                () =>
                    [...document.querySelectorAll("a")].some(
                        (a) => a.textContent.trim() === "Live"
                    ),
                { timeout: 30000 }
            )
            .then(() => true)
            .catch(() => false);
        if (!heroReady) fail("detail mobile: Live action never appeared after resize");
        await sleep(800);
        const mobile = await ev(p2, () => {
            const raw = window.__btns();
            const btns = raw.map(window.__read);
            /* Source is wrapper-hidden (display:none) on mobile, so it has no
               box — search raw anchors instead of the sized-button filter. */
            const srcAll = [...document.querySelectorAll("a")].filter((a) =>
                a.textContent.includes("Source")
            );
            return {
                labels: btns.map((b) => b.label),
                /* Hidden via an ancestor `hidden lg:block` wrapper — a
                   display:none ancestor leaves the anchor with no client
                   rects, which is the reliable visibility signal. */
                sourceHidden: srcAll.length
                    ? srcAll.every((a) => a.getClientRects().length === 0)
                    : true,
                overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
                clipped: btns.some((b) => b.clipped),
                heights: btns.map((b) => b.h),
                circles: btns.map((b) => b.circle),
            };
        });
        notes.push(
            `detail mobile: ${mobile.labels.join(" | ")} heights ${mobile.heights.join(",")} sourceHidden=${mobile.sourceHidden}`
        );
        if (!mobile.labels.some((l) => l.includes("Live")))
            fail("detail mobile: Live action missing");
        if (!mobile.sourceHidden)
            fail("detail mobile: Source must stay hidden below lg");
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
