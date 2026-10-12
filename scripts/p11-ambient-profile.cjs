/* Phase 11 — isolate the ambient-loop cost on the homepage.
 * Measures rAF smoothness with the ambient blobs present vs. temporarily
 * hidden, to attribute the frame loss to blur+animate vs. everything else.
 */
const puppeteer = require("puppeteer-core");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SAMPLE = `
  new Promise((res) => {
    let frames = 0; const t0 = performance.now();
    const raf = () => { frames++; if (performance.now() - t0 < 3000) requestAnimationFrame(raf); else res(frames); };
    requestAnimationFrame(raf);
  })
`;
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 900 });
  await p.goto("http://localhost:3010/", { waitUntil: "load", timeout: 60000 });
  await sleep(4000);

  const withAmbient = await p.evaluate(SAMPLE);

  // Hide the blur blobs (identify by blur filter >= 60px) and re-measure
  const hidden = await p.evaluate(() => {
    const big = [...document.querySelectorAll("*")].filter(e => {
      const m = (getComputedStyle(e).filter.match(/blur\((\d+)px\)/)||[])[1];
      return m && +m >= 60;
    });
    big.forEach(e => e.style.visibility = "hidden");
    return big.length;
  });
  const withoutAmbient = await p.evaluate(SAMPLE);
  // restore
  await p.evaluate(() => { [...document.querySelectorAll("*")].forEach(e => { if (e.style.visibility === "hidden") e.style.visibility = ""; }); });

  const fps = f => Math.round(f / 3);
  console.log(JSON.stringify({
    bigBlurBlobs: hidden,
    fpsWithAmbient: fps(withAmbient),
    fpsWithoutAmbient: fps(withoutAmbient),
  }));
  await b.close();
})();
