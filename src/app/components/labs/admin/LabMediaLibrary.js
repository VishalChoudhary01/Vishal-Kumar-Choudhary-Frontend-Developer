"use client";

import { useCallback, useEffect, useState } from "react";
import { Film, Image as ImageIcon, LoaderCircle, RefreshCw, UploadCloud } from "lucide-react";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm";
const IMAGE_FORMATS = new Set(["jpg", "jpeg", "png", "webp", "avif", "gif"]);
const VIDEO_FORMATS = new Set(["mp4", "webm"]);

function formatBytes(value) {
  const bytes = Number(value || 0);
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getMediaKind(file) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (IMAGE_FORMATS.has(extension)) return "image";
  if (VIDEO_FORMATS.has(extension)) return "video";
  return "";
}

async function readJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.error?.code || "The media request failed.");
  }
  return payload.data;
}

export default function LabMediaLibrary({ slug }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const endpoint = "/api/v1/admin/labs/experiments/" + encodeURIComponent(slug) + "/media";

  const loadAssets = useCallback(async () => {
    const response = await fetch(endpoint, {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
    const data = await readJson(response);
    setAssets(Array.isArray(data) ? data : []);
  }, [endpoint]);

  useEffect(() => {
    let active = true;
    fetch(endpoint, {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    })
      .then(readJson)
      .then((data) => {
        if (active) setAssets(Array.isArray(data) ? data : []);
      })
      .catch((reason) => {
        if (active) setError(reason.message || "The media library is unavailable.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [endpoint]);

  async function uploadOne(file, index, total) {
    const mediaKind = getMediaKind(file);
    if (!mediaKind) {
      throw new Error(file.name + ": choose JPEG, PNG, WebP, AVIF, GIF, MP4 or WebM.");
    }
    if (!file.size) throw new Error(file.name + ": this file is empty.");

    setProgressLabel("Preparing " + file.name + " (" + index + "/" + total + ")");
    const intentResponse = await fetch(endpoint + "/upload-intent", {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        mediaKind,
        originalFilename: file.name,
        byteSize: file.size,
      }),
    });
    const intent = await readJson(intentResponse);

    setProgressLabel("Uploading " + file.name + " to Cloudinary");
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", intent.apiKey);
    form.append("timestamp", String(intent.timestamp));
    form.append("signature", intent.signature);
    form.append("upload_preset", intent.uploadPreset);
    form.append("public_id", intent.publicId);
    form.append("allowed_formats", intent.allowedFormats);
    form.append("type", intent.deliveryType);
    form.append("overwrite", "false");

    const cloudinaryResponse = await fetch(intent.uploadUrl, {
      method: "POST",
      body: form,
      credentials: "omit",
      cache: "no-store",
    });
    const cloudinaryPayload = await cloudinaryResponse.json().catch(() => ({}));
    if (!cloudinaryResponse.ok) {
      throw new Error(
        cloudinaryPayload?.error?.message ||
        "Cloudinary rejected " + file.name + ". Check the signed Labs upload presets.",
      );
    }

    setProgressLabel("Verifying " + file.name);
    const finalizeResponse = await fetch(endpoint + "/finalize", {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ uploadIntentId: intent.uploadIntentId }),
    });
    await readJson(finalizeResponse);
  }

  async function handleFiles(event) {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (!selected.length || busy) return;

    setBusy(true);
    setError("");
    setMessage("");
    let uploaded = 0;
    try {
      for (let index = 0; index < selected.length; index += 1) {
        await uploadOne(selected[index], index + 1, selected.length);
        uploaded += 1;
      }
      await loadAssets();
      setMessage(uploaded + (uploaded === 1 ? " media asset uploaded." : " media assets uploaded.") +
        " Assets remain private until attached to a published experiment release.");
    } catch (reason) {
      try {
        await loadAssets();
      } catch {
        // Preserve the upload error; a later refresh can recover the library list.
      }
      setError(reason.message || "The media upload could not be completed.");
    } finally {
      setBusy(false);
      setProgressLabel("");
    }
  }

  return (
    <section aria-labelledby="labs-media-library-title" className="mt-8 border border-border bg-surface-1 p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">EXPERIMENT MEDIA</p>
          <h2 id="labs-media-library-title" className="mt-1 text-base font-semibold">Media library</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-text-tertiary">
            Upload images, animated GIFs and video clips for this experiment. Uploaded files are private assets; cover, gallery and runtime attachment controls are part of the release phase.
          </p>
        </div>
        <label className={[
          "inline-flex h-9 cursor-pointer items-center gap-2 border border-brand px-3 text-xs font-semibold text-brand hover:bg-brand-soft",
          busy ? "pointer-events-none opacity-50" : "",
        ].join(" ")}>
          {busy ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <UploadCloud size={14} aria-hidden="true" />}
          {busy ? "Uploading…" : "Upload media"}
          <input
            type="file"
            accept={ACCEPT}
            multiple
            disabled={busy}
            onChange={handleFiles}
            className="sr-only"
            aria-label="Upload images, GIFs or videos"
          />
        </label>
      </header>

      {progressLabel ? <p role="status" className="mt-3 text-xs text-text-secondary">{progressLabel}</p> : null}
      {message ? <p role="status" className="mt-3 border border-brand/30 bg-brand-soft/30 px-3 py-2 text-xs text-brand">{message}</p> : null}
      {error ? <p role="alert" className="mt-3 border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">{error}</p> : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <p className="text-[11px] text-text-tertiary">{assets.length} ready assets</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setError("");
            loadAssets().catch((reason) => setError(reason.message || "Could not refresh media.")).finally(() => setLoading(false));
          }}
          disabled={loading || busy}
          className="inline-flex h-8 items-center gap-1.5 border border-border px-2.5 text-[11px] text-text-secondary hover:border-brand hover:text-brand disabled:opacity-40"
        >
          <RefreshCw size={12} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-20 items-center justify-center gap-2 text-xs text-text-tertiary">
          <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
          Loading media…
        </div>
      ) : assets.length ? (
        <ul className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => (
            <li key={asset.id} className="flex min-w-0 items-start gap-3 border border-border bg-background p-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center border border-border bg-surface-1 text-text-tertiary">
                {asset.mediaKind === "video" ? <Film size={16} aria-hidden="true" /> : <ImageIcon size={16} aria-hidden="true" />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold" title={asset.originalFilename}>{asset.originalFilename}</p>
                <p className="mt-1 text-[10px] text-text-tertiary">
                  {String(asset.format || "").toUpperCase()} · {formatBytes(asset.byteSize)}
                  {asset.width && asset.height ? " · " + asset.width + "×" + asset.height : ""}
                  {asset.durationSeconds ? " · " + asset.durationSeconds.toFixed(1) + "s" : ""}
                </p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-brand">Private · Ready</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 border border-dashed border-border px-4 py-7 text-center">
          <UploadCloud size={18} className="mx-auto text-text-tertiary" aria-hidden="true" />
          <p className="mt-2 text-xs font-medium">No media uploaded yet</p>
          <p className="mt-1 text-[10px] text-text-tertiary">Your images, GIFs and videos will appear here.</p>
        </div>
      )}
      <p className="mt-3 text-[10px] leading-5 text-text-tertiary">
        Supported: JPEG, PNG, WebP, AVIF, GIF, MP4 and WebM. SVG and other formats are excluded. Draft preview URLs are not exposed by this library endpoint.
      </p>
    </section>
  );
}
