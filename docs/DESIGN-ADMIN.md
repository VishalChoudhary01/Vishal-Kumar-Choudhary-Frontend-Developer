# Design Specification — Admin Dashboard and CMS

**Status:** Design requirements; visual implementation pending  
**Related:** [PRD](./PRD.md), [Implementation plan](./IMPLEMENTATION-PLAN.md)

## 1. Purpose and design constraints
Provide a private, responsive workspace to manage portfolio content, Lab experiments, media, publishing, versions and analytics. The admin may have a purpose-built information-dense interface, but it must respect the existing product's design discipline. Do not redesign the public home page or project detail pages to accommodate admin needs.

## 2. Information architecture
Proposed routes; verify against existing route conventions before implementation:
- `/admin` — overview and actionable status.
- `/admin/portfolio` — hero, about, skills and other portfolio content.
- `/admin/experience` — experience entries.
- `/admin/projects` and `/admin/projects/new` — project list and create/edit flows.
- `/admin/lab` and `/admin/lab/new` — experiment management.
- `/admin/analytics` — engagement analytics.
- `/admin/settings` — admin/account and platform settings.
- Media Library may be a dedicated route or a shared panel; decide after repository inspection.

The shell should include a persistent navigation pattern appropriate to viewport size, current section label, account/session actions, and clear active navigation. On narrow viewports, navigation must not consume the entire work area.

## 3. Overview page
Show actionable information rather than decorative charts:
- Content requiring attention: drafts, failed scheduled publication, recently edited items.
- Published project and Lab counts.
- Recent publishing/version activity.
- High-level Lab engagement summary with date window and link to full analytics.
- Operational warnings only when backed by actual status data.
- Every card/metric links to a relevant filtered view where practical.
- Empty state explains the first useful action; loading and error states are explicit.

Do not fabricate metrics, statuses, or success states when data is unavailable.

## 4. Content list patterns
Project, experience and Lab lists should provide:
- Search where useful, status filters, sort, pagination.
- Clear title, stable slug/identifier, publication status, updated timestamp and relevant ownership/metadata.
- Distinct draft and published indicators where both versions exist.
- Actions for edit, preview, publish/unpublish, version history and delete/archive where supported.
- Destructive operations require confirmation and reference-integrity checks.
- Preserve list filters/return destination when navigating to edit and back where feasible.

Use semantic tables on wide screens when they remain usable; use a structured stacked/card presentation on narrow screens rather than a clipped desktop table.

## 5. Editor layout
An editor should group fields by user task, not by database schema:
1. Basic content: title, slug, summary/description.
2. Main content fields appropriate to the content type.
3. Links and metadata.
4. Media/gallery selection and ordering.
5. Discovery metadata: tags, technologies, category, featured state where relevant.
6. Preview and publication controls.
7. Version history and audit details.

Requirements:
- Labels, help text and field-level validation are explicit.
- Required fields are marked accessibly.
- Slugs are validated and collisions reported before publish.
- URLs use allowed protocols and are validated.
- Media fields use the shared library; no need to re-upload an asset just to reuse it.
- Validation failure must preserve entered values.
- Prevent duplicate submissions while a mutation is pending.
- Saving draft and publishing are separate actions.
- A published version remains live while a new draft is edited.
- Warn before leaving with unsaved changes, including browser navigation where supported.
- Show timestamps in configured timezone and clarify scheduled time zone.

## 6. Publishing workflow
States: Draft, Published, Unpublished. A scheduled job references one immutable version.

Expected sequence:
1. Admin edits a draft.
2. Admin saves; draft version is stored, live published pointer is unchanged.
3. Admin previews the exact version being reviewed.
4. Admin explicitly publishes now or schedules that immutable version.
5. Confirmation names the action and any important consequences.
6. Success response shows new state and timestamp; failures are actionable and do not erase edits.
7. Unpublish removes public availability after successful state transition and cache revalidation.
8. Scheduled content exposes scheduled time, target version, current status, cancel/reschedule controls and failure/retry state.

Publishing must be idempotent. A stale scheduled version must not silently publish newer unsaved content. If a version changes, create a new version and update the schedule explicitly.

## 7. Preview and version history
- Preview renders the actual public template for the selected immutable version.
- Preview must not be indexed or publicly accessible without authorization.
- Preview must not accidentally overwrite the live page's cache.
- Support comparing versions and restoring older content by creating a new version.
- Display version author and timestamp where available.
- Media references required for old versions remain protected from deletion.
- Lab previews follow the separate isolation requirements in DESIGN-LAB.md.

## 8. Media Library experience
- Multi-file upload with per-file progress/result, validation and retryable errors.
- Search/filter assets; show thumbnail, filename/label, media type, dimensions, file size, format and usage.
- Asset detail shows references to projects, galleries, Lab experiments and historical versions where relevant.
- Gallery editor supports ordering, captions, alt text, supported media, and removal from the gallery without deleting the underlying asset.
- Replacement workflow explains whether it updates a single reference or multiple usages; require explicit confirmation for broad replacement.
- Block or require a safe remediation plan before deleting referenced assets.
- Cloudinary credentials/signatures are server-managed; never expose API secrets in client code.

## 9. Analytics entry points
- Show only a compact high-level summary on overview.
- Full analytics lives in a dedicated route and follows DESIGN-ANALYTICS.md.
- Provide date-range and segment context and link from a metric to its underlying content list when possible.

## 10. Interaction, responsive and accessibility requirements
- Keyboard operability for navigation, forms, dialogs, menus, sorting and gallery ordering.
- Visible focus, logical focus order, labelled controls, semantic headings, accessible validation and announced status messages.
- Confirmation dialogs preserve centered placement and adequate viewport insets while respecting any existing shared dialog specification.
- No interaction depends only on color.
- Avoid unnecessary pill-shaped controls and excessive radius; use restrained, consistent surfaces and spacing.
- Keep dense data readable at zoom and narrow widths; avoid horizontal overflow.
- Respect reduced-motion settings and avoid unnecessary animation in data-heavy workflows.
- Do not introduce custom CSS when existing Tailwind v4 utilities/design tokens cover the need.

## 11. Error and empty states
Every data-driven route must address:
- Initial loading and background refresh.
- Empty account/workspace.
- Empty search/filter result.
- Validation error.
- Permission denied/expired session.
- Network/server failure.
- Partial media upload.
- Publish/schedule failure and recovery.
- Stale edit/conflict.
- Referenced media deletion blocked.
- Unsaved navigation and destructive action.

Error copy should identify what failed and the next safe action. Do not show raw secrets, stack traces or internal database errors.

## 12. Performance and public-page isolation
- Admin route group and editor/preview modules should be dynamically loaded where appropriate.
- Avoid adding admin imports/providers/fonts/analytics/editor libraries to public homepage shared layout.
- Avoid a global provider that initializes admin-only services on public routes.
- Keep data fetching route-scoped and cache behavior explicit.
- Verify actual production bundles and route performance; do not assume code splitting from file organization alone.

## 13. Admin design acceptance checklist
- [ ] All admin routes are protected server-side.
- [ ] No normal registration path can grant Admin.
- [ ] Navigation and editor are responsive and keyboard accessible.
- [ ] Draft save cannot change published content.
- [ ] Preview matches the exact selected version and remains private.
- [ ] Publish/unpublish/schedule actions are confirmed, idempotent and recoverable.
- [ ] Failures preserve form state and provide next steps.
- [ ] Media usage/reference checks protect live and historical content.
- [ ] Heavy admin code is absent from the critical public-home bundle.
- [ ] Existing public home/project pages show no unintended visual or behavioral change.
