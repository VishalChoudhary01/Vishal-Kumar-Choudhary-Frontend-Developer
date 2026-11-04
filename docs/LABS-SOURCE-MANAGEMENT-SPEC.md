# Labs Source Management — Owner Console and Protected Code Lifecycle

**Status:** Planning specification; implementation not authorized by this document alone  
**Version:** 0.1  
**Branch baseline:** `feat/labs-public-page`  
**Updated:** 2026-11-04  
**Related:** `PRD.md`, `ARCHITECTURE.md`, `API-CONTRACTS.md`, `THREAT-MODEL.md`, `IMPLEMENTATION-PLAN.md`, `LABS-AND-AUTHENTICATION-DESIGN-SPEC.md`, `LABS-AUTHENTICATION-AND-SOURCE-ACCESS.md`

---

## 1. Purpose

Provide a secure, owner-only way to create and maintain the separate source snapshots used by the Labs protected-source viewer. The portfolio owner must be able to create a source record for an existing experiment, add/edit/remove files, save drafts, publish a specific source version, inspect history, restore an earlier version, and grant or revoke an individual verified account's access.

This is a **narrow Labs source-management capability**, not approval to build the full portfolio CMS/Admin area. It must not change the public Labs layout or execute arbitrary code inside the main portfolio application.

This document describes the target plan. It does not claim that the owner console, owner identity, source snapshots, grant UI, version history, or audit log already exist.

## 2. Repository and deployment audit — current baseline

The following is grounded in the inspected `feat/labs-public-page` implementation:

| Area | Current implementation | Missing capability |
|---|---|---|
| Authentication | Better Auth + MongoDB adapter; the server returns a user ID and verified-email state | No owner/admin role or owner identity check is implemented in the inspected auth module |
| Source schema | `src/app/lib/labs/models/LabSource.js`; collection `lab_sources`; one document per slug with `version`, `published` and embedded `files` | No dedicated immutable source-version collection or draft/published version pointers |
| Grant schema | `src/app/lib/labs/models/LabSourceGrant.js`; collection `lab_source_grants`; per-user/per-experiment active/expiry/revocation fields and unique index | No owner-facing grant-management UI or API |
| Source authorization | `src/app/lib/labs/source-access.js` checks verified user + active grant + published source | Owner has no explicit bypass/management permission; regular signed-in users remain denied without a grant |
| Source API | `GET /api/v1/labs/:slug/source` | No owner source CRUD, version, publish, grant, audit or import endpoints |
| UI | `LabSourceAccess.js` displays the source panel and handles the authorized viewer/denied states | No owner-only source manager, file tree, code editing, version history or grant controls |
| Database setup | Better Auth and registration collections are created/used by their current flows | Source collections are not automatically provisioned; the current Atlas screenshot showed neither `lab_sources` nor `lab_source_grants` |
| Preview execution | Existing public demos are code-owned browser runtimes | No approved sandbox for executing admin-authored source; arbitrary stored source must remain non-executable |

### 2.1 Important existing constraints

- The current source model allows 1–40 files, safe relative file paths and a per-file character limit of 500,000. The source service also caps the returned source payload at 1,000,000 characters. Revalidate limits using UTF-8 byte sizes before implementing writes; do not silently increase them.
- The current protected source endpoint returns private/no-store responses. Preserve that behavior for all source reads and all owner drafts.
- The repository is public. Code already committed to that repository, shipped in public client bundles, or exposed in source maps is not made confidential by copying it into Atlas. The private snapshot viewer protects only the separate snapshot stored in Atlas.
- The current source schema is mutable and does not satisfy the PRD's immutable content-history requirement. Do not call the current `version` string immutable version history.
- The source collections and initial snapshot data have not been provisioned in the shown Atlas database. Creating empty collections is not sufficient; a valid snapshot and grant must be written through the planned workflow.

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

**Recommended first-release identity mechanism — OPEN pending owner approval:** a server-only `LABS_OWNER_USER_ID` environment value containing the stable Better Auth user ID of the already-created owner account. This avoids email matching, first-user-wins behavior and a premature general role-management system. If absent or invalid, owner management is disabled/denied. Never fall back to the first registered user or to an email supplied by the browser. A later multi-admin model can use persisted roles after a separate review.

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

The editor stores text. It is not a terminal, build server, package manager or execution console.

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
4. **Publish source** explicitly selects the exact saved version and advances the published pointer. Publishing source makes that version eligible for authorized source reads; it does not make source public and does not execute it.
5. **Unpublish source** clears/withdraws the published pointer. It must stop new source reads even if grants remain; existing grants are retained unless the owner separately revokes them.
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

### 5.7 Grant management

The owner can:
- Search by exact normalized email address.
- See a minimal match record (email, verified status, stable internal user reference).
- Grant a specific experiment to that verified account.
- Choose no expiry or an explicit expiry.
- See active/expired/revoked state and grant actor/time.
- Revoke a grant with confirmation and immediate server-side effect.
- Re-grant by updating the single unique user/experiment grant record; preserve audit history separately.

The browser sends an email address and requested expiry, **not a user ID**. The server resolves the target account from the Better Auth user collection and stores the canonical Better Auth ID. The target must exist and be email-verified. Unknown/unverified users receive a safe owner-facing validation result; no public API exposes this lookup.

Do not add a public "request access" workflow in this phase. Do not automatically grant access at registration or verification.

## 6. Recommended data model evolution

This is a target model proposal, not the current Atlas schema. Final indexes and migration steps must be verified against the current MongoDB adapter/version and repository conventions.

### 6.1 `lab_sources` — source aggregate/head

One record per experiment slug:
- `experimentSlug` (unique; canonical Labs slug).
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

### 6.3 `lab_source_grants` — per-user access

Retain the current per-user/per-experiment model:
- `userId` (canonical Better Auth user ID).
- `experimentSlug`.
- `active`, `grantedBy`, `grantedAt`.
- `expiresAt` (nullable), `revokedAt` (nullable).
- `createdAt`, `updatedAt`.

Keep the unique index on `{ userId, experimentSlug }`. A re-grant updates the current grant state; audit events preserve the historical grant/revoke history. Do not create multiple competing active records for one user/experiment.

### 6.4 `lab_source_audit_events` — append-only management audit

Record safe metadata for:
- Source aggregate created.
- Draft version saved.
- Version published/unpublished/restored.
- Grant created/updated/revoked.
- Validation failure when useful for owner diagnostics.
- Bootstrap/provisioning result.

Recommended fields: `actorUserId`, `action`, `experimentSlug`, `versionId`, `targetUserId`/grant reference where applicable, `requestId`, safe result code, and `createdAt`. Suggested index `{ experimentSlug, createdAt: -1 }`. Never store raw passwords, verification tokens, SMTP/API keys, full source contents or secret values in audit metadata.

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
- Verified registered user without an active grant: deny.
- Verified registered user with a matching active, unexpired grant and a published source pointer: allow.
- Owner with valid owner authorization: allow owner management/source read without a separate user grant.
- Unpublished source: deny regular-user access even when a grant exists.
- Expired or revoked grant: deny immediately on the next request.
- All source/draft/version/grant/audit responses: private, no-store, no-cache; never use a shared public cache.
- Source UI must clear loaded text when the session expires, owner status is removed, access is revoked or the source is unpublished. Server authorization is authoritative on every subsequent request.

## 9. Security and reliability requirements

1. **Server-derived identity:** actor user ID comes only from the verified Better Auth session.
2. **Owner guard:** independently enforce singleton-owner authorization in pages, actions, Route Handlers, domain functions and repositories. If owner configuration is missing, deny; never degrade into "any signed-in user".
3. **No client grants:** users cannot set `active`, `grantedBy`, `role`, `publishedVersionId`, `versionId` or another user's ID.
4. **CSRF/origin:** protect cookie-authenticated owner mutations using the approved Better Auth/Next.js origin and CSRF strategy; require same-origin mutation requests and test forged requests.
5. **Optimistic concurrency:** save/publish operations include expected draft/version pointers; return 409 for stale editor state.
6. **Idempotency:** repeated grant, revoke, publish or save requests must not create duplicate or inconsistent state.
7. **Validation:** enforce slug/path/language/size/file-count/content-hash constraints server-side; do not trust client values.
8. **Secret protection:** keep source text, SMTP credentials, auth secrets and API keys out of logs, URLs, local storage, analytics and public page data.
9. **Public boundary:** do not include source in guest HTML, RSC payloads, listing/detail DTOs, static files, public CDN URLs or source maps.
10. **Execution boundary:** source is text-only in this phase. Do not evaluate it. Any live preview of owner-authored code requires a separately approved isolated runtime and threat-model gate.
11. **Audit:** append audit events for privileged actions and do not allow the owner UI to edit/delete historical audit events.
12. **Recovery:** failed publication must leave the previous published pointer intact; provide rollback by selecting/restoring a prior immutable version and republishing.
13. **Availability:** owner editor bundles and code-editor dependencies are lazy-loaded; they must not enter the homepage or Labs listing critical path.

## 10. Provisioning and migration plan

1. Confirm the actual owner Better Auth user ID after the account is verified.
2. Approve the owner identity mechanism. Recommended initial mechanism: set `LABS_OWNER_USER_ID` server-side for Preview and Production; never put it in a `NEXT_PUBLIC_*` variable.
3. Implement an idempotent database bootstrap/migration for the required collections and indexes; do not ask the owner to manually create empty collections in Atlas.
4. Migrate any pre-existing `lab_sources` documents into the new aggregate + immutable version representation if records exist. Preserve the original content hash and published state; do not drop the old collection until reconciliation succeeds.
5. Provision the first source snapshot for `magnetic-interaction` from the reviewed canonical source files after a repository file inventory. Do not guess file paths or import unrelated components/secrets.
6. Verify the snapshot is stored privately and not exposed to public HTML/client output.
7. Use the owner console to publish the source version and grant the verified owner/user account as required by the approved policy.
8. Confirm a regular user with no grant is denied and the target granted user can read the source.
9. Remove any temporary Atlas `0.0.0.0/0` network access rule after connectivity validation and replace it with an approved stable-egress allowlist.
10. Record deployment and rollback evidence.

## 11. Implementation phases and gates

### Phase A — Confirm policy and owner bootstrap
- Approve singleton Owner identity mechanism and whether the Owner is the sole Admin in the first release.
- Approve that regular registered users require an explicit per-experiment grant.
- Confirm editor MVP (basic text editor vs new editor dependency).
- **Gate:** owner authorization tests are designed before owner routes exist.

### Phase B — Data model, indexes and bootstrap
- Evolve `LabSource` to a source aggregate/head and add immutable version + audit repositories.
- Preserve/extend the existing grant model and unique index.
- Add idempotent database/index bootstrap and a safe migration/rollback plan.
- **Gate:** integration tests cover existing/empty collections, duplicate slugs/grants, immutable versions, failed writes and migration replay.

### Phase C — Server use cases and API
- Implement create source, save draft, list/view versions, restore, publish/unpublish, grant/revoke and audit use cases.
- Implement owner guard and rate limits at every boundary.
- **Gate:** direct API tests cover Guest, unverified user, regular verified user, owner, expired session, wrong slug, wrong user, stale version and replayed mutation.

### Phase D — Owner source workspace UI
- Build source inventory, editor/file tree, save/discard, validation, version history, publish confirmation and grant manager.
- Lazy-load the editor and preserve unsaved input on validation/network failure.
- **Gate:** keyboard, responsive, accessibility, autosave/unsaved-change and error-state tests pass; no owner UI/code editor bundle loads on public pages.

### Phase E — First real source snapshot and end-to-end validation
- Import the audited `magnetic-interaction` source files into a draft version.
- Validate, publish, grant a verified user and test the protected source viewer.
- Test revoke, expiry, unpublish, restore and owner access.
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
- [ ] Owner can grant one verified user access by exact email and revoke/expire that grant.
- [ ] Regular verified users without a grant remain denied; users cannot grant themselves.
- [ ] The owner can manage/read source without creating a self-grant.
- [ ] Source files never appear in guest HTML, RSC payloads, public DTOs, source maps or public caches.
- [ ] All private responses use no-store/private cache headers.
- [ ] Failed or stale mutations do not overwrite newer draft/published state.
- [ ] Audit records exist for source and grant mutations and do not contain raw source/secrets.
- [ ] Database bootstrap/migration is idempotent and has a rollback/reconciliation procedure.
- [ ] Owner editor and its dependencies do not affect homepage/Labs listing loading.
- [ ] Existing public demos, routes, UI, animation, SEO, accessibility and behavior remain unchanged.

## 13. Open decisions — do not silently assume

1. **Owner bootstrap:** approve `LABS_OWNER_USER_ID` singleton environment allowlist or choose a persisted role model. Recommendation: environment allowlist for the initial one-owner release; revisit for multiple admins.
2. **Editor:** lightweight accessible textarea/code editor for MVP or add Monaco/CodeMirror after dependency and bundle review. Neither editor is currently present as a direct dependency in the inspected package manifest.
3. **User grant default:** explicit per-user/per-experiment grant (recommended and consistent with current API) versus a different entitlement model. The PRD has been aligned in this plan to explicit grants; confirm before implementation.
4. **Source import strategy:** manually create files in owner UI, import an allowlisted set of repository files, or support both. Initial `magnetic-interaction` canonical file inventory must be audited.
5. **Version retention:** PRD currently says immutable versions are retained indefinitely. Confirm storage/backup/cost implications before production.
6. **Live preview:** provider, separate origin, CSP, network policy and resource limits remain open and out of this source-only scope.
7. **Admin scope expansion:** general multi-admin, portfolio CMS, analytics, scheduling and media administration remain deferred.

No code implementation, collection migration, source import or account grant is authorized merely by this planning document. Request explicit implementation approval after the owner/auth/editor decisions are accepted.
