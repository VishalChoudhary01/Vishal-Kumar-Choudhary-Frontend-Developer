/* Phase 11 — rendering-cost probe.
 * Measures, on a settled page (post-loader): DOM node count, will-change
 * element count, filter/backdrop-filter element count, and main-thread
 * smoothness (rAF frames over 4s + long tasks) while the ambient loops run.
 * Usage: node scripts/p11-render-probe.cjs [baseUrl]   (default http://localhost:3010)
 */
const puppeteer = require("puppeteer-core");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.argv[2] || "http://localhost:3010";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const COLLECT = `
  new Promise((resolve) => {
    let frames = 0; const longTasks = [];
    let lastT = performance.now();
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) longTasks.push(Math.round(e.duration)); }).observe({type:'longtask', buffered:true}); } catch(e){}
    const raf = () => { frames++; if (frames < 240) requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    setTimeout(() => resolve({ frames, longTasks }), 4000);
  })
`;

async function probe(browser, path) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.goto(BASE + path, { waitUntil: "load", timeout: 60000 });
    await sleep(3500); /* loader completes, sections mount, ambient loops active */

    const inv = await page.evaluate(() => {
        const all = [...document.querySelectorAll("*")];
        const wc = all.filter((e) => {
            const s = getComputedStyle(e);
            return s.willChange && s.willChange !== "auto";
        });
        const filterOrBackdrop = all.filter((e) => {
            const s = getComputedStyle(e);
            return (s.filter && s.filter.includes("blur")) ||
                (s.backdropFilter && s.backdropFilter !== "none");
        });
        const backdrop = all.filter((e) => {
            const s = getComputedStyle(e);
            return s.backdropFilter && s.backdropFilter !== "none";
        });
        return {
            domNodes: all.length,
            willChangeEls: wc.length,
            wcKinds: [...new Set(wc.map((e) => getComputedStyle(e).willChange))],
            filterOrBackdropEls: filterOrBackdrop.length,
            backdropEls: backdrop.length,
        };
    });

    const perf = await page.evaluate(COLLECT);
    const f = perf.frames;
    const worst = [...perf.longTasks].sort((a, b) => b - a).slice(0, 5);
    await page.close();
    return {
        path,
        ...inv,
        framesIn4s: f,
        avgFrameMs: f ? +(4000 / f).toFixed(1) : null,
        longTaskCount: perf.longTasks.length,
        worstLongTasks: worst,
    };
}

(async () => {
    const browser = await puppeteer.launch({
        executablePath: CHROME,
        headless: true,
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    for (const p of ["/", "/projects/class-fuse"]) {
        const r = await probe(browser, p);
        console.log(JSON.stringify(r));
    }
    await browser.close();
})();
