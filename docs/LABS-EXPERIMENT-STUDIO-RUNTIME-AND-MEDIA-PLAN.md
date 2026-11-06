**Status:** The isolated runtime recovery/CSP changes described below remain committed but have not been verified by a newer Preview deployment. This branch now also contains a separate owner-selected public gallery poster flow: a ready JPEG/PNG/WebP/AVIF still can be promoted from private Cloudinary storage to public Vercel Blob and is bound to the exact published artifact/version. The public DTO suppresses mismatched posters; publishing a different artifact or unpublishing clears the pointer and attempts Blob cleanup. This is not automatic screenshot capture. The private `fallback-preview` remains a separate runtime-failure fallback and is not public gallery media. Automatic screenshot generation, public fallback delivery, detail-gallery role migration and authenticated browser QA remain outstanding. A clean full build/test, Atlas checks and a new Vercel Preview for the current branch are still required before release.
**Branch:** `feat/labs-platform-integration`.
**Latest previously READY runtime-recovery Preview:** [vishal-kumar-choudhary-frontend-developer-l99ap6cy7.vercel.app](https://vishal-kumar-choudhary-frontend-developer-l99ap6cy7.vercel.app/) on commit `48d7585e97414de3f71a976c3d77426854f15aac`. It predates the 5 November opaque-origin CSP fix below and will continue to show the reported blank/unstyled preview until a newer Preview is built. Branch HEAD `8d832832` contains the CSP and readiness fixes plus immutable asset caching. Vercel returned the daily deployment API quota limit when a follow-up deployment was requested; do not treat the older READY URL as testing the latest code.
**Compiler verification:** `npm run test:smoke` passed on a fresh Vercel sandbox with JSX/TSX type checking, React 19, Motion, Lucide, React Icons, Tailwind v4, CSP, isolated preview HTTP server/bridge, traversal blocking and invalid-type rejection. This suite does not exercise a logged-in owner Run click or the deployed published-artifact iframe.
**Applies to:** Owner-created experiments and the four existing code-owned experiments.
**Primary implementation branch:** `feat/labs-platform-integration`

**Non-negotiable regression rule:** Keep the existing owner Studio Run capability. Run must compile and execute the current unsaved working copy in the isolated preview; it must not be replaced by screenshots, a static card preview or a publish-only build. Keep the public detail-page runtime as the actual interactive experiment. A screenshot is only a gallery poster.

---

## Runtime decision locked — React first, static HTML/CSS retained

1. **React JS/JSX is a first-class mode.** The `React JS` starter creates the root HTML, `src/main.jsx`, `src/App.jsx` and Tailwind v4 CSS entry. React 19, Motion, Lucide and React Icons are available from the fixed compiler image.
2. **React TypeScript/TSX is a first-class mode.** The `React TSX` starter creates `src/main.tsx`, `src/App.tsx` and a generated strict TypeScript configuration. `tsc --noEmit` must pass before Vite builds the browser bundle. Invalid types block the preview with diagnostics.
3. **Static HTML/CSS/JavaScript is a separate mode.** It preserves the HTML document, inline `<style>` and `<script>` blocks, and compiles linked CSS/JS assets. CSS-only experiments receive a generated HTML entry. Static projects are not wrapped in React.
4. **Mode detection is deterministic.** A valid React entry structure or a single JSX/TSX component selects React mode. Otherwise the compiler selects static mode. Ambiguous multi-HTML projects must provide an explicit root `index.html`.
5. **Run and publish use one versioned build contract.** Owner Run compiles and executes the current working copy in an isolated sandbox. Publish rebuilds the exact saved source version and stores its immutable artifact. The currently implemented gallery poster is an owner-selected still image promoted to public storage and tied to that exact release; automatic capture from a successfully rendered artifact is a deferred phase. Media never replaces the owner Run workflow or a working public detail runtime.

---

## Latest Fluid Gradient and build regression — 5 November 2026

### Why the HTML file did not run
The uploaded entry was named `src/fluid_gradient_background-1-.html`, not root `index.html`. The previous static adapter rejected nested HTML entries. After that check was relaxed, Vite generated root-relative asset references such as `/src/main.jsx`; the Labs source-policy plugin incorrectly rejected all leading-slash paths, including Vite-generated local assets. A subsequent edit also introduced an escaped-quote syntax error in the generated root HTML string.

### Fixes now on the branch
- A single nested HTML entry is promoted to build-time `index.html`; the saved source path is not mutated.
- Relative `src`, `href`, `poster` and CSS `url(...)` references are rewritten against the HTML file's original folder, so imported files under `src/` still resolve after entry promotion.
- Inline `<style>`, inline `<script>`, Canvas markup and `requestAnimationFrame` code remain in the HTML document.
- Vite root-relative local assets are accepted only when they resolve inside the isolated experiment root. External, absolute/escaping and unapproved imports remain blocked.
- The generated HTML root string now uses valid JavaScript quoting. The earlier Turbopack parse failure is fixed.
- The Files panel controls now wrap instead of overflowing its narrow sidebar. An `HTML/CSS` starter was added next to the locked `React JS` and `React TSX` starters. Preview labels are framework-neutral.

### Implementation phases

| Phase | Implementation | Why it exists | Verification |
|---|---|---|---|
| 1. Lock React authoring | React JS and React TSX starter templates; fixed runtime packages; generated React entry points | Gives the owner reliable, known-good React scaffolding instead of arbitrary project guessing | JSX/TSX build, Motion, icons, Tailwind v4 and TypeScript-error tests pass |
| 2. Detect project mode | React entry detection is separate from static HTML detection | Prevents a standalone HTML experiment from being incorrectly forced into React | React fixtures and static fixtures compile independently |
| 3. Prepare static HTML | Promote one nested HTML entry to `index.html`; preserve inline CSS/JS; resolve linked local assets | Vite requires a root HTML entry; original relative asset paths otherwise point to the wrong directory | Fluid Gradient nested-entry fixture passes, including inline Canvas and external CSS/JS references |
| 4. Enforce safe asset resolution | Permit Vite-generated root-relative references only inside the project root | Vite emits root-relative URLs during HTML processing; blanket rejection broke valid assets, while unrestricted paths would weaken isolation | Vite source-policy regression plus traversal/security tests pass |
| 5. Build and serve | Vite emits HTML/CSS/JS, isolated server delivers each asset under a per-run URL | An emitted bundle is not a visible preview until its page and assets are actually served | HTTP health/page/CSS/JS tests pass |
| 6. Owner QA and release | Test the authenticated Run button, then rebuild and publish the exact saved version | Local tests cannot prove the deployed owner session or public artifact route | Pending a new READY Preview deployment and authenticated browser test |

### Latest verification
- Expanded `npm run test:smoke` passes: nested Fluid Gradient HTML with inline styles and Canvas JavaScript; nested external CSS/JS path rewriting; standalone HTML/CSS/JS build and HTTP asset delivery; CSS-only generated HTML; React JSX and TSX; invalid TypeScript rejection; Tailwind v4; Motion; Lucide; React Icons; sandbox directory idempotency; preview bridge and traversal rejection.
- Targeted ESLint passes for the changed editor, preview, compiler and animation files.
- `npm run build` passes: SEO validation, Next.js compilation, TypeScript and all 18 static pages.
- The specific Vercel build error `Expected ',', got 'ident'` came from an invalid escaped quote in generated `labs-root` markup; corrected to a single-quoted JavaScript string and verified by the clean build.

### Deployment and browser regression status — 5 November 2026
The observed READY Preview is [vishal-kumar-choudhary-frontend-developer-blo9pd425.vercel.app](https://vishal-kumar-choudhary-frontend-developer-blo9pd425.vercel.app/) on commit `b0ba9a977526c778b4faa377d3f545f4bd016229`. The supplied screenshots show:
- The public `/labs/spotlight-dock` detail page has a blank white runtime canvas instead of rendered output.
- Custom experiment gallery cards do not consistently show their code-derived visual previews.

Treat this as a failed browser verification despite the deployment being READY. The currently observed Preview is behind the branch's latest functional/docs state. The owner Run action must also be tested against the current deployed branch with unsaved HTML/CSS/JS, JSX and TSX projects. The earlier `18e5ff9` deployment note is historical and is not the latest browser evidence.

Do not enable Production publishing until owner Run, the exact published artifact detail runtime, iframe ready/error bridge, media/poster delivery and the sandbox security gate have all passed in a deployed Preview.
## Phase 0 implementation progress — 5 November 2026

### Published detail runtime

- **Root cause addressed:** the public detail page previously placed the Vercel Blob `entryUrl` directly in an iframe. The application had no controlled inline response, artifact-scoped runtime handshake or visible failure state. The new detail runtime URL is an application-owned route under `/api/v1/labs/:slug/runtime/:artifactId/*`; it validates the experiment's current published pointer and exact source version before serving the requested compiled output.
- The runtime route streams only files listed in the ready immutable artifact manifest, validates path segments and the Vercel Blob host, assigns explicit inline MIME/Content-Disposition headers and applies a restrictive CSP. It never returns source snapshot files.
- The HTML entry receives a small bridge that reports startup errors and readiness for the matching artifact ID. The parent iframe remains sandboxed with `allow-scripts` only (no `allow-same-origin`), correlates messages to the expected iframe and artifact ID, and shows a themed loading state, 15-second startup timeout, diagnostic-safe error and Retry action.
- Published artifact assets have immutable IDs. The latest branch version applies long-lived immutable caching to the runtime asset route; deploy this cache-header-only commit after the current Preview build quota permits.

### Second visual regression review — 5 November 2026

The owner supplied two screenshots from the READY Preview:

- **Spotlight Dock:** the runtime frame showed “The experiment loaded but did not render any visible content.”
- **Fluid Gradient Playground:** HTML text appeared in default browser typography on a white background; the linked stylesheet and animation were absent.

These are not new editor controls or poster-generation problems. The compiled HTML includes a build-time CSP meta tag with `script-src 'self'` and `style-src 'self'`. The public runtime iframe deliberately uses `sandbox="allow-scripts"` without `allow-same-origin`, so the iframe has an opaque origin. In that context, `'self'` does not identify the portfolio host, and the compiled JavaScript/CSS assets are blocked. The React root never mounts; the static document falls back to unstyled HTML.

**Committed repair:**

- The published runtime response removes only the compiler-generated CSP meta tag from the HTML entry. Other metadata and markup remain untouched.
- The runtime route is the single CSP authority for published output. It emits a validated HTTPS, same-origin, artifact-path-scoped policy for JS, CSS, images, fonts and media, while continuing to block external connections, nested frames, objects and forms.
- Cross-origin asset bases are rejected by the CSP builder. Published source files remain inaccessible; only the current published artifact manifest can be served.
- Bridge insertion offsets are calculated after policy removal so the inline bridge remains inside the HTML head.
- Readiness now checks rendered body text, visible elements, Canvas/SVG/media and a styled body background. It no longer assumes that content must be mounted in a React element named `#root`, which also supports static HTML/CSS experiments.

**Verification:** targeted tests passed for CSP-meta removal, preservation of unrelated HTML, path-scoped script/style allowances and rejection of a different asset origin. The Labs compiler smoke suite also exited successfully in a fresh isolated Vercel sandbox. The current branch's regression suite includes the targeted CSP assertions. The latest code has not yet been deployed because the Vercel deployment API daily quota was exhausted, so the supplied READY URL is not a browser test of this repair.

### Owner Studio Run

- The existing Run action remains connected to the current unsaved `files` array and still posts those files to the owner-only preview endpoint. Run does not save or publish and does not mutate the current/published source pointer.
- The owner preview now has a runtime-start timeout, visible loading overlay, iframe load error, early runtime-error handling and Retry affordance. Existing desktop/mobile viewport controls and console remain.
- **Not yet verified in the deployed browser:** owner Run for single HTML, HTML/CSS/classic JS, React JSX and React TSX. A successful compiler smoke suite is not a substitute for this test.

### Verification and remaining gate

- Vercel deployment `dpl_9Ck9zmvx9t9A7JBPet94FfojaWLY` built commit `48d7585e97414de3f71a976c3d77426854f15aac` successfully and reached READY. Its URL is listed above.
- Fresh isolated compiler `npm run test:smoke` exited 0 with the capabilities listed above.
- The latest cache-header commit `143a04dc3603a75eaf2470e33fca5f887989f0a1` is on the branch but was not deployed: Vercel returned `402 api-deployments-free-per-day` (daily API quota exceeded). Do not work around this by changing billing/security settings or deploying to Production.
- Phase 0 is **implementation-complete for the route/UI code but not release-verified** until an authenticated browser confirms owner Run and the public detail runtime visually renders HTML/Canvas and React/Motion artifacts on a deployed Preview. All four built-in experiments must also be regression-checked.

---

## 1. Product outcome

The Studio is an owner-only creative coding workspace. The owner must be able to create an original experiment, write/import code, run the actual current working copy, inspect bounded build/runtime errors, save immutable drafts and publish an exact successfully built version. **Run is core functionality and must remain available throughout all gallery/media work.** Image/GIF/video uploads are optional visual assets; they do not replace code execution.

The public detail page is the actual interactive experiment and must load the exact published artifact. A static poster is a separate derivative for the gallery only. It must never be mistaken for the executable preview. Optional runtime-fallback media is shown only if the detail runtime fails or is unsupported; it must not hide a working runtime. Optional detail-gallery media is supplementary and does not replace the runtime.

Gallery cards never execute experiment source, mount experiment React trees, start iframes or compile code. The implemented public visual priority for owner-created experiments is: (1) a valid owner-promoted `galleryPreview` whose `artifactId` and `sourceVersionId` both match the currently published immutable release; (2) the existing lightweight LabArtwork/neutral placeholder. The public converter validates HTTPS Vercel Blob URLs and never serializes private Cloudinary preview URLs.

The first public poster workflow is an explicit owner selection from the experiment's private media inventory. Only a ready JPEG, PNG, WebP or AVIF still image up to 5 MB can be promoted. The server verifies the Cloudinary authenticated resource, downloaded size and file signature before copying the bytes to a unique public Vercel Blob object. The owner is told that the promoted image is public and supplies alt text. GIF and video uploads remain private fallback media; they are not gallery posters.

**Automatic screenshot capture is not implemented.** A static poster must not be described as runtime-generated unless a separate isolated capture worker has actually produced it. Automatic capture from the successful published artifact remains a future phase. A gallery card is always non-executable: it never mounts the experiment React component, creates a runtime iframe, invokes the compiler, or starts a canvas/animation loop.

The poster pointer is bound to the precise artifact and source version. Publishing a different artifact or unpublishing clears that pointer and attempts public Blob cleanup; deletion includes the poster URL in its cleanup set. Provider cleanup is best-effort, and stale posters remain excluded by the public DTO even if external cleanup needs retry.

The four existing code-owned experiments remain supported by the existing literal runtime registry. Owner-created experiments use database-backed metadata and versioned source/build records. Creating or publishing a custom experiment must not require editing the repository runtime registry.

## 2. Product surfaces and responsibilities

### 2.1 Owner Experiment Studio

The owner workspace contains:
- Experiment metadata: title, slug, summary, full explanation, category, technologies and publication state.
- File explorer and editor for HTML, CSS, JavaScript and React/JSX source.
- Private Cloudinary media library with the existing single optional `fallback-preview` role. A separate owner action can promote a ready JPEG/PNG/WebP/AVIF still image as the public gallery poster for the exact current published artifact. This poster is owner-selected, not automatically captured from the runtime.
- Automatic poster capture, detail-gallery role migration and public runtime-fallback delivery remain planned; do not expose private preview URLs or treat fallback media as a gallery image.
- Run/Restart controls for the current unsaved working copy, desktop/mobile preview sizes, build/iframe-ready status, console output and runtime errors.
- Draft save, immutable version history, validation results and explicit publish/unpublish actions.
- Clear pending, success, failure and retry feedback for every owner mutation; never mark a draft or release saved/published before the server confirms it.

The editor and compiler dependencies remain lazy-loaded from owner-only routes. They must not enter the homepage or ordinary public Labs listing bundle.

### 2.2 Public Labs listing

Each listing card shows experiment metadata and one visual preview. For a custom published experiment the current implementation uses an owner-promoted `galleryPreview` only when its artifact and source-version IDs match the currently published release; otherwise it uses existing LabArtwork/neutral artwork. Automatic generated screenshot posters and public GIF/video gallery delivery are not implemented. Never show a stale poster from a different published source version.

A gallery card is **always non-executable**. It must not mount the experiment React component, create a runtime iframe, invoke the compiler, or start a canvas/animation loop. A static generated poster lets HTML/CSS/JS and React experiments display their real output without running code in the gallery. A manually uploaded image/GIF/video can be selected as the gallery visual instead, but it remains media, not executable source.

Images use responsive dimensions and lazy loading. Animated GIF/video behavior is deliberately constrained: retain a still poster as the default, load animation only when a card is actively visible/engaged, respect reduced-motion and page visibility, and cap simultaneous animated/video previews. Video uses muted/inline playback, `preload="none"` and no sound. Do not autoplay every video in a long grid.



### 2.3 Public experiment detail page

A published detail page provides:
1. Experiment title, description and metadata.
2. The actual interactive runtime, in a responsive preview frame with explicit loading, ready, runtime-error, timeout, retry and fallback states.
3. Optional detail-gallery media as supplementary content, with alt text/captions and lazy loading.
4. Optional runtime-fallback media only when the interactive runtime reports failure or is unsupported.
5. Like/engagement controls.
6. A visible source-code CTA/section with permission-aware rendering.

The runtime must never remain an unexplained blank white rectangle. Keep a themed canvas placeholder visible until the isolated iframe sends a valid ready message for the current run. An iframe load event by itself is not proof that the experiment rendered. If execution fails and runtime-fallback media exists, show it with an explicit unavailable/fallback state; otherwise show a useful error and retry action.

The page loads only the published release. Draft source, preview output, unpublished assets and owner audit data are never serialized into public page payloads.



### 2.4 Protected source viewer

The protected source section is rendered conditionally by session state. Resolve the session before showing actions so guests do not flash during auth loading. Guests see Sign in and Create account in the source section and Labs navbar, with a validated return path to the same experiment; hide the redundant navbar action on its matching login/signup page. Signed-in unverified accounts see Verify email and no guest auth links. The detail Server Component resolves the session and published-source authorization before returning the page, and passes only the authorized published snapshot to the source panel. A valid verified session therefore receives the source in the first response, without client-side CTA flicker, a source-access button or guest CTA. Client hydration revalidates the same user and clears source on sign-out/expiry. Signed-in users see the account menu instead of guest links. Server authorization remains mandatory in every case. The source viewer exposes only text files belonging to the exact published release and offers copy controls. It does not expose unpublished drafts, temporary build logs, secrets or upload credentials.



## 3. Supported authored project contract

### 3.1 Initial project types

The first complete custom runtime should support:
- Standalone HTML/CSS/JavaScript projects.
- React projects written in JavaScript and JSX.
- React projects written in TypeScript and TSX, using a fixed generated TypeScript configuration and a separate `tsc --noEmit` validation stage before Vite bundling.

React JSX and TSX compilation and type-error rejection are implemented and smoke-tested with the pinned compiler image. Deployed browser Run and exact-version publish verification remain release gates. See `LABS-REACT-JSX-TSX-TAILWIND-MOTION-RUNTIME-PLAN.md` for the detailed contract.

No server components, server actions, API route handlers, Node.js APIs, backend processes or server-side rendering are available inside an experiment. Experiments are browser-only static applications.

### 3.2 React entry convention

Use a documented template rather than guessing an entry file from arbitrary names:
- index.html — browser document shell and root element.
- src/main.jsx or src/main.tsx — ReactDOM client entry.
- src/App.jsx or src/App.tsx — default-exported experiment component.
- For TS/TSX, the platform generates a fixed `tsconfig` and any required Vite type declarations; owner-supplied compiler configuration is not trusted.
- src/index.css — Tailwind v4 import and experiment-level styles.
- Additional files under src/ for components, hooks and local utilities.

The compiler must reject missing or ambiguous entry points and report a clear actionable error. A starter template should be available from Create Experiment so the owner does not need to create this structure manually.

### 3.3 Fixed dependency allowlist

The React/JSX/TSX template should provide a preinstalled, version-pinned set of browser packages:
- react and react-dom.
- motion, imported from motion/react.
- lucide-react for icons.
- react-icons, using approved named imports from icon-pack subpaths.
- typescript for isolated TS/TSX validation (`tsc --noEmit`).
- clsx and tailwind-merge only if the template and bundle policy require them.

The React/JSX/TSX compiler environment must pin and independently validate its own approved versions; main application dependencies do not automatically become available inside the isolated compiler. The browser project cannot choose arbitrary package versions.

The owner must not upload or edit a package manifest that triggers npm install, execute lifecycle scripts, add arbitrary dependencies or load executable packages from a CDN. Additional packages require an explicit allowlist/security review and a controlled toolchain update.

### 3.4 Tailwind CSS v4 contract

Tailwind must be compiled as part of the build. The project stylesheet uses the Tailwind v4 import model, and the build pipeline runs the approved Tailwind v4 PostCSS integration against the complete source snapshot.

Requirements:
- No Tailwind CDN or browser-time script compilation.
- Scan all supported JSX/TSX/JS/TS source files in the experiment snapshot so utility classes are generated before preview/publication.
- Support normal Tailwind utilities, responsive/state variants, CSS custom properties, local CSS and approved Tailwind v4 theme customization.
- Do not permit owner-supplied Tailwind plugins, PostCSS plugins, arbitrary build scripts or remote CSS imports in the initial release.
- Dynamic class names must use complete statically discoverable class strings or a finite mapping. Constructing fragments such as bg- + color at runtime cannot be relied upon to generate a utility.
- Build output must include the generated CSS in the immutable artifact.

### 3.5 TypeScript and TSX contract

The target runtime accepts `.ts` and `.tsx`. Vite transpilation alone does not type-check the complete project. The isolated worker must run the pinned TypeScript compiler against a platform-generated fixed configuration with `noEmit` before Vite bundling. Type errors block preview readiness and publication and are reported with file, line and column. The owner cannot run custom build scripts or override compiler plugins, type roots or package resolution. The exact target and acceptance tests are specified in `LABS-REACT-JSX-TSX-TAILWIND-MOTION-RUNTIME-PLAN.md`.

### 3.6 Motion contract

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
→ Run current unsaved working copy in the isolated build/runtime  
→ serve the compiled artifact on the separate runtime origin and confirm iframe-ready/runtime status  
→ inspect output and bounded build/runtime diagnostics  
→ save an immutable draft version  
→ rebuild the exact saved version for publish  
→ publish the immutable release after all code/security gates pass  
→ capture a static poster from the exact successfully rendered published artifact when no current gallery asset/poster exists  
→ store the version-bound poster/media references in the release manifest  
→ serve static poster/media in gallery cards; serve the actual compiled artifact only on the detail page.

Preview and publication use the same deterministic build contract. A successful preview is not sufficient if the published build is produced by a different compiler or dependency version. The optional fallback reference is tracked separately from the code bundle.

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

The current implementation uses Vercel Sandbox snapshots as the isolated build worker. The expired snapshot blocker was addressed by rebuilding the named compiler base and adding its current snapshot to the `feat/labs-platform-integration` Preview environment only. The snapshot passed the compiler smoke suite with network access disabled before snapshot creation. Snapshot retention still uses the provider's default seven-day expiry, so refresh and revalidate it before expiry. The latest Preview deployment is still pending because Vercel rejected further API deployments after the daily limit was reached. Do not silently substitute a normal application server as the compiler.

### 4.3 Deterministic compiler

Use one versioned build toolchain for preview and publish. The current implementation selects Vite 8 with esbuild and the Tailwind CSS v4 PostCSS adapter. React/JSX is smoke-tested locally. TypeScript/TSX type checking and React Icons still require pinned dependency versions, lockfile updates and acceptance tests before the toolchain is complete.

The compiler performs:
1. Validate the declared template/entry point.
2. Resolve local project imports only inside the experiment root.
3. Resolve bare package imports only from the fixed dependency allowlist.
4. Reject remote imports, unknown packages, Node built-ins, dynamic external URLs and unsupported import mechanisms.
5. For TS/TSX, run the pinned TypeScript compiler with a generated fixed config and `noEmit`; stop on type errors.
6. Transform JSX/TSX for the pinned React runtime.
7. Bundle React, ReactDOM, Motion, Lucide, approved React Icons subpaths and other allowlisted utilities into static browser output.
8. Compile Tailwind v4 with the approved PostCSS adapter.
9. Process local CSS and safe asset references.
10. Create an immutable build manifest and SHA-256 content hash.
11. Return build status, safe diagnostics and an artifact reference.

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

### Media and poster roles — locked product behavior

Uploaded media and generated code posters are separate presentation assets; neither is the experiment source or compiled runtime. The approved target attachment roles are:

- `gallery-preview`: at most one owner-selected image/GIF/video preview displayed by a collection card. It takes precedence over the generated poster. It never starts code execution.
- `detail-gallery`: optional ordered supporting media shown separately from the interactive canvas on the public detail page. Exact item limit/order controls remain subject to the media migration.
- `runtime-fallback`: at most one optional image/GIF/video shown only when the detail runtime fails or is unsupported.

When no current owner-promoted `galleryPreview` matches the published artifact/version, the card uses existing LabArtwork/neutral artwork. Automatic static screenshot capture from the published code artifact remains planned, not implemented.

The public detail page always attempts the actual published code runtime as its primary experience. A working runtime must not be hidden by a media attachment. Detail-gallery media is supplementary; runtime-fallback media is used only after an explicit failure/unsupported state. If no fallback exists, show a themed error/unsupported state—not a blank white rectangle.

The currently implemented data model/API supports only one `fallback-preview` attachment. The new roles above require a reviewed schema/API migration; do not pretend the current fallback-only model already supports them.



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
7. After validation, the owner can assign the asset to an approved presentation role (gallery-preview, detail-gallery or runtime-fallback) once the role migration is deployed. An attachment does not replace the code source or owner Run action.

Never accept a client-supplied Cloudinary public ID as proof of ownership. Verify the upload signature/intent, asset ownership, resource type and allowed folder/prefix on the server.

### 5.3 Media roles

The target role-aware attachment model is:
- `gallery-preview`: one active card preview asset per experiment.
- `detail-gallery`: ordered supplementary media references on the detail page; exact maximum remains OPEN until quota and layout are validated.
- `runtime-fallback`: one optional asset used only after an unsupported/runtime-failure signal.

An asset may be referenced by more than one role when explicitly selected. Each reference carries role, ordering where relevant, alt text and optional caption. The current one-item `fallback-preview` schema must be migrated; retain historical release references and do not delete an asset while any draft, published release or historical version references it.

Card rendering uses a still visual by default. An explicitly selected GIF/video may animate only when its card is visible/engaged and the page is foregrounded; cap simultaneous playback and respect reduced-motion. Video must be muted, inline and `preload="none"`; never autoplay with sound. Detail-gallery video uses a poster and explicit playback controls.



### 5.4 Runtime media boundary

Gallery-preview and detail-gallery media are resolved by the Labs presentation layer from safe published release references; they are not executable imports. Runtime-fallback media is resolved only after the detail runtime reports build failure, unsupported template or startup failure. A successful runtime always wins. The compiler's default network policy remains deny-all. In-experiment asset imports remain outside this first role migration and require a separate explicit compiler/API contract.

### 5.5 Media privacy and publication

Unpublished fallback assets must not be discoverable through public page payloads or predictable public delivery paths. Owner preview URLs are short-lived and returned only through the owner-only no-store inventory endpoint. Public fallback conversion/access mode remains a release-phase decision; until it is verified, fallback media stays private.

Do not store original media binary payloads in MongoDB. MongoDB stores provider identifiers, safe metadata, ownership, processing state and immutable references. Cloudinary stores and transforms the actual media.

## 6. Versioned data and immutable release model

The existing LabSourceVersion remains the immutable code snapshot record. The published release pins its metadata, exact build, optional uploaded preview roles and generated poster metadata. A generated poster must record the source-version ID and artifact ID from which it was captured. No card may serve a poster whose source/artifact version does not match the current published release.

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
- Safe metadata for role-based published references: gallery-preview, detail-gallery, runtime-fallback and generated poster. Keep owner/draft metadata private; role attachment references carry alt text/caption and ordering as appropriate.
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
- Optional gallery-preview asset and ordered detail-gallery references with roles, alt text and captions.
- Optional runtime-fallback asset reference, shown only after runtime failure/unsupported state.
- Optional generated static poster reference with sourceVersionId, artifactId, capture dimensions/configuration, format and content hash.
- Runtime/toolchain/dependency manifest.
- Server-created content hash, validation result, actor and timestamp.

The experiment's published pointer selects one release manifest. A publish operation updates this pointer only after every referenced record and artifact is ready. A later edit creates a new draft/release; the old published release remains live until the new one is explicitly published.

### 6.6 Temporary preview runs

Preview-run status and short-lived artifacts/logs may use a separate LabPreviewRun record or an equivalent ephemeral job store. Store run ID, owner, source hash, build state, bounded diagnostics and expiration. Apply TTL/cleanup to temporary records and artifacts. Never make a preview-run URL a public permanent release URL.

## 7. Draft, preview and publication lifecycle

1. Create experiment metadata. The record remains private.
2. Add/edit code. Run the current unsaved working copy in the isolated preview; this Run action must remain functional independently of poster/media features.
3. Inspect the live result, build output, console and responsive layout. Fix errors and Run again. A failed Run preserves the working copy and previous published release.
4. Save draft. This creates an immutable code snapshot. Upload/attach optional media only for the explicitly selected presentation roles.
5. Build/validate the exact saved version using the production-equivalent compiler contract. The successful build artifact is tied to that exact source hash and dependency set.
6. Capture a static poster from the successful artifact if no current gallery-preview asset/poster exists. Poster capture is a derivative and does not replace compiler/runtime validation.
7. Review the release summary: metadata, source version, runtime type, build result, gallery media, generated poster status and fallback behavior.
8. Publish exact release. The server rechecks owner identity, immutable version pointers, successful build status, hash match, asset readiness/references and publication policy. Poster capture failure does not break a working runtime; use existing artwork and expose a retry/regenerate action.
9. Commit the published release pointer atomically. Revalidate public Labs listing, detail route, sitemap and relevant metadata/cache only after the pointer transition succeeds.
10. Verified users can fetch the exact release source. Guests can run the published public demo and see public media but cannot fetch source.
11. A later save/preview does not change the public release. Publish the new exact release to replace it.
12. Unpublish prevents new public runtime/source access; historical releases remain available to the owner for rollback/restore under the approved retention policy.

A successful preview of unsaved code is not publishable by itself. Uploaded media or a generated poster is not a substitute for successful production-equivalent compiler/runtime validation and cannot make a failed build publishable. Publication requires a successful build for the exact saved source version and validation of every selected published media/poster reference. Any code, metadata, dependency or presentation-reference change invalidates the corresponding release validation. Poster capture failure may use artwork fallback; it must not convert a valid interactive build into a runtime failure.

## 8. Proposed API/service boundaries

These are planning contracts, not assertions that the routes are already implemented. Final paths and payload schemas belong in API-CONTRACTS.md before code implementation.

- Owner creates/updates experiment metadata through owner-only experiment routes.
- Owner requests a constrained media-upload intent; browser uploads directly to Cloudinary; server verifies/finalizes the asset.
- Owner lists private media and assigns/clears explicit gallery-preview, detail-gallery and runtime-fallback roles. The current fallback-only API/schema must be migrated before these role controls ship.
- Owner requests poster capture/regeneration for the exact successful run or published artifact; the server validates owner, source/artifact identity and capture policy. Public card DTOs expose only a safe published poster/media reference and version metadata, never source files or Cloudinary secrets.
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
- Validate source paths, import graph, archive contents, file count, file bytes, the optional fallback reference and source secrets.
- Uploads use expiring server-signed intents, exact allowed formats and account quotas; verify the provider callback before attaching assets.
- Draft assets/artifacts are not public. Published assets/artifacts are immutable and tied to the published release pointer.
- Apply rate limits and cost ceilings to preview builds, video transformations and media uploads.
- Enforce CPU/memory/time/output-size limits for compiler and runtime. Provide stop/restart and terminate abandoned jobs.
- Limit console/event payload sizes; do not log full source, media contents, user credentials or tokens.
- Do not expose app cookies, environment variables, private APIs or admin endpoints in the preview.
- Keep source reads behind Better Auth verified-email policy and private/no-store responses.
- Add threat-model tests for build escape, iframe escape, CSP bypass, network egress, cross-experiment asset access, IDOR, upload abuse, stale run messages and draft leakage.

## 10. Public performance and media behavior

- Keep the Labs listing lightweight: cards receive only public metadata plus one safe static visual reference. Never load/execute the editor, compiler, React experiment tree or runtime iframe in gallery cards.
- Use an explicitly selected gallery-preview asset first, then the generated poster tied to the exact published source/artifact version, then existing LabArtwork/neutral artwork.
- Use responsive image sizes, known aspect ratios, lazy loading and immutable caching for poster assets. Keep card dimensions reserved to prevent CLS.
- GIF/video card animation is opt-in/engagement-gated, intersection-aware and capped; keep a still poster as the default. Video uses muted inline playback, `preload="none"`, reduced-motion support and no sound. Do not play every media card simultaneously.
- Load the actual published detail-page runtime only when its preview canvas is near the viewport. Show a themed skeleton while it starts, confirm the current run through the bridge, and show an explicit runtime error/retry/fallback state rather than an empty white iframe.
- Stop the iframe/runtime on navigation away and avoid multiple runtime instances on the same page.
- Add route-level skeletons for Labs listing, experiment detail, owner source inventory and owner source editor. Skeletons reserve real layout space; keep the site-wide PageLoader behavior separate and avoid duplicate full-screen loaders.
- Use React 19 `useOptimistic` for reversible server-backed mutations where it materially improves feedback. Local unsaved editor changes remain local working-copy state, not falsely “saved” optimistic server state. Roll back optimistic state and show an error when the server rejects a mutation.
- Copy feedback is not speculative: show pending while Clipboard API resolves, show “Copied” only after successful write, then send the idempotent analytics event. Publish/unpublish and destructive deletion use action-specific pending UI and become successful only after server confirmation.
- Do not add TanStack Query solely for this work; use existing server/API patterns and React 19 optimistic state unless a separately approved data-cache requirement is demonstrated.
- Do not use the full source, editor or compiler package on public pages.
- Measure LCP, CLS, JS transfer, media bytes, poster transfer, detail runtime startup and long tasks before tuning or making performance claims.

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
- **Implemented in the branch:** owner-only short-lived private media preview URLs, a single optional legacy `fallback-preview` attachment role, alt text/caption and UI controls to select or clear that fallback. The current data model/API reject card-cover, gallery and in-experiment roles.
- **Remaining:** configure the signed image/video presets and upload-size ceiling in Preview; verify every accepted file type and Cloudinary authenticated delivery; design and migrate the role-aware attachment schema/API for `gallery-preview`, `detail-gallery` and `runtime-fallback`; pin references to immutable releases and verify privacy/cleanup. This media-role migration is a future phase, not current functionality.
- Verify draft media privacy, public release delivery, deletion/reference integrity and orphan cleanup.

### Phase 3 — React/JSX/TSX + Tailwind v4 + Motion compiler
- **JSX compiler prototype implemented:** `tools/labs-compiler` contains a separate pinned toolchain (Vite 8.3.5, React/ReactDOM 19.2.8, Motion 13.2.0, Tailwind/PostCSS 4.3.3 and esbuild 0.28.2).
- The compiler validates the documented React entry structure, file count/size/path rules and a fixed package allowlist; it rejects unknown packages, remote/absolute imports, Node built-ins, `require`/`eval`/`Function` and app storage/parent access patterns.
- **Verified locally in an isolated Vercel Sandbox:** JavaScript/JSX using React, Motion, Lucide and Tailwind v4 compiled and emitted expected output. The tested single-file `.js` marked JSX adapter generated entry files without mutating the saved source.
- **Implemented and smoke-tested:** TypeScript 5.9.3 with generated strict `tsconfig`, `tsc --noEmit` gating, `.ts`/`.tsx` entry support, React Icons 5.5.0 allowlist and JSX/TSX type-error regression coverage.
- **Snapshot recovery:** rebuilt the Vercel Sandbox compiler base and configured the branch-specific Preview snapshot. The snapshot is subject to the provider's default seven-day expiry and must be refreshed before expiry.
- **Remaining before this phase is complete:** deploy the latest branch, verify the actual owner Run route in a browser, confirm bounded diagnostics and concurrent-run isolation, complete security review, and cover nested-import/hooks/reduced-motion edge cases.

### Phase 4 — Full live preview
- **Implemented in the branch and smoke-tested:** the isolated static server now serves the generated HTML/JS/CSS, exposes a health route, injects a parent-origin-scoped ready/console/error bridge, and blocks traversal paths. The owner preview iframe is isolated on the sandbox origin and allows its own origin so local assets load under the runtime CSP.
- **Deployed browser QA pending:** the last READY deployment is from before the server fix. A fresh Preview deployment is blocked by Vercel's daily API-deployment limit (HTTP 402).
- Preserve and verify build status, ready state, console, runtime errors, timeouts, stop/restart and desktop/mobile size controls in the owner Run workflow.
- Verify the current unsaved working copy executes for HTML/CSS/JS, JSX and TSX; a static poster is not a replacement.
- Test image, animated GIF and video only through approved presentation roles after the media-role migration. Do not require an @labs/assets module for card/detail/fallback media.
- Ensure no network access, app cookies, parent DOM access or user-session leakage.

### Phase 5 — Immutable release and public Labs detail page
- **Publish adapter present; full release remains gated:** the owner publish endpoint rebuilds the exact saved version and requires a matching immutable artifact before switching the public pointer. The public Labs route resolves only a ready artifact matching the exact published source version, and its runtime uses the artifact iframe.
- **Not yet verified end to end:** after a fresh Preview deployment, run one custom JSX and one TSX experiment, explicitly publish a test release, and confirm the public Labs detail renders the same immutable artifact. Keep Production publication disabled until these checks and the security gate pass.
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

## 11.1 Prioritized public experience and Studio recovery roadmap — 5 November 2026

This is the **next implementation sequence**. It supersedes the earlier broad phase ordering for the next Labs UX/rendering work. The compiler and security contracts above remain in force. This plan does not authorize Production publishing or weakening owner/source gates.

### Phase 0 — Restore and prove code execution (P0 / regression gate)

- Restore the owner Studio **Run** action so it builds and executes the current unsaved working copy in the isolated preview for standalone HTML/CSS/JavaScript, React JS/JSX and React TSX.
- Preserve Run/Restart controls, desktop/mobile viewport switching, console, build diagnostics, runtime errors, stop/timeout and current working-copy state. A Run failure must not erase editor content or mutate the published release.
- Verify the bridge lifecycle: build started, iframe starting, ready for current run ID, console/error messages, timeout, stop/restart and stale-message rejection.
- Restore public published-artifact execution on `/labs/[slug]`. The 5 November screenshot shows `/labs/spotlight-dock` with a blank white iframe; this is a release-blocking runtime failure, not a poster problem. Keep a themed placeholder until a valid ready message arrives. On failure, show a diagnostic-safe error/retry and runtime-fallback media when present.
- Verify all four built-in experiments continue to run through their existing registry and custom published artifacts run through the isolated artifact URL.
- **Implemented on branch (2026-11-05):** the published artifact route, artifact-version validation, HTML inline response/CSP/bridge, opaque-origin detail iframe, ready/error/timeout/retry UI, and owner Run timeout/error/retry UI are committed. The current unsaved working-copy Run request remains intact.
- **Build evidence:** deployment `dpl_9Ck9zmvx9t9A7JBPet94FfojaWLY` for commit `48d7585e97414de3f71a976c3d77426854f15aac` reached READY; the compiler smoke suite exited 0 in a fresh Vercel sandbox.
- **Gate still OPEN:** authenticated browser QA must confirm unsaved HTML/CSS/JS, JSX and TSX Run, plus visually rendered public custom HTML/Canvas and React/Motion artifacts. Regress all four built-in demos. Do not mark Phase 0 release-complete based on build/smoke status alone.

### Phase 1 — Route loading and skeleton system

- Add route-segment loading UI for `/labs`, `/labs/[slug]`, `/admin/labs/sources` and `/admin/labs/sources/[slug]` using the App Router loading boundary where appropriate.
- Listing skeleton: introduction geometry, category row and 3/2/1-column card placeholders with the same 4:3 preview ratio and text rhythm as actual cards.
- Detail skeleton: header lines, fixed preview canvas ratio, engagement row and source-section placeholders. The preview canvas has its own “Preparing preview” state after the page skeleton resolves.
- Owner inventory skeleton: experiment rows/cards, filters and action-column geometry. Editor skeleton: file rail, editor panel and preview panel with expected widths/heights.
- Use `aria-busy`, `role="status"` where appropriate, restrained shimmer/pulse and reduced-motion-safe static placeholders. Reserve space to prevent CLS.
- Keep the existing site-wide PageLoaderProvider/intro behavior distinct. Do not stack a full-screen loader on route skeletons or hide already rendered content for a quiet refresh.
- **Gate:** direct URL entry, client navigation, browser back/forward, slow network and failed requests show the correct skeleton/empty/error/retry state without layout jumps.

### Phase 2 — Source CTA, optimistic interactions and action feedback

- Resolve the session before showing source actions; ordinary gallery/detail browsing stays public and does not block on authentication.
- Guests see Sign in/Create account in the source panel and Labs navbar, returning to the same experiment. Signed-in unverified users see Verify email. Verified users automatically load published source and see no guest/auth CTA or “Check source access” action. Signed-in users see the account menu instead of guest links. Server authorization remains mandatory.
- Use React 19 `useOptimistic` for reversible server-backed UI transitions: like/unlike state and count, owner inventory additions/removals where safe, and media-role attach/detach/reorder state. On rejection, roll back to the last confirmed server state and show an actionable toast/message.
- Source editor add/delete/reorder operations edit the local unsaved working copy. Update that working-copy state immediately, retain its unsaved indicator, and persist only through Save draft; do not label local changes as saved.
- Irreversible operations remain confirmation-gated. Project deletion shows “Deleting…” until the server completes hide/cleanup. Publish/unpublish and restore show pending states but must not optimistically claim a new published version before the server commits the exact release pointer.
- Copy is not speculative: show “Copying…” while Clipboard API resolves and “Copied” only after it succeeds. Record source-copy analytics only after successful clipboard acknowledgement; never send clipboard text.
- Prevent duplicate submissions, use request IDs/idempotency keys, disable only the relevant action while pending, and preserve unrelated interactions.
- Do not add TanStack Query solely for this work; use existing API patterns and React 19 optimistic state unless a separately approved data-cache requirement is demonstrated.
- **Gate:** success, pending, rejection/rollback, timeout, duplicate-click, stale-version and clipboard-denied cases are tested.

### Phase 3 — Generated code-output poster pipeline

- Generate a **static screenshot of the actual rendered experiment output** so an experiment needs no uploaded GIF/MP4/image to have a meaningful gallery card.
- Capture only after a successful isolated build and a valid runtime-ready signal. Bind poster metadata to the exact sourceVersionId and artifactId; never serve a poster from a different release.
- Use a fixed documented viewport/aspect ratio, bounded capture timeout and capture metadata. Provide an owner “Generate/Regenerate poster” action from a successfully running preview.
- Generate automatically on publish only when the release has no current manually selected gallery-preview asset or valid poster. Do not capture on every keystroke or every Run.
- Capture inside the approved isolated/headless-browser boundary. Do not attempt to read pixels from a cross-origin iframe in the portfolio page, weaken iframe isolation or expose source to a public screenshot endpoint.
- Store the poster as an immutable optimized image asset alongside release media references (not in MongoDB as binary and not in source-file snapshots). Capture provider/tool and exact artifact-storage integration remain OPEN until tested against deployed sandbox constraints.
- Poster failure does not replace or break a working runtime or erase a previous release. For a new release with no valid poster, use LabArtwork/neutral artwork and expose retry/regenerate.
- **Gate:** a real HTML Canvas/animation demo and React/Motion demo produce correct static WebP posters; version mismatch, timeout, blank runtime and capture failure select safe fallbacks.

### Phase 4 — First-class media roles and gallery card renderer

- Migrate the current one-item `fallback-preview` schema/API to explicit `gallery-preview`, `detail-gallery` and `runtime-fallback` roles. Validate role cardinality, order, alt/caption, ownership and historical-release references server-side.
- Card priority: selected published `gallery-preview` asset → version-matched generated code poster → existing LabArtwork/neutral artwork.
- A selected image renders as a static responsive image. A selected GIF may animate only when its card is visible/engaged and the page is foregrounded, with a still poster as its inactive state. Video uses a still poster by default and is muted/inline/preload-none; cap playback and never start it across every card.
- Detail-gallery media is supporting content. The actual interactive code canvas remains the primary detail experience. Runtime-fallback media appears only after an explicit failure/unsupported state.
- Publish only public-safe references for attached assets. Unattached uploads, draft assets, owner preview URLs and provider credentials stay private. Deletion must preserve references from drafts and historical releases.
- **Gate:** gallery tests cover image/GIF/video/poster priorities, lazy loading, reduced motion, keyboard/touch access, broken URLs and reference-safe deletion; no experiment code executes in the listing.

### Phase 5 — Integrated performance, accessibility and release QA

- Verify `/labs` transfers no compiler/editor bundle and creates zero experiment runtime iframes/React roots.
- Verify one detail page starts at most one experiment runtime, only after its canvas approaches the viewport; navigation away stops it.
- Measure poster/media bytes, responsive sizes, image caching, LCP, CLS, runtime startup, long tasks and memory on desktop/mobile.
- Test guest, signed-in-unverified, verified and owner paths. Guest payloads/caches never contain source bytes, drafts, owner previews or secrets.
- Run compiler/build/browser tests, reduced-motion and keyboard tests, slow-network/timeout tests and regressions for existing portfolio routes and four built-in experiments.
- **Release gate:** all Phase 0–5 checks pass on the same deployed Preview commit. Production publishing remains separately gated by existing security, owner, storage and source-access requirements.

## 12. Required acceptance tests

### Code and compiler
- A starter React JSX project builds and mounts through ReactDOM.
- A starter TSX project type-checks with `tsc --noEmit`, bundles and mounts; deliberately invalid types produce file/line/column errors and block Publish.
- Nested TSX imports compile and Tailwind v4 scans classes inside nested TSX files.
- `motion/react`, `lucide-react` and approved `react-icons` subpaths work in TSX.
- Local imports within the project root build; traversal, remote imports, unknown packages and Node APIs fail.
- Tailwind v4 responsive and state utilities compile from supported JS/JSX/TS/TSX source files, including nested components.
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


### Gallery posters and page UX
- Gallery cards render a selected published gallery-preview asset, otherwise a generated poster matched to the published source/artifact version, otherwise LabArtwork/neutral artwork.
- The Labs listing starts zero experiment runtime iframes, compiler jobs or experiment React roots; scrolling/loading more cards does not execute code.
- An experiment with no uploaded media can receive a poster from its actual successfully rendered HTML/Canvas or React/Motion output.
- Card image/GIF/video behavior is lazy, bounded and reduced-motion-aware. Video does not autoplay with sound; offscreen media is not continuously active.
- The public detail page runs the exact published artifact and never leaves a blank white canvas while loading or after failure.
- Route skeletons exist for Labs listing/detail and owner inventory/editor; they reserve layout space and do not duplicate the global page loader.
- Guest source panel: Sign in and Create account. Signed-in unverified source panel: Verify email. Verified source panel: automatically load and render published source with no auth CTA. Guest navbar: Sign in/Create account (one relevant action omitted on the matching auth form); signed-in navbar: account menu.
- Optimistic reversible actions reconcile with the server and roll back on failure. Publish/unpublish/delete never report success before server confirmation. Copy feedback/analytics require successful Clipboard API acknowledgement.

## 13. Decisions still open

These decisions must be resolved before the corresponding implementation phase. Do not silently guess:
1. Immutable artifact/object storage provider for compiled JS/CSS/HTML bundles. Cloudinary is for media delivery, not the default compiler artifact store.
2. The compiler's exact React/TypeScript/React Icons package versions and generated TypeScript settings must be pinned in the next toolchain release.
3. Final resource ceilings, cost controls, snapshot retention/refresh policy and browser runtime host/origin must be verified against the deployed Vercel Sandbox configuration.
4. Cloudinary upload limits, transformation quotas, draft access mode and public delivery mode.
5. Exact max upload size, video duration, dimensions and per-owner storage quota, derived from the actual account plan.
6. Whether additional browser capabilities such as Web Workers, WebGL/Three.js, WebAssembly and controlled outbound API access are added after the initial release.
7. Whether a media-only experiment type is ever needed; the current baseline remains an interactive code experiment. Uploaded media and generated posters are presentation assets, not substitutes for the executable experiment.

Detailed implementation requirements and the current deployment-gate status for TypeScript/TSX, React Icons, compiler snapshots and the preview HTTP server are in `LABS-REACT-JSX-TSX-TAILWIND-MOTION-RUNTIME-PLAN.md`.

8. Headless-browser screenshot capture provider/tool and execution location for generated posters; it must operate inside the approved isolation boundary without reading cross-origin iframe pixels from the portfolio origin.
9. Schema migration/cardinality and public delivery strategy for gallery-preview, detail-gallery and runtime-fallback roles. The currently implemented API supports only the legacy single fallback-preview attachment.
10. Poster viewport, image format/quality/byte budget and regeneration rules, validated through real Canvas and Motion examples.
11. Final route skeleton placement/shared component API after inspecting the actual App Router tree; do not create duplicate global/page-level loaders.

No package installation, Production configuration change, media quota assumption or release publication is authorized merely by this planning document.
## 39. Dual-mode experiment rendering architecture — 5 November 2026

**Decision:** The published detail page must support two explicit execution modes. Do not force standalone HTML projects through the same assumptions as a React application. Both modes compile in the isolated Labs compiler, publish immutable output files and use the same artifact-delivery route and sandboxed detail iframe.

### 39.1 Diagnosis from the deployed Preview

The supplied screenshots show an iframe/runtime failure, not a Next.js route-build failure. The inspected Preview `oi4y9ygre` (commit `50ed563d04b840eac4058308728052ed4394f710`) reached `READY` and Vercel reported `Compiled successfully`. The route exists in its route manifest. The screenshots nevertheless show:
- **Fluid Gradient Playground:** the HTML entry is visible in browser-default typography on a white surface. Its stylesheet and animation script are not being applied. This is consistent with broken/missing compiled asset references or assets not emitted/served at the paths referenced by the HTML.
- **Spotlight Dock:** the React experiment surface remains blank and the generic runtime bridge reports no rendered output. The current smoke tests prove compiler output exists but do not prove that the published HTML entry loads every module/CSS asset and commits a React render in the browser.

The previous HTTP CSP adjustment is necessary for the opaque-origin iframe, but it is not sufficient evidence that the actual asset graph is correct. Do not label these screenshots fixed until browser-level tests pass.

### 39.2 Deterministic project classification

Classify a validated source snapshot before building. Never guess based only on whether one file has a JSX-like extension.

| Mode | Detection / required structure | Execution contract |
|---|---|---|
| `static-html` | Has one unambiguous HTML entry; may include CSS, classic JS, module JS and inline HTML/CSS/JS | Preserve authored document and local file relationships. Do not require React, JSX, Tailwind or Motion. |
| `react-js` | Complete approved React JS entry structure, or an explicitly selected single-file JSX component adapted by the platform | Compile with the pinned React 19 + Vite toolchain; generate missing platform-owned entry files for the single-file adapter. |
| `react-ts` | Complete approved React TSX entry structure, or an explicitly selected single-file TSX component adapted by the platform | Type-check first, then compile with the same pinned React/Vite toolchain. |

Invalid/mixed structures return a clear actionable build error. A project must not silently fall back from React to static HTML when the React entry is incomplete.

### 39.3 Static HTML/CSS/JavaScript build path

The static path is a document-preserving static assembler, not a React build:
1. Resolve the selected HTML entry. A single nested HTML file may become the output `index.html`; multiple HTML files require an explicit `index.html` entry.
2. Build a normalized source-path map before rewriting anything. Resolve each relative `src`, `href`, `poster` and CSS `url(...)` reference relative to the original HTML/CSS file directory.
3. If a reference is missing at its written path, resolve by basename only when exactly one safe source file matches. If zero or multiple candidates exist, fail with the exact missing/ambiguous path; never silently omit a stylesheet or script.
4. Preserve authored inline `<style>`, inline `<script>`, classic `<script src>`, and `type="module"` scripts. Preserve `defer`, `async`, `type`, ordering and attributes. Do not place a script tag inside another script tag and do not convert classic scripts to module scripts implicitly.
5. Copy all validated browser files into the immutable artifact using stable relative paths. Generate a root `index.html` only when the adapter is intentionally generating a missing entry; do not replace an authored HTML document with a generic shell.
6. Emit an artifact manifest that lists every copied file, byte size and content type. Validate every referenced local CSS/JS file resolves to an emitted artifact file before the release is marked ready.

The existing source-file policy remains in force: no user package installation, no Node/runtime server code, no environment/secret files, no unrestricted network access, and no source execution in the Next.js process. Binary media remains under the separately approved media attachment flow; do not pretend arbitrary image files are supported by the text-source pipeline.

### 39.4 React JSX/TSX + Tailwind v4 + Motion build path

The React path uses the pinned isolated Vite compiler:
1. Validate the required React entry structure or generate platform-owned entries for a single-file JSX/TSX component.
2. JSX projects use React/React DOM 19. TSX projects run the pinned TypeScript check before bundling.
3. `src/index.css` must load Tailwind CSS v4 through the platform-approved PostCSS integration. Vite must emit the compiled CSS and JS module chunks referenced from the final HTML.
4. Motion must be imported from `motion/react`. Keep React/React DOM deduped and package imports on the explicit allowlist.
5. Validate the final HTML's module script, CSS links, modulepreload links and every emitted chunk against the output manifest. Missing or unreferenced bundles fail the build rather than producing a published blank canvas.
6. The generated React entry must expose a positive mount-ready signal after the first React commit. For user-authored entry points, use a platform-owned root/mount adapter or an explicit validated ready contract; do not treat an empty `#root` as success.

### 39.5 Shared immutable artifact contract

Both build modes publish the same version-bound artifact shape:
- `artifactId`, `sourceVersionId`, `sourceContentHash`, `buildHash`, `mode`, and `entryPath`.
- `outputFiles[]`: normalized relative `path`, verified `contentType`, `byteSize`, and immutable Blob URL.
- Build status becomes `ready` only after the manifest is complete, every output file is uploaded and verified, the entry exists, and the local reference graph is valid.
- The current published source-version pointer must match the artifact's `sourceVersionId` on every public runtime delivery. Drafts and unpublished files are never served through the public route.

### 39.6 One public detail renderer

The detail page remains presentation-only and does not compile or evaluate project source. It reads the exact published artifact pointer and renders one sandboxed iframe:
- `static-html`: the root HTML document is served as inline HTML; its original classic/module scripts and CSS load from the same artifact URL namespace.
- `react-js` / `react-ts`: the root HTML document loads Vite's emitted CSS and module chunks from that same namespace, then reports React mount readiness.
- The runtime route serves only paths present in the ready artifact manifest. It returns explicit MIME types, inline disposition, no-referrer, opaque-origin-compatible CSP and immutable cache headers. An asset lookup miss returns a real 404 and safe diagnostic event; never silently return the HTML entry for a missing JS/CSS path.
- Keep `sandbox="allow-scripts"` without `allow-same-origin`. Do not relax it to hide asset bugs.
- Static runtime readiness is sent after `load` plus a document/visual readiness check. React readiness is sent after the React root has committed. Runtime errors, rejected promises, CSP violations, asset 404s and readiness timeout are reported distinctly.
- The parent accepts messages only from the current iframe and exact artifact ID. The iframe receives no cookies, source snapshot, owner token or database access.

### 39.7 Owner Run and publishing parity

Owner Studio Run and Publish call the same mode classifier, path normalizer and build implementation. The only difference is output destination:
- Run builds the unsaved editor working copy into an expiring isolated preview session.
- Publish builds the saved immutable source version and stores a ready artifact.
- Do not maintain separate static/React behavior in Run and Publish. A project that passes Run must exercise the same generated HTML and asset graph that Publish later stores.

### 39.8 Required regression matrix and release gates

| Fixture | Required proof |
|---|---|
| Root `index.html` + root `style.css` + classic `script.js` | Styled page, script side-effect visible, all requests 200 with correct MIME |
| Nested `src/index.html` + `src/index.css` + `src/script.js` | Normalized output paths work without basename guessing when paths are explicit |
| Root `index.html` referencing unique nested `src/index.css` / `src/script.js` | Unique-basename fallback rewrites paths; ambiguous matches fail clearly |
| Inline CSS + inline JS + Canvas animation | Background, layout and Canvas render; animation starts; no nested script markup |
| React JSX + Tailwind v4 + Motion + state | CSS utilities load, React root commits, Motion animation runs, interaction changes state |
| React TSX + Tailwind v4 + Motion | Type-check passes, bundles load, React root commits, interaction runs |
| Missing CSS/JS chunk / wrong MIME / CSP rejection | Specific runtime diagnostic and retry state, not a silent blank/unstyled document |
| Old artifact after a new publish | Old immutable URL remains internally consistent; public slug resolves only the current published pointer |

Release acceptance requires a deployed browser test for every fixture, not only a Vite build or smoke test. Capture network status/content-type for each CSS/JS asset and confirm visible output. The current compiler smoke test must be extended to fetch the served artifact entry and all referenced assets; a future headless Chromium pass should additionally assert rendered styles, React mount signal, Canvas output and a working Motion/state interaction.

### 39.9 Implementation phases

1. **P0-A — Inventory and classify:** record the exact source paths and authored HTML references for the two failing published experiments; establish whether each is static or React and retain their immutable source versions.
2. **P0-B — Static adapter:** implement path graph resolution, preserve classic/module scripts and CSS, copy static browser files and fail on missing/ambiguous references.
3. **P0-C — React adapter:** make the React root/ready signal deterministic and validate the complete Vite CSS/module asset graph.
4. **P0-D — Artifact route hardening:** serve only manifest-listed files with correct types, status codes, CSP and cache semantics; add per-file diagnostics.
5. **P0-E — End-to-end verification:** Run and Publish each fixture, then test the published detail iframe and all built-in demos in browser.
6. Only after P0 passes, resume skeletons, generated posters and optional media-role rendering.

**Current status:** Architecture decision recorded. The shared iframe and immutable artifact route exist, but this dual-mode build contract and full browser-level asset verification are not yet complete. The previous CSP repair alone did not resolve the supplied screenshots.

---

## 40. Gallery/detail source-parity audit and shared engagement implementation — 5 November 2026

### 40.1 What the code actually did before this update

The public gallery and detail page were **not** rendering the same source implementation:

- `src/app/components/labs/LabsCollection.js` rendered `experiment.thumbnail` when present, otherwise it called `LabArtwork`.
- `src/app/components/labs/landing/LabArtwork.js` selected four hand-authored visual compositions by slug. These were separate visual approximations; they were not generated from the protected source snapshots or the running experiment.
- `src/app/components/labs/detail/LabWorkspace.js` selected a detail runtime through `LabRuntimeBoundary`.
- The four original experiments used literal lazy imports in `runtime/registry.js`.
- Owner-created custom experiments used the exact published `LabBuildArtifact` behind the isolated artifact iframe.
- `LabSource` / `LabSourceVersion` stored protected source snapshots. For the four original registry experiments, a saved source snapshot was not automatically the code used by the public runtime. Editing that snapshot alone could not update the live demo.
- The custom public DTO in `public-experiments.js` returned `thumbnail: null` and empty controls. The current `LabExperiment` media schema supported only one `fallback-preview` attachment, not a gallery cover or detail gallery.

This distinction matters: a protected source copy, a code-owned runtime component, an owner working copy and a published artifact are not interchangeable sources of truth.

### 40.2 Rendering decision — one published source, two presentation outputs

The gallery must not execute every experiment. Doing so would mount multiple React trees/iframes, start Canvas/Motion loops and recreate the performance problem raised in the product discussion.

Instead, the target parity contract is:

`immutable source version` → `one validated build artifact`

That same exact artifact produces two outputs:

1. **Gallery:** a static poster captured from the successfully rendered artifact, tied to the exact source version and artifact ID. An explicitly selected published gallery image/GIF/video may be preferred as the card cover. The gallery never executes code.
2. **Detail:** the actual interactive artifact served through the existing sandboxed runtime iframe. This is the source-derived live experience.

Both outputs must resolve from the same published release pointer. A poster from another artifact/version is stale and must be rejected. Metadata, poster, source and runtime must never be selected independently from different releases.

The four code-owned experiments must migrate through the owner source/compiler workflow before this parity can be claimed for them. Until each migration is verified, their existing registry runtime and `LabArtwork` remain compatibility fallbacks—not proof of source parity.

### 40.3 Shared preview presentation component

Implemented on this branch:

- New `src/app/components/labs/LabExperimentPreview.js` centralizes static preview selection for discovery surfaces.
- The card gallery and featured experiment both use this component.
- It checks the selected public `galleryPreview` (which is accepted only for the exact published artifact/version), legacy `thumbnail`, and any future `generatedPoster` reference, then falls back to `LabArtwork`.
- It renders only a static image/artwork. It does not import the runtime registry, mount React experiment components, create iframes or compile source.

This unifies the **static preview presentation**, but it does not itself generate a code poster. Generated poster capture and release-bound poster metadata remain a separate implementation phase below.

### 40.4 Shared optimistic Like control

Implemented on this branch:

- New `src/app/components/labs/LabLikeButton.js` is shared by gallery cards and the detail-page appreciation section.
- The button uses React `useOptimistic` and `useTransition`: it updates heart state and the visible count immediately, then sends the desired state to the existing engagement endpoint.
- The last confirmed server state is retained. A network failure or non-success response (including 403, 404, 429 or 503) ends the optimistic action without replacing confirmed state, so React rolls the visual state back and the component shows an error message.
- Duplicate clicks are disabled while the mutation is pending.
- The Labs listing gets visitor-specific counts and liked state through one server-side batch read rather than issuing one GET for every card. If the batch is unavailable, gallery like buttons are disabled instead of creating an N+1 request burst.
- The detail page supplies its server-rendered snapshot to the same control; it can make one detail-scoped GET fallback if the snapshot is unavailable.
- The engagement API now accepts both the original code-owned experiments and published custom experiments whose exact current published artifact is ready.
- Existing verified-user and signed-guest persistence, transaction-backed state transitions, rate limiting and analytics event recording remain server-owned. Unverified sessions cannot write likes.

### 40.5 Remaining source-parity phases

| Phase | Work | Acceptance |
|---|---|---|
| A — Release source contract | Add/finish an immutable published release descriptor binding metadata, exact LabSourceVersion, LabBuildArtifact, poster and media references | A public slug resolves one internally consistent release |
| B — Poster generation | Capture a static image from the exact artifact only after the isolated runtime is ready; bind sourceVersionId, artifactId, dimensions and hash | HTML/Canvas and React/Motion artifact fixtures produce correct posters; failed/blank runs do not replace a valid poster |
| C — Public DTO | Return safe gallery-preview/poster references and the matching runtime descriptor from the same release resolver | Gallery and detail resolve identical release IDs/hashes |
| D — Built-in migration | Move Magnetic Interaction, Scroll-driven Text Reveal, Gradient Bloom and Generative Particle Field into the owner source/compiler/publish flow one by one | Each built-in's detail runs the artifact built from its managed source; its gallery poster is captured from that same artifact |
| E — Retire legacy artwork/runtime | Only after each experiment passes parity QA, remove its slug-specific artwork and old registry entry | No public experiment relies on a separately maintained artwork/runtime implementation |

Do not use a live per-card React renderer as a substitute for the poster pipeline. Do not remove existing working built-in runtimes before each artifact replacement has passed visual, interaction, responsive and reduced-motion regression tests.

### 40.6 Validation status

- The shared Like component, batch snapshot service, gallery/detail integrations and custom-experiment engagement route passed targeted ESLint.
- The production Next.js build passed, including SEO validation, TypeScript and static-page generation.
- The shared static preview component is now used by both the gallery card and featured card; its latest refactor still requires the final targeted lint/build run.
- No browser interaction test has yet confirmed guest/verified like persistence and rollback, and no generated poster capture pipeline has been implemented by this update.
- No original experiment has yet been migrated from the code-owned registry to the same immutable source/build release as its future gallery poster.

---

## 41. Optional dynamic controls and first-party component SDK — 5 November 2026

### 41.1 Non-regression requirement: preserve the current authoring/runtime system

This is an additive capability. Do not replace, narrow, or silently re-detect the current project modes.

The existing source-management and compiler contract remains authoritative:

| Existing capability | Must remain supported unchanged |
|---|---|
| Standalone HTML | Root or supported nested single HTML entry, inline markup/styles/scripts |
| Standalone CSS | CSS-only starter and generated HTML entry |
| Standalone JavaScript | Classic/module JS and current generated static entry behavior |
| React JavaScript/JSX | Single-file convenience mode and multi-file React 19 project |
| React TypeScript/TSX | Generated strict TypeScript config, `tsc --noEmit`, Vite build |
| Tailwind CSS v4 | Existing fixed build-time compilation and source scanning |
| Motion | Pinned `motion/react` package and existing animations/hooks |
| Lucide | Existing fixed `lucide-react` imports |
| React Icons | Existing fixed `react-icons/*` imports |
| Owner Run | Compiles the exact current unsaved editor files; does not save/publish |
| Source history | Immutable source versions, hashes, restore-as-new-version |
| Publish | Rebuilds the exact saved version; atomic published pointer update |
| Isolation | Per-run sandbox, fixed package allowlist, no outbound network/app secrets |
| Media | Existing optional media workflow remains separate from executable source |

The compiler's mode detector and current HTML/React entry-preparation paths remain unchanged unless a dedicated regression test proves a narrowly scoped adjustment is required. No component-controls feature may make an HTML/JS project require React or make a React project lose Tailwind/Motion/TypeScript support.

### 41.2 Single source of truth: optional `lab.config.json`

Use one optional root-level source file, `lab.config.json`, for public runtime settings and owner-defined controls.

- It is an ordinary text JSON file in the existing source editor/file list.
- It is saved, versioned, hashed, restored and audited with the rest of the source files through the existing `LabSourceVersion.files` contract.
- It is not a second mutable MongoDB control record.
- It must be parsed and validated by a platform-owned server module before Run or Publish.
- The platform extracts this file before compilation and does not emit it as a public static asset or import it into the application bundle.
- The full source hash includes the config file. Changing a control label, default or bound is a source change and requires a new saved version before Publish.
- If the file is absent, has an empty `controls` array, or has no usable control definitions, the detail page has no controls panel and no empty sidebar.

Only the exact root path `lab.config.json` is platform-recognized. Do not reserve all JSON files: ordinary JSON data imports/files must continue to work. Keep package manifests, lockfiles, Vite/PostCSS/TypeScript configs and other compiler-owned files reserved as they are today.

### 41.3 Manifest contract and generic control model

The optional root manifest contains a schema version and an ordered list of control descriptors. Each descriptor has a stable ID, label, supported type, default value and type-specific bounds or options. The platform validator owns the definitive schema. This architecture document intentionally does not duplicate component-specific configuration examples or executable component source.

The schema describes controls, not a particular React component. A different experiment can declare unrelated settings and groups—for example gradient color/intensity/spread, particle count/speed/distance, reveal progress, or multiple independently configured component instances.

Supported first version reuses the control types already rendered by `LabControlsPanel`:
- `range`
- `number`
- `toggle`
- `select`
- `color`

Each descriptor has a stable unique ID, label, type, default value and type-specific constraints. Optional fields: group label/order, short helper description and control order. Select options are bounded and validated. Ranges/numbers require finite min/max/step/default values with valid bounds. Colors use the existing strict hex-color pattern. Do not accept executable expressions, callbacks, HTML, arbitrary selectors, package names, or source snippets in the manifest.

Initial limits should be conservative and enforced server-side: one manifest only; bounded file size; at most 20 controls; unique safe IDs; bounded labels/groups/options; bounded numeric ranges; known schemaVersion only. Unknown types/versions and invalid defaults fail validation before compilation/publication. The control values sent at runtime are validated against the same descriptor on every update.

Do not add speculative control types in the first release. Add a new type later only when it has all three pieces: schema validation, an accessible panel renderer, and a serialized runtime-value contract.

### 41.4 Owner Controls Builder and source editing

Add a dedicated **Controls** area in the owner Source Studio. It is a visual editor for `lab.config.json`, not a separate data store.

Owner flow:
1. Select **Add controls**; the studio creates root `lab.config.json` if absent.
2. Add a control and choose one of the supported types.
3. Configure stable ID, visible label, optional group, default and constraints/options.
4. See a live rendering of the same `LabControlsPanel` used on the public detail page.
5. Save the generated JSON as part of the current editor working copy.
6. Run the current unsaved source + config together.
7. Save a source version only when the owner chooses Save.
8. Publish only after the exact saved version builds and passes validation.

The source file remains the single source of truth. The visual builder reads/writes that file; the raw JSON file can also be opened in the existing editor. When raw JSON is edited, the builder must re-parse and show diagnostics instead of keeping an independent stale form state. Every builder change marks the editor dirty. Do not silently save, run or publish when a control is added.

The Controls area is optional and can be empty. Owner-created experiments with no config continue to run exactly as they do now.

### 41.5 Runtime settings API — component-agnostic

The platform must not attempt to infer a component's props from a label or control ID. The author explicitly connects settings to source code. This makes the same panel usable by different components and compositions without one component's controls affecting another accidentally.

For React/JSX/TSX, source code will consume validated settings through the versioned first-party SDK and map stable setting IDs to component props. The complete MagneticButton component source is provided separately in the companion ZIP package; executable component examples are intentionally kept out of this architecture document.

`useLabSettings()` returns a typed read-only values object (and, if required, a stable revision/subscription state). It subscribes to the isolated runtime bridge. React source explicitly maps the keys it wants to component props. Multiple components can use separate IDs/groups in the same experiment. A component remains usable with ordinary explicit props when no Labs controls exist.

For standalone HTML/JavaScript, expose a small bridge API inside the iframe (not the parent app):

```js
const current = window.Labs.getSettings();

window.addEventListener("labs:settings-change", (event) => {
  const settings = event.detail.values;
  // Update this experiment's own DOM/canvas state.
});
```

The event contains validated values, a revision and the run/artifact identity. It is dispatched inside the isolated document. No cookie, parent DOM, app session, server API or storage access is added.

For CSS-only/HTML experiments, allow an explicit safe `css-variable` binding on supported scalar controls, e.g. map a range/color to a validated `--lab-*` custom property. The bridge writes only validated values and approved units. This gives CSS-only experiments a useful no-JavaScript control path; it does not require the platform to interpret arbitrary CSS or selectors.

The component API, vanilla event API and CSS-variable binding all consume the same validated settings contract. They are adapters for the existing execution modes, not separate control databases.

### 41.6 First-party `@labs/ui` SDK and exact MagneticButton extraction

Create a versioned internal package/source unit, e.g. `packages/labs-ui`, with:
- `MagneticButton`
- `useLabSettings`
- shared control value/type declarations
- reduced-motion behavior compatible with the current Labs runtime
- a minimal static/vanilla settings bridge contract where applicable

The application-owned built-in experiment and isolated compiler must resolve the same reviewed SDK implementation/version. The compiler receives this package in its immutable prebuilt image/snapshot; it is not downloaded from the internet and is not an owner-installed dependency. Add only the exact `@labs/ui` import to the compiler allowlist/alias. Keep the current fixed package list intact: React/React DOM, Motion, Lucide, React Icons, clsx and tailwind-merge.

Magnetic extraction must preserve the exact existing values and behavior:
- Motion spring: stiffness 280, damping 24, mass 0.55.
- Pointer displacement multiplier 0.24 and proximity exponent 1.25.
- Default strength 28, valid maximum 42, default radius 180 and valid radius 80–300.
- Same center-of-field measurement, distance clamp, touch bypass, reduced-motion bypass, pointer-leave spring reset and button interaction.
- The existing radial background, dot grid, dashed field ring, engagement label, instructional copy and activation counter remain in the Magnetic Interaction experiment composition; they are not forced into every use of the button.
- Default component markup/classes reproduce the current button's size, spacing, border, brand surface, shadow, icon/dot and arrow. Optional props such as className/onClick are additive and cannot change default behavior.

First extract and regression-test the component inside the existing built-in Magnetic Interaction. Only after it is visually/behaviorally identical should the same SDK version become available to owner-authored React projects. Do not duplicate a second magnetic physics implementation in the compiler.

### 41.7 Runtime bridge and execution-mode adapters

The published detail page owns the control values and renders the existing accessible `LabControlsPanel` only when validated controls exist.

- Initialize values from each descriptor's defaultValue.
- Range/number/select/toggle/color changes update the parent state immediately.
- Send the complete validated values object (or a bounded patch with monotonically increasing revision) to the active iframe.
- When the iframe reports ready, send the latest values again; never assume the initial message arrived before its listener.
- Reset returns values to manifest defaults and sends the resulting state to the iframe.
- Keep values local to the current page session; do not persist visitor adjustments in MongoDB or mutate the published source.
- On iframe restart/retry, replay the current state after the matching run/artifact handshake.
- A stale iframe/run ID must not receive or apply another run's state.

Messaging/security:
- Version every message schema.
- Correlate messages with exact experiment slug, runId/artifactId and a fresh handshake nonce.
- Because the existing published iframe deliberately uses an opaque sandbox origin (`sandbox="allow-scripts"`, no `allow-same-origin`), do not depend on a non-opaque frame origin. Validate `event.source`, exact expected run/artifact ID, nonce and message schema; restrict which parent messages the runtime bridge will accept.
- Bound message payload size, value count and update frequency. Throttle high-frequency slider messages to animation frames or a small bounded cadence.
- Never expose parent cookies, app APIs, source-management credentials or arbitrary messaging to experiment code.

Owner Run uses the same bridge but receives the current **unsaved editor files and unsaved config**. It must not read the saved draft or public release to build a Run preview. The preview returns the validated control schema for the current run; the owner preview panel uses the same control renderer/bridge so owner can test values before saving.

### 41.8 Detail rendering and source parity

The public detail resolver loads controls from the same immutable published source version/artifact used for the runtime. Do not read controls from a newer draft or a separate mutable experiment document.

For custom experiments, the validated control schema is stored in the immutable build/release manifest (or an equally immutable version-bound record) and its hash/version is linked to:
- experiment slug,
- exact LabSourceVersion.versionId,
- source contentHash (which includes lab.config.json),
- exact LabBuildArtifact.artifactId/buildHash,
- settings schema version.

The public page receives only the public control descriptors, not owner source or draft files. The public controls panel and iframe must always reference the same release. A release with invalid/missing settings metadata is not publishable.

Built-in experiments may continue reading their current code-owned `demo.controls` during migration. Do not break the four current demos while the new release format is added. Migrate one by one; after Magnetic Interaction passes, move its manifest to its managed version and use the same SDK/bridge path.

### 41.9 Save, preview, publish and rollback semantics

- **Edit:** update the in-memory `files` state, including optional `lab.config.json`; show dirty state.
- **Run:** validate and compile the exact current unsaved files + config; preview is temporary and expires. Run does not save, increment a source version, or move a public pointer.
- **Save draft:** existing `saveOwnerLabDraft` stores the full file array in an immutable LabSourceVersion. The existing contentHash naturally includes the config file. No separate control mutation.
- **Restore:** existing `restoreOwnerLabVersion` copies an earlier version's entire files array into a new draft. The code and controls restore together as a new version.
- **Publish:** validate config again, rebuild the exact saved version, store the controls schema with the exact ready artifact/release, then atomically update the published version/artifact pointer. No partial release.
- **Failed validation/build:** retain the existing working editor state, prior draft and prior published release. Never replace the public pointer or delete old artifacts on failure.
- **Rollback:** restore an earlier source version as a new draft and explicitly republish it. This restores its code and controls together. Do not mutate immutable history or silently switch only the controls.
- **No controls:** valid and publishable. No controls panel/bridge UI is required beyond the runtime's lightweight capability handshake.

### 41.10 Compatibility matrix — mandatory regression gate

| Mode | Build/runtime | Controls adapter | Must remain working |
|---|---|---|---|
| Single HTML | Existing static HTML path | Vanilla event API / safe CSS variables | Inline HTML, CSS, JS, Canvas, media elements |
| HTML + CSS + JS | Existing static entry and asset resolution | Vanilla event API / safe CSS variables | Linked styles/scripts and nested-entry behavior |
| CSS-only | Existing generated HTML entry | Safe CSS custom-property binding | Tailwind is not imposed on static CSS |
| React JS/JSX | Current generated or multi-file React entry | `@labs/ui` hook | React hooks/state, Tailwind v4, Motion, Lucide, React Icons |
| React TS/TSX | Current strict typecheck + Vite | Typed `@labs/ui` hook and declarations | Type validation, JSX, Tailwind v4, Motion and icon imports |
| Motion component | Existing pinned Motion package | Props sourced from useLabSettings | Motion springs, gestures, reduced motion |
| Project with no config | Existing current runtime | None | No panel, no behavior change |

Existing fixed dependencies must not be replaced or silently upgraded to add `@labs/ui`. SDK version changes require compiler snapshot regeneration and the full smoke suite.

### 41.11 Implementation phases and acceptance

| Phase | Work | Acceptance |
|---|---|---|
| 1. Freeze current behavior | Add interaction/visual fixtures for Magnetic Interaction; record exact DOM, classes, physics defaults, reduced-motion/touch/leave behavior | Baseline can be compared before extraction |
| 2. Extract MagneticButton | Move only button physics/markup into shared source; preserve experiment decorations and copy | Built-in demo matches baseline; existing controls still work |
| 3. Package SDK | Add versioned `@labs/ui` to app and immutable compiler image; type declarations for TSX | React JS and TSX smoke tests import it; old package imports remain |
| 4. Settings contract | Implement strict `lab.config.json` validator and versioned values DTO | Valid/invalid schemas, defaults, bounds, unknown types tested |
| 5. Owner Controls Builder | Add visual controls editor that writes the root JSON source file; raw JSON and visual builder remain synchronized | Add/edit/reorder/delete marks editor dirty; no hidden independent state |
| 6. Runtime bridge | Parent settings state, ready/replay/reset and iframe-to-parent protocol for React and static modes | Run ID/nonce isolation; no lost initial settings; bounded high-frequency updates |
| 7. Detail integration | Derive controls from the exact published artifact release; optional panel only | Code and panel always represent the same version |
| 8. Magnetic migration | Move the original experiment to the same SDK/config/bridge path | Exact animation and visual parity; no duplicated physics |
| 9. All-mode regression | Exercise all current execution modes with and without config | Existing Run behavior, source hash, save, restore and publish preserved |
| 10. Release gate | Preview browser test before Production | No release until the full matrix passes |

Required tests include:
- Existing Fluid Gradient nested HTML entry with inline styles/Canvas and linked CSS/JS.
- CSS-only generated document.
- Single-file JS marked JSX, multi-file React JSX, valid/invalid TSX.
- `motion/react`, `lucide-react`, multiple `react-icons` packs and Tailwind v4 utility generation.
- All current compiler smoke tests and source security tests.
- The same experiments with no `lab.config.json`, an empty manifest and a populated manifest.
- Invalid JSON, duplicate IDs, unsupported types, invalid ranges/colors/options, too many controls and oversized config.
- Range changes before iframe readiness, during iframe restart, rapid slider movement and reset.
- Two MagneticButton instances with independent control IDs.
- Unsaved Run vs saved draft vs previously published artifact.
- Restore old version, failed publish and rollback preserving prior public code + controls.

**Definition of done:** controls are optional source-managed configuration, different experiments can declare different control groups/types, React authors use `@labs/ui`/`useLabSettings()`, static authors use the in-frame settings event/CSS-variable contract, and every current HTML/CSS/JS, React JSX/TSX, Tailwind v4, Motion, Lucide and React Icons workflow keeps passing without regression.

---

## 42. MagneticButton extracted into Source Management — Phase 1 implementation — 5 November 2026

### 42.1 Clarified deliverable

“Extract MagneticButton” means the owner must receive editable, runnable source files in the existing Source Management Lab. An app-internal import alone is not the deliverable.

The implementation therefore provides a separate owner-created draft experiment named **MagneticButton Component** at slug `magnetic-button-component`. It is intentionally separate from the existing built-in `magnetic-interaction` experiment:
- The built-in's public runtime remains the reviewed code-owned experiment.
- The component workspace is a private owner draft and is not automatically published.
- Importing it must not replace an existing owner draft; an existing draft is returned unchanged.
- The owner can open the workspace, inspect/edit files, Run the unsaved copy, save versions, restore and explicitly publish later using the existing source-management flow.

### 42.2 Owner entry point and import contract

The owner entry point is `/admin/labs/sources/import`, in the existing Runtime source initialization area. A separate **MagneticButton Component** panel calls:

`POST /api/v1/admin/labs/sources/import-magnetic-button`

The route:
1. Verifies the current Labs owner and same-origin mutation.
2. Looks for the `magnetic-button-component` owner workspace.
3. Creates a custom experiment/source record when no workspace exists.
4. Gets the portable project files from `src/app/lib/labs/magnetic-button-source-project.js`.
5. Saves them as the first immutable private draft only when no draft exists.
6. Returns `/admin/labs/sources/magnetic-button-component` for the editor.
7. Never publishes or changes the existing built-in's public pointer.

### 42.3 Files imported into Source Management

The template contains seven editable source files:
- `index.html`
- `src/main.jsx`
- `src/App.jsx` — runnable MagneticButton composition/demo
- `src/components/MagneticButton.jsx` — extracted reusable component
- `src/components/MagneticButton.d.ts` — TypeScript-facing prop contract
- `src/components/magnetic-physics.mjs` — pure pointer physics
- `src/index.css` — minimal theme tokens and Tailwind v4 import

The project uses only already-installed/allowed imports: React and `motion/react`, plus relative local files. It does not import `@/app/*`, Next.js, the portfolio's MotionProvider or any server-only application module. The generated project is an ordinary multi-file React JSX project; a declaration-only `.d.ts` file must not force the compiler into TypeScript entry mode.

### 42.4 Reusable API and preserved behavior

Current component API:
- `children`
- `fieldRef` (optional larger interaction area; otherwise the button itself is measured)
- `strength` (default 28; normalized to 0–42)
- `radius` (default 180px; normalized to 80–300px)
- `onClick`
- `onEngagementChange`
- `className`
- `disabled`
- `aria-label`

The generic controls mapping is straightforward and intentionally component-agnostic:
- `magnetStrength` → `strength`
- `fieldRadius` → `radius`
- experiment-level `showField` remains the composition's responsibility; it controls the dashed visual radius, not MagneticButton's pointer math.

The pure helper preserves the original spring (280 / 24 / 0.55), pointer multiplier (0.24), proximity exponent (1.25), radius boundary, strength clamp, pointer-leave reset, touch bypass and reduced-motion bypass. Decorative field/background/instructions and activation counter remain in the experiment composition.

### 42.5 Compiler compatibility and verification

The source project was generated from the actual component/helper files and compiled using the isolated Labs compiler. It contains no app-only alias imports. Verification completed:
- Source template generated all seven expected files.
- Isolated Labs compiler build succeeded and emitted a build hash.
- Existing Labs compiler smoke suite passed (HTML/CSS/JS, JSX/TSX, React 19, Motion, Tailwind v4, icons, CSP and isolation regressions).
- Focused ESLint passed for the extraction, source template, owner import route, import panel and compiler changes.
- Next.js production build, SEO validation, TypeScript and all 17 static pages passed.

### 42.6 Scope boundary — not yet delivered

This is the **source-managed Phase 1 extraction**, not the complete generic reusable SDK:
- `@labs/ui` is not yet an owner-importable compiler package.
- There is not yet a generic `lab.config.json` visual controls builder/settings bridge.
- The new workspace currently demonstrates strength/radius/showField through local React state, not through the future published-release controls manifest.
- Copying the component into another independent experiment currently means copying `MagneticButton.jsx` and `magnetic-physics.mjs` together. A versioned first-party SDK export is a later phase.
- No database experiment/draft was created automatically during this implementation; the owner must use the new Source Management import action after this commit is deployed.

---

## 43. Gallery thumbnail vs published artifact audit and plan — 6 November 2026

### 43.1 Audit result: the gallery does not currently render the compiled artifact as its thumbnail

The current code has two separate paths.

**Gallery / featured preview path**
1. `src/app/labs/page.js` combines `publishedLabExperiments` with `getPublishedCustomLabExperiments()`.
2. `LabsCollection.js` and `FeaturedExperiment.js` both render `LabExperimentPreview`.
3. `LabExperimentPreview.js` checks, in order: `experiment.galleryPreview`, `experiment.thumbnail`, `experiment.generatedPoster`. If none contains a `src`, it falls back to `LabArtwork`.
4. `LabArtwork.js` draws four hand-authored static compositions for the four original code-owned built-ins. Unknown/custom experiment slugs receive a generic category label—not an image of their app.

**Custom experiment detail path**
1. `src/app/labs/[slug]/page.js` calls `getPublishedCustomLabExperimentBySlug(slug)`.
2. `public-experiments.js` resolves `LabSource.publishedArtifactId` and `publishedVersionId`, then verifies a ready `LabBuildArtifact` has the exact same `experimentSlug` and `sourceVersionId`.
3. The public DTO receives that artifact's `artifactId` and an artifact-scoped `demo.runtimeUrl`.
4. `LabWorkspace.js` passes that URL and artifact ID to `LabRuntimeBoundary.js`.
5. `PublishedArtifactFrame` renders the artifact URL inside the isolated iframe. The runtime route verifies that the requested artifact is still the current published pointer, matches the published source version and serves its compiled files.

**Therefore:** the custom detail page runs the actual published artifact, but the custom gallery card does not show a screenshot of it. It currently receives `thumbnail: null` from the public custom-experiment DTO and falls back to generic `LabArtwork`. The featured experiment is currently one of the code-owned built-ins and uses the same static preview renderer/fallback artwork.

### 43.2 Implemented release-time artifact screenshot path

The branch now has an automatic capture stage in `buildAndStoreOwnerLabRelease()`:

- The exact saved source version is hash-verified and compiled by the fixed compiler before screenshot capture.
- The capture runs before the same disposable, network-denied compiler sandbox is stopped. It does not run from the owner editor's Run button, a gallery request, or the public detail request.
- `tools/labs-compiler/scripts/capture-poster.mjs` uses pinned Playwright 1.65.0 and Chromium 158.0.8127.18 from the compiler snapshot. It serves only the compiled output on an ephemeral loopback port and blocks every browser request except that local server, `data:` and `blob:` resources.
- The capture viewport is 1200×900 (4:3), device scale factor 1, reduced motion enabled, with a bounded font/layout settle period. It rejects blank output and JavaScript page errors.
- Capture is best-effort. A compiler build can still publish when the optional screenshot is unavailable; a previous release's screenshot is never copied to a new artifact.
- PNG signature, exact dimensions, maximum 8 MB, source/browser/capture versions and SHA-256 are validated before the poster is accepted.
- A successful poster is written to an immutable Blob key containing the slug, source version, build hash and unique artifact ID. Its metadata is stored on the immutable `LabBuildArtifact.previewPoster` subdocument.
- The screenshot endpoint is served by the existing artifact runtime route, only if the requested artifact remains the current published artifact and its source version matches the current published version.
- The compiler capture version is `playwright-chromium-v1`; the toolchain pins Playwright `1.65.0` and Chromium `158.0.8127.18`. The matching browser binary and Linux libraries must exist in the deployed compiler snapshot. The capture worker never installs a browser at publish time.

The pinned browser was installed and tested in a disposable Vercel Sandbox. The source code, compiler package manifest/lockfile, capture script and smoke tests are committed. The compiler snapshot refresh and deployed Preview publish-flow test remain deployment verification steps; do not mark browser capture production-ready until they pass.

### 43.3 Required rendering and precedence contract

Resolve the visual from the same exact published release that runs in the detail workspace:

`LabSource.publishedVersionId` + `LabSource.publishedArtifactId`
→ exact ready `LabBuildArtifact`
→ the artifact's generated poster plus an optional owner-promoted public gallery media reference.

**Visual selection order (the same on gallery cards and the detail media preview):**

1. An explicitly owner-promoted uploaded image, animated GIF, MP4 or WebM video that is bound to the currently published artifact ID and source version.
2. The generated PNG screenshot captured from that exact artifact.
3. Existing code-owned `thumbnail` / `LabArtwork` / neutral artwork fallback when capture is unavailable.

An upload in the private media library is not automatically public. The owner must explicitly publish it as gallery media. Private `fallback-preview` attachments remain a separate runtime-failure fallback and are never exposed as public gallery URLs.

For uploaded video, the video is the selected gallery/detail media visual; the generated still PNG remains available as the social/Open Graph thumbnail. Uploaded GIFs remain animated unless the user has reduced motion, in which case the generated still can be shown. Uploaded video is muted, inline and looped in the visual preview; it does not replace the published interactive runtime.

The detail page keeps the same isolated, interactive artifact iframe below the optional media preview. Gallery cards use only static/media elements—never an experiment iframe, React mount, Motion/canvas runtime, or screenshot request. The poster route must never resolve by slug alone or use a draft/previous release poster.

### 43.4 Poster generation — publish-time, not request-time

The release pipeline implements the following bounded sequence:

1. Load the exact saved `LabSourceVersion` and verify its source content hash.
2. Compile that immutable source with the pinned React/TSX, Tailwind v4 and Motion toolchain.
3. Upload and validate the compiled output files under the immutable slug/sourceVersion/buildHash path.
4. Before stopping the same compiler sandbox, run the pinned Playwright capture worker against the compiled `index.html` on local loopback.
5. Reject external network requests; do not enable outbound networking or fetch fonts, images, scripts, packages or browsers during capture.
6. Wait for page load, fonts (bounded), two animation frames and a short settle period. Reject JavaScript page errors and pages with no visible result.
7. Capture one 1200×900 PNG with reduced-motion emulation. Enforce PNG signature, dimensions and an 8 MB maximum.
8. Hash the bytes with SHA-256 and upload to an immutable path scoped by slug, sourceVersionId, buildHash and artifactId.
9. Persist URL, path, content type, size, dimensions, hash, capture implementation, Playwright version and Chromium version in the artifact poster record.
10. Continue to the existing publication transaction. The source published pointer and poster are both associated with the same artifact; the public DTO exposes the poster only after pointer validation.

Capture is optional and non-blocking after a successful build. A missing browser, unsupported page, blank render, runtime exception, timeout or storage failure records an unavailable capture status/reason and lets the code release proceed. It must not attach the previous release's poster. Do not capture on Run or on any public page request.

### 43.5 Artifact poster storage and delivery

The strict optional `LabBuildArtifact.previewPoster` subdocument contains:

- `status`: `ready` or `unavailable`.
- `path`: reserved `__preview/gallery-poster.png` for a successful capture.
- `url` and `contentType`: only the verified public Blob reference and `image/png`.
- `byteSize`, `width`, `height` and `contentHash`: validated PNG metadata.
- `captureVersion`, `playwrightVersion` and `browserVersion`: exact pinned renderer identity.
- `reasonCode`: bounded non-sensitive reason when capture is unavailable.

The Blob key includes `slug/sourceVersionId/buildHash/artifactId`; retries or another artifact cannot overwrite it. Poster metadata is separate from `outputFiles`, so the compiled output-file count stays within its existing 80-file limit.

The existing artifact runtime route serves the reserved poster URL only after it verifies all of the following:

- The custom experiment is still published.
- The source published pointer equals the requested artifact ID.
- The published source version equals the artifact's sourceVersionId.
- The artifact status is ready.
- The poster metadata, pinned capture versions, Blob host, byte size, PNG signature, dimensions and SHA-256 hash match.

The route uses immutable cache headers and does not accept an arbitrary URL or caller-supplied storage path. A stale or mismatching poster returns not found; it never falls through to a previous artifact.

### 43.6 Public DTO and gallery component behavior

`getPublishedCustomLabExperimentBySlug()` and `getPublishedCustomLabExperiments()` resolve the active source/artifact pair first. The DTO validates the uploaded media's artifact/version binding and public Blob host, then calls the shared `resolveGalleryPreviewSelection()` policy:

- A currently promoted uploaded image/GIF/video becomes `galleryPreview`.
- Otherwise a valid generated poster from the active artifact becomes `galleryPreview`.
- If neither exists, the component uses existing artwork.
- For video uploads, the screenshot remains the still `thumbnail` for social metadata. For uploaded images/GIFs the uploaded asset is the thumbnail.

The public DTO never exposes private Cloudinary preview URLs, auth upload credentials, source text, environment variables or storage tokens. The selected upload is public only after the explicit owner promotion endpoint copies it into public Blob storage. Private fallback attachments remain private and separate.

`LabExperimentPreview` is shared by gallery cards, the featured block and the optional detail media-preview section. The detail page still mounts the live compiled artifact inside its existing isolated `LabWorkspace` iframe below the visual preview. If the selected asset fails to load, the static generated poster or artwork fallback keeps the layout intact.

### 43.7 Built-in experiment parity

The original four built-ins currently render from `runtime/registry.js` on their detail pages and use slug-specific hand-authored artwork in the gallery. They are not yet published compiled artifacts, even if their source is separately imported into Source Management.

To claim true artifact/poster parity for these built-ins:
1. Migrate one built-in at a time through the approved owner source/compiler/publish lifecycle.
2. Verify its published detail page executes that immutable artifact.
3. Generate its gallery poster from that same compiled artifact.
4. Verify sourceVersionId, artifactId and poster hash match across DTO/detail/gallery.
5. Only then remove that experiment's old registry runtime and hand-authored gallery artwork fallback.

Keep the working built-in registry/artwork until each experiment passes interaction, visual, reduced-motion, responsive, browser-capture and rollback tests. Do not make the new MagneticButton Component utility workspace a substitute for migrating the existing Magnetic Interaction experiment.

### 43.8 Performance and regression acceptance

**Gallery**
- Zero experiment iframes and zero runtime mounts per card.
- Zero screenshot generation on gallery page requests.
- One static poster image per eligible card, loaded lazily with responsive sizing.
- Uploaded image/GIF/video follows the explicit media precedence; videos are muted, inline, looping previews. Keep media loading bounded and do not mount experiment code in cards.
- Image error, absent poster or unsupported capture falls back to existing artwork without breaking card layout.

**Detail**
- Keep the current published artifact iframe and readiness/error/retry behavior.
- Keep its artifactId/source-version pointer validation.
- Gallery poster never replaces the interactive detail experience.

**Release**
- Capture the exact compiled artifact in the isolated environment, with bounded CPU, memory, timeout and image size.
- A failed compile never updates the public pointer (existing behavior).
- A failed poster capture never attaches a stale poster from another artifact.
- A successful poster is immutable and cacheable.
- Old artifacts/posters remain available only according to the existing published/rollback retention policy; never delete the previous release before a successful new publish.

**Fixtures**
- React JSX and TSX + Tailwind v4 + Motion + Lucide + React Icons.
- Standalone HTML/CSS/JavaScript, including Canvas.
- CSS-only generated entry.
- Experiments with delayed fonts/render and with no visible output.
- Motion/Canvas animations under reduced-motion capture.
- Very large images, oversized screenshot, blank app, runtime exception and browser timeout.
- Publish v1, publish v2, then verify gallery v2 poster and detail v2 runtime both use the v2 artifact; restore and republish v1 and verify both switch back to v1.
- Capture failure on v2 must never display v1's poster beside v2's detail runtime.

### 43.9 Implementation phases — current status

| Phase | Work | Acceptance |
|---|---|---|
| 1. Artifact poster contract | Add strict optional poster metadata/status to the immutable artifact and document the artifact-scoped poster route | Poster cannot be detached from artifact/source version |
| 2. Capture runtime | Implemented in source: Playwright 1.65.0 + Chromium 158.0.8127.18; the compiler snapshot must include the browser binary and OS libraries | Local-only, bounded, deterministic capture; snapshot/deployment verification required |
| 3. Publish integration | Implemented: capture from the exact build before sandbox shutdown; upload to artifact-specific immutable Blob path and persist metadata | Capture remains non-blocking; final deployed publish test pending |
| 4. Runtime delivery | Implemented: reserved artifact-scoped PNG route, active pointer and source-version checks, hash/dimension/type verification | Only the exact current release poster is delivered |
| 5. Public DTO | Implemented: shared uploaded-media/generated-poster selector validates the exact artifact/version pair | Upload > generated poster > artwork |
| 6. Gallery integration | Implemented: shared preview renderer on cards, featured block and detail media area | Cards remain code-runtime-free; uploaded image/GIF/video wins |
| 7. Built-in migration | Migrate each code-owned built-in through the artifact lifecycle sequentially | Registry/artwork removed only after parity QA |
| 8. Release regression | Test new publish, failed capture/build, restore and republish | No mixed poster/runtime releases; old release remains safe |

**Current implementation:** automatic Playwright/Chromium release capture, strict artifact-bound poster metadata/delivery, public DTO selection, uploaded image/GIF/video precedence, explicit owner promotion, and stale media invalidation are implemented on `feat/labs-platform-integration`. The browser package is pinned in the compiler manifest and lockfile. A refreshed compiler snapshot containing the browser binary and OS libraries, app build, Atlas/provider validation, real owner publish test, gallery/detail browser QA and a new Preview deployment remain required before claiming end-to-end deployment verification.


## 44. Automatic poster capture — rollout and final verification checklist

### 44.1 Source-of-truth rules

- Generate from the same output directory that was compiled and uploaded for the artifact. Never screenshot the editor iframe or a development server running unsaved files.
- The unique artifact ID is included in the poster Blob key so a retry can never overwrite another artifact's screenshot.
- The same `artifactId` + `sourceVersionId` pair must appear in the published pointer, runtime route and public DTO.
- A published upload has explicit owner intent. Private uploads and private fallback attachments do not become public automatically.
- A later source version invalidates the uploaded visual selection. The new artifact's screenshot is selected until an owner promotes a new upload.
- The gallery preview is visual media, not the interactive demo. The detail route must continue to run the exact compiled artifact.

### 44.2 Capture environment release contract

The compiler snapshot must contain all of the following before its ID is promoted to the Preview environment:

- Exact dependency lock including Playwright 1.65.0.
- Playwright Chromium build 158.0.8127.18 installed under `/opt/ms-playwright`.
- Linux libraries installed by Playwright's dependency setup for this Ubuntu compiler image.
- Capture script using the local compiled-output server and denying all non-local browser requests.
- `npm run test:smoke` passing after the browser install.
- A real capture fixture passing signature, 1200×900 dimensions, size, renderer-version and SHA-256 checks.

Do not install Chromium or OS packages in the owner Run request, release request or public web request. Refresh the immutable compiler snapshot only through an explicit maintenance operation. Keep disposable workers non-persistent and keep `networkPolicy: "deny-all"` for both build and screenshot execution.

### 44.3 Gallery and detail precedence matrix

| Uploaded public media for active release | Generated screenshot | Gallery/detail visual | Social thumbnail |
|---|---|---|---|
| JPEG/PNG/WebP/AVIF | Ready | Uploaded image | Uploaded image |
| GIF | Ready | Uploaded animated GIF (still on reduced-motion) | Uploaded GIF |
| MP4/WebM | Ready | Uploaded muted video preview | Generated PNG |
| None | Ready | Generated PNG | Generated PNG |
| None | Unavailable | Existing artwork | Existing artwork |
| Upload from an old artifact/version | Ready | Generated PNG | Generated PNG |

Private unpromoted media is treated as no public upload. It does not override the screenshot. The actual interactive experiment iframe remains below the static media area on the detail page in every row.

### 44.4 Required regression tests

- New publish with no upload: artifact has poster metadata; gallery card and detail media area show it; detail iframe uses the same artifact ID.
- Explicitly promote each supported image type: it replaces the generated screenshot on gallery and detail.
- Explicitly promote GIF: it is animated for normal motion settings and uses a still under reduced motion.
- Explicitly promote MP4 and WebM: visual preview uses the selected video and the generated PNG remains the social thumbnail.
- Upload but do not promote: image/GIF/video remains private and the screenshot remains selected.
- Capture unavailable/no visible output/runtime error/browser timeout: publish remains valid and artwork/upload fallback behavior is deterministic.
- Publish v1, publish v2, restore v1 and republish: card and detail media follow only the current source/artifact pointers.
- Request a poster with a stale artifact ID, stale source version, invalid host, changed size, changed hash or wrong browser version: reject it.
- Gallery page request: no sandbox creation, screenshot execution or iframe mount.
- Owner Run button: no screenshot execution and no browser dependency required by the Run path.

### 44.5 Deployment checklist

1. Finish the compiler snapshot with the current capture script, package lock, browser binary and OS libraries.
2. Run `node --check scripts/capture-poster.mjs` and `npm run test:smoke` inside that snapshot.
3. Run a real compiled React/Tailwind/Motion fixture through capture and read back the screenshot result manifest.
4. Create a new immutable compiler snapshot and update only the branch-scoped `LABS_COMPILER_SNAPSHOT_ID` for `feat/labs-platform-integration`.
5. Deploy a new Preview so the environment reference is actually picked up.
6. From a signed-in owner session, publish one custom lab without an uploaded public asset, confirm its generated screenshot in card and detail, then publish/promote an uploaded image and video to verify precedence.
7. Verify the source/artifact pointer, poster hash and runtime URL in the active release. Confirm no automatic snapshots are created by disposable workers.

Production is not modified during this Preview rollout. Do not call this end-to-end complete until the deployed owner publish/restore/browser tests pass.


### 44.6 Compiler snapshot and capture verification — 6 November 2026

The capture runtime was installed into and verified within the Preview compiler environment:

- Snapshot ID: `snap_1Ep7fqKr9Q4MMSKWALnzZ9nQumBt` (manual snapshot, approximately 1.01 GB; parent compiler base `snap_omIEA5ojBEPFVArzYUUn7RE9Mpqj`).
- Playwright package: `1.65.0`.
- Browser: Chromium `158.0.8127.18`, Playwright browser build `chromium-1254`.
- Browser binary and its Linux shared-library dependencies were installed before snapshot creation; no runtime browser download is required.
- `npm run test:smoke` passed inside the compiler sandbox. It includes uploaded image/GIF/video precedence, no-upload screenshot fallback, JSX/TSX, Motion, Tailwind v4, isolated server, CSP and traversal tests.
- An actual compiled React 19 + Motion + Tailwind v4 fixture was built and captured by the new script. Result: `status=ready`, PNG 1200×900, 29,445 bytes, SHA-256 `0a195217ca22f5e68c0be284e468b02f5d6af13901f77e130a1969626b0d90a4`.
- The `feat/labs-platform-integration` Preview-only `LABS_COMPILER_SNAPSHOT_ID` environment value now references the new snapshot. Production's environment value was not changed.
- The setup sandbox was stopped with `persistent: false`; its verified manual snapshot is the only retained result of this maintenance operation.

**Not yet verified:** a new Git-connected Vercel Preview deployment using the latest branch commit and refreshed snapshot, followed by the signed-in owner publish flow against a real Atlas experiment. The previous listed Preview deployment was created before the final snapshot environment refresh. Do not call deployed end-to-end capture complete until that new deployment and owner-flow test pass.
