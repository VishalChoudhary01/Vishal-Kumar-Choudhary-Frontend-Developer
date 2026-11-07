# Labs Runtime and Code Execution — End-to-End Engineering

**Status:** Runtime/compiler/source delivery implementation exists in the audited branch; environment-backed execution and full browser release verification remain distinct gates.  
**Primary files:** src/app/lib/labs/compiler-service.js, prepare-react-project.mjs, release-management.js, runtime-html.mjs, source-management.js, source-access.js, runtime-source-manifest.js, src/app/components/labs/runtime/*.

This is a security-sensitive system. Treat owner-authored source as untrusted code. The portfolio application server must not execute arbitrary experiment JavaScript in its own process or document origin.

## 1. The three execution modes

| Mode | Input | Execution location | Lifetime | Public? |
|---|---|---|---|---|
| Built-in demo runtime | Reviewed code-owned experiment runtime module | Browser React runtime within Labs page | Current page session | Public |
| Owner unsaved Run | Current editor working copy | Temporary isolated Vercel Sandbox | Temporary; preview run records expire | Owner-only |
| Published custom runtime | Immutable built artifact associated with an exact saved source version | Browser iframe served through application runtime route, using immutable Blob assets | Release-bound | Public only after source/experiment release is published |

These paths must not be conflated. A published runtime is not built from whatever happens to be in the editor at view time. Owner Run uses the unsaved working copy and does not automatically publish it.

## 2. Public built-in runtime

Code-owned runtime registry: src/app/components/labs/runtime/registry.js.

The registry includes four reviewed runtime slugs:
- magnetic-interaction
- scroll-driven-text-reveal
- gradient-bloom
- generative-particle-field

runtime-source-manifest.js maps each slug to a source file and imports the shared useReducedMotion hook and MotionProvider source for the owner source import workflow.

LabWorkspace reads experiment.demo:
- runtimeKey defaults to experiment.slug.
- runtimeUrl, when present, selects the custom artifact frame.
- Built-in runtime resolves through hasLabRuntime(runtimeKey).
- Configured controls are rendered only for a built-in runtime. Custom published iframe runtimes do not get the built-in controls panel.
- Restart/fullscreen are only enabled when runtime capabilities say true and fullscreen API support is available.
- LabCanvas owns aspect ratio and fullscreen layout. In fullscreen, the action row remains inside the fixed fullscreen shell.

LabRuntimeBoundary lazy-loads/selects registered runtime components, provides a loading and unavailable state, and wraps runtime failures with a visible retry path. Do not replace a visible error/fallback with a blank canvas.

## 3. Owner source working copy

Owner route: /admin/labs/sources/[slug]  
Page entry: src/app/admin/labs/sources/[slug]/page.js  
Editor: src/app/components/labs/admin/LabSourceEditor.js  
Monaco wrapper: src/app/components/labs/code/LabCodeEditor.js

Server page performs:
1. Better Auth session resolution.
2. Owner identity and verified-email check.
3. Parallel read of source aggregate, version list and recent audit events.
4. notFound on missing source.
5. Server-rendered LabSourceEditor with initial records.

The client editor owns current file state, file selection, active file content, dirty status, preview state, save state, version selection and dialog/action state. The editor supports code/text file operations for permitted languages. Exact request payloads are documented in API/ENDPOINT-INVENTORY.md.

Monaco is dynamically imported with SSR disabled. Monaco's pinned same-origin assets are loaded from /monaco/vs, not an unpinned CDN. If Monaco fails, a plain-text textarea fallback retains file editing capability. The editor responds to the current light/dark theme.

Current supported languages in editor/source policy:
- javascript, jsx, typescript, tsx
- css, html, json, markdown, text, svg

File policy enforces 1–40 files per snapshot, safe relative paths, unique paths, path length constraints, permitted language, plain text content, maximum content/total size and secret-file/content checks. Credentials, environment files and private keys must not be stored in source snapshots.

## 4. Unsaved Run — temporary isolated preview

Primary path:
1. Owner changes files in LabSourceEditor.
2. Client validates draft snapshot shape before sending.
3. POST /api/v1/admin/labs/sources/[slug]/preview validates owner, same-origin request and request size.
4. Server-side source validation runs again.
5. compiler-service prepares the React project and computes a source content hash.
6. A Vercel Sandbox is created with a bounded preview lifetime and port 3000.
7. The compiler runs inside the isolated sandbox.
8. The preview static server starts under a unique run-specific prefix.
9. The service polls a local preview health endpoint.
10. Successful run metadata is stored in LabPreviewRun, including runId, sandboxName, previewUrl, input hash and expiry.
11. The owner UI mounts the temporary preview and may use the runtime bridge for status/output interaction.
12. Sandbox expiry or run lifecycle cleanup ends the preview.

Current limits/config observed in compiler-service:
- preview sandbox lifetime: 10 minutes;
- compiler command timeout: 45 seconds;
- output file maximum: 80;
- compiled output maximum: 15 MB;
- source file count maximum: 40;
- static server health check: up to 12 attempts, each with 2.5-second fetch timeout and short wait between attempts.

The compiler uses src/app/tools/labs-compiler (build/serve scripts) and Vercel Sandbox. Vite/React project scaffolding is created by prepare-react-project.mjs for JavaScript/JSX or TypeScript/TSX. The generated project has an HTML entry, React root and CSS entry. Do not assume every raw file is copied unchanged: the preparation step may construct wrapper entry files based on the selected project mode.

The PreviewRun model is a temporary operational record, not a source version or public artifact. A preview can fail while the saved draft remains intact.

## 5. Immutable publish lifecycle

Publishing starts from an exact saved version:
1. Owner chooses a version to publish.
2. POST /api/v1/admin/labs/sources/[slug]/publish checks owner and same-origin.
3. The handler loads that exact LabSourceVersion.
4. Compiler validates the source hash against the immutable version contentHash.
5. prepareReactProject normalizes a supported React project.
6. A compiler sandbox builds the project.
7. Compiler output is validated: successful manifest, SHA-256 build hash, index.html entry, 1–80 output files, total output <=15 MB.
8. A new artifactId is generated.
9. Output files are uploaded to Vercel Blob under an immutable version/build/artifact-scoped key with overwrite disabled.
10. Optional gallery poster capture runs against the built output.
11. LabBuildArtifact record is created with exact sourceVersionId, hashes, entryUrl, output file manifest, compiler metadata and optional poster info.
12. The source publish operation updates the published pointer to the selected version/artifact and marks the source published.
13. The custom experiment's public state is made available according to the publication flow.
14. Audit history records the owner action.

Failure before the published pointer changes must not accidentally expose a partially built release. If the optional poster capture fails or output is not visibly capturable, the artifact may still be usable with previewPoster.status=unavailable; a poster is not a prerequisite for a working compiled artifact unless the publication-readiness rules specifically require it.

Unpublish removes public source/runtime availability by changing publication state/pointers. Immutable historical versions and artifacts are not rewritten. Restore creates a new immutable source version based on an older version rather than editing that old record.

## 6. Compiler project preparation and build output

prepare-react-project.mjs defines the current React project entry contract:
- JavaScript mode: index.html, src/main.jsx, src/App.jsx, src/index.css.
- TypeScript mode: index.html, src/main.tsx, src/App.tsx, src/index.css.

The entry module imports React, createRoot, App and CSS. User project code is wrapped/exported into the expected app entry. The compiler toolchain emits a build manifest and static output. Server code validates the manifest and output before storing anything public.

The compiler is deployed as a separate sandbox toolchain under tools/labs-compiler. Its package scripts and exact dependency versions belong to tools/labs-compiler/package.json and package-lock.json; inspect those files before upgrading compiler/runtime dependencies.

## 7. Published artifact delivery and isolation

Runtime route:
GET /api/v1/labs/[slug]/runtime/[artifactId]/[[...path]]

It serves only a valid published artifact for the matching experiment. It validates:
- slug and artifact ID syntax;
- requested artifact path segments (no dot traversal or invalid segments);
- published source pointer and artifact linkage;
- file existence in immutable artifact manifest;
- MIME type from a controlled extension map.

The route returns no-store/private responses on failures and uses nosniff/noindex protections. The published runtime is loaded inside an iframe with sandbox isolation and an opaque origin. The server-generated bridge only accepts messages from the expected iframe window and matching artifactId; readiness/error messages update the parent UI. Do not trust a message based only on its JSON payload.

runtime-html.mjs:
- strips authored CSP meta tags and base tags from HTML;
- rewrites relative/root-relative local asset references so they stay inside the artifact's immutable asset base;
- rejects references escaping the artifact prefix;
- builds the response Content-Security-Policy.

Current CSP policy includes:
- default-src 'none'
- script-src 'unsafe-inline' plus the artifact asset base
- style-src 'unsafe-inline' plus the artifact asset base
- img-src artifact base, data: and blob:
- font-src artifact base and data:
- media-src artifact base, data: and blob:
- connect-src 'none'
- worker-src 'none'
- frame-src 'none'
- object-src 'none'
- form-action 'none'
- base-uri 'none'
- frame-ancestors the trusted parent origin

The asset base and parent origin must be valid HTTPS URLs sharing the allowed origin. The opaque iframe origin prevents the experiment from receiving the application's privileged origin identity. The strict CSP also blocks outbound network requests and nested frames/workers.

This policy is intentionally restrictive. Do not loosen connect-src, frame-src, worker-src, object-src or frame-ancestors casually. Any new requirement for fetch, websocket, worker or external asset use needs an explicit threat-model and architecture review.

## 8. Gallery poster and media relationships

Two media roles are distinct:

1. Private runtime fallback media attached to an experiment as fallback-preview.
2. Public static galleryPreview selected for a published artifact/version.

Automatic release poster capture code invokes a pinned Playwright/Chromium capture script in the compiler sandbox. The screenshot is expected to be PNG, 1200 × 900, max 8 MB and bound to the specific buildHash/artifactId/sourceVersionId. If capture is missing, unpinned, fails, times out, renders no visible output or has invalid bytes, the capture status records a reasonCode. The current code also has owner-selected public poster promotion.

Never execute the runtime inside a gallery card. Gallery cards should display a poster/image; the interactive code runtime belongs on the experiment detail page.

## 9. Runtime failure states and recovery

The public LabRuntimeBoundary has visible preparing, unavailable, starting/handshaking, ready and failed states. It waits for an artifact-ready message and marks timeout/error when handshake fails. Retry remounts/restarts the iframe flow. Errors should be actionable but must not expose internal storage credentials, sandbox secrets or raw compiler environment.

For a blank canvas investigation, trace in this order:
1. Is experiment published and discoverable?
2. Does it point to expected publishedVersionId?
3. Does that version carry the expected buildArtifactId?
4. Is LabBuildArtifact ready with expected sourceVersionId/buildHash?
5. Does entryUrl resolve through runtime route?
6. Does route return index.html and local assets with correct MIME/CSP?
7. Does iframe load and send matching labs-artifact-ready bridge message?
8. Do browser console/network failures identify path rewrite, CSP, JS or runtime errors?
9. Does retry or fallback state work?

Do not paper over a mismatch by serving the newest artifact unrelated to the published pointer.

## 10. Environment and deployment gates

Inspect .env.example and operations setup documents for exact required variable names. Sensitive values must never be written into docs.

At minimum, the relevant classes of deployment configuration are:
- Vercel Sandbox/compiler snapshot and sandbox execution permissions;
- Vercel Blob read/write token;
- MongoDB connection and database name;
- singleton Labs owner identity;
- Cloudinary cloud name/API credentials and Labs image/video upload presets;
- media max upload byte configuration;
- Next public site URL and auth base/trusted origins;
- Better Auth secret and SMTP delivery config.

## 11. Timeout inconsistency discovered during audit

The publish Route Handler src/app/api/v1/admin/labs/sources/[slug]/publish/route.js declares maxDuration=60 and its comment describes a 60-second Hobby plan cap. compiler-service.js includes a nearby historical comment saying the publish handler is capped at 300 seconds and describes a worker cap of 240 seconds. The explicit route declaration is the current code setting; the compiler comment is inconsistent/stale unless deployment plan/runtime configuration proves otherwise.

Documented as an engineering review item, not modified in this documentation-only task. Before increasing timeouts, inspect actual Vercel plan limits and exact deployment settings. Do not assume a four-minute sandbox budget can complete inside a 60-second Route Handler.

## 12. Non-negotiable security and behavior constraints

- Never run untrusted experiment code in the main application process or same privileged DOM.
- Never read a mutable editor draft for public runtime.
- Never serve a stale artifact when its source version does not match the published pointer.
- Never allow local asset references to escape the immutable artifact.
- Never expose source bytes to guests or email-unverified users.
- Never expose secrets through source editor uploads or preview errors.
- Keep preview runs temporary and owner-only.
- Keep gallery media static; no iframe/runtime/compiler inside cards.
