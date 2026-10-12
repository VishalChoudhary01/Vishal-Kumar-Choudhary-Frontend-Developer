import puppeteer from "puppeteer-core";
import fs from "node:fs";

const AXE = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const browser = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto("http://localhost:3000/", { waitUntil: "load", timeout: 60000 });
await new Promise((r) => setTimeout(r, 4500));
await page.evaluate(AXE);
const out = await page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: ["color-contrast"] });
    return r.violations.flatMap((v) =>
        v.nodes.map((n) => {
            const d = n.any[0]?.data || {};
            return {
                target: n.target.join(" "),
                fg: d.fgColor,
                bg: d.bgColor,
                ratio: d.contrastRatio,
                fontSize: d.fontSize,
                fontWeight: d.fontWeight,
                message: n.any[0]?.message,
            };
        })
    );
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
