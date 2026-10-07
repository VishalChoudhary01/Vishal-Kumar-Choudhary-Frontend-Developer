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
        () => [...document.querySelectorAll("a")].some((a) => a.textContent.includes("Explore Projects")),
        { timeout: 60000 }
    );
    await sleep(2000);

    const state = async () =>
        page.evaluate(() => {
            const a = [...document.querySelectorAll("a")].find((x) =>
                x.textContent.includes("Explore Projects")
            );
            const kids = [...a.children].map((k) => ({
                tag: k.tagName,
                cls: (k.getAttribute("class") || "").slice(0, 60),
                transform: getComputedStyle(k).transform,
            }));
            return {
                reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
                linkTag: a.tagName,
                href: a.getAttribute("href"),
                linkClass: (a.getAttribute("class") || "").slice(0, 120),
                parentClass: (a.parentElement.getAttribute("class") || "").slice(0, 120),
                hasCircle: !!a.querySelector(":scope > span.rounded-full"),
                html: a.outerHTML.slice(0, 700),
                linkTransform: getComputedStyle(a).transform,
                kids,
            };
        });

    console.log("BEFORE:", JSON.stringify(await state(), null, 1));

    const box = await page.evaluate(() => {
        const a = [...document.querySelectorAll("a")].find((x) =>
            x.textContent.includes("Explore Projects")
        );
        const r = a.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });

    await page.mouse.move(box.x, box.y, { steps: 8 });
    await sleep(800);
    console.log("AFTER HOVER:", JSON.stringify(await state(), null, 1));

    await page.evaluate(() => {
        const a = [...document.querySelectorAll("a")].find((x) =>
            x.textContent.includes("Explore Projects")
        );
        a.focus();
    });
    await sleep(800);
    console.log("AFTER FOCUS:", JSON.stringify(await state(), null, 1));

    await browser.close();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
