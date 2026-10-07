const puppeteer = require("puppeteer-core");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const HOME = "http://localhost:3000/";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const failures = [];
const notes = [];

function fail(msg) { failures.push(msg); }

async function open(browser, url, viewport, { reduced = false } = {}) {
    const page = await browser.newPage();
    page.__errors = [];
    page.on("pageerror", (e) => page.__errors.push("pageerror: " + e.message));
    page.on("console", (m) => {
        if (m.type() === "error") page.__errors.push("console: " + m.text());
    });
    await page.setViewport(viewport);
    if (reduced) {
        await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    }
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    return page;
}

const readButtons = (page) =>
    page.evaluate(() => {
        const links = [...document.querySelectorAll("a")].filter((a) =>
            a.querySelector(":scope > span.rounded-full")
        );
        links.forEach((a, i) => a.setAttribute("data-test-btn", String(i)));
        return links.map((a, i) => {
            const kids = a.children;
            const arrow = kids[kids.length - 1];
            const circle = a.querySelector(":scope > span.rounded-full");
            const circleRect = circle ? circle.getBoundingClientRect() : null;
            return {
                id: i,
                label: (a.textContent || "").trim(),
                href: a.getAttribute("href"),
                target: a.getAttribute("target"),
                rel: a.getAttribute("rel"),
                isAnchor: a.tagName === "A",
                nestedAnchors: a.querySelectorAll("a").length,
                arrowTransform: getComputedStyle(arrow).transform,
                circleTransform: circle ? getComputedStyle(circle).transform : null,
                circleLeft: circleRect ? Math.round(circleRect.left) : null,
                circleRight: circleRect ? Math.round(circleRect.right) : null,
                circleTop: circleRect ? Math.round(circleRect.top) : null,
                circleBottom: circleRect ? Math.round(circleRect.bottom) : null,
                width: Math.round(a.getBoundingClientRect().width),
                height: Math.round(a.getBoundingClientRect().height),
            };
        });
    });

const translateX = (transform) => {
    if (!transform || transform === "none") return 0;
    const m = transform.match(/matrix\(([^)]+)\)/);
    if (m) return Number(m[1].split(",")[4]);
    const t = transform.match(/translateX\(\(-?[0-9.]+)px\)/);
    return t ? Number(t[1]) : 0;
};

const report = (label, fn) => fn().catch((e) => fail(`${label}: ${e.message}`));
const tagByLabel = async (page, needle) => {
    for (let attempt = 0; attempt < 5; attempt++) {
        const sel = await page.evaluate((n) => {
            const links = [...document.querySelectorAll("a")].filter((a) =>
                a.querySelector(":scope > span.rounded-full")
            );
            const target = links.find((a) => a.textContent.includes(n));
            if (!target) return null;
            links.forEach((a, i) => a.setAttribute("data-test-btn", String(i)));
            return `[data-test-btn="${links.indexOf(target)}"]`;
        }, needle);
        if (sel) {
            const exists = await page.$(sel);
            if (exists) return sel;
        }
        await sleep(300);
    }
    return null;
};

