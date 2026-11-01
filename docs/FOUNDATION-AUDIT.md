# Foundation Phase — Repository Audit and Baseline

**Status:** Partial — source inspection completed; runtime/build/browser baseline still pending.  
**Branch:** `docs/portfolio-platform-spec`  
**Scope:** Read-only inspection. No application source, dependency manifest, lockfile, or deployment configuration was changed for this audit.

## 1. Executive summary

The repository is an existing Next.js App Router portfolio, not a blank application. It has a working content architecture based on JavaScript data modules, a server-rendered homepage entry point, statically generated project detail routes, reusable project presentation components, a contact API route, SEO utilities, and a deliberately layered animation/loading experience.

The safe strategy is **incremental extension in the existing `src/app` structure**, not replacing it with the generic `app/`, `components/`, `features/`, and `lib/` tree shown as a conceptual proposal in `PROJECT-STRUCTURE.md`.

The current foundation phase is not complete yet: this audit used repository source inspection, but did not execute `npm ci`, lint, SEO validation, production build, browser tests, screenshots, Lighthouse, or accessibility checks. Those results must be captured in a controlled environment before implementation begins.

## 2. Repository facts verified from the working branch

### Application and dependencies
- Next.js App Router, React 19, JavaScript/JSX, and Tailwind CSS v4.
- Motion (`motion/react`), Lenis, `next-themes`, Three.js, Lucide React, React Icons, `clsx`, and `tailwind-merge`.
- React Compiler is enabled in `next.config.mjs`.
- Next image configuration includes AVIF/WebP, responsive device/image sizes, and explicit qualities 75 and 90.
- Existing scripts:
  - `npm run dev`
  - `npm run build` — runs SEO validation before `next build`
  - `npm run start`
  - `npm run lint`
  - `npm run validate:seo`
- No `test`, `test:e2e`, or `typecheck` script is declared in the inspected `package.json`.
- The inspected manifest does **not** declare TanStack Query, Express, MongoDB driver/ODM, Cloudinary SDK, an authentication provider, or a charting library. This does not authorize adding them now; dependency selection follows the relevant architecture decision and phase gate.
- `package-lock.json` exists. Preserve package manifest/lockfile consistency for any later approved dependency change.

### Current high-level tree
```text
repo-root/
├── src/
│   └── app/
│       ├── api/
│       │   ├── contact/route.js
│       │   └── source-snapshot/route.js
│       ├── components/
│       │   ├── common/
│       │   ├── errors/
│       │   ├── layout/
│       │   ├── mascot/
│       │   ├── motion/
│       │   ├── project-detail/
│       │   ├── sections/
│       │   ├── seo/
│       │   └── ui/
│       ├── data/
│       ├── helper/
│       ├── hooks/
│       ├── lib/
│       ├── projects/[slug]/
│       ├── providers/
│       ├── store/
│       ├── error.js
│       ├── global-error.js
│       ├── globals.css
│       ├── layout.js
│       ├── not-found.js
│       ├── page.js
│       ├── robots.js
│       └── sitemap.js
├── public/
│   ├── images/
│   ├── projects/
│   ├── mp3/
│   ├── audio/
│   └── resume/
├── scripts/
│   ├── setup-env.cjs
│   └── validate-seo.cjs
├── docs/                         # This branch's tracked platform docs
├── package.json
├── package-lock.json
├── next.config.mjs
├── eslint.config.mjs
├── postcss.config.mjs
└── jsconfig.json
```

This is a high-level map of inspected paths, not an exhaustive file inventory. Confirm the full tree and local ignored files in the actual development checkout before making code changes.

## 3. Existing public route and content flow

### Homepage
- `src/app/page.js` is a Server Component.
- It creates homepage metadata and JSON-LD through `src/app/lib/seo/metadata` and `src/app/components/seo/JsonLd`.
- `src/app/components/HomePage.js` is a Client Component.
- The homepage imports the intro loader and navbar, statically imports the hero, lazy-loads the mascot, and lazy-loads below-fold sections.
- Below-fold sections are loaded through the existing sections barrel with `React.lazy` and `Suspense`.
- A custom loader/provider uses `heroReady` and visibility gating so the intro transition reveals mounted content. Changing this flow can cause blank/hidden content, hydration issues, or animation regressions; preserve it unless a measured, tested change is approved.

### Portfolio content
- Content currently lives in JavaScript data modules under `src/app/data/`.
- `src/app/data/portfolio.js` composes the portfolio object from modules and includes experience and social/navigation data.
- `src/app/data/projectsData.js` holds canonical project records, including descriptive story content, media, links, technologies, presentation/motion settings, status/order/featured flags, and detail-section content.
- `src/app/data/projectsSeo.js` enriches canonical project data with SEO metadata; its comments explicitly intend to avoid a second project database.
- `src/app/data/index.js` re-exports section/project data.
- Education currently comes from a dedicated code-managed data module and is intended to remain static/code-controlled under the PRD.

### Project detail pages
- `src/app/projects/[slug]/page.js` is a Server Component.
- It uses `generateStaticParams()` to prerender canonical slugs from `portfolio.projects`, sets `dynamicParams = false`, generates per-project metadata and server-rendered JSON-LD, and returns a real 404 for unknown slugs.
- `ProjectPageView.js` is a Client Component that reuses the intro loader, navbar, and `ProjectDetail` presentation component.
- Previous/next navigation is derived from the current order in canonical project data.
- Existing routes documented in README: `/projects/class-fuse`, `/projects/spendwise`, `/projects/system-canvas`, and `/projects/nextjs-master`.
- A move from static canonical data to CMS data will affect static parameter generation, metadata, sitemap, JSON-LD, previous/next navigation, media references and not-found behavior. Do not replace these paths or presentation components in one broad rewrite.

### Existing API routes
- `POST /api/contact` validates name, email, project type, and message length, and sends contact messages through Nodemailer/Gmail SMTP using server environment variables.
- `GET /api/source-snapshot` is intended for development diagnostics and returns 404 when `NODE_ENV === "production"`. It validates paths are under `src/` and rejects traversal-like input. Preserve this production guard and re-review it before any diagnostics changes.
- These are the only two API route folders visible in the inspected `src/app/api` directory. There is no current platform API, auth API, MongoDB access layer, or Cloudinary integration evidenced by this inspection.

## 4. SEO, metadata, and response headers

- Homepage and project metadata are generated using shared utilities under `src/app/lib/seo/`.
- Project metadata includes canonical URLs, Open Graph, Twitter card data, and server-rendered project JSON-LD.
- `src/app/robots.js` and `src/app/sitemap.js` provide generated robots/sitemap routes.
- `scripts/validate-seo.cjs` validates project SEO data and is run as part of the production build.
- `next.config.mjs` configures image formats/sizes, a long-lived immutable cache header for `/images/:path*`, and general DNS-prefetch, content-type and referrer-policy headers.
- The header configuration should be reviewed for new private/admin/preview routes before those routes are added; public asset caching rules must not be copied blindly to user-specific or draft content.
- SEO validator's attempt to load social data has a fallback because JSX icons/path aliases cannot be loaded by plain Node. Record its runtime result rather than assuming it passes.

## 5. Important risks and constraints identified

1. **Public portfolio regression risk:** homepage and project details have interdependent loader, visibility, motion, metadata, data, and media behavior. Keep their UI components as presentation owners while adding a separate data-access/domain layer.
2. **Global provider cost:** root layout wraps all pages in existing app/theme providers and renders the shared footer. New admin-only providers (query client, editor, charts) must not be added globally without proving they do not increase public-page JS/hydration.
3. **Data source migration risk:** project content is shared across rendering and SEO utilities. Establish a normalized content contract and compatibility tests before switching reads to MongoDB.
4. **Static route behavior:** `generateStaticParams` plus `dynamicParams = false` is an explicit current behavior. CMS-driven slugs require a planned revalidation/static-generation strategy, not a casual change.
5. **No verified automated test suite:** package scripts show lint/build/SEO validation, but no test command. Need identify existing local test scripts and decide an approved test strategy before adding packages.
6. **Dependency gap:** React Query, Express, MongoDB and Cloudinary are not declared in the inspected manifest. Do not claim they are installed or implement integrations before decisions and environment requirements are reviewed.
7. **Local-only docs:** root `.gitignore` excludes known local-only paths such as `/implementation Doc/`, `/implemention Doc/`, `/performance doc/`, and `/PERFORMANCE-OPTIMIZATION-REPORT.md`. The GitHub branch does not expose those ignored files at the inspected paths. Do not assume their contents or overwrite them; request/materialize local copies only if they are needed for a later reconciliation.
8. **Environment mismatch documented by README:** README notes contact code requires `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `CONTACT_TO_EMAIL`, while `.env.example` has Resend-related values and does not list both Gmail variables. Verify local environment documentation during implementation, without exposing or changing secrets in this phase.
9. **Potential future server runtime boundary:** scheduled publishing and isolated source execution may not fit ordinary request/response functions. These require separate decisions; do not add Express merely to solve them without evaluating focused worker/scheduler options.

## 6. Stack comparison against the approved platform plan

| Area | Current repository evidence | Foundation implication |
|---|---|---|
| UI framework | Next.js App Router, React 19 | Extend current application, do not scaffold a replacement |
| Language | JavaScript/JSX | No TypeScript migration |
| Styling | Tailwind CSS v4 and global CSS | Preserve current styling tokens and conventions |
| Motion/scroll | Motion, Lenis, custom providers/hooks | Regression-test loader, reduced motion and scroll behavior |
| Portfolio content | JS modules | Need a CMS adapter and DTO compatibility layer |
| Project detail | Static params + canonical JS data | Plan dynamic slug generation and metadata carefully |
| API | Contact and dev-only source snapshot | Establish conventions before new endpoints |
| Database | No MongoDB package/access layer evidenced | Host, connection lifecycle, indexes and validation still open |
| Media | Static public assets; no Cloudinary package evidenced | Plan Cloudinary integration only after architecture gate |
| Client server state | TanStack Query absent from manifest | Add only after concrete client-side use cases are selected |
| Separate API | Express absent from manifest | Not approved by default |
| Tests | No package test scripts shown | Runtime checks still need execution and strategy |
| Auth | No provider evidenced in inspected manifest/tree | Provider/session decision remains open |

## 7. Baseline commands to run in a development checkout

Run from the repository root on `docs/portfolio-platform-spec`, after confirming the checkout is on that branch and the worktree state is understood:

1. `npm ci` — reproducible dependency installation.
2. `npm run lint` — ESLint.
3. `npm run validate:seo` — standalone SEO data validation.
4. `npm run build` — SEO validation plus production build.
5. If build succeeds, run `npm run start` and inspect homepage, all four project detail routes, unknown project slug/404, robots and sitemap.
6. Capture desktop/mobile screenshots and record browser console/network errors, reduced-motion behavior, keyboard navigation and representative accessibility results.
7. Record Lighthouse/Web Vitals measurements using the same browser/device/network settings for future comparisons.
8. Exercise contact form validation and verify no secrets appear in client output/logs.
9. Verify `/api/source-snapshot` returns 404 in a production build.
10. Record the exact commit SHA, environment (without secrets), tool versions, command output, known failures and screenshot locations.

**Important:** These commands were not run as part of this remote source audit. Do not mark them passed until actual output is collected. Do not use an external production deployment as a substitute for a controlled local/preview baseline.

## 8. Foundation completion checklist

- [x] Confirm target branch and inspect repository metadata.
- [x] Inspect package manifest, scripts, dependencies and lockfile presence.
- [x] Map main App Router, components, data, hooks, providers, libraries and API folders.
- [x] Trace homepage and project-detail data/render/SEO flow.
- [x] Identify existing API routes and key security behavior.
- [x] Record proposed-stack gaps and unresolved infrastructure decisions.
- [x] Record constraints and regression risks.
- [ ] Run baseline install, lint, SEO validation and production build in a checkout.
- [ ] Capture public route screenshots and performance/accessibility/browser baselines.
- [ ] Reconcile local ignored specifications with tracked docs, if supplied/available.
- [ ] Review this audit with the user before implementation.
- [ ] Approve Phase 1 architecture/threat model and decision records.

## 9. Phase decision

**Current result: FOUNDATION AUDIT PARTIALLY COMPLETE — implementation is still blocked.**

Source inspection is sufficient to reject a wholesale folder restructure and to define the safe migration direction. It is not sufficient to assert that the app currently builds, passes lint/SEO, meets any numeric performance target, or has no visual/accessibility regressions. Finish the unchecked baseline items before starting Phase 1 implementation work.
