# Labs Runtime and Code Execution — End-to-End Engineering

**Audited branch:** feat/labs-platform-integration  
**Current-state date:** 2026-11-07  
**Status:** Owner-side isolated Run, immutable build/publish infrastructure and the public artifact Route Handler are present in code. The visitor-facing public Labs detail page is static and non-executable; it does not mount that artifact runtime.

> This document distinguishes runtime infrastructure from route integration. An artifact-serving endpoint does not prove that a page embeds it. The accepted 7 November contract is recorded in [ADR-018](../DECISIONS.md#adr-018--7-november-labs-catalogue-detail-owner-and-analytics-supersession). Older interactive-detail statements are superseded.

## 1. Execution and presentation boundaries

| Capability | Input | Execution / presentation | Access and current use |
|---|---|---|---|
| Static public Labs detail | Published custom experiment metadata and release-bound static media | Normal Next.js page and LabExperimentPreview; no experiment JavaScript is executed by the detail page | Public |
| Owner unsaved Run | Current unsaved source working copy | Temporary isolated Vercel Sandbox and temporary preview URL | Owner-only |
| Immutable release build | Exact saved LabSourceVersion | Compiler sandbox creates immutable output files and a ready artifact | Owner publish workflow |
| Artifact delivery endpoint | Exact published slug/artifact ID and immutable output path | Application Route Handler validates published pointers and returns the matching Blob asset under restrictive response policy | Publicly addressable only for a currently published matching artifact; not embedded by the public detail page |
| Code-owned runtime modules | Reviewed repository-owned modules | Runtime registry/owner import source material | Not entries in the current public catalogue |

These boundaries must not be conflated. Run does not save or publish. A release build does not itself make the public detail page interactive. The current public /labs catalogue only includes eligible source-backed custom experiments; the four code-owned runtime modules are not public catalogue entries under the 7 November source-only decision.

## 2. Current public route behavior

### 2.1 Catalogue

Entry point: src/app/labs/page.js.

The page calls getPublishedCustomLabExperimentPage with a fixed page size of 18. Eligible catalogue entries are custom experiments whose experiment is published, whose source has a published pointer and whose ready artifact matches the exact published source version.

Public list API: GET /api/v1/labs.
- Fixed page size: 18.
- Supported query controls: validated category and opaque cursor.
- A client-supplied limit is rejected.
- Search by title/description/technology/tags and visitor-selected sort are not implemented.
- The collection does not merge built-in runtime registry entries with custom experiment rows.

### 2.2 Detail page

Entry point: src/app/labs/[slug]/page.js.

The route resolves an eligible custom experiment through getPublishedCustomLabExperimentBySlug(slug). It currently renders:
- LabDetailHeader with experiment metadata and engagement;
- LabExperimentPreview, a shared non-executable static media renderer;
- LabExplanation;
- LabSourceAccess, which exposes protected source only after server-side authorization.

It does not import or mount LabWorkspace, LabRuntimeBoundary, an artifact iframe or executable experiment code. It does not create a compiler job for a visitor. Static preview media may be a selected uploaded image/video, an exact-release generated poster or a validated thumbnail according to the gallery preview policy.

Do not add a published-artifact iframe to this public route unless the product decision is explicitly reopened and the static-detail decision is superseded in the source-of-truth documents. The existing artifact Route Handler and publishing pipeline must remain separate; this documentation does not authorize deleting them.

## 3. Owner source working copy

Owner route: /admin/labs/sources/[slug]  
Page entry: src/app/admin/labs/sources/[slug]/page.js  
Editor: src/app/components/labs/admin/LabSourceEditor.js  
Shared Monaco wrapper: src/app/components/labs/code/LabCodeEditor.js

The server page resolves the Better Auth session, checks the Labs owner guard and reads the source aggregate, version history and recent audit records. Owner authorization is checked on protected pages and APIs; navigation visibility is not the security boundary.

The current editor uses LabCodeEditor, which dynamically loads self-hosted Monaco and retains a plain-text fallback if Monaco/worker loading fails. Monaco is used for the public verified-source reader (read-only), owner source workspace (editable) and immutable version-history reader (read-only). The React file state and server source/version contracts remain authoritative; Monaco is an editor surface.

Current permitted language values observed in source policy include JavaScript, JSX, TypeScript, TSX, CSS, HTML, JSON, Markdown, text and SVG. Source validation enforces safe relative paths, language allowlist, text-only content, secret-file/content checks, file-count and byte bounds. Do not store environment files, credentials, private keys or privileged runtime configuration in a source snapshot.

The editor retains file add/import/rename/delete/reorder, validation, dirty state, save/discard, history, restore, temporary Run, publish/unpublish and audit workflows. Any editor changes must preserve exact last-keystroke synchronization between Monaco state and the source snapshot passed to Save, Run and Build & Publish.

## 4. Unsaved Run — temporary isolated preview

Primary path:
1. Owner edits files in LabSourceEditor.
2. Client validates the working-copy payload shape before sending.
3. POST /api/v1/admin/labs/sources/[slug]/preview validates owner, same-origin request and request size.
4. Server-side source validation runs again; browser-provided hashes/sizes are not trusted.
5. compiler-service.js prepares the React project and computes a source content hash.
6. A Vercel Sandbox is created with bounded preview lifetime and port 3000.
7. The compiler runs inside that isolated sandbox.
8. A preview static server starts under a unique run-specific prefix.
9. The service polls a local preview health endpoint.
10. A successful preview is recorded in LabPreviewRun with run ID, sandbox name, preview URL, input hash and expiry.
11. The owner UI mounts the temporary preview; supported bridge messages communicate readiness/output state.
12. The preview expires or is cleaned up; it is not a saved source version or public artifact.

Code-observed limits in the current compiler service include a 10-minute preview sandbox lifetime, a 45-second compiler command timeout, at most 80 compiled output files, a 15 MB compiled-output ceiling and at most 40 source files. The static-server health loop is bounded. These are implementation values, not a guarantee that an external deployment will provision the required Sandbox capability.

The compiler toolchain lives under the Labs compiler tool directory and uses pinned project dependencies. JavaScript/JSX and TypeScript/TSX scaffolding is prepared from the selected mode. The preparation step can create wrapper entry files; it does not simply copy every supplied source file unchanged.

**Run is distinct from Save Draft and Build & Publish.** A failed Run must leave the working copy intact and must not mutate saved or published pointers.

## 5. Immutable publish lifecycle

Publishing starts from an exact saved LabSourceVersion, not mutable editor state:
1. Owner selects the exact saved version to publish.
2. `POST /api/v1/admin/labs/sources/[slug]/publish` validates owner and same-origin request.
3. The service loads that exact immutable version and validates its content hash.
4. The compiler prepares the supported project mode and builds in the isolated compiler sandbox.
5. Output is validated: manifest, entry file, file count, total bytes and content/build hashes.
6. A unique artifact ID is created.
7. Output files are uploaded to Vercel Blob under immutable version/build/artifact-scoped keys; overwriting an existing release key is not allowed.
8. The same network-denied Sandbox runs `captureReleasePoster()` against the exact compiled output. Playwright 1.65.0 and Chromium 158.0.8127.18 capture a 1200×900 PNG after load, visible-output and runtime-error checks. The PNG is size/signature/dimension validated, SHA-256 hashed and uploaded under the immutable artifact's `__preview/gallery-poster.png` path.
9. A `LabBuildArtifact` record stores exact source-version linkage, hashes, entry URL, output manifest, compiler metadata and a separate `previewPoster` status/metadata object. An unavailable poster does not fail an otherwise valid artifact build.
10. Only after required artifact persistence does the publish lifecycle update the source's published source/artifact pointers and experiment publication eligibility.
11. The owner action is recorded in the source audit log.

The automatic screenshot is a static poster fallback, not an interactive public detail runtime. It is captured during the immutable release build only; it does not run on every keystroke, on owner `Run`, or on a public page request. An explicitly promoted owner gallery media asset takes precedence over the generated release poster; see the Labs owner guide for the promotion contract.

Unpublish removes current public source/artifact eligibility without rewriting historical snapshots or immutable artifact bytes. Restore creates a new immutable version based on an older version; it does not edit old history.

## 6. Compiler project preparation and build output

The compiler has separate source modes; do not treat every source snapshot as a React project:

- **React JavaScript/JSX:** complete React entries use `index.html`, `src/main.jsx`, `src/App.jsx` and `src/index.css`. The owner can also use a single-file JSX adapter, which creates temporary entry files without overwriting saved source.
- **React TypeScript/TSX:** complete entries use `index.html`, `src/main.tsx`, `src/App.tsx` and `src/index.css`. The platform generates a strict TypeScript config and runs `tsc --noEmit` before the Vite build; Vite transpilation alone is not treated as type validation.
- **Standalone HTML/CSS/JavaScript:** remains a separate non-React mode. A nested single HTML entry can be promoted to the build root with local relative asset paths rewritten. If only CSS/JS is supplied, the compiler can generate a minimal HTML entry. Multiple HTML pages require an explicit `index.html`.

The React generated entry imports React, `createRoot`, the prepared App and CSS. All project modes run through the repository's pinned Vite toolchain inside the isolated sandbox and emit a validated build manifest/static output. The compiler accepts a bounded text-file allowlist, denies runtime asset imports, remote/CDN executable imports and arbitrary package installation, and does not execute owner-provided package scripts or server-side code. The exact fixed import allowlist and pinned versions are documented in [`tools/labs-compiler/README.md`](../../tools/labs-compiler/README.md).

Compiler dependency versions belong to the compiler package manifest/lockfile and the immutable compiler snapshot. Do not upgrade compiler/browser packages without re-running preview, type-checking, publication, poster capture, artifact-integrity and browser acceptance tests.

## 7. Immutable artifact delivery endpoint — infrastructure only

Route:
GET /api/v1/labs/[slug]/runtime/[artifactId]/[[...path]]

The Route Handler can serve an entry document or one immutable artifact asset only when:
- the slug and artifact ID are valid;
- the experiment/source is currently eligible for public publication;
- the requested artifact matches the experiment's exact published artifact/source pointers;
- the requested path is a valid safe relative artifact path;
- the target file exists in the immutable output manifest;
- the content type is selected from a controlled mapping.

The handler returns security-conscious MIME/nosniff and cache behavior appropriate to the published artifact. It does not provide an unbounded Blob proxy or resolve “latest” unrelated artifacts. A missing, stale or mismatched pointer must fail closed.

### 7.1 Runtime document response and isolation policy

The runtime document builder in runtime-html.mjs:
- strips authored Content-Security-Policy meta and base tags;
- rewrites relative/root-relative local assets into the immutable artifact asset base;
- rejects references that escape the artifact prefix;
- builds a restrictive response Content-Security-Policy.

The policy documented in the current implementation includes:
- default-src 'none';
- scripts/styles limited to inline source and the artifact asset base;
- images/fonts/media constrained to the artifact base and necessary data/blob schemes;
- connect-src 'none', worker-src 'none', frame-src 'none';
- object-src 'none', form-action 'none', base-uri 'none';
- frame-ancestors limited to the trusted parent origin.

The runtime UI bridge is designed to validate the expected iframe window and artifact identity; a JSON payload alone is not sufficient proof of a message's origin/source. The opaque iframe origin and restrictive CSP reduce privilege, but sandbox attributes/CSP are not a substitute for a broader threat-model review if capabilities are expanded.

**Current integration fact:** although this Route Handler and runtime-document infrastructure exist, src/app/labs/[slug]/page.js does not mount the iframe. Do not claim public interactive detail execution or public runtime ready/error/retry UI on that page.

## 8. Gallery poster and media relationships

The current data model separates:
1. `galleryPreview`: optional public image/GIF/video promoted from the owner's private media library and bound to the current artifact/source version;
2. `LabBuildArtifact.previewPoster`: automatic static PNG screenshot metadata for the exact compiled release, separate from `outputFiles`;
3. `mediaAttachments`: at most one private attachment, with the only allowed role currently `fallback-preview`.

The public preview selection order is owner-promoted `galleryPreview`, matching generated `previewPoster`, then generic Labs artwork/neutral fallback. The generated poster is captured inside the network-denied release Sandbox by `captureReleasePoster()` using Playwright 1.65.0 / Chromium 158.0.8127.18 at 1200×900; it must pass visible-output, no-runtime-error, PNG signature, size, dimension, browser-version and SHA-256 checks. Poster metadata is exposed publicly only when it matches the currently published artifact and source version. Capture failure is stored as unavailable and does not fail an otherwise valid release. The current owner media promotion route validates the owned Cloudinary asset and copies its bytes to public Vercel Blob; stale preview IDs are not rendered.

The wider approved target media model includes gallery-preview, ordered detail-gallery and runtime-fallback roles. That target schema/UI migration is not complete. Do not use fallback-preview as if it were the final runtime-fallback role. A true runtime-fallback UI is also not applicable to the currently static detail page.

## 9. Owner authorization and source access

Published source access and owner access are different policies:
- Any server-authenticated account with emailVerified === true can read the currently published source.
- Guests and signed-in unverified accounts cannot receive source bytes.
- Source access requires a canonical currently published experiment and exact published snapshot; it no longer relies on per-user LabSourceGrant lookups.
- Owner routes/actions require a server-derived Better Auth session and the singleton owner guard.

**Accepted owner target:** LABS_OWNER_USER_ID only.  
**Current code discrepancy:** owner-access.js also accepts a verified account whose email matches LABS_OWNER_EMAIL. The source tree must be changed before ID-only enforcement can be claimed. Verify deployment configuration before removing the fallback to avoid locking out the actual owner.

## 10. Environment and deployment gates

Inspect .env.example and operations/ENVIRONMENT-AND-RELEASE.md for exact variable names. Relevant configuration classes include:
- MongoDB URI/database name and Better Auth secret;
- singleton Labs owner identity;
- Vercel Sandbox access/configuration;
- Vercel Blob artifact/poster storage token;
- Cloudinary account credentials and upload configuration;
- media upload limits;
- canonical site origin and auth trusted origins;
- SMTP auth delivery settings.

Never store secret values in docs or client code. A code path using a provider does not prove Preview or Production has working credentials, permissions, quotas or callbacks.

### 10.1 Timeout discrepancy to verify

The publish Route Handler currently declares maxDuration = 60, while a nearby older compiler comment refers to a longer publish window (300 seconds) and a worker cap. The explicit Route Handler declaration is the code-level value observed during this audit; the comments may be stale. Verify deployment plan/runtime limits before changing duration. Do not assume a multi-minute compiler budget can complete inside a 60-second route execution cap.

## 11. Failure investigation sequence

For a failed owner Run:
1. Confirm owner session and same-origin request.
2. Confirm working-copy payload shape, file/path/language/size limits.
3. Confirm Sandbox provisioning, compiler command result and timeout.
4. Confirm preview server readiness, run record and expiry.
5. Confirm preview URL and iframe/bridge policy.
6. Confirm a retry does not mutate source version/published pointers or discard unsaved editor state.

For a failed release build:
1. Confirm owner, exact selected source version and content hash.
2. Confirm source version has the expected project entry mode/files.
3. Inspect compiler exit status and bounded resource/time limits.
4. Validate build manifest, entry document, output size and content/build hashes.
5. Confirm immutable Blob upload succeeded.
6. Confirm LabBuildArtifact linkage to the exact source version.
7. Confirm publication pointer changes occur only after all required artifact steps succeed.
8. Confirm any separate owner gallery-preview promotion outcome independently from compiler outcome.

For a public static preview media failure:
1. Check the current selected galleryPreview release binding.
2. Confirm the public Blob object is available and its artifact/source version matches the current published pointers.
3. Confirm the generic Labs artwork/neutral placeholder appears if no valid galleryPreview exists.
4. Confirm the page remains static and does not mount a runtime iframe.

## 12. Non-negotiable invariants

- Never execute untrusted experiment code in the main application process or privileged portfolio DOM.
- Never run a mutable draft or current editor state as a public release.
- Never serve an artifact that does not match the exact published pointers.
- Never allow local artifact references to escape the immutable artifact prefix.
- Never expose source bytes to guests or email-unverified accounts.
- Never log source content, credentials, preview tokens or provider secrets.
- Keep Run temporary and owner-only.
- Keep the public Labs detail page static/non-executable under the accepted 7 November decision.
- Keep gallery/card media static; no iframe, React root, compiler job or experiment JavaScript in the public catalogue card grid.
- Keep public portfolio homepage and project-detail behavior isolated from Labs compiler/editor bundles.

## 13. Verification status

The source tree contains the compiler, owner Run flow, publish service, immutable artifact storage references and artifact Route Handler. This documentation review did not invoke Vercel Sandbox, Blob, Cloudinary, MongoDB Atlas or a deployed browser. It therefore does not certify external credentials, actual artifact availability, CSP behavior in production, authenticated owner journeys, browser isolation or current-HEAD build success.

Required verification remains:
- [ ] clean install, targeted test suites and production build against exact branch HEAD;
- [ ] owner Run for JS/JSX/TSX with unsaved last-keystroke synchronization;
- [ ] Save Draft, history, restore, publish/unpublish and audit round-trip against Atlas;
- [ ] immutable artifact output/manifest/Blob integrity;
- [ ] public artifact endpoint mismatch/path/MIME/CSP tests;
- [ ] public Labs detail static check: no iframe/runtime request;
- [ ] automatic release poster capture success/failure, metadata/hash validation, artifact-route delivery and exact-release binding;
- [ ] owner-promoted media precedence, cleanup and exact-release binding;
- [ ] owner/non-owner/guest/unverified source access matrix;
- [ ] mobile/desktop, keyboard, reduced-motion and both theme QA;
- [ ] homepage/project-detail regression verification.

## 13. Owner compiler snapshot storage management

The owner Source Management page includes a separate Vercel Sandbox snapshot inventory. It uses the project's deployment OIDC identity and the Vercel Sandbox SDK to list project snapshots and named Sandboxes; it does not require a personal access token or paid Vercel team.

The panel reports the sum of project snapshot byte sizes, snapshot metadata, sandbox references and conservative deletion eligibility. It explicitly does not label project bytes as the account-wide Hobby quota.

Deletion is restricted to created automatic leaf snapshots that are not referenced by a named Sandbox, the active deployment compiler environment, or any parent/ancestor relationship. Manual/unknown snapshots and incomplete inventory scans are protected. The DELETE API repeats the inventory and eligibility check on the server immediately before deletion and verifies the result afterward. The owner must type the complete snapshot ID.

This management surface is independent from visitor experiment execution, source compilation, artifact delivery and gallery posters. It does not delete named Sandbox records, drives, source versions or published artifacts.

Implementation: `LabSnapshotStoragePanel.js`, `/api/v1/admin/labs/sandbox-snapshots`, `snapshot-storage-management.js` and `snapshot-storage-policy.mjs`. Operational details and verification command are in [LABS-PREVIEW-RECOVERY.md](../operations/LABS-PREVIEW-RECOVERY.md#14-owner-source-management--vercel-snapshot-storage-manager).
