# Error Page Layout — Follow-up Audit and Implementation Plan

**Branch:** `fix/error-page-viewport-diagnostics`  
**Scope:** Error boundary, global error, and not-found presentation.  
**Status:** Follow-up layout pass planned from source inspection; browser verification required.  
**Constraints:** Keep JavaScript, Tailwind CSS v4, and `motion/react`; do not merge to `main`; do not hijack wheel/touch/page scrolling.

## Current findings

1. `ErrorPage.js` renders an outer diagnostics panel header while `ErrorDiagnostics.js` renders a second developer-diagnostics heading. This duplicates labels and wastes vertical space.
2. Desktop sizing sets a viewport height on the page, but the main grid does not explicitly define a constrained `minmax(0, 1fr)` row. Grid/flex descendants may retain intrinsic minimum heights.
3. Source context is rendered below the two diagnostics columns, so it competes with the stack trace for limited vertical space.
4. The diagnostics panel uses a calculated height for its content while also using padding. This makes the height budget fragile and dependent on the header's exact size.
5. Stack scrolling uses native overflow (good), but the parent chain needs explicit constrained heights and `min-h-0` so the stack receives the intended remaining space.
6. `error-utils.js` uses the first parsed stack frame for `file`, `line`, `column`, and `functionName`. That frame may be a framework/runtime frame rather than the first actionable project frame.
7. `ErrorDiagnostics.js` contains a source-frame finder but does not use it for selecting the location. Source context can therefore fail to appear even when a later stack frame points into `src/`.
8. The displayed “Root cause” text asserts that a value is not in scope even when the error does not establish that fact. This is an unsupported diagnosis and should be replaced with a neutral evidence-based summary.
9. The source snapshot endpoint intentionally returns 404 in production. Production-safe diagnostics must not suggest that source context is available there.
10. At small heights, even a compact summary plus details cannot all remain visible without either reducing the summary, scrolling within a pane, or allowing page scroll. The design must prioritize summary/actions and stack visibility, not promise impossible fit.

## Target layout

### Desktop (large viewport)
- A compact top status row with error code, environment, and reference ID.
- A two-column main region: a narrow error summary/actions rail and a wider diagnostics workspace.
- Diagnostics workspace uses one compact header only.
- Below the header, a two-column diagnostic body:
  - **Details column:** error name/message, best available source location, route, component/function, source type, timestamp, digest, and source snippet when available.
  - **Stack column:** receives the largest flexible share of remaining height and owns the primary native stack scroll container.
- Source context belongs inside the details column, not in a full-width row below the stack.
- Main desktop grid uses a constrained remaining-height row (`minmax(0,1fr)`) and all intermediate grid/flex items that must shrink use `min-h-0`.
- Avoid brittle `calc(100% - fixed-header-pixels)` height assumptions; use flex column with a shrink-resistant header and a `min-h-0 flex-1` body.

### Short desktop viewport
- Keep the error title and recovery actions compact and visible.
- Allocate as much available remaining height as possible to the details/stack workspace.
- Use native `overflow-y-auto` inside the details pane and stack pane only when content exceeds their allocated height.
- Never intercept wheel, keyboard, or touch scrolling to force the page or another panel to move.
- If the available viewport cannot fit the header and summary, preserve normal document scrolling rather than clip essential controls.

### Mobile / narrow viewport
- Stack summary before diagnostics.
- Use normal document scrolling.
- Keep stack/source regions bounded only where it improves usability; do not create nested scroll traps.
- Ensure long file paths, messages, and stack lines wrap safely.
- Respect `prefers-reduced-motion`.

## Diagnostic correctness changes
- Select a project-source frame from stack text when available; prefer `src/` paths over framework/node_modules frames.
- Preserve the original stack text.
- If no actionable project source frame exists, show “Location unresolved from available stack” rather than fabricating a location.
- Remove speculative root-cause claims. Show the actual error name/message and a neutral note that stack data is best-effort.
- Source code snippets remain optional and development-only; failure to fetch a snippet must not hide the location or stack.
- Production must not expose stack/source details that Next.js intentionally redacts. Show reference/digest and a safe message instead.

## Motion and accessibility
- Keep subtle staggered entrance motion using `motion/react`.
- Respect reduced-motion preference in both the outer layout and diagnostics animations.
- Keep focus-visible styles and accessible labels for stack region and copy actions.
- Copy-location and copy-stack actions should provide status feedback to assistive technology.
- Use semantic headings without duplicate nested panel titles.

## Regression checklist
- [ ] `npm run lint`
- [ ] `npm run validate:seo`
- [ ] `npm run build`
- [ ] Development runtime error with a project-source stack frame
- [ ] Error whose stack only contains framework/compiled frames
- [ ] Missing stack trace
- [ ] Source snippet available and unavailable
- [ ] Production-safe error display; verify source snapshot is still 404 in production
- [ ] Desktop at 1440×900 and 1280×720
- [ ] Short viewport at 1280×600
- [ ] Mobile at 390×844 and 360×640
- [ ] Keyboard focus and native stack scrolling
- [ ] Reduced-motion preference
- [ ] Not-found page and global error boundary
- [ ] Confirm homepage/project route rendering remains unchanged

## Acceptance criteria
1. Desktop uses the viewport without page-level vertical scrolling when the viewport is tall enough for the compact summary and diagnostics workspace.
2. Stack trace gets the largest practical share of diagnostics height.
3. No duplicated diagnostics headings.
4. No unsupported root-cause claims.
5. Source location prefers an actionable project frame and has an honest unresolved state.
6. No custom wheel/touch/keyboard scroll hijacking.
7. Mobile remains naturally scrollable.
8. Production privacy behavior remains intact.
9. Changes stay on this branch and are not merged to `main`.
