# Project Structure and Module Ownership

**Status:** Proposed target structure, not a claim about the current repository.  
**Mandatory first step:** Phase 0 must inspect the real tree and adapt this proposal to existing conventions. Do not create every directory in advance or move unrelated files.

## 1. Rules
1. Existing repository structure is unknown until inspected. This document describes logical ownership, not verified existing paths.
2. Preserve current public route/component locations when feasible; avoid broad refactors.
3. Use JavaScript and existing import aliases from the actual project configuration.
4. Keep server-only modules impossible to import from client components; use clear server-only boundaries.
5. Keep admin, charts, editor, source viewer and interactive preview bundles out of the public homepage critical path.
6. Avoid duplicate definitions of schemas, business rules, endpoint paths and role checks.
7. Feature/domain names below are proposed module names. Adjust names to existing conventions after audit.

## 2. Proposed App Router shape
```text
repo-root/
├── app/
│   ├── (public)/                         # Existing public portfolio routes; retain actual current layout
│   │   ├── page.js                        # Existing homepage — preserve
│   │   ├── projects/
│   │   │   └── [slug]/page.js             # Existing/detail template adapted to published data
│   │   └── lab/
│   │       ├── page.js                    # Published experiment discovery
│   │       └── [slug]/page.js             # Published experiment detail
│   ├── (auth)/                            # Sign-in, registration, verification, reset
│   ├── (account)/                         # Authenticated user dashboard/settings
│   ├── admin/                             # Protected admin route group/layout
│   │   ├── page.js                        # Admin overview
│   │   ├── portfolio/
│   │   ├── projects/
│   │   ├── experience/
│   │   ├── lab/
│   │   ├── media/
│   │   ├── analytics/
│   │   └── settings/
│   ├── preview/                           # Private exact-version preview entry points
│   └── api/                               # Route Handlers only where an HTTP API is needed
│       ├── auth/                          # Only if required by chosen auth provider
│       ├── media/
│       ├── analytics/
│       ├── lab/
│       └── scheduled-publish/             # Authenticated internal/webhook boundary, if appropriate
├── components/
│   ├── ui/                                # Existing shared primitive components
│   ├── portfolio/                         # Existing portfolio sections; preserve behavior
│   ├── lab/                               # Lab-only presentation
│   ├── admin/                             # Admin-only presentation
│   └── analytics/                         # Admin-only charts/tables, lazy-loaded
├── features/                              # Optional only if consistent with existing conventions
│   ├── auth/
│   ├── portfolio-content/
│   ├── projects/
│   ├── lab/
│   ├── media/
│   ├── likes/
│   ├── analytics/
│   ├── publishing/
│   └── users/
├── lib/
│   ├── client/                             # Browser-safe clients/utilities only
│   ├── server/
│   │   ├── auth/                           # Session and actor resolution adapters
│   │   ├── db/                             # MongoDB connection/client
│   │   ├── repositories/                   # Persistence operations
│   │   ├── services/                       # Domain use cases/business logic
│   │   ├── policies/                       # Authorization and resource policies
│   │   ├── schemas/                        # Server-side validation schemas
│   │   ├── cloudinary/                     # Signed upload and asset adapters
│   │   ├── cache/                          # Revalidation/cache adapters
│   │   ├── jobs/                           # Scheduling/worker adapters
│   │   └── security/                       # Rate limit, origin, URL and safe errors
│   └── shared/                             # Truly environment-neutral constants/formatters
├── hooks/                                  # Client hooks; query hooks only where needed
├── providers/                              # Client providers, e.g. scoped QueryClientProvider
├── types/                                  # Optional JSDoc typedefs/shared data contracts
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── security/
│   └── fixtures/
├── docs/
│   ├── README.md
│   ├── PRD.md
│   ├── IMPLEMENTATION-PLAN.md
│   ├── ARCHITECTURE.md
│   ├── PROJECT-STRUCTURE.md
│   ├── API-CONTRACTS.md
│   ├── DESIGN-ADMIN.md
│   ├── DESIGN-ANALYTICS.md
│   └── DESIGN-LAB.md
├── middleware.js                           # Only if justified by actual routing/auth/security needs
├── next.config.js                          # Actual config filename may differ
├── package.json
└── .env.example                            # Document variable names only; never real secrets
```

This is a conceptual target. Route groups such as `(public)` and `(auth)` do not create URL segments. Existing paths, root layout and naming must be inspected before any changes.

## 3. Module ownership
| Concern | Owner | Must not own |
|---|---|---|
| Route page/layout | App Router | Repeated business rules or direct arbitrary database queries |
| UI component | `components/` or existing equivalent | Privileged secrets, MongoDB access |
| Client query hook | `hooks/` or feature module | Authorization or direct privileged access |
| Route Handler / Server Action | Transport adapter | Large domain workflows or unchecked database writes |
| Domain use case/service | Server-only service module | React rendering, HTTP response objects |
| Repository | Server-only data layer | UI state, role claims from browser |
| Schema/normalizer | Shared/server validation module as appropriate | UI-only error formatting mixed with persistence |
| Authorization policy | Server-only policy/use case | Client-only checks |
| Provider adapter | Infrastructure module | Product policy decisions scattered across provider calls |
| Job handler | Job module | Browser-dependent execution |
| Analytics aggregation | Server-side query/service | Raw unbounded event dumps to browser |
| Preview runtime | Isolated execution boundary | Access to privileged app session or database credentials |

## 4. Data fetching conventions
- Server Components should fetch safe initial page data on the server when suitable.
- TanStack Query is for client-side server-state interactions that benefit from caching, mutation state, invalidation or polling.
- Never create a browser query function that calls MongoDB directly.
- Query keys must be stable, scoped by relevant filters/identity, and invalidated after successful mutations.
- Authenticated/private queries must not be accidentally shared across users or persisted publicly.
- Do not fetch the same resource independently through server render, TanStack Query and another global cache without a clear hydration/cache ownership plan.
- Mutations must be authorized server-side regardless of how the client submits them.

## 5. Dependency boundaries
- Do not install Express unless a decision record approves a separate backend.
- Do not add TanStack Query if the current dependency exists already; inspect package.json first. If missing, add only after identifying concrete client-query use cases.
- Charting, syntax highlighting, editors and preview libraries are route-scoped and lazy-loaded.
- Prefer current repository libraries for forms/validation when they meet requirements; any addition must be justified against current dependencies.
- No framework, language or database substitution without explicit approval.

## 6. Environment and secrets
- Use actual environment-variable names discovered from the repository/provider setup; this document intentionally does not invent them.
- Provide an example file containing placeholders only.
- Server-only secrets must never use public-prefixed env names or be serialized to client components.
- Validate required environment configuration at startup or at the owning adapter boundary.
- Document local, preview and production configuration separately without committing secrets.

## 7. Change protocol
Before moving/creating files:
1. Capture the current tree and identify impacted files.
2. Compare the target tree against existing conventions.
3. Write a narrow migration/refactor plan.
4. Update architecture/API docs if ownership or contracts change.
5. Make a small change and run focused checks.
6. Verify public homepage and project detail routes and bundles.
7. Remove old files only after references and tests prove safe.

## 8. Labs owner source-management module boundary

The detailed capability is specified in `LABS-SOURCE-MANAGEMENT-SPEC.md`. The target repository tree should keep these responsibilities server/client separated without forcing a broad restructure:

- Owner route/layout: composes the protected owner workspace and performs a server-side session/owner check before rendering privileged editor data.
- Owner UI: file tree, text editor, draft/publish controls, version history and grant controls. It must not import Mongoose or privileged repositories.
- Owner source use cases: create source head, validate file set, save immutable version, publish/unpublish exact version, restore, grant/revoke and append audit events.
- Owner identity policy: server-only singleton owner guard; recommended `LABS_OWNER_USER_ID` requires explicit approval. No browser roles or first-user-wins fallback.
- Repositories/models: source aggregate, immutable versions, grants and audit records remain server-only. The existing `LabSource` and `LabSourceGrant` files are current implementations and must be migrated deliberately rather than duplicated.
- Schemas/validation: safe relative paths, text-only language allowlist, file/byte bounds, deterministic hash, expected version pointers and exact email lookup.
- Editor dependency: lazy-load only within the owner workspace after server authorization. Editor package choice remains OPEN; Monaco is not installed in the inspected manifest.
- Live execution: not part of source management. Any future preview runtime is a separate isolated trust boundary and does not belong in the ordinary Labs React tree.

The specific route names and physical folders remain subject to a fresh repository-tree inspection when implementation is authorized. Do not create empty proposed folders merely to match this conceptual document.
