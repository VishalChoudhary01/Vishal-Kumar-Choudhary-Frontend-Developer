# Architecture Decision Records

**Status:** Phase 1 decision register; choices marked OPEN are not approved.  
**Branch:** `docs/portfolio-platform-spec`  
**Related:** PRD.md, ARCHITECTURE.md, API-CONTRACTS.md, IMPLEMENTATION-PLAN.md, THREAT-MODEL.md

This document records current decisions, known repository facts and unresolved choices separately. A proposed design is not an implemented capability. Update this register when a decision is approved; record its rationale, consequences and any required migration.

## ADR-001 — Preserve the existing application architecture

- **Status:** Accepted
- **Decision:** Extend the existing Next.js App Router application in its current `src/app` organization. Do not replace or broadly restructure unrelated folders.
- **Context:** Existing homepage/project routes rely on canonical JS data, SEO utilities, static project parameters, shared presentation components, lazy-loaded sections and loader/provider behavior.
- **Consequences:** Introduce new platform boundaries incrementally. Keep public route/component contracts stable and test them before and after relevant changes.
- **Evidence:** `docs/FOUNDATION-AUDIT.md`.

## ADR-002 — Next.js-native backend by default

- **Status:** Accepted
- **Decision:** Use server-only modules, Route Handlers and Server Actions as appropriate. Do not add a separate Express server by default.
- **Context:** Existing deployment is a Next.js application on Vercel; no separate API service is evidenced in the inspected manifest.
- **Consequences:** Evaluate background scheduling and isolated preview execution independently; their runtime constraints do not automatically justify moving the entire API to Express.
- **Express:** OPEN/conditional. Requires a concrete documented requirement and explicit approval.

## ADR-003 — JavaScript remains the implementation language

- **Status:** Accepted
- **Decision:** Keep JavaScript/JSX. No TypeScript migration is authorized by the platform expansion.
- **Consequences:** Adopt consistent validation schemas, runtime validation and documented object contracts without changing the language stack.

## ADR-004 — Application persistence and media provider

- **Status:** Approved direction; deployment details OPEN
- **Decision:** MongoDB for application persistence and Cloudinary for media assets.
- **Still OPEN:** MongoDB host, connection lifecycle, backups, network restrictions, indexes/transactions; Cloudinary account/environment setup, signed-upload constraints and asset lifecycle.
- **Consequence:** No client-side database access and no Cloudinary Admin secret in browser code.

## ADR-005 — Authentication and sessions

- **Status:** OPEN
- **Requirement:** Email/password and Google sign-in; required lifecycle includes verification, password reset, secure logout/session handling, profile management and account deletion. GitHub sign-in/multi-provider scope must be reconciled with the PRD before implementation.
- **Not decided:** Provider/library, session/token mechanism, cookie policy, account linking, rate limits and recovery mechanics.
- **Rule:** Do not implement a custom password/session protocol or add an auth package until a provider/session decision is approved.

## ADR-006 — Client-side server-state management

- **Status:** Approved selectively
- **Decision:** TanStack Query may be used where client-side server-state benefits from cache, mutation lifecycle, invalidation, polling or client-driven refetch.
- **Constraints:** It is not mandatory for every route. Prefer server-side data loading for server-rendered public content. It does not replace server authorization or Next.js/CDN cache revalidation.
- **Dependency change:** Confirm concrete use cases and public bundle impact before adding it.

## ADR-007 — Admin role provisioning

- **Status:** Accepted
- **Decision:** Public registration never grants Admin. Admin access is assigned only through a trusted provisioning process and enforced server-side.
- **Consequence:** No user-editable role field or client-side admin flag is authoritative.

## ADR-008 — Content versioning and publishing

- **Status:** Accepted product requirement; schema details OPEN
- **Decision:** Keep immutable content snapshots; distinguish draft and published version pointers. Saving a draft does not publish. Restore creates a new version. Scheduled publication targets an exact immutable version.
- **Still OPEN:** Concrete document schema, concurrency token, transaction boundaries, version indexing and retention/storage policy.

## ADR-009 — Interactive Lab execution

- **Status:** BLOCKED pending dedicated security review
- **Decision:** Never execute arbitrary user/admin-supplied JavaScript in the main application process/origin with privileged app context.
- **Still OPEN:** Runtime provider, origin model, network policy, dependency allowlist, resource limits, message protocol and cost/abuse controls.
- **Gate:** No implementation or enabling interactive execution until the sandbox threat model is approved and escape tests exist.

## ADR-010 — Scheduled publishing

- **Status:** OPEN
- **Requirement:** Independent execution, immutable-version targeting, idempotency, bounded automatic retries, cancellation/status and manual recovery.
- **Not decided:** Durable scheduler/worker/provider, invocation authentication, lease mechanism, retry schedule and operational monitoring.
- **Rule:** Do not use an admin browser timer or assume a Vercel request can remain alive until a future publication time.

## ADR-011 — Cache and revalidation

- **Status:** Policy accepted; exact implementation OPEN
- **Decision:** Published public content may be cached and revalidated after successful publish/unpublish. Drafts, source, admin and user-specific data must not leak through shared caches.
- **Still OPEN:** Exact tags/paths, HTTP/CDN cache headers, cache ownership, failure recovery and deployment-specific behavior.
- **Gate:** Test published transitions, stale responses and cross-user isolation before CMS release.

## ADR-012 — Analytics and privacy

- **Status:** Requirements accepted; retention policy OPEN
- **Decision:** Validate allowlisted events, minimize personal data, separate guest/authenticated attribution where meaningful, and label observed actions honestly. Copy events are not proof of use; guest likes do not prove unique people.
- **Still OPEN:** Retention periods, guest identifier strategy, deduplication window, rate-limit infrastructure, deletion/export behavior and final metric formulas.

## ADR-013 — Public portfolio performance protection

- **Status:** Accepted
- **Decision:** Admin/editor/chart/preview code must not be added to the public critical bundle without measured justification.
- **Controls:** Lazy-load heavy modules; avoid unnecessary global providers; measure bundle/build/browser performance and compare screenshots/behavior on existing public routes.
- **Gate:** Existing homepage and project detail UI, motion, SEO, responsiveness and functionality must pass regression checks.

## ADR-014 — API contract shape

- **Status:** OPEN
- **Candidate:** Stable JSON success/error envelopes and proposed endpoint inventory in `API-CONTRACTS.md`.
- **Not decided:** Final endpoint paths, Server Action versus Route Handler per operation, validation library and exact DTO/schema field names.
- **Rule:** Proposed API paths in planning docs are not implemented endpoints.

## ADR-015 — Foundation baseline evidence

- **Status:** INCOMPLETE
- **Known:** Repository source inspected and findings recorded in `FOUNDATION-AUDIT.md`.
- **Missing:** Local dependency install, lint, SEO validation, production build, browser screenshots, performance/accessibility measurements and production source-snapshot check.
- **Gate:** Do not claim baseline passed and do not establish numeric performance improvement claims until evidence is recorded.

## Decision approval log

No new infrastructure provider or runtime has been selected by this register. The accepted items above capture directions already present in the platform plan and repository evidence; all OPEN/BLOCKED items remain unresolved.
