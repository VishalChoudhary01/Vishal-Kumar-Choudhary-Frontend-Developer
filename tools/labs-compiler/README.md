# Labs isolated experiment compiler

Private build worker for Labs React and standalone HTML/CSS/JavaScript experiments. Run only inside an ephemeral Vercel Sandbox with outbound networking denied. Owner-authored source must never execute in a Next.js Route Handler or the main portfolio process.

## Pinned toolchain

- Vite 8.3.5
- React and React DOM 19.2.8
- Motion 13.2.0, imported from `motion/react`
- Tailwind CSS and `@tailwindcss/postcss` 4.3.3
- esbuild 0.28.2
- lucide-react 0.577.0
- Playwright 1.65.0 with Chromium 158.0.8127.18 installed in the immutable compiler snapshot
- Fixed import allowlist: `react`, `react-dom`, `motion/react`, `lucide-react`, `clsx`, and `tailwind-merge`

## Input contract

The worker receives `files.json` (relative source paths and text content) and an empty `assets.json`. Runtime asset imports are disabled. Optional images, GIFs and videos are uploaded media; they remain private until the owner explicitly promotes an eligible asset to public gallery media. A release-matching promoted asset takes precedence over the generated screenshot; with no promoted asset, the screenshot captured from the exact published artifact is selected, then the public Labs artwork/neutral fallback is used if capture is unavailable.

## Supported project modes

- **React JavaScript/JSX:** complete React entry files or a supported single-file JSX adapter; generated entry files do not overwrite saved source.
- **React TypeScript/TSX:** complete TSX entry files or supported single-file adapter; the platform generates a fixed strict TypeScript config and runs `tsc --noEmit` before the Vite bundle.
- **Standalone HTML/CSS/JavaScript:** remains a separate mode; nested HTML entry promotion and local relative asset path rewriting are supported. If only CSS/JS is supplied, the platform can construct a minimal HTML entry. It is never silently wrapped in React.

All modes use the fixed, pinned compiler image and the same isolated build boundary. No owner-provided package manifest, arbitrary package installation, custom build script, server-side code or runtime asset import is allowed.

## React entry contract
- `index.html` with a root element and module script `./src/main.jsx`.
- `src/main.jsx` mounting the application with ReactDOM `createRoot`.
- `src/App.jsx` exporting the default component.
- `src/index.css` importing Tailwind v4 with `@import "tailwindcss";`.

The app layer also accepts one JavaScript/JSX component file. When its editor language is JSX, the app adapter normalizes a `.js` filename to `.jsx` in memory and creates the missing React entry files. The saved editor source is unchanged.

## Security and resource policy

The build rejects path traversal, hidden paths, oversized snapshots, duplicate files, missing entry points, absolute and remote imports, Node built-ins, unknown packages, `require`, `eval`, `Function`, dynamic expression imports, app parent/cookie/storage access and unapproved remote CSS/assets. It does not accept user package manifests, install user dependencies or execute user package scripts.

The generated document uses a restrictive Content Security Policy. Preview sessions use a separate sandbox origin and are short-lived. Public releases store only immutable compiled artifacts; source code remains behind the owner/verified-user access rules.

## Smoke test

Run `npm install` followed by `npm run test:smoke`. The test compiles a single `src/new-file.js` file marked as JSX using React state, Motion, lucide-react icons and Tailwind v4 utilities. It verifies emitted HTML/JS/CSS, the build hash, CSP and rejection of an unsupported package.

The immutable release build calls the poster capture worker after compiled output is uploaded. It uses Playwright 1.65.0 + Chromium 158.0.8127.18, a local-only artifact server, blocked external requests, reduced-motion capture and strict PNG/signature/dimensions/size/hash validation. The result is stored as `LabBuildArtifact.previewPoster`, separate from `outputFiles`, and is bound to the exact source version and artifact. Capture is attempted once per release build, never on owner Run or a public page request; failure is non-blocking and leaves the poster unavailable so the gallery can fall back to generic artwork. The browser executable and required Linux libraries must be pre-installed in the immutable compiler snapshot. This is not a substitute for deployed owner publish/browser QA, accessibility QA or the full release-pipeline checks.
