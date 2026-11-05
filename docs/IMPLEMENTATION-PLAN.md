# Implementation Plan — Portfolio Platform

**Status:** Living platform plan. Active Labs work is on `feat/labs-platform-integration`. The branch contains public Labs, Better Auth, owner source/editor and isolated compiler/runtime foundations. The 5 November 2026 browser screenshots identify an owner preview Run regression to re-verify, missing custom gallery visuals and a blank Spotlight Dock detail runtime. These are release-blocking recovery items, not completed features. The next Labs product phases are defined in `LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md`.

## Principles
- Inspect first; change second.
- Preserve the existing public portfolio and its source-of-truth design/architecture documents.
- Do not start coding until the baseline audit, repository map, impact assessment and implementation approach are reviewed.
- Use the locked stack: Next.js App Router, JavaScript, Tailwind CSS v4, Motion (`motion/react`), MongoDB, Cloudinary and Vercel.
- Keep decisions open when they remain unselected; document alternatives and validation requirements.
- Prefer small, reversible phases and isolated commits. No broad rewrites for convenience.

## Current implementation baseline — 2026-11-05

The following is the inspected code baseline, not a production-readiness certificate:

| Capability | Current state on `feat/labs-public-page` | Remaining work |
|---|---|---|
| Public Labs listing/detail and four code-owned demos | Implemented in integration branch | Regress all four; custom published-artifact detail runtime currently has a blank-canvas defect in browser evidence and must be restored |
| Better Auth + MongoDB adapter | Foundation implemented | Final session policy and security/release tests |
| Email/password registration, verification, reset and SMTP transport | Implemented in branch and configured for Preview; email delivery observed | Validate real verification completion, duplicate behavior, reset, production deployment |
| First-party Terms/Privacy pages and consent receipts | Implemented | Legal review and operational rights/deletion workflow review |
| Protected source read endpoint | Verified-session + published-source policy implemented in integration branch; legacy grant model retained for migration safety | Verify guest/unverified denial, verified direct access, no-store responses and CTA/session UX in deployed browser |
| Owner source inventory/editor and lifecycle routes | Implemented in the integration branch | Re-verify deployed create/add/edit/delete/save/version/restore/publish/unpublish flows, owner guard, stale-version and failure states |
| Source audit, immutable versions, likes and engagement analytics | Implemented in integration-branch foundation | Re-verify Atlas bootstrap, migration/retention, idempotency, privacy disclosure and aggregate-only reporting |
| Owner isolated preview compiler/runtime | Compiler and runtime foundation implemented and smoke-tested | Restore and prove deployed Run for unsaved HTML/CSS/JS, JSX and TSX; validate runtime bridge, public artifact delivery and threat model; browser QA is still open |
| General CMS/Admin, media management, portfolio-wide analytics and scheduling | Deferred | Begin only after Labs work is complete and separately authorized; Labs source-engagement aggregates are included in Phase 8 |

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

## Phase 7 — Lab public experience, runtime and gallery

**Detailed authority:** `docs/LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md`. The sequence below is the immediate next Labs roadmap and takes precedence over the older generic order in this document.

### Phase 7.0 — P0: restore and prove execution

- Restore owner Studio Run for the current unsaved working copy in HTML/CSS/JS, React JSX and React TSX.
- Preserve editor state, desktop/mobile viewport, console, diagnostics, stop/restart and run-ID-safe iframe bridge.
- Restore custom published-artifact execution on detail pages. Fix the observed blank Spotlight Dock canvas with visible initializing/ready/error/retry/fallback states.
- Regress all four existing code-owned demos.
- **Gate:** deployed authenticated browser proof, not only compiler smoke tests.

### Phase 7.1 — Skeleton and page-loading UX

- Add route skeletons for Labs listing/detail and owner source inventory/editor.
- Add a separate preview-canvas skeleton until runtime-ready; preserve the existing global PageLoader behavior without stacking full-screen loaders.
- Reserve actual card/canvas/editor dimensions and test slow network, navigation, retry and layout shift.

### Phase 7.2 — Source CTA and optimistic action UX

- Keep the source CTA visible to all detail visitors; known verified users load source directly; guests see Sign in and Create account; signed-in unverified users see Verify email.
- Use React 19 `useOptimistic` for reversible likes and safe inventory/media-role transitions with rollback on failure.
- Treat editor file changes as local unsaved working-copy state; do not claim persistence before Save draft response.
- Await server confirmation for publish/unpublish/delete. Show pending states. Copy success and copy analytics require successful Clipboard API acknowledgement.
- Avoid adding TanStack Query solely for these actions.

### Phase 7.3 — Code-output poster generation

- Capture a static screenshot from successfully rendered published HTML/Canvas or React/Motion output after validated runtime-ready.
- Tie poster to exact sourceVersionId/artifactId. Support explicit Generate/Regenerate and bounded publish-time generation only when no selected card preview/current poster exists.
- Capture in the isolated browser boundary; failure falls back to LabArtwork and does not break Run or a valid release.

### Phase 7.4 — Role-aware media and static card renderer

- Migrate current one-item `fallback-preview` attachment into `gallery-preview`, ordered `detail-gallery` and `runtime-fallback` roles.
- Card priority: selected published gallery media → matching generated code poster → artwork fallback. Never run code, create iframes or compile from gallery cards.
- Constrain GIF/video animation with visibility/engagement, reduced motion and playback caps. Video is muted/inline/preload-none; no sound autoplay.
- Detail-gallery is supplementary; runtime-fallback appears only after detail runtime error/unsupported state.

### Phase 7.5 — Integrated QA and release gate

- Confirm zero experiment runtime iframes/React roots/compiler jobs on `/labs`; one on-demand runtime at most on a detail page, stopped on navigation away.
- Test guest/unverified/verified/owner source paths, poster version integrity, role-based media privacy and reference-safe deletion.
- Record LCP, CLS, poster/media transfer, runtime startup, long tasks and memory; test mobile, reduced motion, keyboard and slow-network behavior.
- Production remains separately gated by sandbox threat model, source privacy, environment/owner provisioning and explicit release approval.

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
- Preserve best-effort guest public likes where supported; implement verified-account likes with one persistent active state per user/experiment.
- Add server-validated source-open, code-copy, like and unlike event schema with idempotency, rate limits and abuse protections.
- Build owner/admin aggregate source-engagement dashboard with date ranges, per-experiment source opens/unique verified accounts/copies/active verified likes/verified like-unlike trends, and separate guest-like action counts where measurable. Keep individual user histories out of the first release.
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
- Current Labs implementation and this specification update are on `feat/labs-platform-integration`.
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


## Labs immediate execution tracker — 5 November 2026

| Priority | Task | Status | Exit evidence |
|---|---|---|---|
| P0 | Restore owner Studio Run for current unsaved working copy | Run request path preserved; timeout/error/retry UI implemented; deployed authenticated browser click still pending | HTML/CSS/JS, JSX and TSX authenticated Run screenshots plus build/console output |
| P0 | Restore published-artifact detail runtime | Controlled artifact route + inline delivery + CSP + opaque-origin iframe + ready/error/timeout/retry implemented; deployment `48d7585e` READY | Browser must confirm actual custom artifact output, readiness bridge and all four built-in experiment regressions; no unexplained blank canvas |
| P1 | Route/page and canvas skeletons | Planned | Listing/detail/inventory/editor/canvas loading states pass slow-network and CLS checks |
| P1 | Source CTA + optimistic action UX | Planned/review against existing interactions | Verified direct access; guest CTAs; unverified verification path; like rollback; pending action and clipboard feedback tests |
| P2 | Generated static code-output poster | Planned; capture provider/storage still open | HTML Canvas and React/Motion posters version-match exact published artifact |
| P2 | First-class media attachment roles | Current code has legacy fallback-preview only | Migration tests, public/draft privacy, usage/reference integrity, image/GIF/video presentation |
| P3 | Responsive/performance/security release QA | Pending | No gallery execution; bounded detail runtime; metrics, auth/privacy and threat-model suite |

This tracker is updated from branch commits, a READY Vercel Preview build and a passing isolated compiler smoke suite. Authenticated owner Run and visual browser confirmation remain untested. The latest cache-only commit `143a04d` is not deployed because Vercel returned its daily deployment API quota limit. This tracker is not a browser test report. Do not mark Phase 0 release-complete without the exit evidence.
