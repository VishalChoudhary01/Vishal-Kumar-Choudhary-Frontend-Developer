import { createServer } from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { access, readFile, mkdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, extname, resolve, sep } from "node:path";

const BUILD_ROOT = resolve(process.env.LABS_CAPTURE_BUILD_OUTPUT || "/vercel/sandbox/output");
const SCREENSHOT_PATH = resolve(process.env.LABS_CAPTURE_SCREENSHOT_PATH || "/vercel/sandbox/gallery-poster.png");
const RESULT_PATH = resolve(process.env.LABS_CAPTURE_RESULT_PATH || "/vercel/sandbox/gallery-poster-result.json");
const HOST = "127.0.0.1";
const PORT = 4173;
const MAX_POSTER_BYTES = 8 * 1024 * 1024;
const CAPTURE_VERSION = "chromium-cli-v1";
const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf",
};

function writeResult(result) {
  return writeFile(RESULT_PATH, JSON.stringify({
    captureVersion: CAPTURE_VERSION,
    ...result,
  }), { mode: 0o600 });
}

function isInside(root, candidate) {
  return candidate === root || candidate.startsWith(root + sep);
}

async function serveBuild() {
  const entry = resolve(BUILD_ROOT, "index.html");
  if (!isInside(BUILD_ROOT, entry)) throw new Error("BUILD_ENTRY_INVALID");
  await access(entry, constants.R_OK);

  const server = createServer(async (request, response) => {
    try {
      const rawPath = String(request.url || "/").split("?")[0];
      let pathname;
      try { pathname = decodeURIComponent(rawPath); } catch {
        response.writeHead(400).end();
        return;
      }
      const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      if (!relative || relative.split("/").some((part) => !part || part === "." || part === ".." || part.startsWith("."))) {
        response.writeHead(404).end();
        return;
      }
      const filePath = resolve(BUILD_ROOT, relative);
      if (!isInside(BUILD_ROOT, filePath)) {
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
      });
      response.end(bytes);
    } catch {
      response.writeHead(404).end();
    }
  });

  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(PORT, HOST, resolveListen);
  });
  return server;
}

function findChromium() {
  const configured = String(process.env.LABS_CHROMIUM_EXECUTABLE_PATH || "").trim();
  const expectedVersion = String(process.env.LABS_CHROMIUM_EXPECTED_VERSION || "").trim();
  if (!expectedVersion) return null;

  const candidates = [
    ...(configured ? [configured] : []),
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/opt/google/chrome/chrome",
    "chromium",
    "chromium-browser",
    "google-chrome",
  ];
  for (const candidate of candidates) {
    const located = candidate.includes("/")
      ? { status: 0, stdout: candidate }
      : spawnSync("which", [candidate], { encoding: "utf8", timeout: 2500 });
    if (located.status !== 0) continue;
    const executable = String(located.stdout || "").trim();
    if (!executable) continue;
    const check = spawnSync(executable, ["--version"], { encoding: "utf8", timeout: 2500 });
    if (check.status !== 0) continue;
    const version = String(check.stdout || check.stderr || "").trim().slice(0, 160);
    if (!version.includes(expectedVersion)) continue;
    return { executable, version };
  }
  return null;
}

function runChromium(executable, args, timeoutMs = 25000) {
  return new Promise((resolveRun) => {
    const child = spawn(executable, args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, HOME: process.env.HOME || "/tmp" },
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolveRun(result);
    };
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      finish({ ok: false, reasonCode: "capture_timeout", stdout, stderr });
    }, timeoutMs);
    child.stdout.on("data", (chunk) => {
      stdout = (stdout + chunk.toString("utf8")).slice(-2_000_000);
    });
    child.stderr.on("data", (chunk) => {
      stderr = (stderr + chunk.toString("utf8")).slice(-12000);
    });
    child.once("error", () => finish({ ok: false, reasonCode: "capture_failed", stdout, stderr }));
    child.once("close", (code) => finish({ ok: code === 0, exitCode: code, stdout, stderr }));
  });
}

function baseArgs(url) {
  return [
    "--headless=new",
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
    "--autoplay-policy=user-gesture-required",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--force-prefers-reduced-motion=reduce",
    "--window-size=1200,900",
    "--disable-features=MediaRouter,OptimizationHints,Translate",
    "--virtual-time-budget=5000",
    url,
  ];
}

async function main() {
  await mkdir(dirname(SCREENSHOT_PATH), { recursive: true });
  const browser = findChromium();
  if (!browser) {
    await writeResult({
      status: "unavailable",
      reasonCode: process.env.LABS_CHROMIUM_EXPECTED_VERSION ? "browser_unavailable" : "browser_unpinned",
    });
    return;
  }
  const executable = browser.executable;

  const server = await serveBuild();
  try {
    const url = `http://${HOST}:${PORT}/`;
    const inspected = await runChromium(executable, [
      ...baseArgs(url),
      "--dump-dom",
    ]);
    if (!inspected.ok) {
      await writeResult({ status: "unavailable", reasonCode: inspected.reasonCode || "capture_failed" });
      return;
    }

    const body = inspected.stdout.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || "";
    const visibleMarkup = /<(canvas|svg|img|video|h[1-6]|p|button|main|section|article|nav|form|ul|ol)\b/i.test(body);
    const visibleText = body.replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<style\b[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/g, " ").trim();
    if (!visibleMarkup && visibleText.length < 12) {
      await writeResult({ status: "unavailable", reasonCode: "no_visible_output" });
      return;
    }

    const screenshot = await runChromium(executable, [
      ...baseArgs(url),
      `--screenshot=${SCREENSHOT_PATH}`,
    ]);
    if (!screenshot.ok) {
      await writeResult({ status: "unavailable", reasonCode: screenshot.reasonCode || "capture_failed" });
      return;
    }

    const bytes = await readFile(SCREENSHOT_PATH);
    const isPng = bytes.length >= 24 &&
      bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const width = isPng ? bytes.readUInt32BE(16) : 0;
    const height = isPng ? bytes.readUInt32BE(20) : 0;
    if (!isPng || bytes.length > MAX_POSTER_BYTES || width !== 1200 || height !== 900) {
      await writeResult({ status: "unavailable", reasonCode: "invalid_output" });
      return;
    }
    await writeResult({
      status: "ready",
      reasonCode: null,
      path: SCREENSHOT_PATH,
      contentType: "image/png",
      byteSize: bytes.length,
      width,
      height,
      captureVersion: CAPTURE_VERSION,
      browserVersion: browser.version,
    });
  } finally {
    await new Promise((resolveClose) => server.close(resolveClose));
  }
}

main().catch(async () => {
  await writeResult({ status: "unavailable", reasonCode: "capture_failed" }).catch(() => {});
});
