# Public Labs and Owner Workspace — Current Engineering Map

**Audited branch:** `feat/labs-platform-integration`  
**Current-state date:** 2026-11-07  
**Authority:** This guide describes the routes and behavior present in this branch. The PRD and Labs UX specification remain the target-product authorities; explicit 7 November decisions are collected in Section 39 of `LABS-AND-AUTHENTICATION-DESIGN-SPEC.md`.

> **Important boundary:** Public Labs is currently a source-backed custom-experiment catalogue with a static detail page. The owner compiler, temporary Run preview, immutable artifact build and public artifact Route Handler are separate capabilities. The public detail route does not mount the interactive published artifact.

## 1. Route map and domain boundaries

| Route | Purpose | Access |
|---|---|---|
| `/labs` | Public custom-experiment collection and featured eligible experiment | Public |
| `/labs/[slug]` | Static experiment presentation, engagement and published-source access | Public page; source bytes require verified account |
| `/admin/labs/analytics` | Collection-level Labs engagement report | Owner |
| `/admin/labs/analytics/[slug]` | One-experiment analytics detail | Owner |
| `/admin/labs/sources` | Source inventory | Owner |
| `/admin/labs/sources/[slug]` | Source editor, versions, temporary Run and publish workspace | Owner |
| `/admin/labs/sources/import` | Direct import workspace retained outside the inventory navigation | Owner |
| `/admin/labs/experiments/new` | Create custom experiment metadata | Owner |
| `/admin/labs/experiments/[slug]/edit` | Edit permitted metadata fields | Owner |

Portfolio Analytics at `/admin/portfolio/analytics` is a separate product and data domain. It must not be merged with Labs source-engagement events.

## 2. Public catalogue — source-backed custom experiments only

Entry point: `src/app/labs/page.js`.

The page calls `getPublishedCustomLabExperimentPage({ limit: 18, includeCategoryCounts: true })`. The eligible public collection consists of MongoDB custom experiments that are published and have a published source pointer plus a ready build artifact matching the exact published source version. The current page does not merge the code-owned runtime registry into the public catalogue.

The page composition is:
1. `LabsPageShell` resolves the account presentation and shared Labs navigation.
2. `LabsIntroduction` receives total experiment and active-category counts.
3. `resolveFeaturedExperiment` selects only from the currently eligible page results.
4. `FeaturedExperiment` presents the selected experiment when one exists.
5. `LabsCollection` renders the collection and category/pagination controls.

Public collection API: `GET /api/v1/labs`.
- Fixed page size: 18.
- Supported query inputs: approved category and validated opaque cursor.
- A caller-supplied `limit` is rejected; page size is not client-controlled.
- Category values are checked against the canonical category list.
- Search by title/description/technology/tags and visitor-selected sort are not implemented.
- Do not describe this endpoint as a built-in-plus-custom catalogue or claim search/filter/sort behavior that is not present.

The four code-owned runtime modules remain code-owned/importable assets for the source/runtime workflows. Their presence in the runtime registry does not make them public catalogue entries.

## 3. Public detail — static presentation, not an interactive playground

Entry point: `src/app/labs/[slug]/page.js`.

The route resolves the eligible custom experiment through `getPublishedCustomLabExperimentBySlug(slug)`; an ineligible or missing experiment returns Next.js `notFound()`.

The current page renders:
- `LabDetailHeader` with experiment metadata and engagement;
- `LabExperimentPreview`, the shared non-executable static media renderer;
- `LabExplanation`;
- `LabSourceAccess`, which presents protected source access according to the visitor's verified-session state.

The page does **not** mount `LabWorkspace`, `LabRuntimeBoundary`, a runtime iframe or executable experiment code. It does not run a compiler job for a visitor. This is the approved public-detail contract as of 2026-11-07. Do not wire the published artifact iframe into this route unless the product decision is explicitly reopened.

### 3.1 Static media selection and fallback

The experiment preview renderer uses the release-aware gallery preview policy. The intended precedence is:
1. owner-selected public `galleryPreview` bound to the current release;
2. generated static poster bound to the exact ready artifact/source version;
3. validated thumbnail when available;
4. explicit “Preview media unavailable” presentation.

Images, GIFs and videos are rendered as media, not as experiment code. The component preserves intrinsic proportions and uses `object-contain`; it does not synthesize experiment-specific artwork. A failed media source can move selection to the next available source. Reduced-motion handling is retained for animated media/poster presentation.

The current model keeps `galleryPreview` separate from `mediaAttachments`. The attachment model is still limited to at most one `fallback-preview` role. An ordered `detail-gallery` and the full target role model are not implemented. A runtime-fallback role has no active public runtime surface under the current static-detail decision and must not be presented as an implemented feature.

## 4. Protected source access

The source-access domain is separate from the public detail DTO and static media renderer.

Current server flow:
1. Resolve the Better Auth session on the server.
2. Require a user ID and `emailVerified === true`.
3. Require a canonical, currently published Labs experiment (code-owned canonical slug where supported by the source helper, or eligible published custom experiment).
4. Load the source aggregate and require `published === true`.
5. When a `publishedVersionId` exists, resolve that exact immutable `LabSourceVersion`.
6. Validate the snapshot before returning any source bytes.

Current source validation in `src/app/lib/labs/source-access.js` includes safe relative paths, no dot traversal, a language allowlist, rejection of known secret-file names and secret-like content, 1–40 files, text-only content and a 1 MB total response cap.

Every verified account can read the currently published source. The source-access service no longer performs a `LabSourceGrant` lookup. The legacy model/collection may remain for migration safety, but it is not the current authorization decision. Guest and email-unverified sessions do not receive source bytes. Source responses must remain private/no-store and must never be placed in public HTML, public DTOs or static runtime assets.

The browser source viewer is a protected read-only surface. Session state is revalidated and loaded source is cleared when the session is no longer eligible; see `LABS-AUTHENTICATION-AND-SOURCE-ACCESS.md` for the detailed session and privacy contract.

## 5. Engagement and likes

The public page receives an initial engagement snapshot server-side using the current session and guest-like cookie. Engagement state is separate from source authorization:
- verified users have one persistent active like per account/experiment;
- guests use a browser-scoped signed cookie identity and a hashed server-side key;
- guest identity is not a unique-person identity and does not transfer across arbitrary browsers/devices;
- guest state has an `expiresAt` TTL; the published Privacy Policy currently describes a 180-day idle expiry;
- signed-in unverified accounts do not receive protected source access.

Server-confirmed transitions and event attribution live in the engagement service. Do not count a duplicate state request as a new like transition.

## 6. Owner identity and route protection

Owner-only pages and APIs use the server-derived Better Auth session and `getLabsOwnerAccessStatus` / `isLabsOwner`. Hiding a navigation item is not authorization; direct page and API requests must independently enforce the owner guard.

**Locked target policy:** owner access is based only on the server-only `LABS_OWNER_USER_ID` matching the stable Better Auth user ID, with a verified session. Do not add a first-user, client-role, display-name or email bootstrap fallback.

**Current implementation mismatch:** `src/app/lib/labs/owner-access.js` currently accepts either a matching `LABS_OWNER_USER_ID` **or** a separately configured `LABS_OWNER_EMAIL` matching the verified account email. The ID-only rule is not enforced by this branch until the email fallback is removed. Before changing that code, inspect Preview/Production configuration so the owner is not locked out. Do not document the email fallback as an approved permanent policy.

## 7. Labs Analytics

Labs Engagement Analytics uses `lab_analytics_events`, `lab_likes` and `lab_guest_likes`; it is distinct from `portfolio_visits`.

Current event model allowlist:
- `source_open`
- `code_copy`
- `like`
- `unlike`
- `guest_like`
- `guest_unlike`

There are no current event types for experiment detail views, preview starts or preview interactions. Portfolio Analytics has a separate Labs detail route/page-visit classification, but it is not the same as the per-experiment Labs engagement event stream and must not be relabelled as such.

The collection dashboard and `/admin/labs/analytics/[slug]` display the metrics supported by existing event and state records. The charts are single-metric Chart.js views with an HTML data-table alternative; summary counters reuse `MotionNumber`. The live dashboard uses visible-tab polling (10-second initial cadence with bounded backoff), not WebSockets. Polling and data correctness still require current-HEAD authenticated browser and Atlas verification.

**Approved privacy target (2026-11-07): aggregate-only owner analytics.** The owner-facing contract must not expose names, masked emails, timestamps tied to individual likes, a searchable liker directory, or per-user source/copy/like histories.

**Current implementation mismatch:** the experiment analytics detail page currently includes a panel that resolves active verified `LabLike` records to Better Auth user names and masked emails and paginates/searches that list. This panel must be removed or redesigned to show aggregates only before the implementation can be called compliant with the accepted privacy decision. The current public Privacy Policy already describes aggregate-only reporting.

## 8. Source Library and the removed Initialize action

`/admin/labs/sources` renders the source inventory. The former top-level Initialize sources navigation action and its icon import were removed. This change removed the visible page trigger; it did not delete every import capability.

The following remain in the branch:
- direct owner-protected `/admin/labs/sources/import` route;
- `LabRuntimeImportPanel.js`;
- `POST /api/v1/admin/labs/sources/import-runtime`;
- `POST /api/v1/admin/labs/sources/import-magnetic-button`.

Do not reintroduce the inventory action or claim that the import route/endpoints were deleted.

## 9. Source workspace, editor and release lifecycle

Owner workspace: `/admin/labs/sources/[slug]`.

The source editor is built around `LabCodeEditor`, which dynamically loads the self-hosted Monaco integration and has a plain-text fallback. Monaco is used for:
- protected public read-only source;
- editable owner source workspace;
- immutable version-history read-only source.

The current editor supports permitted text files and the add/import/rename/delete/reorder, validation, dirty-state, save/discard, history, restore, Run and publish actions documented in the Labs source/runtime plans. Monaco is the presentation/editor surface; React file state and server source/version contracts remain authoritative. Do not revert the current editor design to the old textarea-only plan. Verify final-keystroke synchronization and the full action sequence after any editor changes.

Keep these operations distinct:
- **Run:** compiles the unsaved working copy in a temporary isolated Vercel Sandbox preview; it does not save or publish.
- **Save Draft:** records a new immutable source version while preserving the current published pointer.
- **Build & Publish:** builds the selected exact saved version, creates immutable artifact output and then updates the published source/artifact pointers.
- **Unpublish:** removes current public source/runtime eligibility without rewriting historical versions/artifacts.
- **Restore:** creates a new version based on an older snapshot; it does not mutate history.

The artifact delivery Route Handler is a separate capability. It serves only the artifact matching the published source/version/artifact pointers. Its existence does not imply that the public detail page embeds it.

## 10. Metadata editor and media ownership

Experiment metadata creation/editing is separate from source code:
- create route: `/admin/labs/experiments/new`;
- edit route: `/admin/labs/experiments/[slug]/edit`;
- metadata PATCH may update title, description, explanation, category and technologies;
- it must not mutate the canonical slug, source files, source-version pointers, publication state, gallery media internals or immutable artifacts.

Labs media uses Cloudinary for uploaded binaries and MongoDB references. Release/build artifacts and generated release posters use Vercel Blob. Current public preview roles are separate from owner-uploaded private assets. The full target media-role migration and ordered detail-gallery UI are pending.

## 11. Current gaps and release checks

| Item | Status |
|---|---|
| Public catalogue search, technology/tag filters and user-selected sort | Not implemented |
| Account dashboard, profile management and self-service account deletion | Not implemented |
| Per-experiment detail-view event and documented deduplication | Not implemented |
| Preview-start and preview-interaction events | Not implemented; public detail has no executable preview |
| Ordered detail gallery and complete role-aware attachment model | Not implemented |
| Owner ID-only authorization | Target locked; email fallback remains in current code |
| Aggregate-only Analytics detail UI | Target accepted; individual active-liker identity panel remains in current code |
| Atlas indexes/data reconciliation and current Preview verification | Pending environment verification |

Before release or a new Labs implementation phase:
- run the current branch's automated suite and production build;
- validate the exact Atlas collections/indexes and current data;
- test Guest / unverified / verified / owner authorization against direct API requests;
- verify publish/unpublish/restore pointer behavior and stale-version rejection;
- test Monaco load and fallback, full editor action sequence, and final-keystroke synchronization;
- verify static previews do not request or mount a runtime iframe;
- test source no-store and cross-user cache isolation;
- check media role and artifact-to-poster release binding;
- run responsive, keyboard, reduced-motion, light/dark and failure-state browser QA;
- confirm the public homepage and project details are unaffected.

This is a code map and verification checklist, not a claim that those external/release checks have already passed.
