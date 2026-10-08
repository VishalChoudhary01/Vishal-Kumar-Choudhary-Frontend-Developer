const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");
const os = require("os");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
    const browser = await puppeteer.launch({
        executablePath: CHROME,
        headless: true,
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(2500);

    const openMenu = async () => {
        await page.evaluate(() => {
            const b = document.querySelector('button[aria-label="Open menu"]');
            if (b) b.click();
        });
        await page.waitForFunction(() => document.getElementById("mobile-menu"), { timeout: 10000 });
        await sleep(900);
    };
    const menuOpen = () => page.evaluate(() => Boolean(document.getElementById("mobile-menu")));
    const focusInfo = () =>
        page.evaluate(() => ({
            active: document.activeElement
                ? document.activeElement.tagName + "/" + (document.activeElement.getAttribute("aria-label") || document.activeElement.textContent?.slice(0, 30))
                : "none",
            inPanel: Boolean(document.activeElement && document.activeElement.closest("#mobile-menu")),
        }));

    /* Case A: plain Escape */
    await openMenu();
    console.log("A focus before escape:", await focusInfo());
    await page.keyboard.press("Escape");
    await sleep(1000);
    console.log("A menu open after Escape:", await menuOpen());

    /* Case B: Escape after clicking the download anchor (with CDP download allowed) */
    await openMenu();
    const dlDir = fs.mkdtempSync(path.join(os.tmpdir(), "resume-dl2-"));
    const cdp = await page.target().createCDPSession();
    await cdp.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: dlDir, eventsEnabled: true });
    await page.evaluate(() => document.querySelector("#mobile-menu a[download]").click());
    await sleep(2500);
    console.log("B downloaded files:", fs.readdirSync(dlDir));
    console.log("B focus after download:", await focusInfo());
    await page.keyboard.press("Escape");
    await sleep(1000);
    console.log("B menu open after Escape:", await menuOpen());

    /* Case C: Escape dispatched from inside the panel (real keydown path) */
    if (await menuOpen()) {
        await page.evaluate(() => {
            const panel = document.getElementById("mobile-menu");
            panel.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        });
        await sleep(1000);
        console.log("C menu open after synthetic panel Escape:", await menuOpen());
    }

    /* Case D: close button click */
    if (await menuOpen()) {
        await page.evaluate(() => document.querySelector('#mobile-menu button[aria-label="Close menu"]')?.click());
        await sleep(1000);
        console.log("D menu open after X click:", await menuOpen());
    }

    await browser.close();
    fs.rmSync(dlDir, { recursive: true, force: true });
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
