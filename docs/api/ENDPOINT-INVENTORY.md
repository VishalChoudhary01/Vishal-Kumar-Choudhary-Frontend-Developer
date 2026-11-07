# API Endpoint Inventory — Current Route Handlers

**Audit branch:** feat/labs-platform-integration  
**Source root:** src/app/api  
**Count:** 36 Route Handler files in the audited tree.

This is a route inventory, not a promise that every route is a public, stable third-party API. Many endpoints are private application contracts used only by current screens. For exact field-level request/response shapes, inspect the linked Route Handler and its domain service. Do not infer schema from endpoint names alone.

## 1. Shared transport patterns

### Owner/admin mutation handlers

Most /api/v1/admin/labs mutations use:
- getLabsOwnerUser() before reading/mutating private records;
- isSameOriginMutation(request) for POST/PUT/PATCH/DELETE;
- JSON body parsing with a stable INVALID_REQUEST response for malformed JSON;
- adminJson/adminError for success and mapped errors;
- Node.js runtime, force-dynamic and no revalidation where data is private.

Do not expose owner APIs by removing the owner check or relying on navigation hiding.

### Public/private response rules

- Private user/source/owner data should use no-store/private and appropriate Vary headers.
- Public Labs collection is still private/no-store because actor/session state can affect parts of the response.
- Runtime artifact responses have special MIME/CSP/nosniff behavior.
- Contact and auth error messages avoid disclosing account existence or SMTP/provider secrets.
- Every mutation should validate same-origin or the explicit webhook signature contract.

## 2. Authentication, diagnostics and contact

| Method | Route | Access | Responsibility |
|---|---|---|---|
| GET, POST | /api/auth/[...all] | Better Auth handlers; auth runtime must be configured | Better Auth API for sign-in, sign-out, sessions, verification, reset and social auth. Direct email sign-up endpoint is blocked; registration uses dedicated /api/labs/register. |
| POST | /api/labs/register | Public, rate-limited | Validates email/password, safe returnTo, delivery config and registration attempt; uses generic response to reduce account enumeration; starts verification flow and Better Auth registration. |
| POST | /api/labs/verification/resend | Public flow endpoint, rate limited by auth/provider controls | Validate email, create a verification flow and request a new email verification message where configured. |
| GET | /api/labs/verification/status?flow=... | Public flow token lookup | Returns whether the verification flow has been marked verified before its expiry. Flow ID must be a UUID; response is no-store. |
| POST | /api/contact | Public, server validates | Validates contact form data, then sends via Gmail SMTP. Config missing returns 503; malformed body 400; validation errors 422; mail errors 500. |
| GET | /api/health/database | Operational diagnostic | Tests configured database connectivity. Review current response before exposing this route publicly. |
| GET | /api/source-snapshot?path=... | Development only | Reads source file line array for error diagnostics. Always returns 404 in production; path must remain inside src and traversal is rejected. |

Better Auth provider login endpoints are dispatched through the catch-all route. Provider code only enters Better Auth config when its server credential pair is present. See future/GOOGLE-GITHUB-OAUTH.md for configuration verification.

## 3. Public Labs

| Method | Route | Access | Request / response purpose |
|---|---|---|---|
| GET | /api/v1/labs | Public | Query category and validated cursor; fixed page size 18; returns data.experiments and data.nextCursor. |
| GET, POST | /api/v1/labs/[slug]/engagement | Public read; guest or verified account mutation; same-origin POST | GET returns aggregate current likes and current actor's liked/likeAllowed state. POST requires body.liked boolean and returns updated public engagement state. |
| GET | /api/v1/labs/[slug]/source | Verified-email session only | Returns only the currently published source snapshot after experiment and file validation. Guest/unverified gets no source bytes. |
| POST | /api/v1/labs/[slug]/source/events | Verified user only; same-origin | Records allowlisted source_open/code_copy events for a published source/version. Event ID/deduplication and quota checks apply. |
| GET | /api/v1/labs/[slug]/runtime/[artifactId]/[[...path]] | Public only for matching published artifact | Serves entry/document or one immutable artifact asset with path validation, runtime CSP and no-store/security headers. maxDuration is 15 seconds. |

## 4. Owner Labs analytics and account status

| Method | Route | Access | Responsibility |
|---|---|---|---|
| GET | /api/v1/admin/labs/owner-status | Current session; owner status response | Returns account/owner readiness for owner UI. |
| GET | /api/v1/admin/labs/analytics | Owner | Aggregated Labs dashboard data for the selected allowed day range. |
| GET | /api/v1/admin/labs/analytics/[slug] | Owner | Aggregated metrics for one experiment. The page additionally loads active verified likes through owner-analytics service. |

The dashboard page uses initial server report plus client polling. API query period validation belongs to owner analytics read-query logic; do not accept arbitrary days.

## 5. Owner experiment metadata

| Method | Route | Access | Request / response purpose |
|---|---|---|---|
| POST | /api/v1/admin/labs/experiments | Owner + same-origin | Create a custom experiment using validated metadata; response includes server-derived experiment/workspace data. |
| PATCH, DELETE | /api/v1/admin/labs/experiments/[slug] | Owner + same-origin | PATCH edits metadata with optimistic concurrency hints (expectedUpdatedAt/requestId); DELETE requires confirmSlug and invokes safe cleanup/reference logic. |

Metadata and source files are separate data domains. Do not assume PATCH updates a build artifact.

## 6. Owner Source Library, versions and lifecycle

| Method | Route | Access | Request / response purpose |
|---|---|---|---|
| GET, POST | /api/v1/admin/labs/sources | Owner; POST same-origin | List inventory; create a source workspace for a canonical experiment slug. |
| GET | /api/v1/admin/labs/sources/[slug] | Owner | Read full owner source aggregate/working files. |
| GET, POST | /api/v1/admin/labs/sources/[slug]/versions | Owner; POST same-origin | List immutable versions; POST saves a validated draft snapshot with expectedDraftVersionId/requestId/changeSummary concurrency metadata. |
| GET | /api/v1/admin/labs/sources/[slug]/versions/[versionId] | Owner | Read one immutable source version. |
| POST | /api/v1/admin/labs/sources/[slug]/restore/[versionId] | Owner + same-origin | Restore an older version by creating a new draft version; supports expectedDraftVersionId/requestId. |
| POST | /api/v1/admin/labs/sources/[slug]/preview | Owner + same-origin | Validate working-copy files and create an isolated sandbox preview; request-size limit and maxDuration=60. |
| POST | /api/v1/admin/labs/sources/[slug]/publish | Owner + same-origin | Build an exact saved version, create immutable artifact and publish the version/artifact pointer. Declares maxDuration=60. |
| POST | /api/v1/admin/labs/sources/[slug]/unpublish | Owner + same-origin | Unpublish with expectedPublishedVersionId and requestId concurrency checks. |
| GET | /api/v1/admin/labs/sources/[slug]/audit | Owner | Read recent audit history; limit query is numeric and bounded by the service. |
| POST | /api/v1/admin/labs/sources/import-runtime | Owner + same-origin | Import reviewed code-owned built-in runtime source files into owner source workspaces. |
| POST | /api/v1/admin/labs/sources/import-magnetic-button | Owner + same-origin | Import the reviewed MagneticButton component source project, metadata and source snapshot. |

The import routes remain in code, even though the former visible Initialize sources link was removed from /admin/labs/sources. Do not expose or restore that button without an explicit product decision.

## 7. Owner Labs media

| Method | Route | Access | Request / response purpose |
|---|---|---|---|
| GET | /api/v1/admin/labs/experiments/[slug]/media | Owner | Return media assets and release poster status for an experiment. |
| POST | /api/v1/admin/labs/experiments/[slug]/media/upload-intent | Owner + same-origin | Create a bounded authenticated Cloudinary upload intent. |
| POST | /api/v1/admin/labs/experiments/[slug]/media/finalize | Owner + same-origin | Verify a completed Cloudinary upload against its uploadIntentId and finalize asset metadata. |
| PUT | /api/v1/admin/labs/experiments/[slug]/media/attachments | Owner + same-origin | Save experiment media attachment reference(s), constrained by schema roles. |
| PUT | /api/v1/admin/labs/experiments/[slug]/media/gallery-preview | Owner + same-origin | Select/remove an approved public static gallery poster and its alt/fit metadata. maxDuration=30. |

Media upload uses an intent/finalize workflow. Browser upload completion alone does not make an asset a valid experiment attachment. Gallery poster is bound to release/artifact/version; fallback media is a distinct attachment role.

## 8. Portfolio Analytics

| Method | Route | Access | Request / response purpose |
|---|---|---|---|
| POST | /api/v1/portfolio/visits | Public allowlisted route/host only; rate limited | One action body: start, heartbeat, pause, resume or end. Start returns data; lifecycle actions return accepted boolean (202) to avoid leaking visit ownership. |
| GET | /api/v1/admin/portfolio/analytics | Owner | Query view=summary or recent, allowed days and cursor; returns aggregate report or paginated recent visits. |
| DELETE | /api/v1/admin/portfolio/analytics/visits | Owner + same-origin | Delete visits under an approved validated deletion scope. Never accept arbitrary browser Mongo filters. |

The public visit endpoint feature-gates tracking and canonical host checks. It does not identify a unique person. See pages/ANALYTICS-ENGINEERING.md for lifecycle, rate limit, privacy and dashboard rules.

## 9. Request/response and error conventions

- JSON API handlers commonly return {data: ...} for success and {error:{code,message}} for mapped failures.
- Admin mutation handlers must parse JSON before domain calls; invalid JSON returns 400.
- Same-origin failure returns 403.
- owner permission denial is mapped through adminError or endpoint-specific no-store error response.
- Validation failure is 400/422 depending on the handler's established contract; do not normalize status codes without updating callers/tests.
- Not-found for an unpublished/private resource should avoid revealing private existence to an unauthorized actor.
- Runtime route is a binary/text artifact response, not the generic JSON envelope.
- Contact and Better Auth routes have dedicated response contracts.

## 10. Field-level contract maintenance process

Before changing an endpoint:
1. inspect the Route Handler;
2. inspect every called service and schema/normalizer;
3. inspect the client caller;
4. inspect the error/status mapping;
5. update this inventory and the domain-specific document;
6. add/adjust regression tests;
7. verify direct requests as guest, verified user, owner and mismatched owner as relevant.

Do not create a second copy of every request shape here. Domain documents and function-level code should own detailed field schemas; this file owns the route-level index.
