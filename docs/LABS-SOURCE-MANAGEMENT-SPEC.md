# Labs Source Management — Owner Console and Protected Code Lifecycle

**Status:** Source storage/editor foundation and owner-created experiment catalogue are implemented on `feat/labs-platform-integration`. The HTML/CSS/JavaScript iframe runner is a limited prototype; React/JSX compilation, media upload, immutable runtime releases and public custom-experiment execution remain planned. Production release remains gated by owner/SMTP configuration, Atlas provisioning/migration, sandbox/security validation and privacy review.  
**Version:** 0.2  
**Updated:** 2026-11-05  
**Related:** `PRD.md`, `ARCHITECTURE.md`, `API-CONTRACTS.md`, `THREAT-MODEL.md`, `IMPLEMENTATION-PLAN.md`, `DESIGN-LAB.md`, `LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md`, `LABS-AND-AUTHENTICATION-DESIGN-SPEC.md`, `LABS-AUTHENTICATION-AND-SOURCE-ACCESS.md`

---

## 1. Purpose

Provide a secure, owner-only way to create and maintain the separate source snapshots used by the Labs protected-source viewer. The owner can create source records for existing experiments, add/edit/remove files, save drafts, publish/unpublish specific source versions, inspect history and restore earlier versions. Every logged-in account with a verified email automatically receives read access to all published source; no per-user grant is issued or required.

This remains a **Labs-specific experiment-authoring and source-management capability**, not approval to build a general portfolio CMS/Admin area. It includes original experiment metadata, code snapshots, a constrained media library, isolated build/preview and explicit public releases. Authored code must never execute in the main portfolio application or privileged application origin. The automatic source-access rule is based only on a valid Better Auth session, `emailVerified === true`, and the exact published source release.

The complete forward-looking contract for React/JSX, Tailwind CSS v4, Motion, build isolation, media uploads, immutable artifacts and custom experiment publication is `LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md`. Where this older source-only specification says execution/media management is out of scope, that statement is superseded by the newer Labs-specific plan; general portfolio CMS/media management remains out of scope.

The integration branch contains the Labs source-access gate, anonymous/verified likes, source-open/copy events, owner-only APIs, source inventory/editor, immutable versions, publish/unpublish/restore, audit history and aggregate analytics. It has passed a clean `npm ci`, targeted Labs/auth/admin/legal lint and a Next.js production build. Atlas end-to-end flows have not yet been exercised against a provisioned owner account, and no source snapshots are seeded automatically; the owner must create a source record and import reviewed files before publishing.

## 2. Repository and deployment audit — current baseline

The following is grounded in the inspected `feat/labs-public-page` implementation:

| Area | Current implementation | Missing capability |
|---|---|---|
| Authentication | Better Auth + MongoDB adapter; the server returns a user ID and verified-email state | No owner/admin role or owner identity check is implemented in the inspected auth module |
| Source schema | `src/app/lib/labs/models/LabSource.js`; collection `lab_sources`; one document per slug with `version`, `published` and embedded `files` | No dedicated immutable source-version collection or draft/published version pointers |
| Legacy grant schema | `src/app/lib/labs/models/LabSourceGrant.js`; collection `lab_source_grants`; per-user/per-experiment active/expiry/revocation fields and unique index | Must be removed from the source authorization path and retired after a safe data/dependency check; no grant-management UI/API will be built |
| Source authorization | `src/app/lib/labs/source-access.js` currently checks verified user + active grant + published source | Target policy removes the active-grant lookup: verified Better Auth session + published source is sufficient for regular users; owner uses a separate draft/version management guard |
| Source API | `GET /api/v1/labs/:slug/source` | No owner source CRUD, version, publish, analytics or audit endpoints |
| UI | `LabSourceAccess.js` displays the source panel and handles the authorized viewer/denied states | No owner-only source manager, file tree, code editing, version history or source-engagement analytics dashboard |
| Database setup | Better Auth and registration collections are created/used by their current flows | Source collections are not automatically provisioned; the current Atlas screenshot showed neither `lab_sources` nor `lab_source_grants` |
| Preview execution | Existing public demos are code-owned browser runtimes | No approved sandbox for executing admin-authored source; arbitrary stored source must remain non-executable |

This table captures the pre-implementation `feat/labs-public-page` baseline. The current `feat/labs-platform-integration` branch implements the target access gate, engagement models, owner APIs, source editor and immutable-version workflow described below. The legacy `LabSourceGrant` model remains only for migration safety and is not consulted by the new authorization service. Existing Atlas data has not been migrated or cleaned up.

### 2.1 Important existing constraints

- The current source model allows 1–40 files, safe relative file paths and a per-file character limit of 500,000. The source service also caps the returned source payload at 1,000,000 characters. Revalidate limits using UTF-8 byte sizes before implementing writes; do not silently increase them.
- The current protected source endpoint returns private/no-store responses. Preserve that behavior for all source reads and all owner drafts.
- The repository is public. Code already committed to that repository, shipped in public client bundles, or exposed in source maps is not made confidential by copying it into Atlas. The private snapshot viewer protects only the separate snapshot stored in Atlas.
- The current source schema is mutable and does not satisfy the PRD's immutable content-history requirement. Do not call the current `version` string immutable version history.
- The source collections and initial snapshot data have not been provisioned in the shown Atlas database. Creating empty collections is not sufficient; the owner workflow must publish a valid snapshot. No per-user grant data is needed.


### 2.1 Public demo versus protected source snapshot

- The existing four public demos are code-owned and their runtime is delivered through the public application. A database source snapshot does not replace that runtime.
- Editing a protected snapshot changes only the owner-managed source record/viewer. It does not change the live public demo or deploy new client code.
- Updates to the live demo's behavior continue through the canonical source repository and normal reviewed deployment pipeline.
- A future flow that builds/runs a snapshot and displays it as a live demo is a separate isolated-preview capability; do not ship it as a side effect of the source editor.

## 3. Goals and non-goals

### Goals

1. A single trusted owner can securely manage Labs source snapshots.
2. Source changes are saved as drafts and never become available merely because a file was edited.
3. Published source versions are immutable and can be restored without overwriting history.
4. Every registered user with a valid session and verified email can read every published experiment source automatically.
5. The owner can see aggregate source opens, copy actions, likes/unlikes and active likes for each experiment in the owner/admin dashboard.
6. Every privileged source mutation is auditable; verified-user source opens/copies/likes and best-effort guest-like actions where supported are recorded as separate analytics events.
7. Source code stays server-side until the source endpoint independently authorizes the request.
8. Editor-only code and dependencies stay out of the public homepage and ordinary Labs listing bundle.

### Non-goals for this slice

- Building a general-purpose portfolio CMS or a cross-project media-management product. Labs-specific experiment metadata and an experiment-scoped image/GIF/video asset library are included in the Studio plan.
- Making source public to every registered account.
- Running saved source with `eval`, dynamic imports, server execution, or the main portfolio React tree.
- Enabling arbitrary package installation, network access, secrets or environment variables for authored code.
- Replacing the four existing code-owned public experiment runtimes with database-authored runtime code.
- Granting admin/owner privileges through sign-up, a client-side flag, a user-editable profile field or a public API.
- Treating a private Atlas snapshot as confidential when the same code is already public in GitHub or a browser bundle.

## 4. Roles and authorization policy

### 4.1 Guest

- May browse published Labs metadata and demos explicitly designated public.
- Cannot read private source, drafts, version history, grants, audit records or owner routes.

### 4.2 Registered user

- Must have a valid Better Auth session and `emailVerified === true` before protected source access, source copying or liking/unliking.
- May read all published source snapshots automatically. Access does not depend on owner approval, a per-user grant, expiry or a user/experiment grant record.
- Cannot create/edit/publish/unpublish source, access drafts, manage source versions, change owner settings or access owner analytics.
- Cannot supply their own user ID, grant ID, role, publisher ID or permission result.

### 4.3 Owner

- The initial owner is the portfolio operator and has source-management permissions.
- Owner identity must be provisioned through a trusted server-side mechanism. Public registration must never create or elevate an Owner.
- The owner must use a verified Better Auth account and a server-validated session.
- The owner manages source records/files/drafts/versions/publication and can inspect aggregate engagement analytics. The owner does not manage per-user source grants because all verified accounts receive published-source access automatically.
- Every owner page, Server Action, Route Handler, domain use case and repository operation must enforce owner authorization server-side. Hiding controls in React is not protection.

**LOCKED — USER APPROVED (2026-11-04):** the initial owner is identified by the server-only `LABS_OWNER_USER_ID` environment variable, containing the stable Better Auth user ID of the already-created, verified owner account. This avoids email matching, first-user-wins behavior and a premature general role-management system. If absent or invalid, owner management is disabled/denied. Never fall back to the first registered user or to an email supplied by the browser. The owner is the sole privileged administrator for this first Labs source-management release and is authorized to create/manage source records, files, drafts, immutable versions, publish/unpublish/restore source, and inspect source-engagement analytics and audit history. A later multi-admin model requires a separate decision.

The product's existing Guest / Registered User / Admin taxonomy remains. For this first narrow slice, the singleton Owner is the only manually provisioned privileged Admin. Whether to introduce multiple Admins later is outside this plan.

## 5. Owner source-management experience

Proposed route family: an owner-only Labs source workspace under the existing admin route convention, for example `/admin/labs/sources`. Exact route naming is **OPEN** until the API/UI implementation slice is approved.


Owner navigation/authentication requirements:
- If an unauthenticated visitor opens the owner route, preserve the exact internal owner destination through the existing Better Auth login flow.
- The current `getSafeReturnTo` implementation is intentionally scoped to `/labs`. Do not widen that generic validator to accept arbitrary `/admin` paths.
- Add a separate narrow owner return-path validator for the exact approved owner source route(s), rejecting external origins, protocol-relative paths, backslashes, encoded traversal and unrelated admin paths. Owner authorization is still rechecked after login; a safe return path is not an authorization grant.

### 5.1 Source inventory

Owner can see:
- Experiment slug and title/reference.
- Whether a source record exists.
- Draft version and published version.
- Last saved/published timestamps and actor.
- File count and total UTF-8 size.
- Source validation status.
- Whether source is currently published and available to all verified accounts.
- Source opens, unique verified accounts, code-copy actions, current likes, like/unlike actions and latest aggregate activity (not raw source content or user-level browsing history).

The inventory must not change public Labs cards or expose private metadata to guests.

### 5.2 Create a source record

- Owner selects an existing Labs experiment by its canonical slug. Do not create a source under an arbitrary slug that is not linked to a valid experiment record.
- Create the source aggregate in an unpublished/no-source state.
- Start with an empty draft only in the owner workspace. It must not appear in public DTOs or be fetchable from the user source endpoint.
- Prevent duplicate source aggregates for the same experiment slug.

Owner-created experiment metadata is now included through the `LabExperiment` model and owner-only create flow. This is a narrow Labs catalogue, not a general portfolio CMS. The experiment remains private until an exact validated release is published.

### 5.3 File tree and editor

The owner can:
- Add a new text file.
- Edit the selected file.
- Rename a file with path validation.
- Delete a file with confirmation.
- Reorder files for presentation if required; order must not alter runtime semantics.
- See language/extension, path, file size and unsaved state.
- Save a draft, discard unsaved changes, and recover from validation errors without losing the editor contents.

The editor must be lazy-loaded only on the protected owner page. Monaco is not present in the inspected package manifest. The editor library and version are **OPEN**; do not add Monaco or another large editor dependency without an implementation decision. A lightweight accessible text editor may be used for the first slice if the owner approves the reduced syntax-highlighting experience.

Code files remain text snapshots, but the Studio is intended to add a controlled build/preview workflow for owner-authored browser experiments. The editor is not a terminal, server shell, arbitrary package manager or execution console. A separate isolated compiler/runtime must build the exact React/JSX, Tailwind v4, Motion or HTML/CSS/JavaScript project and run it outside the main application origin. See `LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md`. The existing four code-owned public demos continue through the normal repository/deployment workflow; custom experiments use immutable database-backed releases.

### 5.3.1 Media library and experiment assets

The owner Studio includes a Labs-specific asset library for still images, animated GIFs and video. It does not expand into a general portfolio media CMS.

- The initial formats are JPEG, PNG, WebP, AVIF, GIF, MP4 and WebM. SVG is excluded until a sanitizer/rasterization decision is approved.
- Uploads use owner-authorized, short-lived signed Cloudinary upload intents. Provider credentials remain server-only.
- Verify upload intent, provider response, actual format/signature, dimensions, byte size, video duration and processing status server-side.
- MongoDB stores LabMediaAsset metadata and references; Cloudinary stores the binary media. Do not put binary media into source files or source-version documents.
- Asset roles are card cover, detail-page gallery and in-experiment asset. Gallery order, alt text, captions and video poster references are part of the experiment release manifest.
- Draft assets must not be publicly discoverable. Public delivery is enabled only for assets included in a published release and only after verifying the configured Cloudinary access mode.
- Do not delete an asset while any draft, published or historical release references it.
- Exact file size, duration, dimension and quota ceilings are open until checked against the actual Cloudinary account plan. Do not infer or invent account limits.
- The card cover is only a discovery preview. The public experiment detail page must render the actual interactive runtime, with the optional media gallery as supporting content.

### 5.4 Validation before save/publish

Server-side validation must include:
- Canonical experiment slug exists and is eligible for source management.
- File count and total payload bounds.
- Safe relative paths only; reject absolute paths, traversal segments, control characters, duplicate paths, path collisions and unsupported names.
- Text files only; reject binary payloads and unsupported encodings.
- Explicit language/extension allowlist.
- Reject or flag secret-bearing files and content, including environment files, private keys, credentials, tokens and obvious secret patterns. Do not log matched values.
- No arbitrary executable preview configuration, package installation instructions, runtime secrets or privileged environment data in source snapshots.
- The server recalculates total size and content hash; it does not trust browser-provided size/hash/version values.
- No save or publish action may run source.

Exact max file count, per-file byte limit, total snapshot byte limit and language list must be finalized against existing limits before implementation.

### 5.5 Draft, publish, unpublish and restore

Recommended lifecycle:
1. Owner creates/edits the working file set.
2. **Save draft** creates an immutable source-version snapshot and advances the draft pointer. It does not change the published pointer.
3. Owner reviews the saved version and validation report.
4. **Publish source** explicitly selects the exact saved version and advances the published pointer. Publishing source makes that version available to every registered user with a verified email; it does not make source public to guests and does not execute it.
5. **Unpublish source** clears/withdraws the published pointer. It immediately stops new source reads for all regular users. There are no per-user source grants to revoke; historical versions and engagement analytics are retained under their approved policies.
6. **Restore** copies a prior immutable version into a new draft version. It never mutates or deletes the old snapshot.
7. Every transition records actor, timestamp, target version and outcome.

Save, publish and unpublish are separate actions. A save must never publish implicitly. Use concurrency/version tokens so one editor session cannot silently overwrite a newer draft.

### 5.6 Version history

The owner can list versions and see:
- Version identifier/sequence and content hash.
- Created time and actor.
- File count/total bytes.
- Change summary.
- Draft/published pointer status.

The owner can view and compare version contents, then restore an old version by creating a new snapshot. Historical source versions are immutable; no in-place edit/delete endpoint is planned. Retention should follow the PRD's immutable version-history baseline unless a later storage/retention decision changes it.

### 5.7 Source engagement analytics

The owner/admin can inspect aggregated engagement per published experiment and across the Labs collection:
- Successful source-viewer opens, grouped by experiment slug/title.
- Code-copy actions reported after the supported clipboard operation succeeds.
- Current active likes per experiment.
- Successful like and unlike state transitions over the selected date range.
- Daily/monthly trends and rankings for source opens, copies and active likes.

The dashboard shows experiment-level aggregates and reporting periods, not a browsable list of individual users' source-view/copy/like histories or their email addresses. Do not expose user-level event records to the browser. Distinguish verified current-like state from anonymous guest-like action counts; guest actions are not unique people. A verified account may open/copy/like multiple experiments; deduplication must prevent retries from multiplying one action. Show verified active likes/actions separately from best-effort guest like/unlike action counts; guest counts are not unique users and may be incomplete.

Source-open events are recorded only after the source endpoint successfully authorizes and returns the published source for a verified account. A public detail-page view is not a source open. Copy events are recorded only after the client reports a successful Clipboard API write; a copy event is not proof that code was pasted, executed or shipped. Like/unlike events are recorded only for actual server-confirmed state transitions.

Analytics event records use the server-derived Better Auth user ID for abuse control/deduplication, never a client-supplied identity. Avoid storing email, raw IP, full source contents, clipboard text or unnecessary device data. Retention and account-deletion handling must be approved and disclosed before production analytics launch.


### 5.8 Owner entry point

- The owner must have a discoverable, authenticated entry into source management and the source-engagement dashboard. Candidate entry points are owner-only Labs account-menu/dashboard items and/or a `Manage source` action in the experiment's source section.
- The server determines whether the current actor is the owner and passes only the safe UI capability state. The client must never infer owner access from email text or browser state.
- The final navigation placement and wording remain an owner UX review item. Direct navigation to the owner route must still run the owner guard and return 403 for non-owners.
- The public experiment demo and ordinary user source-access panel remain unchanged for guests and regular users.

## 6. Recommended data model evolution

This is a target model proposal, not the current Atlas schema. Final indexes and migration steps must be verified against the current MongoDB adapter/version and repository conventions.

### 6.1 `lab_sources` — source aggregate/head

One record per experiment slug:
- `slug` (unique; canonical Labs slug; retain the existing model/API field name).
- `draftVersionId` (nullable).
- `publishedVersionId` (nullable).
- `createdBy`, `updatedBy`.
- `createdAt`, `updatedAt`.
- Optional lifecycle status derived from pointers or a constrained status field.

Do not embed a mutable file array as the sole source of truth after immutable versions are introduced. Existing `LabSource` model currently embeds files; replace/evolve it only with a reviewed migration.

### 6.2 `lab_source_versions` — immutable snapshots

One document per saved snapshot:
- `_id` / stable `versionId`.
- `sourceId` and `experimentSlug`.
- Monotonic `versionNumber` or equivalent per source.
- `files[]`: safe relative `path`, `language`, UTF-8 `content`.
- `contentHash` computed server-side over a canonical representation.
- `basedOnVersionId` for draft lineage/restore.
- `changeSummary` (bounded plain text).
- `createdBy` and `createdAt`.

Suggested indexes: unique `{ sourceId, versionNumber }`; supporting `{ experimentSlug, createdAt: -1 }`. Version numbers must be allocated atomically per source; hashes must be computed over a deterministic canonical representation of the stored file list.

Content fields are append-only and immutable. Do not update file contents in place after insertion. The source aggregate's pointers select which immutable snapshot is the current draft/published source.

### 6.3 `lab_likes` — verified-user like state

One current like-state record per verified Better Auth user and experiment:
- `userId` (server-derived Better Auth user ID).
- `experimentSlug` (canonical Labs slug).
- `active` boolean.
- `createdAt`, `updatedAt`, and the timestamps of the latest state transition.

Use a unique index on `{ userId, experimentSlug }`. A repeated verified like/unlike request that does not change state must not create another verified like action event. Guest and signed-in-unverified users retain the existing best-effort anonymous public-like behavior where the public UI supports it; their current like state is not stored as an account entitlement or guaranteed across devices. Where guest-like telemetry is accepted, count `guest_like` / `guest_unlike` actions separately without claiming unique people.

### 6.4 `lab_analytics_events` — source engagement events

Append-only events for `source_open`, `code_copy`, verified `like` / `unlike`, and best-effort guest `guest_like` / `guest_unlike` actions:
- `eventId` / idempotency key unique per accepted action.
- `eventType` from the strict allowlist.
- `experimentSlug` and the published `sourceVersionId` where relevant.
- `actorCategory`: `verified_user` or `guest`.
- `actorUserId` is present only for a verified-user event and is always derived from the Better Auth session; guest events have no user ID.
- `occurredAt` server timestamp and bounded safe event metadata.

Only verified sessions can generate `source_open` and `code_copy`. Both verified accounts and anonymous visitors can generate like/unlike actions, using separate identity/state collections. Anonymous identity is a signed, HTTP-only browser cookie; its counts are active browser identities/actions, not unique people.

### 6.5 `lab_source_audit_events` — append-only owner audit

Record safe metadata for source aggregate creation, draft saves, publish/unpublish/restore, validation failures and bootstrap/migration outcomes. Recommended fields: `actorUserId`, `action`, `experimentSlug`, `versionId`, `requestId`, safe result code, and `createdAt`. Suggested index `{ experimentSlug, createdAt: -1 }`. Never store full source contents, emails, passwords, verification tokens, SMTP/API keys or raw secret values.

## 7. API and domain boundaries

The following route contracts are implemented on `feat/labs-platform-integration`. They are available in the integration branch but remain subject to deployment configuration and Atlas verification:

| Operation | Proposed endpoint | Result |
|---|---|---|
| List source aggregates | `GET /api/v1/admin/labs/sources` | Owner-only inventory for the existing published Labs experiments |
| Create source aggregate | `POST /api/v1/admin/labs/sources` | Creates empty source head for an existing experiment slug |
| Read editor state | `GET /api/v1/admin/labs/sources/:slug` | Draft/published pointers and owner-only draft metadata |
| Save a draft snapshot | `POST /api/v1/admin/labs/sources/:slug/versions` | Validates files and creates immutable draft version |
| List/view versions | `GET /api/v1/admin/labs/sources/:slug/versions` and `GET /api/v1/admin/labs/sources/:slug/versions/:versionId` | Version metadata and owner-only immutable snapshot content |
| Restore a version | `POST /api/v1/admin/labs/sources/:slug/restore/:versionId` | Creates a new draft from an old snapshot |
| Publish exact version | `POST /api/v1/admin/labs/sources/:slug/publish` | Advances published pointer to a saved version |
| Unpublish source | `POST /api/v1/admin/labs/sources/:slug/unpublish` | Clears published pointer / stops new reads |
| Source analytics | `GET /api/v1/admin/labs/analytics?days=30` | Owner-only aggregate analytics across experiments; supports 7, 30, 90 or 365 days |
| Owner status | `GET /api/v1/admin/labs/owner-status` | Safe boolean capability response for the owner navigation link |

The source-management service writes append-only owner audit records; `GET /api/v1/admin/labs/sources/:slug/audit` and the editor's recent audit timeline are implemented. Owner analytics are aggregate-only and do not expose visitor-level event histories.

Keep the existing user-facing endpoint `GET /api/v1/labs/:slug/source` as the only regular-user source read. Target policy requires a valid verified Better Auth session + published pointer; no grant lookup is performed. The response remains private/no-store.


Engagement endpoints:
- `GET /api/v1/labs/:slug/engagement` — returns public aggregate like counts and the current actor's like state. It does not create an anonymous cookie for a visitor who has not interacted.
- `POST /api/v1/labs/:slug/engagement` — toggles one verified-account or anonymous-browser like. Verified accounts are keyed by the server-derived Better Auth user ID. Anonymous identities use a signed HTTP-only cookie and a keyed database digest; anonymous counts do not represent unique people. Signed-in unverified accounts are denied.
- `POST /api/v1/labs/:slug/source/events` — records `source_open` or `code_copy` for a verified session. Copy events are submitted only after the browser reports clipboard success; clipboard contents are never sent.
- `GET /api/v1/admin/labs/analytics?days=30` — returns aggregate owner analytics without individual browsing/action histories.


All mutations call server-only domain use cases and repositories. Never let UI components query MongoDB or make direct Mongoose calls.

## 8. Source access decision and cache behavior

- Guest: deny.
- Signed-in but unverified: deny.
- Verified registered user: allow source read automatically when the requested experiment has a published source pointer; no owner-issued grant is required.
- Owner with valid owner authorization: allow source management and draft/version reads, including unpublished source.
- Unpublished source: deny regular-user access to all accounts; owner can still inspect drafts and historical versions.
- All source/draft/version/analytics/audit responses: private, no-store, no-cache; never use a shared public cache.
- Source UI must clear loaded text when the session expires, email-verification state is no longer valid, or the source is unpublished. Server authorization is authoritative on every subsequent request.

## 9. Security and reliability requirements

1. **Server-derived identity:** actor user ID comes only from the verified Better Auth session.
2. **Owner guard:** independently enforce singleton-owner authorization in pages, actions, Route Handlers, domain functions and repositories. If owner configuration is missing, deny; never degrade into "any signed-in user".
3. **No client authorization claims:** users cannot set `role`, `owner`, `publishedVersionId`, `versionId`, `actorUserId`, analytics aggregates or another user's ID. Source access is based on the verified server session and publication state.
4. **CSRF/origin:** protect cookie-authenticated owner mutations using the approved Better Auth/Next.js origin and CSRF strategy; require same-origin mutation requests and test forged requests.
5. **Optimistic concurrency:** save/publish operations include expected draft/version pointers; return 409 for stale editor state.
6. **Idempotency:** repeated like/unlike, source-open/copy event, publish or save requests must not create duplicate or inconsistent state.
7. **Validation:** enforce slug/path/language/size/file-count/content-hash constraints server-side; do not trust client values.
8. **Secret protection:** keep source text, SMTP credentials, auth secrets and API keys out of logs, URLs, local storage, analytics and public page data.
9. **Public boundary:** do not include source in guest HTML, RSC payloads, listing/detail DTOs, static files, public CDN URLs or source maps.
10. **Execution boundary:** source is text-only in this phase. Do not evaluate it. Any live preview of owner-authored code requires a separately approved isolated runtime and threat-model gate.
11. **Audit:** append audit events for privileged actions and do not allow the owner UI to edit/delete historical audit events.
12. **Recovery:** failed publication must leave the previous published pointer intact; provide rollback by selecting/restoring a prior immutable version and republishing.
13. **Availability:** owner editor bundles and code-editor dependencies are lazy-loaded; they must not enter the homepage or Labs listing critical path.

## 10. Provisioning and migration plan

1. Confirm the actual owner Better Auth user ID after the account is verified and configure `LABS_OWNER_USER_ID` server-side for the `feat/labs-platform-integration` Preview. The owner ID is currently not configured; configure Production only during the approved release.
2. Implement idempotent bootstrap/migration for source heads, immutable versions, verified-user likes, analytics events and owner audit; do not ask the owner to manually create empty collections in Atlas.
3. Check whether any legacy `lab_source_grants` collection/documents exist. Preserve an export for rollback/audit, remove the grant lookup from the source endpoint, then retire the legacy model/index/collection only after code/deployment references are removed and reconciliation succeeds.
4. Migrate any pre-existing `lab_sources` documents into the new aggregate + immutable version representation if records exist. Preserve the original content hash and published state; do not drop the old collection until reconciliation succeeds.
5. Provision the first source snapshot for `magnetic-interaction` from the reviewed canonical source files after a repository file inventory. Do not guess file paths or import unrelated components/secrets.
6. Verify the snapshot is stored privately and not exposed to public HTML/client output.
7. Publish the source version. A verified registered test account must then read it automatically without any manual grant.
8. Verify guest and unverified account access is denied; verify verified account source open, code copy and like/unlike events are recorded once and appear in owner/admin aggregates.
9. Remove any temporary Atlas `0.0.0.0/0` network access rule after connectivity validation and replace it with an approved stable-egress allowlist.
10. Update and version the Privacy Policy before source engagement analytics go live; document event fields, purpose, retention, aggregation and account-deletion handling.
11. Record deployment and rollback evidence.

## 11. Implementation phases and gates

### Phase A — Policy, authentication boundary and owner guard
- **Code complete:** singleton Owner identity uses server-only `LABS_OWNER_USER_ID`; owner is the only privileged administrator for the first release. The environment value is still required before owner pages can be used.
- **Code complete:** every verified account can access every published source automatically; no per-user grant is required.
- **Code complete:** email/password account flows, verification, resend, forgot-password and reset-password UI/API are present. SMTP must be configured for this branch before registration and recovery can send mail.
- **Code complete:** lightweight accessible textarea source editor selected; no Monaco/CodeMirror dependency was added.

### Phase B — Data model and indexes
- **Code complete:** source head, immutable versions, verified likes, anonymous likes, engagement events and append-only audit models exist with unique/query indexes.
- **Code complete:** application services create required indexes idempotently when the relevant feature is first used.
- **Remaining:** inspect/migrate existing Atlas `lab_sources` and legacy grant records. Do not drop the old collection/model until reconciliation and rollback evidence exist.

### Phase C — Server use cases and API
- **Code complete:** owner-only create/read/save/list/view/restore/publish/unpublish/audit routes; verified-only published source read; anonymous/verified like/unlike; verified source-open/copy event routes; aggregate owner analytics.
- **Code complete:** owner guard and same-origin checks on owner mutation routes; like transitions have a server-side rapid-toggle limit.
- **Remaining:** run Atlas-backed integration tests for Guest, unverified, verified, Owner, expired session, stale pointers, unique-index races and replayed mutations.

### Phase D — Owner source workspace UI
- **Code complete:** owner inventory, file add/import/edit/rename/delete, save/discard, validation, immutable version history and read-only version preview, restore-as-new-draft, publish/unpublish confirmations, audit timeline, engagement period controls and daily activity chart.
- **Validation:** targeted lint passes and the production build confirms all owner/API routes. Visual keyboard, responsive, contrast and accessibility QA remains to be performed in a browser.
- **Remaining:** complete browser-based QA; owner UI/editor is isolated from the public Labs listing and public detail rendering.

### Phase E — First real source snapshot and end-to-end validation
- Import the audited `magnetic-interaction` source files into a draft version.
- Validate and publish the source; verify a regular verified account can open it automatically without provisioning a grant.
- Test guest/unverified denial, verified-user automatic access, unpublish/re-publish, restore, likes/unlikes, copy events and owner access.
- **Gate:** no source leakage and correct response/cache behavior for the full role matrix.

### Separate future phases — Runtime, media and release publishing
- The current HTML/CSS/JavaScript iframe runner is a limited prototype, not a production-approved security boundary.
- Implement isolated React/JSX compilation, Tailwind v4 CSS generation and Motion execution using a fixed, pinned browser dependency allowlist.
- Implement Cloudinary media upload and immutable media manifests for images, GIFs and video.
- Build the exact saved source/media hash in an isolated worker, store static artifacts outside MongoDB, then publish an immutable release manifest.
- The public detail page must execute the full published experiment; a card thumbnail alone is not an acceptable published demo.
- Follow the sequence, security gates and acceptance tests in `LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md`.

## 12. Acceptance criteria

- [ ] A verified owner can open the owner-only source workspace; guests/regular users cannot.
- [ ] No owner route/API accepts client-supplied owner status or actor ID.
- [ ] Owner can create a source aggregate only for a valid experiment slug.
- [ ] Owner can add/edit/rename/delete text files with safe-path validation.
- [ ] Save draft creates a new immutable version and preserves the prior published pointer.
- [ ] Publish/unpublish is explicit, audited and updates only the intended source pointer.
- [ ] Restore creates a new version; historical source remains unchanged.
- [ ] Every verified registered user can access all published source without per-user grants.
- [ ] Guests and signed-in unverified users are denied; verified accounts are allowed when source is published.
- [ ] The owner can manage drafts/versions and view analytics without a per-experiment grant.
- [ ] Source files never appear in guest HTML, RSC payloads, public DTOs, source maps or public caches.
- [ ] All private responses use no-store/private cache headers.
- [ ] Failed or stale mutations do not overwrite newer draft/published state.
- [ ] Audit records exist for owner source mutations; analytics records exist for verified source opens/copies/likes and separate anonymous guest-like actions where supported, without raw source/secrets.
- [ ] Database bootstrap/migration is idempotent and has a rollback/reconciliation procedure.
- [ ] Owner editor and its dependencies do not affect homepage/Labs listing loading.
- [ ] Existing public demos, routes, UI, animation, SEO, accessibility and behavior remain unchanged.

## 13. Open decisions — do not silently assume

1. **Owner bootstrap:** **RESOLVED / LOCKED.** Use the singleton server-only `LABS_OWNER_USER_ID` environment allowlist. The owner is the sole privileged administrator for the initial Labs source-management release. Do not add persisted multi-admin roles in this phase.
2. **Source access policy:** **RESOLVED / LOCKED (2026-11-04).** Every logged-in account with `emailVerified === true` can read all published experiment source automatically. Guests and signed-in unverified accounts cannot read source. No per-user grant, expiry or revoke workflow exists in the target design; publish/unpublish controls availability per experiment.
3. **Engagement policy:** **RESOLVED / LOCKED (2026-11-04).** Only verified accounts can open source and copy code. Both anonymous visitors and verified accounts can like/unlike once per browser identity or account per experiment; logged-in unverified users cannot like. Verified likes persist until unlike; anonymous like identity/state expires after 180 days without a visit that refreshes it. The owner dashboard shows per-experiment source-open counts, unique verified-account counts, copy-action counts, current active verified and anonymous likes, and separate like/unlike action counts. Guest totals do not represent unique people; individual browsing/action histories are not exposed.
4. **Editor:** **RESOLVED for MVP.** Use the lightweight accessible textarea editor; do not add Monaco/CodeMirror in this slice.
5. **Source import strategy:** **RESOLVED for the first slice.** The owner creates source records and manually adds/pastes allowlisted text files in the owner editor. A bulk repository import and the initial `magnetic-interaction` canonical file inventory remain deferred.
6. **Version retention:** PRD currently says immutable versions are retained indefinitely. Confirm storage/backup/cost implications before production.
7. **Analytics retention/privacy:** the Privacy Policy now discloses source opens, copy events, verified likes, anonymous browser likes and aggregate owner analytics (version `2026-11-04.1`). Anonymous like identities/state expire after 180 days without a visit that refreshes the identity. Engagement event records currently have no automatic TTL; retention and account-deletion handling must be reviewed before production release.
8. **Interactive runtime:** compiler, isolated build provider, artifact storage, separate runtime origin, CSP, network policy, fixed package allowlist and resource limits are specified in the Runtime and Media Plan but remain open implementation decisions until threat-model approval.
9. **Media:** Labs-specific Cloudinary upload, image/GIF/video handling, asset references and release pinning are in scope. Exact Cloudinary account limits, draft access mode and upload quotas remain open until verified. General portfolio media administration remains deferred.

Implementation was explicitly authorized and is being maintained on `feat/labs-platform-integration`. Before production release, configure `LABS_OWNER_USER_ID` and the five branch-scoped SMTP variables (`AUTH_SMTP_PORT`, `AUTH_SMTP_USER`, `AUTH_SMTP_PASSWORD`, `AUTH_SMTP_SECURE`, `AUTH_EMAIL_FROM`); verify shared Preview MongoDB/Better Auth settings; validate Atlas indexes/transactions and legacy-data migration; test the Guest / Unverified / Verified / Owner matrix; complete browser accessibility/security QA; and seed the first reviewed source snapshot. The tracked production build and targeted lint have passed; full-repository lint still reports existing errors outside this feature.
