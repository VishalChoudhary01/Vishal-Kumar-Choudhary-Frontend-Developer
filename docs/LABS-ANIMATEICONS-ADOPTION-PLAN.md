# Labs UI — AnimateIcons Adoption Plan

**Status:** Phase 1 implemented on `develop`; later migration phases remain planned  
**Reviewed:** 11 November 2026  
**Target areas:** Public Labs experience, Source Management, Labs Analytics  
**Recommended approach:** curated hybrid — It’s Hover for selected handcrafted interaction icons, AnimateIcons Lucide for semantic coverage, and existing Lucide for static/fallback icons

---

## 1. Executive recommendation

Use a **curated hybrid**, not a wholesale replacement:

- **It’s Hover** is the first choice where its custom interaction is especially good: analytics chart, verified-user, copy, heart, refresh and source-code feedback icons.
- **AnimateIcons — Lucide set** fills semantic gaps such as folders, database/storage, file/code and other familiar Lucide concepts that It’s Hover does not currently expose.
- **Existing `lucide-react`** remains the static fallback for icons that are repeated, low-value, destructive-dialog-only, or not improved by motion.

The current Labs interface already uses a restrained outline-icon language. Both libraries use Motion, so they can coexist with the project's existing `motion/react` stack; however, they have different delivery models. AnimateIcons is a versioned package with direct icon subpath exports, while It’s Hover supplies individual source components through a shadcn registry. Do not treat them as one dependency or import pattern.

The visual target is:

- **Quiet by default.** Preserve the current icon size, alignment, color, labels and layout.
- **Motion on intent.** Animate on hover/focus or a meaningful completed action—not continuously on page load or every analytics poll.
- **One icon per action.** Never render both libraries for the same slot. Choose one source per icon and keep the outline language consistent.
- **Reduced-motion safe.** The local It’s Hover components need an explicit reduced-motion guard; the upstream examples reviewed do not provide one.
- **No behavioral changes.** Replacing an SVG must not change routes, permissions, source publishing, delete semantics, analytics, upload behavior or loading states.

Start with Labs Analytics and Source Management inventory. Bring the most useful It’s Hover animations into the owner interface, use AnimateIcons only for clear coverage gaps, then assess editor/media and public detail actions in later phases.

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


### It’s Hover — second library reviewed

- Icon gallery: https://www.itshover.com/icons
- Project home: https://www.itshover.com/
- GitHub repository: https://github.com/itshover/itshover
- Source README: https://github.com/itshover/itshover/blob/master/README.md
- Architecture and component pattern: https://github.com/itshover/itshover/blob/master/ARCHITECTURE.md
- Registry: https://github.com/itshover/itshover/blob/master/registry.json
- License file: https://github.com/itshover/itshover/blob/master/LICENSE

The live icon page currently reports **263 icons** and gives a per-icon shadcn CLI URL such as `npx shadcn@latest add https://itshover.com/r/plug-connected-icon.json`. The checked-in `registry.json` also contains **263 registry entries**. The README still says “186+” icons, so use the live registry count rather than the older README count.

It’s Hover is not an npm icon package like `@animateicons/react`. It distributes each icon as an editable React component through the shadcn registry or source files in `icons/`. The components use `motion/react`, support `size`, `color`, `strokeWidth`, and `className`, and expose `startAnimation()` / `stopAnimation()` through a forwarded ref. The custom animation behavior is the main advantage: for example, its chart line draws, user checkmark draws in, copy layers shift, heart pulses, eye blinks and refresh rotates.

#### Why it is useful here

- It gives more individually crafted interaction feedback than a generic icon fade/scale.
- Its ref API can let a parent button trigger the animation for pointer hover, keyboard focus or a successful action.
- It can be copied into the existing project; it does not require adding another icon runtime package.
- The Portfolio project already has `motion` installed, so the core animation import exists.

#### Important integration constraints

1. **No shadcn config in this repository.** The Portfolio repository currently has no `components.json`, no `tsconfig.json`, and no TypeScript dev dependency. Do not run the It’s Hover shadcn CLI blindly. For the approved first pass, manually port only the selected components into a Labs-local JavaScript directory, removing TS-only annotations and type imports. Reconsider CLI setup only in a separate tooling decision.
2. **Reduced motion is our responsibility.** The inspected upstream icon components attach hover handlers directly and do not check the app's `useReducedMotion` preference. Our local copies must guard their start/stop animation functions and render a static icon when motion is reduced.
3. **Some upstream hover patterns need restraint.** The inspected `upload-icon` repeats a fly-out/fly-in sequence in a loop while hovered. Do not use that source unchanged. Either convert it to one bounded cycle and test cleanup on unmount, or retain the current/AnimateIcons upload icon. Likewise, do not use the one-second full-turn clock animation for frequent metadata.
4. **Parent interaction must drive the animation.** A pointer may be over the button text rather than the nested SVG. Use the forwarded ref from the parent control so the whole button responds, and trigger the same short animation on `focus` / `blur` for keyboard users. Keep SVGs decorative with `aria-hidden="true"` where appropriate; do not rely on the icon to name the control.
5. **License metadata is inconsistent upstream.** The current repository `LICENSE` file contains Apache License 2.0, while the README and `package.json` metadata describe MIT. Do not silently assume one. Before copying components into the portfolio, confirm the governing license with the project maintainers and preserve the applicable copyright/license notices. The plan assumes no license has been waived.
6. **Version/API smoke test.** The It’s Hover repository's own package metadata uses a different Motion version from this project. Test its copied components against the installed `motion@13.2.x` before wider rollout.

#### It’s Hover vs AnimateIcons

| Decision point | It’s Hover | AnimateIcons |
|---|---|---|
| Delivery | Per-icon source through shadcn registry; components are copied and owned locally. | Versioned `@animateicons/react` package with direct icon subpath exports. |
| Strength | Distinct handcrafted interaction choreography and editable source. | Broad Lucide/Huge coverage and consistent familiar icon vocabulary. |
| Animation control | Forwarded ref exposes `startAnimation()` and `stopAnimation()`; inspected icons animate on their own hover by default. | Hover and imperative controls; package provides configurable icon props. |
| Project fit | Reuse current Motion dependency, but manually port selected TSX to JS because this repository has no shadcn config or TypeScript toolchain. | Add a pinned dependency only if needed for concepts unavailable in It’s Hover; use direct subpath imports. |
| Current catalog evidence | 263 live registry items. | Repository manifests show 999 Lucide + 501 Huge names at review time; use the exact package version's exports, not the count, as the implementation source of truth. |
| Accessibility | Needs local reduced-motion, parent focus triggers and ARIA treatment. | Also needs the app's reduced-motion and parent-focus policy verified per component. |
| Best use here | Handcrafted action feedback in Analytics and selected Source Editor actions. | Semantic coverage gaps such as folder, database, hard-drive and image. |


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

File: `src/app/components/labs/admin/LabsLiveAnalyticsDashboard.js`

Use It’s Hover for the first five metric/analytics concepts because the animation directly reinforces their meaning. Use AnimateIcons only for the other management actions whose It’s Hover equivalent is absent or not strong enough.

| Current slot | Preferred component | Fallback / alternative | Why it suits this slot | Trigger and restraint |
|---|---|---|---|---|
| Source opens (`Eye`) | It’s Hover `eye-icon` — `EyeIcon` | AnimateIcons `eye` — `EyeIcon` | The pupil/eye shape gives a small blink response that reads as a view action. | Parent hover/focus only. Do not blink on every 10-second poll. |
| Verified accounts (`Users`) | It’s Hover `user-check-icon` — `UserCheckIcon` | AnimateIcons `user-round-check` — `UserRoundCheckIcon` | User silhouette plus drawn check expresses a verified account, not merely a group count. | Brief parent hover/focus. Do not repeatedly bounce while the metric is unchanged. |
| Code copies (`Copy`) | It’s Hover `copy-icon` — `CopyIcon` | AnimateIcons `copy-check` — `CopyCheckIcon` | The foreground copy layer shifts and clarifies the copy action. | Parent hover/focus. Keep actual success feedback tied to clipboard completion. |
| Active likes (`Heart`) | It’s Hover `heart-icon` — `HeartIcon` | AnimateIcons `heart` — `HeartIcon` | A short heart pulse reinforces the familiar engagement action. | Trigger after an accepted like action; no ambient pulsing on a static dashboard metric. |
| Trend / analytics destination | It’s Hover `chart-line-icon` — `ChartLineIcon` | AnimateIcons `chart-spline` — `ChartSplineIcon` | Draws the line path and baseline, which communicates trend data more clearly than a generic flask. | One draw on parent hover/focus. Keep the trend chart itself unchanged. |
| Refresh dashboard | AnimateIcons `refresh-cw` — `RefreshCwIcon` | Existing Lucide icon | It’s Hover’s `refresh-icon` performs a one-off 180° rotation, but the current dashboard already exposes a real refreshing state. AnimateIcons or the existing control can be tied to that state more predictably. | Animate only while a real refresh is running; do not replay on every polling success. |
| Analytics-only removal | AnimateIcons `trash` — `TrashIcon` | Existing Lucide `Trash2` | The delete affordance should remain clear and restrained. | Gentle hover/focus only; keep typed-slug confirmation unchanged. |
| Restore | AnimateIcons `rotate-ccw` — `RotateCcwIcon` | Existing Lucide `RotateCcw` | Directly communicates undo/restore. | Brief hover/focus only. |
| Close dialog | — | Existing Lucide `X` | A close affordance gains little from motion. | Keep static. |

Keep the current metric labels, values, colors, accessible names, reporting period, polling interval and action handlers unchanged. The animation is a visual response only; it must never become the source of truth for whether an event succeeded.

### G. Additional It’s Hover opportunities in Source Management and editor

Files: `LabSourceInventory.js`, `LabSourceEditor.js`, `LabRuntimeImportPanel.js`, `LabMediaLibrary.js`, `LabSnapshotStoragePanel.js`

| Current slot | It’s Hover component | Recommendation |
|---|---|---|
| Source workspace identity (`FileCode2`) | `code-xml-icon` — `CodeXmlIcon` | Use only if the more detailed code mark remains legible at 14–16 px. Otherwise choose AnimateIcons `file-code`. |
| Save source | `save-icon` — `SaveIcon` | Good hover/focus response for the save action. Keep save confirmation and dirty-state logic unchanged. |
| File copy / code copy | `copy-icon` — `CopyIcon` | Use for copy controls; show success only after the clipboard action succeeds. |
| Preview source | `eye-icon` — `EyeIcon` | Good small blink on preview controls. |
| Upload media | `upload-icon` — `UploadIcon` | **Do not use upstream unchanged:** it repeats a fly-out/fly-in loop while hovered. Prefer AnimateIcons `upload` or keep the current icon unless the local port is changed to one bounded cycle. |
| Download reviewed runtime | `download-icon` — `DownloadIcon` | Suitable for the reviewed runtime import action; trigger once on hover/focus. |
| Delete source/file/media | `trash-icon` — `TrashIcon` | Keep the current destructive color and confirmation. If used, animate only on action hover/focus—not inside the confirmation modal. |
| Verified source access | `lock-icon` — `LockIcon` | Optional, if the closed/open lock movement remains subtle at the current 18 px size. |

**Coverage gap:** It’s Hover's current registry does not include direct equivalents for `folder-open`, `folder-plus`, `database`, `hard-drive`, `image`, or `file-code`. Keep those as AnimateIcons Lucide choices (or static Lucide if animation adds no meaning). Do not force a semantically weaker It’s Hover icon into those slots.

### H. Public experiment detail page

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

### AnimateIcons package dependency

At implementation time:

1. Confirm the current published package version and React peer requirements.
2. Add `@animateicons/react` as an exact dependency only if the semantic gaps selected for AnimateIcons justify the package. The reviewed package is `0.13.0`; do not update React, Next.js, Motion or Lucide as part of this change.
3. Update the repository lockfile with the project's existing package manager.
4. Confirm the exact icon subpaths in the mapping resolve from the installed package.
5. Use direct imports such as `@animateicons/react/lucide/chart-spline-icon`; avoid broad icon barrels in Next.js App Router.

### It’s Hover source integration

- Do not add an npm dependency called `itshover`; the reviewed project distributes components through its shadcn registry and source tree.
- Because this repository has no `components.json`, no `tsconfig.json` and no TypeScript dev dependency, do not invoke the registry CLI blindly. Manually port only the approved It’s Hover components from their upstream TSX source to JavaScript under `src/app/components/labs/icons/itshover/`.
- Port only the specific icon and shared minimal helper/type behavior needed. Do not copy the full icon directory or the whole upstream application.
- Remove TypeScript-only syntax and imports. Preserve the icon's `size`, `color`, `strokeWidth`, `className` API and imperative ref behavior where needed.
- Before shipping copied source, resolve the upstream MIT/Apache metadata conflict and preserve the applicable license/copyright notice in the local directory.
- Add the app's `useReducedMotion` guard to each local copy. Make hover start/stop idempotent and stop animations on unmount.
- For any component with a repeating timeline (notably `upload-icon`), change it to a bounded one-shot interaction or do not adopt it.
- Keep direct, local imports by feature. Do not create a global registry that eagerly imports every copied SVG.

### Component strategy

- Keep icons imported locally by feature component; do not create a global map that imports the entire catalog.
- Use a small Labs-only adapter only if it centralizes reduced-motion behavior and shared defaults without hiding imperative refs.
- Keep the present component props and action callbacks. Replace only the SVG component at the render location.
- Keep `lucide-react` for icons outside this scope and for concepts without a verified animated equivalent in either library.
- Do not use either library inside editable source text in `LabSourceEditor.js`, source templates, compiler code, preview runtime, or stored experiment snapshots.

## 7. Recommended rollout

| Phase | Scope | Reason | Exit criteria |
|---|---|---|---|
| 0 — Library/rights smoke test | Verify It’s Hover license with maintainers, compare exact live registry components, verify AnimateIcons exports and test both against installed Motion | Avoids a dependency, source-port or licensing surprise | License decision recorded; local JS prototype compiles; reduced-motion and imperative triggers pass. |
| 1 — Analytics prototype | `LabsLiveAnalyticsDashboard.js` with It’s Hover `chart-line`, `user-check`, `copy`, `heart`, and `eye` | Highest value-to-scope ratio; the motion directly explains metric meaning and successful interactions | Metrics and polling remain unchanged; no animation on every refresh; focus and reduced-motion work. |
| 2 — Source inventory + owner navigation | `LabsOwnerNavigation.js`, `LabSourceInventory.js` | Establishes consistent icon style in the management entry points, using AnimateIcons for It’s Hover coverage gaps | Filters, links, create/delete semantics and status labels remain unchanged. |
| 3 — Editor/media/storage tools | `LabSourceEditor.js`, `LabRuntimeImportPanel.js`, `LabMediaLibrary.js`, `LabSnapshotStoragePanel.js` | Adds feedback only to high-intent actions; keeps storage/file semantics clear | Save/upload/import/delete flows unchanged; no repeated upload loop; pending states remain clear. |
| 4 — Public detail | `LabLikeButton.js`, `LabSourceAccess.js`, `LabCanvasActions.js` | Adds feedback at the point of user engagement | Like rollback, clipboard success, source authorization and restart behavior unchanged. |
| 5 — Visual QA | Desktop/tablet/mobile, light/dark, keyboard, touch and reduced motion | Catches density, contrast, motion and local-source issues | No layout shift, no motion on initial render, no console errors, acceptable bundle impact. |

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

- [ ] Local It’s Hover copies use the app's `useReducedMotion` hook and remain static when reduction is requested.
- [ ] Parent buttons trigger nested icon motion on both pointer hover and keyboard focus; icon self-hover alone is not the only trigger.
- [ ] Imperative animations stop and clean up on hover end, state reset and component unmount.
- [ ] No unbounded hover loop is shipped (especially the upstream upload animation).

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

The planned UI surface is limited to these existing feature files, plus a small set of manually ported JavaScript icon components under `src/app/components/labs/icons/itshover/`, the applicable upstream license notice and focused tests. Add `@animateicons/react` and its lockfile entry only if the selected coverage-gap icons are approved for that package:

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

Use **It’s Hover for selected handcrafted interactions**, **AnimateIcons Lucide for semantic coverage gaps**, and the existing `lucide-react` icons as the static fallback. Prototype It’s Hover first on the four Analytics metrics and chart context, then use AnimateIcons for folder/storage/file concepts that It’s Hover does not cover.

Do not install or copy either library wholesale. Resolve It’s Hover's license inconsistency, port only selected TSX icons to JavaScript, add reduced-motion and keyboard-focus behavior, and test against the current Motion version before adopting more icons.

Do not turn the owner workspace into an icon showcase. The intended result is a more responsive and polished product interface where motion confirms an action or clarifies a control—without competing with experiment previews, charts, source code or the data itself.

---

*This document records the design plan and the first delivered Labs icon implementation. It does not imply that the remaining It’s Hover, editor/media/storage or public-detail phases are complete.*


## 11. Implementation status — 11 November 2026

### Phase 1 delivered on `develop`

The first production implementation uses the pinned `@animateicons/react@0.13.0` package. It is limited to the Labs owner workspace:

- **Owner navigation:** Labs Analytics now uses `chart-spline`, Source Library uses `folder-open`, and Snapshot Storage uses `hard-drive`. Portfolio Analytics remains unchanged.
- **Labs Analytics metric cards:** source opens uses `eye`, verified accounts uses `user-round-check`, code copies uses `copy-check`, and active likes uses `heart`.
- **Source Management inventory:** status and action affordances use animated alert, check, file-code, folder-plus, pencil, refresh, and row-level trash icons. Search icons, loading spinners, navigation arrows, and destructive confirmation dialog trash icons remain static.

All three components read the application's existing `useReducedMotion` preference and pass it to the icon's `isAnimated` prop. Icon imports use direct per-icon subpaths rather than the package barrel.

The initial build test is included in the canonical `npm run build` chain as `test:labs-animated-icons`. It asserts the pinned package, icon subpaths, reduced-motion safeguards and preservation of static loading/destructive confirmation icons.


### Portfolio hero Labs CTA alignment correction

The separate `ExploreLabsButton` teal-outline component was removed after visual review because its standalone icon treatment and pill proportions did not match the existing hero CTA. The hero now reuses `ProjectResumeButton` for both actions:

- Projects: `<ProjectResumeButton href="#projects" label={CTA_TEXT} />`
- Labs: `<ProjectResumeButton href="/labs" label="Explore Labs" icon={FlaskConical} />`

This preserves one shared shell, moving circular icon position, sizing, surface treatment, hover/focus/tap behavior, sound feedback and reduced-motion behavior. Only the label, destination and leading icon differ. The same usage is applied in animated desktop/tablet, mobile intro and reduced-motion hero layouts. No separate Labs CTA styling remains.

### Deferred

- It’s Hover components are **not yet copied**. The upstream README/package metadata and repository license file disagree (MIT versus Apache 2.0). Resolve that with the maintainers before copying source into this repository.
- Editor/media/storage detail icons, public experiment detail actions, parent-controlled keyboard-focus animation and interactive visual QA remain subsequent phases.
- Do not adopt the It’s Hover upload loop unchanged; the earlier plan's bounded-animation requirement still applies.

