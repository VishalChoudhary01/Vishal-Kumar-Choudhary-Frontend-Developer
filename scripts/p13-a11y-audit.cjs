/*
 * Phase 13 — accessibility audit harness.
 *
 * Runs axe-core against the live app on every route, at desktop and mobile
 * viewports. The mobile pass also opens the navigation menu (a role="dialog"
 * surface) before scanning, because that overlay is keyboard-trapped and
 * would otherwise never be audited.
 *
 * Exit 1 if any route has serious/critical violations.
 *
 * Usage: node scripts/p13-a11y-audit.cjs [baseUrl]  (default http://localhost:3000)
 */
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.argv[2] || "http://localhost:3000";
const AXE = fs.readFileSync(
    path.join(__dirname, "..", "node_modules", "axe-core", "axe.min.js"),
    "utf8"
);

const ROUTES = [
    "/",
    "/projects/class-fuse",
    "/projects/spendwise",
    "/projects/system-canvas",
    "/projects/nextjs-master",
];

const VIEWPORTS = [
    { name: "desktop", width: 1280, height: 900 },
    { name: "mobile", width: 390, height: 844 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SEVERITY = ["minor", "moderate", "serious", "critical"];

async function scan(page) {
    await page.evaluate(AXE);
    const result = await page.evaluate(async () => {
        const r = await window.axe.run(document, {
            resultTypes: ["violations"],
        });
        return r.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            nodes: v.nodes.length,
            firstTarget: v.nodes[0]?.target?.join(" ")?.slice(0, 90),
        }));
    });
    return result;
}

async function audit(browser, route, viewport) {
    const page = await browser.newPage();
    await page.setViewport({
        width: viewport.width,
        height: viewport.height,
    });
    await page.goto(BASE + route, { waitUntil: "load", timeout: 60000 });
    await sleep(4500); /* intro loader + hydration must settle first */

    /* Mobile: open the menu so the dialog overlay gets scanned too. */
    if (viewport.name === "mobile" && route === "/") {
        const hamburger = await page.$('header button.lg\\:hidden');
        if (hamburger) {
            await hamburger.click();
            await sleep(1200);
        }
    }

    const violations = await scan(page);
    await page.close();
    return { route, viewport: viewport.name, violations };
}

(async () => {
    const browser = await puppeteer.launch({
        executablePath: CHROME,
        headless: true,
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });

    let anySerious = false;
    const summary = [];

    for (const viewport of VIEWPORTS) {
        for (const route of ROUTES) {
            const r = await audit(browser, route, viewport);
            const serious = r.violations.filter((v) =>
                SEVERITY.indexOf(v.impact) >= 2
            );
            if (serious.length) anySerious = true;
            const tag = serious.length ? "FAIL" : r.violations.length ? "WARN" : "PASS";
            console.log(
                `[${tag}] ${r.route} @${r.viewport}  violations=${r.violations.length} serious+=${serious.length}`
            );
            for (const v of r.violations) {
                console.log(
                    `        - (${v.impact}) ${v.id}: ${v.help} [${v.nodes} node(s)] ${v.firstTarget}`
                );
            }
            summary.push({ ...r, serious: serious.length });
        }
    }

    await browser.close();

    const totalSerious = summary.reduce((s, r) => s + r.serious, 0);
    console.log(`\ntotal serious/critical violations: ${totalSerious}`);
    process.exit(anySerious ? 1 : 0);
})();
