const puppeteer = require("puppeteer-core");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SAMPLE = `new Promise((res)=>{let f=0;const t0=performance.now();const r=()=>{f++;if(performance.now()-t0<2500)requestAnimationFrame(r);else res(f);};requestAnimationFrame(r);})`;
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 900 });
  await p.goto("http://localhost:3010/", { waitUntil: "load", timeout: 60000 });
  await sleep(4000);
  const fps = f => Math.round(f/2.5);
  const runs=[], pausedRuns=[];
  for (let i=0;i<4;i++){ runs.push(fps(await p.evaluate(SAMPLE))); }
  await p.evaluate(()=>{ [...document.querySelectorAll("*")].filter(e=>{const m=(getComputedStyle(e).filter.match(/blur\((\d+)px\)/)||[])[1];return m&&+m>=60;}).forEach(e=>e.getAnimations().forEach(a=>a.pause())); });
  await sleep(300);
  for (let i=0;i<4;i++){ pausedRuns.push(fps(await p.evaluate(SAMPLE))); }
  const med=a=>a.sort((x,y)=>x-y)[Math.floor(a.length/2)];
  console.log(JSON.stringify({ runningFPS:runs, pausedFPS:pausedRuns, medRunning:med(runs), medPaused:med(pausedRuns) }));
  await b.close();
})();
