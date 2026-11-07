**Status:** The owner source inventory/editor, immutable source lifecycle, source access gate and initial aggregate engagement analytics are present in code. The source/analytics route split, metadata editor and creation handoff have prior Preview build coverage; those results apply only to their recorded historical commits. The current branch additionally contains the Chart.js single-metric analytics trend, a public combined-like DTO, transactionally claiming active guest likes on verified sessions, a legacy active verified-liker identity panel (not approved under the 7 November aggregate-only decision and requiring removal/redesign), custom publication-readiness diagnostics and owner-selected release-bound public gallery poster promotion. Current-turn additions have not yet passed a fresh complete test/build, Atlas-backed reconciliation, authenticated browser QA or a new Preview deployment. Automatic runtime screenshot capture, public runtime-fallback delivery and detail-gallery role migration remain unimplemented. See [the Labs Gallery/Engagement implementation record](./LABS-GALLERY-ENGAGEMENT-AND-LIVE-UI-IMPLEMENTATION.md) and [the Studio Runtime/Media Plan](./LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md). Production release remains gated by owner/SMTP configuration, Atlas provisioning/migration, Cloudinary preset/quota setup, sandbox/security validation and privacy review.  
**Version:** 0.4  
**Updated:** 2026-11-06  
**Related:** `PRD.md`, `ARCHITECTURE.md`, `API-CONTRACTS.md`, `THREAT-MODEL.md`, `IMPLEMENTATION-PLAN.md`, `DESIGN-LAB.md`, `LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md`, `LABS-GALLERY-ENGAGEMENT-AND-LIVE-UI-IMPLEMENTATION.md`, `LABS-AND-AUTHENTICATION-DESIGN-SPEC.md`, `LABS-AUTHENTICATION-AND-SOURCE-ACCESS.md`

## 1. Purpose

Provide a secure, owner-only way to create and maintain the separate source snapshots used by the Labs protected-source viewer. The owner can create source records for existing experiments, add/edit/remove files, save drafts, publish/unpublish specific source versions, inspect history and restore earlier versions. Every logged-in account with a verified email automatically receives read access to all published source; no per-user grant is issued or required.

This remains a **Labs-specific experiment-authoring and source-management capability**, not approval to build a general portfolio CMS/Admin area. It includes original experiment metadata, code snapshots, a constrained media library, isolated build/preview and explicit public releases. Authored code must never execute in the main portfolio application or privileged application origin. The automatic source-access rule is based only on a valid Better Auth session, `emailVerified === true`, and the exact published source release.

The complete forward-looking contract for React/JSX, Tailwind CSS v4, Motion, build isolation, media uploads, immutable artifacts and custom experiment publication is `LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md`. Where this older source-only specification says execution/media management is out of scope, that statement is superseded by the newer Labs-specific plan; general portfolio CMS/media management remains out of scope.

The integration branch contains the Labs source-access gate, anonymous/verified likes, source-open/copy events, owner-only APIs, source inventory/editor, immutable versions, publish/unpublish/restore, audit history and aggregate analytics. Earlier baseline commits passed a clean `npm ci`, targeted Labs/auth/admin/legal lint and a Next.js production build; those checks predate the latest gallery/like/chart/toast changes and are not evidence that the current branch head builds. Atlas end-to-end flows still require reconciliation against a provisioned owner account, and no source snapshots are seeded automatically; the owner must create a source record and import reviewed files before publishing.

## 2. Repository and deployment audit — current baseline

The following is grounded in the inspected `feat/labs-public-page` implementation:

| Area | Current implementation | Missing capability |
|---|---|---|
| Authentication | Better Auth + MongoDB adapter; the server returns a user ID and verified-email state | No owner/admin role or owner identity check is implemented in the inspected auth module |
| Source schema | `src/app/lib/labs/models/LabSource.js`; collection `lab_sources`; one document per slug with `version`, `published` and embedded `files` | No dedicated immutable source-version collection or draft/published version pointers |
| Legacy grant schema | `src/app/lib/labs/models/LabSourceGrant.js`; collection `lab_source_grants`; per-user/per-experiment active/expiry/revocation fields and unique index | Must be removed from the source authorization path and retired after a safe data/dependency check; no grant-management UI/API will be built |
| Source authorization (historical baseline) | The pre-implementation feat/labs-public-page code checked verified user + active grant + published source | **Current feat/labs-platform-integration:** verified Better Auth session + published source is sufficient; active LabSourceGrant lookup is removed. The legacy model remains for migration safety. |
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

The current route family is implemented on the audited integration branch: `/admin/labs/sources` is the Source Library, `/admin/labs/sources/[slug]` is the source-code workspace, and `/admin/labs/sources/import` is the existing import entry point. The target separate owner Analytics routes are `/admin/labs/analytics` and `/admin/labs/analytics/[slug]`. The owner-console navigation and delivery sequence are defined in `LABS-OWNER-CONSOLE-ANALYTICS-AND-SOURCE-MANAGEMENT-PLAN.md`. These routes remain owner protected and are not a general portfolio CMS.


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
- Source presence, draft/published status, latest version and update time, file count/size and validation state. Link to Analytics for engagement reports; do not repeat full metric cards, charts or rankings inside the inventory.

The inventory must not change public Labs cards or expose private metadata to guests.

### 5.2 Create a source record

- Owner selects an existing Labs experiment by its canonical slug. Do not create a source under an arbitrary slug that is not linked to a valid experiment record.
- Create the source aggregate in an unpublished/no-source state.
- Start with an empty draft only in the owner workspace. It must not appear in public DTOs or be fetchable from the user source endpoint.
- Prevent duplicate source aggregates for the same experiment slug.

Owner-created experiment metadata is now included through the `LabExperiment` model and owner-only create flow. This is a narrow Labs catalogue, not a general portfolio CMS. The experiment remains private until an exact validated release is published.

### 5.3 File tree and editor

The current owner workspace uses the shared self-hosted Monaco integration through src/app/components/labs/code/LabCodeEditor.js. The older textarea-only decision below is historical and superseded by the November 2026 integration work.

Current editor surfaces:
- Public verified-source viewer: read-only Monaco, rendered only after verified-session source authorization.
- Owner source workspace: editable Monaco with the React working-copy state remaining authoritative.
- Historical version viewer: read-only Monaco.
- Plain-text textarea fallback: retained when Monaco or worker loading fails.

The editor supports the existing file operations and release lifecycle: add/import/rename/delete/reorder, language selection, path/content validation, dirty state, save/discard, version history, restore-as-new-version, unsaved Run, publish/unpublish and audit. Monaco must remain lazy/client loaded and self-hosted. Preserve the exact last-keystroke value when saving, running or building; do not allow the editor's displayed text to lag behind the React file state.

Do not replace the editor with a textarea-only implementation based on this superseded plan. Browser verification of keyboard navigation, accessibility, theme changes, final-keystroke synchronization and the complete action sequence remains required.

### 5.3.1 Media library and experiment assets

The owner Studio includes a Labs-specific asset workflow for supported still images, animated GIFs and video. It does not expand into a general portfolio media CMS.

Current implementation:
- Upload pipeline uses owner-authorized Cloudinary operations; MongoDB stores LabMediaAsset metadata/references rather than media bytes.
- Published static gallery art is represented separately by the experiment's galleryPreview reference and is associated with the source/artifact release it represents.
- The current LabExperiment schema permits at most one mediaAttachments record and constrains its role to fallback-preview.
- Public LabExperimentPreview renders static image/video media and generated poster/thumbnail fallback; it does not execute an experiment.

Approved target model, not yet implemented:
- gallery-preview;
- ordered detail-gallery;
- runtime-fallback.

Do not describe the current fallback-preview role as the complete target role schema. The public Labs detail page is now static and non-executable, so a runtime-fallback experience is not part of the current page. The target media-role migration and ordered gallery presentation require a separate schema, migration, owner UI and acceptance phase.

The general Portfolio media library, shared asset manager and Project Detail CMS media workflow remain deferred with the Portfolio CMS.

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

The source library and source editor provide entry points into analytics, but do not render a duplicate dashboard. The full metric catalog, event definitions, aggregation formulas, privacy boundaries, ranking/trend requirements and visualization rules are owned by `DESIGN-ANALYTICS.md`.

The source-management boundary is limited to preserving correct source lifecycle events and metadata needed by analytics:
- Source-open is recorded only after a verified source request successfully returns the currently published source.
- Code-copy is recorded only after successful Clipboard API acknowledgement and server acceptance; no clipboard/source text is sent.
- Source-version and experiment references are canonical and server-validated.
- Source mutations remain owner-audited.
- Verified account likes and anonymous browser-cookie likes remain separate state/event categories. Public responses expose the combined count only. When a verified session is seen with the same guest cookie, active guest likes are transactionally claimed by that account without rewriting historical events.
- **Accepted privacy decision (2026-11-07):** owner Analytics is aggregate-only. Do not expose account name, masked email, per-user like timestamp, searchable active-liker list or user-level source/copy/like history. The current detail page still contains the older active verified-liker identity panel; remove/redesign it. Anonymous identities are always aggregate-only.

The analytics owner routes, accepted aggregate-only privacy contract, live refresh transport and implementation sequence are defined by `LABS-OWNER-CONSOLE-ANALYTICS-AND-SOURCE-MANAGEMENT-PLAN.md`, `DESIGN-ANALYTICS.md` and `LABS-GALLERY-ENGAGEMENT-AND-LIVE-UI-IMPLEMENTATION.md`. Do not duplicate metric formulas or dashboard layout here.


### 5.8 Owner entry point and navigation

- The target owner account-menu entry opens `/admin/labs/analytics`.
- The owner navigation provides separate Analytics and Source Library destinations. The Source Library remains `/admin/labs/sources`; it does not redirect to Analytics.
- Existing deep links to `/admin/labs/sources/[slug]` and `/admin/labs/sources/import` remain valid.
- The owner may enter a source workspace from the library or its experiment details. A source open is not an Analytics action and does not create a second editor.
- The server determines whether the current actor is the owner and passes only safe UI capability state. The client must never infer owner access from email text or browser state.
- Direct navigation to every owner page and every owner API must still run the owner guard and deny non-owners.
- The public experiment demo and ordinary user source-access panel remain unchanged for guests and regular users.
- Analytics page structure and live-update behavior are defined by `DESIGN-ANALYTICS.md`; do not duplicate chart or metric requirements here.

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

Use a unique index on `{ userId, experimentSlug }`. A repeated verified like/unlike request that does not change state must not create another verified like action event. Anonymous public likes use the separate `LabGuestLike` collection with a unique HMAC-derived browser-cookie key + experiment slug and an expiry. This key identifies a browser profile, not a natural person; it is not guaranteed across devices, browsers, private sessions or cleared cookies. Signed-in unverified users cannot like. Where guest-like telemetry is accepted, count `guest_like` / `guest_unlike` actions separately without claiming unique people. A single Like/Unlike control changes current state; there is no dislike vote.

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

The source-management service writes append-only owner audit records; `GET /api/v1/admin/labs/sources/:slug/audit` and the editor's recent audit timeline are implemented. The experiment create, metadata-update `PATCH` and delete endpoints exist. Metadata edits remain separate from source-version writes and use the existing experiment-management domain service. Owner analytics are intended to be aggregate-only. The current experiment detail page still identifies active verified accounts (name, masked email and timestamp); this is a known implementation mismatch and must be removed/redesigned. Do not treat this current panel as approved functionality.

Keep the existing user-facing endpoint `GET /api/v1/labs/:slug/source` as the only regular-user source read. Target policy requires a valid verified Better Auth session + published pointer; no grant lookup is performed. The response remains private/no-store.


Engagement endpoints:
- `GET /api/v1/labs/:slug/engagement` — returns public aggregate like counts and the current actor's like state. It does not create an anonymous cookie for a visitor who has not interacted.
- `POST /api/v1/labs/:slug/engagement` — toggles one verified-account or anonymous-browser like. Verified accounts are keyed by the server-derived Better Auth user ID. Anonymous identities use a signed HTTP-only cookie and a keyed database digest; anonymous counts do not represent unique people. Signed-in unverified accounts are denied.
- `POST /api/v1/labs/:slug/source/events` — records `source_open` or `code_copy` for a verified session. Copy events are submitted only after the browser reports clipboard success; clipboard contents are never sent. Per verified user and event type, enforce 30 source opens or 20 copies per minute across experiments, return 429 with `Retry-After`, and do not consume quota for an accepted duplicate event ID.
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
- **Code present:** owner inventory, file add/import/edit/rename/delete, save/discard, validation, immutable version history and read-only version preview, restore-as-new-draft, publish/unpublish confirmations, audit timeline, engagement period controls and daily activity chart.
- **Source creation handoff:** after the source API confirms creation and returns the matching slug, the inventory navigates directly to the source workspace. A 409 conflict refreshes the inventory and does not navigate to an unconfirmed path. This is code- and Preview-build verified; authenticated owner creation and duplicate-conflict behavior against Atlas remain pending.
- **Page separation:** the Analytics page now lives at `/admin/labs/analytics`, while `/admin/labs/sources` renders the Source Library. The route split and navigation are Preview build-verified; authenticated owner UI QA remains pending.
- **Metadata workflow:** a separate owner-only `/admin/labs/experiments/[slug]/edit` page and `PATCH /api/v1/admin/labs/experiments/:slug` now edit title, description, explanation, category and technologies. The canonical slug, publication state, media internals, source files, source-version pointers and release artifacts are excluded from the patch. Server validation is shared with experiment creation, stale edits return a conflict, and a metadata-update audit event is appended. The implementation compiles in Preview; authenticated save, conflict and audit persistence tests remain pending.
- **Validation:** code presence and route builds do not prove deployed Atlas/browser behavior. Visual keyboard, responsive, contrast, animation, polling and accessibility QA remains to be performed.

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
- [ ] Source Library creation opens the newly created workspace only after the server confirms source-head creation; an existing source opens the existing workspace without duplicate creation.
- [ ] Analytics and Source Library are separate owner routes; the Sources route is not redirected to Analytics.
- [ ] Custom experiment metadata has a distinct owner-only edit workflow and cannot mutate source files, source versions, published pointers or immutable artifacts (editor/PATCH code and Preview build are complete; authenticated owner save/conflict/audit regression tests remain pending).
- [ ] The existing source editor operations (file add/import/edit/rename/delete/reorder, validation, save, version view/restore, preview, publish/unpublish and audit) remain available and pass regression tests.
- [ ] Source files never appear in guest HTML, RSC payloads, public DTOs, source maps or public caches.
- [ ] All private responses use no-store/private cache headers.
- [ ] Failed or stale mutations do not overwrite newer draft/published state.
- [ ] Audit records exist for owner source mutations; analytics records exist for verified source opens/copies/likes and separate anonymous guest-like actions where supported, without raw source/secrets.
- [ ] Database bootstrap/migration is idempotent and has a rollback/reconciliation procedure.
- [ ] Owner editor and its dependencies do not affect homepage/Labs listing loading.
- [ ] Existing public demos, routes, UI, animation, SEO, accessibility and behavior remain unchanged.

## 13. Decisions, current implementation discrepancies and remaining gates

1. **Owner bootstrap — accepted target, ID-only.** Use the singleton server-only LABS_OWNER_USER_ID matching the stable Better Auth user ID, and require a verified session. Do not introduce first-user, email, display-name or client-role fallback. **Current code discrepancy:** owner-access.js still permits a verified account whose email matches LABS_OWNER_EMAIL. Remove that fallback only after checking deployed Preview/Production owner variables so the current owner is not locked out.
2. **Source access — locked.** Every server-authenticated account with emailVerified === true can read all currently published experiment source. Guests and unverified accounts cannot. There is no current per-user grant requirement; LabSourceGrant is legacy migration material.
3. **Engagement and Analytics privacy — accepted aggregate-only policy.** Owner Analytics may show aggregate totals, trends and experiment rankings only. Do not expose individual names, masked emails, account-linked timestamps, searchable active-liker directories or user-level source/copy/like history. This supersedes the older narrow active-liker identity exception described in previous versions of this spec and in the older source-management phase notes. **Current code discrepancy:** the experiment-specific Analytics page still contains an active verified-liker identity panel; remove/redesign it before claiming the code matches this policy. The public Privacy Policy currently describes aggregate-only reporting.
4. **Editor — Monaco integration is current.** Public verified source and history are read-only Monaco; the owner editor is editable Monaco, with a plain-text fallback. The earlier textarea-only decision is historical and superseded. See LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md and LABS-DETAIL-PRESENTATION-AND-MONACO-EDITOR-IMPLEMENTATION-PLAN.md.
5. **Source import — existing import capability remains.** The top-level Initialize sources action was removed from the Source Library page, but the direct /admin/labs/sources/import route, import panel and import APIs remain. Do not restore the removed inventory action without an explicit product decision, and do not claim every import endpoint was deleted.
6. **Public catalogue — source-backed custom experiments only.** The current /labs page and public list API expose eligible published custom experiments with a published source pointer and ready matching artifact. The code-owned runtime registry is not merged into the public catalogue. This supersedes older built-in-public-demo catalogue descriptions.
7. **Public experiment detail — static/non-executable.** The current /labs/[slug] route renders metadata, static media, explanation, engagement and protected source. It does not mount LabWorkspace, LabRuntimeBoundary or a published artifact iframe. The compiler, owner Run, immutable build/publish pipeline and artifact Route Handler remain separate infrastructure. This supersedes the old requirement that the public detail page execute the published artifact.
8. **Media roles — target migration pending.** Current model: galleryPreview plus at most one fallback-preview attachment. Ordered detail-gallery and the full gallery-preview/detail-gallery/runtime-fallback role model are not implemented.
9. **Analytics instrumentation — current gaps.** Event types are source_open, code_copy, like, unlike, guest_like and guest_unlike. Experiment detail-view, preview-start and preview-interaction event producers are not implemented. Do not render missing metrics as zero; Portfolio Analytics page visits are a separate system.
10. **Account and discovery gaps.** User dashboard, profile management, self-service account deletion, text search, technology/tag filters and visitor-selected sort are not present in the current route/API implementation. Keep them as approved PRD targets only until explicitly deferred or implemented.
11. **Version and analytics retention.** Immutable source-version retention and Labs analytics-event retention/account-deletion treatment require an explicit operational/privacy policy. Do not infer a TTL from a model that has no TTL index.
12. **Release validation.** Verify Preview/Production environment, Atlas collections/indexes, Sandbox/Blob/Cloudinary behavior, source authorization, editor flows and responsive/accessibility QA against the exact current branch head. This documentation update has not run those checks.

This section supersedes conflicting earlier requirements and planning statements while preserving their history. See docs/PROJECT-STATUS.md for the consolidated current-state map.