import { createServer } from "node:http";
import fs from "node:fs/promises";
import path from "node:path";

const OUTPUT = path.resolve(process.env.LABS_BUILD_OUTPUT || "/vercel/sandbox/output");
const PREFIX = process.env.LABS_PREVIEW_PREFIX || "";
const PARENT_ORIGIN = process.env.LABS_PARENT_ORIGIN || "";
const PORT = Number(process.env.PORT || 3000);

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
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function fail(message) {
  process.stderr.write("[labs-preview-server] " + message + "\n");
  process.exit(1);
}

if (!/^\/preview\/[A-Za-z0-9-]{8,80}$/.test(PREFIX)) {
  fail("A valid per-run preview path is required.");
}
let parentOrigin;
try {
  const parsed = new URL(PARENT_ORIGIN);
  if (parsed.protocol !== "https:" || parsed.origin !== PARENT_ORIGIN) {
    fail("The parent origin must be an HTTPS origin.");
  }
  parentOrigin = parsed.origin;
} catch {
  fail("The parent origin is invalid.");
}
if (!Number.isInteger(PORT) || PORT < 1024 || PORT > 65535) {
  fail("The preview port is invalid.");
}

function createBridge(targetOrigin, runId) {
  return [
    "<script>",
    "(() => {",
    "  const targetOrigin = " + JSON.stringify(targetOrigin) + ";",
    "  const runId = " + JSON.stringify(runId) + ";",
    "  let startupError = false;",
    "  const send = (type, extra = {}) => {",
    "    try { window.parent.postMessage({ type, runId, ...extra }, targetOrigin); } catch {}",
    "  };",
    "  const report = (type, level, args) => {",
    "    const message = args.map((value) => {",
    "      if (typeof value === 'string') return value;",
    "      try { return JSON.stringify(value); } catch { return String(value); }",
    "    }).join(' ').slice(0, 1200);",
    "    send(type, { level, message });",
    "  };",
    "  for (const level of ['log', 'info', 'warn', 'error']) {",
    "    const original = console[level].bind(console);",
    "    console[level] = (...args) => { original(...args); report('labs-preview-console', level, args); };",
    "  }",
    "  window.addEventListener('error', (event) => {",
    "    startupError = true;",
    "    report('labs-preview-console', 'error', [event.message || 'Runtime error', event.filename ? event.filename + ':' + event.lineno + ':' + event.colno : '']);",
    "  });",
    "  window.addEventListener('unhandledrejection', (event) => {",
    "    startupError = true;",
    "    report('labs-preview-console', 'error', [event.reason?.stack || event.reason?.message || event.reason || 'Unhandled promise rejection']);",
    "  });",
    "  window.addEventListener('load', () => {",
    "    requestAnimationFrame(() => requestAnimationFrame(() => {",
    "      if (!startupError) send('labs-preview-ready');",
    "    }));",
    "  }, { once: true });",
    "})();",
    "</script>",
  ].join("\n");
}

const previewRunId = PREFIX.slice('/preview/'.length);
const bridge = createBridge(parentOrigin, previewRunId);

function safePathname(rawPathname) {
  let pathname;
  try {
    pathname = decodeURIComponent(rawPathname);
  } catch {
    return null;
  }
  if (
    pathname.includes("\0") ||
    pathname.includes("\\") ||
    pathname.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    return null;
  }
  return pathname;
}

async function handleRequest(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  let url;
  try {
    url = new URL(request.url || "/", "http://labs-preview.local");
  } catch {
    response.writeHead(400);
    response.end();
    return;
  }

  const pathname = safePathname(url.pathname);
  if (!pathname || !pathname.startsWith(PREFIX + "/")) {
    response.writeHead(404, { "Cache-Control": "no-store" });
    response.end();
    return;
  }

  const relative = pathname.slice(PREFIX.length + 1);
  if (relative === "__health") {
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(request.method === "HEAD" ? undefined : JSON.stringify({ status: "ok" }));
    return;
  }

  const filePath = relative === "" ? "index.html" : relative;
  if (
    filePath.startsWith(".") ||
    filePath.split("/").some((segment) => segment.startsWith(".")) ||
    filePath === "labs-build-result.json"
  ) {
    response.writeHead(404, { "Cache-Control": "no-store" });
    response.end();
    return;
  }

  const absolute = path.resolve(OUTPUT, filePath);
  const rel = path.relative(OUTPUT, absolute);
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) {
    response.writeHead(404, { "Cache-Control": "no-store" });
    response.end();
    return;
  }

  let content;
  try {
    content = await fs.readFile(absolute);
  } catch {
    response.writeHead(404, { "Cache-Control": "no-store" });
    response.end();
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  const headers = {
    "Content-Type": CONTENT_TYPES[extension] || "application/octet-stream",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Cross-Origin-Resource-Policy": "cross-origin",
  };

  if (extension === ".html") {
    const html = content.toString("utf8");
    const head = html.toLowerCase().indexOf("<head");
    const headEnd = html.indexOf(">", head);
    if (head < 0 || headEnd < 0) {
      response.writeHead(500, { "Cache-Control": "no-store" });
      response.end();
      return;
    }
    content = Buffer.from(html.slice(0, headEnd + 1) + bridge + html.slice(headEnd + 1), "utf8");
  }

  response.writeHead(200, headers);
  response.end(request.method === "HEAD" ? undefined : content);
}

const server = createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    console.error("[labs-preview-server] request failed:", error?.message || "Unknown error");
    if (!response.headersSent) response.writeHead(500, { "Cache-Control": "no-store" });
    response.end();
  });
});

server.listen(PORT, "0.0.0.0", () => {
  process.stdout.write("Labs preview server listening on " + PORT + "\n");
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
