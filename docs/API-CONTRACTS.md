**Status:** Labs auth, public source/engagement, owner source/editor lifecycle, initial owner analytics, private media upload, isolated compiler and immutable runtime endpoints are present in code. The single-metric Chart.js trend chart, public combined-like contract, guest-to-verified active-like migration, owner active verified-liker drilldown, publication-readiness diagnostics and owner-promoted release-bound public gallery poster route are also committed on `feat/labs-platform-integration`. The poster mutation is a new owner-only contract; automatic screenshot generation, public runtime-fallback delivery and detail-gallery media roles remain unimplemented. All current-turn changes still need a clean full build/test, Atlas/provider validation, authenticated browser QA and a new Preview deployment; code presence is not release verification.  


> **Current-state clarification (2026-11-07):** This file contains domain contract/design notes and implementation-era API requirements. The current route-handler inventory, actual methods and current access summary are maintained in [api/ENDPOINT-INVENTORY.md](./api/ENDPOINT-INVENTORY.md). For field-level live request/response behavior inspect the Route Handler and owning domain service. When this file describes endpoints not present in the route inventory, treat those details as proposed/historical until the route is implemented.
**Related:** ARCHITECTURE.md, PROJECT-STRUCTURE.md, PRD.md, [Labs Gallery/Engagement Implementation](./LABS-GALLERY-ENGAGEMENT-AND-LIVE-UI-IMPLEMENTATION.md)

## 1. Contract rules
- This file defines endpoint families and responsibilities, not a claim that endpoints already exist.
- Next.js Route Handlers are the default HTTP API surface. Server Actions may be used for same-app form mutations when suitable.
- Do not create duplicate HTTP endpoints for a Server Action unless an external consumer, webhook or separate client requires a stable API.
- Every protected operation authenticates and authorizes server-side.
- Validate request parameters/body using the selected schema library/current repository conventions.
- Do not trust client-provided role, owner ID, publication state, aggregate counts, actor identity or arbitrary MongoDB filters.
- Responses must not contain credentials, internal stack traces, hidden source for guests or unnecessary personal data.
- Route names, verbs and payloads in the Labs/auth/source sections below reflect the implemented `feat/labs-platform-integration` branch. Other portfolio CMS routes remain proposals and require separate approval.

## 2. Response and error conventions
For JSON endpoints, use a consistent envelope selected during Phase 1, for example:
- Success: `{ "data": ..., "meta": ... }` where metadata is necessary.
- Error: `{ "error": { "code": "VALIDATION_ERROR", "message": "Safe user-facing message", "details": ... } }`.
This is a proposed convention, not an existing API contract. Do not mix envelopes across endpoints after approval.

Use appropriate HTTP status semantics: 400 malformed request, 401 unauthenticated, 403 forbidden, 404 absent/unavailable resource, 409 conflict/stale version, 413 upload too large, 422 validly parsed but semantically invalid input where adopted, 429 rate limited, 500 unexpected internal error, 503 dependency temporarily unavailable. Avoid exposing sensitive resource existence where that would create a disclosure risk.

## 3. Proposed endpoint inventory

### Authentication
The Labs authentication provider is Better Auth with the MongoDB adapter. Provider-owned handlers are mounted at `/api/auth/[...all]`; do not invent separate password/token/session endpoints. The raw `/sign-up/email` operation is blocked so registration must pass through the consent-aware route. Implemented Labs routes and use cases:
- `POST /api/labs/register` — validates email/password/required legal consent, applies registration rate limiting, writes a server-managed consent receipt and verification-flow record, then returns a generic confirmation.
- `POST /api/labs/verification/resend` — creates a short-lived flow ID, invokes Better Auth's privacy-safe verification resend handler and returns a generic response for valid addresses.
- `GET /api/labs/verification/status?flow=:id` — no-store lookup of the opaque flow state; only reports whether that flow was marked verified by the server-side Better Auth hook.
- Better Auth `POST /api/auth/sign-in/email` — email/password sign-in; email verification is required.
- Better Auth `POST /api/auth/sign-in/social` — Google sign-in when OAuth credentials are configured.
- Better Auth provider handlers manage email verification, password reset, sign-out, session and current-session reads.
- `GET /api/auth/get-session` — current server-backed session used by the Labs account/source UI.
- Public UI routes: `/labs/login`, `/labs/signup`, `/labs/forgot-password`, `/labs/reset-password`, `/labs/verify-email`.

SMTP delivery and Google OAuth credentials remain deployment/release configuration; first-party legal pages and server-owned policy versions are implemented. Final session-lifetime/concurrency policy remains open. Do not implement a homemade password/session protocol.

### Public portfolio content
Public pages may read published content through server-side page data access without exposing a public JSON endpoint by default.
If an endpoint is required:
- `GET /api/portfolio` — approved public portfolio sections only.
- `GET /api/projects` — published project summaries, with bounded pagination if needed.
- `GET /api/projects/:slug` — published project detail DTO.
Public DTOs must exclude draft fields, admin metadata, private source and internal records. Keep existing routes working.

### Admin portfolio CMS
- `GET /api/admin/portfolio` — load editable portfolio content/draft pointers.
- `PUT /api/admin/portfolio` — validate and save a draft version; must not publish implicitly.
- `GET /api/admin/projects` — admin list with filters/pagination.
- `POST /api/admin/projects` — create project draft.
- `GET /api/admin/projects/:id` — load authorized edit record.
- `PUT /api/admin/projects/:id` — create/update draft content with conflict protection.
- `POST /api/admin/projects/:id/publish` — explicit publish transition.
- `POST /api/admin/projects/:id/unpublish` — explicit unpublish transition.
- `POST /api/admin/projects/:id/preview` — issue/access an authorized preview for an exact version.
- `GET /api/admin/projects/:id/versions` — list authorized version metadata.
- `GET /api/admin/projects/:id/versions/:versionId` — read a version for compare/restore after authorization.
- `POST /api/admin/projects/:id/restore/:versionId` — create a new draft version from a prior snapshot.
- `DELETE /api/admin/projects/:id` — only if delete/archive policy and reference checks are approved.

These paths are candidate REST endpoints; the same use cases may be Server Actions if no external HTTP contract is needed.

### Experience management
- `GET /api/admin/experience` — list entries.
- `POST /api/admin/experience` — create draft.
- `PUT /api/admin/experience/:id` — edit draft.
- Publish/unpublish/version operations follow the shared content workflow, not a second bespoke implementation.

### Labs public pages, engagement and protected source

Public page routes:
- `/labs` — published public experiment listing with lightweight public metadata and exactly one safe visual reference per card. For custom experiments, the current implemented visual priority is an owner-promoted `galleryPreview` whose artifact ID and source-version ID both match the published release, otherwise existing LabArtwork/neutral artwork. Automatic generated screenshot posters remain deferred. Private Cloudinary preview URLs are never exposed. No executable preview is mounted in a card.
- `/labs/:slug` — published experiment detail. Code-owned demos use the approved lazy runtime registry; owner-created experiments use only the exact published immutable artifact through the isolated runtime. Public page DTOs never include protected source contents.

Public engagement routes:
- `GET /api/v1/labs/:slug/engagement` — returns the combined active `totalLikes`, the current actor's `liked` state and permission/actor metadata. It does not expose verified-versus-anonymous counts. A guest identity is not created just by reading the count.
- `POST /api/v1/labs/:slug/engagement` — sets the current like state using `{ liked: boolean }`. The same control toggles Like/Unlike; Unlike is undo, not a dislike vote. Verified accounts use their server-derived Better Auth user ID and a unique account/experiment state. Anonymous visitors use a signed HTTP-only browser cookie and keyed digest, unique per browser-cookie identity/experiment. Signed-in unverified accounts are denied. Anonymous browser identities are not unique people and are not cross-device.
- When a verified session is observed with the same guest cookie, active guest states are transactionally claimed by that account. An already-active account state wins; the guest active state is deactivated to avoid double-counting. Historical action events are not rewritten, and no synthetic verified like event is generated during migration.

Protected source routes:
- `GET /api/v1/labs/:slug/source` — requires a valid verified Better Auth session, canonical public Labs experiment slug and a published source snapshot. No per-user grant lookup is performed. The server validates the published file snapshot and responds private/no-store.
- `POST /api/v1/labs/:slug/source/events` — records `source_open` or `code_copy` for a verified session. Supports code-owned published experiments and owner-created experiments only when their LabExperiment is published, the source is published, and a ready artifact matches the current published source version. The browser sends copy events only after Clipboard API success; the request never contains clipboard/source text. The server rechecks publication/version/file metadata and deduplicates by event ID. Server-enforced per-user/per-event fixed-window limits allow 30 `source_open` or 20 `code_copy` events per minute across all experiments; accepted idempotency replays are checked before consuming quota. Rejections return HTTP 429 with `Retry-After`. Rate-limit keys are HMAC-derived and expire after 24 hours.

Owner-only Labs source management routes:
- `GET /api/v1/admin/labs/owner-status` — returns the safe owner capability used by Labs account navigation.
- `GET /api/v1/admin/labs/sources` — list source status for canonical published Labs experiments.
- `POST /api/v1/admin/labs/sources` — create an unpublished source head for a canonical experiment.
- `GET /api/v1/admin/labs/sources/:slug` — load owner-only draft/published editor state.
- `GET /api/v1/admin/labs/sources/:slug/versions` — list immutable version metadata.
- `POST /api/v1/admin/labs/sources/:slug/versions` — validate and save a new immutable draft snapshot with optimistic concurrency.
- `GET /api/v1/admin/labs/sources/:slug/versions/:versionId` — read immutable file content for the owner-only version preview.
- `POST /api/v1/admin/labs/sources/:slug/restore/:versionId` — restore a historical version as a new draft.
- `POST /api/v1/admin/labs/sources/:slug/publish` and `POST /api/v1/admin/labs/sources/:slug/unpublish` — explicit publication transitions.
- `GET /api/v1/admin/labs/sources/:slug/audit` — read-only owner audit history.
- `GET /api/v1/admin/labs/analytics?days=7|30|90|365` — owner-only aggregate source opens, verified accounts, copies, active anonymous/verified likes and like/unlike activity.
- `GET /api/v1/admin/labs/experiments/:slug/media` — list owner-owned ready media assets with short-lived private preview URLs and attachment/poster state.
- `POST /api/v1/admin/labs/experiments/:slug/media/upload-intent` and `POST /api/v1/admin/labs/experiments/:slug/media/finalize` — create and finalize signed private Cloudinary uploads.
- `PUT /api/v1/admin/labs/experiments/:slug/media/attachments` — set the existing single optional private `fallback-preview` attachment.
- `PUT /api/v1/admin/labs/experiments/:slug/media/gallery-preview` — explicitly promote one experiment-owned ready JPEG/PNG/WebP/AVIF still image as a public gallery poster for the exact current published artifact/version; body includes `assetId`, `altText` and `fit`. Send `assetId: null` to remove it. This is not automatic screenshot capture and does not make the private Cloudinary asset public.
- Owner experiment analytics also runs a server-side, owner-authorized query for current active verified likers on that experiment. The page exposes name, masked email and current like timestamp with pagination/search; no raw IDs, anonymous identities or historical user-level events are returned.

The owner guard uses server-only `LABS_OWNER_USER_ID` and requires a verified session. All owner mutations require same-origin requests; all owner APIs enforce authorization independently. Source, draft, version, audit and analytics responses are private/no-store. Do not return source in anonymous listing/detail payloads.

### Admin Lab management
- `GET /api/admin/lab` — search/filter admin experiments and statuses.
- `POST /api/admin/lab` — create draft experiment.
- `GET /api/admin/lab/:id` — load authorized editor record.
- `PUT /api/admin/lab/:id` — create new immutable draft version.
- `POST /api/admin/lab/:id/publish` and `POST /api/admin/lab/:id/unpublish` — explicit state transitions.
- `GET /api/admin/lab/:id/versions` and `POST /api/admin/lab/:id/restore/:versionId` — version history/restore.
- `POST /api/admin/lab/:id/preview` — private preview for a selected version.
- Source/configuration endpoints must not expose privileged environment values or permit unrestricted package/network execution.

### Media library
- Existing owner media upload/inventory/short-lived private preview flows are implemented in the integration branch for currently supported media types; inspect the current route handlers before changing names or request shapes.
- The current attachment contract supports one optional legacy `fallback-preview` role. Do not assume card cover, detail gallery or in-experiment roles are already supported.
- **Target role migration:** `gallery-preview` (one active published card visual), `detail-gallery` (ordered supplementary detail media), and `runtime-fallback` (one failure-only media item). Attach/detach/order operations are draft mutations with server-side owner checks, concurrency and reference validation.
- Public DTOs return only safe references belonging to the published release. Unattached uploads, draft assets, owner preview URLs, Cloudinary signatures and provider secrets never appear in public DTOs.
- Asset deletion must block while referenced by a draft, published release, historical release, poster record or detail-gallery item. Removing an attachment never directly deletes the Cloudinary object.
- Exact route/payload for role mutation must be added after the current fallback-only route is inspected; do not invent an endpoint and implement it without matching repository conventions.

### Analytics
- `POST /api/analytics/events` — ingest allowlisted client-observable events with validation/rate limiting/deduplication.
- `GET /api/admin/analytics/summary` — aggregate portfolio/Labs summary cards.
- `GET /api/admin/analytics/trends` — daily/monthly aggregate trends.
- `GET /api/admin/analytics/rankings` — most-viewed, most-source-opened, most-copied and most-liked experiments.
- `GET /api/admin/analytics/experiments/:id` — per-experiment aggregate report.
- `GET /api/v1/admin/labs/analytics?days=7|30|90|365` — implemented owner-only aggregate Labs source engagement across experiments.
The implemented Labs analytics endpoint requires the singleton Owner authorization guard. Other generic Admin analytics endpoints remain future portfolio CMS scope. Do not allow arbitrary collection/query expressions from clients.

### Publishing and schedules
- `GET /api/admin/schedules` — authorized schedule list/status.
- `POST /api/admin/schedules` — create schedule targeting an immutable version ID.
- `PUT /api/admin/schedules/:id` — update/cancel according to state-transition rules.
- `POST /api/internal/scheduled-publish` — candidate protected scheduler callback/worker trigger, not a public unauthenticated endpoint.
Internal invocation must be authenticated, replay-safe, rate/abuse protected and idempotent. Exact mechanism is OPEN until scheduler architecture is approved.

## 4. Domain schemas — conceptual only
The following are domain concepts, not finalized MongoDB documents. Field names and indexes must be approved in Phase 1.

### User
- Stable ID.
- Email and verification status.
- Display name/profile image reference.
- Role constrained to Guest (derived), Registered User or Admin; do not persist Guest as an elevated account role.
- Auth-provider identity/session references as appropriate.
- Created/updated timestamps and deletion status.
- Never store plaintext passwords or provider tokens without the selected provider's secure design.

### Content identity
- Stable ID and content type.
- Stable unique slug where applicable.
- Draft version reference.
- Published version reference (nullable).
- Publication status and timestamps.
- Created/updated actor references.

### Content version
- Immutable version ID and content identity reference.
- Snapshot payload validated for the content type.
- Version number or ordered sequence.
- Actor and timestamp.
- Media references required for restore.
- Never mutate a historical snapshot in place.

### Project version payload
- Title, slug, summary/description, approved detail fields.
- Live demo/GitHub links after URL validation.
- Cover/gallery asset references and gallery order/caption/alt text.
- Technology/tags and featured state as approved.
- No arbitrary executable scripts or layout definitions.

### Lab experiment version payload
- Title, slug, description, tags/category/technologies.
- Preview mode and published presentation references.
- Current `LabExperiment.galleryPreview` object: public Blob URL, owner-selected image asset reference, alt text, fit, and exact published artifact/source-version IDs. Only the matching release may serialize it to the public DTO.
- Ordered detail-gallery references and public runtime-fallback asset remain future role-migration work. Automatic generated-poster metadata/capture is deferred; do not treat it as the current poster path.
- Full source/configuration remains protected by server policy.
- Explicit dependency allowlist/runtime profile if interactive execution is enabled.
- No privileged environment variables or arbitrary unrestricted network policy.
- The current one-item fallback-preview attachment is a legacy implementation detail, not the target role schema.

### Media asset
- Stable ID, Cloudinary public identifier, secure delivery URL/transform metadata as appropriate.
- Type/format/dimensions/size and approved descriptive metadata.
- Reference records or a reliable way to derive live, draft and historical usage.
- Uploading actor and timestamps.
- Do not assume a delivery URL alone is a stable asset identity.

### Like
- Experiment/content ID.
- Actor type and authenticated user ID where applicable.
- Anonymous state is stored separately in `lab_guest_likes` using the HMAC digest of a signed HTTP-only browser cookie; it identifies a browser profile, not a person, and is not cross-device.
- Active state and append-only action events are separate; a Like/Unlike control does not create a dislike vote.
- Timestamps and uniqueness/index strategy.
- Authenticated unique constraint: at most one active like per user/experiment; guest state has a unique browser-key/experiment constraint and expiry.
- On a verified session with the same guest cookie, current active guest states are claimed transactionally by the verified account; historical events are not rewritten.

### Analytics event
- Event ID, allowed event type, timestamp, experiment/content ID and version where applicable.
- Actor category and approved deduplication/session key.
- Validated minimal metadata.
- No raw source, credentials or unnecessary PII.

### Publication schedule
- Schedule ID, content ID and exact immutable version ID.
- Scheduled timestamp and configured display timezone.
- Status, attempt count, next attempt, safe failure code and timestamps.
- Idempotency key/lease metadata appropriate to selected scheduler.


### Labs isolated preview and static poster contracts — target, not yet release-verified

These are domain contracts. Final Route Handler versus Server Action selection and concrete payload names must be reconciled with the existing implementation before code changes.

- **Owner Run:** accepts the current unsaved working-copy snapshot and a request/run ID; server derives the owner, validates the file tree and limits, compiles in the isolated sandbox and returns bounded status/diagnostics plus a temporary preview URL. It must not save or publish implicitly. A failed Run preserves editor content and the previous published release.
- **Run lifecycle:** `queued/building → artifact-ready → iframe-starting → runtime-ready`, or a bounded `build-error/runtime-error/timeout/stopped` state. Runtime-ready requires a validated bridge message correlated to the current run ID; iframe `load` alone is insufficient. Stale messages are ignored.
- **Poster generation:** owner-only request bound to an exact successful run or immutable published sourceVersionId/artifactId. Capture only after validated runtime-ready. A poster record stores asset reference, source-version ID, artifact ID, capture viewport/configuration, format/dimensions, content hash and created timestamp. Never accept a client-supplied arbitrary page URL or source hash as authority.
- **Deferred automatic poster capture (not the current implementation):** a future capture worker may support an explicit owner Generate/Regenerate action or bounded publish-time capture only when no valid selected poster exists. Never capture on every keystroke, every visitor request or for every card during gallery render.
- **Current public card DTO:** one safe preview descriptor only; for owner-created experiments the implemented `galleryPreview` must match the current published `artifactId` and `sourceVersionId`. It must never contain source files, draft preview URLs, private Cloudinary URLs or storage credentials.
- **Published detail DTO:** immutable artifact reference and safe presentation-role references. The runtime is fetched only by the detail page on a separate origin and only after its canvas is near the viewport.
- **Security for any future capture worker:** poster capture must occur inside the approved isolated/headless-browser boundary. Do not weaken cross-origin isolation or read iframe pixels from the portfolio page. The exact capture worker/provider/storage method remains OPEN pending validation.
- These target contracts do not authorize Production publication; complete the preview/runtime and threat-model gates in the Labs Runtime and Media Plan first.

## 5. Query, pagination and mutation contracts
- Validate page size and clamp to a documented maximum.
- Validate sort fields against allowlists; never interpolate arbitrary client fields into MongoDB operators.
- Prefer stable cursor pagination for frequently changing large lists; exact strategy depends on query patterns.
- Mutations that can be retried must be idempotent or detect duplicates/conflicts.
- Use version/concurrency tokens to avoid overwriting another admin's newer draft.
- Keep public DTOs distinct from admin/editor DTOs.
- Do not include secrets or server-only fields in DTOs even if the UI does not render them.

## 6. Caching
- Public published content may use appropriate revalidation after successful publish/unpublish.
- Drafts, previews, account data, full source and admin APIs use private/no-store behavior where required.
- Authenticated responses must not be shared across users.
- TanStack Query invalidation is a client cache concern; it does not replace Next.js/CDN revalidation.
- Document which layer owns freshness for every query to avoid stale-data races.

## 7. Required contract test matrix
For each endpoint/action, test:
- Valid input and expected response.
- Malformed and semantically invalid input.
- Guest, registered user, admin, wrong owner and expired session.
- Missing/unpublished/deleted resource.
- Duplicate/replayed mutation and stale version.
- Rate limit and dependency failure.
- Cache headers/revalidation behavior.
- No sensitive data in response/logs.


## 8. Implemented Labs authentication and source contracts

- Authentication persistence is owned by Better Auth and `@better-auth/mongo-adapter`. Mongoose remains the application model/repository layer.
- Registration is consent-gated and routed through `POST /api/labs/register`; direct Better Auth email sign-up is blocked at the App Router adapter.
- Consent records use the server-owned Terms/Privacy versions from `src/app/lib/legal/policies.js` and a server-generated acceptance timestamp. The browser does not choose these values.
- The source DTO returned from `GET /api/v1/labs/:slug/source` contains only `slug`, `version`, `updatedAt` and validated file objects (`path`, `language`, `content`). It is never included in public Labs listing/detail DTOs.
- Target regular-user source authorization is deny-by-default and requires only a valid Better Auth session with `emailVerified === true` and a published source version. No per-user grant is checked or required. Owner-only draft/version management is a separate server-side `LABS_OWNER_USER_ID` guard. Do not trust client identity/role claims.
- Current code defines `lab_sources` and legacy `lab_source_grants`; the target removes `lab_source_grants` from authorization and retires it after safe migration. Target collections include `lab_sources`, `lab_source_versions`, `lab_likes`, `lab_analytics_events` and `lab_source_audit_events`, in addition to Better Auth-managed collections.
- Response headers are `Cache-Control: private, no-store, no-cache, max-age=0, must-revalidate`, `Pragma: no-cache`, and `Vary: Cookie, Authorization`.
- See `docs/LABS-AUTHENTICATION-AND-SOURCE-ACCESS.md` for environment setup, verified-account access policy and source confidentiality.


### Labs consent and verification collections

- `labs_registration_consents`: opaque receipt ID, keyed email digest, Better Auth user ID when linked, Terms version, Privacy version, server acceptance timestamp, linkage timestamp and verification timestamp. Do not store raw email or accept legal version/timestamp values from the client.
- `labs_verification_flows`: opaque flow ID, keyed email digest, created/expiry timestamps and verified timestamp. A TTL index removes expired flow records after seven days. This is transport state, not the legal audit record.


### Public legal-document routes

- `GET /terms` — public, indexable Terms of Service page.
- `GET /privacy` — public, indexable Privacy Policy page.
- Both routes are included in the sitemap and linked from the site footer, contact form and Labs registration screen.
- Policy version values are selected on the server from `src/app/lib/legal/policies.js`; clients cannot submit alternate values as authoritative consent.

## 9. Owner-only Labs source-management contracts

**Status:** The owner-only source-management routes, separated Analytics/Source Library pages and custom experiment metadata edit page are present on `feat/labs-platform-integration`. The owner Analytics GET endpoint returns aggregate metrics and deterministic rankings for recorded source opens, code copies and current active likes. A slug-scoped owner-only analytics GET endpoint and `/admin/labs/analytics/[slug]` detail page are implemented and included in READY test-gated Preview deployment `dpl_JB5bK44KScheRZeiE9cjTRvxE2Kh`; anonymous collection/detail/Source Library return-path smoke tests pass, while authenticated Atlas verification is pending. The metadata PATCH route is implemented and Preview build-verified; authenticated owner save/stale-conflict and Atlas audit verification remain pending. Route/page delivery order is defined in `LABS-OWNER-CONSOLE-ANALYTICS-AND-SOURCE-MANAGEMENT-PLAN.md`.

### Owner authorization prerequisite

- All endpoints in this section require a valid Better Auth session, verified email, and the server-side singleton Owner authorization check.
- **Locked — user approved 2026-11-04:** owner resolution uses server-only `LABS_OWNER_USER_ID` containing the stable Better Auth user ID of the verified owner account. If absent or mismatched, deny with 403; never fall back to the first user or client-provided role. The owner is the sole privileged source manager in the initial release.
- The owner may manage drafts and unpublished versions through the owner guard. Every other registered account with a verified email reads published source automatically; there is no per-user grant.
- Owner routes/actions must be independently protected at transport, domain-use-case and data-access boundaries.

### Existing endpoints and planned additions

| Operation | Endpoint/status | Contract |
|---|---|---|
| List source inventory | `GET /api/v1/admin/labs/sources` | Owner-only paginated aggregate metadata; no file contents in list response |
| Create source aggregate | `POST /api/v1/admin/labs/sources` | Validates an existing canonical experiment slug; creates one source head only |
| Read source editor state | `GET /api/v1/admin/labs/sources/:slug` | Owner-only draft/published pointers, current draft files and validation metadata |
| Save draft snapshot | `POST /api/v1/admin/labs/sources/:slug/versions` | Validates file set; creates immutable snapshot; requires expected draft/version token |
| List versions | `GET /api/v1/admin/labs/sources/:slug/versions` | Owner-only version metadata, actor and timestamp |
| View a version | `GET /api/v1/admin/labs/sources/:slug/versions/:versionId` | Owner-only source contents, private/no-store |
| Restore version | `POST /api/v1/admin/labs/sources/:slug/restore/:versionId` | Creates a new draft snapshot based on an immutable historical version |
| Publish exact version | `POST /api/v1/admin/labs/sources/:slug/publish` | Explicitly advances published pointer to a previously saved version |
| Unpublish source | `POST /api/v1/admin/labs/sources/:slug/unpublish` | Clears published pointer; preserves immutable versions, audit and engagement events |
| Read source audit | `GET /api/v1/admin/labs/sources/:slug/audit` — implemented | Owner-only paginated append-only audit metadata |
| Owner source analytics | `GET /api/v1/admin/labs/analytics?days=7|30|90|365` — implemented | Owner-only collection aggregate, complete UTC daily series, bounded event period (`since <= occurredAt <= generatedAt`) and deterministic rankings for most source opens, most code copies and current active likes; no raw event or user records |
| Owner experiment analytics | `GET /api/v1/admin/labs/analytics/:slug?days=7|30|90|365` — implemented; Preview build verified in `dpl_ADaqDDWRKP2WjESBaKA2dqgBuv7a` | Owner-only aggregate for one published built-in or eligible custom experiment: period opens, per-experiment distinct verified accounts, copies, verified/anonymous like actions, current active likes and UTC daily series; private/no-store |
| Read custom experiment metadata | Server Component calls `getOwnerLabExperiment({ user, slug })` — implemented | Owner-only metadata DTO; custom experiments only; excludes source contents, media internals and private release data |
| Update custom experiment metadata | `PATCH /api/v1/admin/labs/experiments/:slug` — implemented | Owner-only, same-origin update of title, description, explanation, category and technologies only; slug and system/publication/source fields are excluded; optimistic concurrency via expected `updatedAt`; appends `experiment_metadata_updated` audit event |
| Delete custom experiment | `DELETE /api/v1/admin/labs/experiments/:slug` — existing | Retains the existing guarded custom-experiment deletion and associated cleanup workflow |

The collection and per-experiment analytics endpoints are owner-only aggregate reads; neither exposes raw event histories, user identifiers or emails. The per-experiment endpoint and detail page are committed and Preview-build verified; anonymous access redirects to owner login and no raw event/user payloads are returned. The listed Labs endpoints are part of the implementation on the audited branch. Metadata reads use the server-side experiment-management domain service; metadata mutation and existing deletion share the dynamic experiment route while preserving separate HTTP methods. The metadata PATCH is not a source-version mutation and does not advance a source or release pointer. These Labs operations do not authorize a general portfolio CMS. Keep mutations in the server-side experiment/source domain services; do not let client components call Mongoose directly.

### Domain invariants

- Source aggregate is one-per-experiment and holds only draft/published version pointers plus lifecycle metadata.
- Immutable source versions hold file arrays, server-computed content hash, version number, actor, timestamp and optional parent version.
- Saving a draft never advances the published pointer. Publishing selects an existing immutable version and does not execute it.
- Unpublishing denies subsequent source reads for all non-owner accounts, including verified users.
- Restoring a prior version creates a new immutable version; it never modifies the historical snapshot.
- No per-user source grant is part of the target authorization model. Do not build grant/regrant/revoke endpoints or require owner approval for a verified account.
- Like state is unique by `{ userId, experimentSlug }`; only a verified session can create a state transition.
- Source/draft/version/analytics/audit responses are private/no-store and are never included in public DTOs.
- Every state-changing operation requires concurrency protection, idempotency/replay handling and an audit event.


### Source engagement analytics contracts

- `source_open` is generated only after a verified user's source request successfully returns the published source; do not count the public experiment detail-page view as a source open.
- A deliberate viewer opening is associated with a client-generated idempotency key so retries of the same request do not inflate counts. A later explicit reopen/refresh is a new open according to the approved deduplication window.
- `code_copy` is accepted only after the browser reports that the Clipboard API write succeeded. The server rechecks the verified session and the current published source. The event never includes clipboard contents or source file text.
- `like`/`unlike` events are written only when the unique current like-state record actually changes. Duplicate clicks/retries that preserve state do not increment counts.
- The current implemented `GET /api/v1/admin/labs/analytics` returns aggregate source-engagement metrics across code-owned published experiments and published custom experiments whose source pointer matches a ready artifact. The owner aggregation now returns complete UTC date buckets, including zero-activity days. Experiment detail views, preview starts/interactions and broader rankings remain uninstrumented/incomplete and must not be represented as real values until the event paths are implemented and validated.
- The owner-only experiment detail page currently exposes only the current active verified-liker list (name, masked email and state timestamp) with pagination/search. It does not expose user-level historical source-open/copy/like timelines, raw user IDs, anonymous identity hashes or raw event rows.
- Verified events use the server-derived Better Auth user ID for deduplication/abuse controls. Guest-like events use `actorCategory: guest` and no user ID; do not introduce stable cross-device guest identity. Events do not store raw IP, email, clipboard data, source contents or unnecessary device identifiers.
- Event retention and account-deletion handling are deployment gates and must be disclosed in the Privacy Policy before production analytics is enabled.

### Current and target source domain records

- `lab_sources`: unique canonical `slug` (retain the current field name), `draftVersionId`, `publishedVersionId`, created/updated actor and timestamps.
- `lab_source_versions`: source ID/slug, monotonic version number, immutable files, server-calculated content hash, parent version, bounded change summary, actor and timestamp.
- `lab_likes`: canonical Better Auth user ID, experiment slug, active state and state timestamps; unique `{ userId, experimentSlug }`.
- `lab_analytics_events`: server-validated `source_open` and `code_copy` events for verified users; `like`/`unlike` events for verified state transitions; and separate anonymous `guest_like`/`guest_unlike` action events where the public like mechanism reports them. Store experiment slug, source version where relevant, actor category, optional server-derived verified user ID, server timestamp and idempotency key. Never store email, clipboard content or source text.
- `lab_source_audit_events`: actor, action, experiment, version references, request ID, safe outcome code and timestamp. Owner source lifecycle mutations only; append-only, no source text, email, credentials, raw tokens or secrets.

The audited integration branch contains the source head, immutable version, like, analytics-event and audit models described above. Their existence does not prove that the user's deployed Atlas database has been fully migrated, seeded or verified. Do not claim deployment readiness without migration and role-matrix evidence.

### Additional contract tests

- Guest, signed-in unverified user, verified registered user, owner, unpublished source, source-open/copy idempotency replay, verified like/unlike state transitions and best-effort guest-like reporting.
- Owner guard missing/mismatched, owner session expired, user attempts owner API directly, client forges actor/user/role/version/published fields.
- Duplicate source aggregate, duplicate file path, path traversal, binary/oversized file, secret-bearing file, stale draft pointer, publish of unsaved/wrong version, repeated publish/revoke/save.
- Failed writes preserve the previous published pointer. Restore creates a new version. Revoke/unpublish affects the next source request.
- Source contents do not leak into guest/unverified HTML/RSC, public APIs, logs, analytics payloads or shared caches. Analytics stores only allowed event metadata, never the source payload.

