# Labs Media Pipeline — Phase 1

**Status:** The private Cloudinary upload/verification foundation and one optional private `fallback-preview` attachment remain implemented. A separate owner-selected still-image poster promotion is now also committed: a ready JPEG/PNG/WebP/AVIF image is verified server-side, copied to public Vercel Blob, and bound to the exact current published artifact/version. This poster is public by explicit owner action; it is not the runtime fallback and is not automatically captured. Full build, Atlas/provider checks, authenticated browser QA and a new Preview deployment are pending. Public runtime-fallback delivery, detail-gallery role migration and automatic screenshot generation remain gated.

## Included in the implemented public gallery poster slice

This is separate from the private fallback-upload phase above and is not a general promotion of all media assets.

- Owner-only mutation: `PUT /api/v1/admin/labs/experiments/:slug/media/gallery-preview`.
- Promotion requires a published custom experiment and a ready published immutable artifact/version.
- Only experiment-owned, owner-owned, ready authenticated Cloudinary image resources in JPEG/JPG, PNG, WebP or AVIF are accepted. GIF and video are excluded.
- Maximum source image size is 5 MB.
- The server re-verifies the Cloudinary resource, fetches through a short-lived private URL with redirects disabled, validates the downloaded signature and byte size, then writes a unique public Vercel Blob object.
- MongoDB stores the public poster URL and exact `artifactId` + `sourceVersionId`; the public DTO exposes it only when both match the current published source.
- The Studio explicitly labels the poster public and requires owner action. It supplies alt text. Do not place confidential or personal images in this field.
- Replacing/removing a poster, publishing another artifact, unpublishing, and deleting an experiment attempt public Blob cleanup. Provider cleanup failures do not restore a public DTO pointer; they may leave an orphan requiring reconciliation.
- This implementation does not capture the preview automatically. Automatic screenshot capture from a successfully rendered immutable artifact remains a separate future phase.

Required configuration reuses `BLOB_READ_WRITE_TOKEN` already needed by the immutable artifact pipeline. The public gallery poster is delivered by Vercel Blob; the Cloudinary authenticated asset remains private and the private preview URL is never serialized into public data.

## Included in this phase

- \`LabMediaAsset\` model in the \`lab_media_assets\` collection.
- Owner-only media inventory endpoint: \`GET /api/v1/admin/labs/experiments/:slug/media\`.
- Owner-only signed upload-intent endpoint: \`POST /api/v1/admin/labs/experiments/:slug/media/upload-intent\`.
- Owner-only upload-finalization endpoint: \`POST /api/v1/admin/labs/experiments/:slug/media/finalize\`.
- Browser uploads directly to Cloudinary using server-generated signatures. The API secret remains server-side.
- Image/GIF uploads use Cloudinary's image resource type. MP4/WebM use its video resource type.
- Upload parameters include a fixed experiment-prefixed public ID, an approved-format allowlist, an authenticated delivery type and a configured signed upload preset.
- The server verifies that the configured upload preset is in signed mode through the Cloudinary Admin API.
- The server does not trust the browser upload response as proof of completion. It fetches the exact Cloudinary resource through the Admin API and verifies public ID, resource type, authenticated delivery type, actual format and byte size before marking the asset ready.
- Only ready assets belonging to the current experiment and owner are returned by the owner media inventory.
- Every upload intent and successful finalize action is written to the Labs owner audit timeline.
- Binary media is stored at Cloudinary. MongoDB stores only verified metadata and private references.
- The owner media inventory returns short-lived private preview URLs; these are not public and are not included in public DTOs.
- An owner may attach at most one asset with the `fallback-preview` role. This is optional and never replaces a successfully running code preview.

## Required Cloudinary environment configuration

Provide the existing Cloudinary credentials server-side:

- \`CLOUDINARY_CLOUD_NAME\`
- \`CLOUDINARY_API_KEY\`
- \`CLOUDINARY_API_SECRET\`

Configure two **signed** upload presets in the same Cloudinary product environment and set:

- \`CLOUDINARY_LABS_IMAGE_UPLOAD_PRESET\`
- \`CLOUDINARY_LABS_VIDEO_UPLOAD_PRESET\`

The image preset must allow only JPEG/JPG, PNG, WebP, AVIF and GIF. The video preset must allow only MP4 and WebM. The application also signs \`allowed_formats\`, \`public_id\`, \`type=authenticated\`, \`overwrite=false\` and the selected preset so the browser must submit the exact server-approved values.

The preset mode must be signed, not unsigned. Cloudinary documents that signed browser uploads must be signed on the backend, the API secret must never be exposed to the client, and signed parameters take precedence over matching preset parameters. Cloudinary signatures have a one-hour validity window; the application upload intent expires sooner (15 minutes). <https://cloudinary.com/documentation/upload_presets> <https://cloudinary.com/documentation/admin_api>

Required:

- \`LABS_MEDIA_MAX_UPLOAD_BYTES\` — application preflight and post-upload size ceiling in bytes. Set this only after confirming the desired limit from the actual Cloudinary account plan and product needs. The upload API preset itself does not provide a per-preset file-size limit. Cloudinary account Usage Limits remain an independent provider-side limit.

## Explicitly not included yet

- Public runtime-fallback delivery conversion at publish time and binding that optional fallback to an immutable release manifest.
- Public runtime fallback behavior for failed/unsupported code previews.
- Detail-gallery media role migration and public delivery.
- Automatic capture of a still poster from the successful isolated preview.
- Full orphan reconciliation/cleanup jobs for provider objects if a best-effort delete fails.
- Optional fallback-video poster generation.
- Chunked/resumable video transfer.

These remain separate release phases. Until public fallback delivery is verified, uploaded runtime-fallback assets stay private. The single optional fallback is considered only when code preview cannot run or is unsupported; it never replaces a working code preview. The public gallery poster flow described above is a separate explicit owner promotion of one static still image.

## Validation still required

- Configure the two signed presets and the byte ceiling in the actual Preview environment.
- Test one file for every allowed image/GIF/video format and verify the resulting resource type, delivery type, format and byte metadata.
- Test a wrong preset, unsigned preset, wrong experiment slug, wrong owner, expired intent, unsupported format, altered public ID and duplicate finalize request.
- Verify the Cloudinary product environment's authenticated delivery behavior and confirm that unauthenticated public URLs cannot fetch draft assets.
- Review actual upload quotas and choose \`LABS_MEDIA_MAX_UPLOAD_BYTES\`.
- Complete integration lint/build and authenticated browser QA before treating the deployed flow as ready.
