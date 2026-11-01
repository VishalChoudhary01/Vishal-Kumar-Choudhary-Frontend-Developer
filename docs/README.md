# Portfolio Platform — Documentation Index

**Status:** Requirements baseline; implementation not started.  
**Branch:** `docs/portfolio-platform-spec`

This documentation defines the proposed portfolio platform extension. It is not proof that any feature has been implemented or that infrastructure decisions have been validated against the current repository.

## Source-of-truth order
1. `PRD.md` — product scope, users, requirements, constraints, acceptance criteria.
2. `IMPLEMENTATION-PLAN.md` — phases, dependencies, verification gates, definition of done.
3. `DESIGN-ADMIN.md` — admin and portfolio CMS experience.
4. `DESIGN-ANALYTICS.md` — analytics dashboard, event definitions, interpretation.
5. `DESIGN-LAB.md` — public Lab, experiment details, previews and source access.
6. Existing project-level source-of-truth documents and current implementation — authoritative for current behavior and technical conventions. Inspect before changing code.

## Locked baseline
- Preserve the current public portfolio home page, project detail pages, education section, design, responsive behavior, animation, SEO, accessibility, and functionality.
- Dynamic CMS-managed content: hero/introduction, about, skills, experience, projects, project details, media/gallery metadata, project links, featured and publication state.
- Education content remains static in code. Layout, design system, typography, animation and interactions remain code-controlled.
- Next.js App Router, JavaScript, Tailwind CSS v4, Motion (`motion/react`), MongoDB, Cloudinary and Vercel are the chosen baseline technologies.
- Email/password and Google sign-in are required. The authentication provider/session implementation remains unselected.
- Guests can browse published Lab entries and static previews. Full source and interactive previews require authentication and server-side authorization.
- Admin has portfolio CMS, Lab management, analytics, media library, drafts/publishing, scheduled publication, and immutable content-version history.
- Cloudinary-backed advanced media library with usage tracking and reference-safe replacement/deletion.
- Never execute untrusted experiment code inside the main application runtime. The secure isolation mechanism and hosting remain architecture decisions.
- No feature work begins until the repository and existing design are inspected and a baseline regression check is recorded.

## Documents
- [Product requirements](./PRD.md)
- [Implementation plan](./IMPLEMENTATION-PLAN.md)
- [Admin design](./DESIGN-ADMIN.md)
- [Analytics design](./DESIGN-ANALYTICS.md)
- [Lab design](./DESIGN-LAB.md)

## Change control
A new requirement must be added to the PRD, with affected design/implementation documents updated together. Explicitly mark unselected decisions as **OPEN**; do not silently invent choices. Any change that can affect existing public routes or rendering requires a documented impact assessment and regression evidence.


## Engineering architecture documents
- [System architecture and frontend/backend boundaries](./ARCHITECTURE.md) — source-of-truth rules for route handlers, business logic, data access, schemas, middleware, security and API contracts.
- [Proposed project structure](./PROJECT-STRUCTURE.md) — recommended folder/module boundaries to reconcile against the actual repository before implementation.
- [API contracts and domain schemas](./API-CONTRACTS.md) — endpoint inventory, request/response conventions, validation and permission expectations.

## Stack decisions and implementation boundaries
- Frontend remains Next.js App Router + JavaScript + Tailwind CSS v4 + Motion (motion/react).
- TanStack Query (React Query) is approved for client-side server state when interactive caching, mutation lifecycle, invalidation or polling is useful; it does not replace server components or server-side authorization.
- Initial backend decision: use Next.js server-side modules, Route Handlers and Server Actions where appropriate; **do not add a separate Express server by default**. Express remains an open option only if a validated deployment/runtime boundary requires a separate API service or worker.
- MongoDB is the application database; Cloudinary stores media assets. Exact provider/session, scheduling and isolated execution infrastructure remain open.
- Architecture documents define intended boundaries, not verified facts about the current repository. Phase 0 must inspect and adapt the proposed tree to actual conventions.
