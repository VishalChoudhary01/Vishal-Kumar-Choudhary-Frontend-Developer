# System Architecture and Responsibility Boundaries

**Status:** Target architecture contract; must be reconciled against the actual repository in Phase 0.  
**Version:** 1.0  
**Related:** PRD.md, PROJECT-STRUCTURE.md, API-CONTRACTS.md, IMPLEMENTATION-PLAN.md

## 1. Purpose
Prevent developers and AI agents from confusing UI rendering, HTTP transport, business rules, authorization, validation, persistence, background jobs, and untrusted preview execution. Every feature must have one clear owner for each responsibility.

## 2. Architectural decisions
### Approved baseline
- Next.js App Router, React, JavaScript, Tailwind CSS v4 and Motion (motion/react).
- TanStack Query for client-side server-state use cases that benefit from caching, mutation lifecycle, invalidation or polling.
- MongoDB for application persistence; Cloudinary for media; Vercel for the existing Next.js application.
- Use the existing repository conventions when they are sound. This target architecture is not permission to restructure unrelated files.

### Backend decision
**Default: Next.js-native backend.** Use server-only modules, Route Handlers and Server Actions as appropriate. Do not create a separate Express server by default.

**Express is OPEN / conditional.** It requires a written architecture decision and explicit approval if a concrete runtime or operational requirement justifies a separate API service. An isolated execution worker may require separate infrastructure, but that does not automatically mean the general application API should use Express.

### Still open
Authentication provider/session implementation, MongoDB host, durable scheduler, interactive preview execution provider, detailed cache strategy, and final schemas/indexes.

## 3. Layer responsibilities

### A. Presentation layer
Owns:
- Rendering components, layouts, forms, tables, filters, chart views, preview controls and accessible feedback.
- Local UI state such as an open dialog, current tab or unsaved input.
- Calling an approved Server Action or API client.
- Rendering loading, empty, success and error states.

Must not:
- Connect to MongoDB or Cloudinary Admin APIs directly.
- Contain privileged secrets.
- Decide authorization based only on a hidden button or client role flag.
- Reimplement business rules independently from server-side validation.

### B. Server page / route composition
Owns:
- Server-side page data loading for safe public content.
- Composition of route-level UI and server/client component boundaries.
- Metadata generation from published content.
- Selecting published versions for public routes.
- Applying route-specific cache behavior.

Must not:
- Return draft or private source data into public serialized payloads.
- Treat a page's lack of a link as access control.
- duplicate domain business rules inline across pages.

### C. Transport layer
Includes Next.js Route Handlers and Server Actions.
Owns:
- Parsing requests/form data.
- Authentication context resolution.
- Input schema validation at the boundary.
- Calling domain use cases.
- Mapping known outcomes into stable response/error shapes.
- Rate limiting, CSRF/origin protections as applicable to the chosen auth/session design.
- Appropriate HTTP status codes for Route Handlers.

Must not:
- Become the only location where complex domain rules live.
- Query arbitrary collections directly from UI-facing handlers.
- Trust client-supplied user IDs, roles, publication state, prices, counts or ownership.

### D. Domain / business logic layer
Owns use cases and invariants such as:
- Draft save versus publish.
- Immutable version creation and restore.
- Slug uniqueness.
- One active authenticated like per user/experiment.
- Permission decisions for source access and previews.
- Media usage/reference integrity.
- Scheduled publication against an exact immutable version.
- Analytics event semantics and idempotency.
- Account deletion policy and related data handling.

Domain services should accept explicit inputs and trusted actor/context, validate invariants, and return typed-by-convention result objects or throw mapped domain errors. Keep them independent of React rendering and HTTP response objects.

### E. Data access / repository layer
Owns:
- MongoDB queries and writes.
- Collection-specific access patterns.
- Transactions/atomic operations where supported and needed.
- Index assumptions and pagination.
- Mapping database records to domain objects.
- Persistence-only concerns.

Must not:
- Be imported into client components.
- Decide presentation behavior.
- Accept an arbitrary user query directly from a browser.
- Silently bypass domain authorization or publication rules.

### F. Validation / schema layer
Owns reusable input and stored-data schemas, normalization, URL/slug/file validation and safe enum constraints. Validate untrusted inputs at the transport boundary and enforce domain invariants in the domain layer. Database-level constraints/indexes should reinforce—not replace—application checks.

### G. Infrastructure adapters
Owns wrappers for MongoDB, Cloudinary, authentication provider, cache revalidation, scheduling, logging and the isolated preview system. Keep provider-specific calls out of domain logic where practical.

### H. Background job layer
Owns scheduled publication, retry, idempotency, execution status and recovery. A job must use a specific immutable version ID and verify its state before publishing. The job mechanism must run independently of a browser session and comply with the selected deployment runtime.

### I. Analytics ingestion and query layer
Ingestion validates allowed event names and metadata, deduplicates as designed and applies abuse safeguards. Reporting queries aggregate on the server/database. Never send full raw event history to a browser when aggregate data is sufficient.

### J. Isolated preview boundary
Untrusted experiment source must not execute in the main application process/origin with privileged app context. The sandbox design must specify origin separation, CSP, allowed dependencies, network policy, resource/time limits, messaging, data exposure and failure behavior. An iframe alone is not evidence that the design is secure. The provider and implementation are OPEN until threat-model approval.

## 4. Request flow
### Public published content
Browser request → App Router page → server-only use case/query → repository → MongoDB → select published snapshot → approved public DTO → page render → cache according to public policy.

### Protected admin mutation
Admin UI → Server Action or Route Handler → authenticate actor → validate input → authorize action against server-loaded role/resource → domain use case → repository transaction/atomic update → audit/status result → revalidate affected public cache only after successful publication transition → safe response to UI.

### Full source access
Authenticated client request → server session verification → experiment publication/access policy → source version lookup → source DTO response with private/no-store policy as required → record access event according to approved analytics definition. Do not preload source in guest payloads.

### Media upload
Admin UI requests upload authorization → server checks admin permission and upload policy → server creates constrained signed upload parameters → browser uploads to Cloudinary → server validates returned asset and records metadata/reference → editor can attach asset. Never expose Cloudinary API secret.

### Scheduled publish
Scheduler/worker claims job idempotently → verifies due time, target immutable version and current schedule state → domain publication operation → updates publication pointers/status atomically where possible → revalidates affected cache → records success/failure → bounded retry/manual recovery.

## 5. Middleware rules
Middleware may be used for lightweight request routing, canonical redirects, coarse route gating, security headers or request correlation where supported. It is not the only authorization layer.

- Every protected Server Action, Route Handler and data-access use case must independently enforce required authentication/authorization.
- Do not rely on middleware alone to protect MongoDB queries or source responses.
- Avoid database-heavy middleware on every public request.
- Never put secrets or privileged data into middleware-visible client state.
- Auth/session mechanics and exact middleware strategy remain subject to provider/runtime validation.
- Keep public routes working without unnecessary session/database lookups.

## 6. Authorization policy
Roles: Guest, Registered User, Admin.
- Guest: published public metadata/media and allowed partial source only.
- Registered User: guest access plus authorized full source, isolated interactive preview, likes and own dashboard/account data.
- Admin: all approved management operations after server-side verification.
- Admin assignment occurs only through trusted manual provisioning.
- Check ownership and resource state in the use case, not only at route entry.
- Protect against IDOR by checking every resource access against actor and resource policy.
- Preview, draft, version and source endpoints use explicit private cache policy.
- Deny by default; return safe error shapes without leaking record existence when sensitive.

## 7. Data and cache boundaries
- Public data access selects the published version only.
- Draft and preview data must be private, non-indexable and excluded from public shared caches.
- Authenticated source/user data must not be cached across users.
- Revalidate relevant paths/tags after successful publication and unpublish transitions, not after draft saves.
- Define cache ownership to avoid contradictory Next.js, HTTP/CDN and TanStack Query caches.
- Cache invalidation failure must be observable and recoverable; do not report full success if the live route may remain stale without a recovery mechanism.

## 8. Error handling and observability
Use stable error categories such as validation, unauthenticated, forbidden, not found, conflict/stale version, rate limited, dependency unavailable and internal error. Expose actionable messages without stack traces, credentials or sensitive source. Log correlation IDs, safe actor/resource identifiers and operation outcomes while minimizing personal data. Do not log passwords, tokens, full source payloads or raw signed upload credentials.

## 9. Testing boundaries
- Presentation: accessibility, responsive layout and interaction tests.
- Domain: unit tests for invariants and state transitions.
- Repository: integration tests for indexes, queries, atomic writes and version behavior.
- Transport: request validation, status mapping, auth and rate limits.
- End-to-end: role matrix, publishing workflow, source privacy, cache invalidation and regression routes.
- Security: IDOR, draft leakage, open redirect, upload abuse, sandbox escape attempts and analytics abuse controls.

## 10. Agent implementation rules
Before touching a feature, identify its route, presentation components, domain use case, schema, repository, transport entry point, permission policy, cache policy and tests. Update API-CONTRACTS.md and related docs when a contract changes. Do not invent route paths, collection fields, env names, dependencies or infrastructure details that are not supported by approved docs/repository inspection. If a required choice is open, report the blocker or propose options rather than silently selecting one.
