# Labs Source Management — Owner Console and Protected Code Lifecycle

**Status:** Planning specification; singleton owner provisioning and source-management authority approved; verified-account source access and engagement analytics locked (2026-11-04); implementation not authorized by this document alone  
**Version:** 0.1  
**Branch baseline:** `feat/labs-public-page`  
**Updated:** 2026-11-04  
**Related:** `PRD.md`, `ARCHITECTURE.md`, `API-CONTRACTS.md`, `THREAT-MODEL.md`, `IMPLEMENTATION-PLAN.md`, `LABS-AND-AUTHENTICATION-DESIGN-SPEC.md`, `LABS-AUTHENTICATION-AND-SOURCE-ACCESS.md`

---

## 1. Purpose

Provide a secure, owner-only way to create and maintain the separate source snapshots used by the Labs protected-source viewer. The portfolio owner must be able to create a source record for an existing experiment, add/edit/remove files, save drafts, publish a specific source version, inspect history, restore an earlier version, and grant or revoke an individual verified account's access.

This is a **narrow Labs source-management and engagement capability**, not approval to build the full portfolio CMS/Admin area. It must not change the public Labs layout or execute arbitrary code inside the main portfolio application. Every registered account with a verified email can automatically read all published experiment source; the owner does not issue per-user source grants.

This document describes the target plan. It does not claim that the owner console, owner identity, source snapshots, grant UI, version history, or audit log already exist.

## 2. Repository and deployment audit — current baseline

The following is grounded in the inspected `feat/labs-public-page` implementation:

| Area | Current implementation | Missing capability |
|---|---|---|
| Authentication | Better Auth + MongoDB adapter; the server returns a user ID and verified-email state | No owner/admin role or owner identity check is implemented in the inspected auth module |
| Source schema | `src/app/lib/labs/models/LabSource.js`; collection `lab_sources`; one document per slug with `version`, `published` and embedded `files` | No dedicated immutable source-version collection or draft/published version pointers |
| Legacy grant schema | `src/app/lib/labs/models/LabSourceGrant.js`; collection `lab_source_grants`; per-user/per-experiment active/expiry/revocation fields and unique index | Must be removed from the source authorization path and retired after a safe data/dependency check; no grant-management UI/API will be built |
| Source authorization | `src/app/lib/labs/source-access.js` currently checks verified user + active grant + published source | Target policy removes the active-grant lookup: verified Better Auth session + published source is sufficient for regular users; owner uses a separate draft/version management guard |
| Source API | `GET /api/v1/labs/:slug/source` | No owner source CRUD, version, publish, grant, audit or import endpoints |
| UI | `LabSourceAccess.js` displays the source panel and handles the authorized viewer/denied states | No owner-only source manager, file tree, code editing, version history or engagement analytics dashboard |
| Database setup | Better Auth and registration collections are created/used by their current flows | Source collections are not automatically provisioned; the current Atlas screenshot showed neither `lab_sources` nor `lab_source_grants` |
| Preview execution | Existing public demos are code-owned browser runtimes | No approved sandbox for executing admin-authored source; arbitrary stored source must remain non-executable |

### 2.1 Important existing constraints

- The current source model allows 1–40 files, safe relative file paths and a per-file character limit of 500,000. The source service also caps the returned source payload at 1,000,000 characters. Revalidate limits using UTF-8 byte sizes before implementing writes; do not silently increase them.
- The current protected source endpoint returns private/no-store responses. Preserve that behavior for all source reads and all owner drafts.
- The repository is public. Code already committed to that repository, shipped in public client bundles, or exposed in source maps is not made confidential by copying it into Atlas. The private snapshot viewer protects only the separate snapshot stored in Atlas.
- The current source schema is mutable and does not satisfy the PRD's immutable content-history requirement. Do not call the current `version` string immutable version history.
- The source collections and initial snapshot data have not been provisioned in the shown Atlas database. Creating empty collections is not sufficient; a valid snapshot and grant must be written through the planned workflow.


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
4. Registered users receive source only when their email is verified and an explicit active grant exists for that exact experiment.
5. The owner can find a registered account using an exact email address, grant access for one experiment, optionally set expiry, and revoke access.
6. Every privileged source mutation and grant/revoke operation is auditable.
7. Source code stays server-side until the source endpoint independently authorizes the request.
8. Editor-only code and dependencies stay out of the public homepage and ordinary Labs listing bundle.

### Non-goals for this slice

- Building the entire CMS for projects, experience, portfolio metadata, media library or analytics.
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

- Must have a valid Better Auth session and `emailVerified === true` before protected source access.
- May read a published source snapshot only when an active grant matches the server-derived Better Auth user ID and experiment slug and is not expired or revoked.
- Cannot create/edit/publish source, grant access, revoke access or modify their own privileges.
- Cannot supply their own user ID, grant ID, role, publisher ID or permission result.

### 4.3 Owner

- The initial owner is the portfolio operator and has source-management permissions.
- Owner identity must be provisioned through a trusted server-side mechanism. Public registration must never create or elevate an Owner.
- The owner must use a verified Better Auth account and a server-validated session.
- The owner can manage source and grants without first granting the owner account ordinary user-level access to each experiment. Owner management/read authority is a separate permission path; it must not weaken the regular-user grant rule.
- Every owner page, Server Action, Route Handler, domain use case and repository operation must enforce owner authorization server-side. Hiding controls in React is not protection.

**LOCKED — USER APPROVED (2026-11-04):** the initial owner is identified by the server-only `LABS_OWNER_USER_ID` environment variable, containing the stable Better Auth user ID of the already-created, verified owner account. This avoids email matching, first-user-wins behavior and a premature general role-management system. If absent or invalid, owner management is disabled/denied. Never fall back to the first registered user or to an email supplied by the browser. The owner is the sole privileged administrator for this first Labs source-management release and is authorized to create/manage source records, files, drafts, immutable versions, publish/unpublish/restore source, grant/revoke/expire per-experiment access, and inspect audit history. A later multi-admin model requires a separate decision.

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
- Whether source is currently published/available to eligible grantees.
- Grant count and latest grant activity (not raw source content).

The inventory must not change public Labs cards or expose private metadata to guests.

### 5.2 Create a source record

- Owner selects an existing Labs experiment by its canonical slug. Do not create a source under an arbitrary slug that is not linked to a valid experiment record.
- Create the source aggregate in an unpublished/no-source state.
- Start with an empty draft only in the owner workspace. It must not appear in public DTOs or be fetchable from the user source endpoint.
- Prevent duplicate source aggregates for the same experiment slug.

Whether this narrow slice should also create the public experiment metadata record is **OUT OF SCOPE**; full Lab experiment CMS remains deferred.

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

The editor stores a protected source snapshot as text. It is not a terminal, build server, package manager or execution console. Editing/publishing this Atlas snapshot does not modify or hot-update the public demo; current public demos remain code-owned and change through the normal repository/deployment workflow. Any mechanism that executes the saved snapshot is a separate isolated-preview capability and remains out of scope until its security gate passes.

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

The dashboard shows experiment-level aggregates and reporting periods, not a browsable list of individual users' source-view/copy/like histories or their email addresses. Do not expose user-level event records to the browser. A verified account may open/copy/like multiple experiments; deduplication must prevent retries from multiplying one action.

Source-open events are recorded only after the source endpoint successfully authorizes and returns the published source for a verified account. A public detail-page view is not a source open. Copy events are recorded only after the client reports a successful Clipboard API write; a copy event is not proof that code was pasted, executed or shipped. Like/unlike events are recorded only for actual server-confirmed state transitions.

Analytics event records use the server-derived Better Auth user ID for abuse control/deduplication, never a client-supplied identity. Avoid storing email, raw IP, full source contents, clipboard text or unnecessary device data. Retention and account-deletion handling must be approved and disclosed before production analytics launch.


### 5.8 Owner entry point

- The owner must have a discoverable, authenticated entry into source management. Candidate entry points are an owner-only Labs account-menu item and/or a `Manage source` action in the experiment's protected-source section.
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

Use a unique index on `{ userId, experimentSlug }`. A repeated like/unlike request that does not change state must not create another like action event. Guest and unverified-user likes are disabled. Keep the current active-like count derivable from state records or a server-maintained aggregate with reconciliation.

### 6.4 `lab_analytics_events` — source engagement events

Append-only events for `source_open`, `code_copy`, `like` and `unlike`:
- `eventId`/idempotency key unique per accepted user action.
- `eventType` from the strict allowlist.
- `experimentSlug` and the published `sourceVersionId` where relevant.
- `actorUserId` from the Better Auth session (no client-supplied identity).
- `occurredAt` server timestamp and bounded safe event metadata.

Do not store email, raw IP, clipboard contents, source text, passwords or authentication tokens. Add indexes for `{ experimentSlug, occurredAt: -1 }` and `{ eventType, occurredAt: -1 }` only after confirming query patterns. Source-view/copy events are not likes; likes are additionally represented by the unique `lab_likes` current-state record.

### 6.5 `lab_source_audit_events` — append-only owner audit

Record safe metadata for source aggregate creation, draft saves, publish/unpublish/restore, validation failures and bootstrap/migration outcomes. Recommended fields: `actorUserId`, `action`, `experimentSlug`, `versionId`, `requestId`, safe result code, and `createdAt`. Suggested index `{ experimentSlug, createdAt: -1 }`. Never store full source contents, emails, passwords, verification tokens, SMTP/API keys or raw secret values.

## 7. API and domain boundaries

Candidate owner-only endpoints (final routes/verbs are owned by `API-CONTRACTS.md` and require review before implementation):

| Operation | Proposed endpoint | Result |
|---|---|---|
| List source aggregates | `GET /api/v1/admin/labs/sources` | Paginated owner-only inventory |
| Create source aggregate | `POST /api/v1/admin/labs/sources` | Creates empty source head for an existing experiment slug |
| Read editor state | `GET /api/v1/admin/labs/sources/:slug` | Draft/published pointers and owner-only draft metadata |
| Save a draft snapshot | `POST /api/v1/admin/labs/sources/:slug/versions` | Validates files and creates immutable draft version |
| List/view versions | `GET /api/v1/admin/labs/sources/:slug/versions` | Version metadata; content read remains owner-only |
| Restore a version | `POST /api/v1/admin/labs/sources/:slug/restore/:versionId` | Creates a new draft from an old snapshot |
| Publish exact version | `POST /api/v1/admin/labs/sources/:slug/publish` | Advances published pointer to a saved version |
| Unpublish source | `POST /api/v1/admin/labs/sources/:slug/unpublish` | Clears published pointer / stops new reads |
| List grants | `GET /api/v1/admin/labs/sources/:slug/grants` | Owner-only grant list |
| Grant/re-grant by email | `POST /api/v1/admin/labs/sources/:slug/grants` | Server resolves verified user and writes grant |
| Revoke grant | `DELETE /api/v1/admin/labs/sources/:slug/grants/:grantId` | Revokes one grant |
| Read audit | `GET /api/v1/admin/labs/sources/:slug/audit` | Paginated owner-only audit metadata |

Keep the existing user-facing endpoint `GET /api/v1/labs/:slug/source` as the only regular-user source read. It continues to require verified session + active grant + published pointer and returns private/no-store data.

All mutations call server-only domain use cases and repositories. Never let UI components query MongoDB or make direct Mongoose calls.

## 8. Source access decision and cache behavior

- Guest: deny.
- Signed-in but unverified: deny.
- Verified registered user: allow source read automatically when the requested experiment has a published source pointer; no owner-issued grant is required.
- Owner with valid owner authorization: allow source management and draft/version reads, including unpublished source.
- Unpublished source: deny regular-user access to all accounts; owner can still inspect drafts and historical versions.
- All source/draft/version/analytics/audit responses: private, no-store, no-cache; never use a shared public cache.
- Source UI must clear loaded text when the session expires, owner status is removed, access is revoked or the source is unpublished. Server authorization is authoritative on every subsequent request.

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

1. Confirm the actual owner Better Auth user ID after the account is verified and configure `LABS_OWNER_USER_ID` server-side for Preview; configure Production only during the approved release.
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

### Phase A — Confirm policy and owner bootstrap
- **Complete — user approved 2026-11-04:** singleton Owner identity uses server-only `LABS_OWNER_USER_ID`; owner is the sole privileged administrator for the first release and manages all Labs source lifecycle and access-grant operations.
- **Locked baseline:** regular registered users require an explicit per-experiment grant.
- Confirm editor MVP (basic text editor vs new editor dependency).
- **Gate:** owner authorization tests are designed before owner routes exist.

### Phase B — Data model, indexes and bootstrap
- Evolve `LabSource` to a source aggregate/head and add immutable version + audit repositories.
- Retire the legacy `LabSourceGrant` model and `lab_source_grants` collection after safe migration/reconciliation; introduce `lab_likes` and `lab_analytics_events` with approved indexes.
- Add idempotent database/index bootstrap and a safe migration/rollback plan.
- **Gate:** integration tests cover existing/empty collections, duplicate slugs/grants, immutable versions, failed writes and migration replay.

### Phase C — Server use cases and API
- Implement create source, save draft, list/view versions, restore, publish/unpublish and audit use cases; implement verified-user like/unlike and source-open/copy analytics.
- Implement owner guard and rate limits at every boundary.
- **Gate:** direct API tests cover Guest, unverified user, regular verified user, owner, expired session, wrong slug, wrong user, stale version and replayed mutation.

### Phase D — Owner source workspace UI
- Build source inventory, editor/file tree, save/discard, validation, version history, publish confirmation and an owner/admin source-engagement analytics view.
- Lazy-load the editor and preserve unsaved input on validation/network failure.
- **Gate:** keyboard, responsive, accessibility, autosave/unsaved-change and error-state tests pass; no owner UI/code editor bundle loads on public pages.

### Phase E — First real source snapshot and end-to-end validation
- Import the audited `magnetic-interaction` source files into a draft version.
- Validate and publish the source; verify a regular verified account can open it automatically without provisioning a grant.
- Test guest/unverified denial, verified-user automatic access, unpublish/re-publish, restore, likes/unlikes, copy events and owner access.
- **Gate:** no source leakage and correct response/cache behavior for the full role matrix.

### Separate future phase — Isolated live preview
- Select and threat-model a cross-origin isolated preview runtime before executing stored source.
- Until this gate is approved and passed, source management is code editing/storage/viewing only, not code execution.

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
- [ ] Audit records exist for owner source mutations; analytics records exist for source opens, copy actions and like/unlike transitions without raw source/secrets.
- [ ] Database bootstrap/migration is idempotent and has a rollback/reconciliation procedure.
- [ ] Owner editor and its dependencies do not affect homepage/Labs listing loading.
- [ ] Existing public demos, routes, UI, animation, SEO, accessibility and behavior remain unchanged.

## 13. Open decisions — do not silently assume

1. **Owner bootstrap:** **RESOLVED / LOCKED.** Use the singleton server-only `LABS_OWNER_USER_ID` environment allowlist. The owner is the sole privileged administrator for the initial Labs source-management release. Do not add persisted multi-admin roles in this phase.
2. **Source access policy:** **RESOLVED / LOCKED (2026-11-04).** Every logged-in account with `emailVerified === true` can read all published experiment source automatically. Guests and signed-in unverified accounts cannot read source. No per-user grant, expiry or revoke workflow exists in the target design; publish/unpublish controls availability per experiment.
3. **Engagement policy:** **RESOLVED / LOCKED (2026-11-04).** Only verified accounts can like/unlike experiments and copy source. The owner/admin dashboard shows experiment-level aggregate source opens, copy actions, current likes and like/unlike trends; it does not expose individual users' browsing/action histories in the first release.
4. **Editor:** lightweight accessible textarea/code editor for MVP or add Monaco/CodeMirror after dependency and bundle review. Neither editor is currently present as a direct dependency in the inspected package manifest.
5. **Source import strategy:** manually create files in owner UI, import an allowlisted set of repository files, or support both. Initial `magnetic-interaction` canonical file inventory must be audited.
6. **Version retention:** PRD currently says immutable versions are retained indefinitely. Confirm storage/backup/cost implications before production.
7. **Analytics retention/privacy:** retention period, event deduplication window, account-deletion treatment and final policy wording must be approved before analytics go live.
8. **Live preview:** provider, separate origin, CSP, network policy and resource limits remain open and out of this source-only scope.
9. **Admin scope expansion:** general multi-admin, portfolio CMS, scheduling and media administration remain deferred.

No code implementation, collection migration or source import is authorized merely by this planning document. The source-access and owner policies above are approved; remaining editor/source-import/analytics-retention decisions and the normal phase gates must be resolved before implementation.
