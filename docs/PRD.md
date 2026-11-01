# Product Requirements Document — Portfolio Platform

**Status:** Approved requirements baseline; implementation pending  
**Version:** 1.0  
**Scope:** Existing portfolio extension: CMS/admin, analytics, media library, user accounts, and Component Lab.

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
- View permitted static media previews and partial source snippets.
- Search, filter, sort, paginate/load more, and view published experiment metadata.
- Like experiments through an anonymous mechanism where available, subject to browser storage and abuse controls.
- Cannot access private drafts, full source, restricted interactive previews, user-only features, or admin pages.

### Registered user
- All guest capabilities.
- Access full experiment source and copy the full source through authenticated server-authorized flows.
- Access interactive previews only through the approved isolated preview mechanism.
- Like/unlike with a server-enforced one-active-like-per-user-per-experiment rule.
- Use a personal dashboard for liked experiments, recently viewed experiments, recently accessed components, account settings, and personal activity.
- Manage display name/profile image, view email, manage password where applicable, reset password, sign out, and delete account.
- Cannot grant themselves Admin privileges.

### Admin
- Access protected admin routes and operations after server-side role checks.
- Manage portfolio dynamic content, projects, experience, Lab experiments, media, publication workflow, schedules, versions, and analytics.
- Admin role is provisioned manually through trusted setup; public registration never grants it.

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
- Create and edit experiment metadata and source/configuration.
- Support static previews (image, GIF, video) and interactive previews for repository-managed components or admin-managed source in a controlled isolated environment.
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
- Email/password and Google sign-in.
- Email verification, password reset, secure session handling, sign-out, profile management and account deletion.
- Auth provider and session mechanism are open architecture decisions.
- Enforce authorization on the server for every protected read and mutation.
- Validate post-authentication return destinations against allowed local paths; prevent open redirects.
- Restore intended navigation/action where safe, but do not automatically repeat unsafe or unintended operations.

### FR-05 Likes and user dashboard
- Guest likes may be recorded through browser storage/appropriate safeguards and are not guaranteed unique-person counts or cross-device persistence.
- Authenticated likes persist across sessions/devices and enforce one active like per user/experiment server-side.
- Track guest and authenticated interactions separately where measurable.
- User dashboard includes account summary/settings, liked experiments, recently viewed experiments, recently accessed components and personal activity.
- Personal activity is private to the appropriate user. Do not attach anonymous activity to an account without an explicit, disclosed mechanism.

### FR-06 Analytics
Track, at minimum:
- Experiment detail views.
- Likes and unlikes.
- Full-source access.
- Copy-code actions.
- Preview starts and explicitly instrumented preview interactions.
- Per-experiment view/copy/like metrics, most-viewed/most-copied rankings, engagement rate such as copies per view, daily/monthly trends and guest-vs-authenticated segments where measurable.
- Deduplication, bot/abuse safeguards and documented metric definitions.
- A copy action is a copy attempt, not proof of downstream use.

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
- Support ordered galleries with captions/alt text and supported image/GIF/video media.
- Use server-authorized signed upload flows; secrets remain server-side; validate MIME/type, size and ownership.

### FR-10 Admin experience
- Responsive dedicated admin area with shared navigation and reusable form/table/panel patterns.
- Proposed routes: `/admin`, `/admin/lab`, `/admin/lab/new`, `/admin/projects`, `/admin/projects/new`, `/admin/experience`, `/admin/portfolio`, `/admin/analytics`, `/admin/settings`. Refine after inspecting the current repository.
- Support loading, empty, success, validation and error states.
- Lazy-load heavy editors and preview code.
- Admin and editor bundles must not enter the critical public-home-page bundle.

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
- Authentication provider and exact session implementation.
- MongoDB hosting, connection lifecycle and data/index migration approach.
- Scheduler mechanism, bounded retry policy and operational recovery.
- Isolated interactive-preview runtime/provider and threat model.
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
7. Lab search/filter/sort/pagination and permitted previews work with accessible loading/empty/error states.
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
