const puppeteer = require("puppeteer-core");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await puppeteer.launch({executablePath:CHROME,headless:true,args:["--no-sandbox"]});
  const p=await b.newPage(); await p.setViewport({width:1280,height:900});
  await p.goto("http://localhost:3010/",{waitUntil:"load",timeout:60000});
  await sleep(4500);
  // gentle scroll from top so useInView(once) triggers naturally
  await p.evaluate(async()=>{ for(let y=0;y<2500;y+=200){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,80));} });
  await p.evaluate(()=>document.getElementById("about")?.scrollIntoView());
  await sleep(3000);
  const res=await p.evaluate(()=>{
    const words=[...document.querySelectorAll("#about .inline-block")];
    const wc=words.filter(e=>{const s=getComputedStyle(e);return s.willChange&&s.willChange!=="auto";});
    // what's keeping will-change? inline style vs class
    const detail=wc.slice(0,5).map(e=>({inline:e.style.willChange||"(none)",cls:[...e.classList].join(" ")||"(none)"}));
    const yNow=Math.round(window.scrollY);
    return { total:words.length, wcCount:wc.length, atY:yNow, detail };
  });
  console.log(JSON.stringify(res));
  await b.close();
})();
