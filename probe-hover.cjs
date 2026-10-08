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
    await page.waitForFunction(
        `(() => {
            const links = [...document.querySelectorAll("a")].filter((a) => {
                const c = a.querySelector(":scope > span.rounded-full");
                return c && c.getBoundingClientRect().width >= 20;
            });
            return links.some((a) => a.textContent.trim() === "Explore Projects");
        })()`,
        { timeout: 60000 }
    );
    await sleep(1500);

    /* instrument */
    await page.evaluate(() => {
        window.__events = [];
        ["mouseover", "mouseenter", "mousemove"].forEach((t) =>
            document.addEventListener(
                t,
                (e) => {
                    const t2 = e.target;
                    window.__events.push(
                        t + "@" + (t2.tagName || "") + "." + String(t2.className || "").slice(0, 40)
                    );
                },
                true
            )
        );
        const media = [...document.querySelectorAll('[role="img"]')].find((m) =>
            m.querySelector("a")
        );
        media.setAttribute("data-test-media", "");
        media.scrollIntoView({ block: "center" });
    });
    await sleep(600);
    await page.mouse.move(2, 2);
    await sleep(300);

    const readState = () =>
        page.evaluate(() => {
            const media = document.querySelector("[data-test-media]");
            const rect = media.getBoundingClientRect();
            const cx = Math.round(rect.left + rect.width / 2);
            const cy = Math.round(rect.top + rect.height / 2);
            const at = document.elementFromPoint(cx, cy);
            const live = [...media.querySelectorAll("a")].find(
                (a) => a.textContent.trim() === "Live"
            );
            return {
                cx,
                cy,
                at: at
                    ? at.tagName + "." + String(at.className).slice(0, 60)
                    : "none",
                liveOpacity: live
                    ? getComputedStyle(live.parentElement.parentElement).opacity
                    : "missing",
                liveInert: live ? Boolean(live.closest("[inert]")) : null,
                rect: {
                    x: Math.round(rect.left),
                    y: Math.round(rect.top),
                    w: Math.round(rect.width),
                    h: Math.round(rect.height),
                },
            };
        });

    console.log("before hover:", JSON.stringify(await readState(), null, 1));

    /* real puppeteer hover */
    const hoverErr = await page
        .hover("[data-test-media]")
        .then(() => "ok")
        .catch((e) => "ERR " + e.message);
    console.log("page.hover:", hoverErr);
    await sleep(800);
    console.log("after hover:", JSON.stringify(await readState(), null, 1));

    /* explicit mouse.move to computed center */
    const s = await readState();
    await page.mouse.move(s.cx, s.cy, { steps: 5 });
    await sleep(800);
    console.log("after mouse.move:", JSON.stringify(await readState(), null, 1));

    /* synthetic mouseover with relatedTarget outside */
    await page.evaluate(() => {
        const media = document.querySelector("[data-test-media]");
        const img = media.querySelector("img") || media;
        img.dispatchEvent(
            new MouseEvent("mouseover", {
                bubbles: true,
                relatedTarget: document.body,
            })
        );
    });
    await sleep(600);
    console.log("after synthetic over:", JSON.stringify(await readState(), null, 1));

    const events = await page.evaluate(() => window.__events.slice(0, 20));
    console.log("captured events:", JSON.stringify(events, null, 1));

    await browser.close();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
