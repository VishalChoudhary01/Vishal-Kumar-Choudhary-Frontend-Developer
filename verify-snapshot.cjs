const puppeteer = require("puppeteer-core");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000/projects/class-fuse";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DESKTOP_WIDTHS = process.env.ONLY === "mobile" ? [] : [768, 820, 1024, 1280, 1440, 1920];
const MOBILE_WIDTHS = process.env.ONLY === "desktop" ? [] : [320, 375, 390, 430, 640, 767];

async function open(browser, width, height) {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewport({
        width,
        height,
        deviceScaleFactor: width < 768 ? 2 : 1,
        isMobile: width < 768,
        hasTouch: width < 768,
    });
    await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
    return { page, errors };
}

const scrollTo = (page, y) =>
    page.evaluate((target) => {
        if (window.lenis) {
            window.lenis.resize();
            window.lenis.scrollTo(target, { immediate: true, force: true });
        } else window.scrollTo(0, target);
        return Math.round(window.scrollY);
    }, y);

/* ------------------------------------------------------------------ */
/* DESKTOP: horizontal optical rail                                    */
/* ------------------------------------------------------------------ */
async function desktopCheck(browser, width) {
    const height = 900;
    const { page, errors } = await open(browser, width, height);
    const failures = [];

    await page.waitForSelector("#project-snapshot .w-max", { timeout: 60000 });
    await sleep(1200);

    const readLayout = () =>
        page.evaluate(() => {
            const track = document.querySelector("#project-snapshot .w-max");
            const vp = track.parentElement;
            const r = vp.getBoundingClientRect();
            const top = r.top + window.scrollY;
            const bottom = r.bottom + window.scrollY;
            const start = top - window.innerHeight * 0.8;
            const naturalEnd = bottom - window.innerHeight * 0.2;
            const minRange = Math.max(window.innerHeight * 0.75, 500);
            return {
                top,
                bottom,
                railHeight: Math.round(r.height),
                start,
                end: Math.max(naturalEnd, start + minRange),
                travel: Math.max(0, track.scrollWidth - r.width),
                overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
                maxScroll: document.documentElement.scrollHeight - window.innerHeight,
            };
        });

    const readState = () =>
        page.evaluate(() => {
            const track = document.querySelector("#project-snapshot .w-max");
            const vp = track.parentElement;
            const vpRect = vp.getBoundingClientRect();
            const axis = vpRect.left + vpRect.width / 2;
            const m = track.style.transform || getComputedStyle(track).transform;
            let x = 0;
            if (m && m !== "none") {
                if (m.startsWith("matrix")) x = new DOMMatrixReadOnly(m).m41;
                else {
                    const match = m.match(/translateX\((-?[\d.]+)px\)/);
                    if (match) x = Number(match[1]);
                }
            }
            const items = [...track.children].map((el, index) => {
                const rect = el.getBoundingClientRect();
                const cs = getComputedStyle(el);
                const mat = new DOMMatrixReadOnly(cs.transform);
                return {
                    index,
                    center: rect.left + rect.width / 2,
                    delta: rect.left + rect.width / 2 - axis,
                    offset: Math.abs(rect.left + rect.width / 2 - axis),
                    scale: Number(mat.a.toFixed(3)),
                    opacity: Number(parseFloat(cs.opacity).toFixed(3)),
                    height: el.offsetHeight,
                };
            });
            const byScale = [...items].sort((a, b) => b.scale - a.scale);
            const byAxis = [...items].sort((a, b) => a.offset - b.offset);
            return {
                scrollY: Math.round(window.scrollY),
                x,
                railTop: Math.round(vpRect.top),
                railBottom: Math.round(vpRect.bottom),
                first: items[0],
                last: items[items.length - 1],
                maxScale: Math.max(...items.map((i) => i.scale)),
                minScale: Math.min(...items.map((i) => i.scale)),
                minOpacity: Math.min(...items.map((i) => i.opacity)),
                focalIndex: byScale[0].index,
                nearestIndex: byAxis[0].index,
                nearestOffset: Math.round(byAxis[0].offset),
                heights: [...new Set(items.map((i) => i.height))],
            };
        });

    /* --- 1. Screenshot-like state: heading visible, rail below fold --- */
    const layout0 = await readLayout();
    const screenshotScroll = Math.round(
        Math.max(0, Math.min(layout0.maxScroll, layout0.top - height - 40))
    );
    await scrollTo(page, screenshotScroll);
    await sleep(900);

    const state0 = await readState();
    const headingVisible = await page.evaluate(() => {
        const el = document.querySelector("#project-snapshot-title");
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight;
    });

    if (!headingVisible) failures.push("snapshot heading not visible in the reference state");
    if (state0.railTop < height)
        failures.push(`rail should be below the fold in reference state (railTop=${state0.railTop})`);
    if (Math.abs(state0.x) > 1)
        failures.push(`rail already moved in reference state (x=${state0.x})`);

    /* --- 2. Travel / focal behaviour across the range --- */
    const layout = await readLayout();
    if (layout.travel <= 0) failures.push("travel is 0");
    if (layout.overflow) failures.push("horizontal page overflow");

    let firstCrossed = false;
    let lastCrossed = false;
    let prevFirstDelta = null;
    let prevLastDelta = null;
    let firstClosest = Infinity;
    let lastClosest = Infinity;
    let sawDistinctFocal = false;
    const heightsSeen = new Set();

    for (let i = 1; i <= 10; i++) {
        const p = i / 10;
        const target = Math.round(
            Math.max(0, Math.min(layout.maxScroll, layout.start + (layout.end - layout.start) * p))
        );
        const actual = await scrollTo(page, target);
        if (Math.abs(actual - target) > 8)
            failures.push(`scroll control: wanted ${target} got ${actual}`);
        await sleep(850);

        const s = await readState();
        const liveSpan = layout.end - layout.start;
        const liveProgress = Math.max(0, Math.min(1, (s.scrollY - layout.start) / liveSpan));
        const expectedX = -layout.travel * liveProgress;
        const railVisible = s.railBottom > -40 && s.railTop < height;

        heightsSeen.add(s.heights.join(","));

        if (Math.abs(s.x - expectedX) > 60)
            failures.push(`p=${p} x=${s.x.toFixed(0)} expected ~${expectedX.toFixed(0)}`);
        if (s.maxScale - s.minScale > 0.005 && s.focalIndex !== s.nearestIndex)
            failures.push(`p=${p} focal item is not the item nearest the axis`);
        if (s.maxScale > 1.07) failures.push(`p=${p} maxScale ${s.maxScale} > 1.07`);
        if (s.minScale < 0.93) failures.push(`p=${p} minScale ${s.minScale} < 0.93`);
        if (s.minOpacity < 0.55) failures.push(`p=${p} minOpacity ${s.minOpacity} < 0.55`);
        if (railVisible) {
            if (s.first.offset < firstClosest) firstClosest = s.first.offset;
            if (s.last.offset < lastClosest) lastClosest = s.last.offset;
            /* a technology is on the axis when its signed offset flips */
            if (prevFirstDelta !== null && (prevFirstDelta > 0) !== (s.first.delta > 0))
                firstCrossed = true;
            if (prevLastDelta !== null && (prevLastDelta > 0) !== (s.last.delta > 0))
                lastCrossed = true;
            prevFirstDelta = s.first.delta;
            prevLastDelta = s.last.delta;
        }
        if (s.maxScale - s.minScale > 0.005) sawDistinctFocal = true;
    }

    if (!firstCrossed && firstClosest > 60)
        failures.push(`first technology never reaches the focal area (closest ${Math.round(firstClosest)}px)`);
    if (!lastCrossed && lastClosest > 60)
        failures.push(`last technology never reaches the focal area (closest ${Math.round(lastClosest)}px)`);
    if (!sawDistinctFocal) failures.push("no distinct focal item ever appeared");
    if (heightsSeen.size > 1) failures.push(`inconsistent item heights ${[...heightsSeen]}`);

    await page.close();
    return { failures, errors, layout, firstClosest, lastClosest, firstCrossed, lastCrossed };
}

/* ------------------------------------------------------------------ */
/* MOBILE: vertical kinetic list                                       */
/* ------------------------------------------------------------------ */
async function mobileCheck(browser, width) {
    const height = width < 768 ? 844 : 900;
    const { page, errors } = await open(browser, width, height);
    const failures = [];

    await page.waitForSelector("#project-snapshot ul", { timeout: 60000 });
    await sleep(1000);

    const base = await page.evaluate(() => {
        const section = document.querySelector("#project-snapshot");
        const list = section.querySelector("ul");
        const items = [...list.children];
        const rect = section.getBoundingClientRect();
        return {
            horizontalRail: !!section.querySelector(".w-max"),
            itemCount: items.length,
            listWidth: Math.round(list.getBoundingClientRect().width),
            sectionTop: rect.top + window.scrollY,
            sectionHeight: Math.round(rect.height),
            overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
            itemHeights: [...new Set(items.map((i) => i.offsetHeight))],
            itemWidths: items.map((i) => Math.round(i.getBoundingClientRect().width)),
            maxScroll: document.documentElement.scrollHeight - window.innerHeight,
        };
    });

    if (base.horizontalRail) failures.push("horizontal rail still rendered on mobile");
    if (base.itemCount === 0) failures.push("no technologies rendered");
    if (base.overflow) failures.push("horizontal page overflow");
    if (base.itemHeights.length > 1) failures.push(`inconsistent item heights ${base.itemHeights}`);
    if (base.itemWidths.some((w) => w > base.listWidth + 1))
        failures.push(`item wider than list (${base.itemWidths.join(",")} vs ${base.listWidth})`);

    const readFocus = () =>
        page.evaluate(() => {
            const list = document.querySelector("#project-snapshot ul");
            const items = [...list.children];
            const center = window.innerHeight * 0.5;
            const data = items.map((el, index) => {
                const rect = el.getBoundingClientRect();
                const cs = getComputedStyle(el);
                const mat = new DOMMatrixReadOnly(cs.transform);
                return {
                    index,
                    distance: Math.abs(rect.top + rect.height / 2 - center),
                    scale: Number(mat.a.toFixed(3)),
                    opacity: Number(parseFloat(cs.opacity).toFixed(3)),
                    visible: rect.bottom > 0 && rect.top < window.innerHeight,
                };
            });
            const byScale = [...data].sort((a, b) => b.scale - a.scale);
            const byDist = [...data].sort((a, b) => a.distance - b.distance);
            let monotonicScale = true;
            let monotonicOpacity = true;
            for (let i = 1; i < byDist.length; i++) {
                if (byDist[i].scale > byDist[i - 1].scale + 0.001) monotonicScale = false;
                if (byDist[i].opacity > byDist[i - 1].opacity + 0.001) monotonicOpacity = false;
            }
            return {
                scrollY: Math.round(window.scrollY),
                focalIndex: byScale[0].index,
                nearestIndex: byDist[0].index,
                nearestDistance: Math.round(byDist[0].distance),
                farthestDistance: Math.round(byDist[byDist.length - 1].distance),
                focalScale: byScale[0].scale,
                focalOpacity: byScale[0].opacity,
                maxScaleUsed: byScale[0].scale,
                monotonicScale,
                monotonicOpacity,
                minScale: Math.min(...data.map((d) => d.scale)),
                minOpacity: Math.min(...data.map((d) => d.opacity)),
                maxOpacity: Math.max(...data.map((d) => d.opacity)),
                visible: data.filter((d) => d.visible).length,
            };
        });

    const passStart = Math.max(0, base.sectionTop - height + 80);
    const passEnd = Math.min(
        base.maxScroll,
        base.sectionTop + base.sectionHeight + 80
    );
    const STEPS = 16;
    const focalSeen = new Set();
    let closestToCenter = Infinity;
    let focalState = null;
    let sawDistinctFocal = false;

    for (let i = 0; i <= STEPS; i++) {
        const target = Math.round(
            passStart + ((passEnd - passStart) * i) / STEPS
        );
        await scrollTo(page, target);
        await sleep(750);

        const s = await readFocus();
        if (s.visible === 0) continue;

        const hasFocal = s.maxScaleUsed - s.minScale > 0.005;
        if (hasFocal) sawDistinctFocal = true;

        if (hasFocal && s.nearestIndex !== s.focalIndex)
            failures.push(`focal item is not the one nearest the screen center`);

        if (s.nearestDistance < 45) {
            if (s.focalScale < 1.05 || s.focalScale > 1.1)
                failures.push(`focal scale ${s.focalScale} outside 1.05-1.10`);
            if (s.focalOpacity < 0.95)
                failures.push(`focal opacity ${s.focalOpacity} < 0.95`);
            if (s.nearestDistance < closestToCenter) {
                closestToCenter = s.nearestDistance;
                focalState = s;
            }
        }

        if (s.minScale < 0.93) failures.push(`minScale ${s.minScale} < 0.93`);
        if (!s.monotonicScale)
            failures.push("scale does not decrease with distance from the focus");
        if (!s.monotonicOpacity)
            failures.push("opacity does not decrease with distance from the focus");
        if (s.nearestDistance < 60 && s.maxOpacity - s.minOpacity < 0.15)
            failures.push(`no optical hierarchy at focus (opacity spread ${s.maxOpacity - s.minOpacity})`);
        if (s.farthestDistance >= 300) {
            /* the far band is only asserted when an item is actually that far */
            if (s.minScale > 0.97)
                failures.push(`far items never fade in scale (min ${s.minScale})`);
            if (s.minOpacity > 0.65 || s.minOpacity < 0.4)
                failures.push(`far opacity ${s.minOpacity} outside 0.4-0.65`);
        }

        focalSeen.add(s.focalIndex);
    }

    if (focalSeen.size < 2)
        failures.push(`focus never moved through the list (focal indices: ${[...focalSeen]})`);
    if (!focalState) failures.push("no item ever reached the focal zone");
    if (!sawDistinctFocal) failures.push("no distinct focal item ever appeared");

    await page.close();
    return { failures, errors, base, focalSeen: [...focalSeen], focalState, closestToCenter };
}

/* ------------------------------------------------------------------ */
/* REDUCED MOTION                                                      */
/* ------------------------------------------------------------------ */
async function reducedMotionCheck(browser) {
    const { page, errors } = await open(browser, 390, 844);
    await page.emulateMediaFeatures([
        { name: "prefers-reduced-motion", value: "reduce" },
    ]);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector("#project-snapshot ul", { timeout: 60000 });
    await sleep(1000);

    await scrollTo(page, await page.evaluate(() => window.scrollY + 600));
    await sleep(800);

    const state = await page.evaluate(() => {
        const items = [...document.querySelector("#project-snapshot ul").children];
        return items.map((el) => {
            const cs = getComputedStyle(el);
            return {
                opacity: parseFloat(cs.opacity),
                transform: cs.transform,
            };
        });
    });
    await page.close();

    const failures = [];
    state.forEach((s, i) => {
        if (s.opacity !== 1) failures.push(`item ${i} opacity ${s.opacity} under reduced motion`);
        if (s.transform !== "none" && s.transform !== "matrix(1, 0, 0, 1, 0, 0)")
            failures.push(`item ${i} transformed under reduced motion: ${s.transform}`);
    });
    if (errors.length) failures.push("page errors: " + errors.join(" | "));
    return { failures, count: state.length };
}

(async () => {
    const browser = await puppeteer.launch({
        executablePath: CHROME,
        headless: true,
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });

    let failed = 0;
    const report = (label, r) => {
        const ok = r.failures.length === 0 && (r.errors || []).length === 0;
        if (!ok) failed++;
        console.log(`\n[${ok ? "PASS" : "FAIL"}] ${label}`);
        if (r.detail) console.log("  " + r.detail);
        r.failures.forEach((f) => console.log("  ✗ " + f));
        (r.errors || []).slice(0, 3).forEach((e) => console.log("  ! " + e));
    };

    for (const width of DESKTOP_WIDTHS) {
        const r = await desktopCheck(browser, width);
        report(`desktop ${width}px`, {
            ...r,
            detail: `travel=${r.layout.travel} firstCrossesAxis=${r.firstCrossed} lastCrossesAxis=${r.lastCrossed} closestFirst=${Math.round(r.firstClosest)}px closestLast=${Math.round(r.lastClosest)}px`,
        });
    }

    for (const width of MOBILE_WIDTHS) {
        const r = await mobileCheck(browser, width);
        report(`mobile ${width}px`, {
            ...r,
            detail: `items=${r.base.itemCount} listW=${r.base.listWidth} overflow=${r.base.overflow} focusPath=${r.focalSeen} closest=${r.closestToCenter}px scale=${r.focalState && r.focalState.focalScale} opacity=${r.focalState && r.focalState.focalOpacity}`,
        });
    }

    const rm = await reducedMotionCheck(browser);
    report("reduced motion (390px)", { ...rm, detail: `items=${rm.count}` });

    await browser.close();
    console.log(failed === 0 ? "\nALL CHECKS PASS" : `\n${failed} CHECK GROUP(S) FAILED`);
    process.exit(failed === 0 ? 0 : 1);
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
