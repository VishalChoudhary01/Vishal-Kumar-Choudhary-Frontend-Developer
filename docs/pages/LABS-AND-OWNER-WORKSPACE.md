# Public Labs and Owner Workspace — Current Engineering Map

**Audited branch:** `feat/labs-platform-integration`  
**Current-state date:** 2026-11-07  
**Authority:** This guide describes the routes and behavior present in this branch. The PRD and retained design documents define product requirements; accepted superseding Labs decisions are recorded in [ADR-018](../DECISIONS.md#adr-018--7-november-labs-catalogue-detail-owner-and-analytics-supersession).

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
2. The Labs hero presents the page introduction, a lazy-loaded Three.js 3D particle sphere, real catalogue statistics and auth-aware CTAs. In dark mode, a radial gradient darkens only the right artwork region; on mobile it begins below the copy/stats area. Hero text, CTA and statistics positioning remain unchanged. Hero text/stat reveals respect reduced motion; the loading, reduced-motion and WebGL-failure states share a particle-only SVG sphere: it reuses the deterministic sphere particle generator and the live three-orbit definitions, draws no filled sphere or separate sphere-glow mesh, and keeps the same three projected orbital paths.
3. `resolveFeaturedExperiment` selects only from the eligible published custom experiment collection; a preferred slug is used when eligible, otherwise selection falls back deterministically to the first eligible record.
4. `FeaturedExperiment` presents that same resolved record using the shared static preview renderer; the hero/spotlight does not maintain a second copied experiment object.
5. `LabsCollection` renders the collection heading, published-category controls/counts, result summary, card list, Likes and pagination controls.

Public collection API: `GET /api/v1/labs`.
- Fixed page size: 18.
- Supported query inputs: approved category and validated opaque cursor.
- A caller-supplied `limit` is rejected; page size is not client-controlled.
- Category values are checked against the canonical category list.
- Search by title/description/technology/tags and visitor-selected sort are not implemented.
- Do not describe this endpoint as a built-in-plus-custom catalogue or claim search/filter/sort behavior that is not present.

The client reveals six cards per interaction and fetches subsequent custom records through the cursor API. The server page is bounded to 18 custom records; category counts are computed across the full eligible collection. The API supports the canonical category and validated cursor only; title/description/technology/tag search and user-selected sorting are not implemented. Two compound MongoDB pagination indexes must be provisioned using `npm run db:ensure-labs-public-indexes` in the intended environment before release.

The four code-owned runtime modules remain code-owned/importable assets for the source/runtime workflows. Their presence in the runtime registry does not make them public catalogue entries.

The hero artwork implementation is isolated under `src/app/components/labs/landing/particle-sphere/` and replaces the earlier SVG orbit illustration in `LabsHeroArtwork.js`.

- `LabsHeroArtwork` lazy-loads the client-only Three.js renderer after the artwork enters the viewport. It does not add Three.js to the homepage route.
- The scene renders one `THREE.Points` system. Its high-tier profile uses 5,200 Fibonacci-distributed surface particles, 620 interior particles and 26 detached ambient particles; the sphere world-space radius is 1.38, with a translucent inner shell at 80% of that radius. The shell uses a dark teal tint in light mode and a lighter mint-teal tint in dark mode, with theme-specific opacity. The three tilted orbit ellipses are enlarged to 1.74×1.02, 1.60×0.82 and 1.90×0.92; their original plane rotations remain unchanged. medium, compact and constrained-device profiles use lower budgets, DPR caps and render-rate limits. Geometry generation is deterministic and renderer-independent in `particle-geometry.mjs`.
- Custom shaders provide front-facing surface emphasis, subdued rear-surface visibility, hemisphere fill and a restrained rim highlight for stronger volume, view-space depth attenuation, clearer point cores, soft particle halos, stronger independent particle shimmer with bright star-like glints, and small ambient-particle drift. Light mode uses a deep teal particle body (`#103b37`), near-black teal shimmer (`#041816`) and dark teal core glow (`#0a2926`). Dark mode uses a lighter mint-teal outer/surface particle color (`#8ce8dc`) with a 0.08 original-particle blend, 1.45× surface brightness, a 0.10 rear-surface opacity floor and 1.16× surface point-size scale so the full sphere remains visible against the near-black hero background; it retains mint-white glints and a distinct luminous inner layer (`#bafff3`, 0.88 opacity). Light mode retains its original deep-teal surface color, original particle blend, brightness, size and rear-surface opacity, plus the subdued dark-teal inner layer (`#0b2926`, 0.58 opacity). Inner particles use their own shader color/opacity uniforms and retain visibility through the volume instead of inheriting the outer surface's front-facing fade. Theme changes update these uniforms without rebuilding the scene.
- The sphere has a fixed world-space radius throughout its animation. No contraction, squeeze, scale pulse or geometry resize is applied. Its particles only rotate and use subtle shader-level micro-drift/shimmer.
- Each of the three enlarged closed orbital curves has a small bright core particle and a soft glow particle. The runner advances continuously around its own ellipse at its regular speed; the orbit paths and runner speed are independent of the particle burst envelope.
- A short click/tap on the visible sphere is confirmed with a Three.js raycast against an invisible interaction-only hit sphere. Each surface/inner particle receives a deterministic 3D impulse: a radial-dominant displacement plus two perpendicular tangential components, per-particle radial variation and a small depth drift. Launch times are staggered across 80 ms and recovery durations vary per particle; the outward phase is 450 ms and recovery varies from approximately 1.36 to 1.57 seconds. The combined radial/tangential envelope can reach roughly 3.4× resting radial distance. A new tap restarts the current burst instead of stacking forces; source geometry and resting sphere radius remain unchanged.
- Pointer movement over the sphere applies a local repulsion field to nearby particles. The canvas uses Pointer Events, captures only a gesture that begins on the sphere, releases capture on completion/cancel, and keeps `touch-action: pan-y` so vertical page scrolling remains available.
- During the burst, the three orbit runners accelerate smoothly to at most 1.65× their normal speed and return to their regular cadence as the particles recover.
- The existing GPU point shader draws a short tapered streak inside each burst particle's point sprite, aligned with its projected screen-space travel direction; it does not allocate separate trail meshes. Sparkle chance, phase, rate and burst-glint intensity are independently seeded per particle, so highlights do not flash in unison.
- The perspective camera remains at its responsive idle distance during particle bursts. It does not anticipate or pull back, so the central sphere and enlarged orbit rings retain exactly the same apparent size and position while only the particle points move outward and recover.
- Volumetric shading stays within the single GPU point system. Near/far particles receive separate size and opacity attenuation, distant points blend subtly toward a theme-specific atmospheric tint, interior particles use radial light falloff and a soft volume halo, and ambient points use their own theme color/opacity. Theme changes update the volume and ambient uniforms without rebuilding particle geometry or adding extra light meshes.
- The perspective camera recalculates only its idle distance from the actual canvas width/height and the enlarged orbit envelope. During a burst the camera remains fixed: it does not shrink the rings or move the center sphere. Only the GPU particle positions disperse and recover. The scene never scales the sphere geometry. The fixed figure/canvas `overflow-hidden` bounds remain the final guard against page overflow. The figure keeps its fixed `aspect-[1.08/1]` sizing and 280 px minimum height; the burst only changes GPU particle positions and never changes layout dimensions, document height or page overflow.
- The dark-mode radial gradient is applied directly to the outer full-width hero wrapper; there is no separate absolutely positioned overlay or gradient panel. On mobile its focal point shifts toward the lower-right behind the stacked artwork; on desktop it broadens to the right-center. Both are one continuous radial fade from the unchanged left background to near-black at the right edge, with no horizontal/vertical panel seam. The standalone divider after the hero grid is removed; the stats' own top border remains. Dark-mode sphere atmosphere is deliberately low-opacity to avoid a dense teal glow spot.
- The renderer selects high/medium/compact/low particle profiles from viewport width and available device-memory/CPU hints, updating geometry whenever the complete particle budget changes (including when the tier label stays the same). DPR is capped at 1.5 on high-tier devices and reduced on compact devices. Particle frustum culling is disabled for the burstable point cloud because its shader-deformed positions can extend beyond the undeformed geometry bounds; the fixed canvas viewport performs final clipping. Rendering is paced to 60/50/40/30 FPS by the selected quality profile. `ResizeObserver` updates both projection aspect and camera distance so the full fixed-size sphere/orbits remain visible on mobile; the renderer pauses RAF when offscreen or the document is hidden and disposes GPU resources. WebGL initialization/context-loss errors fall back to the shared particle-only SVG artwork (the same deterministic particle distribution and three orbit definitions used by the live scene), without drawing a filled sphere or separate sphere-glow mesh.
- Reduced-motion users receive the static artwork and do not initialize the continuously animated or pointer-interactive WebGL scene.
- Unit coverage is in `tests/labs-particle-sphere.test.mjs`; the test is part of the `npm run build` checks through `test:labs-particle-sphere`.


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

The experiment preview renderer uses the release-aware gallery preview policy. The current public card/detail preview precedence is:
1. owner-promoted public `galleryPreview` image/GIF/video whose artifact/version binding matches the currently published release;
2. automatic PNG screenshot generated from the exact immutable artifact during its release build;
3. the existing generic Labs artwork or neutral placeholder when no release-bound media is available.

The screenshot is captured by `captureReleasePoster()` in the same network-denied release Sandbox after artifact output is built and uploaded. The pinned worker uses Playwright 1.65.0 and Chromium 158.0.8127.18, a 1200×900 viewport, local-only artifact serving and reduced-motion capture; it requires visible output, no browser runtime errors, a valid PNG, an 8 MB maximum and matching capture/browser versions. Its metadata and content hash are stored in `LabBuildArtifact.previewPoster`, separate from `outputFiles`, and the public DTO exposes it only when the current ready artifact/source-version binding and all poster fields validate. Capture failure is recorded as unavailable and does not block a valid release.

An owner can also promote an owned ready image/GIF/video from the experiment's private Cloudinary library through `PUT /api/v1/admin/labs/experiments/[slug]/media/gallery-preview` (body includes `assetId` and optional `altText`; `assetId: null` removes the current selection). The server re-checks asset ownership, authenticated Cloudinary resource metadata, supported media type, configured size, downloaded signature and exact current published artifact/source pointers; it copies the bytes to a public Vercel Blob object, stores the exact release binding and audit record, and never returns the private Cloudinary URL. Replacing, clearing, unpublishing or publishing a new artifact attempts to clean up the old public Blob object. The explicit owner promotion takes precedence over the auto-generated release screenshot.

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

The browser source viewer is a protected read-only surface. Session state is revalidated and loaded source is cleared when the session is no longer eligible; see [Authentication and Account Engineering](./AUTHENTICATION-AND-ACCOUNT-ENGINEERING.md) and [Privacy and Data Lifecycle](../architecture/PRIVACY-AND-DATA-LIFECYCLE.md).

## 5. Engagement and likes

The public page receives an initial engagement snapshot server-side using the current session and guest-like cookie. Engagement state is separate from source authorization:
- verified users have one persistent active like per account/experiment;
- guests use a browser-scoped signed cookie identity and a hashed server-side key;
- guest identity is not a unique-person identity and does not transfer across arbitrary browsers/devices;
- guest state has an `expiresAt` TTL; the published Privacy Policy currently describes a 180-day idle expiry;
- signed-in unverified accounts do not receive protected source access.

There is one Like control, which toggles to Unlike when active; Unlike reverses the current state and is not a dislike vote. Server-confirmed transitions and event attribution live in the engagement service. Do not count a duplicate state request as a new like transition. When a verified session is seen with the same guest cookie, active guest likes can be transactionally claimed by the account; an existing account like wins, the guest state is deactivated, retries are idempotent, and the migration does not create a synthetic verified action event.

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

The collection dashboard and `/admin/labs/analytics/[slug]` display the metrics supported by existing event and state records. The charts are single-metric Chart.js views with an HTML data-table alternative; summary counters reuse `MotionNumber`. The trend visualization is a lazy-loaded single-metric Chart.js column chart with UTC daily/weekly buckets, selected metric readouts, semantic colors, a tabular equivalent, reduced-motion handling and a retry state. Live refresh uses visible-tab polling with bounded backoff, not WebSockets. Polling and data correctness still require current-HEAD authenticated browser and Atlas verification.

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

Labs media uses Cloudinary for uploaded binaries and MongoDB references. Owner-promoted public gallery-preview images/GIFs/videos are copied to Vercel Blob and bound to the exact ready artifact/source version. Automatic screenshot posters are generated during release builds and stored in the immutable artifact namespace. Compiler artifacts use immutable Vercel Blob storage. The current attachment schema still permits only one private `fallback-preview`; the full target media-role migration and ordered detail-gallery UI are pending.

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

## 12. Public SEO and AEO — current implementation

The public collection and detail routes now use the shared SEO/AEO helpers:
- `src/app/lib/seo/labs.mjs` builds Labs collection/detail metadata, preview image URLs and JSON-LD.
- `src/app/labs/page.js` uses `buildLabsCollectionMetadata` and emits `CollectionPage` + `ItemList` structured data for the initial server page and actual eligible collection count.
- `src/app/labs/[slug]/page.js` uses one cached published-experiment lookup for metadata and page rendering; eligible detail pages emit `WebPage`, `CreativeWork` and `BreadcrumbList` JSON-LD. Ineligible records return noindex metadata and `notFound()`.
- Public experiment DTOs carry actual `publishedAt` and `updatedAt` timestamps; optional structured-data dates are emitted only when those values are valid.
- The visible detail header contains the experiment title/H1, description, category, creator byline and technologies. Explanation is a normal H2/text section when present. Static media is a figure with caption; preview alt text has a factual experiment fallback.
- Open Graph/Twitter/JSON-LD image properties are omitted when no valid image preview exists. Video files are not serialized as image URLs.
- The sitemap enumerates every eligible published Labs detail URL through its cursor pages; drafts, source files and internal/runtime routes are excluded.
- robots.txt disallows the private /admin area but leaves /api paths crawlable because a public generated poster is served through a Labs API route. Route authorization remains the security boundary.

**AEO contract:** describe only the visible static experiment, author, category, technologies, explanation and available preview. Do not claim that public detail executes an artifact; do not expose protected source bytes in public JSON-LD; do not add fake FAQ, rating, review, SearchAction or hidden keyword content.

**Remaining validation boundary:** the focused suite is included in `npm run build`, but this implementation pass did not run the test suite/build, live crawler/HTML inspection, Google Rich Results testing, Search Console URL inspection or production indexing checks. Labs-wide duplicate SEO-title/description detection is not yet a DB publication validator. See [SEO and AEO Engineering](../SEO-AND-AEO-IMPLEMENTATION.md) for all builders, route rules and gaps.
