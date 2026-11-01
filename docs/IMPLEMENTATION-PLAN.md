# Implementation Plan — Portfolio Platform

**Status:** Planning baseline only. Do not interpret these phases as completed work.

## Principles
- Inspect first; change second.
- Preserve the existing public portfolio and its source-of-truth design/architecture documents.
- Do not start coding until the baseline audit, repository map, impact assessment and implementation approach are reviewed.
- Use the locked stack: Next.js App Router, JavaScript, Tailwind CSS v4, Motion (`motion/react`), MongoDB, Cloudinary and Vercel.
- Keep decisions open when they remain unselected; document alternatives and validation requirements.
- Prefer small, reversible phases and isolated commits. No broad rewrites for convenience.

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
- Select auth provider/session implementation, MongoDB hosting, cache invalidation, scheduler and isolated preview execution only after validating constraints.
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
- Implement user role provisioning without any public self-service admin escalation.
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
- Build listing/detail pages, metadata, static previews, partial-source rendering, search/filter/sort and pagination/progressive loading.
- Enforce published-only reads and guest restrictions on the server.
- Create accessible loading, empty, error and no-results states.
- Keep Lab-specific dependencies out of the public homepage bundle unless already needed.

**Gate / done**
- Public discovery functions across supported viewport sizes.
- Drafts and full source are not present in guest-visible HTML/API/client bundles.
- Search and filters compose predictably; pagination avoids duplicate/missing results.
- Existing portfolio pages remain visually and behaviorally unchanged.

## Phase 8 — Isolated interactive previews and full-source access
**Work**
- Implement authenticated source access/copy and isolated execution for approved registered/admin-managed components.
- Establish dependency allowlist, resource limits, origin/network policy, message protocol and sandbox threat model.
- Add preview lifecycle, error/timeout states and explicitly instrumented interactions.

**Gate / done**
- No arbitrary source executes in the main origin/runtime.
- Cross-origin isolation controls are tested; iframe usage alone is not accepted as sufficient proof.
- Guests cannot access full source or restricted preview endpoints by bypassing the UI.
- Resource/network escape, malformed source and runtime-failure tests pass.

## Phase 9 — Likes, user dashboard and analytics
**Work**
- Implement guest and authenticated likes with separate reporting.
- Add event schema, event validation, deduplication and abuse protections.
- Build user dashboard lists/activity and admin analytics dashboard with date ranges and segment filters.
- Document every metric, denominator, event source and known limitation.

**Gate / done**
- One active authenticated like per user/experiment is enforced server-side.
- Metrics reconcile against controlled test events.
- Copy events are labelled as copy actions, not verified use.
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
- Production release is explicitly approved; documentation-only branch does not itself authorize implementation or deployment.

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
- This branch is documentation-only: `docs/portfolio-platform-spec`.
- Keep code changes out of this branch unless explicitly requested later.
- Prefer one logical implementation phase per branch/PR; avoid mixing unrelated content, auth, execution-sandbox and analytics changes.
- Do not merge or deploy automatically.
