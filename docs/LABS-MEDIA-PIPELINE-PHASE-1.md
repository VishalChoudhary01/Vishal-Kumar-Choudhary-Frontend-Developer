# Labs Media Pipeline — Phase 1

**Status:** Implemented in the integration branch as an owner-only Cloudinary upload and verification foundation. Media attachment, preview delivery, gallery/cover selection and release publication remain follow-up work.

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
- Draft asset delivery URLs are not returned by the media library API.

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

- Public or owner preview URL generation for authenticated assets.
- Attach an asset to card cover, detail gallery or experiment code.
- Reorder gallery media or set alt text/captions through the UI.
- Immutable per-version asset manifests.
- Asset deletion/cleanup and orphan reconciliation.
- Public media delivery conversion at publish time.
- Video poster generation and gallery rendering.
- Chunked/resumable video transfer.

These remain part of the media attachment and immutable release phase. Until that work is complete, an uploaded asset is stored as private/authenticated media and is not included in public pages or runtime bundles.

## Validation still required

- Configure the two signed presets and the byte ceiling in the actual Preview environment.
- Test one file for every allowed image/GIF/video format and verify the resulting resource type, delivery type, format and byte metadata.
- Test a wrong preset, unsigned preset, wrong experiment slug, wrong owner, expired intent, unsupported format, altered public ID and duplicate finalize request.
- Verify the Cloudinary product environment's authenticated delivery behavior and confirm that unauthenticated public URLs cannot fetch draft assets.
- Review actual upload quotas and choose \`LABS_MEDIA_MAX_UPLOAD_BYTES\`.
- Complete integration lint/build and authenticated browser QA before treating the deployed flow as ready.
