const puppeteer = require("puppeteer-core");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--no-sandbox"] });
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 900 });
  await p.goto("http://localhost:3010/", { waitUntil: "load", timeout: 60000 });
  await new Promise(r => setTimeout(r, 3500));
  const res = await p.evaluate(() => {
    const canPromote = (el) => {
      const s = getComputedStyle(el);
      return (s.filter && s.filter.includes("blur")) ||
             (s.backdropFilter && s.backdropFilter !== "none") ||
             (s.willChange && s.willChange !== "auto");
    };
    const els = [...document.querySelectorAll("*")];
    const blur = els.filter(e => { const s = getComputedStyle(e); return (s.filter && s.filter.includes("blur")) || (s.backdropFilter && s.backdropFilter !== "none"); });
    const bigBlur = blur.filter(e => { const m = (getComputedStyle(e).filter.match(/blur\((\d+)px\)/) || [])[1]; return m && +m >= 60; });
    const wcTransform = els.filter(e => (getComputedStyle(e).willChange || "").includes("transform"));
    // verify promotion: does translateZ(0) create a self-promoted layer?
    const t = document.createElement("div");
    t.style.cssText = "position:absolute;width:200px;height:200px;filter:blur(70px);";
    document.body.appendChild(t);
    const layers = window.__advLayers || null;
    document.body.removeChild(t);
    return {
      blurEls: blur.length,
      bigBlurEls: bigBlur.length,
      bigBlurTags: bigBlur.map(e => e.className.split(" ")[0] || e.tagName).slice(0,6),
      wcTransformCount: wcTransform.length,
      totalEls: els.length,
    };
  });
  console.log(JSON.stringify(res));
  await b.close();
})();
