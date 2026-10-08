const puppeteer = require("puppeteer-core");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
    const browser = await puppeteer.launch({
        executablePath: CHROME,
        headless: true,
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 60000 });

    /* wait until the media center is NOT covered by the z-9999 loader */
    const t0 = Date.now();
    const clear = await page
        .waitForFunction(
            `(() => {
                const media = [...document.querySelectorAll('[role="img"]')].find((m) => m.querySelector("a"));
                if (!media) return false;
                media.scrollIntoView({ block: "center" });
                const r = media.getBoundingClientRect();
                const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
                return Boolean(at) && !at.closest('[class*="z-[9999]"]');
            })()`,
            { timeout: 30000, polling: 300 }
        )
        .then(() => true)
        .catch(() => false);
    console.log("loader clear:", clear, "after", Date.now() - t0, "ms");

    await sleep(500);
    await page.mouse.move(2, 2);
    await sleep(200);

    await page.hover("[data-test-media]");
    await sleep(800);

    const state = await page.evaluate(() => {
        const media = document.querySelector(
            "[data-test-media]"
        ) || [...document.querySelectorAll('[role="img"]')].find((m) => m.querySelector("a"));
        media.setAttribute("data-test-media", "");
        const live = [...media.querySelectorAll("a")].find(
            (a) => a.textContent.trim() === "Live"
        );
        const r = media.getBoundingClientRect();
        const at = document.elementFromPoint(
            r.left + r.width / 2,
            r.top + r.height / 2
        );
        return {
            at: at ? at.tagName + " " + String(at.className).slice(0, 50) : "none",
            opacity: live
                ? getComputedStyle(live.parentElement.parentElement).opacity
                : "missing",
            inert: live ? Boolean(live.closest("[inert]")) : null,
        };
    });
    console.log("after hover (loader clear):", JSON.stringify(state, null, 1));

    /* also check tap state on Explore with loader gone */
    await page.mouse.move(2, 2);
    await sleep(300);
    const exploreSel = await page.evaluate(() => {
        const a = [...document.querySelectorAll("a")].find(
            (x) => x.textContent.trim() === "Explore Projects"
        );
        if (!a) return null;
        a.scrollIntoView({ block: "center" });
        const r = a.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    });
    if (exploreSel) {
        await page.mouse.move(exploreSel.x, exploreSel.y, { steps: 4 });
        await sleep(500);
        await page.mouse.down();
        await sleep(500);
        const pressed = await page.evaluate(() => {
            const a = [...document.querySelectorAll("a")].find(
                (x) => x.textContent.trim() === "Explore Projects"
            );
            const scaleOf = (tr) => {
                if (!tr || tr === "none") return 1;
                const m = tr.match(/matrix\(([^)]+)\)/);
                return m ? Number(m[1].split(",")[0]) : 1;
            };
            return { buttonScale: scaleOf(getComputedStyle(a).transform) };
        });
        await page.mouse.up();
        console.log("tap while loader clear:", JSON.stringify(pressed));
    } else {
        console.log("explore not found");
    }

    await browser.close();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
