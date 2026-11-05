import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { Sandbox } from "@vercel/sandbox";
import { prepareReactProject } from "./prepare-react-project.mjs";

const COMPILER_TIMEOUT_MS = 45_000;
const PREVIEW_TIMEOUT_MS = 10 * 60 * 1000;
const MAX_OUTPUT_BYTES = 15 * 1024 * 1024;
const MAX_OUTPUT_FILES = 80;

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
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

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function getCompilerSnapshotId() {
  const value = process.env.LABS_COMPILER_SNAPSHOT_ID;
  if (!value || !/^snap_[A-Za-z0-9]{28}$/.test(value)) {
    fail("COMPILER_NOT_CONFIGURED", "The isolated Labs compiler is not configured for this deployment.");
  }
  return value;
}

function getBlobToken() {
  const value = process.env.BLOB_READ_WRITE_TOKEN;
  if (!value) fail("ARTIFACT_STORAGE_NOT_CONFIGURED", "Published runtime storage is not configured.");
  return value;
}

function validateFileNames(files) {
  if (!Array.isArray(files) || files.length < 1 || files.length > 40) {
    fail("VALIDATION_ERROR", "Add between 1 and 40 source files before running the experiment.");
  }

  const seen = new Set();
  let totalBytes = 0;
  const safe = files.map((file) => {
    if (!file || typeof file.path !== "string" || typeof file.content !== "string") {
      fail("VALIDATION_ERROR", "A source file is invalid.");
    }

    const path = file.path.trim();
    const language = typeof file.language === "string" ? file.language.toLowerCase() : "";
    if (
      !/^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9._/-]{1,180}$/.test(path) ||
      path.includes("\\") ||
      path.split("/").some((segment) => !segment || segment === "." || segment === ".." || segment.startsWith(".")) ||
      /(^|\/)\.env(?:\.|$)|(^|\/)(?:id_rsa|id_ed25519|credentials(?:\.json)?|secrets?\.(?:json|ya?ml))$/i.test(path)
    ) {
      fail("VALIDATION_ERROR", "A source file path is invalid or restricted.");
    }
    const key = path.toLowerCase();
    if (seen.has(key)) fail("VALIDATION_ERROR", "Source file paths must be unique.");
    seen.add(key);

    const extension = path.split(".").pop()?.toLowerCase() || "";
    if (!new Set(["html", "js", "jsx", "mjs", "css", "json", "txt", "md"]).has(extension)) {
      fail("UNSUPPORTED_FILE", "The React preview supports HTML, JavaScript, JSX, CSS, JSON, text and Markdown. Unsupported file: " + path);
    }
    if (!new Set(["javascript", "jsx", "css", "html", "json", "text", "markdown"]).has(language)) {
      fail("UNSUPPORTED_FILE", "Use JavaScript/JSX, HTML, CSS, JSON, text or Markdown for this preview.");
    }
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(file.content)) {
      fail("VALIDATION_ERROR", "Source files must contain plain text only.");
    }

    const bytes = Buffer.byteLength(file.content, "utf8");
    if (bytes > 500_000) fail("FILE_TOO_LARGE", "A source file exceeds 500 KB: " + path);
    totalBytes += bytes;
    if (totalBytes > 1_000_000) fail("SNAPSHOT_TOO_LARGE", "The complete source snapshot exceeds 1 MB.");

    if (
      /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bAKIA[0-9A-Z]{16}\b|\bgh[pousr]_[A-Za-z0-9]{30,}\b|\bsk-[A-Za-z0-9_-]{24,}\b|mongodb(?:\+srv)?:\/\/[^/\s:@]+:[^@\s]+@/i.test(file.content)
    ) {
      fail("VALIDATION_ERROR", "Potential credentials or private keys were detected. Remove them before building.");
    }
    return { path, language, content: file.content };
  });

  return safe;
}

function getParentOrigin(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      fail("INVALID_PREVIEW_ORIGIN", "The preview requires an HTTPS parent origin.");
    }
    return url.origin;
  } catch (error) {
    if (error?.code === "INVALID_PREVIEW_ORIGIN") throw error;
    fail("INVALID_PREVIEW_ORIGIN", "The preview parent origin is invalid.");
  }
}

async function createCompilerSandbox({ timeout, ports = [] }) {
  try {
    return await Sandbox.create({
      source: { type: "snapshot", snapshotId: getCompilerSnapshotId() },
      region: "bom1",
      resources: { vcpus: 2 },
      timeout,
      ports,
      networkPolicy: "deny-all",
    });
  } catch (error) {
    const detail = String(error?.message || "");
    if (/snapshot.*(?:expired|deleted)|status code 410/i.test(detail)) {
      fail(
        "COMPILER_SNAPSHOT_EXPIRED",
        "The Labs compiler snapshot has expired. Refresh LABS_COMPILER_SNAPSHOT_ID and redeploy this Preview environment before running or publishing.",
      );
    }
    if (/status code 429|rate limit|too many requests/i.test(detail)) {
      fail("COMPILER_BUSY", "The isolated compiler is temporarily busy. Wait briefly and retry.");
    }
    console.error("[labs-compiler] sandbox creation failed:", {
      name: error?.name || "Error",
      message: detail.slice(0, 400),
    });
    fail("COMPILER_START_FAILED", "The isolated React compiler could not start. Check the Vercel Sandbox configuration and retry.");
  }
}

async function writeBuildInput(sandbox, files) {
  await sandbox.mkDir("/vercel/sandbox/input");
  await sandbox.writeFiles([
    {
      path: "/vercel/sandbox/input/files.json",
      content: Buffer.from(JSON.stringify(files), "utf8"),
    },
    {
      path: "/vercel/sandbox/input/assets.json",
      content: Buffer.from("{}", "utf8"),
    },
  ]);
}

async function executeBuild(sandbox, files, { base = "./" } = {}) {
  await writeBuildInput(sandbox, files);

  const command = await sandbox.runCommand({
    cmd: "node",
    args: ["/vercel/labs-compiler/scripts/build.mjs"],
    cwd: "/vercel/labs-compiler",
    env: {
      LABS_BUILD_INPUT: "/vercel/sandbox/input",
      LABS_PROJECT_ROOT: "/vercel/sandbox/project",
      LABS_BUILD_OUTPUT: "/vercel/sandbox/output",
      LABS_BUILD_BASE: base,
    },
    timeoutMs: COMPILER_TIMEOUT_MS,
  });

  const [stdout, stderr] = await Promise.all([
    command.stdout(),
    command.stderr(),
  ]);

  if (command.exitCode !== 0) {
    let diagnostic;
    try {
      diagnostic = JSON.parse(stderr.trim().split("\n").pop());
    } catch {
      diagnostic = null;
    }
    fail(
      diagnostic?.code || "BUILD_FAILED",
      diagnostic?.message || stderr.trim().slice(0, 1000) || stdout.trim().slice(0, 1000) || "The experiment could not be compiled.",
    );
  }

  const resultText = await sandbox.fs.readFile("/vercel/sandbox/output/labs-build-result.json", "utf8");
  const result = JSON.parse(resultText);
  if (result.success !== true || !/^[a-f0-9]{64}$/.test(result.buildHash || "")) {
    fail("BUILD_RESULT_INVALID", "The compiler returned an invalid build manifest.");
  }
  if (!Array.isArray(result.outputFiles) || result.outputFiles.length < 1 || result.outputFiles.length > MAX_OUTPUT_FILES) {
    fail("BUILD_OUTPUT_INVALID", "The compiler output is empty or exceeds the file-count limit.");
  }
  if (!result.outputFiles.some((file) => file.path === "index.html")) {
    fail("BUILD_ENTRY_MISSING", "The compiled React project did not emit index.html.");
  }
  const visibleFiles = result.outputFiles.filter((file) => !file.path.startsWith(".vite/"));
  const totalOutputBytes = visibleFiles.reduce((sum, file) => sum + Number(file.bytes || 0), 0);
  if (totalOutputBytes > MAX_OUTPUT_BYTES) {
    fail("BUILD_OUTPUT_TOO_LARGE", "The compiled project exceeds the 15 MB output limit.");
  }

  return { ...result, outputFiles: visibleFiles };
}

export async function createOwnerLabPreview({ slug, user, inputFiles, parentOrigin }) {
  const files = prepareReactProject(validateFileNames(inputFiles));
  const runId = randomUUID();
  const sandbox = await createCompilerSandbox({
    timeout: PREVIEW_TIMEOUT_MS,
    ports: [3000],
  });

  try {
    await executeBuild(sandbox, files, {
      base: "./",
    });

    await sandbox.runCommand({
      cmd: "node",
      args: ["/vercel/labs-compiler/scripts/serve-preview.mjs"],
      cwd: "/vercel/labs-compiler",
      env: {
        LABS_BUILD_OUTPUT: "/vercel/sandbox/output",
        LABS_PREVIEW_PREFIX: "/preview/" + runId,
        LABS_PARENT_ORIGIN: getParentOrigin(parentOrigin),
        PORT: "3000",
      },
      detached: true,
    });

    const previewUrl = sandbox.domain(3000) + "/preview/" + runId + "/";
    let ready = false;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      try {
        const response = await fetch(previewUrl + "__health", {
          cache: "no-store",
          signal: AbortSignal.timeout(2500),
        });
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {
        // The detached static server may need a moment to bind its port.
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!ready) fail("PREVIEW_START_FAILED", "The compiled preview did not start. Check the runtime logs and try again.");

    return {
      runId,
      sandboxName: sandbox.name,
      previewUrl,
      sourceContentHash: createHash("sha256").update(JSON.stringify(files)).digest("hex"),
      expiresAt: new Date(Date.now() + PREVIEW_TIMEOUT_MS),
    };
  } catch (error) {
    await sandbox.stop().catch(() => {});
    throw error;
  }
}

export async function buildAndStoreOwnerLabRelease({ slug, user, version }) {
  const originalFiles = validateFileNames(version.files);
  const files = prepareReactProject(originalFiles);
  const contentHash = createHash("sha256").update(JSON.stringify(originalFiles)).digest("hex");
  if (contentHash !== version.contentHash) {
    fail("SOURCE_HASH_MISMATCH", "The saved source changed. Reload the editor before publishing.");
  }

  const sandbox = await createCompilerSandbox({ timeout: 5 * 60 * 1000 });
  let uploaded = [];
  try {
    const result = await executeBuild(sandbox, files, { base: "./" });
    const artifactId = randomUUID();
    const token = getBlobToken();

    for (const file of result.outputFiles) {
      const bytes = await sandbox.readFileToBuffer({
        path: "/vercel/sandbox/output/" + file.path,
      });
      if (!bytes || bytes.length !== file.bytes) {
        fail("ARTIFACT_READ_FAILED", "A compiled output file could not be verified: " + file.path);
      }
      const extension = file.path.slice(file.path.lastIndexOf(".")).toLowerCase();
      const contentType = CONTENT_TYPES[extension] || "application/octet-stream";
      const blobPath = [
        "labs",
        slug,
        version.versionId,
        result.buildHash,
        file.path,
      ].join("/");

      const stored = await put(blobPath, bytes, {
        access: "public",
        token,
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType,
      });
      uploaded.push({
        path: file.path,
        url: stored.url,
        contentType,
        byteSize: bytes.length,
      });
    }

    const entry = uploaded.find((file) => file.path === "index.html");
    if (!entry) fail("ARTIFACT_ENTRY_MISSING", "The compiled release is missing its HTML entry point.");

    return {
      artifactId,
      experimentSlug: slug,
      sourceVersionId: version.versionId,
      sourceContentHash: contentHash,
      buildHash: result.buildHash,
      entryUrl: entry.url,
      outputFiles: uploaded,
      compiler: result.compiler,
      createdBy: user.id,
      status: "ready",
    };
  } finally {
    await sandbox.stop().catch(() => {});
  }
}
