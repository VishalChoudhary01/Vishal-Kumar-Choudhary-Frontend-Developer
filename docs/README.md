# Portfolio Platform — Documentation Index

**Status:** Labs integration branch contains owner source inventory/editor, source lifecycle APIs, immutable version/audit foundations, initial aggregate source-engagement analytics and isolated compiler/runtime foundations. The Analytics and Source Library route split, custom published-experiment analytics coverage and owner-only metadata editor/PATCH are committed and Preview build-verified; authenticated owner QA and Atlas-backed persistence tests remain pending. Source creation-to-workspace navigation and the initial live Analytics dashboard are committed and Preview-build verified; authenticated owner flow, live event round-trip, visual/accessibility QA and the READY Preview verification for rankings/per-experiment detail is recorded in the Labs Owner Console plan. Deployed preview/runtime behavior remains under regression recovery; gallery posters, role-aware media and responsive UX phases are planned in the runtime/media plan. The Labs analytics calculation suite runs automatically before production builds and now contains 12 Node-native cases. The previous READY Preview ran six tests; the expanded attribution/rate-limit suite and source-event quota changes need a fresh Preview build. Authenticated Atlas reconciliation, real event round-trip and visual/accessibility QA remain pending. General portfolio CMS/Admin remains deferred.  
**Primary Labs branch:** `feat/labs-platform-integration`

This documentation defines the proposed portfolio platform extension. It is not proof that any feature has been implemented or that infrastructure decisions have been validated against the current repository.

## Source-of-truth order
1. `PRD.md` — product scope, users, requirements, constraints, acceptance criteria.
2. `IMPLEMENTATION-PLAN.md` — phases, dependencies, verification gates, definition of done.
3. `DESIGN-ADMIN.md` — admin and portfolio CMS experience.
4. `DESIGN-ANALYTICS.md` — analytics dashboard, event definitions, interpretation.
5. LABS-AND-AUTHENTICATION-DESIGN-SPEC.md — detailed Labs page/auth UX and repository-aligned implementation guide. This is the detailed UX authority for the public Labs route and authentication screen decisions.
6. `LABS-SOURCE-MANAGEMENT-SPEC.md` — owner-only protected source lifecycle, automatic verified-account access, source versions, likes, engagement analytics, audit and migration plan.
7. `LABS-OWNER-CONSOLE-ANALYTICS-AND-SOURCE-MANAGEMENT-PLAN.md` — coordination plan for separating Analytics and Source Library, metadata editing, live refresh, current implementation gaps, phase order and preservation gates. It links to rather than duplicates the detailed analytics/source specifications.
8. `LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md` — source of truth for owner Run, isolated compiler/runtime, immutable published artifacts, static code-output posters, media roles, loading/optimistic UX phases and release gates.
9. `DESIGN-LAB.md` — public Labs UX requirements, gallery card hierarchy, runtime/source interactions, accessibility and performance expectations.
10. Existing project-level source-of-truth documents and current implementation — authoritative for current behavior and technical conventions. Inspect before changing code.

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
- [Labs owner-managed source lifecycle](./LABS-SOURCE-MANAGEMENT-SPEC.md) — protected owner workspace, source snapshots/versions, automatic verified-user access, likes/copy/open analytics, auditing, migration and rollout phases.
- [Labs Owner Console — Analytics and Source Management Plan](./LABS-OWNER-CONSOLE-ANALYTICS-AND-SOURCE-MANAGEMENT-PLAN.md) — non-duplicative route separation, experiment metadata editing, current gaps, live polling, implementation sequence and functionality-preservation gates.
- [Labs Experiment Studio runtime and media plan](./LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md) — owner Run regression gates, isolated HTML/React runtime, immutable artifacts, static gallery posters, media-role migration, skeletons, optimistic interactions and phased rollout.
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

The `feat/labs-platform-integration` branch is the active Labs implementation branch. The owner source inventory/editor, source lifecycle and initial aggregate analytics foundations exist. The dedicated Analytics and Source Library routes are committed and Preview build-verified. Custom experiment metadata editing, initial custom analytics coverage, confirmed source creation handoff and the first live Analytics dashboard are code/build verified; authenticated owner and Atlas-backed tests, event-to-screen polling verification, ranking/detail Preview build verification and visual/accessibility QA remain outstanding. The 5 November 2026 browser review also surfaced a blank detail runtime and missing custom gallery visuals; see the runtime/media plan for mandatory recovery and verification gates. See:
- [Labs and authentication UX/implementation baseline](./LABS-AND-AUTHENTICATION-DESIGN-SPEC.md), especially Section 36.
- [Labs authentication and protected-source setup/provisioning runbook](./LABS-AUTHENTICATION-AND-SOURCE-ACCESS.md).
- [Labs owner-managed source lifecycle specification](./LABS-SOURCE-MANAGEMENT-SPEC.md) — owner identity, source file editor, immutable snapshots, draft/publish/restore, automatic verified-user access, source engagement metrics, audit, migration and implementation phases.
- [Labs Owner Console plan](./LABS-OWNER-CONSOLE-ANALYTICS-AND-SOURCE-MANAGEMENT-PLAN.md) — next owner-console work and preservation checklist.

CMS/Admin remains deferred until Labs is complete. Existing public portfolio routes and demos must remain usable when authentication configuration is absent.


First-party legal pages are maintained at `/terms` and `/privacy`. Their policy versions are server-owned in `src/app/lib/legal/policies.js`; increment the relevant version whenever published legal text changes materially.
