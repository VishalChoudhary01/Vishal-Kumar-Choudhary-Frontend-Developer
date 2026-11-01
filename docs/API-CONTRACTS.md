# API Contracts, Domain Schemas and Endpoint Ownership

**Status:** Contract baseline for planning. Exact schemas/routes must be finalized after repository and auth-provider inspection.  
**Related:** ARCHITECTURE.md, PROJECT-STRUCTURE.md, PRD.md

## 1. Contract rules
- This file defines endpoint families and responsibilities, not a claim that endpoints already exist.
- Next.js Route Handlers are the default HTTP API surface. Server Actions may be used for same-app form mutations when suitable.
- Do not create duplicate HTTP endpoints for a Server Action unless an external consumer, webhook or separate client requires a stable API.
- Every protected operation authenticates and authorizes server-side.
- Validate request parameters/body using the selected schema library/current repository conventions.
- Do not trust client-provided role, owner ID, publication state, aggregate counts, actor identity or arbitrary MongoDB filters.
- Responses must not contain credentials, internal stack traces, hidden source for guests or unnecessary personal data.
- Route names, verbs and payloads are proposed. Confirm exact naming and compatibility during Phase 1 before implementation.

## 2. Response and error conventions
For JSON endpoints, use a consistent envelope selected during Phase 1, for example:
- Success: `{ "data": ..., "meta": ... }` where metadata is necessary.
- Error: `{ "error": { "code": "VALIDATION_ERROR", "message": "Safe user-facing message", "details": ... } }`.
This is a proposed convention, not an existing API contract. Do not mix envelopes across endpoints after approval.

Use appropriate HTTP status semantics: 400 malformed request, 401 unauthenticated, 403 forbidden, 404 absent/unavailable resource, 409 conflict/stale version, 413 upload too large, 422 validly parsed but semantically invalid input where adopted, 429 rate limited, 500 unexpected internal error, 503 dependency temporarily unavailable. Avoid exposing sensitive resource existence where that would create a disclosure risk.

## 3. Proposed endpoint inventory

### Authentication
Provider-specific routes are OPEN until the auth provider is chosen. Prefer provider-supported handlers over inventing custom token/session endpoints. Required use cases:
- Registration/email-password sign-in.
- Google sign-in/callback.
- Email verification.
- Password reset request and reset completion.
- Sign-out/session invalidation.
- Current user/profile read and profile update.
- Account deletion with reauthentication/confirmation where appropriate.

Do not implement a homemade password/session protocol without an approved security design.

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

### Lab
- `GET /api/lab` — published listing with bounded query parameters for search, filters, sort and pagination.
- `GET /api/lab/:slug` — published experiment metadata and guest-safe partial source only.
- `POST /api/lab/:id/like` — create/activate like under actor-specific policy.
- `DELETE /api/lab/:id/like` — remove authenticated like; guest behavior must be explicitly defined.
- `GET /api/lab/:id/source` — authenticated full-source access only; private cache policy.
- `POST /api/lab/:id/copy-event` — record supported copy action with abuse controls; never accept source content as a trusted event claim.
- `POST /api/lab/:id/preview-session` — authorize preview launch; actual execution is delegated to approved isolated infrastructure.
- `POST /api/lab/:id/preview-events` — accept only allowlisted, bounded, validated instrumented events.
- `GET /api/user/dashboard` — current user's dashboard data only.
- `GET /api/user/likes` — current user's likes.
- `GET /api/user/activity` — current user's activity, subject to retention rules.

Do not return full source in the listing/detail endpoint for guests. A source route must check the current actor and experiment policy on every request.

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
- `GET /api/admin/media` — search/filter authorized asset metadata and usage.
- `POST /api/admin/media/upload-signature` — authorize a constrained signed upload after admin checks.
- `POST /api/admin/media/confirm-upload` — validate Cloudinary result and persist asset metadata.
- `GET /api/admin/media/:id` — asset details and reference list.
- `PUT /api/admin/media/:id` — update approved metadata or perform a reviewed replacement workflow.
- `DELETE /api/admin/media/:id` — reject/block if live, draft or historical references make deletion unsafe.
Gallery attach/detach/order changes may be content-draft mutations rather than independent asset deletion.

### Analytics
- `POST /api/analytics/events` — ingest allowlisted client-observable events with validation/rate limiting/deduplication.
- `GET /api/admin/analytics/summary` — aggregate summary cards.
- `GET /api/admin/analytics/trends` — daily/monthly aggregates.
- `GET /api/admin/analytics/rankings` — most viewed/copied/liked under documented formulas.
- `GET /api/admin/analytics/experiments/:id` — per-experiment report.
All admin analytics reads require Admin authorization. Do not allow arbitrary collection/query expressions from clients.

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
- Preview mode and approved media references.
- Partial-source configuration.
- Full source/configuration protected by server policy.
- Explicit dependency allowlist/runtime profile if interactive execution is enabled.
- No privileged environment variables or arbitrary unrestricted network policy.

### Media asset
- Stable ID, Cloudinary public identifier, secure delivery URL/transform metadata as appropriate.
- Type/format/dimensions/size and approved descriptive metadata.
- Reference records or a reliable way to derive live, draft and historical usage.
- Uploading actor and timestamps.
- Do not assume a delivery URL alone is a stable asset identity.

### Like
- Experiment/content ID.
- Actor type and authenticated user ID where applicable.
- Guest deduplication token only if approved and privacy-reviewed.
- Active state or immutable action events as selected.
- Timestamps and uniqueness/index strategy.
- Authenticated unique constraint: at most one active like per user/experiment.

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
