# Labs React / JSX / TSX Runtime — Practical Implementation Plan

**Status:** React JS/JSX and React TypeScript/TSX are locked first-class starters. Standalone HTML/CSS/JavaScript remains a separate supported runtime mode. The nested Fluid Gradient HTML regression, static HTML/CSS/JS assets, CSS-only mode, JSX/TSX type-checking, targeted ESLint and full Next.js build pass.
**Latest validated functional source:** `e3fd60ac09fe072afd9f7025a414e842069ab7fd`.
**Latest READY Preview:** `https://vishal-kumar-choudhary-frontend-developer-12tkvcm9s.vercel.app/` on commit `18e5ff96d20a7abc75ec19437e3ee6160b96eea2`. Sign in on this Preview and verify the owner Run action for the Fluid Gradient HTML experiment; also test the React JS and React TSX starters. Production publishing remains disabled until the browser Run and immutable publish checks pass.

## 1. Product decision

The Labs manager must execute the code the owner inserts into the editor. It must not merely display source, show a static thumbnail, or render a screenshot as though it were running code.

**Locked default:** React 19 with JavaScript/JSX or TypeScript/TSX. The Studio presents separate `React JS` and `React TSX` starters so the author selects the intended language before adding code. The fixed runtime includes Tailwind CSS v4, Motion from `motion/react`, Lucide from `lucide-react`, and React Icons from `react-icons`. The same saved source and pinned compiler contract must be used for owner preview and public publication.

Standalone HTML/CSS/JavaScript remains a separate supported project type for Canvas, Web APIs and non-React experiments. It must never be silently wrapped in React. The runtime chooses React only when a complete React entry structure is present or the editor uses the single-file JSX/TSX convenience adapter.

Images, animated GIFs and videos are optional page-level fallback media only. They are not required when code preview works and are not imported into experiment source.

## 1.1 Implementation phases and reasons

| Phase | What was implemented | Why |
|---|---|---|
| 1. Lock React JS | A known React 19 JavaScript/JSX starter with `index.html`, `src/main.jsx`, `src/App.jsx` and `src/index.css` | The owner can run a predictable React application without manually wiring a Vite project |
| 2. Lock React TSX | A separate TypeScript starter with `src/main.tsx`, `src/App.tsx`, generated strict `tsconfig.json`, React typings and `tsc --noEmit` | Vite transpiles TypeScript but does not type-check it; a type-check gate catches errors before preview/publish |
| 3. Fixed dependencies | React, React DOM, TypeScript, Motion, Lucide, React Icons and Tailwind v4 are supplied by the compiler image | No arbitrary package installs, package manifests or build scripts execute from owner source |
| 4. Preserve static mode | Separate HTML/CSS/JS pipeline, including nested HTML entry promotion, inline style/script preservation and relative asset path resolution | Canvas/Web APIs and vanilla experiments should run as authored, without React wrappers |
| 5. Isolated build and preview | Vite builds the project in a per-run sandbox; a separate-origin iframe loads the output | Owner code cannot access the portfolio app's origin or server environment |
| 6. Publish verification | Rebuild the exact saved version and store the immutable HTML/CSS/JS artifact | The public Labs page must render the same version the owner approved |

**Why the Fluid Gradient file previously failed:** it was imported as `src/fluid_gradient_background-1-.html`. The old adapter rejected nested HTML because Vite expects a root `index.html`; after entry promotion was added, Vite's generated root-relative `/src/...` assets were still rejected by an over-broad source-policy rule. The current branch promotes the nested entry, rewrites its relative local asset URLs into the preserved `src/` folder, and permits Vite root-relative references only when they resolve inside the sandbox project root.

The regression fixture uses a nested Fluid Gradient HTML entry with inline CSS, Canvas and animation code plus linked CSS/JS files. It passes the compiler smoke suite. Standalone HTML/CSS/JS and CSS-only projects are tested separately from React.

## 2. Supported source files

| Extension | Editor language | Behavior |
|---|---|---|
| .js | JavaScript | Browser JavaScript |
| .jsx | JSX | React JSX module |
| .ts | TypeScript | Type-check, then transpile and bundle |
| .tsx | TSX | Type-check, then React JSX transpile and bundle |
| .css | CSS | Local CSS and Tailwind entry |
| .html | HTML | Browser document/entry |
| .json | JSON | Local data import where supported |
| .d.ts | Type declarations | Type-check only; never emitted as a browser module |
| .md, .txt | Text | Editor documentation only |

The editor stores both filename and language. A .js file marked JSX can be normalized to .jsx in a temporary build copy without changing saved source. Apply the same rule to .ts/.tsx; mismatches must be corrected in temporary input or shown as clear validation errors.

### 2.1 React project templates

JavaScript / JSX:

~~~text
index.html
src/
  main.jsx
  App.jsx
  index.css
  components/
  hooks/
  lib/
~~~

TypeScript / TSX:

~~~text
index.html
tsconfig.json        # generated by platform; not owner-controlled
src/
  main.tsx
  App.tsx
  index.css
  vite-env.d.ts      # generated when required
  components/
  hooks/
  lib/
~~~

index.html contains the root element and module entry. main.jsx or main.tsx mounts the default app with createRoot. App.jsx or App.tsx exports the experiment component. index.css imports Tailwind v4. Additional files resolve only inside the experiment root.

Create Experiment should offer React + JavaScript and React + TypeScript starters. A one-file convenience mode may generate missing entry files in memory, but must never overwrite owner files.

## 3. Fixed package allowlist

The compiler image contains dependencies before a run. No owner package manifest, arbitrary npm install, lifecycle scripts, custom plugins or CDN-loaded executable code.

| Package | Allowed imports | Purpose |
|---|---|---|
| react | react | Components and hooks |
| react-dom | react-dom/client | Browser mounting |
| typescript | Compiler process only | TS/TSX validation |
| motion | motion/react only | Motion |
| lucide-react | lucide-react | Lucide icons |
| react-icons | react-icons/fa, react-icons/fi, etc. | React Icons packs |
| clsx | clsx | Conditional classes |
| tailwind-merge | tailwind-merge | Class merging |

Pin exact versions in the compiler package manifest and lockfile. A dependency update requires the full smoke/security tests, a new immutable compiler image/snapshot and Preview verification before Production.

Example:

~~~tsx
import { ArrowRight, Sparkles } from "lucide-react";
import { FiActivity, FiArrowUpRight } from "react-icons/fi";

export function IconExamples() {
  return (
    <div className="flex items-center gap-3">
      <Sparkles aria-hidden="true" />
      <ArrowRight aria-hidden="true" />
      <FiActivity aria-hidden="true" />
      <FiArrowUpRight aria-hidden="true" />
    </div>
  );
}
~~~

Use named imports from approved React Icons subpaths. Do not permit dynamic package names or CDN icon scripts.

## 4. TypeScript needs two compiler stages

1. **Type validation:** run the pinned TypeScript compiler with a platform-generated fixed configuration and noEmit.
2. **Browser build:** use the pinned Vite build to transform TS/TSX and bundle React.

Vite transpilation alone does not type-check the complete project. A successful bundle is not proof that TS types are valid. Type checking must pass before preview readiness and publication.

### 4.1 Generated TypeScript config

Generate the config inside each isolated project. Do not trust an owner-uploaded tsconfig.

Recommended baseline:

~~~json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.d.ts"],
  "exclude": ["node_modules", "dist"]
}
~~~

Pin the exact settings. Do not allow custom compiler plugins, project references, escaping path aliases, arbitrary type roots, Node globals or custom package resolution.

A TS error is a failed validation. Show file, line, column and a bounded message. Do not alter the working copy. Publish must re-run type checking against the exact saved source hash. JavaScript-only projects may skip this stage; mixed JS/TS projects must not claim JS received TypeScript checking unless checkJs is explicitly enabled.

## 5. Tailwind CSS v4

Use build-time compilation, never the Tailwind CDN.

~~~css
@import "tailwindcss";
~~~

- Put the full source tree under the unique per-run project root before building.
- Set Tailwind's source base so nested .jsx, .tsx, .js and .ts files are scanned.
- Emit CSS in the same artifact manifest as HTML and JS.
- Support responsive/state variants, arbitrary values, CSS custom properties and supported v4 theme syntax.
- Reject custom PostCSS/Tailwind plugins and unapproved build configuration.
- Require complete statically detectable class names; dynamic class fragments cannot be relied upon.

Test utilities used only inside a nested TSX component, not just the main app.

## 6. Motion

Import Motion only from motion/react. Bundle the pinned package with React; do not depend on the portfolio's MotionProvider, Lenis instance or app context. Test Motion components/hooks, useReducedMotion, prefers-reduced-motion, state changes during animation and cleanup when an iframe is stopped.

## 7. Preview and publishing architecture

~~~mermaid
flowchart TD
  A["Owner edits JS / JSX / TS / TSX"] --> B["Run API and source validation"]
  B --> C["Generate React entry + fixed tsconfig"]
  C --> D["Isolated compiler job"]
  D --> E["tsc --noEmit for TS / TSX"]
  E -->|Errors| F["File / line / column diagnostics"]
  E -->|Passed| G["Vite React + Tailwind v4 build"]
  G --> H["Immutable HTML / JS / CSS artifact"]
  H --> I["Separate-origin sandboxed iframe"]
  I --> J["Owner reviews preview and saves version"]
  J --> K["Rebuild exact saved version"]
  K --> L["Verify source hash + toolchain + artifact"]
  L --> M["Owner explicitly publishes"]
  M --> N["Update public release pointer"]
  N --> O["Public Labs detail page runs artifact"]
~~~

### 7.1 Build isolation

- Never compile owner source in a Next.js route or the main app process.
- Use an immutable prebuilt Vercel Sandbox compiler environment or equivalent.
- Outbound network is denied; dependencies are preinstalled.
- Every run gets a unique workspace and only its own source files.
- No MongoDB, Cloudinary, Blob, Better Auth or application secrets in the worker.
- Bound file count/bytes, output size, CPU, memory, processes and wall-clock time.
- Terminate the per-run worker after artifact storage.
- Keep only bounded diagnostics and immutable release artifacts.

### 7.2 Compiler snapshot lifecycle — current known blocker

The deployed Preview previously failed because a legacy environment reference pointed to a deleted snapshot (HTTP 410), then repeated disposable Run workers exhausted Hobby snapshot storage (HTTP 402). The active `feat/labs-platform-integration` Preview environment uses a verified compiler snapshot. Disposable Run/release workers now use `persistent: false`, avoiding automatic snapshots on stop. Twenty-two unused automatic snapshots were removed after preserving the active compiler snapshot and its base chain. See `docs/LABS-PREVIEW-RUN-RECOVERY-AND-SNAPSHOT-LIFECYCLE.md` for the incident, recovery procedure and QA matrix.

The permanent fix requires:

1. An immutable compiler image or reusable named base with exact dependencies.
2. A documented snapshot retention/refresh policy if snapshots are used.
3. Deployment-time validation that the configured snapshot exists.
4. A health check before accepting a build.
5. A controlled refresh that verifies the replacement before updating the environment.
6. A new Preview deployment after changing the environment reference.
7. Specific errors for missing, expired, deleted, rate-limited and unavailable resources.

Never turn HTTP 402/410/429 into only "The requested owner operation is temporarily unavailable." Show a safe actionable diagnostic. Scheduled snapshot refresh may be used when required, but must not silently update Production or publish an experiment.

### 7.3 Asynchronous Run API

Prefer a job/status contract rather than keeping a Next.js request open during compilation:

- POST /api/v1/admin/labs/sources/[slug]/preview validates owner and creates a run.
- Return 202 Accepted with runId.
- GET /api/v1/admin/labs/sources/[slug]/preview/[runId] returns bounded build status and diagnostics.
- Poll at a bounded interval or use an approved event mechanism.
- On completion return a short-lived preview URL and expiry.
- Support stop/cancel and timeout.
- Bind every result to owner ID, experiment slug and exact source hash.

The iframe uses a separate runtime origin, restrictive sandbox/CSP, run-ID-scoped messages and no app session. The code runtime is the primary preview; fallback media is considered only when the runtime fails or is unsupported.

## 8. Exact-version publish flow

On **Build & Publish**, the server must:
1. Authenticate the owner.
2. Require no unsaved editor changes.
3. Resolve the exact immutable saved source version.
4. Verify its source hash.
5. Run the same TS validation and Vite/Tailwind build used for preview.
6. Verify every output file and content hash.
7. Upload immutable HTML/JS/CSS assets.
8. Verify artifact/source-version/toolchain relationship.
9. Atomically update the published artifact/version pointer.
10. Revalidate the public Labs listing/detail metadata after commit.

The public /labs/[slug] page reads only the published artifact, never a draft or working copy. Later edits do not affect the live page until explicitly published again. A failed build preserves the previous release.

Everyone can run a published demo. Only registered users with verified email may open/copy published source. Guests/unverified users never receive source, drafts, logs or upload credentials. Unpublish remains an explicit owner action.

## 9. Studio feedback

Use accessible toasts for action outcomes and an inline console/diagnostics panel for details. Cover: Run started/type-checking/bundling/ready/stopped; TS and JSX errors; missing entry/import/path; compiler unavailable/snapshot expired/rate limit/timeout; draft save; publish/unpublish; media upload/remove; project deletion and retryable cleanup. Do not show a generic unavailable warning when a safe specific error exists. Never log source code or secrets.

## 10. Implementation file map

| Area | Files / service |
|---|---|
| Language and path validation | LabSourceEditor.js, source-management validation |
| Entry generation | src/app/lib/labs/prepare-react-project.mjs |
| TS/TSX type checker | New isolated script under tools/labs-compiler/scripts/ |
| Pinned packages | tools/labs-compiler/package.json and lockfile |
| Package allowlist | tools/labs-compiler/vite.config.js |
| Build output | tools/labs-compiler/scripts/build.mjs |
| Owner preview | src/app/api/v1/admin/labs/sources/[slug]/preview/route.js |
| Preview status | New owner-only route under the preview path |
| Compiler orchestration | src/app/lib/labs/compiler-service.js |
| Preview UI | src/app/components/labs/admin/LabSourceLivePreview.js |
| Artifact model | LabBuildArtifact |
| Public route | public-experiments.js and /labs/[slug] |
| Toasts | ActionToastProvider.js and Studio action handlers |

Do not convert the portfolio application itself to TypeScript to enable TSX experiments. TS/TSX support belongs only inside the isolated Labs compiler.

## 11. Acceptance tests

### JSX
- Single .js marked JSX runs without changing saved source.
- Multi-file JSX with nested components and relative imports builds.
- React hooks and interactive state work in the iframe.

### TSX
- Single .tsx React component runs with generated entry files.
- Multi-file .ts + .tsx resolves local imports and type declarations.
- Props, generics, interfaces, unions and type-only imports type-check.
- An invalid prop/type yields file/line/column diagnostics and no ready preview.
- TSX imports motion/react, lucide-react and at least two react-icons packs.
- A nested TSX type error blocks Publish even if the bundler can transpile it.
- Owner tsconfig, package manifests, scripts, plugins and type roots cannot change the fixed toolchain or escape the project.

### Tailwind / Motion / icons
- Classes used only in nested TSX appear in emitted CSS.
- Responsive, hover, focus and arbitrary utilities compile.
- Motion renders and respects reduced motion.
- Lucide and React Icons bundle without runtime CDN access.

### Runtime / release
- Sandbox starts from the active configured compiler image/snapshot.
- Snapshot HTTP 410 is a specific actionable diagnostic.
- Builds have no outbound network or app secrets.
- Iframe cannot access parent DOM, cookies, app storage or authenticated APIs.
- Output/messages are bounded and run-ID scoped; concurrent runs cannot read each other's files.
- Publish rebuilds the exact saved version and rechecks TypeScript.
- A changed hash cannot reuse an old build.
- Failed builds preserve the previous release.
- Public Labs detail runs the compiled artifact; fallback media appears only if code cannot run or is unsupported.

## 12. Implementation order

1. Fix and verify compiler environment lifecycle; current Preview is blocked by an expired/deleted snapshot.
2. Return clear preview errors and use an asynchronous run/status contract.
3. Add TypeScript to pinned compiler dependencies and generate fixed per-run tsconfig.
4. Extend file/language validation and entry generation to .ts/.tsx.
5. Add react-icons to compiler dependencies/allowlist; retain Lucide and Motion.
6. Add TSX smoke tests, including deliberately invalid types.
7. Verify Tailwind scans nested TSX files.
8. Deploy Preview and test the actual Run button/iframe in a browser.
9. Verify exact-version Build & Publish and public Labs detail.
10. Complete security, responsive, accessibility, privacy and regression QA before Production.

**Definition of done:** the owner can paste/upload React TSX, press Run and see the actual interactive experience in an isolated preview, fix actionable type/runtime diagnostics, save an immutable version, explicitly publish it, and see that exact compiled release on the public Labs detail page. Existing JavaScript/JSX continues to work through the same pipeline.

## 13. Official references

- [Vite — TypeScript and JSX support](https://vite.dev/guide/features): Vite transpiles TS/TSX but does not perform whole-project type checking; run tsc --noEmit separately.
- [TypeScript — noEmit](https://www.typescriptlang.org/tsconfig/noEmit): type-check without emitting JavaScript.
- [TypeScript — CLI options](https://www.typescriptlang.org/docs/handbook/compiler-options): JSX, module resolution, isolated modules and noEmit.
- [Tailwind CSS — detecting classes](https://tailwindcss.com/docs/detecting-classes-in-source-files): source scanning and complete static class names.
- [React Icons](https://react-icons.github.io/react-icons/): named imports from supported icon packs.

## 14. Optional Controls SDK without reducing the existing execution modes

Controls are an additive feature, not a new runtime mode. The following must remain unchanged and covered by the existing smoke suite: standalone HTML/CSS/JavaScript; single-file JSX; multi-file React JS/JSX; React TS/TSX with strict `tsc --noEmit`; Tailwind CSS v4; Motion from `motion/react`; Lucide; React Icons; isolated Run of the current unsaved source; saved immutable versions; exact-version rebuild/publish; sandbox and compiler package restrictions.

### 14.1 Optional source contract

A root `lab.config.json` file is an optional JSON member of the same source file array as HTML/JS/JSX/TS/TSX/CSS. The existing source-version content hash therefore includes it; save, restore, diff and version history automatically keep code and controls together.

The platform parses this exact file before compilation, validates it and removes it from the generated browser bundle. It must not reserve every JSON file or change normal JSON imports. When absent or empty, there is no controls panel and current projects run with no extra author work.

### 14.2 Control API by execution mode

- **React JS/JSX and TSX:** import the preinstalled, versioned `@labs/ui` SDK. `useLabSettings()` returns typed values from the current runtime bridge; source explicitly maps its stable control IDs to the props/state of whichever components the experiment uses.
- **Standalone HTML/JavaScript:** read `window.Labs.getSettings()` and subscribe to `labs:settings-change` inside the isolated document.
- **CSS-only/HTML:** validated scalar controls may be mapped to whitelisted `--lab-*` CSS custom properties so the stylesheet responds without adding JavaScript.

No execution mode is wrapped in another. The existing static adapter remains static; the existing React adapter remains React. The source author decides which settings affect which component.

### 14.3 Generic control schema

First release reuses the accessible control renderers already present in `LabControlsPanel`: range, number, toggle, select and color. Each descriptor has a unique stable ID, label, default value, type-specific bounds/options and optional grouping/order/helper copy. The manifest cannot contain executable code, component import paths or arbitrary selectors. New control types require validation + UI renderer + bridge serialization.

### 14.4 First-party SDK

The internal `@labs/ui` module is preinstalled/allowlisted in the immutable compiler environment and versioned with the compiler snapshot. It does not replace or upgrade React, Motion, Tailwind or icon packages. `MagneticButton` and `useLabSettings` are the first exports; corresponding TS declarations are required.

The application-owned Magnetic Interaction and owner-authored React experiments consume the same reviewed SDK implementation. The exact existing spring (280/24/0.55), pointer multiplier (0.24), proximity exponent (1.25), strength/radius bounds, touch bypass, reduced-motion bypass and pointer-leave reset are preserved.

### 14.5 Run/publish safety

Owner Run validates and uses the current unsaved code + unsaved config only. It never saves or publishes. Save stores the complete file list. Restore creates a new draft containing the restored code and config. Publish revalidates and rebuilds the exact saved version; config schema/hash is attached to that artifact/release. Failed validation/build leaves the previous published release untouched. The runtime controls panel loads from the same exact published release as the iframe artifact.

The detailed source schema, message-security contract, owner builder, rollback and acceptance matrix are specified in Section 41 of `LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md`.

## 15. MagneticButton source-managed extraction — implementation status (5 November 2026)

The reusable MagneticButton Phase 1 is implemented in the application and packaged for the existing Source Management Lab.

- App component: `src/app/components/labs/ui/MagneticButton.js`
- Pure physics helper: `src/app/components/labs/ui/magnetic-physics.mjs`
- Public app-local export barrel: `src/app/components/labs/ui/index.js`
- TypeScript prop declaration: `src/app/components/labs/ui/MagneticButton.d.ts`
- Built-in Magnetic Interaction now composes this component while retaining its field decoration, status, counter and instructions.

The owner import action is at `/admin/labs/sources/import`, in the MagneticButton Component panel. It calls `POST /api/v1/admin/labs/sources/import-magnetic-button` and creates a separate private custom experiment/source workspace with editable files:
`index.html`, `src/main.jsx`, `src/App.jsx`, `src/components/MagneticButton.jsx`, `src/components/MagneticButton.d.ts`, `src/components/magnetic-physics.mjs`, and `src/index.css`.

The import is idempotent with respect to drafts: if a draft already exists, it is preserved and the workspace is returned. It never publishes. The imported project uses only React, `motion/react` and relative component/physics files, so it can run in the current isolated compiler without an app alias or new package.

Compiler mode detection was also corrected so a declaration-only `.d.ts` file does not accidentally force a JavaScript/JSX project into the TypeScript entry path. Actual `.ts`/`.tsx` source continues to invoke strict TypeScript validation.

Validation passed: generated source project compiled with Labs compiler; Labs compiler smoke suite; targeted ESLint; Next.js SEO validation, production build, and TypeScript.

Not yet implemented: publishing `@labs/ui` as an owner-importable fixed compiler SDK package; generic `lab.config.json` controls builder; runtime settings bridge; TSX version of the imported starter. Until the SDK phase, reuse in a second source workspace requires copying both `MagneticButton.jsx` and `magnetic-physics.mjs`.
