/* Phase 11 — visual equivalence: capture settled screenshots of the homepage
 * (and the two edited headings) to confirm no visual regression from the
 * will-change change. Writes PNGs for manual/eyeball + dimensions check.
 */
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.argv[2] || "http://localhost:3010";
const OUT = process.argv[3] || "/tmp/p11-after";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 900 });
  await p.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await sleep(5000); // let loader finish + hero settle
  await p.screenshot({ path: `${OUT}/home-hero.png` });
  // scroll to the About heading (edited AboutMaskedWords) and a section heading
  await p.evaluate(() => document.getElementById("about")?.scrollIntoView());
  await sleep(2000);
  await p.screenshot({ path: `${OUT}/about-heading.png` });
  await p.evaluate(() => document.getElementById("skills")?.scrollIntoView());
  await sleep(2000);
  await p.screenshot({ path: `${OUT}/skills-heading.png` });
  // broken image / console check
  const imgs = await p.evaluate(() => [...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src));
  console.log(JSON.stringify({ shots: 3, brokenImages: imgs.length, firstBroken: imgs[0]||null }));
  await b.close();
})();
