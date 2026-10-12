import puppeteer from "puppeteer-core";
import fs from "node:fs";

const AXE = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const BASE = process.argv[2] || "http://localhost:3000";
const browser = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--no-sandbox"],
});

for (const [route, w, h] of [["/", 1280, 900], ["/", 390, 844]]) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h });
    await page.goto(BASE + route, { waitUntil: "load", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 4500));
    if (w === 390) {
        const btn = await page.$("header button[aria-expanded]");
        if (btn) { await btn.click(); await new Promise((r) => setTimeout(r, 1500)); }
    }
    await page.evaluate(AXE);
    const out = await page.evaluate(async () => {
        const r = await window.axe.run(document, {
            runOnly: ["label-content-name-mismatch", "aria-prohibited-attr"],
        });
        return r.violations.flatMap((v) =>
            v.nodes.map((n) => ({
                rule: v.id,
                target: n.target.join(" "),
                html: n.html.slice(0, 220),
                visible: n.any[0]?.data?.innerText ?? null,
                key: n.any[0]?.data?.key ?? null,
            }))
        );
    });
    console.log(`\n=== ${route} @${w} ===`);
    for (const o of out) console.log(JSON.stringify(o, null, 2));
    await page.close();
}
await browser.close();
