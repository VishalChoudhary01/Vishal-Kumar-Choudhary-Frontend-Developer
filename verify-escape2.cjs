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
    page.on("console", (m) => {
        if (m.type() === "error") console.log("  [console.error]", m.text().slice(0, 200));
    });
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(3000);

    /* instrument: did a keydown reach the window, and did React see it? */
    await page.evaluate(() => {
        window.__escSeen = 0;
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape") window.__escSeen += 1;
        });
    });

    for (let i = 1; i <= 4; i++) {
        await page.evaluate(() => {
            const b = document.querySelector('button[aria-label="Open menu"]');
            if (b) b.click();
        });
        await page.waitForFunction(() => document.getElementById("mobile-menu"), { timeout: 10000 });
        await sleep(900);

        const focus = await page.evaluate(() => ({
            active: document.activeElement.tagName,
            label: document.activeElement.getAttribute?.("aria-label"),
        }));

        await page.keyboard.press("Escape");
        await sleep(1200);
        const open = await page.evaluate(() => Boolean(document.getElementById("mobile-menu")));
        const escSeen = await page.evaluate(() => window.__escSeen);
        console.log(`run ${i}: focus=${focus.active}/${focus.label} escSeen=${escSeen} menuOpenAfter=${open}`);
        if (open) {
            /* close via X so next iteration starts clean */
            await page.evaluate(() => document.querySelector('#mobile-menu button[aria-label="Close menu"]')?.click());
            await sleep(800);
        }
    }

    await browser.close();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
