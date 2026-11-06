# Labs isolated React compiler

Private build worker for Labs React experiments. Run only inside an ephemeral Vercel Sandbox with outbound networking denied. Owner-authored source must never execute in a Next.js Route Handler or the main portfolio process.

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

The worker receives `files.json` (relative source paths and text content) and an empty `assets.json`. Runtime asset imports are disabled. Optional images, GIFs and videos are uploaded media. They remain private until the owner explicitly promotes one to public gallery media. A promoted image/GIF/video takes precedence over the generated screenshot; with no promoted upload, the screenshot generated from the exact published artifact is shown.

Required React layout:
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

The smoke test also verifies the uploaded image/GIF/video precedence against the generated screenshot. The release capture worker uses the pinned Playwright 1.65.0 + Chromium 158.0.8127.18 browser, local-only artifact serving, blocked external requests, reduced-motion capture, and strict PNG/hash validation. The browser executable and required Linux libraries must be pre-installed in the immutable compiler snapshot; capture never installs them during publish. This is not a substitute for deployed owner publish/browser QA, accessibility QA or the full release-pipeline checks.
