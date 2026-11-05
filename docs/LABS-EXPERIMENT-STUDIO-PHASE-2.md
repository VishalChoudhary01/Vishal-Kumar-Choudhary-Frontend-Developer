# Labs Experiment Studio — Phase 2: HTML/CSS/JavaScript Preview Prototype

**Status:** Historical Phase 2 `srcDoc` preview prototype implemented on `feat/labs-platform-integration`; not production security approval and not the final Studio runtime. Later work added an isolated compiler foundation with HTML/CSS/JavaScript and React JSX/TSX smoke coverage. The deployed owner Run workflow, public detail artifact rendering and complete security gate remain unverified. See `LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md` for the current compiler/runtime status and next phases.

## What the prototype does today

- Preview runs only when the owner presses **Run**.
- The current unsaved HTML/CSS/JavaScript files are copied into a run snapshot in the browser.
- The component builds an iframe srcDoc document and uses the iframe sandbox attribute without allow-same-origin.
- The component attempts to apply a restrictive CSP that blocks network connections, remote scripts, nested frames, objects, workers, form submissions and external fonts/images.
- Console messages and uncaught errors are forwarded through postMessage; the parent accepts messages only from the exact iframe window.
- Desktop/mobile viewport controls, restart and a bounded console list are provided.
- React/JSX/TS/TSX files are stored but are not executed by this adapter.

## Supported execution files

- One HTML file (.html or .htm), optional.
- One or more CSS files (.css).
- One or more native JavaScript module files (.js or .mjs).

The source content is assembled into a browser document. The adapter does not compile local imports, bundle project modules, compile JSX, process Tailwind utilities, resolve Motion packages or provide uploaded media references.

## Explicit limitations

- External Tailwind CDN, Lucide CDN, Google Fonts imports, remote JS/CSS, package installation and remote module imports do not work under the prototype's default restrictive policy.
- React, ReactDOM, JSX, Tailwind v4 build output and Motion from motion/react are not available in this specific `srcDoc` prototype adapter. The later isolated compiler supports React JSX/TSX and Tailwind/Motion smoke fixtures; this statement must not be generalized to the current compiler target.
- This is a client-side preview prototype, not an isolated compiler worker or separate-origin static artifact host.
- The iframe sandbox attribute alone is not sufficient evidence of a complete isolation boundary. The current implementation has not passed the required sandbox escape, CSP, origin, network, storage, resource-limit or abuse tests.
- Media upload, Cloudinary asset privacy, immutable asset manifests and image/GIF/video playback from uploaded media are not implemented here.
- A successful prototype run must not be used as a publication attestation.

## Required target architecture

The current compiler, runtime, media and publishing requirements and release status are defined in `LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md`. This Phase 2 document remains a record of the earlier `srcDoc` prototype, not the source of truth for the current compiler.

1. Build React/JSX using pinned React/ReactDOM and a fixed browser package allowlist.
2. Compile Tailwind CSS v4 at build time through the approved PostCSS toolchain.
3. Execute Motion through the pinned motion/react package, respecting reduced-motion preferences.
4. Run build jobs in an ephemeral isolated worker with no application secrets and no package-install/network access.
5. Serve immutable compiled artifacts from a dedicated runtime origin inside a sandboxed iframe with strict CSP and validated messaging.
6. Upload images, GIFs and videos through owner-authorized signed Cloudinary uploads; reference immutable asset IDs through a versioned build manifest.
7. Publish only an exact saved source version + successful build artifact + ready media manifest as one immutable release.

## Publishing gate

Custom experiments remain private drafts. The custom source publish API rejects publication until the complete secure runtime, immutable build artifact, public detail route and exact-release validation contract have been implemented and security-reviewed.
