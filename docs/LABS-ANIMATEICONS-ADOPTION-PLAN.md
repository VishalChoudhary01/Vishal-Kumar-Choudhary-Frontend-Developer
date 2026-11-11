# Labs UI — AnimateIcons Adoption Plan

**Status:** Planning document only — no icon package or UI component has been changed  
**Reviewed:** 11 November 2026  
**Target areas:** Public Labs experience, Source Management, Labs Analytics  
**Recommended library:** `@animateicons/react` — Lucide icon set

---

## 1. Executive recommendation

Adopt AnimateIcons selectively as the animated replacement for existing Lucide-style icons in Labs. Do **not** animate every icon and do not redesign the existing pages around the library.

The current Labs interface already uses a restrained outline-icon language through `lucide-react`. AnimateIcons is a good fit because it supplies path-level animated SVG versions of familiar Lucide icons, uses Motion, supports hover and imperative triggers, and exposes size, color, duration and animation controls. This lets the UI gain feedback without changing the existing icon vocabulary or the overall visual hierarchy.

The visual target is:

- **Quiet by default.** Icons keep their existing size, alignment, color and layout.
- **Motion on intent.** Animate when the user hovers, focuses, clicks or completes a meaningful action—not continuously when the page loads.
- **One icon language.** Prefer the AnimateIcons **Lucide** collection. Do not mix in the heavier Huge collection unless a specific icon cannot be represented well in Lucide.
- **No behavioral changes.** Replacing an SVG must not change routes, permissions, source publishing, delete semantics, analytics, upload behavior or loading states.

The first implementation should be a focused migration of the owner navigation, Source Management controls and Labs Analytics indicators. Public experiment actions can follow as a separate pass.

## 2. What was reviewed

### AnimateIcons

Reviewed the public gallery, the React package README/package metadata and the repository's current icon manifests:

- Gallery: https://animateicons.in/
- React usage and Next.js guidance: https://animateicons.in/icons/docs/react
- Hover/ref examples: https://animateicons.in/icons/docs/examples/hover-helper
- npm package: https://www.npmjs.com/package/@animateicons/react
- Repository: https://github.com/Avijit07x/animateicons
- Package metadata: https://github.com/Avijit07x/animateicons/blob/main/npm/package.json
- Lucide catalog: https://github.com/Avijit07x/animateicons/blob/main/data/lucide-icons.json
- Huge catalog: https://github.com/Avijit07x/animateicons/blob/main/data/huge-icons.json
- License: https://github.com/Avijit07x/animateicons/blob/main/LICENSE
- Third-party notices: https://github.com/Avijit07x/animateicons/blob/main/THIRD_PARTY_NOTICES.md

At the reviewed repository revision, `@animateicons/react` is **0.13.0** and its catalog manifests contain **999 Lucide icons plus 501 Huge icons**. Some older cached gallery/search representations still report the earlier 542-icon catalog. Treat catalog totals as version-dependent; use the installed package's version and manifests as the implementation source of truth rather than hard-coding a count.

The package metadata declares MIT licensing and React 18/19 peer compatibility. It exposes per-icon subpath exports, marks the package side-effect-free, and documents the default hover animation plus an imperative `startAnimation()` / `stopAnimation()` API. Its icon props include `size`, `color`, `duration` and `isAnimated`. The package README says the animation implementation is built on Motion and that the package supplies its own motion implementation.

**Important Next.js detail:** the package README specifically recommends direct icon subpath imports in Next.js App Router rather than importing the full `/lucide` or `/huge` barrel. Use one direct import per needed icon, for example:

```js
import { FolderOpenIcon } from "@animateicons/react/lucide/folder-open-icon";
```

The path pattern is based on the icon slug with an `-icon` suffix. Confirm each exported path against the exact installed package before merging implementation code.

### Current Portfolio repository

The current application already includes:

| Existing dependency | Current project value |
|---|---|
| Next.js | `^16.4.3` |
| React / React DOM | `19.2.8` |
| Motion | `^13.2.0` |
| Lucide React | `^1.68.0` |
| AnimateIcons | Not installed |

The code is JavaScript and uses the Next.js App Router. The existing Motion and Lucide dependencies should remain in place; this plan does not propose replacing either one. The AnimateIcons React peer range in the reviewed package metadata includes React 19, which is compatible in principle with the current React major. The exact package installation still needs a clean lockfile/build check before visual implementation.

## 3. Scope and boundaries

### Included

1. **Labs owner navigation** — destination icons for Labs analytics, Source Library and snapshot storage.
2. **Source Management inventory** — workspace, status, search, edit, refresh and destructive-action icons.
3. **Source editor and media tools** — save, file, upload, preview and media-library actions.
4. **Snapshot storage** — storage, protection, age, refresh and delete indicators.
5. **Labs Analytics** — metric cards, refresh, restore and analytics-only removal controls.
6. **Public experiment detail actions** — like, source access, copy and restart actions where an icon already exists.

### Explicitly excluded

- Do not add decorative icons to the public Labs hero or experiment cards merely to demonstrate the library. Those areas currently rely on typography, previews and whitespace.
- Do not replace the icons or dependencies inside owner-authored experiment source files, starter snippets, runtime examples or Monaco editor content. Those are user-editable source assets, not Portfolio chrome.
- Do not alter Portfolio Analytics' visitor table, its API, privacy behavior or metric definitions. The shared Labs owner navigation may keep its separate Portfolio Analytics destination as-is.
- Do not animate every table row, every file row, every arrow/chevron, every status badge or every chart point.
- Do not replace working CSS loading spinners with a second animation system.
- Do not change the custom trend-chart drawing implementation in `LabsEngagementTrendChart.js`; it is not a flat icon.

## 4. Exact icon mapping

The slugs below were checked against the AnimateIcons Lucide catalog in the reviewed repository. Component names are the PascalCase names corresponding to those slugs.

### A. Labs owner navigation

| Current location | Current icon | AnimateIcons choice | Why | Trigger |
|---|---|---|---|---|
| Labs analytics destination in `LabsOwnerNavigation.js` | `FlaskConical` | `chart-spline` — `ChartSplineIcon` | Communicates engagement trends and experiment activity more clearly than a laboratory flask in an analytics destination. | Animate when the destination is hovered or keyboard-focused. |
| Source Library destination | `Code2` | `folder-open` — `FolderOpenIcon` | The destination is a managed library of source workspaces, versions and files. | Animate on destination hover/focus. |
| Snapshot storage destination | `Database` | `hard-drive` — `HardDriveIcon` | More directly communicates stored snapshots and storage capacity. | Animate on destination hover/focus. |
| Portfolio Analytics destination | `BarChart3` | **Keep current icon in this scope** | Portfolio Analytics is a separate product area and is intentionally outside this Labs icon migration. | No change. |
| Menu chevron | `ChevronDown` | **Keep static** | A continuously repeated navigation affordance gains little from path animation. | No change. |

### B. Source Management inventory

File: `src/app/components/labs/admin/LabSourceInventory.js`

| Current icon | AnimateIcons slug | Component | Where and why |
|---|---|---|---|
| `FileCode2` | `file-code` | `FileCodeIcon` | Source-present / code-workspace state. It is the clearest code-file metaphor. |
| `FolderPlus` | `folder-plus` | `FolderPlusIcon` | Create a source workspace or initialize a new experiment source. |
| `CheckCircle2` | `circle-check` | `CircleCheckIcon` | Published/ready state. Keep the current success color. |
| `AlertTriangle` | `triangle-alert` | `TriangleAlertIcon` | Warning or readiness problem. Keep the existing warning color and do not shake continuously. |
| `Clock3` | `clock` | `ClockIcon` | Last-updated / time-related metadata. |
| `Pencil` | `pencil` | `PencilIcon` | Edit metadata action. |
| `Search` | `search` | `SearchIcon` | Search field affordance. |
| `SearchX` | `search-x` | `SearchXIcon` | Empty/no-results state. |
| `RefreshCw` | `refresh-cw` | `RefreshCwIcon` | Refresh inventory action. |
| `Trash2` | `trash` | `TrashIcon` | Delete action. Animate only on hover/focus of the delete control; retain the confirmation step and warning treatment. |
| `ArrowUpRight` | — | **Keep static** | This is a repeated navigation affordance, not a feedback action. |
| `LoaderCircle` | — | **Keep existing CSS spinner** | Existing pending state already has a controlled spinner and reduced-motion fallback. Avoid competing loading animations. |

### C. Source editor and media library

Files: `LabSourceEditor.js`, `LabMediaLibrary.js`

| Current icon / action | AnimateIcons slug | Component | Where and why |
|---|---|---|---|
| `Save` | `save` | `SaveIcon` | Save current source snapshot. Prefer a brief action/confirmed-save response rather than an idle loop. |
| `FilePlus2` | `file-plus` | `FilePlusIcon` | Add a new file to the source snapshot. |
| `FileUp` | `file-up` | `FileUpIcon` | Import a file into the editor. |
| `Upload` / `UploadCloud` | `upload` | `UploadIcon` | Upload media or source assets. |
| `Eye` | `eye` | `EyeIcon` | Open/show preview. |
| `Image` | `image` | `ImageIcon` | Generated poster, gallery preview and media assets. |
| `Trash2` | `trash` | `TrashIcon` | Remove a file or media asset. Keep the icon static inside destructive confirmation dialogs. |
| `ArrowUp`, `ArrowDown`, `ArrowLeft`, `X` | — | **Keep static** | Small spatial controls are repeated frequently; movement animation would add visual noise. |
| `LoaderCircle` | — | **Keep existing CSS spinner** | Preserve the current pending/disabled behavior. |

### D. Runtime import panel

File: `LabRuntimeImportPanel.js`

| Current icon | AnimateIcons slug | Component | Why |
|---|---|---|---|
| `Download` | `download` | `DownloadIcon` | Import reviewed runtime source into Source Management. |
| `FolderPlus` | `folder-plus` | `FolderPlusIcon` | Add a private component workspace. |
| `LoaderCircle` | — | **Keep existing CSS spinner** | Do not introduce a second loading loop. |

### E. Snapshot storage

File: `LabSnapshotStoragePanel.js`

| Current icon | AnimateIcons slug | Component | Why |
|---|---|---|---|
| `Database` | `database` | `DatabaseIcon` | Storage summary and snapshot inventory context. |
| `HardDrive` | `hard-drive` | `HardDriveIcon` | Storage-size/reclaimable capacity metric. |
| `ShieldCheck` | `shield-check` | `ShieldCheckIcon` | Protected snapshot state. |
| `Clock3` | `clock` | `ClockIcon` | Snapshot age, last-used and expiry information. |
| `RefreshCw` | `refresh-cw` | `RefreshCwIcon` | Refresh the storage inventory. |
| `CheckCircle2` | `circle-check` | `CircleCheckIcon` | Retained/safe status. |
| `AlertTriangle` | `triangle-alert` | `TriangleAlertIcon` | Risk, warning and unavailable states. |
| `Trash2` | `trash` | `TrashIcon` | Delete an eligible snapshot; do not animate the confirmation dialog's warning icon. |
| `LoaderCircle` | — | **Keep existing CSS spinner** | Pending storage actions remain explicit and predictable. |

### F. Labs Analytics

File: `LabsLiveAnalyticsDashboard.js`

| Current icon / metric | AnimateIcons slug | Component | Why |
|---|---|---|---|
| Source opens — current `Eye` | `eye` | `EyeIcon` | Represents successful source views. |
| Verified accounts — current `Users` | `user-round-check` | `UserRoundCheckIcon` | Distinguishes verified users from anonymous activity better than a generic group icon. |
| Code copies — current `Copy` | `copy-check` | `CopyCheckIcon` | Reinforces that copies are counted only after clipboard success. |
| Active likes — current `Heart` | `heart` | `HeartIcon` | Familiar engagement metaphor. Use a short pulse only after the user action is accepted, not as ambient motion. |
| Trend chart / activity context | `chart-spline` | `ChartSplineIcon` | Appropriate for trend/engagement context if a compact section-level icon is required; do not add one if the heading already reads clearly. |
| Refresh action — current `RefreshCw` | `refresh-cw` | `RefreshCwIcon` | Communicates refreshing the dashboard; animation should follow the active refresh state. |
| Analytics-only removal — current `Trash2` | `trash` | `TrashIcon` | Animate gently on action hover/focus only. The existing typed-slug confirmation remains unchanged. |
| Restore — current `RotateCcw` | `rotate-ccw` | `RotateCcwIcon` | Reversible restoration action. |
| Close — current `X` | — | **Keep static** | A close affordance does not need motion. |

### G. Public experiment detail page

Files: `LabLikeButton.js`, `LabSourceAccess.js`, `LabCanvasActions.js`

| Current icon / action | AnimateIcons slug | Component | Where and why |
|---|---|---|---|
| Like — current `Heart` | `heart` | `HeartIcon` | Animate after a successful/accepted like transition. Preserve optimistic rollback if the server rejects the action. |
| Source section — current `Code2` | `code` | `CodeIcon` | Identifies the protected source section. |
| Copy source — current `Copy` / `Check` | `copy` / `copy-check` | `CopyIcon` / `CopyCheckIcon` | Switch to the success icon only after the Clipboard API succeeds. |
| Source access lock — current `LockKeyhole` | `lock-keyhole` | `LockKeyholeIcon` | Communicates protected source access. |
| Retry — current `RefreshCw` | `refresh-cw` | `RefreshCwIcon` | Animate while the user retries source loading, not continuously. |
| Source error — current `AlertTriangle` | `triangle-alert` | `TriangleAlertIcon` | Keep the existing warning/error color and accessible text. |
| Canvas restart — currently inline SVG | `refresh-cw` | `RefreshCwIcon` | Replace the hand-written restart SVG only; keep the restart button's label, action and disabled state. |
| `LoaderCircle`, `ArrowUpRight` | — | **Keep existing spinner and static arrow** | Avoid duplicate loading motion and repeated moving navigation cues. |

## 5. Motion and visual rules

### Interaction policy

1. **Default state:** icons are static at rest. Animate only when a user interacts with the parent control or when a real state transition has completed.
2. **Hover:** use the library's hover animation for desktop pointer interactions. For buttons/links whose clickable area is larger than the SVG, trigger the icon from the parent control using its imperative ref so the entire control responds consistently.
3. **Keyboard:** focus-visible must trigger the same feedback as hover, without requiring a pointer.
4. **Touch:** do not rely on hover. Important action feedback should occur on the action itself (for example, like accepted or copy succeeded).
5. **Loading:** keep the current explicit spinner and pending label. Never combine a spinning icon with a second path animation.
6. **Reduced motion:** read the existing `useReducedMotion` preference and set the icon to a static state when reduction is requested. Do not add continuous or infinite icon loops.
7. **Destructive actions:** only a restrained hover/focus response is acceptable on the row action. Keep icons static inside delete confirmation dialogs; deletion must never look playful or celebratory.

### Size and duration

| Context | Target size | Starting duration |
|---|---:|---:|
| Compact table/row action | 13–15 px | 0.55–0.75 s |
| Toolbar/button icon | 14–16 px | 0.60–0.80 s |
| Metric card / section indicator | 17–19 px | 0.70–0.90 s |
| Empty state / prominent callout | 20–22 px | 0.75–0.95 s |

These are implementation starting points, not fixed library defaults. The AnimateIcons gallery defaults to a duration of 1; lower values are faster. Tune the final motion by inspecting each icon's actual path animation.

### Color and stroke

- Prefer `color="currentColor"` and keep the existing semantic Tailwind text class. This preserves light/dark theme behavior and status meaning.
- Keep neutral icons in the current tertiary/secondary foreground. Use the existing brand token for selected/active Labs navigation, and existing success/warning/error tokens for states.
- Do not hard-code a new teal palette into every icon. Motion is the enhancement; the existing color system remains the source of truth.
- Do not increase icon size simply because the animation draws attention. Preserve current line height, button dimensions and alignment.

## 6. Integration approach

### Dependency

At implementation time:

1. Confirm the current published package version and React peer requirements.
2. Add `@animateicons/react` as an exact dependency (the reviewed package is `0.13.0`); do not update React, Next.js, Motion or Lucide as part of this change.
3. Update the repository lockfile with the project's existing package manager.
4. Confirm that the exact icon subpaths in the mapping resolve from the installed package.
5. Use direct imports such as `@animateicons/react/lucide/chart-spline-icon`. Avoid broad icon barrels in Next.js App Router because the package documents that barrel imports create a client boundary and can prevent the per-icon tree-shaking behavior available through direct subpaths.

### Component strategy

- Keep icons imported locally by feature component; do not create a global map that imports the entire catalog.
- Use a small Labs-only adapter only if it meaningfully centralizes the current reduced-motion preference and shared defaults. Do not hide imperative refs behind a wrapper if a particular action needs programmatic start/stop control.
- Keep the present component props and action callbacks. Replace only the icon component at the render location.
- Keep the existing `lucide-react` package for icons outside this scope and for any icons without a verified AnimateIcons equivalent.
- Do not use AnimateIcons inside the editable source text in `LabSourceEditor.js`, source templates, compiler code, preview runtime, or stored experiment snapshots.

## 7. Recommended rollout

| Phase | Scope | Reason | Exit criteria |
|---|---|---|---|
| 0 — Package smoke test | Pin package, verify exact exports, test Next client-component imports and lockfile | Proves compatibility before touching the interface | Clean install, targeted import test and production build pass. |
| 1 — Navigation + inventory | `LabsOwnerNavigation.js`, `LabSourceInventory.js` | High visibility, small surface area, establishes the common style | Correct current/hover/focus/reduced-motion behavior in light and dark themes. |
| 2 — Analytics | `LabsLiveAnalyticsDashboard.js` and a small trend-context icon only if useful | Metrics benefit from semantic recognition; the user should notice feedback, not constant movement | Metric meaning and values remain unchanged; no looping icon motion during polling. |
| 3 — Source tools | `LabSourceEditor.js`, `LabRuntimeImportPanel.js`, `LabMediaLibrary.js`, `LabSnapshotStoragePanel.js` | Several action types share the same icon language | Save/upload/import/delete flows still behave exactly as before; pending states remain clear. |
| 4 — Public detail | `LabLikeButton.js`, `LabSourceAccess.js`, `LabCanvasActions.js` | Adds feedback at the point of user engagement | Like rollback, clipboard success, source authorization and restart behavior are unchanged. |
| 5 — Visual QA | Desktop/tablet/mobile, light/dark, keyboard, touch and reduced motion | Catches density, contrast and motion issues across contexts | No layout shift, no motion on initial render, no console errors, acceptable bundle change. |

## 8. Regression and acceptance checklist

### Functional safety

- [ ] Source inventory still filters, creates, opens and deletes the same records.
- [ ] Source editor still saves, reorders, adds, imports and removes files with the same validation.
- [ ] Media upload and preview selection are unchanged.
- [ ] Runtime import and private component workspace flows are unchanged.
- [ ] Snapshot delete eligibility, protection, confirmation and server response checks are unchanged.
- [ ] Analytics values, polling/backoff, date range, ranking links and analytics-only hide/restore behavior are unchanged.
- [ ] Like state still rolls back on a rejected request.
- [ ] Copy success icon appears only after the Clipboard API resolves successfully.
- [ ] Source access remains server-authorized; icons do not imply access the user does not have.

### Accessibility and motion

- [ ] Icon-only buttons retain their existing `aria-label` and tooltips.
- [ ] Decorative icons remain `aria-hidden="true"`.
- [ ] Hover and keyboard focus give equivalent feedback.
- [ ] Touch users receive action feedback without hover.
- [ ] Reduced-motion preference renders icons without path animation.
- [ ] No infinite animation, autoplay animation or animation triggered by every data poll.
- [ ] Warning and destructive actions keep clear text and semantic color; the animation is never the only status signal.

### Visual and performance QA

- [ ] Compare the same component in light and dark themes.
- [ ] Keep icon baseline, stroke weight, button height and text spacing identical to the existing design.
- [ ] Check 320 px mobile, tablet and desktop widths.
- [ ] Inspect Next.js production build and client bundle output; confirm direct imports do not pull the full icon set.
- [ ] Check no hydration warnings or server/client component boundary errors.
- [ ] Review the final page with keyboard-only navigation and touch emulation.

## 9. Files expected to change during implementation

The planned UI surface is limited to these existing files (plus the dependency manifest/lockfile and focused tests):

- `src/app/components/labs/admin/LabsOwnerNavigation.js`
- `src/app/components/labs/admin/LabSourceInventory.js`
- `src/app/components/labs/admin/LabSourceEditor.js`
- `src/app/components/labs/admin/LabRuntimeImportPanel.js`
- `src/app/components/labs/admin/LabMediaLibrary.js`
- `src/app/components/labs/admin/LabSnapshotStoragePanel.js`
- `src/app/components/labs/admin/LabsLiveAnalyticsDashboard.js`
- `src/app/components/labs/LabLikeButton.js`
- `src/app/components/labs/detail/LabSourceAccess.js`
- `src/app/components/labs/detail/LabCanvasActions.js`

`LabsEngagementTrendChart.js` should remain unchanged unless a discrete section icon is shown to add real meaning. `LabsIntroduction.js`, experiment cards and experiment runtime source are not targets for decorative icon additions.

## 10. Final design decision

Use the AnimateIcons **Lucide** set as a progressive enhancement to the current Lucide icon system. Start with the navigation, Source Management inventory and the four Labs Analytics metric icons. Keep icons static at rest, animate on meaningful interaction, preserve reduced-motion behavior and leave all business logic untouched.

Do not turn the owner workspace into an icon showcase. The intended result is a more responsive and polished product interface where the motion confirms an action or clarifies a control—without competing with experiment previews, charts, source code or the data itself.

---

*This document is the approved planning basis for a later implementation pass. It does not install dependencies or modify any runtime UI.*
