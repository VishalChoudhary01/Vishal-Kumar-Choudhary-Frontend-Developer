# Design Specification — Component Lab

**Status:** Product/design requirements. This document describes desired visual and interaction quality, not a guarantee that every proposed capability is implemented. For current behavior, use [Public Labs and Owner Workspace](./pages/LABS-AND-OWNER-WORKSPACE.md), [Labs Runtime and Code Execution](./architecture/LABS-RUNTIME-AND-CODE-EXECUTION.md), and [ADR-018](./DECISIONS.md#adr-018--7-november-labs-catalogue-detail-owner-and-analytics-supersession). ADR-018 supersedes conflicting older statements: the public detail route is static/non-executable, only source-backed custom experiments appear in the catalogue, owner identity is ID-only target policy, and Analytics is aggregate-only target policy. Preview selection uses owner-promoted media first, automatic release-build screenshot second and artwork fallback.  
**Related:** [PRD](./PRD.md), [Admin design](./DESIGN-ADMIN.md), [Analytics design](./DESIGN-ANALYTICS.md), [Current Labs implementation](./pages/LABS-AND-OWNER-WORKSPACE.md), [Motion Lab component specification system](./MOTION-LAB/README.md)

## 1. Purpose and constraints
The Lab is a public discovery surface for React components, Motion animations and frontend experiments. It must integrate with the existing portfolio's visual language while keeping source execution, code editor dependencies and Lab-only behavior away from the public homepage critical path.

## 2. Public Lab listing
### Listing header
- Clear Lab identity and concise explanation.
- Search across title, description, technology and tags.
- Filter controls for category, technology, animation type and tags.
- Sort by newest, most viewed, most liked and most copied.
- Show active filters and provide a reset action.
- No curated collections are part of the approved baseline.

### Experiment cards
Use a consistent content hierarchy:
- One visual preview: an owner-promoted public `galleryPreview` image/GIF/video bound to the exact current published artifact/source version, otherwise an automatic PNG screenshot generated from that immutable artifact during Build & Publish, otherwise generic Labs artwork or a neutral placeholder.
- Title and concise description.
- Technology/tag metadata.
- Relevant engagement counts with clear meaning.
- Optional publication date if approved.
- Link to a stable experiment detail URL.
- Do not place full source or privileged configuration in card props or static payloads.

Gallery cards are static-only and must never mount experiment React trees, create runtime iframes, invoke the compiler or start Canvas/animation loops. Owner-promoted media is copied from an owned Cloudinary asset to public Vercel Blob after server-side ownership, format, size, signature and release-binding validation. If no promoted asset is eligible, the immutable release poster is used. Gallery cards never execute experiment code.

If an explicitly selected GIF/video is used as a card visual, show a still/poster state by default and load animation only when visible/engaged, with reduced-motion support and a cap on simultaneous playback. Video must be muted, inline and `preload="none"`; never autoplay with sound. Use responsive image sizes, lazy loading, stable 4:3 layout and immutable caching. Never serve a poster from a different published source/artifact version.



### Loading, empty and error states
- Skeleton/loading state that preserves listing header, category row, preview aspect ratio and card text rhythm without major layout shifts.
- Use route-level skeletons for Labs listing/detail and owner inventory/editor; keep the existing global page loader distinct and avoid duplicate full-screen loaders.
- Empty state for a genuinely empty Lab.
- No-results state when search/filter returns nothing, with a reset path.
- Error state with retry when safe.
- Pagination or progressive loading with stable ordering and no duplicate/missing entries.
- Accessible names and keyboard-operable filters.

## 3. Experiment detail page
Recommended content order, subject to existing project layout conventions:
1. Breadcrumb/back-to-Lab navigation.
2. Title, description and metadata.
3. Preview area.
4. Like and relevant engagement controls.
5. Technology/tags and supported usage/context.
6. Source access section with permission-aware rendering.
7. Related navigation only if supported by existing data; do not invent a curated-collection feature.

Maintain stable descriptive URLs under `/labs/[slug]`. Slugs must be unique, validated and safe. Published pages have appropriate metadata/canonical behavior; draft/private previews must not be indexed. The current detail page is a static presentation with optional static media, explanation, engagement and protected source; no published artifact executes in the public page.

## 4. Preview model
### Static media previews and generated code posters
- Images, GIFs and supported video are rendered as media, never executable content.
- The current card/detail preview choice is owner-promoted public `galleryPreview` media bound to the exact published code artifact/source version; otherwise use an automatic PNG screenshot generated from the exact immutable artifact at release build; otherwise use generic Labs artwork or a neutral placeholder.
- The owner promotion flow validates and copies an owned asset to public storage and binds it to source-version/artifact IDs. The generated screenshot is captured once during the same isolated release build, validated and bound to the exact artifact/source version; capture failure is non-blocking.
- `detail-gallery` is a future supporting-media role. `runtime-fallback` is a target role only if a public runtime is separately approved; ADR-018 currently keeps the detail page static.
- Use responsive media sizing, accessible alternatives/captions, lazy loading and reserved aspect ratios. GIF/video animation is visibility/engagement-gated and reduced-motion-aware; video never autoplays with sound.
- Validate media references and avoid layout shift.
- The current backend supports only one legacy `fallback-preview` attachment; the three target roles require a reviewed schema/API migration before role controls ship.
- Respect supported format/size limits once selected in architecture.

### Owner-only interactive preview and public static detail
Owner-created React JS/JSX, React TS/TSX and standalone HTML/CSS/JavaScript projects are built/run in the owner workspace using the fixed compiler toolchain. The temporary Run preview uses the current unsaved working copy; Build & Publish operates on an exact saved immutable version. The public `/labs/[slug]` page does not mount or execute that artifact.
- The compiler uses a pinned dependency allowlist, local project imports and a deterministic build manifest. No arbitrary package installation, remote script/CDN imports or server-side code.
- Tailwind v4 utilities are compiled at build time; no Tailwind CDN/browser-time compiler is used.
- Motion executes inside the isolated browser runtime, respects reduced motion and has no access to the portfolio's MotionProvider or Lenis state.
- Never execute untrusted source in the main portfolio React tree, Next.js server or same privileged application context.
- An iframe by itself is not proof of adequate isolation. Use a dedicated runtime origin, strict sandbox permissions, CSP, cookie/storage separation, validated messaging, network denial by default and resource/time limits.
- Do not expose application cookies, privileged API endpoints, admin credentials, private source or user-session secrets to the preview runtime.
- Do not permit arbitrary package installation or unrestricted network fetches.
- Authenticate and authorize preview creation on the server; validate the exact source hash and asset manifest before publication.
- Include queued/building, iframe-starting, runtime-ready, build-error, runtime-error, timeout, stopped and unsupported states. The iframe load event alone is not a runtime-ready signal.
- Keep a visible preview skeleton until the current run ID sends a validated ready message; never show a blank white canvas.
- The owner Run action executes the current unsaved working copy in its isolated temporary preview. Build & Publish compiles the exact saved immutable version and attempts a static screenshot poster. The public detail page remains static/non-executable under ADR-018 and does not embed the published artifact.
- Owner Run and release builds use isolated Vercel Sandbox; immutable artifacts are stored in Vercel Blob. The public detail route does not embed or execute the published artifact. Treat any earlier interactive-detail proposal below as superseded by ADR-018.

## 5. Source access and code-copy behavior
- Guests see an access prompt only. Do not expose source snippets to guests until a separate content policy, exact scope and UX are explicitly approved.
- Full source is fetched through a server-authorized endpoint for any user with a valid Better Auth session and `emailVerified === true`, provided the requested source version is published. No per-user grant or owner approval is required.
- Do not embed the full source in guest HTML, static props, RSC payloads, hidden DOM, client bundles or public API responses.
- Copy control is available only when the verified source viewer is authorized; code-copy actions are reported after successful Clipboard API writes.
- Resolve the initial session and published-source authorization in the Server Component before rendering the detail route. Verified users receive the authorized published snapshot directly in the first response; client hydration only reconciles session changes and handles sign-out/expiry. Guests see Sign in and Create account in the source section and Labs navbar; signed-in unverified users see Verify email; verified users automatically load published source without any auth CTA or “Check source access” button. Signed-in navbar state shows the account menu instead of guest links. Server authorization remains mandatory.
- Provide feedback for copy success/failure and a selectable fallback if clipboard permission is unavailable.
- Instrument a copy action only when the supported client flow reports the action; do not imply that code was pasted or used.
- Handle expired sessions and permission changes without leaking the source in errors or cached responses.
- Cache policy must not let an authorized response be reused for guests.

## 6. Likes
- Guest likes may use the existing best-effort browser-storage mechanism where available and are not guaranteed unique/cross-device. Verified accounts receive persistent likes with one active like per user/experiment.
- Authenticated likes are persisted server-side and enforce one active like per user/experiment.
- Like/unlike state must be clear and accessible.
- Use React 19 `useOptimistic` for reversible like/unlike feedback; reconcile with the server and roll back on rejection.
- Handle rapid repeated actions, pending states, server failure and retry without creating duplicate records.
- Track guest and authenticated actions separately where measurable; document deduplication assumptions.
- Do not present guest counts as verified unique people.

## 7. Discovery and URL behavior
- Search fields: title, description, technology, tags.
- Filters: category, technology, animation type, tags.
- Sort: newest, most viewed, most liked, most copied.
- Use server-side query validation and bounded page sizes.
- Ensure filter/sort state has a predictable URL/back-navigation behavior where practical.
- Use stable tie-breakers and ensure pagination remains consistent as content changes.
- Unpublished content is excluded from public search, feeds, metadata and cacheable public responses.
- Search must not disclose draft titles or source through error messages or counts.

## 8. User dashboard integration
For authenticated users, support:
- Liked experiments.
- Recently viewed experiments.
- Recently accessed components.
- Personal engagement activity.
- Account summary/settings and links back to Lab discovery.

Keep personal activity private to the user. Do not merge guest browsing into an account without an explicit, disclosed design. Define retention and deletion behavior before launch.

## 9. Admin publishing integration
Lab records use Draft, Published and Unpublished states, immutable content versions, private preview and explicit publish/unpublish confirmation. Scheduled publication targets an exact version. Changes to a draft do not modify the published experience until a successful publish transition.

Lab editor supports:
- Metadata and slug validation for owner-created experiments.
- HTML/CSS/JavaScript and React/JSX project editing with the documented starter template.
- Live preview of the actual code, not only a static thumbnail.
- Tailwind v4 build validation and Motion runtime support through the fixed package allowlist.
- Media upload for images, animated GIFs and videos.
- Media assignment for card `gallery-preview`, detail `detail-gallery` and runtime `runtime-fallback` roles after schema/API migration. In-experiment asset manifests are outside the initial role migration.
- Dependency/import policy validation, build diagnostics and runtime error feedback.
- Version history, restore and explicit publication of an exact immutable release.
- Publication state and scheduled-job state only if scheduling is separately approved.

## 10. Design, responsive and accessibility
- Follow existing portfolio tokens, typography and visual hierarchy rather than inventing a conflicting brand.
- Preserve existing portfolio home and project detail layout/behavior.
- Keep cards and controls readable without excessive rounded/pill UI.
- Keyboard-operable search/filter/sort, likes, source controls and preview actions.
- Visible focus, semantic labels, meaningful image alternatives, clear status announcements and sufficient contrast.
- Respect reduced motion; Motion animations must not prevent access to content or controls.
- Avoid unnecessary custom CSS when Tailwind CSS v4 utilities and existing tokens are sufficient.
- Support mobile and zoom without clipped source controls, metadata or preview frames.

## 11. Performance and SEO
- Do not load editor, syntax-highlighting, preview runtime or chart libraries in the public homepage bundle.
- Lazy-load expensive detail-page modules and interactive previews.
- Use a selected published gallery-preview asset or generated static code-output poster as the lightweight listing-card visual. Never run experiment code, create iframes or compile code in gallery cards.
- On the experiment detail page, render a static preview and readable metadata/explanation/source sections; do not mount the artifact runtime or show public-runtime loading/error/retry states.
- Keep owner editor/compiler/preview dependencies out of public listing and detail bundles.
- Optimize responsive images and reserve aspect ratio to reduce layout shift.
- Published Lab pages have deliberate metadata and canonical behavior.
- Draft/preview pages are private, non-indexable and excluded from public sitemap/search.
- Do not claim SEO/performance improvement without measured before/after evidence.

## 12. Lab acceptance checklist
- [ ] Search/filter/sort/pagination behave predictably and are server-validated.
- [ ] Only published entries appear in public discovery and SEO surfaces.
- [ ] Guest pages expose no full source through hidden or serialized payloads.
- [ ] Full source requires server-side authorization. The interactive Run/preview capability is owner-only and isolated; the public detail page stays static.
- [ ] Untrusted source never executes in the main application context.
- [ ] Owner Run/build execution remains isolated in the network-denied Sandbox; untrusted source never executes in the main application context.
- [ ] Gallery cards use selected media or source-version-matched generated posters and execute zero experiment runtimes.
- [ ] Static previews are responsive, accessible and optimized.
- [ ] Owner Run still executes current unsaved working copies; Build & Publish stores the exact saved release and non-blocking poster capture; public detail pages never execute the artifact.
- [ ] Runtime loading/error/retry/fallback states never leave a blank white canvas.
- [ ] Route skeletons reserve layout space; optimistic actions reconcile and roll back on server errors.
- [ ] Guests and signed-in-unverified users cannot view/copy source or use source engagement controls; verified users receive published source automatically.
- [ ] Source opens, copies and like/unlike actions are counted once under the approved idempotency rules and appear as experiment-level aggregates in owner/admin analytics.
- [ ] Preview/source failure states are clear and do not leak sensitive details.
- [ ] Lab-only dependencies do not affect the critical public homepage bundle.
- [ ] Existing public portfolio and project detail pages pass regression checks.

## 13. Owner-managed source workspace

The implemented source-management lifecycle is documented in [Public Labs and Owner Workspace](./pages/LABS-AND-OWNER-WORKSPACE.md) and [Labs Runtime and Code Execution](./architecture/LABS-RUNTIME-AND-CODE-EXECUTION.md). This section adds design expectations without authorizing general CMS/Admin implementation.

- The owner workspace is a protected management surface and is distinct from the compact public experiment source-access section.
- The first release is for one trusted, manually provisioned owner; do not design a multi-admin permission matrix unless separately approved.
- Workspace layout should prioritize experiment identity, file tree, editable code area, validation feedback, unsaved state, save-draft action, version history, and explicit publish/unpublish controls.
- Source files remain text snapshots; media binaries are managed as separate Cloudinary assets. The owner can run a controlled browser build/preview only through the isolated Vercel Sandbox boundary described in [Labs Runtime and Code Execution](./architecture/LABS-RUNTIME-AND-CODE-EXECUTION.md). The workspace is not a terminal, general shell or arbitrary package manager.
- File add/rename/delete operations are explicit; deleting a file requires confirmation. Invalid paths, duplicate names, unsupported file types and size failures preserve the current editor input and explain the correction.
- Save draft and Publish source are separate actions. Publishing requires confirmation of the exact saved version; a save must never publish implicitly.
- Version history is owner-only, read-only for past snapshots, and supports restore by creating a new draft. It must not edit historical snapshots in place.
- Per-user source grant management is not part of the target design. The owner publishes/unpublishes source for all verified accounts. The owner/admin analytics view shows aggregate source opens, unique verified accounts, copies, active likes and like/unlike trends per experiment.
- Show distinct empty, loading, validation, stale-version/conflict, save-success, publish-success, publish-failure, unavailable database and unauthorized states.
- The editor and syntax-highlighting code are lazy-loaded only inside the owner route. They must not load on `/`, `/labs` or ordinary experiment pages.
- Reuse the existing portfolio tokens, typography, focus/keyboard conventions, restrained radius and responsive rules. Do not introduce a new UI system.
- Owner-created experiments can be Run in the isolated owner workspace and published as immutable artifacts. The public detail page currently remains static/non-executable; it does not mount the artifact runtime. This is the accepted ADR-018 boundary.
- The public detail page can show metadata, explanation, static preview media, engagement and protected source. It does not execute a public runtime. `detail-gallery` and `runtime-fallback` remain target media roles only if the data model and product boundary are separately approved.
- Owner source management does not weaken the compact public source-access gate or change the four existing code-owned demo runtimes.


### 13.4 Media library and public media presentation

- The owner can upload still images, animated GIFs and video clips to the Labs media library.
- An uploaded asset can be assigned to card `gallery-preview`, ordered detail-page `detail-gallery` or failure-only `runtime-fallback` roles after the schema/API migration.
- Each role reference supports accessible alt text, optional caption and ordering where relevant; video uses a poster image.
- Card visuals use lightweight responsive media or a generated version-bound code poster; GIF/video animation is visibility/engagement-gated, muted/inline, reduced-motion-aware and capped.
- In-experiment asset imports are not part of this initial role migration and require a separate compiler/API contract.
- Detail pages show the actual interactive experiment first/primary, with detail-gallery media as supporting content and runtime-fallback only after a runtime failure/unsupported state.
- Media remains separate from source code and compiler artifacts. Do not serialize draft media references or unpublished media URLs into public payloads.
- The exact upload limits and Cloudinary delivery mode are defined by [Environment and Release](./operations/ENVIRONMENT-AND-RELEASE.md) and the implementation in `src/app/lib/labs/media-management.js`; verify the actual Cloudinary account plan and environment before deployment.

### 13.3 Source access, likes and analytics policy

- A source-open is counted only after the verified-user source endpoint successfully returns the published source. A public experiment detail-page view is a separate metric.
- A code-copy action is counted only after the client confirms a successful Clipboard API write and the server accepts the idempotent event. Never transmit clipboard text to analytics.
- Like/unlike is available only to verified accounts and increments action metrics only when the server confirms a state transition. A unique per-user/experiment like-state record enforces one active like.
- The owner/admin dashboard is per experiment and aggregate-only: source opens, unique verified accounts opening source, copy actions, active likes, like/unlike action counts, daily/monthly trends and source-open/copy rankings.
- Do not show individual user names, emails or per-user source browsing/copy history in the first release.
- Analytics retention, event deduplication and account deletion behavior must be approved and disclosed before events are enabled in Production.

### 13.1 Remaining design and verification considerations

- Responsive behavior of the owner file tree and editor navigation on narrow screens.
- Final visual treatment for source-version comparison/diff review.
- Keyboard, focus, high-zoom and reduced-motion QA for the integrated Monaco editor and its plain-text fallback.
- Verify the existing direct import route and owner protections; do not add a second source-import workflow without an approved requirement.

These are design/verification considerations, not claims that the source workspace or Monaco integration is absent.

### 13.2 Owner entry point and public demo separation

- Provide a discoverable owner-only entry into the source workspace, such as a server-authorized owner account-menu item and/or a `Manage source` action in the experiment source section.
- Only server-derived owner capability may reveal that navigation item. Directly opening an owner URL must still run the owner guard.
- Editing a protected Atlas snapshot does not update the public demo runtime. Existing public demos remain code-owned and are changed through the canonical repository and normal deployment workflow.
- Do not imply that Save/Publish source executes code or updates the live demo. Any live preview of stored source is a separate isolated-preview design and security gate.


## 14. Current implementation pointer

The Labs landing-page composition (hero, real-data statistics, featured experiment, category controls, collection cards and cursor pagination) and current implementation status are documented in [Public Labs and Owner Workspace](./pages/LABS-AND-OWNER-WORKSPACE.md). The hero artwork now uses a lazy-loaded Three.js particle sphere with a fixed world-space radius, responsive camera framing, three moving orbit particles, click/touch radial burst with recovery, pointer repulsion, burst-reactive orbit speed, independent particle shimmer, theme-aware palettes, a full-width dark-mode right gradient and a reduced-motion/WebGL fallback; the implementation contract and QA boundaries are recorded in that guide and [PROJECT-STATUS.md](./PROJECT-STATUS.md). Media precedence, owner promotion and automatic release-poster capture are documented there and in [Labs Runtime and Code Execution](./architecture/LABS-RUNTIME-AND-CODE-EXECUTION.md). The public detail route remains static/non-executable under ADR-018. Current-commit tests, database indexes, deployment, browser, accessibility and reduced-motion verification remain release checks; phased implementation history is not maintained in this design document.

## Motion Lab component specification authority

Reusable React/Motion components are governed by the separate [Motion Lab specification system](./MOTION-LAB/README.md). It defines the locked professional visual language, motion engineering rules, mandatory AI-agent workflow and the canonical component inventory, with an individual build-ready specification for every listed component. It does not claim those components are already implemented. Agents must read the global standards and the individual specification before implementing a component.
