/* Phase 11 — compositor layer count on the live homepage.
 * Uses the tracedLayers/devtools protocol via Chrome's rendering stats.
 * Falls back to counting promoted (will-change:transform) layers.
 */
const puppeteer = require("puppeteer-core");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.argv[2] || "http://localhost:3010";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
    const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox","--disable-dev-shm-usage"] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    const client = await page.target().createCDPSession();
    await client.send("Performance.enable");
    await page.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
    await sleep(3500);
    // count large composited areas via tracedLayers is not always available; use layerization heuristic
    const { metrics } = await client.send("Performance.getMetrics");
    const m = Object.fromEntries(metrics.map(x => [x.name, x.value]));
    const layers = await page.evaluate(() => {
      const all=[...document.querySelectorAll("*")];
      const promoted=all.filter(e=>{const s=getComputedStyle(e);return (s.willChange&&s.willChange.includes("transform"))||(s.transform!=="none"&&s.position!=="static");});
      // count elements that are BOTH animated-transform candidates (have a transition/animation or will-change) 
      const animating=all.filter(e=>{const s=getComputedStyle(e);return (s.willChange&&s.willChange!=="auto")||s.animationName!=="none";});
      return { promotedCount: promoted.length, animatingCount: animating.length };
    });
    console.log(JSON.stringify({ nodes: m.Nodes, jsHeapUsed: Math.round(m.JSHeapUsedSize/1024)+"KB", ...layers }));
    await browser.close();
})();
