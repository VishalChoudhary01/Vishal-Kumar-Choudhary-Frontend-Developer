# Product Requirements Document — Portfolio Platform

**Status:** Approved requirements baseline with a phased Labs runtime, gallery, media and interaction roadmap. Current Labs implementation has deployed preview/runtime regressions that must pass the documented recovery gate; CMS/Admin remains deferred.  
**Version:** 1.2  
**Scope:** Existing portfolio extension: CMS/admin, analytics, media library, user accounts, and Component Lab. The current Labs branch includes the initial auth and protected-source read foundation; owner-managed source authoring/versioning and engagement analytics remain planned.

## 1. Product vision
Extend the existing developer portfolio into a maintainable platform where the owner can manage selected portfolio content and publish React component/animation experiments through a controlled Lab. Provide useful engagement analytics without compromising the public portfolio's performance, design, security, SEO, or behavior.

## 2. Goals
1. Manage approved dynamic portfolio content without editing code for every content change.
2. Publish and maintain Lab experiments with static and isolated interactive previews.
3. Give visitors a useful public discovery experience and registered users an authenticated engagement experience.
4. Provide reliable, interpretable engagement analytics for portfolio and Lab content.
5. Support drafts, preview, explicit publishing, scheduling, version history, and safe media reuse.
6. Keep administrative/editor code and Lab execution costs out of the critical public-home-page path.
7. Protect private drafts, full source code, admin operations, user data, and infrastructure secrets.

## 3. Non-goals
- Replacing the existing portfolio visual identity or redesigning its public home page.
- Replacing the current project detail-page layouts with an admin-defined arbitrary page builder.
- Letting CMS content execute arbitrary JavaScript in the main application.
- Treating copy clicks as proof that code was used or shipped.
- Claiming guest likes are unique people or reliably cross-device.
- Building arbitrary multi-role administration; the initial roles are Guest, Registered User, and Admin.
- Selecting unapproved providers/infrastructure for authentication, job scheduling, or isolated code execution.
- Changing existing functionality solely to simplify implementation.

## 4. Users and permissions
### Guest
- View public portfolio pages and published Lab listing/detail pages.
- View permitted static media previews and explicitly public demos. Guests receive no source bytes, including partial snippets.
- Search, filter, sort, paginate/load more, and view published experiment metadata.
- Cannot view or copy source. May like public experiments through the existing best-effort anonymous mechanism where available.
- Cannot access private drafts, full source, restricted interactive previews, user-only features, or admin pages.

### Registered user
- All guest capabilities.
- Automatically access and copy the full source of every published experiment after signing in with a verified email address. No per-user/per-experiment owner grant is needed.
- Access interactive previews only through the approved isolated preview mechanism.
- Like/unlike experiments with a server-enforced one-active-like-per-user-per-experiment rule; this capability requires a verified account.
- Use a personal dashboard for liked experiments, recently viewed experiments, recently accessed components, account settings, and personal activity.
- Manage display name/profile image, view email, manage password where applicable, reset password, sign out, and delete account.
- Cannot grant themselves Owner/Admin privileges or alter source publication state.

### Admin
- Access protected admin routes and operations after server-side role checks.
- Manage portfolio dynamic content, projects, experience, Lab experiments, media, publication workflow, schedules, versions, and analytics.
- Admin role is provisioned manually through trusted setup; public registration never grants it. The initial Labs source-management release uses a single manually provisioned Owner identity, which is the only privileged administrator until multi-admin roles are separately approved.

## 5. Content ownership and rendering
### CMS-managed dynamic content
- Hero/introduction content.
- About content.
- Skills/technology stack.
- Experience entries.
- Project listing and project-specific detail content.
- Project slug, title, descriptions, project links (live demo/GitHub), featured state, publication state.
- Project covers, screenshots/gallery assets, ordering, captions, alt text and related gallery metadata.
- Lab experiment metadata, tags, category, technologies, preview configuration, source snapshots and publication state.

### Code-controlled/static concerns
- Education section content remains static in code.
- Layouts, visual identity, design tokens, typography, animations, responsive behavior, interactions and component behavior remain code-controlled.
- The CMS cannot inject arbitrary layouts, CSS, scripts or executable animation definitions into public pages.
- Dynamic content must use the existing approved layouts and components.

### Public route behavior
- Existing public routes and project detail URLs must continue to work.
- Project detail pages are data-driven by stable slug (for example, `/projects/system-canvas`) using the existing approved detail-page template.
- Lab entries use stable descriptive URLs (for example, `/lab/animated-gradient-card`).
- Published content is publicly renderable; draft/unpublished content is private and must not be indexed.
- CMS mutations trigger appropriate cache revalidation only after successful publication/state changes.

## 6. Functional requirements
### FR-01 Portfolio CMS
- Create, edit, validate, preview, publish, unpublish and archive/delete approved dynamic content types with confirmation and integrity safeguards.
- Preserve a published version while a new draft is edited.
- Validate required fields, slug uniqueness, links, media references and publication requirements.
- Provide explicit save feedback and protect against accidental unsaved navigation.
- A save action must not automatically publish.

### FR-02 Lab management
- Create and edit experiment metadata and source/configuration through an owner-only management workflow.
- Create source aggregates for existing experiment slugs, add/edit/rename/delete text files, validate file paths and size limits, and save draft snapshots.
- Publish/unpublish an exact saved source version; preserve immutable history and restore by creating a new version.
- Published source is automatically readable by every registered account whose email is verified. There is no per-user source grant/revoke workflow; the owner controls availability through publish/unpublish.
- Owner Studio **Run** must compile and execute the current unsaved working copy in the isolated preview for supported HTML/CSS/JavaScript, React JS/JSX and React TSX modes. Run is core functionality and must remain available while gallery/media features are implemented.
- A published experiment detail page runs the exact immutable published artifact in the isolated runtime; it must not leave a blank white canvas while loading or after failure.
- Gallery cards are static-only: never run experiment code, mount React roots, create experiment iframes or start compiler jobs in the card grid.
- Every card displays an explicitly selected published gallery-preview asset when configured; otherwise a generated static poster from the exact published artifact; otherwise existing LabArtwork/neutral artwork. Uploaded GIF/video is optional and is not required for a code-derived poster.
- Generated posters are version-bound to the published source/build and captured only after a successful runtime-ready signal. Poster failure does not replace the working code runtime or block a valid release; it uses artwork fallback and exposes retry/regenerate.
- Uploaded media supports explicit gallery-preview, detail-gallery and runtime-fallback roles. Runtime-fallback is shown only when the detail runtime fails or is unsupported; detail-gallery media supplements but never replaces the interactive runtime. The currently implemented fallback-only attachment model requires migration before these roles ship.
- Preview before publication; publish/unpublish with explicit confirmation.
- Validate source/configuration and dependency allowlists before an experiment becomes eligible for interactive preview.
- Public pages never expose full source through HTML, client bundles, API responses or predictable asset URLs to guests.

### FR-03 Discovery
- Search by title, description, technology and tags.
- Filter by category, technology, animation type and tags.
- Sort by newest, most viewed, most liked and most copied.
- Use pagination or progressive loading with stable, accessible loading/empty/error states.
- No curated collections are required in this baseline.

### FR-04 Authentication and authorization
- Email/password, Google OAuth and GitHub OAuth registration/sign-in. Email/password remains supported alongside both providers.
- Email verification, password reset, secure session handling, sign-out, profile management and account deletion.
- Keep `/privacy` available as an informational disclosure; do not require a Terms/Conditions checkbox or Terms consent receipt during registration. Email verification remains a separate account-security requirement.
- Better Auth with the MongoDB adapter is selected for the Labs authentication implementation. Production session-lifetime/concurrency policy remains an architecture decision.
- Enforce authorization on the server for every protected read and mutation.
- Validate post-authentication return destinations against allowed local paths; prevent open redirects.
- Keep login intent separate from account-creation intent: OAuth login must not silently create accounts; OAuth registration is explicitly initiated from the signup route.
- Link an OAuth identity to an existing account only when the provider returns the same verified email; do not bypass verification or merge by display name.
- Restore intended navigation/action where safe, but do not automatically repeat unsafe or unintended operations.

### FR-05 Likes and user dashboard
- Guest likes may be recorded through browser storage/appropriate safeguards; they are not guaranteed unique people or cross-device. Signed-in verified accounts receive persistent likes with one active like per user/experiment.
- Verified-account likes persist across sessions/devices and enforce one active like per user/experiment server-side.
- Track verified-account source opens and code-copy actions. Track verified likes/unlikes and guest like actions separately where measurable; never treat a guest action count as unique people. Guests/unverified users cannot view or copy source.
- User dashboard includes account summary/settings, liked experiments, recently viewed experiments, recently accessed components and personal activity.
- Personal activity is private to the appropriate user. Do not attach anonymous activity to an account without an explicit, disclosed mechanism.

### FR-06 Analytics
Track, at minimum:
- Experiment detail views.
- Likes and unlikes.
- Successful source-viewer opens (distinct from public experiment detail-page views).
- Copy-code actions.
- Preview starts and explicitly instrumented preview interactions.
- Per-experiment public detail-page views, successful source opens, unique verified accounts opening source, successful code-copy actions, current active likes, like/unlike actions, copies-per-source-open, and daily/monthly trends. Owner/Admin analytics are aggregates, not user-level browsing histories.
- Deduplication, bot/abuse safeguards and documented metric definitions.
- A code-copy action is recorded only after the supported client reports a successful Clipboard API write; it is not proof that code was pasted, executed or shipped.

### FR-07 Publishing and scheduling
- Content states: Draft, Published, Unpublished.
- Preview before publishing; explicit publish/unpublish confirmation; unsaved-change protection; destructive-action confirmation; clear success/error feedback.
- Validation failures preserve entered data; prevent duplicate submissions where appropriate.
- Scheduled publication targets a specific immutable content version.
- Admin can review, edit by creating a new version, or cancel a schedule before execution.
- Store timestamps consistently and display them in a configured timezone.
- Scheduling runs independently of an open browser tab, retries automatically according to a bounded/recoverable policy, exposes failure status, supports manual recovery, and revalidates cache after successful publication.
- Scheduler/provider and exact retry policy are open architecture decisions; Vercel runtime constraints must be validated before implementation.
- Notifications are not in scope for this baseline.

### FR-08 Immutable content history
- Retain recorded content versions indefinitely.
- A version is an immutable snapshot of content and relevant references/metadata.
- Support version comparison and restore by creating a new version from an older snapshot.
- Record actor and timestamp for version operations.
- Draft edits do not overwrite the published version.
- Keep draft and published pointers separate from immutable version records.
- Version history applies to content changes, not every analytics event.
- Media required for historical restoration must remain available; deletion must respect historical references.

### FR-09 Media library
- Cloudinary-backed multi-file uploads.
- Browse, search and filter assets; display dimensions, format, size and metadata.
- Reuse media across projects and Lab experiments.
- Track asset usage/references.
- Replace assets without silently breaking references.
- Warn/block deletion when an asset is referenced; removing an item from a gallery must not automatically delete the Cloudinary asset.
- Support ordered detail galleries and one selected gallery-preview asset per experiment, with captions/alt text and supported image/GIF/video media.
- Support a separate runtime-fallback asset shown only after code runtime failure/unsupported state.
- Generated code-output posters are immutable optimized static image assets bound to the exact published source/artifact version; they are not source files or executable previews.
- Use server-authorized signed upload flows; secrets remain server-side; validate MIME/type, size and ownership. Preserve asset references from drafts and historical releases.

### FR-10 Admin experience
- Responsive dedicated admin area with shared navigation and reusable form/table/panel patterns.
- Proposed routes: `/admin`, `/admin/lab`, `/admin/lab/new`, `/admin/projects`, `/admin/projects/new`, `/admin/experience`, `/admin/portfolio`, `/admin/analytics`, `/admin/settings`. Refine after inspecting the current repository.
- Provide route-level skeleton/loading states for Labs listing, experiment detail, owner source inventory and owner source editor. Preserve layout/aspect ratios, avoid CLS and do not stack duplicate full-screen loaders over the existing global PageLoader behavior.
- Provide action-specific pending/success/error/rollback feedback for add, delete, copy, like/unlike, save, restore, publish and unpublish.
- Use React 19 `useOptimistic` only for reversible server-backed mutations; roll back on server rejection. Local unsaved editor operations remain working-copy state, not optimistic claims of persisted save.
- Clipboard feedback and copy analytics occur only after successful Clipboard API acknowledgement. Publish/unpublish/delete success appears only after server confirmation.
- Lazy-load heavy editors and preview code. Do not add compiler/editor dependencies or experiment runtime to the public listing bundle.
- Admin and editor bundles must not enter the critical public-home-page bundle.


### FR-12 Labs source engagement analytics
- Record a successful source open only when a verified account successfully receives the published source from the protected source endpoint. A public experiment detail-page view is a separate event.
- Record code-copy actions only after the client confirms a successful Clipboard API write and the server validates the current verified session and published source version.
- Record likes/unlikes only when the server confirms an actual state transition. Enforce one current like per verified user and experiment.
- The owner/admin dashboard must show each experiment's source-open count, unique verified accounts opening source, code-copy count, current active verified-account likes, verified like/unlike actions, and guest like actions separately where measurable, with trends over a selected period.
- Provide aggregate rankings by source opens, copies and active verified-account likes, plus daily/monthly trends and a transparent copies-per-source-open formula.
- Admin analytics must not expose individual users' source browsing/copy/like history or email addresses in the first release. Use aggregate reporting and server-derived actor IDs for abuse control/deduplication.
- Analytics events must be idempotent, rate-limited, server-validated and privacy-minimized. Never store clipboard contents, full source payloads, passwords, verification tokens or raw email in analytics events.
- Define and disclose analytics retention, account deletion treatment and event deduplication before production analytics is enabled.

## 7. Technology baseline and open decisions
### Selected baseline
- Next.js App Router.
- JavaScript (no unapproved language substitution).
- Tailwind CSS v4.
- Motion (`motion/react`).
- MongoDB for application data.
- Cloudinary for media.
- Vercel for the Next.js application/deployment.

### Open decisions requiring repository/architecture validation
- Final Better Auth session-lifetime/concurrency policy and recovery behavior.
- Owner identity bootstrap (`LABS_OWNER_USER_ID` singleton or a separately approved persisted role model).
- MongoDB hosting, connection lifecycle, source-version migration and data/index migration approach.
- Source editor dependency/interaction model and exact file/language/byte limits.
- Scheduler mechanism, bounded retry policy and operational recovery.
- Isolated interactive-preview runtime/provider and threat model; stored source management does not authorize source execution.
- Cache tags/revalidation strategy.
- Final schemas, event payloads, retention for analytics and user activity.
- Gallery structure and supported video limits.
- These are not permission to invent decisions silently. Document options and trade-offs when the relevant implementation phase is reached.

## 8. Non-functional requirements
### Regression safety
- No unintended changes to existing public home page, project detail pages, education section, route contracts, responsive layouts, motion, interactions, SEO metadata or accessibility.
- Baseline screenshots and route/behavior inventory are required before implementation.
- Each phase must run focused tests and a public-route regression suite.

### Performance
- Admin, analytics visualizations, code editor, source viewer and interactive preview runtime are split/lazy-loaded.
- Keep public homepage critical path free from admin-only dependencies and experiment source.
- Use optimized responsive media and appropriate cache/revalidation.
- Measure before/after performance; no performance claim without recorded evidence.

### Security and privacy
- Server-side authorization for every protected operation.
- No draft leakage in page output, metadata, static generation, API responses, search indexes or CDN cache.
- No arbitrary untrusted JS execution in the main app.
- Validate links, slugs, uploads, dependency configuration and redirect targets.
- Rate-limit/abuse-protect sensitive endpoints and event ingestion.
- Keep secrets out of client bundles/logs.
- Minimize personal data and define retention before shipping analytics/account activity.

### Accessibility and responsive design
- Keyboard-operable admin workflows, visible focus, semantic labels, useful validation errors and accessible status announcements.
- Charts must have text summaries/tables or equivalent accessible data.
- Public pages remain usable across existing supported viewport sizes and reduced-motion preferences.
- Preserve the current design language; admin styling should be coherent but must not force a redesign of the public site.

## 9. Acceptance criteria
The platform is acceptable only when:
1. Approved CMS-managed content can be drafted, previewed, published and unpublished without modifying code.
2. Education remains code-controlled and current public layouts remain code-controlled.
3. Published project slugs render through the established detail template; existing project URLs still work.
4. Guests cannot retrieve full source, interactive-preview access or draft content by direct URL/API manipulation.
5. Registered users can authenticate, manage their account and use the specified dashboard.
6. Admin authorization is server-enforced and cannot be self-assigned through registration or client state.
7. Lab search/filter/sort/pagination and permitted previews work with accessible loading/empty/error states; gallery cards remain static-only and public detail pages render the actual published isolated runtime.
8. Owner Run executes the current unsaved working copy in the isolated preview for supported static HTML/CSS/JS and React JSX/TSX modes; failures preserve the working copy and prior published release.
9. Gallery cards use an explicit published media preview, otherwise a version-matched generated code-output poster, otherwise artwork; no experiment runtime executes in the gallery.
10. Poster generation is bound to the exact published source/artifact version and safely falls back without breaking an otherwise valid release.
11. The detail runtime displays skeleton/ready/error/retry/fallback states and never leaves an unexplained blank white canvas.
12. Verified source access is direct when a verified session is already known; guest source CTA shows Sign in and Create account; server-side verified-session authorization remains mandatory.
13. Optimistic reversible actions roll back on rejection; destructive/publishing operations never report success before server confirmation; copy analytics follows successful clipboard acknowledgement.
8. Analytics metrics match written definitions and separate guest/authenticated activity where possible.
9. Version restore creates a new version; old snapshots remain immutable; schedules target exact versions.
10. Media replacement/deletion checks all required references, including version-history references.
11. Scheduled publication works without an open browser tab, has bounded automatic retries/recovery, and revalidates cache after success.
12. Automated and manual regression checks show no unintended public UI, route, SEO, accessibility, behavior or performance regressions.
13. Security review covers authorization, draft isolation, preview sandbox, upload handling, redirects and analytics abuse controls.
14. Every shipped requirement has evidence linked from the implementation checklist.

## 10. Risks
- Untrusted code execution is a critical security boundary; iframe alone is not proof of sufficient isolation.
- Serverless scheduling may require a separate durable scheduler/worker approach.
- Analytics can be misleading without event deduplication, bot filtering and clear definitions.
- Immutable versions can retain media references indefinitely and increase storage costs.
- CMS data and cache invalidation can temporarily diverge if publication is not transactional/recoverable.
- Existing repository conventions or routes may differ from the proposed structure; inspect before committing to file-level architecture.

## 11. Definition of product readiness
Requirements are not complete merely because UI exists. Each capability must pass functional, permission, failure-state, responsive, accessibility, performance and regression checks; documentation must describe any limitations and unselected infrastructure decisions. No claim of complete production readiness until those checks have evidence.


## 12. Detailed stack decisions and responsibility boundaries
### Approved frontend stack
- Next.js App Router and React for routing, server-rendered public content and UI composition.
- JavaScript (ES modules); do not migrate to TypeScript without explicit approval.
- Tailwind CSS v4 for styling, reusing existing tokens/utilities and avoiding unnecessary custom CSS.
- Motion from motion/react for approved animation behavior.
- TanStack Query (React Query) for client-side server state where client interactions benefit from query caching, background refetch, mutation state or cache invalidation.
- React Query is not the source of authorization, not a replacement for database access boundaries, and not automatically required for every server-rendered page. Prefer server-side data loading for content that can be rendered safely on the server; introduce client queries only where there is a concrete interaction need.

### Backend approach decision
- **Initial decision: Next.js-native backend.** Keep business logic, authorization, data access and validation in server-only modules; expose HTTP Route Handlers for API consumers/webhooks and use Server Actions for appropriate same-app form mutations.
- Do not create a separate Express application in the initial architecture merely for convention or familiarity. A second server would add deployment, authentication, CORS, observability and operational boundaries.
- **Express status: OPEN / conditional.** Reconsider only if a documented requirement cannot be handled safely or reliably in the Vercel-hosted Next.js runtime, or a separately deployed service is justified (for example, a long-running isolated preview worker). Any such service requires a written decision record and explicit approval before implementation.
- No frontend component may access MongoDB directly. No client bundle may import server-only repositories, credentials or privileged modules.
- Never place authorization solely in middleware or UI visibility. Verify permissions at the protected data/action boundary as well.

### Selected infrastructure
- MongoDB: application persistence.
- Cloudinary: media storage/delivery.
- Vercel: existing Next.js application deployment.
- Better Auth with the MongoDB adapter is selected for Labs authentication; the final session-lifetime/concurrency policy remains open. MongoDB host controls, scheduler and isolated preview runtime still require validation/decisions.

### FR-11 Owner-managed protected source lifecycle
- The manually provisioned singleton portfolio owner is the sole privileged administrator for the first source-management release and can create and maintain private source snapshots for existing Labs experiments through a protected owner-only workspace and inspect aggregate source-engagement analytics.
- Owner identity is derived exclusively from the locked server-only `LABS_OWNER_USER_ID` environment variable, matching the stable Better Auth user ID of the verified owner account; it is never supplied by the browser or created by public registration.
- Source editing is text-only. Saved code is not executed by the source-management workflow or in the main portfolio application runtime.
- Saving creates an immutable draft snapshot. Publishing explicitly selects one saved version; saving never publishes implicitly. Unpublishing prevents new user source reads without silently deleting grants or historical versions.
- Restore creates a new version from an immutable historical snapshot.
- All verified registered users automatically receive source access to each published experiment. The owner does not issue per-user grants; publishing/unpublishing controls source availability for all verified accounts.
- Every privileged source mutation is server-authorized, validated, concurrency-safe and auditable.
- Regular registered users require only a valid Better Auth session with `emailVerified === true` and a published source snapshot for the requested experiment. Owner management authority is separately checked for drafts and unpublished versions.
- Source, draft, version and analytics data remain private/no-store. Untrusted execution requires a separate approved isolated-preview architecture and threat-model gate.
- Database bootstrap/migration must be idempotent and preserve existing records; source collections must not depend on manual empty-collection creation in Atlas.
