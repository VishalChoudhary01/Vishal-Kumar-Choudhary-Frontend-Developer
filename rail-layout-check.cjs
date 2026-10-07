const puppeteer = require("puppeteer-core");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URL = process.env.RAIL_URL || "http://localhost:3000/projects/class-fuse";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FIX_CSS = `
#project-snapshot .grid > div:last-child { min-width: 0; }
`;

async function run(label, viewport, css) {
    const browser = await puppeteer.launch({
        executablePath: CHROME,
        headless: true,
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    await page.setViewport(viewport);
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("#project-snapshot .w-max", { timeout: 60000 });
    if (css) await page.addStyleTag({ content: css });
    await sleep(800);

    const info = await page.evaluate(() => {
        const section = document.querySelector("#project-snapshot");
        const grid = section.querySelector(".grid");
        const item = grid.lastElementChild;
        const track = document.querySelector("#project-snapshot .w-max");
        const viewport = track.parentElement;
        const cs = getComputedStyle(item);
        const gridCs = getComputedStyle(grid);
        return {
            innerWidth: window.innerWidth,
            docScrollWidth: document.documentElement.scrollWidth,
            gridWidth: Math.round(grid.getBoundingClientRect().width),
            gridTemplateColumns: gridCs.gridTemplateColumns,
            itemWidth: Math.round(item.getBoundingClientRect().width),
            itemMinWidth: cs.minWidth,
            viewportWidth: Math.round(viewport.getBoundingClientRect().width),
            trackWidth: track.scrollWidth,
            travel: Math.max(0, track.scrollWidth - viewport.getBoundingClientRect().width),
        };
    });
    console.log(`\n== ${label} ==\n${JSON.stringify(info, null, 2)}`);
    await browser.close();
}

(async () => {
    await run("MOBILE before fix", {
        width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    });
    await run("MOBILE with min-width:0 on grid item", {
        width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    }, FIX_CSS);
    await run("DESKTOP with min-width:0 on grid item", { width: 1440, height: 900 }, FIX_CSS);
})().catch((e) => { console.error(e); process.exit(1); });
