const puppeteer = require("puppeteer-core");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SAMPLE = `new Promise((res)=>{let f=0;const t0=performance.now();const r=()=>{f++;if(performance.now()-t0<3000)requestAnimationFrame(r);else res(f);};requestAnimationFrame(r);})`;
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 900 });
  await p.goto("http://localhost:3010/", { waitUntil: "load", timeout: 60000 });
  await sleep(4000);
  const fps = f => Math.round(f/3);

  const base = fps(await p.evaluate(SAMPLE));
  // Stop the infinite animation, keep blur + transforms as-is
  const n = await p.evaluate(() => {
    const big=[...document.querySelectorAll("*")].filter(e=>{const m=(getComputedStyle(e).filter.match(/blur\((\d+)px\)/)||[])[1];return m&&+m>=60;});
    big.forEach(e=>{ e.getAnimations().forEach(a=>{ a.pause(); }); });
    return big.length;
  });
  const paused = fps(await p.evaluate(SAMPLE));
  console.log(JSON.stringify({ blobs:n, fpsBase:base, fpsAnimPaused:paused }));
  await b.close();
})();
