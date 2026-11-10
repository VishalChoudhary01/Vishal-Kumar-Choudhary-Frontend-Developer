# System Architecture — Current Implementation and Responsibility Boundaries

**Audit branch:** feat/labs-platform-integration  
**Framework:** Next.js App Router / React 19  
**Language:** JavaScript (ES modules)  
**UI:** Tailwind CSS v4, Motion (motion/react), Lucide/React Icons  
**Persistence:** MongoDB, Mongoose and Better Auth Mongo adapter  
**Infrastructure:** Vercel, Vercel Blob, Vercel Sandbox, Cloudinary

## 1. System overview

The repository is one Next.js application with public pages, authentication, private owner screens and server-side APIs. There is no separate general-purpose Express API server in the current architecture.

    Browser
      │
      ├── Public Server Components / Client Components
      ├── Owner UI (server-guarded pages + client interactions)
      ├── Better Auth session and provider callbacks
      │
      ▼
    Next.js App Router
      ├── Page composition / Metadata / JSON-LD
      ├── Route Handlers (/api/**)
      ├── Server-only domain services
      ├── Validation / policy helpers
      └── Persistence and infrastructure adapters
              ├── MongoDB / Mongoose
              ├── Better Auth MongoDB adapter
              ├── Cloudinary authenticated media
              ├── Vercel Blob immutable artifacts/posters
              ├── Vercel Sandbox isolated compiler/runtime
              └── Gmail SMTP (portfolio contact); configured SMTP for Auth

## 2. Frontend responsibilities

### Server route/page layer

Owns:
- canonical routing, 404/notFound behavior;
- initial data reads and route-level composition;
- static params and SEO metadata;
- JSON-LD and safe server-derived props;
- session/owner gates before private data reads;
- no-store/cache behavior for private content.

Do not put interactive scroll Motion state or browser APIs in server components.

### Client shell and section components

Owns:
- visual composition;
- local interaction state;
- focus, keyboard and accessible states;
- Motion and responsive rendering;
- loading, empty, success, retry and failure presentation;
- calling route-backed APIs.

Do not import Mongoose, Better Auth server internals, Cloudinary Admin secrets or server-only services into client bundles.

### Providers and shared state

AppProviders composes:
1. ActionToastProvider
2. MobileMenuProvider
3. MotionProvider
4. SmoothScroll
5. PageLoaderProvider

Providers own cross-page UI state/behavior only. Domain data belongs in route/server services or a feature-specific client state owner. Do not add a global store solely for a single page.

### UI/data layer

- Shared component primitives live under src/app/components.
- Portfolio content data lives under src/app/data.
- Hooks are under src/app/hooks.
- Shared tokens and application styling are controlled by Tailwind/global styles.
- Labs-only runtime/editor/owner components live under components/labs.
- Portfolio Analytics components live under components/portfolio-analytics.
- Motion system helpers live under lib/motion and feature-specific motion configuration files.

## 3. Backend layer ownership

### Route Handlers

Transport boundary under src/app/api:
- parse path/query/body;
- establish session or owner identity;
- enforce same-origin for mutations where required;
- validate request structure;
- call domain services;
- map domain errors into stable status/JSON responses;
- set private/no-store/security headers.

### Server-only policy and service modules

Domain modules under src/app/lib:
- auth: Better Auth setup, session lookup, base URL, email, verification and rate limiting;
- labs: owner policy, source read, source management, experiment management, media, release, compiler, analytics, likes and public discovery;
- portfolio-analytics: config, visit ingestion, lifecycle, attribution, report, recent cursor, deletion, privacy and rate limit;
- db: database connection;
- seo: canonical URL, metadata and structured data.

### Data access

Mongoose model files own collection schema, strict validation and query indexes. Domain services own multi-step use cases and invariants. Do not create arbitrary browser-supplied Mongo filters inside Route Handlers.

### External adapters

- Better Auth: authentication/session and MongoDB account persistence.
- Cloudinary: authenticated image/video upload assets.
- Vercel Blob: immutable public compiled output and release-bound public poster.
- Vercel Sandbox: isolated preview/build process.
- SMTP/Nodemailer: outgoing portfolio contact and Labs auth email.
- Vercel runtime: deployment/function limits and production host.

## 4. Key data flows

### Public portfolio render

    Route page
      → portfolio data (currently code-owned)
      → metadata / JSON-LD
      → client shell
      → section components
      → responsive interaction and Motion

The public portfolio does not currently query a CMS for its content. Do not introduce an unconditional database fetch into the public render path.

### Portfolio visit tracking

    Public shell
      → deferred tracker
      → POST /api/v1/portfolio/visits
      → config/host/payload/rate validation
      → visit service
      → HMAC identifiers + PortfolioVisit
      → owner report service
      → /admin/portfolio/analytics

### Labs source and runtime

    Owner editor
      → owner API
      → source policy / immutable version
      → sandbox compiler
      → immutable Blob artifact
      → published pointer
      → public artifact route + CSP + sandboxed iframe

See architecture/LABS-RUNTIME-AND-CODE-EXECUTION.md.

### Contact form

    ContactForm
      → client validation
      → POST /api/contact
      → server validation
      → Nodemailer Gmail SMTP
      → {ok:true} or safe error

### Authentication

    Login/register client
      → dedicated registration/Better Auth endpoints
      → Better Auth
      → MongoDB adapter
      → verification/reset email
      → session cookie
      → server-session.getCurrentAuthSession
      → owner/source policies

## 5. Current architectural invariants

- Public page render cannot depend on successful analytics writes.
- Admin/source screens are server-authorized; the browser cannot grant itself owner access.
- Email verification is required for protected source read and owner access.
- A public Lab source is linked to an exact immutable source version and build artifact.
- Untrusted authored code is not executed in the main application process or privileged app origin.
- Project/portfolio visual design and section structure are code-owned.
- Portfolio Analytics and Labs engagement are independent domains.
- Labs and Admin use native document scrolling; Lenis applies outside those route roots.
- Public and private/cache-sensitive data must not be mixed in shared cached responses.

## 6. Open/conditional architecture decisions

Do not silently promote these to selected implementations:
- general Portfolio CMS schemas/versioning/cache invalidation;
- scheduled content publisher and worker strategy;
- multi-admin role model (current Labs owner is a singleton);
- session lifetime/concurrency policy beyond installed Better Auth defaults/config;
- full OAuth provider environment setup and E2E verification;
- Cloudinary media retention and full cleanup policy;
- long-term backup/restore and disaster recovery procedure;
- separate worker/service only if validated compiler/runtime operations exceed current Vercel function/sandbox capabilities.

Express is not the default API architecture. A separate service/worker would require a specific requirement and explicit design decision.

## 7. Current repository mapping

| Concern | Current path |
|---|---|
| Next routes/layouts | src/app |
| Public portfolio sections | src/app/components/sections |
| Project detail template | src/app/components/project-detail |
| Labs public UI | src/app/components/labs |
| Labs owner UI | src/app/components/labs/admin |
| Portfolio analytics UI | src/app/components/portfolio-analytics |
| Shared UI | src/app/components/common and ui |
| App providers | src/app/providers |
| Hooks | src/app/hooks |
| Code-owned data | src/app/data |
| API handlers | src/app/api |
| Server/domain modules | src/app/lib |
| Tests | tests |
| Labs compiler toolchain | tools/labs-compiler |
| Operational scripts | scripts |
| Documentation | docs |

## 8. Engineering change process

For a feature or bug:
1. identify affected page/route and its current component tree;
2. identify owning domain and authoritative document;
3. trace client call to API and service/model;
4. identify public/private boundary and cache behavior;
5. identify scroll/motion lifecycle if UI is affected;
6. document data/schema/API changes before implementation;
7. add targeted unit/integration/security tests;
8. record before/after evidence and regression checks;
9. document any newly accepted decision in DECISIONS/PRD and update links.

