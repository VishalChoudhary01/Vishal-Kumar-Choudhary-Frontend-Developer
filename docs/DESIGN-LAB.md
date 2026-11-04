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
Support both repository-managed registered components and owner-created experiments. Owner-created React/JSX projects must compile with the fixed React/ReactDOM, Tailwind CSS v4 and Motion (motion/react) toolchain; standalone HTML/CSS/JavaScript remains supported.
- The compiler uses a pinned dependency allowlist, local project imports and a deterministic build manifest. No arbitrary package installation, remote script/CDN imports or server-side code.
- Tailwind v4 utilities are compiled at build time; no Tailwind CDN/browser-time compiler is used.
- Motion executes inside the isolated browser runtime, respects reduced motion and has no access to the portfolio's MotionProvider or Lenis state.
- Never execute untrusted source in the main portfolio React tree, Next.js server or same privileged application context.
- An iframe by itself is not proof of adequate isolation. Use a dedicated runtime origin, strict sandbox permissions, CSP, cookie/storage separation, validated messaging, network denial by default and resource/time limits.
- Do not expose application cookies, privileged API endpoints, admin credentials, private source or user-session secrets to the preview runtime.
- Do not permit arbitrary package installation or unrestricted network fetches.
- Authenticate and authorize preview creation on the server; validate the exact source hash and asset manifest before publication.
- Include queued/building, ready, build-error, runtime-error, timeout, stopped and unsupported states.
- The final build provider, artifact store and hosting boundary remain open until architecture/security validation.

## 5. Source access and code-copy behavior
- Guests see an access prompt only. Do not expose source snippets to guests until a separate content policy, exact scope and UX are explicitly approved.
- Full source is fetched through a server-authorized endpoint for any user with a valid Better Auth session and `emailVerified === true`, provided the requested source version is published. No per-user grant or owner approval is required.
- Do not embed the full source in guest HTML, static props, RSC payloads, hidden DOM, client bundles or public API responses.
- Copy control is available only when the verified source viewer is authorized; code-copy actions are reported after successful Clipboard API writes.
- Provide feedback for copy success/failure and a selectable fallback if clipboard permission is unavailable.
- Instrument a copy action only when the supported client flow reports the action; do not imply that code was pasted or used.
- Handle expired sessions and permission changes without leaking the source in errors or cached responses.
- Cache policy must not let an authorized response be reused for guests.

## 6. Likes
- Guest likes may use the existing best-effort browser-storage mechanism where available and are not guaranteed unique/cross-device. Verified accounts receive persistent likes with one active like per user/experiment.
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
- Metadata and slug validation for owner-created experiments.
- HTML/CSS/JavaScript and React/JSX project editing with the documented starter template.
- Live preview of the actual code, not only a static thumbnail.
- Tailwind v4 build validation and Motion runtime support through the fixed package allowlist.
- Media upload for images, animated GIFs and videos.
- Media selection for the card cover, detail gallery and in-experiment asset manifest.
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
- Use static media as the default lightweight listing-card cover. On the experiment detail page, render the actual published interactive runtime as the primary experience; static media is supporting gallery content and never a substitute for the runnable experiment.
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
- [ ] Guests and signed-in-unverified users cannot view/copy source or use source engagement controls; verified users receive published source automatically.
- [ ] Source opens, copies and like/unlike actions are counted once under the approved idempotency rules and appear as experiment-level aggregates in owner/admin analytics.
- [ ] Preview/source failure states are clear and do not leak sensitive details.
- [ ] Lab-only dependencies do not affect the critical public homepage bundle.
- [ ] Existing public portfolio and project detail pages pass regression checks.

## 13. Owner-managed source workspace

The detailed source-management product and lifecycle contract is owned by `LABS-SOURCE-MANAGEMENT-SPEC.md`. This section adds the design-level expectations without authorizing general CMS/Admin implementation.

- The owner workspace is a protected management surface and is distinct from the compact public experiment source-access section.
- The first release is for one trusted, manually provisioned owner; do not design a multi-admin permission matrix unless separately approved.
- Workspace layout should prioritize experiment identity, file tree, editable code area, validation feedback, unsaved state, save-draft action, version history, and explicit publish/unpublish controls.
- Source files remain text snapshots; media binaries are managed as separate Cloudinary assets. The owner can run a controlled browser build/preview only through the isolated runtime boundary in the Runtime and Media Plan. The workspace is not a terminal, general shell or arbitrary package manager.
- File add/rename/delete operations are explicit; deleting a file requires confirmation. Invalid paths, duplicate names, unsupported file types and size failures preserve the current editor input and explain the correction.
- Save draft and Publish source are separate actions. Publishing requires confirmation of the exact saved version; a save must never publish implicitly.
- Version history is owner-only, read-only for past snapshots, and supports restore by creating a new draft. It must not edit historical snapshots in place.
- Per-user source grant management is not part of the target design. The owner publishes/unpublishes source for all verified accounts. The owner/admin analytics view shows aggregate source opens, unique verified accounts, copies, active likes and like/unlike trends per experiment.
- Show distinct empty, loading, validation, stale-version/conflict, save-success, publish-success, publish-failure, unavailable database and unauthorized states.
- The editor and syntax-highlighting code are lazy-loaded only inside the owner route. They must not load on `/`, `/labs` or ordinary experiment pages.
- Reuse the existing portfolio tokens, typography, focus/keyboard conventions, restrained radius and responsive rules. Do not introduce a new UI system.
- Owner-created experiments publish a full interactive runtime on their detail page. A card cover is a separate optional media asset; it must never be treated as the complete experiment.
- The public detail page may show an optional image/GIF/video gallery in addition to the actual interactive runtime.
- Owner source management does not weaken the compact public source-access gate or change the four existing code-owned demo runtimes.


### 13.4 Media library and public media presentation

- The owner can upload still images, animated GIFs and video clips to the Labs media library.
- An uploaded asset can be selected as a card cover, a detail-page gallery item or an in-experiment asset.
- Each gallery asset supports accessible alt text, optional caption, ordering and (for video) a poster image.
- Card covers use lightweight responsive media; video uses a poster by default. Autoplay is opt-in, muted and subject to reduced-motion preferences.
- Detail pages show the actual interactive experiment first/primary, with the media gallery as supporting content.
- Media remains separate from source code and compiler artifacts. Do not serialize draft media references or unpublished media URLs into public payloads.
- The exact upload limits and Cloudinary delivery mode are defined by the Runtime and Media Plan after checking the actual account plan.

### 13.3 Source access, likes and analytics policy

- A source-open is counted only after the verified-user source endpoint successfully returns the published source. A public experiment detail-page view is a separate metric.
- A code-copy action is counted only after the client confirms a successful Clipboard API write and the server accepts the idempotent event. Never transmit clipboard text to analytics.
- Like/unlike is available only to verified accounts and increments action metrics only when the server confirms a state transition. A unique per-user/experiment like-state record enforces one active like.
- The owner/admin dashboard is per experiment and aggregate-only: source opens, unique verified accounts opening source, copy actions, active likes, like/unlike action counts, daily/monthly trends and source-open/copy rankings.
- Do not show individual user names, emails or per-user source browsing/copy history in the first release.
- Analytics retention, event deduplication and account deletion behavior must be approved and disclosed before events are enabled in Production.

### 13.1 Owner workspace design items still open

- Exact route/navigation placement within a future protected admin shell.
- Editor package and syntax-highlighting language support; Monaco is not installed in the inspected package manifest.
- Whether the first editor provides a lightweight textarea/code editor or a new editor dependency after bundle/accessibility review.
- Exact desktop file-tree/editor split and mobile file-navigation treatment.
- Diff presentation and whether version comparison is side-by-side or unified.
- Whether source import from repository files is supported in the first release or source is authored through the owner workspace.

Do not invent these items as locked decisions. The source-management specification defines security/data contracts; final visual composition must be reviewed as a separate design slice before implementation.

### 13.2 Owner entry point and public demo separation

- Provide a discoverable owner-only entry into the source workspace, such as a server-authorized owner account-menu item and/or a `Manage source` action in the experiment source section.
- Only server-derived owner capability may reveal that navigation item. Directly opening an owner URL must still run the owner guard.
- Editing a protected Atlas snapshot does not update the public demo runtime. Existing public demos remain code-owned and are changed through the canonical repository and normal deployment workflow.
- Do not imply that Save/Publish source executes code or updates the live demo. Any live preview of stored source is a separate isolated-preview design and security gate.
