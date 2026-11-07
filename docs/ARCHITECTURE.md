# System Architecture and Responsibility Boundaries


> **Current-state clarification (2026-11-07):** This file is the original responsibility-boundary/target architecture contract. It is not the current repository topology map. For what is implemented today, read [architecture/SYSTEM-ARCHITECTURE.md](./architecture/SYSTEM-ARCHITECTURE.md). For the current route, data model, scroll/motion and runtime maps, use the corresponding current-state guides linked from [README.md](./README.md). Where this older target document describes a proposal (for example TanStack Query, jobs or modules), do not infer that the dependency or architecture exists in the running code.

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
Email-delivery vendor and template operations, Better Auth session-lifetime/concurrency policy, MongoDB host/backup controls, durable scheduler, interactive preview execution provider, detailed cache strategy, and final schemas/indexes. Better Auth with the MongoDB adapter is selected and implemented as the Labs auth foundation.

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

### J. Isolated preview and build boundary
Untrusted experiment source must not execute in the main application process/origin or a privileged application context. React/JSX, Tailwind CSS v4 and Motion projects must be compiled in an ephemeral isolated build worker using a pinned toolchain and fixed dependency allowlist. The resulting static artifact runs in a sandboxed iframe from a dedicated runtime origin. Specify origin separation, CSP, cookie/storage separation, network policy, package allowlist, CPU/memory/time/output limits, validated messaging, media access and failure recovery. An iframe alone is not evidence that the design is secure. The final provider, artifact store and runtime host remain OPEN until threat-model approval.

## 4. Request flow
### Public published content
Browser request → App Router page → server-only use case/query → repository → MongoDB → select published snapshot → approved public DTO → page render → cache according to public policy.

### Protected admin mutation
Admin UI → Server Action or Route Handler → authenticate actor → validate input → authorize action against server-loaded role/resource → domain use case → repository transaction/atomic update → audit/status result → revalidate affected public cache only after successful publication transition → safe response to UI.

### Full source access
Authenticated client request → Better Auth session and verified-email check → published source version lookup → private/no-store source DTO → record successful source-open event with an idempotency key. Guests and signed-in unverified users are denied before source lookup. Do not preload source in public or unverified payloads.

### Media upload
Owner UI requests an upload intent → server verifies singleton-owner permission and the allowed media class/quota → server creates constrained short-lived Cloudinary signed upload parameters → browser uploads directly to Cloudinary → server verifies upload intent/provider metadata/actual format → LabMediaAsset metadata is persisted → owner attaches the ready asset to a draft/release manifest. Initial Labs formats are JPEG, PNG, WebP, AVIF, GIF, MP4 and WebM; SVG is excluded pending sanitization. Never expose the Cloudinary API secret or treat client-supplied asset IDs as proof of ownership. Exact size/duration quotas depend on the actual Cloudinary account plan.

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
Roles/capabilities: Guest, Registered User (email unverified), Verified Registered User, and singleton Owner/Admin.
- Guest: published public metadata/media and explicitly public code-owned demos only. No source files, source snippets or source copying. Public experiment likes remain best-effort/browser-scoped where supported.
- Registered User with unverified email: guest capabilities only; no source or copy. Public experiment likes remain best-effort/browser-scoped where supported.
- Verified Registered User: full source for every published experiment automatically; may copy source and like/unlike experiments. No per-user source grant is required.
- Owner/Admin: all approved management operations after server-side singleton-owner verification, including draft/version/source management and aggregate source-engagement analytics.
- Owner assignment occurs only through trusted server-side `LABS_OWNER_USER_ID` provisioning; public registration never elevates privileges.
- Check identity, verification, publication state and resource state in the use case, not only at route entry.
- Protect against IDOR by deriving actor identity from the server session and checking each resource access.
- Preview, draft, version, source, analytics and owner endpoints use explicit private/no-store cache policy as applicable.
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


## 11. Labs authentication implementation note

The Labs authentication foundation uses Better Auth with `@better-auth/mongo-adapter` and the existing MongoDB database. The Better Auth API is hosted by the Next.js App Router at `/api/auth/[...all]`; the direct email sign-up endpoint is blocked so registration must pass through the consent-aware Labs registration route. Target server-side source access verifies a Better Auth session with `emailVerified === true` and a published source pointer before querying the private source collection; no per-user grant is required. The current grant query is legacy and must be removed in the approved migration. See `LABS-AND-AUTHENTICATION-DESIGN-SPEC.md` Section 36 and `LABS-AUTHENTICATION-AND-SOURCE-ACCESS.md` for setup and provisioning.

This implementation is a feature foundation, not proof of production readiness: SMTP/Google/legal configuration, source provisioning, session-policy approval, full security testing and the private-code migration boundary remain release gates.


## 12. Consent and verification receipt storage

Labs registration consent is persisted separately from editable Better Auth user profile fields. The server writes a receipt to `labs_registration_consents` before calling Better Auth registration; it uses an HMAC of the normalized email address, the current legal-document versions and a server timestamp. A Better Auth user-create hook links the receipt to the persisted user ID. The client cannot submit or modify the legal version/timestamp fields.

Verification-flow IDs are stored separately in `labs_verification_flows`. Better Auth's post-email-verification hook marks current flows for that email digest. The verification page checks the opaque flow ID against this server-side status rather than trusting a query-string flag. These flow records expire through a MongoDB TTL index after seven days; legal consent receipts are not covered by this transient-flow TTL.
## 13. Owner-managed Labs source boundary

The source-management plan is detailed in `LABS-SOURCE-MANAGEMENT-SPEC.md`. This section establishes the architecture boundary; it does not claim that owner management or immutable versions exist in the current code.

### 13.1 Owner identity and authorization

- The initial release is a singleton-owner capability, not general multi-role administration.
- **Locked — user approved 2026-11-04:** bootstrap is server-only `LABS_OWNER_USER_ID`, containing the stable Better Auth user ID for the already-created, verified owner account. The owner is the sole privileged administrator for this first release and manages all Labs source lifecycle and source-engagement analytics.
- A missing/mismatched owner ID denies all owner operations. Never elevate the first account, email supplied by the browser, client role flags or arbitrary request headers. Configure the value separately for Preview and Production; do not expose it through `NEXT_PUBLIC_*`.
- Resolve actor identity from Better Auth session only. Owner guard must be called independently at Route Handler/Server Action, domain use case and repository boundaries.
- Owner management permission is separate from regular source reads. The owner can manage drafts and versions without a self-grant; every other verified account can read any published source automatically.
- Do not persist a general role field or multi-admin hierarchy merely to support the first owner. A future multiple-admin model requires a separate decision and threat-model update.

### 13.2 Source lifecycle and persistence

- Separate the mutable source aggregate/head from immutable source-version snapshots.
- Source aggregate stores canonical experiment slug and draft/published version pointers.
- Immutable version records store text files, server-computed content hash, version number, parent/restored-from version, actor and timestamp.
- `lab_likes` maintains one persistent like-state record per verified user + experiment. `lab_analytics_events` records verified source opens/copies/like transitions and separate anonymous guest-like action counts where supported. `lab_source_audit_events` records owner mutations.
- Save draft, publish exact version, unpublish and restore are separate domain use cases with concurrency checks and idempotency. There are no per-user source-grant use cases in the target design.
- Never overwrite an immutable version. Restore creates a new version. Publishing never executes the saved code.
- Data migration and index bootstrap must be idempotent and preserve any existing source documents. The legacy `lab_source_grants` model/collection must be retired only after all runtime references are removed and any existing records are reconciled; it must not gate verified-user access.

### 13.3 Source editor trust boundary

- Owner editor writes text-only source. It is not an execution environment, terminal, build service or package installer.
- Validate source paths, encodings, language allowlist, byte/file limits, duplicate paths and suspicious secret content server-side. Never log matched secret values or full source content.
- Owner-only source drafts, versions, inventory and audit are private/no-store.
- The editor and syntax-highlighting dependencies load only inside the owner workspace and must not enter public homepage, Labs listing or public demo bundles.
- Editor dependency remains open; inspect the package manifest and bundle impact before approving Monaco/CodeMirror or other packages.

### 13.4 Execution is a planned capability with an explicit security gate

- The current srcDoc iframe runner is a limited HTML/CSS/JavaScript prototype. It is not production security approval and does not execute React/JSX, compile Tailwind v4 or bundle Motion.
- The target Studio supports browser-only HTML/CSS/JavaScript and React/JSX authored projects. React, ReactDOM, Tailwind v4 and Motion (motion/react) must use pinned compiler/runtime versions and a fixed package allowlist.
- Compile in an ephemeral worker with no application secrets, no arbitrary package installation and no outbound network. Emit immutable static build artifacts outside MongoDB.
- Run artifacts from a dedicated origin inside a sandboxed iframe. Do not grant app cookies, local storage, parent DOM/API access or unrestricted network egress.
- Bind the built artifact to the exact source hash and media manifest. A draft save or preview run never publishes automatically.
- Production publication remains blocked until the full runtime threat model, cross-origin isolation, CSP, resource limits, messaging and abuse-recovery tests pass.
- Existing four code-owned public demos remain unchanged by this custom-experiment runtime.

### 13.5 Owner source-management request flow

Owner request → Better Auth session → server-only singleton-owner check → input/schema validation → source domain use case → repository transaction/conditional update → append-only owner audit record → private/no-store response. No owner operation is authorized solely by the admin route layout or a hidden control.

### 13.6 Verified-user source engagement analytics

- Only users with a valid Better Auth session and `emailVerified === true` may open source, copy code or like/unlike experiments.
- A successful source-open event is recorded after the protected source response is successfully authorized and returned. Public experiment detail-page views are a separate event.
- Code-copy events are accepted after the client reports a successful Clipboard API write; the server rechecks the verified session and current published source. Never send or store clipboard contents.
- Verified-account like/unlike analytics events are recorded only for actual server-confirmed transitions in the unique per-user/per-experiment like-state record. Best-effort guest-like actions may be recorded separately where supported, without unique-person attribution.
- Owner/Admin dashboard queries aggregate by experiment and date range: detail views, source opens, unique verified accounts opening source, copy actions, current active verified likes, verified like/unlike transitions, and separate guest-like action counts where measurable, plus rankings and trends.
- The dashboard does not expose individual account browsing/copy/like histories or emails in the first release. Event storage uses server-derived IDs for idempotency/abuse control and minimizes personal data.

## 14. Labs Experiment Studio runtime and media architecture

The product-level runtime contract, media model, immutable release model, build phases and acceptance tests are maintained in `LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md`.

Architecture summary:

- Authored project source and uploaded binary media are separate data classes. Code snapshots remain immutable text versions; images/GIFs/videos are Cloudinary assets referenced by stable IDs.
- React/JSX is transformed and bundled in a restricted build worker. Tailwind v4 CSS is generated at build time with the approved PostCSS integration. Motion code runs only in the isolated browser runtime.
- Build output is an immutable static artifact stored in a dedicated artifact/object store, not embedded in MongoDB source files or treated as a Cloudinary media asset.
- A release manifest ties the exact experiment metadata, source version, successful build artifact and ordered media asset manifest together. The published pointer advances only after all references are ready and content hashes match.
- Labs listing cards use a lightweight optional cover. The public detail page renders the actual interactive published demo and may also show a media gallery.
- Verified registered users receive source access to the published release automatically. Public runtime/media access does not make source files public.
- Vercel Sandbox, compiler choice, artifact storage provider, exact package pins and Cloudinary quotas remain open pending operational and security validation.
