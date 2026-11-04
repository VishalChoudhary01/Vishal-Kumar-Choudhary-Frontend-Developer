# Portfolio Platform — Documentation Index

**Status:** Labs/authentication foundation implemented; owner-managed source lifecycle planned; CMS/Admin implementation deferred.  
**Branch:** `feat/labs-public-page` (current Labs implementation branch)

This documentation defines the proposed portfolio platform extension. It is not proof that any feature has been implemented or that infrastructure decisions have been validated against the current repository.

## Source-of-truth order
1. `PRD.md` — product scope, users, requirements, constraints, acceptance criteria.
2. `IMPLEMENTATION-PLAN.md` — phases, dependencies, verification gates, definition of done.
3. `DESIGN-ADMIN.md` — admin and portfolio CMS experience.
4. `DESIGN-ANALYTICS.md` — analytics dashboard, event definitions, interpretation.
5. LABS-AND-AUTHENTICATION-DESIGN-SPEC.md — detailed Labs page/auth UX and repository-aligned implementation guide. This is the detailed UX authority for the public Labs route and authentication screen decisions.
6. LABS-SOURCE-MANAGEMENT-SPEC.md — owner-only protected source lifecycle, source versions, grants, audit and migration plan. This is the detailed implementation-planning authority for owner-managed Labs source; it does not authorize live source execution.
7. DESIGN-LAB.md — broader Lab product capabilities (search, sorting, likes, source/preview policy, engagement and publishing). Apply unless a detailed page UX decision in LABS-AND-AUTHENTICATION-DESIGN-SPEC.md explicitly supersedes it.
8. Existing project-level source-of-truth documents and current implementation — authoritative for current behavior and technical conventions. Inspect before changing code.

## Locked baseline
- Preserve the current public portfolio home page, project detail pages, education section, design, responsive behavior, animation, SEO, accessibility, and functionality.
- Dynamic CMS-managed content: hero/introduction, about, skills, experience, projects, project details, media/gallery metadata, project links, featured and publication state.
- Education content remains static in code. Layout, design system, typography, animation and interactions remain code-controlled.
- Next.js App Router, JavaScript, Tailwind CSS v4, Motion (`motion/react`), MongoDB, Cloudinary and Vercel are the chosen baseline technologies.
- Email/password and Google sign-in are required. Better Auth with the MongoDB adapter is the selected Labs authentication foundation. Google OAuth credentials, SMTP delivery configuration and the final session-lifetime policy remain deployment/release requirements. First-party Terms and Privacy pages are integrated at `/terms` and `/privacy`; server-owned policy versions are recorded at sign-up.
- Guests can browse published Lab entries and interact with demos explicitly designated public. Full source remains protected; restricted/untrusted interactive previews require the approved authentication/isolation policy.
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

- [Labs and authentication UX + implementation guide](./LABS-AND-AUTHENTICATION-DESIGN-SPEC.md) — detailed Labs page design, auth flows, current stack/repository baseline, proposed components/hooks/state ownership and feature implementation guidance.
- [Labs owner-managed source lifecycle](./LABS-SOURCE-MANAGEMENT-SPEC.md) — protected owner workspace, source snapshots/versions, per-user grants, auditing, migration and rollout phases.
- [Database and media setup plan](./DATABASE-AND-MEDIA-SETUP-PLAN.md) — MongoDB Atlas, Mongoose, Cloudinary, environment variables, security, testing and deployment setup.

## Change control
A new requirement must be added to the PRD, with affected design/implementation documents updated together. Explicitly mark unselected decisions as **OPEN**; do not silently invent choices. Any change that can affect existing public routes or rendering requires a documented impact assessment and regression evidence.


## Engineering architecture documents
- [System architecture and frontend/backend boundaries](./ARCHITECTURE.md) — source-of-truth rules for route handlers, business logic, data access, schemas, middleware, security and API contracts.
- [Proposed project structure](./PROJECT-STRUCTURE.md) — recommended folder/module boundaries to reconcile against the actual repository before implementation.
- [API contracts and domain schemas](./API-CONTRACTS.md) — endpoint inventory, request/response conventions, validation and permission expectations.

## Stack decisions and implementation boundaries
- Frontend remains Next.js App Router + JavaScript + Tailwind CSS v4 + Motion (motion/react).
- TanStack Query (React Query) is approved conditionally for client-side server state when useful; it is not installed in the inspected package manifest and must not be assumed. It does not replace Server Components or server-side authorization.
- Initial backend decision: use Next.js server-side modules, Route Handlers and Server Actions where appropriate; **do not add a separate Express server by default**. Express remains an open option only if a validated deployment/runtime boundary requires a separate API service or worker.
- MongoDB is the application database; Cloudinary stores media assets. Better Auth with the MongoDB adapter is selected for Labs. Session-lifetime policy, SMTP vendor/operations, scheduling and isolated execution infrastructure remain open.
- Architecture documents define intended boundaries, not verified facts about the current repository. Phase 0 must inspect and adapt the proposed tree to actual conventions.


## Current Labs implementation status

The `feat/labs-public-page` branch contains the Labs listing/detail implementation and the initial Better Auth + MongoDB adapter authentication and protected-source foundation. See:
- [Labs and authentication UX/implementation baseline](./LABS-AND-AUTHENTICATION-DESIGN-SPEC.md), especially Section 36.
- [Labs authentication and protected-source setup/provisioning runbook](./LABS-AUTHENTICATION-AND-SOURCE-ACCESS.md).
- [Labs owner-managed source lifecycle specification](./LABS-SOURCE-MANAGEMENT-SPEC.md) — owner identity, source file editor, immutable snapshots, draft/publish/restore, per-user grants, audit, migration and implementation phases.

CMS/Admin remains deferred until Labs is complete. Existing public portfolio routes and demos must remain usable when authentication configuration is absent.


First-party legal pages are maintained at `/terms` and `/privacy`. Their policy versions are server-owned in `src/app/lib/legal/policies.js`; increment the relevant version whenever published legal text changes materially.
