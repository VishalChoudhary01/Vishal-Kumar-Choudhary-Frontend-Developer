const puppeteer = require("puppeteer-core");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await puppeteer.launch({executablePath:CHROME,headless:true,args:["--no-sandbox"]});
  const p=await b.newPage(); await p.setViewport({width:1280,height:900});
  const errs=[]; p.on("pageerror",e=>errs.push(e.message));
  await p.goto("http://localhost:3010/",{waitUntil:"load",timeout:60000});
  await sleep(4500);
  await p.evaluate(()=>document.getElementById("about")?.scrollIntoView());
  await sleep(2500); // let the AboutMaskedWords entrance finish
  const res=await p.evaluate(()=>{
    const words=[...document.querySelectorAll("#about .inline-block")];
    const wcNow=words.filter(e=>{const s=getComputedStyle(e);return s.willChange&&s.willChange!=="auto";});
    const sample=words[0]?getComputedStyle(words[0]).willChange:"(none)";
    const rendered=words.filter(e=>e.textContent.trim().length>0).length;
    return { wordEls:words.length, stillWillChange:wcNow.length, sampleWillChange:sample, withText:rendered };
  });
  console.log(JSON.stringify({...res, pageErrors:errs.length }));
  await b.close();
})();
