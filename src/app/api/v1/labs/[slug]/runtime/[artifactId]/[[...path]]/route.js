import "server-only";

import { createHash } from "node:crypto";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import LabBuildArtifact from "@/app/lib/labs/models/LabBuildArtifact";
import LabExperiment from "@/app/lib/labs/models/LabExperiment";
import LabSource from "@/app/lib/labs/models/LabSource";
import {
  buildPublishedRuntimeCsp,
  rewritePublishedRuntimeHtml,
} from "@/app/lib/labs/runtime-html.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 15;

const ARTIFACT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  ".wasm": "application/wasm",
};

function safeError(status, message) {
  return new Response(message, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function getSafeArtifactPath(pathSegments) {
  if (!Array.isArray(pathSegments) || pathSegments.length === 0) {
    return "index.html";
  }

  if (
    pathSegments.length > 12 ||
    pathSegments.some((segment) =>
      typeof segment !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]{0,179}$/.test(segment) ||
      segment === "." ||
      segment === ".." ||
      segment.startsWith(".")
    )
  ) {
    return null;
  }

  const value = pathSegments.join("/");
  return value.length <= 180 ? value : null;
}

function createRuntimeBridge(artifactId) {
  const safeArtifactId = JSON.stringify(artifactId);

  return `<script data-labs-runtime-bridge>
(() => {
  const artifactId = ${safeArtifactId};
  let parentReady = false;
  let documentReady = false;
  let announced = false;
  let startupError = "";

  const send = (type, message) => {
    try {
      window.parent.postMessage({
        type,
        artifactId,
        ...(message ? { message: String(message).slice(0, 500) } : {}),
      }, "*");
    } catch {}
  };

  const reportError = (reason) => {
    const message = typeof reason === "string"
      ? reason
      : reason?.message || "The experiment encountered a runtime error.";
    startupError = String(message).slice(0, 500);
    if (parentReady) {
      announced = true;
      send("labs-artifact-error", startupError);
    }
  };

  window.addEventListener("error", (event) => {
    reportError(event.message || "The experiment encountered a runtime error.");
  });

  window.addEventListener("unhandledrejection", (event) => {
    reportError(event.reason?.message || event.reason || "The experiment rejected an asynchronous operation.");
  });

  const finishWhenReady = () => {
    if (!parentReady || !documentReady || announced) return;
    announced = true;
    if (startupError) {
      send("labs-artifact-error", startupError);
    } else {
      send("labs-artifact-ready");
    }
  };

  window.addEventListener("message", (event) => {
    if (
      event.source !== window.parent ||
      event.data?.type !== "labs-runtime-parent-ready" ||
      event.data?.artifactId !== artifactId
    ) {
      return;
    }
    parentReady = true;
    finishWhenReady();
  });

  window.addEventListener("load", () => {
    const startedAt = Date.now();

    const inspectOutput = () => {
      const body = document.body;
      const visibleText = String(body?.innerText || "").trim();
      const hasVisibleElement = Array.from(body?.querySelectorAll("*") || []).some((element) => {
        if (["SCRIPT", "STYLE", "LINK", "META", "TEMPLATE"].includes(element.tagName)) {
          return false;
        }

        const style = window.getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") return false;

        const rect = element.getBoundingClientRect();
        return rect.width > 1 && rect.height > 1;
      });
      const bodyStyle = body ? window.getComputedStyle(body) : null;
      const bodyRect = body?.getBoundingClientRect();
      const hasStyledBodyBackground = Boolean(
        bodyStyle &&
        bodyRect?.height > 1 &&
        (
          bodyStyle.backgroundImage !== "none" ||
          (bodyStyle.backgroundColor !== "rgba(0, 0, 0, 0)" && bodyStyle.backgroundColor !== "transparent")
        )
      );
      const rendered = Boolean(visibleText || hasVisibleElement || hasStyledBodyBackground);

      if (rendered) {
        documentReady = true;
        finishWhenReady();
        return;
      }

      if (Date.now() - startedAt >= 5000) {
        documentReady = true;
        startupError = startupError || "The experiment loaded but did not render any visible content.";
        finishWhenReady();
        return;
      }

      window.requestAnimationFrame(inspectOutput);
    };

    window.requestAnimationFrame(() => window.requestAnimationFrame(inspectOutput));
  }, { once: true });
})();
</script>`;
}

function injectRuntimeBridge(html, artifactId, { assetBase, artifactPath }) {
  // Resolve every local HTML asset against the immutable artifact URL before
  // the browser sees it. This guarantees that /runtime/:artifactId/:path is
  // used consistently by HTML, the route matcher and the path-scoped CSP.
  const safeHtml = rewritePublishedRuntimeHtml(html, {
    assetBase,
    entryPath: artifactPath,
  });
  const bridge = createRuntimeBridge(artifactId);
  const headMatch = /<head\b[^>]*>/i.exec(safeHtml);

  if (headMatch) {
    const insertAt = headMatch.index + headMatch[0].length;
    return safeHtml.slice(0, insertAt) + bridge + safeHtml.slice(insertAt);
  }

  const bodyMatch = /<body\b/i.exec(safeHtml);
  if (bodyMatch) {
    return safeHtml.slice(0, bodyMatch.index) + bridge + safeHtml.slice(bodyMatch.index);
  }

  return bridge + safeHtml;
}

function getRuntimeHeaders({ contentType, fileName, isHtml, origin, assetBase }) {
  const headers = new Headers({
    // Artifact IDs are immutable and contain only published browser output.
    // Edge caching avoids one MongoDB lookup for every JS/CSS chunk.
    "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    "Content-Disposition": `inline; filename="${fileName}"`,
    "Content-Type": contentType,
    "Cross-Origin-Resource-Policy": "cross-origin",
    "Access-Control-Allow-Origin": "*",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow",
    "Referrer-Policy": "no-referrer",
  });

  if (isHtml) {
    headers.set(
      "Content-Security-Policy",
      buildPublishedRuntimeCsp({
        assetBase,
        parentOrigin: origin,
      }),
    );
  }

  return headers;
}

export async function GET(request, { params }) {
  const { slug, artifactId, path: pathSegments } = await params;

  if (
    typeof slug !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    typeof artifactId !== "string" ||
    !ARTIFACT_ID_PATTERN.test(artifactId)
  ) {
    return safeError(404, "Published experiment runtime not found.");
  }

  const isPosterRequest = Array.isArray(pathSegments) &&
    pathSegments.length === 2 &&
    pathSegments[0] === "__preview" &&
    pathSegments[1] === "gallery-poster.png";
  const artifactPath = isPosterRequest ? "__preview/gallery-poster.png" : getSafeArtifactPath(pathSegments);
  if (!artifactPath) return safeError(404, "Runtime asset not found.");

  const extension = isPosterRequest ? ".png" : artifactPath.slice(artifactPath.lastIndexOf(".")).toLowerCase();
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) return safeError(404, "Runtime asset type is not supported.");

  try {
    await connectToDatabase();

    const [experiment, source, artifact] = await Promise.all([
      LabExperiment.findOne({
        slug,
        kind: "custom",
        status: "published",
      }).select("slug").lean(),
      LabSource.findOne({
        slug,
        published: true,
        publishedArtifactId: artifactId,
      }).select("publishedVersionId publishedArtifactId").lean(),
      LabBuildArtifact.findOne({
        artifactId,
        experimentSlug: slug,
        status: "ready",
      }).lean(),
    ]);

    if (
      !experiment ||
      !source ||
      !artifact ||
      source.publishedArtifactId !== artifactId ||
      source.publishedVersionId !== artifact.sourceVersionId
    ) {
      return safeError(404, "Published experiment runtime not found.");
    }

    const poster = artifact.previewPoster;
    const outputFile = isPosterRequest
      ? null
      : (artifact.outputFiles || []).find((file) => file.path === artifactPath);
    const assetUrl = isPosterRequest
      ? poster?.status === "ready" &&
        poster.path === "__preview/gallery-poster.png" &&
        poster.captureVersion === "playwright-chromium-v1" &&
        poster.playwrightVersion === "1.65.0" &&
        poster.browserVersion === "158.0.8127.18" &&
        poster.contentType === "image/png" &&
        poster.byteSize > 0 && poster.byteSize <= 8 * 1024 * 1024 &&
        poster.width === 1200 && poster.height === 900 &&
        typeof poster.contentHash === "string" && /^[a-f0-9]{64}$/.test(poster.contentHash)
        ? poster.url
        : null
      : outputFile?.url;
    if (typeof assetUrl !== "string") {
      return safeError(404, "Runtime asset not found.");
    }

    let blobUrl;
    try {
      blobUrl = new URL(assetUrl);
    } catch {
      return safeError(502, "The published runtime asset reference is invalid.");
    }

    if (
      blobUrl.protocol !== "https:" ||
      !blobUrl.hostname.endsWith(".public.blob.vercel-storage.com") ||
      blobUrl.username ||
      blobUrl.password ||
      blobUrl.port ||
      blobUrl.search ||
      blobUrl.hash
    ) {
      return safeError(502, "The published runtime asset host is not allowed.");
    }

    const upstream = await fetch(blobUrl, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });

    if (!upstream.ok || !upstream.body) {
      return safeError(502, "The published runtime asset could not be loaded.");
    }

    if (isPosterRequest) {
      const declaredType = String(upstream.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
      if (declaredType !== "image/png") return safeError(502, "The published gallery poster has an invalid media type.");
      const bytes = Buffer.from(await upstream.arrayBuffer());
      if (
        bytes.length !== poster.byteSize ||
        bytes.length > 8 * 1024 * 1024 ||
        bytes.length < 24 ||
        !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
        bytes.readUInt32BE(16) !== 1200 ||
        bytes.readUInt32BE(20) !== 900 ||
        createHash("sha256").update(bytes).digest("hex") !== poster.contentHash
      ) {
        return safeError(502, "The published gallery poster failed its integrity check.");
      }
      return new Response(bytes, {
        status: 200,
        headers: getRuntimeHeaders({
          contentType: "image/png",
          fileName: "gallery-poster.png",
          isHtml: false,
          origin: request.nextUrl.origin,
          assetBase: "",
        }),
      });
    }

    const origin = request.nextUrl.origin;
    const assetBase = `${origin}/api/v1/labs/${encodeURIComponent(slug)}/runtime/${encodeURIComponent(artifactId)}/`;
    const fileName = artifactPath.split("/").pop() || "runtime-asset";
    const headers = getRuntimeHeaders({
      contentType,
      fileName,
      isHtml: extension === ".html",
      origin,
      assetBase,
    });

    if (extension === ".html") {
      const html = await upstream.text();
      if (Buffer.byteLength(html, "utf8") > 2_000_000) {
        return safeError(413, "The published HTML entry exceeds the runtime limit.");
      }

      return new Response(injectRuntimeBridge(html, artifactId, {
        assetBase,
        artifactPath,
      }), {
        status: 200,
        headers,
      });
    }

    // Do not forward the upstream Content-Length: fetch may transparently
    // decompress a Blob response, so that length may no longer match the stream.
    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[labs-runtime] artifact delivery failed:", {
      slug,
      artifactId,
      path: artifactPath,
      message: String(error?.message || "Unknown error").slice(0, 300),
    });
    return safeError(502, "The published experiment runtime is temporarily unavailable.");
  }
}
