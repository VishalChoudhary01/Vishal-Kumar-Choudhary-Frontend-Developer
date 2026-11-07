# Data Model Catalogue — MongoDB and Persistence

**Status:** Reverse-engineered model reference from feat/labs-platform-integration.  
**Persistence:** MongoDB via Mongoose for Labs/Portfolio Analytics domain models; Better Auth uses its MongoDB adapter.  
**Connection:** src/app/lib/db/mongoose.js for application Mongoose models; auth/auth.js has its Better Auth Mongo connection setup.

This file describes implemented model declarations. It does not claim that every index has been provisioned in the active Atlas database. Confirm live collection/index state independently before release.

## 1. Domain separation

The database contains distinct domains. Keep these separate even when a dashboard visually links to them.

| Domain | Main collections | What they represent |
|---|---|---|
| Auth | Better Auth-managed user/session/account/verification/rate-limit collections; custom labs_verification_flows and auth_registration_limits | Login identity, session state, email verification and rate limiting |
| Lab experiment metadata | lab_experiments | Custom experiment public metadata, status, attachments and gallery preview |
| Lab source | lab_sources, lab_source_versions, lab_source_audit_events | Current source pointers, immutable source snapshots and owner audit history |
| Lab build/runtime | lab_build_artifacts, lab_preview_runs | Immutable compiler output and temporary preview run metadata |
| Lab media | lab_media_assets | Cloudinary-authenticated uploads attached to experiments |
| Labs engagement | lab_analytics_events, lab_likes, lab_guest_likes | Source/like engagement event history and active like state |
| Portfolio Analytics | portfolio_visits | First-party portfolio page visit lifecycle and attributed metadata |

The public portfolio content itself remains primarily code-owned in src/app/data. It is not yet stored in a general CMS collection.

## 2. Custom Labs models

### 2.1 LabExperiment — lab_experiments

File: src/app/lib/labs/models/LabExperiment.js

Purpose: Custom owner-authored experiment metadata and publication state. It is not the code snapshot store.

Key fields:
- slug: required, unique/indexed, lowercase, max 80, slug regex.
- title: required, trim, max 100.
- description: required, trim, max 500.
- explanation: optional, max 2000.
- category: required enum: Motion & Animation, CSS Experiments, Interface Interactions, Creative Coding.
- technologies: string array, max 8.
- kind: custom (current model enum).
- mediaAttachments: array max one, and role is constrained to fallback-preview. Includes assetId, altText (max300), caption (max500).
- galleryPreview: separate public static gallery art selection. Fields include assetId, src, alt, mediaKind image/video, contentType allowlist, fit cover/contain, width/height, artifactId, sourceVersionId and createdAt.
- status: draft, published or deleting.
- createdBy, updatedBy, publishedAt.

Indexes:
- unique slug via schema.
- status + updatedAt.
- kind + status + publishedAt + _id.
- kind + status + category + publishedAt + _id.

The galleryPreview pointer is explicitly separate from fallback-preview media. Gallery art is static; it is not the interactive runtime itself. The artifactId/sourceVersionId association helps ensure a poster belongs to the release it represents.

### 2.2 LabSource — lab_sources

File: src/app/lib/labs/models/LabSource.js

Purpose: One current source aggregate per experiment slug. It stores working files and pointers to immutable versions.

Fields:
- slug: required unique/indexed.
- version: legacy/current display version string, default "0.0".
- draftVersionId: pointer to selected draft version (nullable).
- publishedVersionId: exact immutable version currently published (nullable).
- publishedArtifactId: build artifact for the published version (nullable).
- nextVersionNumber: monotonically increasing counter, default 1.
- createdBy, updatedBy.
- published boolean.
- files: embedded file list for compatibility/current working snapshot. Each file has path (max180), language (max40), content (max500000); max 40 files.
- timestamps true.

The source aggregate is not the immutable history. Immutable version snapshots are stored separately in LabSourceVersion.

### 2.3 LabSourceVersion — lab_source_versions

File: src/app/lib/labs/models/LabSourceVersion.js

Purpose: Immutable saved source snapshot. Restore creates a new version rather than mutating an old snapshot.

Fields:
- versionId: required unique/indexed.
- sourceId: ObjectId, required/indexed, relates to LabSource.
- experimentSlug: required/indexed.
- versionNumber: required positive number.
- version: display version string.
- files: required 1–40 files; each path max180, language max40, content max500000.
- contentHash: required 64-char SHA-256 hex.
- buildArtifactId and buildHash: nullable pointers to compiler output.
- basedOnVersionId: nullable previous snapshot lineage pointer.
- changeSummary: max500.
- createdBy.
- timestamps record createdAt; updatedAt disabled.

Indexes:
- unique sourceId + versionNumber.
- experimentSlug + createdAt descending.
- unique versionId.

### 2.4 LabBuildArtifact — lab_build_artifacts

File: src/app/lib/labs/models/LabBuildArtifact.js

Purpose: Immutable compiler output corresponding to one exact source version.

Fields:
- artifactId: required unique/indexed.
- experimentSlug, sourceVersionId.
- sourceContentHash, buildHash: SHA-256 hex digests.
- entryUrl.
- outputFiles: 1–80 items (path, url, contentType, byteSize).
- previewPoster: optional build-specific screenshot metadata (status ready/unavailable, poster path/url/content type, byteSize, dimensions, contentHash, capture/browser/Playwright versions and reasonCode).
- compiler: required Mixed metadata object.
- createdBy, status ready.
- createdAt only.

Index: experimentSlug + sourceVersionId + createdAt descending.

Artifact output files are separate from the previewPoster field. Poster data must not be injected into the compiled output file list.

### 2.5 LabPreviewRun — lab_preview_runs

File: src/app/lib/labs/models/LabPreviewRun.js

Purpose: Temporary owner-run preview lifecycle, distinct from a published release.

Fields:
- runId unique/indexed.
- experimentSlug.
- ownerUserId.
- sandboxName.
- previewUrl.
- sourceContentHash.
- status ready/failed.
- expiresAt.
- createdAt.

TTL index on expiresAt. A preview run is temporary and associated with the current input hash, not a permanent public artifact.

### 2.6 LabMediaAsset — lab_media_assets

File: src/app/lib/labs/models/LabMediaAsset.js

Purpose: Track an upload intent and its authenticated Cloudinary media asset.

Fields:
- uploadIntentId unique/indexed.
- experimentSlug.
- ownerUserId.
- originalFilename.
- mediaKind and resourceType: image/video.
- deliveryType: authenticated.
- cloudinaryPublicId unique; cloudinaryAssetId sparse unique.
- format, byteSize, width, height and durationSeconds.
- status: uploading, ready or rejected.
- expiresAt.
- altText max300, caption max500.
- timestamps.

Index: experimentSlug + ownerUserId + status + createdAt descending.

Supported upload constraints and allowed formats are enforced in media-management.js, not solely by this schema. Current media intent uses a 15-minute lifetime; environment config controls maximum upload bytes and required Cloudinary settings.

### 2.7 LabAnalyticsEvent — lab_analytics_events

File: src/app/lib/labs/models/LabAnalyticsEvent.js

Purpose: Append-only event records used for owner engagement reports.

Fields:
- eventId unique.
- eventType enum: source_open, code_copy, like, unlike, guest_like, guest_unlike.
- experimentSlug.
- actorCategory: verified_user or guest.
- actorUserId nullable.
- sourceVersion nullable.
- filePath nullable.
- occurredAt.

Indexes:
- unique eventId.
- experimentSlug + occurredAt descending.
- eventType + occurredAt descending.
- actorUserId + occurredAt partial index for verified_user.

A source_open is not a portfolio detail view. A code_copy is the accepted successful source-copy action under its event contract; it does not prove that code was pasted or executed. Preview start/interactions are not universally instrumented for every runtime and must not be claimed as complete metrics unless event producers are added and verified.

### 2.8 LabLike — lab_likes

File: src/app/lib/labs/models/LabLike.js

One authenticated account record per experiment:
- userId.
- experimentSlug.
- active boolean.
- lastTransitionAt.
- timestamps.

Unique compound index userId + experimentSlug; query index experimentSlug + active. The current active state is stored separately from event history.

### 2.9 LabGuestLike — lab_guest_likes

File: src/app/lib/labs/models/LabGuestLike.js

Guest actor is represented by an HMAC/hash, not raw browser identity:
- guestKeyHash, selected out of default projections.
- experimentSlug.
- active.
- lastTransitionAt.
- expiresAt.
- timestamps.

Unique guestKeyHash + experimentSlug; experimentSlug + active + expiresAt; TTL expiresAt. Verified sign-in can claim a guest's active likes into the verified account before clearing the guest cookie.

### 2.10 LabSourceAuditEvent — lab_source_audit_events

File: src/app/lib/labs/models/LabSourceAuditEvent.js

Owner operation audit:
- actorUserId.
- action enum: source_created, experiment_created, experiment_metadata_updated, media_upload_intent_created, media_uploaded, media_attachments_updated, gallery_preview_updated, draft_saved, source_published, source_unpublished, version_restored, validation_failed.
- experimentSlug.
- versionId nullable.
- requestId nullable.
- resultCode.
- createdAt.
- Index experimentSlug + createdAt descending.

Do not expose raw owner audit internals on public pages.

### 2.11 LabSourceGrant — legacy

The model file remains in the repository for migration compatibility. Current source-access authorization does not require an active per-user/per-experiment grant. Do not write new permission logic based on this legacy collection without an explicit approved migration decision.

## 3. Portfolio Analytics model

### PortfolioVisit — portfolio_visits

File: src/app/lib/portfolio-analytics/models/PortfolioVisit.js

Purpose: One first-party page visit lifecycle record, not a unique-person profile.

Fields:
- visitId: UUID, required.
- startKeyHash and sessionHash: HMAC values, select:false.
- pageType enum home, project, labs_index, lab_detail.
- path: strict allowlist pattern for /, /projects/[slug], /labs, /labs/[slug].
- slug: nullable.
- sourceType enum direct, referral, campaign, internal.
- referrerHost, utmSource, utmMedium, utmCampaign.
- countryCode, regionCode, city (approximate provider-derived fields only).
- deviceType enum desktop, mobile, tablet, unknown.
- startedAt immutable, lastHeartbeatAt.
- activeSeconds non-negative safe integer.
- status active, paused, ended or expired.
- endedAt nullable, expiresAt immutable, schemaVersion.

Indexes:
- unique visitId.
- unique startKeyHash (idempotency/deduplication).
- startedAt descending.
- startedAt + _id for recent cursor.
- startedAt + sessionHash for distinct session grouping.
- pageType + startedAt.
- slug + startedAt partial when slug is string.
- TTL expiresAt.

Privacy invariant: raw IP, full user-agent, precise GPS, full referrer URL and arbitrary query string are not persisted. HMAC values are secret-derived and excluded from default model projection. Retention configuration is 65 days.

## 4. Custom auth collections

These are Mongo collections created/used directly by the authentication flow, rather than standalone Mongoose model files:

| Collection | Purpose | Lifecycle/index behavior |
|---|---|---|
| labs_verification_flows | Random flowId, HMAC email digest, created/expires/verified timestamps | flowId unique; expiresAt TTL; seven-day flow lifetime |
| auth_registration_limits | HMAC of trusted proxy address and one-minute attempt window/counter | updatedAt TTL after 24 hours; rate limit configured at five per address/window |
| Better Auth collections | User, session, account, verification and rate-limit records | Created/managed by Better Auth Mongo adapter/configuration |

The registration limiter trusts only configured proxy IP header (default x-vercel-forwarded-for). It fails closed when that trusted header is absent rather than trusting arbitrary browser-supplied X-Forwarded-For.

## 5. Relationships and lifecycle map

    LabExperiment (slug)
        │
        ├── LabSource (slug; draftVersionId; publishedVersionId; publishedArtifactId)
        │       │
        │       └── LabSourceVersion (immutable snapshots)
        │                │
        │                └── LabBuildArtifact (compiled immutable output)
        │
        ├── LabMediaAsset (authenticated uploads)
        │       ├── fallback-preview attachment
        │       └── galleryPreview selected static media
        │
        ├── LabAnalyticsEvent (event history)
        ├── LabLike (active verified-user state)
        ├── LabGuestLike (active guest state with TTL)
        └── LabSourceAuditEvent (owner operation audit)

PortfolioVisit is intentionally independent of LabAnalyticsEvent. Neither model should be merged for reporting.

## 6. Schema enforcement is layered

1. Route Handler validates request shape and origin/authentication where relevant.
2. Domain service checks owner/verified-user permission and invariants.
3. Normalization/file policy checks path, language, size and secret patterns.
4. Mongoose schema validates required/enums/max lengths.
5. Unique/query indexes reinforce identity and query patterns.
6. Immutable version/artifact records preserve exact history.

Do not rely on client form validation or Mongoose schema alone for authorization.

## 7. Live database verification checklist

- Confirm the configured MONGODB_DB_NAME and database URI environment target; never print secrets.
- List collections and compare with the catalogue above.
- Inspect actual indexes; schema declarations do not prove that index builds ran successfully.
- Confirm TTL indexes exist and expiry values are Date objects.
- Verify unique source version and like indexes before enabling concurrent write flows.
- Check existing legacy LabSourceGrant rows before any cleanup.
- Confirm required Vercel Blob and Cloudinary records correspond to live assets before deleting/retiring any file.
- Record the migration/verification timestamp and environment in the release report.
