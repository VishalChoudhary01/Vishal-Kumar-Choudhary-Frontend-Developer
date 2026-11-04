# Implementation Plan — Portfolio Platform

**Status:** Living implementation plan. The `feat/labs-public-page` branch contains an initial public Labs, Better Auth and protected-source-read foundation. Owner-managed source creation/versioning, verified-account engagement analytics, grant-model retirement and complete release verification remain planned. Phase entries below are not evidence of completion unless explicitly recorded in the current-state section.

## Principles
- Inspect first; change second.
- Preserve the existing public portfolio and its source-of-truth design/architecture documents.
- Do not start coding until the baseline audit, repository map, impact assessment and implementation approach are reviewed.
- Use the locked stack: Next.js App Router, JavaScript, Tailwind CSS v4, Motion (`motion/react`), MongoDB, Cloudinary and Vercel.
- Keep decisions open when they remain unselected; document alternatives and validation requirements.
- Prefer small, reversible phases and isolated commits. No broad rewrites for convenience.

## Current implementation baseline — 2026-11-04

The following is the inspected code baseline, not a production-readiness certificate:

| Capability | Current state on `feat/labs-public-page` | Remaining work |
|---|---|---|
| Public Labs listing/detail and code-owned demos | Implemented | Regression verification and approved outstanding UX polish |
| Better Auth + MongoDB adapter | Foundation implemented | Final session policy and security/release tests |
| Email/password registration, verification, reset and SMTP transport | Implemented in branch and configured for Preview; email delivery observed | Validate real verification completion, duplicate behavior, reset, production deployment |
| First-party Terms/Privacy pages and consent receipts | Implemented | Legal review and operational rights/deletion workflow review |
| Protected source read endpoint with legacy per-user grant check | Implemented (transitional) | Remove grant lookup; automatically allow any verified account to read a published source; provision source snapshots and complete authorization tests |
| Source record creation/file editor/versioning/publish/restore | Not implemented | Phase 8 source-management slice described in `LABS-SOURCE-MANAGEMENT-SPEC.md` |
| Owner identity/authorization and owner management UI | Not implemented | Approve singleton owner identity, implement server guard and owner workspace |
| Source audit, immutable source versions and engagement analytics storage | Not implemented | Add source-version/audit/likes/events collections, indexes, migration and analytics tests |
| Isolated execution of stored/admin-authored source | Not implemented and not approved | Separate Phase 8B threat-model and infrastructure decision |
| General CMS/Admin, media management, analytics and scheduling | Deferred | Begin only after Labs work is complete and separately authorized |

Do not mark a row complete because a page renders. Each capability still needs its required direct-request, authorization, failure, accessibility, privacy, performance and regression evidence.

## Phase 0 — Repository discovery and baseline
**Work**
- Inspect the actual repository structure, package scripts, routes, shared components, data sources, image pipeline, SEO metadata, current deployment assumptions, auth/data dependencies and project detail implementation.
- Locate and read existing PRD/design/architecture/agent rules; resolve precedence explicitly without overwriting them.
- Inventory current public routes, key interactions, motion behavior, responsive breakpoints, reduced-motion handling and accessibility affordances.
- Record current build/lint/test results and a baseline of public-home and project-detail performance/SEO/accessibility metrics where tooling permits.
- Capture baseline screenshots at representative mobile/tablet/desktop sizes.

**Gate / done**
- Repository map and current behavior inventory exist.
- Baseline checks and known failures are documented rather than concealed.
- No source files changed in this phase.
- Proposed architecture does not contradict existing project rules.

## Phase 1 — Architecture and threat-model approval
**Work**
- Define domain boundaries for portfolio content, Lab content, immutable versions, media references, users/roles, likes, analytics and scheduled jobs.
- Preserve the selected Better Auth + MongoDB adapter implementation. Review the final session-lifetime/concurrency policy, owner identity bootstrap, cache invalidation, scheduler and isolated preview execution where those decisions are still open.
- Define schemas, indexes, migration/backfill strategy, API/server-action contracts, permission matrix and error model.
- Threat-model untrusted source execution, upload signatures, drafts, cache leakage, redirects, analytics abuse and account deletion.
- Specify rollback/recovery for publication and scheduled jobs.

**Gate / done**
- Architecture and execution/security documents are reviewed and consistent with this PRD.
- No untrusted JS runs in the main app.
- Open decisions are either explicitly selected with rationale or left blocked with a named validation task.
- Data migration and deployment/rollback strategy are documented.

## Phase 2 — Data foundations and authorization
**Work**
- Implement validated domain models and indexes.
- Establish server-only data access boundaries and centralized authorization helpers.
- Implement the approved singleton-owner provisioning path without any public self-service owner/admin escalation. The owner identity mechanism remains open pending explicit approval.
- Add safe error handling, rate/abuse controls and audit metadata where required.
- Add tests for protected reads and mutations.

**Gate / done**
- Guest, registered-user and admin access matrix passes direct-route and direct-request tests.
- No secrets or privileged database access enter client bundles.
- Schema/index and migration tests pass.
- Failure responses do not leak private records.

## Phase 3 — Authentication and user account
**Work**
- Implement email/password and Google sign-in, verification, reset, session handling, logout, profile management and account deletion.
- Validate return URLs and preserve safe post-login navigation.
- Implement user dashboard shell and privacy boundaries.

**Gate / done**
- Required auth lifecycle is tested for success, invalid inputs, expired sessions, provider errors and account deletion.
- Admin role cannot be obtained through registration or manipulated client state.
- User-specific data is isolated across accounts.
- Account deletion behavior for likes, activity and content references is documented and tested.

## Phase 4 — Versioned content and publishing primitives
**Work**
- Implement immutable content snapshots and draft/published pointers.
- Implement create/edit/validate/preview/publish/unpublish and version comparison/restore.
- Restore creates a new immutable version.
- Add optimistic concurrency or equivalent protection against conflicting edits.
- Add publication state transitions and safe cache invalidation hooks.

**Gate / done**
- Saving a draft never silently changes published content.
- Public reads expose only the published pointer.
- Restore never mutates an existing version.
- Failure during publish/revalidation is observable and recoverable.

## Phase 5 — Media Library
**Work**
- Integrate Cloudinary through server-authorized signed upload flow.
- Implement multi-upload, metadata, search/filter, usage references, ordered gallery editing, captions/alt text and replacement.
- Validate type/size and protect secrets.
- Handle version-history references and failed uploads/deletes.

**Gate / done**
- Unauthorized uploads fail.
- Replacement preserves valid references.
- Gallery removal does not delete the Cloudinary asset.
- Referenced or historically required assets cannot be deleted silently.
- Upload failures leave a recoverable editor state.

## Phase 6 — Portfolio CMS
**Work**
- Implement dynamic hero/about/skills/experience/projects content forms using established public components/layouts.
- Preserve code-controlled education and design/layout behavior.
- Add project slug validation, galleries, links, featured state, preview and publishing workflow.
- Use existing project detail template for data-driven slugs.

**Gate / done**
- A content change updates only intended dynamic content.
- Existing public route contracts and project details continue to work.
- Invalid slug collisions/links/media references are rejected.
- Public home and project-detail regression suite passes.

## Phase 7 — Lab public experience and discovery
**Work**
- Build listing/detail pages, metadata, static previews, source-access prompt (no guest source bytes), search/filter/sort and pagination/progressive loading.
- Enforce published-only reads and guest restrictions on the server.
- Create accessible loading, empty, error and no-results states.
- Keep Lab-specific dependencies out of the public homepage bundle unless already needed.

**Gate / done**
- Public discovery functions across supported viewport sizes.
- Drafts and full source are not present in guest-visible HTML/API/client bundles.
- Search and filters compose predictably; pagination avoids duplicate/missing results.
- Existing portfolio pages remain visually and behaviorally unchanged.

## Phase 8 — Owner-managed source lifecycle and verified-user access
**Work**
- Follow `docs/LABS-SOURCE-MANAGEMENT-SPEC.md` as the detailed source-management plan.
- Implement the approved singleton owner identity with server-only `LABS_OWNER_USER_ID`; owner operations deny by default when the setting is absent or mismatched.
- Evolve the current mutable LabSource record into a source aggregate with draft/published pointers and immutable source-version snapshots; preserve/migrate existing records safely.
- Add idempotent collection/index bootstrap for source heads, immutable versions, append-only owner audit events, verified-user likes and source-engagement events.
- Retire the legacy `LabSourceGrant` model and `lab_source_grants` collection from the access-control path after checking/exporting any existing records and safely removing runtime references. Do not migrate individual grants as active entitlements.
- Implement owner-only use cases for source creation, file add/edit/rename/delete, save draft, version history, compare/restore, explicit publish/unpublish and audit.
- Implement verified-session source authorization: any Better Auth session with `emailVerified === true` may read every published source. Guests and signed-in-unverified users are denied. No per-user grant, expiry or revoke is required.
- Enforce verified-account code copy and like/unlike; create one active like state per user/experiment and record only server-confirmed state transitions.
- Record successful source opens and code-copy actions with server-derived actor IDs and idempotency keys; never store source text, clipboard contents, email or raw IP in analytics events.
- Build the lazy-loaded owner source workspace and per-experiment source-engagement analytics dashboard. Dashboard aggregates: source opens, unique verified accounts, copies, current active likes, like/unlike actions, trends and rankings.
- Add optimistic concurrency, idempotency, strict text/path/language/byte/secret validation and private/no-store response behavior.
- Provision the first reviewed `magnetic-interaction` source snapshot from an audited canonical file list; do not guess files or import secrets.

**Gate / done**
- Guest and signed-in-unverified users receive 401/403 and no source. Any verified registered account reads all published source without manual owner action or per-user grant.
- Owner access is never based on first registration, browser email, client role or supplied user ID.
- Draft saves do not change the published pointer; publish selects an exact immutable version; unpublish denies subsequent reads for every regular user; restore creates a new snapshot.
- Verified users can copy code and like/unlike. One active like per user/experiment is enforced; duplicate requests do not inflate likes or action counts.
- Source-open events occur only after a successful authorized source response; copy events require successful Clipboard API acknowledgement; retries are idempotent.
- Owner/admin analytics show per-experiment counts for source opens, unique verified accounts, copies, active likes and like/unlike trends; no user-level source browsing history or email list is exposed.
- Source content does not appear in guest/unverified HTML/RSC, public APIs, client bundles, source maps, shared caches, analytics or logs.
- Legacy grant lookup is removed, no new grant records are created, and the legacy grant collection is safely retired after reconciliation.
- Migration/bootstrap is replay-safe and the rollback/reconciliation procedure is tested.
- Owner editor/analytics dependencies remain out of the homepage and public Labs listing bundle.
- Privacy Policy disclosure, analytics retention, deduplication and account-deletion handling are approved before Production analytics is enabled.
- The existing public demo behavior and routes remain unchanged.

## Phase 8B — Isolated live previews (separate security-gated work)
**Work**
- Do not couple source storage/editing approval to source execution.
- Only after a separate threat-model approval, choose a separately isolated runtime for owner-authored/untrusted code.
- Establish origin separation, CSP, cookie/storage isolation, dependency allowlist, network egress policy, CPU/memory/time limits, messaging protocol, abuse monitoring, cost limits and failure containment.
- Add preview lifecycle, error/timeout/stopped states and explicitly instrumented interactions only after the runtime decision is approved.

**Gate / done**
- No arbitrary source executes in the main origin/runtime or server.
- Cross-origin isolation controls are independently tested; iframe usage alone is not accepted as sufficient proof.
- Guests cannot access restricted preview endpoints by bypassing the UI.
- Resource/network escape, malformed source and runtime-failure tests pass.
- Until this gate passes, stored source remains text-only and can be viewed only through the protected source flow.

## Phase 9 — Likes, user dashboard and analytics
**Work**
- Keep guest likes disabled; implement verified-account likes with one active state per user/experiment.
- Add server-validated source-open, code-copy, like and unlike event schema with idempotency, rate limits and abuse protections.
- Build owner/admin aggregate source-engagement dashboard with date ranges, per-experiment source opens/unique verified accounts/copies/active likes/like-unlike trends. Keep individual user histories out of the first release.
- User dashboard personal activity remains separately scoped and must not be confused with owner aggregate reporting.
- Document every metric, denominator, event source and known limitation.

**Gate / done**
- One active authenticated like per user/experiment is enforced server-side.
- Metrics reconcile against controlled test events.
- Source opens are separate from public detail views. Copy events are labelled as successful clipboard actions, not verified code usage.
- Charts have accessible text/table alternatives; private personal activity cannot be queried by other users.

## Phase 10 — Scheduling and operational recovery
**Work**
- Implement scheduled publication against immutable version IDs.
- Select a durable execution mechanism compatible with Vercel and the chosen data model.
- Implement bounded automatic retry, idempotency, status tracking, failure visibility, cancellation and manual recovery.
- Revalidate relevant caches only after a successful state transition.

**Gate / done**
- Execution does not depend on an admin browser being open.
- Repeated job execution does not publish twice or corrupt pointers.
- Tests cover timezone boundaries, retry exhaustion, cancellation, stale schedule and missing media/version.
- Operational recovery steps are documented.

## Phase 11 — Admin UI integration and polish
**Work**
- Complete responsive admin navigation and overview, portfolio CMS, projects, experience, Lab management, media, analytics and settings.
- Add consistent loading/empty/success/error/validation states, confirmation flows and unsaved-change guards.
- Lazy-load heavy editors/visualizations/previews.

**Gate / done**
- All privileged routes are server protected.
- Keyboard, focus, labels, form errors and confirmation flows pass accessibility review.
- Admin-only dependencies do not enter the critical public homepage bundle.

## Phase 12 — Regression, security, performance and release
**Work**
- Run build, lint, type-independent JavaScript checks, unit/integration/e2e tests available in the repo.
- Run authorization and abuse/security checks.
- Compare baseline screenshots and performance metrics at the same viewports/device profiles.
- Verify metadata, canonical URLs, sitemap/robots behavior and noindex rules for private preview/draft routes.
- Validate deployment environment variables, migrations, scheduled jobs, rollback and monitoring.

**Gate / done**
- All required checks pass or failures are explicitly documented and accepted.
- No unintended public UI/layout/motion/functionality/SEO/accessibility regressions.
- Performance changes are supported by comparable measurements.
- Rollback and incident recovery are tested/documented.
- Production release is explicitly approved; this plan and its documentation updates do not by themselves authorize implementation or deployment.

## Universal definition of done
A requirement is done only when all applicable conditions are met:
1. Requirement and acceptance criteria are traceable to the PRD.
2. Implementation follows the selected stack and existing repository conventions.
3. Validation and authorization occur server-side for protected operations.
4. Success, loading, empty, invalid-input, failure, retry and destructive-action states are addressed.
5. Unit/integration/e2e coverage exists at the appropriate boundary.
6. Accessibility, keyboard interaction, responsive behavior and reduced-motion are checked where relevant.
7. Existing public home/project-detail pages are regression-tested.
8. SEO and cache behavior are verified for public/private state.
9. Performance impact is measured where relevant.
10. Security/privacy implications and operational recovery are reviewed.
11. Documentation and changelog/status are updated.
12. No unresolved critical issue is hidden by marking the task complete.

## Required implementation tracking fields
Every task should track: ID, requirement reference, phase, owner, dependencies, risk, status, decision links, test evidence, public-regression impact, security/privacy impact, performance impact, rollback/recovery note, and acceptance sign-off.

## Branching and release discipline
- Current Labs implementation and this specification update are on `feat/labs-public-page`.
- Keep each logical implementation phase isolated in commits/PRs; do not mix unrelated content, auth, source-management, execution-sandbox and analytics changes.
- Do not merge into `main` or deploy Production without explicit user approval.
- Preview deployments may be used for focused validation; do not expose previews broadly or disable deployment protection to simplify external integrations.


## Required architecture deliverables before feature implementation
Phase 0/1 must produce or reconcile these documents with the actual repository:
- docs/ARCHITECTURE.md: runtime boundaries, trust boundaries, business logic, middleware, data access, authorization and request flow.
- docs/PROJECT-STRUCTURE.md: actual repository map plus approved target folder structure; proposed folders must not be created blindly.
- docs/API-CONTRACTS.md: endpoint/action inventory, schemas, authorization, errors, caching and idempotency.
- Decision records for auth/session, MongoDB hosting, cache/revalidation, scheduling and interactive preview isolation.
- Data model/index plan, migration plan, threat model and rollback plan.

## Additional phase gates
### Phase 0 addition — actual tree and dependency audit
- Produce an actual tree from the checked-out repository; identify existing route groups, shared UI, server/client component boundaries, aliases, test conventions, current data fetching and styling conventions.
- Compare actual tree with PROJECT-STRUCTURE.md and record differences. The proposed structure is not permission to reorganize unrelated files.
- Audit current dependencies before adding TanStack Query, Express, charting, editor or validation libraries. Reuse existing dependencies when suitable; justify each new dependency.
- **Done:** actual and proposed trees are distinguished; no source changes are made; dependency additions are evidence-based.

### Phase 1 addition — API/domain contract gate
- Map every capability to a domain service/use case, repository/data-access module, schema, protected route/action and tests.
- Identify which reads use server rendering, which interactions need TanStack Query, and which mutations use Route Handlers or Server Actions.
- Decide whether any requirement truly needs Express; default is no separate Express server.
- **Done:** every endpoint/action has a permission rule, input/output schema, error contract, cache policy and relevant tests; no unresolved trust boundary is hidden.

### Dependency policy
- Do not add TanStack Query globally without a concrete client-side server-state use case.
- Do not add Express unless a reviewed architecture decision justifies a separately deployed backend.
- Avoid duplicate data-fetching/caching layers for the same use case; document cache ownership and invalidation.
- Validate library versions and compatibility against the current package manifest during implementation; this planning branch does not claim current dependency installation.
