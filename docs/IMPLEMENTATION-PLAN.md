# Implementation Plan — Portfolio Platform

**Status:** Living platform plan. Active Labs work is on `feat/labs-platform-integration`. The branch contains public Labs, Better Auth, owner source inventory/editor and source lifecycle foundations, initial owner engagement analytics, and isolated compiler/runtime foundations. The 5 November 2026 browser screenshots identify an owner preview Run regression to re-verify, missing custom gallery visuals and a blank Spotlight Dock detail runtime. These remain release-blocking recovery items, not completed features. Runtime/media delivery is governed by `LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md`; the owner-console plan records the now-implemented route split, metadata editing, custom analytics correction, source handoff and first live dashboard, plus the remaining authenticated QA, Atlas reconciliation, rankings/detail reports and release gates.

## Principles
- Inspect first; change second.
- Preserve the existing public portfolio and its source-of-truth design/architecture documents.
- Do not start coding until the baseline audit, repository map, impact assessment and implementation approach are reviewed.
- Use the locked stack: Next.js App Router, JavaScript, Tailwind CSS v4, Motion (`motion/react`), MongoDB, Cloudinary and Vercel.
- Keep decisions open when they remain unselected; document alternatives and validation requirements.
- Prefer small, reversible phases and isolated commits. No broad rewrites for convenience.

## Current implementation baseline — 2026-11-06

The following is the inspected code baseline, not a production-readiness certificate:

| Capability | Current state on `feat/labs-platform-integration` as audited on 2026-11-06 | Remaining work |
|---|---|---|
| Public Labs listing/detail and four code-owned demos | Implemented in integration branch | Regress all four; custom published-artifact detail runtime currently has a blank-canvas defect in browser evidence and must be restored |
| Better Auth + MongoDB adapter | Foundation implemented | Final session policy and security/release tests |
| Email/password registration, verification, reset and SMTP transport | Implemented in branch and configured for Preview; email delivery observed | Validate real verification completion, duplicate behavior, reset, production deployment |
| Google/GitHub OAuth + email/password | Code implemented on integration branch | Configure OAuth apps/Preview variables and run complete login/signup/linking/verified-email browser tests |
| Privacy Policy / Terms cleanup | Privacy retained; Terms route/checkbox/consent code removed | Review Privacy wording and separately assess any historical labs_registration_consents collection data; no collection drop was run |
| Protected source read endpoint | Verified-session + published-source policy implemented in integration branch; legacy grant model retained for migration safety | Verify guest/unverified denial, verified direct access, no-store responses and CTA/session UX in deployed browser |
| Owner source inventory/editor and lifecycle routes | Code present in the integration branch | Complete deployed create-to-editor handoff and browser/Atlas verification for add/import/edit/rename/delete/save/version/restore/preview/publish/unpublish/audit and owner guard; preserve every existing operation |
| Source audit, immutable versions, likes and initial engagement analytics | Code foundation present in integration branch | Verify Atlas bootstrap/migration/retention, idempotency/privacy and aggregate reporting; add custom-experiment coverage and complete event instrumentation before trusting all metrics |
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
- Use the locked singleton-owner identity `LABS_OWNER_USER_ID`; deny owner operations when absent/mismatched. Never allow public self-service owner/admin escalation or client-supplied owner identity.
- Add safe error handling, rate/abuse controls and audit metadata where required.
- Add tests for protected reads and mutations.

**Gate / done**
- Guest, registered-user and admin access matrix passes direct-route and direct-request tests.
- No secrets or privileged database access enter client bundles.
- Schema/index and migration tests pass.
- Failure responses do not leak private records.

## Phase 3 — Authentication and user account
**Work**
- Preserve email/password and add Google/GitHub OAuth registration and login, verification, reset, session handling, logout, profile management and account deletion. Keep login intent separate from explicit OAuth account-creation intent. Remove the Terms checkbox/route/receipt gate while retaining the Privacy Policy and email-verification flow records. Follow docs/LABS-AUTHENTICATION-PROVIDERS-AND-LEGAL-CLEANUP-PLAN.md.
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

**Code baseline:** The audited integration branch contains the owner-only source inventory, source creation/read APIs, source editor, immutable version, restore, publish/unpublish, audit, verified source access, like state, source-open/copy event and initial aggregate analytics foundations. This phase is not a greenfield implementation task.

**Remaining verification**
- Run Atlas-backed migrations/index/bootstrap and legacy-grant reconciliation with rollback evidence.
- Verify the Guest / signed-in-unverified / verified / singleton Owner access matrix with direct route and direct API requests.
- Run browser tests for source creation, file add/import/edit/rename/delete/reorder, byte/path validation, save-draft, version history/view/restore, preview, publish/unpublish, audit, stale pointers and failure recovery.
- Verify source events are server-attributed, idempotent and written only after successful authorized source response / clipboard acknowledgement.
- Verify private/no-store headers and prove no source leakage into public HTML/RSC, DTOs, bundles, maps, logs or shared caches.
- Configure owner/SMTP/Atlas deployment requirements and approve analytics retention/privacy before production release.

**Detailed source authority:** `docs/LABS-SOURCE-MANAGEMENT-SPEC.md`.

**Gate**
- All existing source lifecycle operations pass the preservation tests; no source action is removed or silently redefined.
- Migration is replay-safe and has rollback/reconciliation evidence.
- Owner security, verified-account automatic source access and aggregate-only analytics pass direct-request tests.
- Production remains blocked by outstanding infrastructure, privacy, browser and release approvals even when local build/lint passes.

## Phase 8A — Owner Console separation, metadata editing and live analytics

**Detailed authority:** `docs/LABS-OWNER-CONSOLE-ANALYTICS-AND-SOURCE-MANAGEMENT-PLAN.md`.

- Split the current combined `/admin/labs/sources` page into `/admin/labs/analytics` and `/admin/labs/sources`; retain the existing `/admin/labs/sources/[slug]` source editor route.
- Add a separate owner-only metadata editor and PATCH contract for custom experiment title/description/explanation/category/technologies. Keep it separate from code-file editing, source-version pointers and publication.
- Fix dynamic custom-experiment analytics catalogue and source-event validation coverage before building richer charts.
- Add experiment view/preview metrics only after their event lifecycles and deduplication rules are implemented; never show uninstrumented metrics as zero.
- Add visible-tab 10-second polling with no overlapping requests, visibility pause, abort/backoff, manual refresh and truthful stale state.
- Reuse existing MotionNumber/motion/react and semantic theme tokens; complete responsive, reduced-motion and accessible chart/table verification.
- Preserve all existing source create/open/edit/save/version/restore/preview/publish/unpublish/audit/delete and public Labs behaviors.

**Gate**
- The detailed phase gates and preservation checklist in the Owner Console plan pass. No WebSocket/provider/Redis dependency is added without a measured requirement and separate decision.

### Phase 8A progress — 2026-11-06

- **Phase 0 audit:** complete against `feat/labs-platform-integration` before route separation.
- **Phase 1 route split:** code committed and Preview build-verified. The existing analytics presentation is served from `/admin/labs/analytics`; `/admin/labs/sources` renders the existing Source Library component. Shared owner navigation and separate account-menu links are present. Valid legacy `?days=` bookmarks forward to Analytics. Import uses the same navigation and verification return-path handling. Anonymous protected-route smoke checks confirm the page-specific login return destinations.
- **Source editor:** existing `/admin/labs/sources/[slug]` route and component were preserved; its verification notice now retains the safe editor destination.
- **Phase 2 initial data correctness:** custom published experiments are now included in owner aggregation only when their source pointer matches a ready artifact. The source-open/copy event route applies the same custom published-experiment eligibility check while retaining verified-session, source-version and idempotency checks. Daily analytics now includes zero-activity UTC dates and displays zero-height bars for them. The latest Preview build reached READY and includes both owner routes plus the event API.
- **Phase 3 metadata editor:** custom experiment metadata-only edit page, owner-guarded same-origin PATCH, shared create/edit metadata validation, immutable slug/system fields, expected-`updatedAt` concurrency check, monotonic timestamp update and `experiment_metadata_updated` audit event are committed and Preview build-verified. The Source Library exposes Edit details only for owner-created experiments that are not deleting. Owner email-verification and password-recovery return paths preserve the edit destination. Authenticated save, stale-conflict and persisted-audit tests remain pending.
- **Phase 4 source handoff:** after a successful source-head POST, the Source Library validates the returned slug and navigates directly to the matching source workspace. A 409 refreshes the inventory and does not navigate to an unconfirmed path. The code is included in READY Preview deployment `dpl_AzAnNtSHEwjdbkE6qVCW5nQMPHhf`; actual owner/Atlas create and duplicate tests remain pending.
- **Phase 5 live Analytics:** the Analytics Server Component retains initial server-side data and owner authorization, then renders a client dashboard. Visible-tab polling runs every 10 seconds, pauses when hidden, resumes on visibility/focus, prevents overlapping requests, aborts on unmount, uses bounded backoff, preserves last-known-good data, and exposes manual refresh plus stale/error state. Existing MotionNumber now accepts optional locale formatting and is reused for changing totals. A Motion-driven SVG chart separates source opens, copies, verified like actions and anonymous like actions and includes an accessible daily table. These features are included in READY Preview deployment `dpl_2q1CRakZTVJw2QLMNUsDFL6EBThQ` (commit `e2673785bd882a0b787318e9551d49b8e9e9468b`); the exact current HEAD `50b09ef3add5de456831e22955da77aa1f18fc70` only removes an unused icon import and has not received its own Preview build because Vercel's daily deployment API quota was reached.
- **Phase 5 analytics follow-up:** code now returns deterministic top-five rankings for instrumented source opens and copies in the selected period, plus current active likes, with stable title/slug tie-breaking. The owner-only `GET /api/v1/admin/labs/analytics/:slug` aggregate endpoint and `/admin/labs/analytics/[slug]` detail route show per-experiment period metrics, like splits and UTC daily trends. The detail route is protected through the owner guard and the exact slug return path is allowlisted through login/verification. Preview build verification and authenticated Atlas reconciliation remain pending.
- **Still pending:** authenticated owner browser/accessibility QA; Atlas-backed custom experiment/event reconciliation and metadata save/audit tests; authenticated source creation and duplicate tests; live polling event-to-screen round-trip; ranking/detail fixture reconciliation and latest Preview build; experiment-view and preview event instrumentation; visual chart/contrast/reduced-motion QA. Do not claim these complete.
- **Authorization follow-up:** owner-access code currently also accepts `LABS_OWNER_EMAIL`, while the locked decision specifies `LABS_OWNER_USER_ID` only. Reconcile against the actual Preview environment before changing the fallback or claiming the locked policy is enforced.

Do not mark Phase 8A complete until the full phase gates in `LABS-OWNER-CONSOLE-ANALYTICS-AND-SOURCE-MANAGEMENT-PLAN.md` pass.

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

- Preserve the existing anonymous public-like behavior where supported and the verified account's one-active-like-per-experiment state.
- The initial Labs event model and aggregate source-engagement endpoint exist; do not recreate them as duplicate systems.
- Complete missing custom-experiment event/aggregation coverage, qualifying experiment views, preview starts/interactions (only when runtime signals are ready), rankings and experiment-level aggregate reporting.
- Keep personal user activity separate from owner aggregate reporting.
- Full event semantics and metric definitions belong to `DESIGN-ANALYTICS.md`; owner routing, polling and delivery phases belong to `LABS-OWNER-CONSOLE-ANALYTICS-AND-SOURCE-MANAGEMENT-PLAN.md`.

**Gate / done**
- Metrics reconcile against controlled fixtures and do not fabricate history.
- Source opens remain separate from public detail views; copies remain successful clipboard actions, not code usage.
- Active like state remains separate from period like/unlike events; anonymous actions are not labelled unique people.
- Charts have accessible table/text alternatives and no raw user-level history is exposed.
- Retention and account-deletion treatment are approved before production analytics launch.

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




### Conditional Labs authentication and server-first source rendering — 5 November 2026

- Guest visitors see Sign in and Create account in the Labs navbar and protected-source panel, preserving a validated `/labs/:slug?source=1` return path. The matching auth page hides its own redundant navbar action.
- Signed-in unverified users see Verify email in the source panel and account menu; no guest auth CTAs are shown.
- Verified users are resolved in the `/labs/[slug]` Server Component. The server calls the shared published-source authorization service and passes only that authorized published snapshot and user identity to the source client panel. The first server response renders the source files directly; it does not render the guest prompt or a “Check source access” button.
- The same minimal server-resolved identity is passed through `LabsPageShell` to the navbar account control, so known signed-in users see the account menu on the first render rather than guest auth buttons. The control still refreshes session state and reacts to local/cross-tab auth events.
- After hydration, the client reconciles the session with the server-provided user ID, disables copy until the client session is confirmed, and clears source on sign-out, user mismatch or expiry.
- The source API remains independently protected by server-side Better Auth and `emailVerified === true`. Client state and hidden buttons are not authorization controls.
- The code is committed to `feat/labs-platform-integration`. Vercel deployment API/build-rate limits currently block a Preview build containing the latest server-first source panel. The most recent READY auth deployment contains only the earlier navbar control change, not the server-rendered source handoff. Do not treat it as end-to-end verification.

## Labs immediate execution tracker — 5 November 2026

| Priority | Task | Status | Exit evidence |
|---|---|---|---|
| P0 | Restore owner Studio Run for current unsaved working copy | Run request path preserved; timeout/error/retry UI implemented; deployed authenticated browser click still pending | HTML/CSS/JS, JSX and TSX authenticated Run screenshots plus build/console output |
| P0 | Restore published-artifact detail runtime | Inline artifact route, opaque-origin CSP repair, actual DOM readiness and retry UI committed at `8d832832`; latest fix not yet deployed | Browser must confirm compiled JS/CSS load, Fluid Gradient styling/animation, Spotlight Dock React/Motion output and all four built-in demos |
| P1 | Route/page and canvas skeletons | Planned | Listing/detail/inventory/editor/canvas loading states pass slow-network and CLS checks |
| P1 | Source CTA + optimistic action UX | Planned/review against existing interactions | Verified direct access; guest CTAs; unverified verification path; like rollback; pending action and clipboard feedback tests |
| P2 | Generated static code-output poster | Planned; capture provider/storage still open | HTML Canvas and React/Motion posters version-match exact published artifact |
| P2 | First-class media attachment roles | Current code has legacy fallback-preview only | Migration tests, public/draft privacy, usage/reference integrity, image/GIF/video presentation |
| P3 | Responsive/performance/security release QA | Pending | No gallery execution; bounded detail runtime; metrics, auth/privacy and threat-model suite |

This tracker reflects the 5 November screenshots and the subsequent CSP/readiness repair committed at `8d832832`. Targeted CSP tests and an isolated compiler smoke suite passed, but the READY Preview predates the repair. A new deployment could not be created because Vercel returned its daily deployment API quota limit. Authenticated owner Run and visual public-runtime browser QA remain open; do not mark Phase 0 release-complete until those tests pass.

## Labs authentication provider expansion and Terms cleanup — implementation update 5 November 2026

The integration branch now includes email/password and shared Google/GitHub OAuth actions on both Login and Create account. Providers are enabled independently by server-only credentials. Configured social providers use disableImplicitSignUp: true; only the signup screen sends requestSignUp: true. GitHub's server profile mapper fetches the profile and email list, prefers a verified primary email and fails closed when no verified email exists.

The Terms checkbox, acceptedTerms registration payload/validation, Terms route, footer link, sitemap entry, Terms-only policy configuration and consent module have been removed. The Privacy Policy remains informational. Email verification is preserved in src/app/lib/auth/verification-flows.js. Historical labs_registration_consents collection data, if present, was not dropped.

Remaining release work: configure Google/GitHub OAuth apps and Vercel environment variables/callbacks; run email/password, Google, GitHub, same-verified-email linking, private GitHub email and source-access browser tests; complete build/lint and responsive/accessibility checks. Do not merge or deploy Production without the release approval.
