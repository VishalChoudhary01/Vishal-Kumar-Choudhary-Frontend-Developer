# Labs Experiment Studio — Phase 2: Isolated HTML/CSS/JavaScript Preview

**Status:** Implemented on `feat/labs-platform-integration`. This is a first preview adapter, not the final React/JSX runtime.

## Runtime contract

- Preview runs only when the owner presses **Run**.
- The current unsaved HTML/CSS/JavaScript files are copied into a run snapshot.
- Code executes in an iframe with `sandbox="allow-scripts"` and without `allow-same-origin`.
- A restrictive Content Security Policy blocks network connections, remote scripts, nested frames, objects, workers, form submissions and external fonts/images.
- Console messages and uncaught errors are sent to the parent via `postMessage`; the parent accepts messages only from the exact preview iframe window.
- Preview scripts never execute in the main Next.js React tree or on the server.
- React/JSX/TS/TSX files are stored but not executed by this adapter.

## Files supported for execution

- One HTML file (`.html` or `.htm`), optional.
- One or more CSS files (`.css`).
- One or more native JavaScript module files (`.js` or `.mjs`).

Local module imports, remote dependencies, package installation and React compilation are not supported in this first adapter. React/JSX support must be built with a fixed dependency allowlist and isolated module bundling before it is enabled.

## Publishing

Custom experiments remain private drafts. Their source publish API responds with a conflict until a successful isolated preview validation and a public runtime route are implemented.
