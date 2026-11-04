# Labs isolated React compiler

Private build worker for the documented React/JSX experiment template. Run only inside an ephemeral Vercel Sandbox with outbound networking disabled. Never execute owner-authored code in a Next.js Route Handler or the main portfolio process.

Pinned toolchain:
- Vite 8.3.5
- React and React DOM 19.2.8
- Motion 13.2.0, imported from motion/react
- Tailwind CSS and its PostCSS integration 4.3.3
- esbuild 0.28.2
- Fixed import allowlist: react, react-dom, motion/react, lucide-react, clsx and tailwind-merge.

Input files:
- files.json: array of relative paths and text content.
- assets.json: empty by default. Only an explicitly reviewed optional fallback asset may be added under the release contract.

Required layout:
- index.html with a root element and module script ./src/main.jsx.
- src/main.jsx mounting the application with createRoot.
- src/App.jsx as the default React component.
- src/index.css importing Tailwind v4.

The compiler rejects path traversal, hidden paths, oversized snapshots, missing entry points, absolute and remote imports, Node built-ins, unknown packages, require, eval/Function, dynamic expression imports, parent context/cookie/storage access, and unapproved remote CSS/assets. It does not accept package manifests, install dependencies or execute owner package scripts.

Run npm run test:smoke to compile the committed React/Motion/Tailwind fixture and verify emitted utility CSS. This verifies compilation only; it is not a subst¶»§q«^