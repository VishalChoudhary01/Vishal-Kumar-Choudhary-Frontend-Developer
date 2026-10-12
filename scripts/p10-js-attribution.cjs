/* Phase 10 — JS bundle attribution harness.
 * Loads each route cold and records every JS request (chunk, transfer bytes),
 * then prints the chunk -> bytes table used for bundle analysis.
 * Usage: node scripts/p10-js-attribution.cjs [baseUrl]  (default http://localhost:3010)
 */
const puppeteer = require("puppeteer-core");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.argv[2] || "http://localhost:3010";
const ROUTES = ["/", "/projects/class-fuse", "/projects/spendwise"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run(browser, path) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.setCacheEnabled(false);

    const js = [];
    page.on("response", async (res) => {
        try {
            const url = res.url();
            if (!url.includes("/_next/static/chunks/") || !url.endsWith(".js")) return;
            const headers = res.headers();
            const len = Number(headers["content-length"] || 0);
            const bufLen = len || (await res.content().catch(() => [])).length;
            const name = url.split("/").pop();
            js.push({ name, bytes: bufLen });
        } catch {}
    });

    await page.goto(BASE + path, { waitUntil: "load", timeout: 60000 });
    await sleep(2500); /* allow deferred/lazy chunk loads to settle */
    await page.close();

    const byName = {};
    for (const j of js) byName[j.name] = (byName[j.name] || 0) + j.bytes;
    const entries = Object.entries(byName).sort((a, b) => b[1] - a[1]);
    return {
        path,
        requests: entries.length,
        total: entries.reduce((s, [, b]) => s + b, 0),
        entries,
    };
}

(async () => {
    const browser = await puppeteer.launch({
        executablePath: CHROME,
        headless: true,
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const all = {};
    for (const route of ROUTES) {
        const r = await run(browser, route);
        all[route] = r;
        console.log(`\n=== ${route}  jsRequests=${r.requests}  jsBytes=${r.total}`);
        for (const [name, bytes] of r.entries.slice(0, 15)) {
            console.log(`  ${String(bytes).padStart(8)}  ${name}`);
        }
    }
    await browser.close();

    /* chunks loaded on every route = the shared initial payload */
    const sets = ROUTES.map((r) => new Set(all[r].entries.map(([n]) => n)));
    const shared = all[ROUTES[0]].entries
        .filter(([n]) => sets.every((s) => s.has(n)))
        .reduce((s, [, b]) => s + b, 0);
    console.log(`\nshared-every-route JS bytes: ${shared}`);
})();
