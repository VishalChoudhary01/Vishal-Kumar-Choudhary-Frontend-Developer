# Labs Detail Presentation and Monaco Editor — Phased Implementation Plan

**Status:** Phases 1–5 implemented in branch source with regression tests and production build passing. Authenticated Preview/browser QA remains pending for Phases 1, 3, 4 and 5; deployment availability must be checked before release. Phases 6–7 remain.
**Branch:** `feat/labs-platform-integration`
**Last reconciled:** 6 November 2026
**Scope:** Public Labs detail page media/layout, protected read-only source viewer, and the admin source creator's code editor.
**Change policy:** This document is the phase plan and acceptance contract. Do not replace source-management, runtime, publishing, media or authentication behavior as part of a code-editor/UI migration.

---

## 1. Product decisions locked

These decisions are the baseline for all phases unless the owner explicitly changes them.

1. **Public detail pages are non-executable.** They show project information, selected media, explanation and (for verified users) protected read-only source code. Do not mount `LabWorkspace`, a published artifact iframe, a React experiment runtime or a built-in live demo on the public detail page.
2. **The public media precedence is locked:** explicitly promoted uploaded image/GIF/video for the current release → automatically generated poster from the exact published artifact → existing Labs artwork fallback.
3. **Media must never be stretched or unintentionally cropped.** Preserve the uploaded/generated asset's intrinsic aspect ratio. A gallery card may have a consistent visual stage, but its media content must use a non-distorting fit and letterbox/background space when necessary.
4. **Keep the existing Like component and engagement system.** Rearranging its position must not replace its API, cookie/session behavior, optimistic update, count, analytics or accessibility behavior.
5. **Use Monaco Editor for both the public source reader and the owner source creator.** Reuse one Labs editor wrapper with explicit read-only and editable modes. Do not create two unrelated editor integrations.
6. **The existing React `files` state remains authoritative** in the owner source creator. Monaco is an editing/viewing surface, not a new persistence layer.
7. **Run, Save Draft and Build & Publish remain three distinct actions.** Monaco must not merge or change their semantics:
   - Run executes the current working copy in a temporary isolated preview.
   - Save Draft creates a private immutable source version.
   - Build & Publish saves dirty working files first, builds the exact saved version, stores an immutable release, captures the optional poster and switches the public pointer only after a successful release.
8. **The previous published release stays live if a new build fails.** Poster capture is best-effort and non-blocking after a successful build; poster failure must not turn a valid release into a failed build.
9. **No public source leakage.** Monaco must not weaken current server-side verified-email authorization, session revalidation, source endpoints, guest states or source event rules.
10. **Tailwind CSS v4 remains the layout/styling system.** Keep the existing restrained radius, token and responsive conventions. Do not introduce custom CSS for ordinary layout or rewrite the page design system.

## 2. Current implementation inventory

This section records what already exists. It is not a request to rebuild these capabilities.

| Area | Current state | Evidence / behavior to preserve |
|---|---|---|
| React experiment compiler | Implemented | Pinned isolated React 19 toolchain with JSX/TSX, Motion, Tailwind CSS v4, Lucide and React Icons support |
| Owner Run preview | Implemented | Run uses current working-copy files, a disposable isolated sandbox, a separate preview origin/iframe, run-scoped messages, console diagnostics and an expiring preview |
| Compiler worker lifecycle | Implemented | Disposable Run/release workers are non-persistent; compiler snapshot is immutable and environment-configured |
| Draft save | Implemented | Validates files and creates a private immutable source version with change summary and content hash |
| Build & Publish | Implemented | If the working copy is dirty, saves it as a private draft first; publishes the exact saved version ID |
| Release artifact | Implemented | Rebuilds the exact source version, stores immutable output files under a unique artifact namespace and updates the published pointer only after the release build succeeds |
| Automatic poster capture | Implemented | Runs during the release build against the exact compiled output in the same isolated compiler sandbox; uses pinned Playwright/Chromium and a local-only capture server |
| Poster validation/storage | Implemented | Validates PNG signature, dimensions, size, browser/capture versions and hash; stores under the exact artifact ID namespace |
| Poster failure policy | Implemented | Capture is optional/non-blocking; unavailable status/reason is persisted; never reuses an older artifact's poster for a new release |
| Owner poster status | Implemented | Owner media API returns current published artifact poster status; media panel has an Automatic screenshot status/preview area |
| Private media upload | Implemented | Cloudinary authenticated uploads, server-side resource verification and owner-only media inventory |
| Public gallery media promotion | Implemented | Owner explicitly promotes a verified image/GIF/video; promotion is copied to public Blob and bound to the exact current published artifact/source version |
| Public media selection | Implemented | Shared selection policy: promoted upload → generated poster → existing artwork; stale release-bound uploads are not public for a new artifact |
| Public listing eligibility | Implemented | Custom published source query includes the `published` field and requires exact matching ready artifact/version |
| Shared preview renderer | Implemented | `LabExperimentPreview` is used for gallery/featured/detail visuals and handles media failure fallback |
| Public detail executable workspace | Removed | `src/app/labs/[slug]/page.js` no longer mounts `LabWorkspace`; keep it absent |
| Like/engagement | Implemented | Existing `LabLikeButton`, optimistic count, guest/signed-in behavior and server snapshot remain intact |
| Protected source access | Implemented | Server resolves authorization before passing source to `LabSourceAccess`; verified-email/session checks and copy events remain in place |
| Detail source code presentation | Implemented | Protected read-only Monaco; existing file tabs, copy event and session authorization preserved |
| Owner editable source presentation | Implemented | Shared editable Monaco; React files state authoritative; Run/Save/Publish snapshot behavior covered by tests |
| Version-history code viewer | Implemented | Shared read-only Monaco with immutable version/file model IDs and disposal on close; Restore still creates a new draft |
| Detail media aspect-ratio presentation | Needs improvement | Detail wrapper currently forces responsive 4:3/16:9 stages and preview defaults to cover for some assets; fix without changing media precedence |
| Detail section arrangement | Needs improvement | Current header/like, media, explanation and source sections exist; reorder/refine spacing while preserving each function |

### 2.1 Critical current code boundaries

- Public detail route: `src/app/labs/[slug]/page.js`
- Detail heading/category/description/technologies/Like: `src/app/components/labs/detail/LabDetailHeader.js`
- Explanation: `src/app/components/labs/detail/LabExplanation.js`
- Shared public media renderer: `src/app/components/labs/LabExperimentPreview.js`
- Like and engagement behavior: `src/app/components/labs/LabLikeButton.js`
- Protected source reader: `src/app/components/labs/detail/LabSourceAccess.js`
- Owner source creator and release controls: `src/app/components/labs/admin/LabSourceEditor.js`
- Owner media inventory/promotion/poster status: `src/app/components/labs/admin/LabMediaLibrary.js`
- Publish/build/poster pipeline: `src/app/lib/labs/compiler-service.js`
- Poster capture worker: `tools/labs-compiler/scripts/capture-poster.mjs`
- Public selection/DTO: `src/app/lib/labs/public-experiments.js` and `src/app/lib/labs/gallery-preview-policy.mjs`

## 3. Phase 0 — Baseline, dependency and regression contract

**Goal:** Freeze the working application behavior before changing the visual editor.

### Work
- Record current package lock, React 19 / Next.js version, compiler snapshot ID, source API contracts and the latest successful Preview deployment.
- Evaluate the exact `@monaco-editor/react` and Monaco package versions for the installed React 19 and Next.js versions before pinning them. Do not install a floating version or update unrelated packages.
- Decide how Monaco's worker assets will be served locally from the application origin. Do not rely on a public CDN for editor workers.
- Confirm dynamic client-only loading and graceful loading/error states. Monaco must not be evaluated during server rendering.
- Capture baseline behavior for the existing Run, save, restore, publish, source access, likes and gallery media flows.
- Add component/adapter-level test seams before swapping the text controls.

### Exit criteria
- Exact dependency versions and lockfile changes are reviewed and pinned.
- No source-management or compiler API contract changes are required just to introduce Monaco.
- Baseline regression cases are documented and runnable.

## 4. Phase 1 — Correct media sizing and detail-page visual layout

**Goal:** Make the project media look correct for landscape, portrait, square, animated and video sources. Keep content and interaction behavior.

### 4.1 Media sizing rules

- Remove the assumption that every detail asset must fill a fixed 4:3 mobile / 16:9 desktop crop.
- Generated poster dimensions are 1200×900 (4:3). Preserve that ratio by default.
- Use `object-contain` for uploaded image, GIF and generated screenshot media. Use `video { width: 100%; height: 100%; object-fit: contain; }` equivalent Tailwind utility behavior for video.
- Preserve intrinsic dimensions where they are known. If dimensions are not known until load, allow the media element to report them and update the visual stage without stretching.
- The outer stage may use a restrained background and a bounded responsive height. Empty space around portrait or square media is expected; it is preferable to distorting the media.
- Do not use `object-cover` as a universal default. Any intentional crop must be explicit, owner-selected and consistent in card and detail.
- Keep `width: 100%` and `height: auto` where a natural-height image is used. If a bounded stage is required, size the stage, not the intrinsic image.
- Video remains muted, inline and looping for visual preview. Respect reduced-motion preferences; do not make audio autoplay.
- GIF remains animated unless reduced motion is requested; when reduced motion is active, use the generated still if available.
- Add a loading skeleton or stable background so the page does not jump while dimensions resolve.
- A broken uploaded asset falls back to the generated poster, then existing artwork. A broken generated poster falls back to artwork.
- Use the same renderer and ratio policy for card, featured and detail contexts, but allow an intentional per-context max-height.

### 4.2 Detail page section order

1. Back to Labs / breadcrumb.
2. Category eyebrow.
3. Project title.
4. Project description.
5. Technologies/stack metadata.
6. Like row (same existing `LabLikeButton` and count).
7. Project preview (selected uploaded media or generated poster).
8. About the experiment / explanation.
9. Protected source section.

### 4.3 Detail layout contract

- Retain the current max-width and responsive page gutters unless a clear breakpoint issue is found.
- Use a readable content width for title and description; avoid forcing text across the full media width.
- Keep the preview prominent, but cap its desktop height so portrait images do not dominate the whole page.
- Do not let the media stage cause horizontal scrolling.
- Keep the Like row close to project metadata. Do not duplicate the button in another section.
- Keep the section headings semantically ordered and maintain a single page H1.
- No executable preview/runtime returns to the public detail page.

### Exit criteria
- Test portrait, landscape, square, 4:3 generated PNG, GIF, MP4 and WebM at mobile/tablet/desktop.
- No stretched or unintentionally cropped content.
- Like remains functional for guest, signed-in and unverified users.
- Public detail stays static and non-executable.

## 5. Phase 2 — Shared Monaco component foundation

**Goal:** Build one reusable Monaco adapter that can be used in three places without owning source persistence.

### Planned component
Create a shared client-only component, for example `src/app/components/labs/code/LabCodeEditor.js`, with explicit props:

- `value`: current file content string.
- `language`: normalized language ID from the existing source-file language.
- `readOnly`: explicit boolean.
- `onChange`: required only for editable mode.
- `theme`: Labs theme mapped from existing design tokens.
- `path/modelId`: stable URI based on experiment slug + file path + immutable version context when applicable.
- `height/minHeight` and bounded editor container options.
- `loadingFallback` and `errorFallback`.
- Optional `onCopy` / editor-ready callbacks that do not own business logic.

### Editor configuration
- Line numbers enabled.
- JetBrains Mono preferred, with local monospace fallback.
- Font size around 13–14 px and line-height tuned for readable source.
- Two-space tab sizing; preserve tabs/spaces already in content.
- Word wrap off by default, with an explicit toggle.
- Minimap disabled for the compact embedded reader/editor unless a viewport-sized desktop editor benefits from it.
- Bracket pair colorization/matching, selection, find, keyboard navigation and accessible focus states.
- Read-only mode prevents edits but allows text selection, find, copy and file switching.
- No automatic source formatting or file mutation on mount.
- Keep clipboard writes in the existing owning component so audit events continue to fire.
- Disable Monaco features that require external language servers or package downloads; use local editor workers only.
- Editor models must be disposed when no longer referenced; switching files must not leak models or duplicate workers.

### Worker and loading strategy
- Dynamic import with `ssr: false` in a client wrapper.
- Self-host Monaco editor assets/workers under the application deployment.
- Verify worker MIME type, CSP, cross-origin isolation assumptions and production asset paths.
- Lazy-load only when the source section or editor panel is opened/visible.
- Provide a lightweight loading placeholder; if Monaco fails to load, preserve a functional plain-text fallback rather than hiding source or making the editor unusable.
- Keep the initial public Labs gallery/detail route from eagerly downloading Monaco for guests who never open the source section.

### Exit criteria
- Monaco loads in production Preview without external CDN access.
- No hydration error or worker/CSP failure.
- Plain-text fallback remains usable.
- No source or editor business logic has moved into the Monaco wrapper.

## 6. Phase 3 — Public detail source reader (read-only Monaco)

**Goal:** Replace only the current protected `pre/code` visual with a read-only Monaco source reader.

### Preserve current behavior
- Server-side initial authorization through `getAuthorizedLabSource`.
- Existing source endpoint and ownership/email verification.
- Guest sign-in and sign-up prompts.
- Unverified-email verification state.
- Session mismatch, revalidation, expiry and retry behavior.
- Source file tabs and selected-file state.
- Copy-current-file action and copied feedback.
- `source_open` and `code_copy` event requests (including file path/version metadata).
- No code source sent to guests/unverified accounts.
- No source content added to metadata, gallery DTO, public media APIs or analytics.
- Existing file version and protected-source section anchor/return-to behavior.

### Reader behavior
- File tabs remain outside Monaco and continue to select the same file index/path.
- Monaco runs with `readOnly: true`.
- Language comes from the existing per-file language metadata; normalize values to Monaco's supported IDs.
- Copy file continues to copy the selected file's exact complete content, not formatted or visible-only text.
- Find/selection/line numbers are viewer conveniences; they must not modify source.
- Show file path and source version above the editor.
- On small screens, make the editor horizontally/vertically scrollable inside its own bounded panel.
- Avoid auto-scrolling the entire page when the selected file changes.
- Lazy-load Monaco only after the authorized source state is loaded; guests should not load Monaco.

### Exit criteria
- Guest, unverified, verified, expired-session and session-mismatch cases behave exactly as before.
- Every file displays the correct content and language.
- Copy file still copies the original complete content and emits the existing event once.
- No write or draft API is called by the public source reader.

## 7. Phase 4 — Owner source creator (editable Monaco)

**Goal:** Replace the existing controlled textarea with the shared Monaco editor while keeping the existing source creator state and actions authoritative.

### State ownership — mandatory

The current `files` React state remains the one source of truth. Monaco models are a view/editor buffer only.

On a user edit:
1. Monaco emits the new text.
2. Adapter calls the existing `updateSelected({ content: nextValue })` path (or a narrowly scoped equivalent).
3. Existing `files` state updates.
4. Existing byte counters, edited/new file indicators and `hasUnsavedChanges` update.
5. Save, Run and Build & Publish consume the same `files` state.

Do not add a second unsynchronized `editorFiles` persistence state. Do not read visible text back from Monaco to construct a publish request. Before save/run/publish, flush any pending editor change into the authoritative React state to prevent a last-keystroke race.

### File management to preserve
- Add file.
- Remove file, including existing minimum-file rule.
- Rename path.
- Change language.
- Import text files and preserve file type mapping.
- Reorder files by drag/drop and arrow controls.
- Select files and preserve correct selection after reorder/removal.
- Starter templates (HTML/CSS, React JS and React TSX).
- File count, per-file byte and total snapshot-size validation.
- Restricted path and secret-file validation.
- Unsaved-change detection, before-unload protection and edited/new badges.
- Save private draft with change summary and request ID.
- Discard edits.
- Version list, immutable content hash and Live badge.
- View historical version in read-only mode.
- Restore historical version as a new draft.
- Audit timeline.
- Build & Publish confirmation/progress/errors.
- Unpublish and delete confirmation.
- Existing action toasts and retry/error messages.

### Run behavior — do not regress
- Run continues to submit the current unsaved working-copy files.
- Monaco edits must be visible in the preview after Run without requiring Save Draft.
- Run remains a temporary, isolated, separate-origin preview.
- Existing React/JSX/TSX, Tailwind v4, Motion, icons, console relay, iframe readiness, run ID, expiry, retry and stop behavior remain unchanged.
- Do not invoke poster capture during Run.
- Do not add Monaco packages or browser workers to the compiler sandbox; Monaco belongs to the parent Studio UI only.
- Run failures must remain independent from draft persistence and public release status.

### Save Draft behavior — do not regress
- Save validates the current `files` state and creates the same private immutable source version.
- The content hash is generated from the exact files saved by React state.
- Save remains private; it must not publish or generate a release poster.
- Discard rehydrates the editor from the saved `source.files`; Monaco models must be synchronized to those contents.

### Build & Publish behavior — do not regress
- If editor content is dirty, Build & Publish first saves that exact content as a private draft.
- Publish then uses the returned exact `versionId`; it must not use an older draft ID or stale Monaco model.
- Compiler revalidates source hash, runs the existing isolated React/TSX/Tailwind/Motion build and uploads artifact-specific immutable files.
- Automatic screenshot capture runs during this publish build against the exact built output (never against the editor UI or unsaved Run iframe).
- Poster capture remains optional and non-blocking; capture failure records a reason and uses artwork/upload fallback.
- The published pointer changes only after the artifact is complete and accepted.
- Previous published artifact remains live on compilation, upload or publish failure.
- Unique artifact Blob namespaces and `allowOverwrite: false` remain unchanged.
- Unpublish, source audit, version history and cleanup behavior remain unchanged.

### Exit criteria
- Editing through Monaco produces the same `files` state as editing the old textarea.
- Save, discard, Run and Build & Publish use the current text with no stale-content race.
- Every file operation listed above passes regression tests.
- A failed Run does not mutate the saved draft or live release.
- A failed Publish does not switch the live release.
- No new source upload or package install occurs inside the sandbox.

## 8. Phase 5 — Version-history viewer

**Goal:** Replace historical version `pre/code` rendering with the same shared Monaco component in read-only mode.

- Keep version metadata, immutable content hash and file tabs.
- Read-only Monaco must use a model identity that includes the immutable version ID and file path; it must not reuse the editable draft model.
- Restoring a historical version still calls the existing restore API and creates a new draft. It must not edit the historical version in place.
- Closing the version modal disposes unused models.
- The historical file content remains exactly as stored; no reformat or mutation.

### Exit criteria
- Historical versions remain read-only.
- Restore creates a new draft and current editor state refreshes.
- Editing the current draft cannot alter the historical viewer model.

## 9. Phase 6 — Detail and Studio layout polish

- Apply the approved detail section order from Phase 1.
- Keep the Like button and its current behavior, only reposition the existing component.
- Align source reader header, file tabs and Monaco editor into one cohesive section.
- In the Studio, preserve the existing Files / Editor / Live Preview three-column workflow.
- Monaco replaces only the textarea; it does not replace Files sidebar, path/language controls, live preview, console, draft controls or release controls.
- Keep responsive stack behavior and minimum usable editor/preview widths.
- Do not introduce excessive rounding or custom CSS; use Tailwind v4 and current token conventions.
- Respect reduced motion and focus-visible behavior.

## 10. Phase 7 — Verification matrix

### Media sizing
- 1200×900 generated screenshot.
- Wide landscape image (e.g. 16:9).
- Portrait image.
- Square image.
- Animated GIF.
- MP4 video.
- WebM video.
- Broken uploaded asset → generated poster.
- Broken generated poster → existing artwork.
- Check mobile, tablet and desktop; no stretch, unexpected crop or horizontal overflow.

### Public detail
- Back to Labs navigation.
- Category/title/description/technologies.
- Like as guest, signed-in, unverified and unavailable.
- Like count and optimistic rollback after failed request.
- Explanation display and absent explanation.
- Static media only; no iframe, sandbox or executable runtime request.
- Guest and verified source states.

### Protected source reader
- Guest receives no source content.
- Unverified account receives verification UI and no source content.
- Verified account loads source and all files.
- File switching, language mode, line numbers and selection.
- Copy selected file exactly once and source event once.
- Session expiry/revalidation clears source as before.
- Monaco unavailable falls back to plain text without exposing source to unauthorized users.

### Owner source creator
- Type into JS, JSX, TS, TSX, HTML, CSS, JSON, SVG, Markdown and text files.
- Add/import/rename/remove/reorder files.
- Change language and switch files rapidly.
- Unsaved indicator updates correctly.
- Save draft includes final keystroke.
- Discard resets editor model and file state.
- Run uses unsaved contents and refreshes only temporary preview.
- Console and run-scoped iframe handshake still work.
- Historical version opens read-only and restore creates a new draft.
- Build & Publish saves dirty content first and uses exact saved version.
- Poster capture occurs during publish only.
- Release failure preserves previous live artifact.
- Monaco load/worker failure has a usable text fallback.

### Performance and security
- Monaco not loaded on initial gallery route.
- Monaco not loaded for guest until the authorized source reader is opened.
- Editor workers are self-hosted and pass CSP/production build checks.
- No source content in guest HTML, metadata or public API.
- No source/editor data sent to the compiler beyond the exact Run/Save/Publish payloads already allowed.
- No external package install or network access added to compiler jobs.
- No new global state/store unless a concrete requirement is proven.

## 11. Implementation order and release gates

| Phase | Work | Gate |
|---|---|---|
| 0 | Baseline, dependency pin and regression contract | Existing Run/save/publish/source/like/media checks recorded |
| 1 | Media aspect ratio and detail layout | Code/tests committed; complete Preview/browser media matrix and Like/static-detail QA |
| 2 | Shared Monaco wrapper and self-hosted assets | Implemented; 6 config tests, ESLint, production build and local asset HTTP checks pass |
| 3 | Public read-only source viewer | Implemented in source; 5 access/copy contract tests and production build pass; authenticated browser QA pending |
| 4 | Editable Studio source creator | Implemented; 8 creator contracts + 4 path-state tests, ESLint and production build pass; owner browser QA pending |
| 5 | Read-only version-history viewer | Implemented; 6 immutable-history tests, ESLint and production build pass; owner browser QA pending |
| 6 | Responsive/accessibility/performance polish | No page bundle regression or keyboard/focus issue |
| 7 | Full Preview regression and owner QA | Run, Save Draft, Build & Publish, poster capture and gallery checks all pass |

Do not ship a phase that weakens a gate from an earlier phase. Use a Preview deployment first; Production remains unchanged until explicit release approval.

## 12. Explicit non-goals

- Do not restore executable code to the public Labs detail page.
- Do not delete `LabWorkspace` or compiler/runtime infrastructure; the admin Run action still depends on it.
- Do not change React/Next/Tailwind/Motion runtime versions as part of Monaco.
- Do not replace existing source version APIs, MongoDB models or Blob artifact layout.
- Do not change automatic poster capture timing or make it run on every page visit.
- Do not automatically publish uploaded media; owner promotion remains explicit.
- Do not change Like business logic, engagement model or API.
- Do not convert the portfolio application to TypeScript just to support TSX source files.
- Do not lose or simplify any existing admin controls, access restrictions, diagnostics or error handling.

## 13. Current implementation status summary

**Already implemented in source:** isolated React code Run preview; private draft/version workflow; exact-version Build & Publish; immutable artifact upload; poster capture during publish; artifact-bound public poster delivery; uploaded image/GIF/video promotion and media precedence; public custom listing query; owner poster status display; static public detail page; Like/engagement; protected source access/copy; shared Monaco for public source, owner editing and version history.

**Phase 1 implementation committed:** public media DTO now includes promoted upload dimensions and the known 1200×900 generated-poster dimensions; newly promoted media is normalized to `contain`; the shared renderer uses `object-contain`, measures browser intrinsic dimensions for legacy uploads and keeps broken-media fallbacks; the detail page no longer forces a 4:3/16:9 wrapper and instead uses natural height with a responsive maximum; detail header/explanation spacing was tightened; six media selection/dimension regression tests are included in every production build. Browser verification for portrait/landscape/square/GIF/video on the deployed Preview remains pending.

**Superseded phase snapshot:** the paragraphs describing the shared Monaco foundation only, the version-history viewer as planned, and package/wrapper integration as not yet implemented are historical phase notes. Later 6–7 November implementation commits integrated Monaco into all three surfaces: public protected source (read-only), owner editor (editable) and version history (read-only). The current-state summary at the top of this plan and the runtime/media plan take precedence.

**Current status:** Monaco package/local assets/wrapper and all three integrations are present in source. Current-HEAD Preview/browser QA for final-keystroke synchronization, keyboard accessibility, file switching, editor action preservation and theme/fallback behavior remains a release gate. This plan is both design history and acceptance checklist; do not claim verification until performed.


### Phase 1 implementation progress — 6 November 2026

**Code committed; regression tests passed; deployed browser QA still pending.**

Implemented in the current branch:
- Public \`galleryPreview\` schema now stores the actual uploaded media width and height from the already-verified Cloudinary asset record.
- The custom public experiment DTO carries uploaded media dimensions. The generated poster exposes its known 1200×900 dimensions.
- The media selection policy normalizes uploaded and generated visuals to \`fit: "contain"\`; owner promotion API and Studio payload use the same default. The schema default is now contain for new records.
- \`LabExperimentPreview\` uses the real intrinsic dimensions when present and measures \`naturalWidth/naturalHeight\` or \`videoWidth/videoHeight\` after loading for older media records without dimensions. This avoids keeping a hard-coded 4:3 size for portrait and widescreen uploads.
- Gallery/featured cards retain their consistent 4:3 visual stage; the content inside it is contained and letterboxed instead of cropped or stretched.
- Public detail media no longer sits in a forced mobile 4:3 / desktop 16:9 box. It uses a natural-height contained visual with a 76svh / 780px maximum.
- Detail header vertical rhythm and explanation spacing were tightened. The existing Like component, explanation content, protected-source section, and non-executable detail-page contract were not replaced.
- Added \`tests/labs-preview-media.test.mjs\` for generated poster default, portrait uploaded image dimensions, GIF, video, invalid upload fallback and no-media fallback. \`npm run build\` now runs this media suite before the existing Labs analytics and SEO checks.

**No Run/Save/Publish code path was modified in Phase 1.** The Studio textarea, current React \`files\` state, temporary Run preview, draft APIs, version history, publish flow, compiler sandbox and poster capture worker are unchanged.

**Still required before Phase 1 can be marked complete:**
1. Complete a Git-connected Vercel Preview build from the latest branch commit and confirm the full Next.js production build.
2. Inspect the Preview detail page at mobile, tablet and desktop.
3. Verify a real portrait, landscape, square image, generated 1200×900 poster, animated GIF, MP4 and WebM. Confirm there is no stretch/crop and the bounded detail height remains usable.
4. Verify gallery cards remain consistently framed and contain media.
5. Verify the Like action/count and protected-source authorization/copy behavior remain intact.
6. Verify the detail page still makes no executable iframe/runtime request.

Do not start Monaco integration until this Phase 1 gate is green.


**Verification update:** On 6 November 2026, the isolated test sandbox ran `npm run test:labs-media` (9 passing cases) and `npm run test:labs-analytics` (passed). A TypeScript parser syntax pass also succeeded for all changed JSX/JS application files. The latest Vercel READY deployment visible during this check was built from an earlier commit (`e0177880`), not the current branch HEAD; no claim is made that the current Phase 1 code is deployed or browser-accepted yet.

### Phase 1 deployment gate — 6 November 2026

A new Vercel Preview deployment was requested for the latest branch after the source and regression checks passed. Vercel rejected deployment creation with HTTP 402 `api-deployments-free-per-day` and a 24-hour retry window (more than 100 deployments). The most recent READY deployment currently listed was built from commit `e0177880`, which predates the final Phase 1 implementation commits. Therefore the current source changes are **not yet deployed** and no deployed browser/media matrix has been claimed. Production has not been touched.

After the Vercel quota resets, create a Preview from the current `feat/labs-platform-integration` HEAD, verify the full Next.js build, then run the real portrait/landscape/square/GIF/MP4/WebM browser matrix and Like/source-access/static-detail checks. Do not begin Monaco phases until this Preview gate is green.


## Phase 2 implementation progress — 6 November 2026

**Shared Monaco foundation implemented; source reader/creator integration intentionally not started.**

Implemented:
- Pinned `@monaco-editor/react@4.7.0` and `monaco-editor@0.57.0`. The wrapper package's published peer dependency range includes React 19; the app's React/React DOM remain pinned at 19.2.8.
- Added `src/app/components/labs/code/LabCodeEditor.js`: client-only dynamic Monaco surface, explicit read-only/editable contract, theme tokens, line numbers, folding, 2-space indentation, 13px editor font, 22px line-height, word-wrap/minimap options, stable model path, and a plain-text fallback for failed loader/component initialization.
- The wrapper is read-only by default. It only enables editing when `readOnly={false}` and a real `onChange` callback are both supplied.
- Added `src/app/lib/labs/code-editor-config.mjs` for the existing source-language → Monaco-language map, URI/model-path identity and editor option defaults. Existing server-side source-file validation was not modified.
- Added `scripts/copy-monaco-assets.mjs`. It self-hosts the pinned Monaco AMD `min/vs` assets at `public/monaco/vs`; `predev` and `prebuild` run the copy before Next.js starts/builds. The editor loader is configured to `/monaco/vs`; no public CDN is used.
- Added `tests/labs-monaco-config.test.mjs` with six tests for all current Labs languages, fallback language, stable version/file/scope model URIs, safe path encoding and read-only/editable option behavior.
- Added `test:labs-monaco` to `npm run build` before the existing media, analytics, SEO and Next.js build checks.

Validation in a clean, non-persistent Vercel Sandbox:
- `npm install` completed after reconciling the repository's existing incomplete lockfile.
- Monaco foundation tests: 6/6 passed.
- Media tests: 9/9 passed.
- Existing Labs analytics tests: 15/15 passed.
- ESLint passed for the new editor component, language/model helper, asset-copy script and Monaco tests.
- SEO validation passed with zero warnings.
- Next.js 16.4.3 production build passed; static page generation completed and the `/labs`, `/labs/[slug]`, admin source, publish and poster API routes compiled.
- `prebuild` copied self-hosted Monaco assets successfully. Local Next server returned HTTP 200 for `/monaco/vs/loader.js`, `/monaco/vs/editor/editor.main.js` and `/monaco/vs/language/typescript/ts.worker.js`.

**Still intentionally pending:**
1. Phase 3: replace the public `pre/code` source rendering with `LabCodeEditor readOnly` only after server authorization succeeds; keep current file tabs, full-file Copy and source event calls.
2. Phase 4: replace the Studio textarea with `LabCodeEditor editable` while keeping the existing React `files` state and `updateSelected()` flow authoritative. Run must continue to execute unsaved content, Save Draft and Build & Publish must use the exact final text.
3. Phase 5: migrate historical code rendering to read-only Monaco with immutable version/file model IDs; restore continues to create a new draft.
4. Browser-test an actual mounted Monaco editor and workers with CSP in the deployed Preview. The local asset HTTP checks confirm file serving, not yet keyboard/editing behavior in a real browser session.

**Non-regression:** this phase did not import Monaco into `LabSourceAccess` or `LabSourceEditor`. Existing textarea/file management, protected source authorization, copy tracking, Run, Save Draft, version restore, Build & Publish, artifact capture, Like behavior and public detail non-executable contract are unchanged.


### Preview deployment and browser QA status — 6 November 2026

A Git-connected Preview deployment built successfully with the Phase 1 and Phase 2 application commits:
- Deployment: `dpl_Bc3VjAQq9Z5mQv7JEhor5ybH3z4F`
- Deployment URL: `https://vishal-kumar-choudhary-frontend-developer-g7r618r2m.vercel.app`
- Deployed source commit: `aecc1fb0ebeeaeac37a71c88c755b0563d8db140` (the branch's later HEAD `4aa63b667a0154fa16ca5b687fbb7dc53232f8ea` adds only documentation).

The deployment build is READY. The browser inspection of `/labs/spotlightdock` reached Vercel's deployment-protection login page (HTTP 200 login HTML) instead of the application, so the browser automation could not inspect authenticated page content. This is an access gate, not an application rendering result. Phase 1 deployed visual acceptance remains pending until the owner opens the protected Preview while authenticated or provides an accessible Preview session.

Phase 2 was validated by clean-checkout npm install, all unit suites, ESLint, full Next.js production build, and same-origin HTTP 200 checks for the local Monaco loader, editor entrypoint and TypeScript worker. An actual mounted Monaco browser interaction test is still pending because the component has not yet been integrated into the source reader or creator; those are later phases.


## Phase 3 implementation progress — 6 November 2026

**Protected public source viewer migrated to shared read-only Monaco.**

Implemented in `src/app/components/labs/detail/LabSourceAccess.js`:
- Replaced the old `pre/code` renderer with `LabCodeEditor`.
- Monaco mounts only in the existing `state === "loaded" && source` branch. Guest, unverified, unpublished, session-mismatch, loading and error states do not mount the editor.
- No server authorization logic or source endpoint changed. Initial source still comes from `getAuthorizedLabSource` in the Server Component; subsequent loads still use the existing protected `/source` endpoint.
- Existing file tabs and selected-file state remain unchanged. The active file's original path and validated source language are passed to Monaco.
- Reader identity is scoped by `scope="reader"`, experiment slug, published source version and file path.
- Monaco is explicitly read-only; the public reader does not provide an `onChange` callback.
- Reader uses `keepCurrentModel={false}` so the editor model is disposed when a protected source view unmounts (including session invalidation). The wrapper retains its normal configurable model behavior for the later creator integration.
- Theme follows the resolved application light/dark theme.
- Existing Copy file action still calls `navigator.clipboard.writeText(file.content)` on the exact validated selected file and records the same `code_copy` event with version and path. It does not copy a formatted/editor projection.
- Existing `source_open` event, periodic session revalidation, auth-event invalidation, retry flow, guest CTA and email verification state are unchanged.
- No executable workspace/iframe/runtime was added to the public detail page.

Added `tests/labs-protected-source-reader.test.mjs` with five build-time contract tests covering authorized render gating, version/file model identity, exact full-file copy and code-copy event, session invalidation and removal of the previous pre/code renderer. The `test:labs-source-reader` script is now part of every production build.

### Phase 3 verification — 6 November 2026

- Monaco config tests: 6/6 passed.
- Protected source-reader contract tests: 5/5 passed.
- Media tests: 9/9 passed.
- Labs analytics tests: 15/15 passed.
- ESLint passed for `LabSourceAccess.js`, `LabCodeEditor.js`, the editor config helper and the new source-reader test.
- SEO validation passed with zero warnings.
- Clean-checkout Next.js 16.4.3 production build passed, including static page generation and all Labs source/publish routes.
- Public source API route and source-event API route remain unchanged.

**Still pending for full Phase 3 acceptance:**
1. Verify an authenticated user opening the protected Preview sees Monaco and the correct active file; direct browser access to the Vercel Preview is protected by Vercel Authentication, and this check sandbox did not have an installed Chromium binary.
2. Verify guest and unverified sessions do not load Monaco assets or receive source content.
3. Verify copy and source_open/code_copy analytics in a real authenticated browser session.
4. Verify theme switching, mobile sizing, keyboard navigation and reduced-motion behavior in the deployed Preview.

No owner editor textarea, version-history viewer, file-management control, Run, Save Draft or Build & Publish handler was changed in Phase 3.


### Phase 3 Preview build status — 6 November 2026

Vercel created a Git-connected Preview deployment from the Phase 3 application commit:
- Deployment: `dpl_332fozxc8GV3xKgNnVH3Jc2LYcgH`
- URL: `https://vishal-kumar-choudhary-frontend-developer-cpjm10w6g.vercel.app`
- Source commit: `bfb87df8b394a04293d7894b9f0d1289887f2dfd`
- State: `READY`

The deployment contains the protected Monaco source reader, source-reader contract tests and build-script change. The latest branch HEAD includes later documentation-only commits. Authenticated browser inspection is still pending because Vercel deployment protection redirects unauthenticated requests to its sign-in page. The owner should open the Preview while signed in to verify the protected source, Copy action, session invalidation and themes.


## Phase 4 implementation progress — 6 November 2026

**Owner Source Creator migrated from textarea to shared editable Monaco.**

Implemented in `src/app/components/labs/admin/LabSourceEditor.js`:
- Replaced the controlled source `textarea` with shared `LabCodeEditor` in editable mode.
- Monaco is keyed by owner scope, experiment slug, `working-copy` version and selected file path. Existing language selection drives syntax highlighting.
- Theme follows the application's resolved light/dark theme. The editor uses line numbers, folding, two-space indentation, 13px monospace text, 22px line-height, no minimap and horizontal scrolling by default.
- Existing file path and language controls, files sidebar, starter templates, import, rename, add, remove, reorder and file limits remain in place.
- Added path-addressed `updateFileContent(filePath, content)`; a rapid selected-tab change cannot redirect a pending Monaco onChange update to a different index.
- Added `filesRef` as a synchronous mirror of the existing React `files` state. All working-copy writes flow through one `commitFiles` function, which updates the ref and then React state. React `files` remains the only rendered/business state; the ref is used for immediate snapshots only.
- Save Draft captures `filesRef.current` before validation and request construction, and persists that exact immutable snapshot.
- Build & Publish captures `filesRef.current`, calculates dirty state from that snapshot, saves it first when required, and publishes the exact version ID returned by the save request.
- `LabSourceLivePreview` receives a getter for the current working copy and captures it at the moment Run is clicked. Run remains separate and does not save/publish or capture the poster.
- During Save, Restore and Publish, Monaco becomes read-only and path/language controls are disabled. This prevents additional edits from racing an in-flight snapshot. Run leaves the editor editable and runs the snapshot taken on click.
- Existing Discard, refresh/restore, version history, audit, media library, console, isolated iframe, publishing confirmation, error/toast, unpublish and delete controls remain in place.
- No compiler service, preview API, save API, version schema or release pipeline was rewritten.

Added:
- `src/app/lib/labs/source-editor-state.mjs` — pure path-addressed working-copy update helper.
- `tests/labs-source-creator-monaco.test.mjs` — 8 contract tests for editable Monaco, single React files-state write path, Save Draft snapshot, Build & Publish exact-version snapshot, Run snapshot, preserved file/runtime controls and in-flight locking.
- `tests/labs-source-editor-state.test.mjs` — 4 tests for path isolation, same-value identity, rapid tab change safety and invalid inputs.
- `test:labs-source-creator` is included in every production build.

### Phase 4 verification — 6 November 2026

- Monaco foundation: 6/6 passed.
- Protected source reader: 5/5 passed.
- Source creator contract/state: 12/12 passed.
- Media: 9/9 passed.
- Labs analytics: 15/15 passed.
- ESLint passed for the editor, live preview, shared Monaco component, state helper and creator tests.
- SEO validation passed with zero warnings.
- Clean-checkout Next.js 16.4.3 production build passed; all 17 static pages generated and all Labs source, preview, publish, poster and runtime routes compiled.
- `prebuild` copied self-hosted Monaco assets successfully.

**Still required before full Phase 4 acceptance:**
1. Authenticated owner browser QA on the protected Preview: type JS/JSX/TS/TSX, switch files, change language, add/import/rename/remove/reorder and verify the correct file is edited.
2. Type and immediately click Run; verify the request includes the latest keystroke and the temporary preview/console still work.
3. Type and immediately Save Draft; verify the saved content hash/version contains the latest keystroke.
4. Type and immediately Build & Publish; verify the new immutable draft contains the latest text and the release uses that exact version ID.
5. Verify editor and metadata controls lock during save/restore/publish and remain editable again on completion/failure.
6. Verify Discard and Restore update both Monaco models and the React working copy without changing immutable historical versions.
7. Verify theme switching, keyboard shortcuts, large source files, worker startup, responsive editor sizing and the plain-text fallback in the deployed Preview.

The version-history modal still uses its existing read-only plain code view and is reserved for Phase 5. Production remains unchanged until explicit release approval.


### Phase 4 deployment gate — 6 November 2026

The Phase 4 branch source and full production build are green, but a Preview containing the final owner Monaco integration has not yet been created. The latest Vercel `READY` Preview visible is `dpl_GsN5vUQXZi9hEzkvXaZxFuEe5TeQ` from code commit `741ba0a96edf4542e152f0bf435db05f81c6c5d2`, which predates the final creator integration and the subsequent Run/Save/Publish synchronization changes.

A new Preview request from the current branch was rejected with HTTP 402 `api-deployments-free-per-day` and a 24-hour retry window (more than 100 deployments). The CLI fallback was checked but is unavailable in the validation sandbox (`vercel` CLI is not installed and the clone is not linked to the Vercel project). No billing/security settings were changed and Production was not touched.

After the quota resets, deploy the current `feat/labs-platform-integration` HEAD to Preview and verify the owner browser journey listed in Phase 4 acceptance: final-keystroke Run, Save Draft content hash, Build & Publish exact version ID, file operations, discard/restore, busy-state locking, editor theme, keyboard behavior and fallback. The clean sandbox build is not a substitute for this deployed owner QA.


## Phase 5 implementation progress — 7 November 2026

**Immutable version-history source viewer migrated to read-only Monaco.**

Implemented in `src/app/components/labs/admin/LabSourceEditor.js`:
- Replaced the historical modal's plain `pre/code` block with shared `LabCodeEditor`.
- The modal retains the immutable version label, full content hash, file tabs, active-file path and language labels, and the existing Restore as new draft action.
- Historical editor mode is explicitly read-only and has no `onChange` handler.
- Monaco model identity is scoped with `scope="history"`, experiment slug, the stored immutable `previewVersion.versionId` and the exact historical file path. It cannot collide with the editable creator's `working-copy` or another historical version/file.
- Historical content and language are passed directly from the owner-authorized version snapshot returned by the existing API. No formatting or content mutation is performed.
- `keepCurrentModel={false}` ensures the historical Monaco model is disposed when the modal closes/unmounts. File switching selects the corresponding version-scoped model.
- The existing owner-authorized version GET route and source-management snapshot lookup were not changed.
- Restore still calls the existing `restoreVersion` flow and `/restore/[versionId]` endpoint. The restore service copies the selected immutable version's stored files into a newly saved draft with `basedOnVersionId` pointing to the historical version. No historical record is edited.

Added `tests/labs-source-history-monaco.test.mjs` with six checks for shared read-only Monaco, history/version/file model isolation, historical file-tab/content behavior, model cleanup on modal close, Restore ancestry/new-draft semantics and owner authorization/immutable snapshot response. Added `test:labs-history` to the production build script.

### Phase 5 verification — 7 November 2026

- Monaco foundation: 6/6 passed.
- Protected source reader: 5/5 passed.
- Source creator contract/state: 12/12 passed.
- Version-history Monaco: 6/6 passed.
- Media: 9/9 passed.
- Labs analytics: 15/15 passed.
- ESLint passed for the source editor, shared Monaco component, editor config and history test.
- SEO validation passed with zero warnings.
- Clean-checkout Next.js 16.4.3 production build passed; all 17 static pages generated and all Labs routes compiled.
- Self-hosted Monaco assets copied successfully by `prebuild`.

**Still pending for full Phase 5 acceptance:**
1. Open a Vercel Preview while authenticated as the owner and verify historical versions load without altering current working-copy text.
2. Switch across several files and different immutable versions; confirm the correct source, language and content hash each time.
3. Close/reopen the modal and confirm no stale historical model leaks into the next view.
4. Restore an older version and confirm it creates a new draft while the original version/hash stays unchanged.
5. Verify keyboard navigation, light/dark themes, modal sizing on mobile/tablet/desktop and the plain-text fallback if Monaco assets fail.

Phases 1–5 are implemented in branch source. Phase 6 (responsive/accessibility/performance polish) and Phase 7 (full Preview and owner workflow regression) remain. Production has not been promoted.


### Phase 5 Preview status — 7 November 2026

Vercel has a `READY` Git Preview for the version-history Monaco UI commit:
- Deployment: `dpl_7m599mPvgivpTsG5ZgWKxWPdMD6g`
- URL: `https://vishal-kumar-choudhary-frontend-developer-94p8uczn7.vercel.app`
- Source commit: `28635a34c416d4e84a912ac96d75b6a88f68a036`

A second Preview `dpl_42Dy8FHJ8A8NymU1JxWRWjue4Y8J` is READY for the initial history test file commit `47e74bb5b62687c7f87c380525d7538c868ea384`. The subsequent `package.json` build-script commit `2372ae486315c701e05c67ed8858d00967191cd2` produced an ERROR because the first version of the new Restore ancestry test asserted against the UI file instead of the source-management service. That assertion was corrected in `175e31ae9d0e95d9574453cafed324deecb889b5`; the current branch clean-checkout production build, including every test suite, now passes. No Vercel deployment is listed yet for the corrected test commit or later documentation commits, so the exact current HEAD still needs a fresh READY Preview before release acceptance.

The Preview is protected by Vercel Authentication. Owner must open it while signed in to complete the Phase 5 modal/file-switch/restore browser matrix. Production has not been changed.

## 14. Current implementation reconciliation — 7 November 2026

The implementation state table near the beginning of this plan is the current summary. Some older phase logs below record the point in time when Monaco had not yet been integrated or the detail-page media layout had not yet landed. They are retained as history and are not current implementation instructions.

Current branch state:
- Shared LabCodeEditor and self-hosted Monaco assets are integrated.
- Protected public source reader is read-only Monaco.
- Owner Source Creator is editable Monaco; React files state remains authoritative.
- Historical source-version viewer is read-only Monaco.
- Plain-text fallback remains for Monaco/worker failure.
- Public /labs/[slug] remains static/non-executable. The detail route does not mount LabWorkspace, LabRuntimeBoundary or a published artifact iframe.
- Owner Run, Build & Publish, immutable artifacts and artifact delivery endpoint remain separate infrastructure.
- The full media-role migration (ordered detail-gallery and gallery-preview/detail-gallery/runtime-fallback attachment roles) remains pending; the current schema is galleryPreview plus at most one fallback-preview attachment.

Do not revert the current editor to textarea-only based on old phase notes. Do not add public experiment execution based on old ADR/runtime goals. See Section 39 of LABS-AND-AUTHENTICATION-DESIGN-SPEC.md for accepted 7 November product decisions and PROJECT-STATUS.md for current code mismatches.
