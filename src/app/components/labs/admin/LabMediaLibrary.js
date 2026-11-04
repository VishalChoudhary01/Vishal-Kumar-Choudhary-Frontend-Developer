"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Film,
  Image as ImageIcon,
  LoaderCircle,
  RefreshCw,
  Save,
  UploadCloud,
} from "lucide-react";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm";
const IMAGE_FORMATS = new Set(["jpg", "jpeg", "png", "webp", "avif", "gif"]);
const VIDEO_FORMATS = new Set(["mp4", "webm"]);
const ROLE_LABELS = {
  "card-cover": "Card cover",
  "detail-gallery": "Detail gallery",
  "in-experiment": "In-experiment asset",
};

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

function safeAssetKey(filename, id) {
  const base = String(filename || "asset")
    .replace(/\\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 42);
  return /^[a-z]/.test(base) ? base : "asset-" + String(id).slice(-6);
}

async function readJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.error?.code || "The media request failed.");
  }
  return payload.data;
}

function toAttachment(asset) {
  return {
    assetId: asset.id,
    roles: Array.isArray(asset.roles) ? asset.roles : [],
    assetKey: asset.assetKey || "",
    position: Number(asset.position || 0),
    altText: asset.altText || "",
    caption: asset.caption || "",
  };
}

export default function LabMediaLibrary({ slug }) {
  const [assets, setAssets] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewErrorIds, setPreviewErrorIds] = useState([]);

  const endpoint = "/api/v1/admin/labs/experiments/" + encodeURIComponent(slug) + "/media";
  const attachmentEndpoint = endpoint + "/attachments";
  const attachmentMap = useMemo(
    () => new Map(attachments.map((item) => [item.assetId, item])),
    [attachments],
  );
  const gallery = useMemo(
    () => attachments
      .filter((item) => item.roles.includes("detail-gallery"))
      .sort((a, b) => a.position - b.position),
    [attachments],
  );

  const applyAssets = useCallback((data) => {
    const nextAssets = Array.isArray(data) ? data : [];
    setAssets(nextAssets);
    setAttachments(nextAssets.filter((asset) => Array.isArray(asset.roles) && asset.roles.length).map(toAttachment));
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
      .then((data) => {
        if (active) applyAssets(data);
      })
      .catch((reason) => {
        if (active) setError(reason.message || "The media library is unavailable.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [applyAssets, endpoint]);

  function toggleRole(asset, role, enabled) {
    setAttachments((current) => {
      let next = current.map((item) => ({ ...item, roles: [...item.roles] }));
      if (role === "card-cover" && enabled) {
        next = next.map((item) => ({
          ...item,
          roles: item.assetId === asset.id ? item.roles : item.roles.filter((value) => value !== role),
        }));
      }
      const currentItem = next.find((item) => item.assetId === asset.id);
      if (enabled) {
        if (!currentItem) {
          next.push({
            assetId: asset.id,
            roles: [role],
            assetKey: role === "in-experiment" ? safeAssetKey(asset.originalFilename, asset.id) : "",
            position: role === "detail-gallery" ? gallery.length : 0,
            altText: asset.altText || "",
            caption: asset.caption || "",
          });
        } else if (!currentItem.roles.includes(role)) {
          currentItem.roles.push(role);
          if (role === "in-experiment" && !currentItem.assetKey) {
            currentItem.assetKey = safeAssetKey(asset.originalFilename, asset.id);
          }
          if (role === "detail-gallery") currentItem.position = gallery.length;
        }
      } else if (currentItem) {
        currentItem.roles = currentItem.roles.filter((value) => value !== role);
        if (!currentItem.roles.length) next = next.filter((item) => item.assetId !== asset.id);
      }
      return next;
    });
    setMessage("");
    setError("");
  }

  function updateAttachment(assetId, patch) {
    setAttachments((current) => current.map((item) =>
      item.assetId === assetId ? { ...item, ...patch } : item,
    ));
  }

  function moveGallery(assetId, direction) {
    const ordered = gallery.map((item) => ({ ...item }));
    const index = ordered.findIndex((item) => item.assetId === assetId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    const positions = new Map(ordered.map((item, position) => [item.assetId, position]));
    setAttachments((current) => current.map((item) => positions.has(item.assetId)
      ? { ...item, position: positions.get(item.assetId) }
      : item));
  }

  async function saveAttachments() {
    setSaving(true);
    setError("");
    setMessage("");
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
      setMessage("Media roles and attachment order saved to the experiment draft. Nothing was published.");
    } catch (reason) {
      setError(reason.message || "Media attachments could not be saved.");
    } finally {
      setSaving(false);
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
      setMessage(uploaded + (uploaded === 1 ? " media asset uploaded." : " media assets uploaded.") + " Select its roles and save the attachment list when ready.");
    } catch (reason) {
      try { await loadAssets(); } catch { /* Preserve the upload failure. */ }
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
          <h2 id="labs-media-library-title" className="mt-1 text-base font-semibold">Media library and attachments</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-text-tertiary">Preview private uploads, then assign each asset to the Labs card cover, detail gallery or React/HTML runtime asset manifest.</p>
        </div>
        <label className={[
          "inline-flex h-9 cursor-pointer items-center gap-2 border border-brand px-3 text-xs font-semibold text-brand hover:bg-brand-soft",
          busy || saving ? "pointer-events-none opacity-50" : "",
        ].join(" ")}>
          {busy ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <UploadCloud size={14} aria-hidden="true" />}
          {busy ? "Uploading…" : "Upload media"}
          <input type="file" accept={ACCEPT} multiple disabled={busy || saving} onChange={handleFiles} className="sr-only" aria-label="Upload images, GIFs or videos" />
        </label>
      </header>

      {progressLabel ? <p role="status" className="mt-3 text-xs text-text-secondary">{progressLabel}</p> : null}
      {message ? <p role="status" className="mt-3 border border-brand/30 bg-brand-soft/30 px-3 py-2 text-xs text-brand">{message}</p> : null}
      {error ? <p role="alert" className="mt-3 border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">{error}</p> : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <p className="text-[11px] text-text-tertiary">{assets.length} ready assets · {attachments.length} attached</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => { setLoading(true); setError(""); loadAssets().catch((reason) => setError(reason.message || "Could not refresh media.")).finally(() => setLoading(false)); }} disabled={loading || busy || saving} className="inline-flex h-8 items-center gap-1.5 border border-border px-2.5 text-[11px] text-text-secondary hover:border-brand hover:text-brand disabled:opacity-40">
            <RefreshCw size={12} aria-hidden="true" /> Refresh previews
          </button>
          <button type="button" onClick={saveAttachments} disabled={saving || busy || loading} className="inline-flex h-8 items-center gap-1.5 bg-brand px-3 text-[11px] font-semibold text-brand-contrast hover:bg-brand-hover disabled:opacity-40">
            {saving ? <LoaderCircle size={12} className="animate-spin" aria-hidden="true" /> : <Save size={12} aria-hidden="true" />}
            {saving ? "Saving…" : "Save attachments"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-20 items-center justify-center gap-2 text-xs text-text-tertiary"><LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> Loading media…</div>
      ) : assets.length ? (
        <ul className="mt-3 grid gap-3 lg:grid-cols-2">
          {assets.map((asset) => {
            const attachment = attachmentMap.get(asset.id);
            const roles = attachment?.roles || [];
            const galleryIndex = gallery.findIndex((item) => item.assetId === asset.id);
            const previewUnavailable = !asset.previewUrl || previewErrorIds.includes(asset.id);
            return (
              <li key={asset.id} className="min-w-0 border border-border bg-background">
                <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 p-3">
                  <div className="grid aspect-[4/3] place-items-center overflow-hidden border border-border bg-surface-1">
                    {previewUnavailable ? (
                      <div className="flex flex-col items-center gap-1 text-text-tertiary"><ImageIcon size={18} aria-hidden="true" /><span className="text-[9px]">Preview unavailable</span></div>
                    ) : asset.mediaKind === "video" ? (
                      <video key={asset.previewUrl} src={asset.previewUrl} controls muted playsInline preload="metadata" className="h-full w-full object-contain" onError={() => setPreviewErrorIds((current) => current.includes(asset.id) ? current : [...current, asset.id])} />
                    ) : (
                      <img key={asset.previewUrl} src={asset.previewUrl} alt={attachment?.altText || asset.originalFilename} loading="lazy" className="h-full w-full object-contain" onError={() => setPreviewErrorIds((current) => current.includes(asset.id) ? current : [...current, asset.id])} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold" title={asset.originalFilename}>{asset.originalFilename}</p>
                    <p className="mt-1 text-[10px] text-text-tertiary">{String(asset.format || "").toUpperCase()} · {formatBytes(asset.byteSize)}{asset.width && asset.height ? " · " + asset.width + "×" + asset.height : ""}{asset.durationSeconds ? " · " + asset.durationSeconds.toFixed(1) + "s" : ""}</p>
                    <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-brand">Private · Ready</p>
                    {roles.length ? <p className="mt-1 text-[10px] text-text-secondary">{roles.map((role) => ROLE_LABELS[role]).join(" · ")}</p> : <p className="mt-1 text-[10px] text-text-tertiary">Not attached</p>}
                  </div>
                </div>

                <div className="border-t border-border px-3 py-3">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <label className="flex items-start gap-2 text-[11px] text-text-secondary">
                      <input type="radio" name="labs-card-cover" checked={roles.includes("card-cover")} onChange={(event) => toggleRole(asset, "card-cover", event.target.checked)} className="mt-0.5 accent-[var(--brand)]" />
                      <span>Card cover</span>
                    </label>
                    <label className="flex items-start gap-2 text-[11px] text-text-secondary">
                      <input type="checkbox" checked={roles.includes("detail-gallery")} onChange={(event) => toggleRole(asset, "detail-gallery", event.target.checked)} className="mt-0.5 accent-[var(--brand)]" />
                      <span>Detail gallery</span>
                    </label>
                    <label className="flex items-start gap-2 text-[11px] text-text-secondary">
                      <input type="checkbox" checked={roles.includes("in-experiment")} onChange={(event) => toggleRole(asset, "in-experiment", event.target.checked)} className="mt-0.5 accent-[var(--brand)]" />
                      <span>Runtime asset</span>
                    </label>
                  </div>

                  {roles.length ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <label className="text-[10px] font-medium text-text-tertiary">Alt text
                        <input value={attachment?.altText || ""} onChange={(event) => updateAttachment(asset.id, { altText: event.target.value })} maxLength={300} placeholder="Describe the visual content" className="mt-1 h-8 w-full border border-border bg-surface-1 px-2 text-[11px] text-text-primary outline-none focus:border-brand" />
                      </label>
                      <label className="text-[10px] font-medium text-text-tertiary">Caption
                        <input value={attachment?.caption || ""} onChange={(event) => updateAttachment(asset.id, { caption: event.target.value })} maxLength={500} placeholder="Optional caption" className="mt-1 h-8 w-full border border-border bg-surface-1 px-2 text-[11px] text-text-primary outline-none focus:border-brand" />
                      </label>
                    </div>
                  ) : null}

                  {roles.includes("in-experiment") ? (
                    <label className="mt-3 block text-[10px] font-medium text-text-tertiary">Runtime asset key
                      <input value={attachment?.assetKey || ""} onChange={(event) => updateAttachment(asset.id, { assetKey: event.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, "-") })} maxLength={64} placeholder="hero-image" className="mt-1 h-8 w-full border border-border bg-surface-1 px-2 font-mono text-[11px] text-text-primary outline-none focus:border-brand" />
                      <span className="mt-1 block font-normal">Available to the compiler as <code>@labs/assets</code> after the isolated compiler phase is enabled.</span>
                    </label>
                  ) : null}

                  {roles.includes("detail-gallery") ? (
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
                      <span className="text-[10px] text-text-tertiary">Gallery position {galleryIndex + 1} of {gallery.length}</span>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => moveGallery(asset.id, -1)} disabled={galleryIndex <= 0} aria-label="Move gallery item up" className="grid h-7 w-7 place-items-center border border-border text-text-secondary hover:border-brand disabled:opacity-30"><ArrowUp size={12} /></button>
                        <button type="button" onClick={() => moveGallery(asset.id, 1)} disabled={galleryIndex === gallery.length - 1} aria-label="Move gallery item down" className="grid h-7 w-7 place-items-center border border-border text-text-secondary hover:border-brand disabled:opacity-30"><ArrowDown size={12} /></button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-2 border border-dashed border-border px-4 py-7 text-center"><UploadCloud size={18} className="mx-auto text-text-tertiary" aria-hidden="true" /><p className="mt-2 text-xs font-medium">No media uploaded yet</p><p className="mt-1 text-[10px] text-text-tertiary">Your images, GIFs and videos will appear here.</p></div>
      )}
      <p className="mt-3 text-[10px] leading-5 text-text-tertiary">Private preview links expire after five minutes; refresh them when they stop loading. Saving roles updates the private experiment metadata only. It does not publish media or change the public Labs listing.</p>
    </section>
  );
}
