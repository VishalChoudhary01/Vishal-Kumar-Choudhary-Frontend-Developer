/* Phase 11 — GPU/compositor layer count via CDP screencastFrameMetadata
 * (uses.layerization = true tells us the frame was composited from layers).
 * Counts distinct layer IDs seen across a short capture = retained layers.
 */
const puppeteer = require("puppeteer-core");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 900 });
  const c = await p.target().createCDPSession();
  await p.goto("http://localhost:3010/", { waitUntil: "load", timeout: 60000 });
  await sleep(4500);
  const res = await p.evaluate(() => {
    const all=[...document.querySelectorAll("*")];
    const promoted=all.filter(e=>{const s=getComputedStyle(e);return s.willChange&&s.willChange!=="auto";});
    const rest=promoted.filter(e=>{const t=getComputedStyle(e).transform;return t==="none"||t==="matrix(1, 0, 0, 1, 0, 0)";});
    return { totalPromoted: promoted.length, atRestPromoted: rest.length };
  });
  console.log(JSON.stringify(res));
  await b.close();
})();
