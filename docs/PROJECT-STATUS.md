# Portfolio Platform — Current Project Status

**Audit snapshot:** 2026-11-07  
**Audited branch:** feat/labs-platform-integration  
**Purpose:** Current implementation map and handover entry point.

> This page separates implementation, accepted decisions and verification. It describes repository code present on the audited branch; it does not certify Preview/Production credentials, Atlas state, browser behavior or release readiness. Source code remains authoritative for current behavior.

## 1. Product boundary

The repository contains four substantial implementation areas:
1. Public portfolio website: homepage, navigation/footer, Vee 3D companion, theme and sound systems, contact form and code-driven project detail pages.
2. First-party Portfolio Analytics, separate from Labs Engagement Analytics.
3. Public Labs: source-backed custom catalogue, static detail presentation, likes and verified protected-source access.
4. Owner-only Labs: experiment metadata, Source Library, Monaco source editor, immutable versions/audit, isolated Run, build/publish pipeline, artifact delivery infrastructure, media and engagement Analytics.

The next major product area is the general Portfolio CMS and dynamic Project Detail CMS. Both remain approved future work, not implemented routes. Education remains code-owned/static.

## 2. Current capability status

| Area | Current code status | Verification / gap boundary |
|---|---|---|
| Homepage and shared navigation/footer | Implemented | Navbar is page-shell-owned (home/project/Labs contexts); Footer is root-layout-mounted with exact route conditions. See pages/NAVBAR-AND-FOOTER-ENGINEERING.md for route visibility, layout, motion and accessibility contracts. |
| Vee 3D companion | Implemented | See pages/PORTFOLIO-MASCOT-ENGINEERING.md; rendered/browser QA remains a release check. |
| Theme and sound systems | Implemented | See architecture/THEME-TOGGLE-ENGINEERING.md and architecture/SOUND-ENGINEERING.md; verify browser/audio lifecycle. |
| Contact form and Gmail SMTP | Implemented | See pages/CONTACT-FORM-AND-EMAIL-ENGINEERING.md; rate limiting, explicit same-origin validation, request byte cap, idempotency and transporter cleanup remain hardening gaps. |
| Project detail template | Implemented; data is code-owned | No general Project Detail CMS. Preserve slug/template/gallery/SEO behavior. |
| Portfolio Analytics | Implemented; feature-gated | Requires explicit enablement and canonical host/HMAC config. Atlas/production and browser verification remain necessary. |
| Labs hero artwork | Implemented in code on `feat/labs-platform-integration` | `LabsHeroArtwork` lazy-loads a fixed-world-radius Three.js particle sphere (radius 1.38; high-tier 5,200 surface, 620 inner, 26 ambient particles). Interaction uses deterministic radial-dominant 3D per-particle impulses with tangential axes, depth drift, 80 ms stagger and 450 ms outward / 1.36–1.57 s varied recovery; GPU point-sprite trails follow projected travel without extra trail meshes, and shimmer/glints are independently seeded. Camera choreography adds a short anticipation push-in, a 140 ms-delayed burst pullback and smoother return; resize reuses the same timing envelope. Volumetric shading uses theme-aware volume/ambient colors, near/far size-opacity attenuation, inner radial light falloff and soft particle halos in the same GPU point system. Finite idle uniforms, pointer repulsion, three orbit runners, brighter dark-mode outer sphere particles (`#8ce8dc`) with 1.45× surface brightness, 0.10 rear opacity floor and 1.16× point-size scale while preserving light-mode tuning, theme-aware inner/outer colors, responsive background and clipped fixed-aspect viewport are retained. 20 particle-sphere regression cases cover interaction timing, camera choreography, volumetric uniforms, dark-mode outer-particle visibility and shader behavior; 156 source-level assertions currently match. 20 particle-sphere test cases and 156 source-level assertions are documented; full Node/build and browser verification is still pending because the latest Vercel status is blocked by its build-rate limit. |
| Public Labs catalogue | Implemented; source-backed custom experiments only | Requires published custom experiment, published source pointer and exact matching ready artifact. Includes canonical collection metadata and CollectionPage/ItemList JSON-LD. Built-in runtime registry entries are not merged into catalogue. |
| Public Labs detail | Implemented; static/non-executable | Renders metadata, engagement, static preview media, explanation and protected source. Does not mount LabWorkspace, LabRuntimeBoundary or artifact iframe. |
| Protected source access | Implemented in code | Server-derived verified session and exact published source. LabSourceGrant lookup is no longer used; legacy model/collection remain migration material. Verify no-store/cache isolation and role matrix in deployment. |
| Guest and verified likes | Implemented in code | Guest counts are browser-scoped actions, not unique people. Verify cookie/TTL behavior and Atlas indexes. |
| Owner metadata CRUD | Implemented in code | Create/edit/delete and separate metadata editor; authenticated Atlas/browser regression pending. |
| Source Library and Monaco editor | Implemented in code | Monaco is read-only for public protected source/history and editable in owner workspace; text fallback remains. Verify action sequence and final-keystroke synchronization. |
| Source version/restore/audit | Implemented in code | Verify Atlas data, immutable pointers and audit writes. |
| Owner unsaved Run | Implemented in code | Temporary isolated Vercel Sandbox flow; credentials, limits and browser execution are deployment gates. |
| Build & Publish/artifact delivery | Separate infrastructure implemented | Compiler, Blob artifact storage and public artifact Route Handler exist. Public detail does not embed the runtime. Verify pointer/CSP/path behavior in Preview. |
| Static gallery preview/poster pipeline | Implemented in code | A release build automatically attempts a 1200×900 Playwright/Chromium screenshot of the exact compiled artifact in the same network-denied Sandbox; result is stored separately from output files and bound to the exact artifact/source version. Poster failure is non-blocking. A verified owner-promoted public Cloudinary asset takes precedence; absent/failed media falls back to the release poster, then generic/neutral artwork. Verify current Preview/Production Sandbox, Playwright/Chromium, Cloudinary and Blob behavior. |
| Complete Labs media-role model | Not implemented | Current schema is galleryPreview plus at most one fallback-preview attachment. Ordered detail-gallery and full role migration are pending. |
| Labs Engagement Analytics | Implemented in part | Event types: source_open, code_copy, like, unlike, guest_like, guest_unlike. Charts/polling exist; Atlas attribution and browser QA pending. |
| Labs detail-view/preview analytics | Not implemented | No experiment-view, preview-start or preview-interaction event producers. Portfolio page visits are separate and cannot substitute. |
| Aggregate-only Labs Analytics privacy | Accepted target; code mismatch | Detail Analytics still exposes active verified-liker names/masked emails/timestamps/search. Remove/redesign before claiming compliance. |
| Owner ID-only authorization | Accepted target; code mismatch | owner-access.js still accepts LABS_OWNER_EMAIL as fallback to LABS_OWNER_USER_ID. Remove only after checking deployed owner provisioning. |
| Email/password auth | Implemented in code | Requires MongoDB/Better Auth secret and SMTP configuration; verify deployed flows. |
| Google/GitHub OAuth | Code present behind credential gates | Provider app config, callback URLs, linking and full login/signup E2E remain pending per environment. |
| Personal user dashboard/profile/account deletion | Not implemented | Approved PRD target only; no complete self-service dashboard or account deletion route found. |
| Extended Labs discovery search/filter/sort | Not implemented | Current public API supports category and cursor pagination only, fixed page size 18. |
| Portfolio CMS and Project Detail CMS | Approved future work | Not implemented; existing public layout/sections remain code-controlled. |

## 3. Accepted Labs decisions — 7 November 2026

Recorded in ADR-018 of [DECISIONS.md](./DECISIONS.md):

1. **Public catalogue:** source-backed custom experiments only; code-owned runtime modules are not automatically public catalogue entries.
2. **Public detail:** static, non-executable. Do not mount LabWorkspace, LabRuntimeBoundary or artifact iframe on /labs/[slug]. Keep owner Run, build/publish and artifact-serving infrastructure separate.
3. **Owner identity:** target owner is selected only by server-only LABS_OWNER_USER_ID matching stable Better Auth user ID, with a verified session. No email/first-user/client-role fallback.
4. **Owner Analytics privacy:** aggregate-only. No individual names, masked emails, per-user like timestamps, searchable liker directory or user-level source/copy/like history.
5. **Monaco:** integrated for protected public source and version history (read-only), and owner editing (editable), with a plain-text fallback.

Accepted decisions are not proof the code already matches. The owner email fallback and active verified-liker identity panel remain current code gaps.

## 4. Source Library action removal

The former top-level Initialize sources action and its FileCode2 import were removed from /admin/labs/sources. This was a UI-trigger removal, not deletion of every import path:
- /admin/labs/sources/import remains as a direct owner-protected route;
- LabRuntimeImportPanel.js remains;
- POST /api/v1/admin/labs/sources/import-runtime remains;
- POST /api/v1/admin/labs/sources/import-magnetic-button remains.

Do not reintroduce the removed navigation action without an explicit decision. Do not claim the direct route or endpoints were deleted.

## 5. Architecture facts to preserve

- Frontend: Next.js App Router, React, JavaScript, Tailwind CSS v4 and Motion (motion/react).
- Backend: Next.js Route Handlers and server-only modules; no separate general-purpose Express API server in the baseline.
- Persistence: MongoDB/Mongoose for application models; Better Auth MongoDB adapter for authentication.
- Media/storage: Cloudinary for uploaded media; Vercel Blob for immutable build artifacts and generated release posters.
- Isolated compiler/preview: Vercel Sandbox and the Labs compiler toolchain.
- Public portfolio/project routes use Lenis where configured; /labs and /admin use native document scrolling.
- Portfolio Analytics uses portfolio_visits. Labs engagement uses lab_analytics_events, lab_likes and lab_guest_likes. Keep domains separate.
- Published-source access requires a verified Better Auth session and the exact published source pointer.
- Public Labs detail is static. Artifact route capability is not public page integration.

## 6. Remaining implementation work

### P0 — align code with accepted security/privacy decisions
- Remove LABS_OWNER_EMAIL fallback from owner-access.js after verifying Preview/Production owner configuration.
- Remove/redesign active verified-liker identity panel in /admin/labs/analytics/[slug]; ensure aggregate DTOs do not expose names, emails, per-user timestamps or user search.
- Confirm private/no-store responses and cross-user cache isolation.

### P1 — close or explicitly defer Labs requirements
- Decide whether detail-view/preview-start/interaction metrics remain in scope under static public detail. Define “preview” precisely if retained; keep portfolio page visits separate.
- Implement or explicitly defer discovery search/filter/sort.
- Implement or explicitly defer personal dashboard/profile/account deletion.
- Plan and migrate complete media-role schema and ordered detail gallery.
- Define Analytics event retention, deduplication and account-deletion handling.

### P2 — future product scope
- General Portfolio CMS.
- Dynamic Project Detail CMS using structured fields while keeping layout, sections, typography, Motion and responsive behavior code-controlled.
- Any public interactive runtime requires a new explicit product/security decision; current public detail remains static.

## 7. Required release verification

Record the exact commit, commands/tests actually run, deployment URL/environment, Atlas checks, browser checks, and rollback/security implications. Retain these gates:
- clean install, complete test suite, lint and production build against exact branch HEAD;
- Atlas collections/indexes, TTL indexes, owner identity variables and legacy migration checks;
- Guest / unverified / verified / owner direct-route/API authorization;
- source no-store behavior and cross-user cache isolation;
- source add/edit/rename/delete/import, Save Draft, history, restore, unsaved Run, publish/unpublish and audit;
- Monaco load/fallback, final-keystroke synchronization and keyboard/accessibility QA;
- Sandbox, Blob and Cloudinary permissions/quota/media/artifact checks;
- both analytics systems independently, including time windows, polling, errors, privacy and event attribution;
- SMTP verification/reset delivery and password lifecycle;
- Google/GitHub callback, login/signup intent and verified-email linking;
- homepage/project-detail responsive, scroll, Motion, accessibility and light/dark regression.

**Verification performed by this documentation pass:** source/docs inspection and GitHub file updates only. No npm install, tests, lint, local build, Playwright/browser QA, Atlas query/migration, SMTP delivery, OAuth, Cloudinary, Blob or Sandbox calls were performed. The latest relevant Vercel status check is reported as failure and links to a `build-rate-limit` upgrade page; no GitHub Actions run or test log was available. Do not treat this as test output or a successful deployment.

## 8. Documentation authority

- docs/README.md: navigation and source-of-truth rules.
- docs/DECISIONS.md: accepted Labs supersession decision (ADR-018).
- pages/HOME-PAGE-ENGINEERING.md: homepage structure and motion; SEO metadata and Person/WebSite/ProfilePage structured data remain in the server route.
- SEO-AND-AEO-IMPLEMENTATION.md: cross-route SEO/AEO implementation source of truth.
- pages/NAVBAR-AND-FOOTER-ENGINEERING.md: page-owned Navbar contexts, global Footer route rules, responsive layout, menu accessibility and Footer/Vee animation.
- pages/PORTFOLIO-MASCOT-ENGINEERING.md: Vee 3D scene and interactions.
- pages/CONTACT-FORM-AND-EMAIL-ENGINEERING.md: contact UI/API/email and hardening gaps.
- pages/PROJECT-DETAIL-ENGINEERING.md: fixed project template and content map.
- pages/LABS-AND-OWNER-WORKSPACE.md: current Labs catalogue/detail/source/editor/analytics.
- pages/AUTHENTICATION-AND-ACCOUNT-ENGINEERING.md: Better Auth flows, owner policy and account gaps.
- pages/ANALYTICS-ENGINEERING.md: Portfolio Analytics vs Labs Engagement Analytics.
- pages/ERROR-AND-NOT-FOUND-ENGINEERING.md: shared App Router error surfaces.
- architecture/PRIVACY-AND-DATA-LIFECYCLE.md: privacy data map, disclosures and retention gaps.
- architecture/LABS-RUNTIME-AND-CODE-EXECUTION.md: owner Run/build/artifact infrastructure and static public-detail boundary.
- architecture/DATA-MODEL-CATALOG.md: model declarations, fields and indexes.
- api/ENDPOINT-INVENTORY.md: current Route Handler inventory.
- operations/LABS-PREVIEW-RECOVERY.md: Vercel Sandbox snapshot incident, recovery and deployment QA.
- future/PORTFOLIO-CMS-AND-PROJECT-DETAIL-CMS.md and future/GOOGLE-GITHUB-OAUTH.md: retained future/configuration plans.

Product/design references define intent; current-state guides define the implemented behavior. ADR-018 supersedes conflicting Labs plans. The current guides and project status are maintained; retired phase logs and audit snapshots are not part of the active documentation set.
