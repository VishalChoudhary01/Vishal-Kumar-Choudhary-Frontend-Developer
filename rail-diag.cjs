const puppeteer = require("puppeteer-core");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URL = process.env.RAIL_URL || "http://localhost:3000/projects/class-fuse";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run(label, viewport) {
    const browser = await puppeteer.launch({
        executablePath: CHROME,
        headless: true,
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
    page.on("console", (m) => {
        if (m.type() === "error") errors.push("console: " + m.text());
    });

    await page.setViewport(viewport);
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("#project-snapshot .w-max", { timeout: 60000 });
    await sleep(1500);

    const base = await page.evaluate(() => {
        const section = document.querySelector("#project-snapshot");
        const track = document.querySelector("#project-snapshot .w-max");
        const viewport = track.parentElement;
        const rect = section.getBoundingClientRect();
        const items = [...track.children];
        const last = items[items.length - 1];
        return {
            reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
            innerHeight: window.innerHeight,
            innerWidth: window.innerWidth,
            sectionAbsTop: Math.round(rect.top + window.scrollY),
            sectionHeight: Math.round(rect.height),
            trackWidth: track.scrollWidth,
            viewportWidth: Math.round(viewport.getBoundingClientRect().width),
            viewportLeft: Math.round(viewport.getBoundingClientRect().left),
            itemCount: items.length,
            lastItemWidth: Math.round(last.getBoundingClientRect().width),
            maxScroll: document.documentElement.scrollHeight - window.innerHeight,
        };
    });

    const travel = Math.max(0, base.trackWidth - base.viewportWidth);
    const start = base.sectionAbsTop - base.innerHeight * 0.75;
    const naturalEnd = base.sectionAbsTop + base.sectionHeight - base.innerHeight * 0.15;
    const minimumRange = Math.max(base.innerHeight * 1.25, 650);
    const end = Math.max(naturalEnd, start + minimumRange);

    console.log(`\n===== ${label} =====`);
    console.log(
        JSON.stringify(
            {
                ...base,
                travel,
                expectedStart: Math.round(start),
                expectedEnd: Math.round(end),
                canReachEnd: base.maxScroll >= end,
            },
            null,
            2
        )
    );

    const steps = [
        start,
        start + (end - start) * 0.5,
        end,
    ].map((v) => Math.round(Math.max(0, Math.min(base.maxScroll, v))));

    let ok = travel > 0;

    for (const y of steps) {
        await page.evaluate((target) => {
            if (window.lenis && typeof window.lenis.scrollTo === "function") {
                window.lenis.scrollTo(target, { immediate: true, force: true });
            } else {
                window.scrollTo(0, target);
            }
        }, y);
        await sleep(900);

        const sample = await page.evaluate(() => {
            const track = document.querySelector("#project-snapshot .w-max");
            const viewport = track.parentElement;
            const items = [...track.children];
            const first = items[0].getBoundingClientRect();
            const last = items[items.length - 1].getBoundingClientRect();
            const vp = viewport.getBoundingClientRect();
            return {
                scrollY: Math.round(window.scrollY),
                transform: track.style.transform || getComputedStyle(track).transform,
                viewportLeft: Math.round(vp.left),
                viewportRight: Math.round(vp.right),
                firstRight: Math.round(first.right),
                lastLeft: Math.round(last.left),
                lastRight: Math.round(last.right),
            };
        });

        const progress = Math.max(
            0,
            Math.min(1, (sample.scrollY - start) / (end - start))
        );
        const expectedX = -travel * progress;

        const visibleAtEnd =
            sample.lastRight > sample.viewportLeft &&
            sample.firstRight > sample.viewportLeft;

        console.log(
            `scroll=${sample.scrollY} progress=${progress.toFixed(3)} expectedX=${expectedX.toFixed(
                1
            )} actual="${sample.transform}" | vp=[${sample.viewportLeft},${sample.viewportRight}] first.right=${sample.firstRight} last=[${sample.lastLeft},${sample.lastRight}] itemsVisible=${visibleAtEnd}`
        );

        const actualX = parseFloat((sample.transform.match(/-?[\d.]+/) || ["0"])[0]);
        if (Math.abs(actualX - expectedX) > 60) {
            ok = false;
        }
    }

    console.log(ok ? "RESULT: PASS (travel > 0, follows expected x)" : "RESULT: CHECK");

    if (errors.length) {
        console.log("PAGE ERRORS:");
        errors.slice(0, 10).forEach((e) => console.log("  " + e));
    }

    await browser.close();
}

(async () => {
    await run("MOBILE 390x844", {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
    });
    await run("TABLET 820x1180", {
        width: 820,
        height: 1180,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
    });
    await run("DESKTOP 1440x900", { width: 1440, height: 900, deviceScaleFactor: 1 });
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
