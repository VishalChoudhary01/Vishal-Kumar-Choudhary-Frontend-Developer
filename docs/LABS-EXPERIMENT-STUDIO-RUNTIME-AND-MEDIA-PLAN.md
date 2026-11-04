# Labs Experiment Studio — Runtime, Media and Publishing Plan

**Status:** Approved implementation source of truth. Media upload/owner preview and the isolated compiler prototype are implemented and smoke-tested; the public preview runtime and release pipeline remain disabled.  
**Applies to:** Owner-created experiments in Labs, while preserving the four existing code-owned experiments.  
**Primary implementation branch:** feat/labs-platform-integration  
**Related source of truth:** LABS-SOURCE-MANAGEMENT-SPEC.md, DESIGN-LAB.md, ARCHITECTURE.md, LABS-EXPERIMENT-STUDIO-PHASE-1.md and LABS-EXPERIMENT-STUDIO-PHASE-2.md.

---

## 1. Product outcome

The Studio is an owner-only creative coding workspace. The owner must be able to create an original experiment, write or import its code, attach image/GIF/video assets, run the actual interactive experience, inspect errors, save immutable drafts and publish a complete release.

The public experience is an actual interactive code runtime. A published experiment detail page must render that runtime at its intended size. Optional image/GIF/video fallback media appears only when the runtime cannot run or is unsupported; it is never a substitute for a working code preview.

The four existing code-owned experiments remain supported by the existing literal runtime registry. Owner-created experiments use database-backed metadata and versioned source/build records. Creating or publishing a custom experiment must not require editing the repository runtime registry.

## 2. Product surfaces and responsibilities

### 2.1 Owner Experiment Studio

The owner workspace contains:
- Experiment metadata: title, slug, summary, full explanation, category, technologies and publication state.
- File explorer and editor for HTML, CSS, JavaScript and React/JSX source.
- Media library for images, animated GIFs and video clips.
- One optional fallback-media attachment for an unsupported or unavailable code preview.
- Run/Restart controls, desktop/mobile preview sizes, build status, console output and runtime errors.
- Draft save, immutable version history, validation results and explicit publish/unpublish actions.

The editor and compiler dependencies remain lazy-loaded from owner-only routes. They must not enter the homepage or ordinary public Labs listing bundle.

### 2.2 Public Labs listing

Each card may show one selected cover asset: an image, GIF or video poster/preview where the owner chooses it. The card also shows experiment metadata and links to the stable detail route. Do not boot every experiment runtime inside the listing; doing so would create unnecessary CPU, memory and network work.

The interactive code runtime is the experiment. Fallback media is not a listing thumbnail, card cover, gallery or in-experiment asset.

### 2.3 Public experiment detail page

A published detail page provides:
1. Experiment title, description and metadata.
2. The actual interactive runtime, in a responsive preview frame that can expand or use the available detail-page canvas.
3. Optional fallback media, shown only when the code runtime cannot run or is unsupported, with alt text and an optional caption.
4. Like/engagement controls.
5. Protected source viewer for verified logged-in users.

The page loads only the published release. Draft source, preview output, unpublished assets and owner audit data are never serialized into public page payloads.

### 2.4 Protected source viewer

A valid Better Auth session with emailVerified === true can access the published source automatically. Guests and signed-in unverified accounts cannot. The source viewer exposes the text files belonging to the exact published release and offers copy controls. It does not expose unpublished drafts, temporary build logs, secrets or upload credentials.

## 3. Supported authored project contract

### 3.1 Initial project types

The first complete custom runtime should support:
- Standalone HTML/CSS/JavaScript projects.
- React projects written in JavaScript and JSX.

TypeScript and TSX are not part of the first runtime contract. They may be added as a separate compilation target after JavaScript/JSX is stable and explicitly approved.

No server components, server actions, API route handlers, Node.js APIs, backend processes or server-side rendering are available inside an experiment. Experiments are browser-only static applications.

### 3.2 React entry convention

Use a documented template rather than guessing an entry file from arbitrary names:
- index.html — browser document shell and root element.
- src/main.jsx — ReactDOM client entry.
- src/App.jsx — default-exported experiment component.
- src/index.css — Tailwind v4 import and experiment-level styles.
- Additional files under src/ for components, hooks and local utilities.

The compiler must reject missing or ambiguous entry points and report a clear actionable error. A starter template should be available from Create Experiment so the owner does not need to create this structure manually.

### 3.3 Fixed dependency allowlist

The first React/JSX template should provide a preinstalled, version-pinned set of browser packages:
- react and react-dom.
- motion, imported from motion/react.
- lucide-react for icons.
- clsx and tailwind-merge only if the template and bundle policy require them.

These packages already appear in the main repository dependency manifest at the time of this plan, but the compiler environment must pin and independently validate its own approved versions. The browser project cannot choose arbitrary package versions.

The owner must not upload or edit a package manifest that triggers npm install, execute lifecycle scripts, add arbitrary dependencies or load executable packages from a CDN. Additional packages require an explicit allowlist/security review and a controlled toolchain update.

### 3.4 Tailwind CSS v4 contract

Tailwind must be compiled as part of the build. The project stylesheet uses the Tailwind v4 import model, and the build pipeline runs the approved Tailwind v4 PostCSS integration against the complete source snapshot.

Requirements:
- No Tailwind CDN or browser-time script compilation.
- Scan all supported JSX/JS source files in the experiment snapshot so utility classes are generated before preview/publication.
- Support normal Tailwind utilities, responsive/state variants, CSS custom properties, local CSS and approved Tailwind v4 theme customization.
- Do not permit owner-supplied Tailwind plugins, PostCSS plugins, arbitrary build scripts or remote CSS imports in the initial release.
- Dynamic class names must use complete statically discoverable class strings or a finite mapping. Constructing fragments such as bg- + color at runtime cannot be relied upon to generate a utility.
- Build output must include the generated CSS in the immutable artifact.

### 3.5 Motion contract

Motion is available through the fixed motion/react dependency. Motion code runs in the browser preview, not in the portfolio application React tree or on the Next.js server.

- Support the standard React animation components and hooks exported by the pinned Motion version.
- Provide the reduced-motion signal/setting in the experiment runtime contract.
- Respect prefers-reduced-motion and avoid making content or interactions depend on decorative movement.
- Do not give experiments access to the parent page's MotionProvider, Lenis instance, global scroll state or application context.
- Keep animation frame rate, memory and CPU bounded by preview resource limits.

## 4. Build and execution architecture

### 4.1 High-level pipeline

Owner working copy  
→ validate file tree and package/import policy  
→ attach an immutable media manifest  
→ create preview run request  
→ build in an isolated ephemeral build environment  
→ compile JSX/React and local modules  
→ compile Tailwind v4 CSS  
→ emit static HTML, JS chunks, CSS and asset manifest  
→ run artifact in a separate-origin browser sandbox  
→ collect bounded build/runtime diagnostics  
→ save an immutable draft version  
→ publish an immutable experiment release after all gates pass.

Preview and publication use the same deterministic build contract. A successful local-looking preview is not sufficient if the published build is produced by a different compiler, dependency version or asset manifest.

### 4.2 Isolated build worker

Compilation executes arbitrary owner-authored build input and therefore must not run inside a normal Next.js Route Handler, main app server process or privileged Vercel Function context.

The build worker must:
- Start from a prebuilt, immutable toolchain image with pinned compiler and approved dependencies already present.
- Receive only the selected source files, safe metadata and references to approved assets for that run.
- Have no application secrets, MongoDB credentials, Cloudinary API secret, Better Auth cookies, environment variables or production service tokens.
- Have outbound network access disabled during compilation. Package dependencies are preloaded; the build never runs npm install.
- Use an ephemeral filesystem and bounded CPU, memory, execution time, output size and process count.
- Reject path traversal, symlinks escaping the project root, executable lifecycle scripts, dynamic external package imports and unsupported build features.
- Emit structured diagnostics with file path and line/column where available. Logs are bounded and scrubbed; full source contents and secrets are never logged.
- Be terminated after the run and leave no persistent credentials or user-controlled process running.

Vercel Sandbox is a candidate execution provider because the current deployment platform already exposes sandbox capabilities. The final provider, resource ceilings and cost limits remain open until a dedicated architecture/security test proves the required controls and operational availability. Do not silently substitute a normal application server as the compiler.

### 4.3 Deterministic compiler

Use one versioned build toolchain for preview and publish. The implementation may select Vite plus esbuild or an equivalent pinned bundler, but the decision must be recorded before installing compiler dependencies.

The compiler performs:
1. Validate the declared template/entry point.
2. Resolve local project imports only inside the experiment root.
3. Resolve bare package imports only from the fixed dependency allowlist.
4. Reject remote imports, unknown packages, Node built-ins, dynamic external URLs and unsupported import mechanisms.
5. Transform JSX for the pinned React runtime.
6. Bundle React, ReactDOM, Motion and approved utilities into static browser output.
7. Compile Tailwind v4 with the approved PostCSS adapter.
8. Process local CSS and safe asset references.
9. Create an immutable build manifest and SHA-256 content hash.
10. Return build status, safe diagnostics and an artifact reference.

Do not evaluate owner code with eval/new Function in the main app, use Node vm as a security boundary, or dynamically import a MongoDB source string in the application process.

### 4.4 Isolated browser runtime

The compiled experiment is loaded in a sandboxed iframe from a dedicated runtime origin separate from the portfolio application origin. An iframe on the same privileged app origin is not an adequate isolation strategy.

Minimum requirements:
- No application cookies, Better Auth session, localStorage, IndexedDB or parent DOM access.
- Do not grant allow-same-origin, top-navigation, popups, downloads or forms in the initial sandbox policy.
- Use a restrictive Content Security Policy. Scripts and styles are loaded only from the immutable runtime artifact origin and explicitly approved inline/runtime sources required by the build; media loads only from the approved media CDN. connect-src is none by default.
- Block access to the portfolio app APIs and arbitrary external hosts.
- Use a versioned, schema-validated parent/preview message protocol. Bind messages to the exact iframe window and a unique run identifier; reject stale or oversized messages.
- Apply a runtime timeout and provide stop/restart controls. Handle ready, build failure, runtime error, timeout and stopped states.
- Preview cannot read user/session secrets, call owner APIs, publish itself or write arbitrary server data.

The current srcDoc-based HTML/CSS/JS preview is a limited prototype, not proof that this complete isolation boundary has passed security review. Replace or adapt it to the final separate-origin artifact runtime before production publication.

### 4.5 Network and browser capabilities

Default experiment network policy is no outbound fetch/XHR/WebSocket/EventSource access. Do not let code choose arbitrary API hosts or use the visitor's authenticated application session.

If future experiments need remote data, introduce an explicit per-experiment capability declaration, owner review, exact hostname/method allowlist and a controlled proxy with rate/response limits. No server secret or authenticated portfolio endpoint may be exposed through this feature. This is not part of the first runtime release.

The first release should focus on DOM, CSS, pointer/keyboard events, Canvas 2D, SVG created in the DOM and Motion. Web Workers, service workers, WebAssembly, WebGL/Three.js and other higher-resource capabilities need separate limits and security testing before approval.

## 5. Media upload and media library

### Media fallback rule — locked product behavior

The actual interactive code preview is always the primary experiment experience. Images, animated GIFs and videos are optional fallback media only; they are not required when the live code preview builds and runs successfully. The owner may attach at most one fallback item, and it is considered only when the selected runtime is unsupported, a build fails, or the runtime cannot start. A fallback must never replace a working React/JSX or HTML/CSS/JavaScript preview. It is not a card cover, gallery, or in-experiment asset role. Public detail pages should show the working runtime first and display the fallback only in a clearly labelled unavailable/unsupported state. If no fallback is supplied, the normal code-preview error/unsupported state is shown.


### 5.1 Supported user media

Fallback media is optional, not part of the normal happy path. Upload media only when a code runtime cannot be previewed. The upload UI may support:
- Still images: JPEG, PNG, WebP and AVIF.
- Animated images: GIF.
- Video: MP4 and WebM.

SVG uploads are excluded initially because SVG can contain active content and external references. SVG can be reconsidered only with a dedicated sanitizer/rasterization pipeline and security review.

The server validates file signatures/MIME type, extension, declared size, decoded format, dimensions and processing result. Do not trust only the browser filename or Content-Type header.

Exact file-size, video-duration, dimension, per-experiment and per-owner quotas must be derived from the actual Cloudinary account plan and operational tests. Do not invent limits or raise the existing 1 MB source-code snapshot limit to accommodate media. Code and binary media are stored through separate systems.

### 5.2 Upload flow

1. Owner selects an image, GIF or video in the media library.
2. The Next.js server authenticates the owner and validates the requested media class, quota and allowed format.
3. The server creates a short-lived, narrowly scoped signed upload authorization.
4. The browser uploads directly to Cloudinary; the Cloudinary API secret never reaches the browser.
5. A server callback or verified finalize request checks the uploaded asset against the upload intent and provider response.
6. The application records a LabMediaAsset metadata row and marks the asset ready only after validation/processing completes.
7. The owner may optionally attach this single asset as a fallback when the live code preview cannot run or is unsupported, and add alt text/caption. This is not needed for a working code preview.

Never accept a client-supplied Cloudinary public ID as proof of ownership. Verify the upload signature/intent, asset ownership, resource type and allowed folder/prefix on the server.

### 5.3 Media roles

One asset may be attached for one or more explicitly selected roles:
- Fallback preview: one optional image, animated GIF or video shown only when the code runtime cannot run or is unsupported.

The owner can select or clear the single fallback asset and edit its alt text/caption. No gallery, card-cover or in-experiment attachment roles are part of this scope. Clearing an attachment must not delete the underlying asset if a draft or historical release still references it.

Fallback video players use controls and do not autoplay with sound. A video poster may be generated if the selected delivery mode requires one. Animated GIF motion must respect reduced-motion preferences and must not be the only way to communicate essential information.

### 5.4 Runtime media boundary

Fallback media is not imported by experiment source and is not exposed through a virtual asset module. It is resolved by the Labs page only after the code runtime reports a build failure, unsupported template or startup failure. A successful runtime always wins. The compiler's default network policy remains deny-all.

### 5.5 Media privacy and publication

Unpublished fallback assets must not be discoverable through public page payloads or predictable public delivery paths. Owner preview URLs are short-lived and returned only through the owner-only no-store inventory endpoint. Public fallback conversion/access mode remains a release-phase decision; until it is verified, fallback media stays private.

Do not store original media binary payloads in MongoDB. MongoDB stores provider identifiers, safe metadata, ownership, processing state and immutable references. Cloudinary stores and transforms the actual media.

## 6. Versioned data and immutable release model

The existing LabSourceVersion remains the code snapshot record. The complete published experience must pin its metadata and build. If a fallback is attached, that single fallback reference is pinned in the release manifest. No other media manifest is required.

### 6.1 LabExperiment

The existing lab_experiments record remains the mutable owner metadata head: slug, title, description, explanation, category, technologies, lifecycle status, audit actors/timestamps and current publication pointer(s). It must never expose private draft fields through public DTOs.

### 6.2 LabSourceVersion

Retain immutable files, deterministic content hash, file count/byte total, version number, actor and parent/restore lineage. Extend only through a reviewed migration to include safe references needed for deterministic builds; do not store generated binary output here.

### 6.3 LabMediaAsset

Proposed collection for provider-backed assets:
- Stable asset ID.
- Owner user ID derived from the session.
- Cloudinary asset/public identifiers and resource type.
- Verified format, byte size, dimensions and video duration where applicable.
- Processing state: pending, ready, failed or blocked.
- Safe alt text, caption and optional poster asset ID.
- Created/updated timestamps and usage/reference metadata.

Provider credentials and upload signatures are never stored in public DTOs. Asset deletion/cleanup checks references before removing the provider object.

### 6.4 LabBuildArtifact

Proposed immutable build record:
- Build ID and source version ID/content hash.
- Compiler/toolchain version and fixed dependency manifest.
- Artifact content hash, storage key and output size.
- Build status and bounded diagnostics.
- Created timestamp and owner actor ID.

Compiled HTML/JS/CSS output is stored as immutable static artifacts in a dedicated artifact/object store behind the separate runtime origin. Do not store compiled bundles in MongoDB or treat Cloudinary media storage as the default JavaScript artifact store. The artifact storage provider remains an explicit architecture decision.

### 6.5 LabExperimentRelease

Proposed immutable release manifest tying together:
- Experiment slug and a snapshot of public metadata.
- Exact LabSourceVersion ID.
- Exact successful LabBuildArtifact ID.
- Optional single fallback LabMediaAsset ID with role `fallback-preview`, alt text and caption.
- Runtime/toolchain/dependency manifest.
- Server-created content hash, validation result, actor and timestamp.

The experiment's published pointer selects one release manifest. A publish operation updates this pointer only after every referenced record and artifact is ready. A later edit creates a new draft/release; the old published release remains live until the new one is explicitly published.

### 6.6 Temporary preview runs

Preview-run status and short-lived artifacts/logs may use a separate LabPreviewRun record or an equivalent ephemeral job store. Store run ID, owner, source hash, build state, bounded diagnostics and expiration. Apply TTL/cleanup to temporary records and artifacts. Never make a preview-run URL a public permanent release URL.

## 7. Draft, preview and publication lifecycle

1. Create experiment metadata. The record remains private.
2. Add/edit code. Upload image/GIF/video only when the code preview cannot run or is unsupported, then optionally attach one fallback.
3. Run the current working copy. The build/run uses an exact source content hash. A fallback does not change the code build result.
4. Inspect the live result, build output, console and responsive layout. Fix errors and run again.
5. Save draft. This creates an immutable code snapshot and, only when selected, pins the single optional fallback reference.
6. Build/validate the saved version using the production-equivalent compiler contract. The successful build artifact is tied to that exact source hash and dependency set.
7. Review the release summary: metadata, source version, runtime type, media, validation and preview result.
8. Publish exact release. The server rechecks owner identity, immutable version pointers, successful build status, hash match, asset readiness, asset references and publication policy.
9. Commit the published release pointer atomically. Revalidate public Labs listing, detail route, sitemap and relevant metadata/cache only after the pointer transition succeeds.
10. Verified users can fetch the exact release source. Guests can run the published public demo and see public media but cannot fetch source.
11. A later save/preview does not change the public release. Publish the new exact release to replace it.
12. Unpublish prevents new public runtime/source access; historical releases remain available to the owner for rollback/restore under the approved retention policy.

A successful preview of unsaved code is not publishable by itself. A fallback asset is not a substitute for a successful production-equivalent compiler/runtime validation and cannot make a failed build publishable. Publication requires a successful build for the exact saved source version and exact media manifest being published. Any code, metadata, dependency or fallback-reference change invalidates the prior release validation.

## 8. Proposed API/service boundaries

These are planning contracts, not assertions that the routes are already implemented. Final paths and payload schemas belong in API-CONTRACTS.md before code implementation.

- Owner creates/updates experiment metadata through owner-only experiment routes.
- Owner requests a constrained media-upload intent; browser uploads directly to Cloudinary; server verifies/finalizes the asset.
- Owner lists private media and may attach or clear one optional fallback; there is no gallery ordering, cover selection or runtime-asset role.
- Owner requests a preview run with a working-copy source snapshot. The optional fallback is a separate page-level reference and is not required by the compiler.
- The server creates a bounded preview job and returns status/run identifier.
- Owner polls/subscribes to build and runtime diagnostics through a private owner endpoint.
- Owner saves immutable source draft versions.
- Owner requests build validation for a saved version.
- Owner publishes an exact immutable release manifest.
- Public route resolves only the published experiment release.
- Existing verified source endpoint resolves source files for the published release only.

Do not send raw Cloudinary credentials, source content to public endpoints, compiler secrets or privileged runtime values to the browser.

## 9. Security, privacy and abuse controls

- Singleton owner authorization is checked server-side for every create, edit, upload, preview, save and publication action.
- Source and build worker have no application credentials or user cookies.
- Browser execution is on a dedicated origin with no access to portfolio storage, cookies or DOM.
- Default network policy blocks external connections and requests to portfolio APIs.
- Fixed dependency allowlist; no arbitrary package installation, postinstall scripts, remote ESM or external scripts/CDNs.
- Validate source paths, import graph, archive contents, file count, file bytes, asset manifest and source secrets.
- Uploads use expiring server-signed intents, exact allowed formats and account quotas; verify the provider callback before attaching assets.
- Draft assets/artifacts are not public. Published assets/artifacts are immutable and tied to the published release pointer.
- Apply rate limits and cost ceilings to preview builds, video transformations and media uploads.
- Enforce CPU/memory/time/output-size limits for compiler and runtime. Provide stop/restart and terminate abandoned jobs.
- Limit console/event payload sizes; do not log full source, media contents, user credentials or tokens.
- Do not expose app cookies, environment variables, private APIs or admin endpoints in the preview.
- Keep source reads behind Better Auth verified-email policy and private/no-store responses.
- Add threat-model tests for build escape, iframe escape, CSP bypass, network egress, cross-experiment asset access, IDOR, upload abuse, stale run messages and draft leakage.

## 10. Public performance and media behavior

- Keep the Labs listing lightweight: one cover asset per card, responsive transformations, aspect-ratio reservation and lazy loading except for the actual LCP candidate.
- Do not start interactive runtime builds/iframes in card lists.
- Load the published detail-page runtime on demand, with clear loading/error/retry states and a responsive preview canvas.
- Keep optional fallback media separate from code bundles; load it only when the runtime is unavailable or unsupported.
- Use generated video posters and appropriate responsive image/video transforms.
- Pause/stop offscreen previews when practical, and stop the runtime when navigating away.
- Respect reduced motion for Motion animations, animated GIF behavior and any video auto-preview.
- Do not use the full source, editor or compiler package on public pages.
- Measure LCP, CLS, JS transfer, media bytes and preview startup before tuning or making performance claims.

## 11. Implementation phases and gates

### Phase 0 — Contract and threat model
- Maintain this plan as the implementation source of truth.
- Finalize runtime origin, build provider, artifact storage, toolchain versions, CSP and network model.
- Define source/asset/release API schemas and Mongo indexes.
- Define Cloudinary allowed formats, privacy mode, quotas and upload limits from the actual account.
- Security review before running owner-authored code outside the prototype.

### Phase 1 — Owner-created experiment catalogue
- Create experiment metadata and source workspace without a code-owned registry edit.
- Add starter templates and working-copy state.
- Preserve the four existing code-owned experiments.
- Owner-only creation and inventory tests.

### Phase 2 — Media asset pipeline
- **Initial upload foundation implemented:** signed direct-upload intent, Cloudinary Admin API preset-mode verification, upload finalization/resource verification, `LabMediaAsset` persistence, owner media inventory and audit events.
- **Remaining:** configure the signed image/video presets and `LABS_MEDIA_MAX_UPLOAD_BYTES` in the actual Preview environment; complete format-by-format upload and authenticated-delivery tests.
- **Implemented in the branch:** owner-only short-lived private media preview URLs, a single optional `fallback-preview` attachment role, alt text/caption and UI controls to select or clear the fallback. The data model and API reject cover, gallery and in-experiment roles.
- **Remaining:** configure the signed image/video presets and upload-size ceiling in Preview; verify every accepted file type and Cloudinary authenticated delivery; pin the optional fallback to a saved draft/release and verify privacy/cleanup.
- Verify draft media privacy, public release delivery, deletion/reference integrity and orphan cleanup.

### Phase 3 — React/JSX + Tailwind v4 + Motion compiler
- **Compiler prototype implemented:** `tools/labs-compiler` contains a separate pinned toolchain (Vite 8.3.5, React/ReactDOM 19.2.8, Motion 13.2.0, Tailwind/PostCSS 4.3.3 and esbuild 0.28.2).
- The compiler validates the documented React entry structure, file count/size/path rules, and a fixed package allowlist; it rejects unknown packages, remote/absolute imports, Node built-ins, require/eval/Function and app storage/parent access patterns.
- **Smoke tests passed in an isolated Vercel Sandbox:** React JSX + Motion + Tailwind v4 produced the expected CSS utilities, and a forbidden package import was rejected.
- **Remaining before this phase is complete:** build-worker orchestration from the application, immutable toolchain image/snapshot lifecycle, bounded diagnostics, deterministic artifact verification, security review and broader nested-import/hooks/reduced-motion tests. The compiler prototype is not yet connected to the owner preview button or public release.

### Phase 4 — Full live preview
- **Not yet complete:** replace/adapt the current srcDoc prototype to the separate-origin artifact runtime.
- Add build status, ready state, console, runtime errors, timeouts, stop/restart and desktop/mobile size controls.
- Do not require an @labs/assets module for fallback media. Test image, animated GIF and video only as fallback presentation when code preview cannot run.
- Ensure no network access, app cookies, parent DOM access or user-session leakage.

### Phase 5 — Immutable release and public Labs detail page
- **Disabled:** create release manifest tying metadata, code snapshot, build artifact and optional fallback reference only after the preview/runtime gates pass.
- Publish only a successful exact build/release.
- Render the actual interactive demo on the public experiment detail page.
- Render the actual interactive code runtime as the primary detail-page experience. Show the optional fallback asset only when the runtime cannot run or is unsupported.
- Keep source viewer restricted to verified registered accounts and expose only the source belonging to the published release.
- Add unpublish, restore/republish and cache invalidation behavior.

### Phase 6 — QA, analytics and release
- Complete owner and public browser QA across desktop/mobile/zoom.
- Run auth-role, upload, compiler, runtime isolation, publication, source privacy, analytics and regression suites.
- Verify analytics distinguish detail views, preview starts, source opens, copies and likes.
- Confirm the homepage and four code-owned experiments are unchanged.
- Complete operational cost, media-retention, asset-deletion and privacy reviews before Production.

## 12. Required acceptance tests

### Code and compiler
- A starter React JSX project builds and mounts through ReactDOM.
- Local imports within the project root build; traversal, remote imports, unknown packages and Node APIs fail.
- Tailwind v4 responsive and state utilities compile from every supported JSX file.
- Motion imports from motion/react work and respect reduced-motion.
- Re-running the same source/dependency/media hash yields the same build identity or a documented deterministic equivalent.
- A build failure preserves the working copy and previous published release.

### Media
- Owner uploads valid JPEG/PNG/WebP/AVIF, GIF, MP4 and WebM.
- Invalid MIME/signature, oversized media, unsupported format and failed transformations are rejected with safe feedback.
- The optional fallback media is shown only for failed/unsupported runtime states; a successful code preview always takes precedence. Alt text and captions display correctly.
- React source can reference an attached asset through the virtual asset module.
- Unknown asset keys fail validation; an experiment cannot reference another owner's asset.
- Draft assets are inaccessible from public routes; published release assets load through the approved CDN.
- Removing an attachment does not delete an asset referenced by another draft or historical release.

### Preview and runtime
- The code runs in a separate-origin isolated browser frame, not the portfolio React tree.
- No access to app cookies, local storage, parent DOM, app APIs or privileged environment.
- Network requests are blocked by default; only explicitly approved media delivery hosts load.
- Console messages and runtime errors are bounded, correlated to the current run and stale messages are ignored.
- Run timeout, stop/restart, mobile viewport, loading, empty, unsupported and build-error states work.
- Multiple preview runs and owner sessions cannot read or mutate each other's workspaces.

### Publication and source access
- A draft save does not affect the public experiment.
- A preview success for a different source/asset hash cannot be published.
- Publish updates one exact immutable release pointer only after all checks pass.
- Guest and signed-in-unverified visitors can run the published demo and view public media but cannot open/copy source.
- Verified accounts can open/copy the published source automatically.
- Unpublish stops new public demo/source access; republishing a prior immutable release works.
- A working code preview always takes precedence over optional fallback media.

## 13. Decisions still open

These decisions must be resolved before the corresponding implementation phase. Do not silently guess:
1. Isolated build provider and browser runtime host/origin. Vercel Sandbox is a candidate, not a locked choice.
2. Immutable artifact/object storage provider for compiled JS/CSS/HTML bundles. Cloudinary is for media delivery, not the default compiler artifact store.
3. Compiler choice and version pinning (for example Vite/esbuild with the existing Tailwind v4 PostCSS adapter).
4. Exact fixed dependency versions and package allowlist.
5. Cloudinary upload limits, transformation quotas, draft access mode and public delivery mode.
6. Exact max upload size, video duration, dimensions and per-owner storage quota, derived from the actual account plan.
7. Whether video card auto-preview is enabled; default is poster-only.
8. Whether additional browser capabilities such as Web Workers, WebGL/Three.js, WebAssembly and controlled outbound API access are added after the initial release.
9. Whether TypeScript/TSX is added after JavaScript/JSX is stable.
10. Whether a media-only experiment type is ever needed; the current baseline remains an interactive code experiment with optional fallback media only.

No package installation, Production configuration change, media quota assumption, provider selection or release publication is authorized merely by this planning document.
