import { createServer } from "node:http";
import { chromium } from "playwright";
import {
  access,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { constants } from "node:fs";
import {
  dirname,
  extname,
  resolve,
  sep,
} from "node:path";

const BUILD_ROOT = resolve(process.env.LABS_CAPTURE_BUILD_OUTPUT || "/vercel/sandbox/output");
const SCREENSHOT_PATH = resolve(process.env.LABS_CAPTURE_SCREENSHOT_PATH || "/vercel/sandbox/gallery-poster.png");
const RESULT_PATH = resolve(process.env.LABS_CAPTURE_RESULT_PATH || "/vercel/sandbox/gallery-poster-result.json");
const HOST = "127.0.0.1";
const VIEWPORT = { width: 1200, height: 900 };
const MAX_POSTER_BYTES = 8 * 1024 * 1024;
const CAPTURE_VERSION = "playwright-chromium-v1";
const PINNED_PLAYWRIGHT_VERSION = "1.65.0";
const EXPECTED_BROWSER_VERSION = String(process.env.LABS_CHROMIUM_EXPECTED_VERSION || "").trim();

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function captureError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

async function writeResult(result) {
  await mkdir(dirname(RESULT_PATH), { recursive: true });
  await writeFile(
    RESULT_PATH,
    JSON.stringify({
      captureVersion: CAPTURE_VERSION,
      playwrightVersion: PINNED_PLAYWRIGHT_VERSION,
      ...result,
    }),
    { mode: 0o600 },
  );
}

function isInside(root, candidate) {
  return candidate === root || candidate.startsWith(root + sep);
}

async function serveBuild() {
  const entry = resolve(BUILD_ROOT, "index.html");
  if (!isInside(BUILD_ROOT, entry)) {
    throw captureError("build_entry_invalid", "The compiled release has an invalid HTML entry.");
  }
  await access(entry, constants.R_OK);

  const server = createServer(async (request, response) => {
    try {
      if (request.method !== "GET" && request.method !== "HEAD") {
        response.writeHead(405, { Allow: "GET, HEAD" }).end();
        return;
      }

      const requestUrl = new URL(request.url || "/", "http://" + HOST);
      let pathname;
      try {
        pathname = decodeURIComponent(requestUrl.pathname);
      } catch {
        response.writeHead(400).end();
        return;
      }

      const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      if (
        !relative ||
        relative.split("/").some((part) =>
          !part || part === "." || part === ".." || part.startsWith(".")
        )
      ) {
        response.writeHead(404).end();
        return;
      }

      const filePath = resolve(BUILD_ROOT, relative);
      if (!isInside(BUILD_ROOT, filePath) || filePath === BUILD_ROOT) {
        response.writeHead(404).end();
        return;
      }

      const contentType = CONTENT_TYPES[extname(filePath).toLowerCase()];
      if (!contentType) {
        response.writeHead(404).end();
        return;
      }

      const bytes = await readFile(filePath);
      response.writeHead(200, {
        "Content-Type": contentType,
        "Content-Length": bytes.length,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Cross-Origin-Resource-Policy": "same-origin",
      });
      response.end(request.method === "HEAD" ? undefined : bytes);
    } catch {
      response.writeHead(404, { "Cache-Control": "no-store" }).end();
    }
  });

  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, HOST, resolveListen);
  });

  const address = server.address();
  if (!address || typeof address === "string" || !Number.isInteger(address.port)) {
    await new Promise((resolveClose) => server.close(resolveClose));
    throw captureError("capture_failed", "The local screenshot server did not expose a valid port.");
  }

  return { server, port: address.port };
}

async function inspectRenderedOutput(page) {
  return page.evaluate(() => {
    const body = document.body;
    if (!body) return { visible: false, textLength: 0 };

    const text = String(body.innerText || "").replace(/\s+/g, " ").trim();
    const visibleElement = Array.from(
      document.querySelectorAll(
        "canvas,svg,img,video,h1,h2,h3,h4,h5,h6,p,button,main,section,article,nav,form,ul,ol,[role=img]",
      ),
    ).some((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return (
        rect.width > 1 &&
        rect.height > 1 &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        Number(style.opacity || 1) > 0
      );
    });

    return {
      visible: text.length >= 12 || visibleElement,
      textLength: text.length,
      hasVisibleElement: visibleElement,
    };
  });
}

async function main() {
  await mkdir(dirname(SCREENSHOT_PATH), { recursive: true });
  await rm(SCREENSHOT_PATH, { force: true });
  await rm(RESULT_PATH, { force: true });

  if (!EXPECTED_BROWSER_VERSION) {
    await writeResult({ status: "unavailable", reasonCode: "browser_unpinned" });
    return;
  }

  let browser;
  let server;
  try {
    browser = await chromium.launch({
      headless: true,
      timeout: 12_000,
      args: [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-background-networking",
        "--disable-component-update",
        "--disable-default-apps",
        "--disable-extensions",
        "--disable-sync",
        "--disable-translate",
        "--no-first-run",
        "--no-default-browser-check",
        "--mute-audio",
        "--hide-scrollbars",
      ],
    });

    const browserVersion = browser.version();
    if (browserVersion !== EXPECTED_BROWSER_VERSION) {
      throw captureError(
        "browser_version_mismatch",
        "The screenshot browser version does not match the compiler snapshot pin.",
      );
    }

    server = await serveBuild();
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 1,
      colorScheme: "light",
      reducedMotion: "reduce",
      serviceWorkers: "block",
    });

    // Even though the sandbox has outbound networking denied, explicitly
    // constrain the page to the local artifact server and inline data/blob
    // resources. The screenshot must not depend on remote services.
    await context.route("**/*", async (route) => {
      const rawUrl = route.request().url();
      if (rawUrl.startsWith("data:") || rawUrl.startsWith("blob:")) {
        await route.continue();
        return;
      }

      try {
        const url = new URL(rawUrl);
        if (
          url.protocol === "http:" &&
          url.hostname === HOST &&
          url.port === String(server.port)
        ) {
          await route.continue();
          return;
        }
      } catch {
        // Invalid and non-local URLs are blocked below.
      }
      await route.abort("blockedbyclient");
    });

    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => {
      pageErrors.push(String(error?.message || "Runtime error").slice(0, 500));
    });
    page.setDefaultNavigationTimeout(15_000);
    page.setDefaultTimeout(8_000);

    try {
      await page.goto("http://" + HOST + ":" + server.port + "/", {
        waitUntil: "load",
        timeout: 15_000,
      });
    } catch {
      throw captureError("navigation_failed", "The compiled experiment could not finish loading for its screenshot.");
    }

    await page.evaluate(async () => {
      if (document.fonts?.ready) {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 2_000)),
        ]);
      }
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      );
    });
    await page.waitForTimeout(750);
    if (pageErrors.length) {
      throw captureError("runtime_error", "The experiment raised a browser runtime error before screenshot capture.");
    }

    const rendered = await inspectRenderedOutput(page);
    if (!rendered.visible) {
      throw captureError("no_visible_output", "The compiled experiment did not render visible content.");
    }

    const bytes = await page.screenshot({
      type: "png",
      animations: "disabled",
      caret: "hide",
      fullPage: false,
      timeout: 10_000,
    });

    const isPng = Buffer.isBuffer(bytes) &&
      bytes.length >= 24 &&
      bytes.length <= MAX_POSTER_BYTES &&
      bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const width = isPng ? bytes.readUInt32BE(16) : 0;
    const height = isPng ? bytes.readUInt32BE(20) : 0;

    if (!isPng || width !== VIEWPORT.width || height !== VIEWPORT.height) {
      throw captureError("invalid_output", "The screenshot did not pass PNG, dimensions and 8 MB size validation.");
    }

    await writeFile(SCREENSHOT_PATH, bytes, { mode: 0o600 });
    await writeResult({
      status: "ready",
      reasonCode: null,
      path: SCREENSHOT_PATH,
      contentType: "image/png",
      byteSize: bytes.length,
      width,
      height,
      browserVersion,
      renderedTextLength: rendered.textLength,
      hasVisibleElement: rendered.hasVisibleElement,
    });
  } catch (error) {
    const allowedReasons = new Set([
      "browser_version_mismatch",
      "capture_timeout",
      "capture_failed",
      "navigation_failed",
      "no_visible_output",
      "invalid_output",
    ]);
    const reasonCode = allowedReasons.has(error?.code)
      ? error.code
      : /timeout/i.test(String(error?.message || ""))
        ? "capture_timeout"
        : "capture_failed";
    await rm(SCREENSHOT_PATH, { force: true }).catch(() => {});
    await writeResult({ status: "unavailable", reasonCode });
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (server?.server) {
      await new Promise((resolveClose) => server.server.close(resolveClose));
    }
  }
}

main().catch(async () => {
  await writeResult({ status: "unavailable", reasonCode: "capture_failed" }).catch(() => {});
});
