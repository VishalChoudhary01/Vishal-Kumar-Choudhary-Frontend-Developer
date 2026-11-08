"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useActionToast } from "@/app/providers/ActionToastProvider";
import { Image as ImageIcon, LoaderCircle, RefreshCw, Save, UploadCloud } from "lucide-react";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm";
const IMAGE_FORMATS = new Set(["jpg", "jpeg", "png", "webp", "avif", "gif"]);
const VIDEO_FORMATS = new Set(["mp4", "webm"]);
const FALLBACK_ROLE = "fallback-preview";

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
  if (!response.ok) throw new Error(payload?.error?.message || payload?.error?.code || "The media request failed.");
  return payload.data;
}

export default function LabMediaLibrary({ slug }) {
  const { showToast } = useActionToast();
  const [assets, setAssets] = useState([]);
  const [releasePoster, setReleasePoster] = useState(null);
  const [posterPreviewFailed, setPosterPreviewFailed] = useState(false);
  const [selectedFallbackId, setSelectedFallbackId] = useState(null);
  const [fallbackText, setFallbackText] = useState({ altText: "", caption: "" });
  const [selectedGalleryPreviewId, setSelectedGalleryPreviewId] = useState(null);
  const [galleryPreviewAlt, setGalleryPreviewAlt] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingGalleryPreview, setSavingGalleryPreview] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewErrorIds, setPreviewErrorIds] = useState([]);

  const endpoint = "/api/v1/admin/labs/experiments/" + encodeURIComponent(slug) + "/media";
  const attachmentEndpoint = endpoint + "/attachments";
  const selectedFallback = useMemo(
    () => assets.find((asset) => asset.id === selectedFallbackId) || null,
    [assets, selectedFallbackId],
  );

  const applyAssets = useCallback((data) => {
    const nextAssets = Array.isArray(data) ? data : Array.isArray(data?.assets) ? data.assets : [];
    setAssets(nextAssets);
    if (!Array.isArray(data) && Object.prototype.hasOwnProperty.call(data || {}, "releasePoster")) {
      setReleasePoster(data.releasePoster || null);
      setPosterPreviewFailed(false);
    }
    const selected = nextAssets.find((asset) => Array.isArray(asset.roles) && asset.roles.includes(FALLBACK_ROLE));
    setSelectedFallbackId(selected?.id || null);
    setFallbackText({ altText: selected?.altText || "", caption: selected?.caption || "" });
    const gallerySelection = nextAssets.find((asset) => asset.isGalleryPreview);
    setSelectedGalleryPreviewId(gallerySelection?.id || null);
    setGalleryPreviewAlt(gallerySelection?.isGalleryPreview ? gallerySelection.galleryPreviewAlt || "" : "");
    setPreviewErrorIds([]);
  }, []);

  const loadAssets = useCallback(async () => {
    const response = await fetch(endpoint, {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
    applyAssets(await readJson(response));
  }, [applyAssets, endpoint]);

  useEffect(() => {
    let active = true;
    fetch(endpoint, {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    })
      .then(readJson)
      .then((data) => { if (active) applyAssets(data); })
      .catch((reason) => { if (active) setError(reason.message || "The media library is unavailable."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applyAssets, endpoint]);

  function chooseFallback(assetId) {
    setSelectedFallbackId((current) => current === assetId ? null : assetId);
    const asset = assets.find((item) => item.id === assetId);
    setFallbackText({ altText: asset?.altText || "", caption: asset?.caption || "" });
    setMessage("");
    setError("");
  }

  async function saveFallback() {
    setSaving(true);
    setError("");
    setMessage("");
    const attachments = selectedFallbackId ? [{
      assetId: selectedFallbackId,
      roles: [FALLBACK_ROLE],
      altText: fallbackText.altText,
      caption: fallbackText.caption,
    }] : [];
    try {
      const response = await fetch(attachmentEndpoint, {
        method: "PUT",
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ attachments }),
      });
      const data = await readJson(response);
      applyAssets(data.assets);
      setMessage(attachments.length
        ? "Fallback saved. A working code preview remains the primary experience."
        : "Fallback removed. The experiment will use its code preview only.");
    } catch (reason) {
      setError(reason.message || "Fallback preview could not be saved.");
      showToast("error", reason.message || "Fallback preview could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function saveGalleryPreview(assetId = selectedGalleryPreviewId) {
    if (savingGalleryPreview || busy || saving) return;

    setSavingGalleryPreview(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(endpoint + "/gallery-preview", {
        method: "PUT",
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          altText: galleryPreviewAlt,
          fit: "contain",
        }),
      });
      const data = await readJson(response);
      await loadAssets();
      if (data?.cleanupPending) {
        setMessage(assetId
          ? "The new public media is active. Cleanup of the previous public asset is still pending."
          : "The uploaded media is no longer shown in the gallery, but provider cleanup is still pending.");
        showToast("info", "Gallery media saved; old asset cleanup is pending.");
      } else {
        setMessage(assetId
          ? "Public gallery media saved for the exact published build. A later published version invalidates this uploaded media selection; re-publish an upload if you want it on the new version."
          : "Public gallery media removed.");
        showToast("success", assetId ? "Gallery media published." : "Uploaded gallery media removed.");
      }
    } catch (reason) {
      setError(reason.message || "The public gallery poster could not be saved.");
      showToast("error", reason.message || "The public gallery poster could not be saved.");
    } finally {
      setSavingGalleryPreview(false);
    }
  }

  async function uploadOne(file, index, total) {
    const mediaKind = getMediaKind(file);
    if (!mediaKind) throw new Error(file.name + ": choose JPEG, PNG, WebP, AVIF, GIF, MP4 or WebM.");
    if (!file.size) throw new Error(file.name + ": this file is empty.");

    setProgressLabel("Preparing " + file.name + " (" + index + "/" + total + ")");
    const intentResponse = await fetch(endpoint + "/upload-intent", {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ mediaKind, originalFilename: file.name, byteSize: file.size }),
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
      throw new Error(cloudinaryPayload?.error?.message || "Cloudinary rejected " + file.name + ". Check the signed Labs upload presets.");
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
    if (!selected.length || busy || saving) return;
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
      setMessage(uploaded + (uploaded === 1 ? " media asset uploaded." : " media assets uploaded.") + " Choose a private fallback separately, or publish one uploaded asset as the public gallery/detail visual.");
      showToast("success", uploaded + (uploaded === 1 ? " fallback media asset uploaded." : " fallback media assets uploaded."));
    } catch (reason) {
      try { await loadAssets(); } catch { /* Keep the original upload error. */ }
      setError(reason.message || "The media upload could not be completed.");
      showToast("error", reason.message || "The media upload could not be completed.");
    } finally {
      setBusy(false);
      setProgressLabel("");
    }
  }

  return (
    <section aria-labelledby="labs-media-library-title" className="mt-8 border border-border bg-surface-1 p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">OPTIONAL EXPERIMENT MEDIA</p>
          <h2 id="labs-media-library-title" className="mt-1 text-base font-semibold">Gallery and fallback media</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-text-tertiary">
            The interactive code preview remains the main experiment. Uploads stay private until you explicitly publish one as gallery media. A published image, GIF or video replaces the automatically generated screenshot; without a published upload, the screenshot from the exact released code is used.
          </p>
        </div>
        <label className={[
          "inline-flex h-9 cursor-pointer items-center gap-2 border border-brand px-3 text-xs font-semibold text-brand hover:bg-brand-soft",
          busy || saving ? "pointer-events-none opacity-50" : "",
        ].join(" ")}>
          {busy ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <UploadCloud size={14} aria-hidden="true" />}
          {busy ? "Uploading…" : "Upload fallback media"}
          <input type="file" accept={ACCEPT} multiple disabled={busy || saving || savingGalleryPreview} onChange={handleFiles} className="sr-only" aria-label="Upload optional fallback images, GIFs or videos" />
        </label>
      </header>

      {progressLabel ? <p role="status" className="mt-3 text-xs text-text-secondary">{progressLabel}</p> : null}
      {message ? <p role="status" className="mt-3 border border-brand/30 bg-brand-soft/30 px-3 py-2 text-xs text-brand">{message}</p> : null}
      {error ? <p role="alert" className="mt-3 border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">{error}</p> : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <p className="text-[11px] text-text-tertiary">{assets.length} private assets · {selectedFallback ? "1 fallback selected" : "No fallback selected"}</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => { setLoading(true); setError(""); loadAssets().catch((reason) => setError(reason.message || "Could not refresh media.")).finally(() => setLoading(false)); }} disabled={loading || busy || saving} className="inline-flex h-8 items-center gap-1.5 border border-border px-2.5 text-[11px] text-text-secondary hover:border-brand hover:text-brand disabled:opacity-40">
            <RefreshCw size={12} aria-hidden="true" /> Refresh previews
          </button>
          <button type="button" onClick={saveFallback} disabled={saving || busy || loading} className="inline-flex h-8 items-center gap-1.5 bg-brand px-3 text-[11px] font-semibold text-brand-contrast hover:bg-brand-hover disabled:opacity-40">
            {saving ? <LoaderCircle size={12} className="animate-spin" aria-hidden="true" /> : <Save size={12} aria-hidden="true" />}
            {saving ? "Saving…" : "Save fallback"}
          </button>
        </div>
      </div>

      <section aria-labelledby="labs-generated-poster-title" className="mt-4 border border-border bg-background p-3 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id="labs-generated-poster-title" className="text-xs font-semibold">Automatic screenshot</h3>
            <p className="mt-1 max-w-2xl text-[10px] leading-5 text-text-tertiary">
              Captured from the exact published build during release. This preview is automatic and does not require an upload or gallery-media promotion.
            </p>
          </div>
          <span className={[
            "border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em]",
            releasePoster?.status === "ready"
              ? "border-brand/30 bg-brand-soft/20 text-brand"
              : "border-border text-text-tertiary",
          ].join(" ")}>
            {releasePoster?.status === "ready" ? "Generated" : releasePoster?.status === "unavailable" || releasePoster?.status === "invalid" ? "Needs attention" : "Release status"}
          </span>
        </div>

        {releasePoster?.status === "ready" && releasePoster.previewUrl && !posterPreviewFailed ? (
          <div className="mt-3 overflow-hidden border border-border bg-surface-1">
            <img
              key={releasePoster.artifactId + ":" + releasePoster.previewUrl}
              src={releasePoster.previewUrl}
              alt="Automatically generated screenshot of the current published experiment"
              loading="lazy"
              className="block aspect-[4/3] w-full object-cover"
              onError={() => setPosterPreviewFailed(true)}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2">
              <span className="text-[10px] text-text-secondary">
                {releasePoster.width} × {releasePoster.height} · {formatBytes(releasePoster.byteSize)}
              </span>
              <span className="font-mono text-[9px] text-text-tertiary">
                {String(releasePoster.artifactId || "").slice(0, 8)} · {String(releasePoster.captureVersion || "capture").replace(/-/g, " ")}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex min-h-24 items-center gap-3 border border-dashed border-border px-4 py-4">
            <ImageIcon size={18} className="shrink-0 text-text-tertiary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-primary">
                {releasePoster?.status === "not_published"
                  ? "No published release yet"
                  : releasePoster?.status === "artifact_missing"
                    ? "Published artifact could not be found"
                    : releasePoster?.status === "not_generated"
                      ? "No screenshot was recorded for this release"
                      : releasePoster?.status === "unavailable"
                        ? "Automatic screenshot capture was unavailable"
                        : releasePoster?.status === "invalid"
                          ? "Screenshot metadata failed validation"
                          : posterPreviewFailed
                            ? "Screenshot could not be loaded"
                            : "Screenshot status unavailable"}
              </p>
              <p className="mt-1 break-words text-[10px] leading-5 text-text-tertiary">
                {releasePoster?.status === "not_published"
                  ? "Build and publish a saved source version to generate its screenshot."
                  : releasePoster?.status === "artifact_missing"
                    ? "The published source points to an artifact that is missing or not ready. Check the release record before publishing again."
                    : releasePoster?.status === "not_generated"
                      ? "This older release has no capture record. Build and publish the current saved version again to generate a screenshot."
                      : releasePoster?.status === "unavailable"
                        ? "Capture did not complete (" + (releasePoster.reasonCode || "capture_failed") + "). The live code release remains available; retry by publishing a new build."
                        : releasePoster?.status === "invalid"
                          ? "The saved poster does not match the approved capture format or renderer version. Publish a fresh build to regenerate it."
                          : posterPreviewFailed
                            ? "The current artifact poster URL returned an error. Refresh this panel after checking the published artifact and screenshot storage."
                            : "Refresh this panel to retrieve the status of the current published artifact."}
              </p>
            </div>
          </div>
        )}
        {releasePoster?.status === "ready" ? (
          <p className="mt-2 break-all text-[9px] leading-4 text-text-tertiary">
            Source version: {releasePoster.sourceVersionId} · Build: {releasePoster.buildHash}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="labs-gallery-poster-title" className="mt-4 border border-border bg-background p-3 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id="labs-gallery-poster-title" className="text-xs font-semibold">Public gallery poster</h3>
            <p className="mt-1 max-w-2xl text-[10px] leading-5 text-text-tertiary">
              Promoting an image, GIF or video copies it from private Cloudinary storage to public Vercel Blob storage. Anyone can view the selected media. It is tied to the exact published build and is hidden automatically after a different source version is published.
            </p>
          </div>
          <span className="border border-info/30 bg-info/5 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-info">
            Public media
          </span>
        </div>
        <label className="mt-3 block max-w-lg text-[10px] font-medium text-text-tertiary">
          Alt text
          <input
            value={galleryPreviewAlt}
            onChange={(event) => setGalleryPreviewAlt(event.target.value)}
            maxLength={300}
            placeholder="Describe the project preview"
            className="mt-1 h-9 w-full border border-border bg-surface-1 px-2 text-xs text-text-primary outline-none focus:border-brand"
          />
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => saveGalleryPreview()}
            disabled={savingGalleryPreview || busy || saving || loading || !selectedGalleryPreviewId}
            className="inline-flex h-8 items-center gap-2 bg-brand px-3 text-[11px] font-semibold text-brand-contrast hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {savingGalleryPreview ? <LoaderCircle size={12} className="animate-spin" aria-hidden="true" /> : <Save size={12} aria-hidden="true" />}
            {savingGalleryPreview ? "Saving…" : "Publish gallery media"}
          </button>
          {assets.some((asset) => asset.isGalleryPreview) ? (
            <button
              type="button"
              onClick={() => saveGalleryPreview(null)}
              disabled={savingGalleryPreview || busy || saving || loading}
              className="inline-flex h-8 items-center border border-border px-3 text-[11px] font-medium text-text-secondary hover:border-warning hover:text-warning disabled:opacity-40"
            >
              Remove public media
            </button>
          ) : null}
          {assets.some((asset) => asset.isGalleryPreview) ? (
            <span className="text-[10px] text-text-tertiary">
              {assets.find((asset) => asset.isGalleryPreview)?.isGalleryPreviewCurrent
                ? "Current uploaded media is visible in the public gallery."
                : "Saved media is stale and not displayed after the latest publish."}
            </span>
          ) : (
            <span className="text-[10px] text-text-tertiary">No uploaded gallery media selected. The automatic screenshot is used when available.</span>
          )}
        </div>
      </section>

      {loading ? (
        <div className="flex min-h-20 items-center justify-center gap-2 text-xs text-text-tertiary"><LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> Loading media…</div>
      ) : assets.length ? (
        <ul className="mt-3 grid gap-3 lg:grid-cols-2">
          {assets.map((asset) => {
            const isSelected = selectedFallbackId === asset.id;
            const unavailable = !asset.previewUrl || previewErrorIds.includes(asset.id);
            return (
              <li key={asset.id} className="min-w-0 border border-border bg-background">
                <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 p-3">
                  <div className="grid aspect-[4/3] place-items-center overflow-hidden border border-border bg-surface-1">
                    {unavailable ? (
                      <div className="flex flex-col items-center gap-1 text-text-tertiary"><ImageIcon size={18} aria-hidden="true" /><span className="text-[9px]">Preview unavailable</span></div>
                    ) : asset.mediaKind === "video" ? (
                      <video key={asset.previewUrl} src={asset.previewUrl} controls muted playsInline preload="metadata" className="h-full w-full object-contain" onError={() => setPreviewErrorIds((current) => current.includes(asset.id) ? current : [...current, asset.id])} />
                    ) : (
                      <img key={asset.previewUrl} src={asset.previewUrl} alt={asset.altText || asset.originalFilename} loading="lazy" className="h-full w-full object-contain" onError={() => setPreviewErrorIds((current) => current.includes(asset.id) ? current : [...current, asset.id])} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold" title={asset.originalFilename}>{asset.originalFilename}</p>
                    <p className="mt-1 text-[10px] text-text-tertiary">{String(asset.format || "").toUpperCase()} · {formatBytes(asset.byteSize)}{asset.width && asset.height ? " · " + asset.width + "×" + asset.height : ""}{asset.durationSeconds ? " · " + asset.durationSeconds.toFixed(1) + "s" : ""}</p>
                    <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-brand">Private · Ready</p>
                    {asset.roles?.includes(FALLBACK_ROLE) ? <p className="mt-1 text-[10px] text-text-secondary">Saved private fallback</p> : <p className="mt-1 text-[10px] text-text-tertiary">Not a fallback</p>}
                    {asset.mediaKind === "image" || asset.mediaKind === "video" ? (
                      <label className="mt-2 flex items-center gap-2 text-[11px] font-medium text-text-secondary">
                        <input
                          type="radio"
                          name="labs-gallery-poster"
                          checked={selectedGalleryPreviewId === asset.id}
                          onChange={() => setSelectedGalleryPreviewId(asset.id)}
                          disabled={busy || saving || savingGalleryPreview}
                          className="accent-[var(--brand)]"
                        />
                        Use as public gallery media
                      </label>
                    ) : null}
                    {asset.isGalleryPreview ? (
                      <p className="mt-1 text-[9px] font-medium text-info">
                        {asset.isGalleryPreviewCurrent ? "Public media · current release" : "Public media · stale release"}
                      </p>
                    ) : null}
                    <label className="mt-3 flex items-center gap-2 text-[11px] font-medium text-text-secondary">
                      <input type="radio" name="labs-fallback-preview" checked={isSelected} onChange={() => chooseFallback(asset.id)} className="accent-[var(--brand)]" />
                      Use only as fallback
                    </label>
                  </div>
                </div>
                {isSelected ? (
                  <div className="grid gap-2 border-t border-border px-3 py-3 sm:grid-cols-2">
                    <label className="text-[10px] font-medium text-text-tertiary">
                      Alt text
                      <input value={fallbackText.altText} onChange={(event) => setFallbackText((current) => ({ ...current, altText: event.target.value }))} maxLength={300} placeholder="Describe the preview" className="mt-1 h-8 w-full border border-border bg-surface-1 px-2 text-[11px] text-text-primary outline-none focus:border-brand" />
                    </label>
                    <label className="text-[10px] font-medium text-text-tertiary">
                      Caption
                      <input value={fallbackText.caption} onChange={(event) => setFallbackText((current) => ({ ...current, caption: event.target.value }))} maxLength={500} placeholder="Optional note" className="mt-1 h-8 w-full border border-border bg-surface-1 px-2 text-[11px] text-text-primary outline-none focus:border-brand" />
                    </label>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-2 border border-dashed border-border px-4 py-7 text-center">
          <UploadCloud size={18} className="mx-auto text-text-tertiary" aria-hidden="true" />
          <p className="mt-2 text-xs font-medium">No fallback media uploaded</p>
          <p className="mt-1 text-[10px] text-text-tertiary">This is expected when the interactive code preview works.</p>
        </div>
      )}
      <p className="mt-3 text-[10px] leading-5 text-text-tertiary">
        Supported upload formats: JPEG, PNG, WebP, AVIF, GIF, MP4 and WebM. Publish a ready upload to show it in the public gallery and detail preview. Uploaded images, GIFs and videos take priority over the automatically generated screenshot; neither replaces the interactive code runtime.
      </p>
    </section>
  );
}
