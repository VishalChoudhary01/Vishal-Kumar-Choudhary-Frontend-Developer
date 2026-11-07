# Portfolio Platform — Current Project Status

**Audit snapshot:** 2026-11-07  
**Audited branch:** feat/labs-platform-integration  
**Purpose:** Current implementation map. Read this before maintenance or new feature work.

> This status describes code present on the audited branch. It is not proof that every workflow has passed production browser QA, database migration verification, provider integration testing or release acceptance. Source code is the authority for current behavior.

## 1. Product boundary

The platform has four substantial existing implementation areas:

1. Public portfolio website and code-driven project detail pages.
2. First-party Portfolio Analytics, separate from Labs engagement analytics.
3. Public Labs discovery/detail experience and isolated experiment runtime.
4. Owner-only Labs workspace: experiment metadata, source library/editor, version lifecycle, publishing, media and Labs analytics.

The major future product area is the Portfolio CMS, including dynamic project-detail content. Google and GitHub OAuth code is present behind provider credential gates; provider configuration and end-to-end acceptance must be checked per environment before calling it finished.

## 2. Current capability status

| Area | Code status on audited branch | Verification boundary |
|---|---|---|
| Public homepage sections and shared navigation/footer | IMPLEMENTED | Preserve section composition, data, responsive and motion behavior. Re-run screenshot, accessibility, scroll and cross-theme checks after changes. |
| Project detail template | IMPLEMENTED | Content still comes from code-owned project data. Verify each slug/template and gallery before release. |
| Public Labs collection/detail pages | IMPLEMENTED | Validate built-in demos and custom published artifact loading in browser. |
| Lab owner metadata CRUD | IMPLEMENTED | Owner-only routes and model are present; Atlas/browser validation remains a separate gate. |
| Source inventory and source editor | IMPLEMENTED | Owner source page currently has no visible Initialize sources action. Direct import route and importer endpoint remain in the repository. |
| Source draft/version/restore/publish lifecycle | IMPLEMENTED | Verify exact version pointer changes, build artifact links, audit events and rollback behavior against configured storage/database. |
| Isolated unsaved preview Run | IMPLEMENTED | Compiler/sandbox code is present. Deployment credentials, limits and browser execution must be verified in the target environment. |
| Published immutable runtime delivery | IMPLEMENTED | Artifact route and CSP/opaque iframe boundary are present. Test actual published detail-page runtime and recovery. |
| Labs media upload and gallery poster paths | IMPLEMENTED — VERIFICATION PENDING | Cloudinary and Blob credentials/presets plus exact media references must be checked. Automatic release poster capture exists in compiler code, but capture can return unavailable; not every experiment is guaranteed to have a generated poster. |
| Labs engagement and Labs Analytics | IMPLEMENTED | Event semantics are distinct from portfolio visits. Atlas-backed attribution, trend accuracy, refresh and privacy require verification. |
| Portfolio Analytics | IMPLEMENTED; FEATURE-GATED | Tracking is disabled unless PORTFOLIO_ANALYTICS_ENABLED=true and required host/HMAC settings are valid. Verify only on configured canonical production host. |
| Email/password authentication | IMPLEMENTED | Requires Mongo/Auth secret and SMTP delivery configuration. Verify registration, email verification, sign-in, reset, logout and expired sessions in target deployment. |
| Google OAuth | CODE PRESENT; CONFIGURATION / E2E VERIFICATION PENDING | Provider enters Better Auth config only when both Google client credentials exist. Verify provider console, callback URL, safe account linking, account-creation policy and browser flow. |
| GitHub OAuth | CODE PRESENT; CONFIGURATION / E2E VERIFICATION PENDING | Provider enters Better Auth config only when both GitHub client credentials exist. Custom profile loader requires a verified email. Verify scopes, callback, linking and browser flow. |
| General Portfolio CMS | PLANNED — APPROVED | Not implemented. |
| Dynamic Project Detail CMS | PLANNED — APPROVED | Not implemented. Existing template/sections remain code-controlled. |

## 3. Sources page correction

Current page: /admin/labs/sources.

The current src/app/admin/labs/sources/page.js renders owner navigation and LabSourceInventory. The former top-level Initialize sources link and its FileCode2 import were removed in commit 063df83c543a4bec0d996c5029928d07a07c66d5.

This is a UI-trigger removal, not deletion of the import workflow:
- /admin/labs/sources/import still exists as a direct owner-protected route.
- src/app/components/labs/admin/LabRuntimeImportPanel.js remains.
- POST /api/v1/admin/labs/sources/import-runtime remains.
- POST /api/v1/admin/labs/sources/import-magnetic-button remains.

Do not reintroduce the removed page action unless an explicit product decision changes.

## 4. Architectural facts to preserve

- Frontend: Next.js App Router, React, JavaScript, Tailwind CSS v4, Motion (motion/react).
- Backend: Next.js Route Handlers and server-only modules. No separate general-purpose Express API server is in the current baseline.
- Database: MongoDB/Mongoose. Better Auth uses its MongoDB adapter.
- Media/storage: Cloudinary authenticated media uploads; Vercel Blob for built/published artifact delivery and release-bound poster storage.
- Isolated compiler: Vercel Sandbox and the repository's Labs compiler toolchain.
- Public portfolio/project routes use Lenis smooth scrolling. /labs and /admin route roots use native browser document scrolling.
- Portfolio analytics records page visits in portfolio_visits. Labs engagement uses separate collections such as lab_analytics_events, lab_likes and lab_guest_likes.
- Source access requires a Better Auth session with verified email and an exact published source. Per-user grant records are not part of the current source-access decision.

## 5. Required release verification

Do not treat “the page renders” or “the build succeeds” as proof of release readiness. For each affected feature, record:

1. Source/code implementation and commit.
2. Automated tests actually run and their result.
3. Database/Atlas collection and index checks performed.
4. Owner and non-owner direct-route/API authorization checks.
5. Browser QA for success, loading, empty and failure states.
6. Desktop/tablet/mobile and keyboard/reduced-motion checks where UI changes.
7. Deployment commit/URL and environment configuration validated.
8. Security/privacy and rollback implications.

### Verification tasks to retain

- Run clean install, full test suite, lint and production build against exact branch HEAD.
- Verify the active Atlas database has required collections/indexes and owner identity settings.
- Verify source operations: create, import (where used), file add/edit/rename/delete, draft save, version history, restore, unsaved Run, publish, unpublish and audit.
- Verify public Lab runtime loads the exact published artifact and has a visible failure/retry state; do not accept an unexplained blank canvas.
- Verify Cloudinary upload presets/quotas and Blob artifact storage/public poster access.
- Verify both analytics systems independently, including metrics, time windows, polling, error states and privacy boundaries.
- Verify email delivery and complete password lifecycle.
- Verify Google/GitHub provider credentials and full login/signup/linking journeys per Preview/Production.
- Recheck main-page scroll and motion interactions, including Lenis/native-scroll route transitions.

## 6. Future implementation scope

### Portfolio CMS
Approved content to become dynamic: Hero/introduction, About, Skills, Experience, Project listing and project-specific structured story/content, project links, media/gallery metadata, featured and publication state.

### Project Detail CMS
Populate the existing approved project-detail sections through structured fields. Keep actual layout, section components, typography, animation, interactions and responsive presentation in code. Education remains code-owned/static.

### Authentication providers
Google/GitHub configuration and tests should be completed as an authentication milestone, not mixed into the CMS content model.

## 7. Document authority

- Current repository paths and implementations: truth for what code does now.
- pages/HOME-PAGE-ENGINEERING.md: homepage section composition, exact section implementation and scroll/motion engineering.
- pages/PROJECT-DETAIL-ENGINEERING.md: project template and section implementation.
- pages/LABS-AND-OWNER-WORKSPACE.md: public Labs and owner workflows.
- pages/ANALYTICS-ENGINEERING.md: two analytics domains and their separation.
- architecture/DATA-MODEL-CATALOG.md: schema/collection catalogue.
- api/ENDPOINT-INVENTORY.md: current route handler inventory.
- architecture/LABS-RUNTIME-AND-CODE-EXECUTION.md: compiler, preview and published runtime.
- architecture/SCROLL-AND-MOTION-ENGINEERING.md: global scroll/motion architecture.
- future/PORTFOLIO-CMS-AND-PROJECT-DETAIL-CMS.md: approved future scope.
- future/GOOGLE-GITHUB-OAUTH.md: provider configuration and verification checklist.

Older flat documents under docs/ are retained as design requirements, historical implementation plans, security references or setup runbooks. When they contradict the current code status, this status document and the relevant current-state engineering document identify the newer implementation record. Do not delete historical decisions merely to make the folder smaller.
