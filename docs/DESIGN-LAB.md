# Design Specification — Component Lab

**Status:** Product/design requirements; implementation pending  
**Related:** [PRD](./PRD.md), [Admin design](./DESIGN-ADMIN.md), [Analytics design](./DESIGN-ANALYTICS.md)

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
- Preview image or safe static thumbnail.
- Title and concise description.
- Technology/tag metadata.
- Relevant engagement counts with clear meaning.
- Optional publication date if approved.
- Link to a stable experiment detail URL.
- Do not place full source or privileged configuration in card props or static payloads.

### Loading, empty and error states
- Skeleton/loading state that does not cause major layout shifts.
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

Maintain stable descriptive URLs, e.g. `/lab/animated-gradient-card`. Slugs must be unique, validated and safe. Published pages have appropriate metadata/canonical behavior; draft/private previews must not be indexed.

## 4. Preview model
### Static media previews
- Images, GIFs and supported video are rendered as media, not executable content.
- Use responsive media sizing, appropriate loading priority and accessible alternative text/captions where applicable.
- Validate media references and avoid layout shift.
- Respect supported format/size limits once selected in architecture.

### Interactive previews
Support both repository-managed registered components and admin-managed source, but execute them only inside an explicitly approved isolation boundary.
- Never execute untrusted source in the main portfolio React tree or same privileged application context.
- An iframe by itself is not proof of adequate isolation.
- Threat model origin separation, sandbox permissions, messaging protocol, resource/time limits, dependency allowlist, network access, CSP and failure recovery.
- Do not expose application cookies, privileged API endpoints, admin credentials, private source or user-session secrets to the preview runtime.
- Do not permit arbitrary package installation or unrestricted network fetches.
- Authenticate and authorize restricted preview launch on the server.
- Validate preview configuration before publication.
- Include starting, ready, runtime-error, timeout, stopped and unsupported states.
- The exact execution provider and hosting boundary remain open until architecture/security validation.

## 5. Source access and code-copy behavior
- Guests see only explicitly approved partial snippets or an access prompt.
- Full source is fetched through a server-authorized endpoint only for eligible authenticated users.
- Do not embed the full source in guest HTML, static props, RSC payloads, hidden DOM, client bundles or public API responses.
- Copy control is available only when full source access is authorized.
- Provide feedback for copy success/failure and a selectable fallback if clipboard permission is unavailable.
- Instrument a copy action only when the supported client flow reports the action; do not imply that code was pasted or used.
- Handle expired sessions and permission changes without leaking the source in errors or cached responses.
- Cache policy must not let an authorized response be reused for guests.

## 6. Likes
- Guest likes may use browser storage/appropriate safeguards; they are not guaranteed unique, permanent or cross-device.
- Authenticated likes are persisted server-side and enforce one active like per user/experiment.
- Like/unlike state must be clear and accessible.
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
- Metadata and slug validation.
- Source/configuration editing.
- Preview type selection and validation.
- Static media and gallery selection.
- Dependency allowlist validation for interactive execution.
- Partial-source configuration.
- Version history and restore.
- Publication status and scheduled-job state.

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
- Use static media as the default lightweight preview where possible.
- Optimize responsive images and reserve aspect ratio to reduce layout shift.
- Published Lab pages have deliberate metadata and canonical behavior.
- Draft/preview pages are private, non-indexable and excluded from public sitemap/search.
- Do not claim SEO/performance improvement without measured before/after evidence.

## 12. Lab acceptance checklist
- [ ] Search/filter/sort/pagination behave predictably and are server-validated.
- [ ] Only published entries appear in public discovery and SEO surfaces.
- [ ] Guest pages expose no full source through hidden or serialized payloads.
- [ ] Full source and restricted interactive previews require server-side authorization.
- [ ] Untrusted source never executes in the main application context.
- [ ] Isolation boundary and threat model are reviewed before interactive execution ships.
- [ ] Static previews are responsive, accessible and optimized.
- [ ] Like state and analytics reflect the actual guest/authenticated limitations.
- [ ] Preview/source failure states are clear and do not leak sensitive details.
- [ ] Lab-only dependencies do not affect the critical public homepage bundle.
- [ ] Existing public portfolio and project detail pages pass regression checks.
