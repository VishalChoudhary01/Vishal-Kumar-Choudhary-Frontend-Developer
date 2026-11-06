# Labs Experiment Studio — Runtime, Publishing and Media Contract

**Branch:** `feat/labs-platform-integration`  
**Reconciled:** 6 November 2026

This file is the concise source of truth for Labs runtime, release and media behavior. The public detail-page presentation and Monaco migration are planned separately in **[Labs Detail Presentation and Monaco Editor — Phased Implementation Plan](./LABS-DETAIL-PRESENTATION-AND-MONACO-EDITOR-IMPLEMENTATION-PLAN.md)**.

## 1. Implemented capabilities

| Area | Status | Current behavior |
|---|---|---|
| Owner source creator | Implemented | File management, private drafts, versions, Run and Build & Publish |
| Isolated code Run | Implemented | Runs current working-copy files, including unsaved changes, in a temporary sandbox and separate-origin preview |
| Compiler | Implemented | React 19, JSX/TSX, Motion, Tailwind CSS v4, Lucide and React Icons |
| Draft/version management | Implemented | Private immutable versions and content hashes |
| Release publishing | Implemented | Builds exact saved version; public pointer switches only after successful artifact build |
| Artifact storage | Implemented | Unique artifact-ID Blob namespace; immutable files |
| Automatic poster | Implemented | Captures exact compiled artifact during publishing; does not run on editor Run or public page requests |
| Poster validation | Implemented | Pinned Playwright/Chromium; PNG signature, size, dimensions, renderer version and SHA-256 checked |
| Owner poster status | Implemented | Owner media endpoint returns current published artifact's poster status; panel can display preview and diagnostics |
| Uploaded media | Implemented | Private Cloudinary upload/verification and explicit owner promotion to public Blob |
| Public media selection | Locked | Uploaded image/GIF/video → generated screenshot → existing artwork |
| Public gallery query | Implemented | Published source and exact matching ready artifact required |
| Public detail page | Static | No executable workspace, runtime iframe or built-in demo |
| Likes | Implemented | Existing LabLikeButton and engagement API |
| Protected source access | Implemented | Verified-email authorization, session checks, file selection and copy action |
| Media sizing polish | Phase 1 code committed; QA pending | DTO carries intrinsic dimensions; all shared media uses contain; detail stage uses natural height and a bounded responsive maximum |
| Monaco foundation | Implemented | Stable React 19 wrapper, self-hosted assets, read-only public reader and editable creator modes, plain-text fallback and regression tests |
| Detail layout polish | Planned | Improve section order and spacing while preserving Like and source access |

## 2. Run, Save Draft and Build & Publish must remain separate

### Run
- Executes the current owner working copy, including unsaved changes.
- Uses the temporary isolated sandbox and preview iframe.
- Returns bounded build diagnostics and run-scoped console messages.
- Does not save a draft, publish an artifact or capture a poster.
- Preview expiry/cleanup does not affect saved versions or the live release.

### Save Draft
- Validates file paths, languages, file count and byte limits.
- Creates a private immutable version and content hash.
- Does not publish or create a public artifact.
- Preserves version history and audit behavior.

### Build & Publish
1. Validate the current editor files.
2. If dirty, save those exact files as a private immutable version.
3. Verify the exact saved version ID and content hash.
4. Compile using the pinned isolated compiler.
5. Validate and upload output files to an artifact-ID-specific immutable namespace.
6. Attempt automatic poster capture from the exact compiled output.
7. Persist artifact and poster metadata/status.
8. Switch the published source/artifact pointer only after the release artifact is valid.

The previous published release remains live if compilation, upload or publish fails. Poster capture is optional and non-blocking; failure records an unavailable status/reason and must not invalidate a successful code release or reuse a previous artifact's poster.

## 3. Compiler and sandbox contract

- Compilation runs outside the Next.js application process in Vercel Sandbox.
- Dependencies are pinned in `tools/labs-compiler/package.json` and its lockfile.
- No user package installs, custom build scripts, arbitrary plugins or package manifests.
- No application, database, authentication, Cloudinary or Blob secrets are exposed to user-authored code.
- Build and preview workers deny outbound network access.
- Temporary workers are non-persistent. Stopping them must not create a new automatic snapshot.
- File count/size, output size, CPU, memory, wall-clock time and diagnostics remain bounded.
- Snapshot refresh is an explicit maintenance operation and never silently changes Production configuration.

Detailed compiler architecture and acceptance tests are in **[Labs React JSX/TSX/Tailwind/Motion Runtime Plan](./LABS-REACT-JSX-TSX-TAILWIND-MOTION-RUNTIME-PLAN.md)**.

## 4. Automatic release poster contract

- Capture happens during Build & Publish after the exact release output is compiled and before the release sandbox stops.
- The capture worker serves the built output on loopback; browser requests to external hosts are blocked.
- Current Preview renderer pin: Playwright 1.65.0 and Chromium 158.0.8127.18.
- Capture viewport is 1200×900 (4:3), with bounded page/font/layout settling and reduced-motion emulation.
- Blank output, JavaScript page errors, browser/version mismatch, invalid PNG, incorrect dimensions, excessive size and timeouts are capture failures.
- A successful PNG is hashed and stored at an immutable path containing experiment slug, source version, build hash and artifact ID.
- Poster metadata is stored on the matching immutable LabBuildArtifact and delivered only when artifact/source-version pointers still match the current published release.
- Capture failure is recorded for owner diagnostics; it does not fail otherwise successful publishing.

## 5. Public media precedence — locked

Identical policy for gallery cards, featured experiment and project detail:

1. Explicitly owner-promoted image, animated GIF, MP4 or WebM bound to the current published artifact/source version.
2. Generated PNG screenshot from that exact artifact.
3. Existing Labs artwork fallback.

Private/unpromoted uploads never become public. A later release invalidates an older uploaded-media binding until the owner promotes media for the new artifact.

Presentation requirements:
- Never stretch media; preserve intrinsic aspect ratio.
- Do not use universal `object-cover` cropping.
- GIF remains animated unless reduced motion is requested.
- Video is muted, inline and looped; generated still remains available for metadata/social preview.
- Broken uploaded media falls back to generated screenshot, then artwork.

Upload/promotion details are in **[Labs Media Pipeline Phase 1](./LABS-MEDIA-PIPELINE-PHASE-1.md)**.

## 6. Public detail page — locked static behavior

The detail page is a project presentation, not a playground. It shows:
- Back navigation, category, title, description and technologies.
- Existing Like/engagement component.
- Selected uploaded media or generated poster.
- Experiment explanation.
- Protected source access for eligible verified accounts.

It must not mount LabWorkspace, LabRuntimeBoundary, an artifact iframe or any executable experiment runtime. The owner source creator's Run preview remains available. Do not delete compiler/runtime infrastructure as part of the public detail-page change.

## 7. Monaco source reader/editor — planned, not yet implemented

The phased implementation plan is **[here](./LABS-DETAIL-PRESENTATION-AND-MONACO-EDITOR-IMPLEMENTATION-PLAN.md)**.

Mandatory non-regression rules:
- Public source reader: read-only Monaco, loaded only after existing verified-email authorization succeeds.
- Owner creator: editable Monaco.
- Historical version viewer: read-only Monaco.
- Existing React `files` state remains authoritative; Monaco is only the editor surface.
- Save Draft, Run and Build & Publish must use the exact current text, including the final keystroke.
- Add/import/rename/remove/reorder, language selection, validation, dirty state, discard, history, restore, Run/console, publish/unpublish, audit and delete behavior must remain intact.
- Monaco is client-only, lazy-loaded and self-hosted; it is independent of compiler sandbox dependencies.
- A usable plain-text fallback remains if Monaco or its worker fails to load.

## 8. Preview release verification gates

Before calling a Preview complete:
- Test Run with unsaved JS/JSX/TS/TSX content.
- Test Save Draft, discard, history and restore.
- Test Build & Publish exact-version binding and previous-release preservation.
- Confirm screenshot capture occurs during publish only.
- Test image/GIF/video media sizing across portrait, square and landscape on mobile/tablet/desktop.
- Confirm uploaded → generated poster → artwork precedence and stale artifact rejection.
- Confirm guest/unverified users never receive source content.
- Confirm Like, file tabs, copy, session revalidation and source events.
- Confirm public detail makes no executable iframe/runtime request.
- For Monaco, test file switching, import/reorder/rename/remove, last-keystroke synchronization, save/discard, Run, history/restore and publish.
- Run a deployed Preview owner browser journey; sandbox-only tests are not a substitute.

Production remains unchanged until explicit release approval.

## 9. Related plans

- **[Detail layout, media sizing and Monaco phases](./LABS-DETAIL-PRESENTATION-AND-MONACO-EDITOR-IMPLEMENTATION-PLAN.md)**
- [React JSX/TSX, Tailwind and Motion runtime](./LABS-REACT-JSX-TSX-TAILWIND-MOTION-RUNTIME-PLAN.md)
- [Media upload and promotion pipeline](./LABS-MEDIA-PIPELINE-PHASE-1.md)
- [Preview Run recovery and snapshot lifecycle](./LABS-PREVIEW-RUN-RECOVERY-AND-SNAPSHOT-LIFECYCLE.md)


## 10. Phase 1 media presentation progress — 6 November 2026

The current feature branch now stores verified uploaded-media dimensions with the published gallery media reference and exposes them in the public experiment DTO. The generated poster DTO carries its fixed 1200×900 dimensions. Shared gallery, featured and detail preview elements use aspect-ratio-safe contain fitting; browser-measured dimensions cover older media records. Public detail no longer forces a 4:3 mobile / 16:9 desktop media box and uses a bounded natural-height preview. The existing Like, source-access, Run, Save Draft, Build & Publish, artifact and poster-capture flows were not changed in this phase.

Regression tests were added for the generated poster, portrait image, GIF, video, invalid upload fallback and empty fallback. The root production build invokes this media suite before Labs analytics and SEO checks. Preview/browser verification is still required before marking the phase complete.


Phase 1 regression update (6 November 2026): the new media suite passed all 9 test cases, and the existing Labs analytics test suite also passed in a fresh disposable validation sandbox. JSX/JavaScript syntax checks passed for all changed app modules. Latest Vercel READY deployment observed was built from earlier commit e0177880; current branch code still requires a Preview build and real browser verification before Phase 1 is accepted.


## 11. Phase 1 and Phase 2 implementation status — 6 November 2026

### Phase 1 — media sizing and detail layout

Implemented in source:
- Uploaded media dimensions are stored and exposed in the public preview DTO; generated posters carry 1200×900 dimensions.
- Shared Labs preview renderer uses non-cropping contain fit, browser-measured intrinsic dimensions for legacy assets and upload → screenshot → artwork failure fallback.
- Public detail page uses a natural-height media stage with a responsive maximum instead of forcing all media into 4:3/16:9.
- Detail header and explanation spacing adjusted.
- Existing Like, explanation and protected source sections preserved.
- Nine media regression tests and 15 Labs analytics tests pass.

Still pending: deployed Preview build from the current branch and visual QA of portrait/landscape/square/GIF/MP4/WebM, Like, source access and static detail behavior. Production remains untouched.

### Phase 2 — shared Monaco foundation

Implemented:
- Stable versions `@monaco-editor/react@4.7.0` and `monaco-editor@0.57.0`; React/React DOM remain 19.2.8.
- Client-only shared `LabCodeEditor` component with read-only default, editable mode requiring `onChange`, theme definitions, line numbers, folding, model IDs scoped by source/file/version, options and plain-text fallback.
- Language mapping for existing Labs file types in `code-editor-config.mjs`.
- Local Monaco assets copied from the pinned package to `public/monaco/vs` by `predev` and `prebuild`; loader configured to the local path.
- Six Monaco configuration tests pass; ESLint passes for the new component/config/asset script/tests.
- Full clean-checkout Next.js production build passed, including media/analytics/SEO checks. Local Next.js server returned HTTP 200 for the Monaco AMD loader, editor entrypoint and TypeScript worker files.

Not yet implemented: replacing the public source reader, owner textarea or version-history viewer with Monaco. Those remain Phases 3–5 in the separate [Detail Presentation and Monaco Editor plan](./LABS-DETAIL-PRESENTATION-AND-MONACO-EDITOR-IMPLEMENTATION-PLAN.md).

**Non-regression:** Phase 1/2 did not change compiler, temporary Run, draft APIs, version history, restore, publish, poster capture, protected source authorization, Like API or public detail executable policy.


Phase 1/2 Preview note (6 November 2026): Vercel Preview deployment `dpl_Bc3VjAQq9Z5mQv7JEhor5ybH3z4F` is READY and includes the application code for both phases. Direct browser QA reached the Vercel deployment-protection sign-in screen, so deployed visual inspection of the protected preview remains an owner-authenticated acceptance step. Phase 2 clean-checkout install/build, 6 Monaco tests, 9 media tests, 15 analytics tests, ESLint and same-origin Monaco asset HTTP checks passed. Monaco has not yet been integrated into the public reader, Studio editor or version-history viewer; Run, Save Draft and Build & Publish remain unchanged.


## 12. Phase 3 — protected public source viewer migration — 6 November 2026

The public source viewer now uses the shared `LabCodeEditor` in read-only mode. It mounts only inside the existing authorized loaded-source state; guest, unverified and all non-loaded states do not render the editor. The server-side `getAuthorizedLabSource` resolution, protected source endpoint, verified-email/session revalidation and auth event invalidation are unchanged.

File tabs still select the existing source files. The reader's Monaco model identity uses experiment slug, source version and file path and sets `keepCurrentModel={false}` so the protected model is disposed when the source view unmounts. Theme follows the app's resolved light/dark theme.

The existing Copy action still copies the full original `file.content` via the Clipboard API and records the existing `code_copy` event with the same source version and file path. The `source_open` event is unchanged.

Five protected-source reader contract tests were added and are included in every production build. Phase 3 validation passed: Monaco 6/6, source-reader contracts 5/5, media 9/9, Labs analytics 15/15, ESLint and the full clean-checkout Next.js production build.

Remaining acceptance is authenticated Preview browser QA for reader rendering, guest/unverified no-source behavior, actual clipboard/event behavior, themes, mobile sizing and keyboard navigation. No source creator textarea, Run, Save Draft, version restore, Build & Publish or compiler flow was changed. See the [Phased Detail and Monaco plan](./LABS-DETAIL-PRESENTATION-AND-MONACO-EDITOR-IMPLEMENTATION-PLAN.md) for Phases 4–7.


Phase 3 Preview deployment: Vercel deployment `dpl_332fozxc8GV3xKgNnVH3Jc2LYcgH` is `READY` from code commit `bfb87df8b394a04293d7894b9f0d1289887f2dfd` and includes the protected read-only Monaco source reader. Authenticated browser interaction QA remains pending because the Preview is protected by Vercel Authentication. The owner should verify signed-in file switching, exact full-file Copy, source events, session invalidation, guest/unverified denial and theme behavior on that Preview. Production remains unchanged.


## 13. Phase 4 — owner Source Creator editable Monaco migration — 6 November 2026

The owner source creator now renders the shared `LabCodeEditor` in editable mode instead of the source textarea. React `files` state remains authoritative. All state writes pass through a single `commitFiles` function that updates React state and a synchronous ref mirror. The ref is used to capture the newest working-copy snapshot synchronously for Save Draft, Run and Build & Publish; it is not a second persistence store.

Monaco changes update the file by stable path via `updateFileContent`, avoiding index-based stale updates when switching tabs rapidly. The editor uses the existing source language selector, experiment/file-scoped working-copy model, and resolved app theme. The existing file list, add/import/rename/remove/reorder, templates, validation, size limits, unsaved state, discard, history, restore, audit, media library, console and isolated preview remain in place.

Run now calls the existing preview API with the current ref snapshot taken when Run is clicked, including unsaved content. It remains independent from Save Draft and Build & Publish. Save Draft captures one immutable files snapshot and persists that exact snapshot. Build & Publish captures the current snapshot, checks dirty state against the saved source, creates a private draft when needed, then publishes the exact returned version ID. The editor and file path/language controls lock during Save, Restore and Publish so later edits cannot race the in-flight snapshot. Run leaves editing enabled and compiles its click-time snapshot.

Added `src/app/lib/labs/source-editor-state.mjs`, 8 creator contract tests and 4 path-update helper tests. The production build now includes the `test:labs-source-creator` suite.

Phase 4 validation passed: Monaco 6/6; protected source-reader 5/5; creator contract/state 12/12; media 9/9; Labs analytics 15/15; ESLint; SEO (zero warnings); and a clean Next.js 16.4.3 production build with all Labs routes compiled.

Owner browser QA is still required on the Vercel-protected Preview: editing across supported languages and multiple files, Run with unsaved latest keystroke, Save Draft exact content hash, Build & Publish exact saved version ID, in-flight locks, Discard/Restore synchronization, theme/keyboard behavior, large files and fallback. The version-history viewer remains a plain read-only content view and is Phase 5. The compiler, temporary Run runtime, save/publish APIs, poster capture timing and artifact pipeline were not rewritten in Phase 4.
