const puppeteer = require("puppeteer-core");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--no-sandbox"] });
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 900 });
  await p.goto("http://localhost:3010/", { waitUntil: "load", timeout: 60000 });
  await new Promise(r => setTimeout(r, 6000)); // scroll through to trigger all once-entrances
  await p.evaluate(async () => { const h=document.body.scrollHeight; for(let y=0;y<h;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));} });
  await new Promise(r => setTimeout(r, 2500));
  const res = await p.evaluate(() => {
    const all=[...document.querySelectorAll("*")];
    const wc=all.filter(e=>(getComputedStyle(e).willChange||"")!=="auto"&&getComputedStyle(e).willChange);
    // after entrance settles, are these still will-change'd?
    const settled = wc.filter(e=>{ const t=getComputedStyle(e).transform; return t==="none"||t==="matrix(1, 0, 0, 1, 0, 0)"; });
    const byClass={};
    wc.forEach(e=>{const c=[...e.classList].find(c=>c.startsWith("will-change"))||"(inline)";byClass[c]=(byClass[c]||0)+1;});
    return { totalWC: wc.length, settledWC: settled.length, byClass };
  });
  console.log(JSON.stringify(res));
  await b.close();
})();
