import "server-only";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import LabBuildArtifact from "@/app/lib/labs/models/LabBuildArtifact";
import LabExperiment from "@/app/lib/labs/models/LabExperiment";
import LabSource from "@/app/lib/labs/models/LabSource";

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
      const root = document.getElementById("root");
      const rendered = root
        ? root.children.length > 0 || Boolean(root.textContent.trim())
        : Array.from(document.body?.children || []).some((element) =>
            !["SCRIPT", "STYLE", "LINK"].includes(element.tagName)
          );

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

function injectRuntimeBridge(html, artifactId) {
  const bridge = createRuntimeBridge(artifactId);
  const headMatch = /<head\b[^>]*>/i.exec(html);

  if (headMatch) {
    const insertAt = headMatch.index + headMatch[0].length;
    return html.slice(0, insertAt) + bridge + html.slice(insertAt);
  }

  const bodyMatch = /<body\b/i.exec(html);
  if (bodyMatch) {
    return html.slice(0, bodyMatch.index) + bridge + html.slice(bodyMatch.index);
  }

  return bridge + html;
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
      [
        "default-src 'none'",
        `script-src 'unsafe-inline' ${assetBase}`,
        `style-src 'unsafe-inline' ${assetBase}`,
        `img-src ${assetBase} data: blob:`,
        `font-src ${assetBase} data:`,
        `media-src ${assetBase} data: blob:`,
        "connect-src 'none'",
        "worker-src 'none'",
        "frame-src 'none'",
        "object-src 'none'",
        "form-action 'none'",
        "base-uri 'none'",
        `frame-ancestors ${origin}`,
      ].join("; "),
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

  const artifactPath = getSafeArtifactPath(pathSegments);
  if (!artifactPath) return safeError(404, "Runtime asset not found.");

  const extension = artifactPath.slice(artifactPath.lastIndexOf(".")).toLowerCase();
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

    const outputFile = (artifact.outputFiles || []).find(
      (file) => file.path === artifactPath,
    );
    if (!outputFile || typeof outputFile.url !== "string") {
      return safeError(404, "Runtime asset not found.");
    }

    let blobUrl;
    try {
      blobUrl = new URL(outputFile.url);
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

      return new Response(injectRuntimeBridge(html, artifactId), {
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
