# Architecture Decision Records

**Status:** Decision register; choices marked OPEN are not approved.  
**Branch:** `feat/labs-platform-integration`  
**Related:** PRD.md, architecture/SYSTEM-ARCHITECTURE.md, api/ENDPOINT-INVENTORY.md, THREAT-MODEL.md

This document records current decisions, known repository facts and unresolved choices separately. A proposed design is not an implemented capability. Update this register when a decision is approved; record its rationale, consequences and any required migration.

## ADR-001 — Preserve the existing application architecture

- **Status:** Accepted
- **Decision:** Extend the existing Next.js App Router application in its current `src/app` organization. Do not replace or broadly restructure unrelated folders.
- **Context:** Existing homepage/project routes rely on canonical JS data, SEO utilities, static project parameters, shared presentation components, lazy-loaded sections and loader/provider behavior.
- **Consequences:** Introduce new platform boundaries incrementally. Keep public route/component contracts stable and test them before and after relevant changes.
- **Evidence:** `docs/FOUNDATION-AUDIT.md`.

## ADR-002 — Next.js-native backend by default

- **Status:** Accepted
- **Decision:** Use server-only modules, Route Handlers and Server Actions as appropriate. Do not add a separate Express server by default.
- **Context:** Existing deployment is a Next.js application on Vercel; no separate API service is evidenced in the inspected manifest.
- **Consequences:** Evaluate background scheduling and isolated preview execution independently; their runtime constraints do not automatically justify moving the entire API to Express.
- **Express:** OPEN/conditional. Requires a concrete documented requirement and explicit approval.

## ADR-003 — JavaScript remains the implementation language

- **Status:** Accepted
- **Decision:** Keep JavaScript/JSX. No TypeScript migration is authorized by the platform expansion.
- **Consequences:** Adopt consistent validation schemas, runtime validation and documented object contracts without changing the language stack.

## ADR-004 — Application persistence and media provider

- **Status:** Approved direction; deployment details OPEN
- **Decision:** MongoDB for application persistence and Cloudinary for media assets.
- **Still OPEN:** MongoDB host, connection lifecycle, backups, network restrictions, indexes/transactions; Cloudinary account/environment setup, signed-upload constraints and asset lifecycle.
- **Consequence:** No client-side database access and no Cloudinary Admin secret in browser code.

## ADR-005 — Authentication and sessions

- **Status:** Provider selected and foundation implemented; final session policy OPEN
- **Decision:** Better Auth with `@better-auth/mongo-adapter` is the Labs authentication foundation. Better Auth uses the native MongoDB driver against the configured application database; Mongoose remains the application repository/model layer.
- **Required lifecycle:** Email/password, verification, password reset, secure logout/session handling, Google sign-in when configured, profile management and account deletion.
- **Not decided:** Final session lifetime/concurrency policy, recovery operations, account deletion cascade/retention workflow and final production verification.
- **Rule:** Do not implement a custom password/session protocol or enable another provider without an approved decision. GitHub sign-in is not selected.

## ADR-006 — Client-side server-state management

- **Status:** Approved selectively
- **Decision:** TanStack Query may be used where client-side server-state benefits from cache, mutation lifecycle, invalidation, polling or client-driven refetch.
- **Constraints:** It is not mandatory for every route. Prefer server-side data loading for server-rendered public content. It does not replace server authorization or Next.js/CDN cache revalidation.
- **Dependency change:** Confirm concrete use cases and public bundle impact before adding it.

## ADR-007 — Admin role provisioning

- **Status:** Accepted
- **Decision:** Public registration never grants Admin. Admin access is assigned only through a trusted provisioning process and enforced server-side.
- **Consequence:** No user-editable role field or client-side admin flag is authoritative.

## ADR-008 — Content versioning and publishing

- **Status:** Accepted product requirement; schema details OPEN
- **Decision:** Keep immutable content snapshots; distinguish draft and published version pointers. Saving a draft does not publish. Restore creates a new version. Scheduled publication targets an exact immutable version.
- **Still OPEN:** Concrete document schema, concurrency token, transaction boundaries, version indexing and retention/storage policy.

## ADR-009 — Interactive Lab execution

- **Status:** Isolated compiler/runtime prototype implemented in `feat/labs-platform-integration`; Production release remains gated by deployed browser QA and security review.
- **Decision:** Never execute arbitrary user/admin-supplied JavaScript in the main application process/origin with privileged app context. Owner Studio Run executes the current unsaved working copy only through the isolated preview boundary. Public experiment detail runs only an exact successfully published artifact through the separate runtime boundary.
- **Implemented foundation:** Static HTML/CSS/JavaScript and React JS/JSX/TSX compiler modes, Vercel Sandbox build execution, artifact publishing path, isolated iframe server/bridge and compiler smoke tests exist in the integration branch. This does not prove deployed browser readiness; the 5 November 2026 screenshot shows a blank public Spotlight Dock runtime and owner Run must be re-verified.
- **Still OPEN:** Final runtime origin/CSP/network model, artifact storage provider, resource/cost limits, snapshot refresh operations, complete escape tests and full deployed browser QA.
- **Gate:** Do not enable Production publishing until owner Run, the published artifact detail runtime, source-access behavior and sandbox escape/security tests pass on a deployed Preview.

## ADR-010 — Scheduled publishing

- **Status:** OPEN
- **Requirement:** Independent execution, immutable-version targeting, idempotency, bounded automatic retries, cancellation/status and manual recovery.
- **Not decided:** Durable scheduler/worker/provider, invocation authentication, lease mechanism, retry schedule and operational monitoring.
- **Rule:** Do not use an admin browser timer or assume a Vercel request can remain alive until a future publication time.

## ADR-011 — Cache and revalidation

- **Status:** Policy accepted; exact implementation OPEN
- **Decision:** Published public content may be cached and revalidated after successful publish/unpublish. Drafts, source, admin and user-specific data must not leak through shared caches.
- **Still OPEN:** Exact tags/paths, HTTP/CDN cache headers, cache ownership, failure recovery and deployment-specific behavior.
- **Gate:** Test published transitions, stale responses and cross-user isolation before CMS release.

## ADR-012 — Analytics and privacy

- **Status:** Requirements accepted; retention policy OPEN
- **Decision:** Validate allowlisted events, minimize personal data, separate guest/authenticated attribution where meaningful, and label observed actions honestly. Copy events are not proof of use; guest likes do not prove unique people.
- **Still OPEN:** Retention periods, guest identifier strategy, deduplication window, rate-limit infrastructure, deletion/export behavior and final metric formulas.

## ADR-013 — Public portfolio performance protection

- **Status:** Accepted
- **Decision:** Admin/editor/chart/preview code must not be added to the public critical bundle without measured justification.
- **Controls:** Lazy-load heavy modules; avoid unnecessary global providers; measure bundle/build/browser performance and compare screenshots/behavior on existing public routes.
- **Gate:** Existing homepage and project detail UI, motion, SEO, responsiveness and functionality must pass regression checks.

## ADR-014 — API contract shape

- **Status:** OPEN
- **Candidate:** Stable JSON success/error envelopes and proposed endpoint inventory in `API-CONTRACTS.md`.
- **Not decided:** Final endpoint paths, Server Action versus Route Handler per operation, validation library and exact DTO/schema field names.
- **Rule:** Proposed API paths in planning docs are not implemented endpoints.

## ADR-015 — Foundation baseline evidence

- **Status:** INCOMPLETE
- **Known:** Repository source inspected and findings recorded in `FOUNDATION-AUDIT.md`.
- **Missing:** Local dependency install, lint, SEO validation, production build, browser screenshots, performance/accessibility measurements and production source-snapshot check.
- **Gate:** Do not claim baseline passed and do not establish numeric performance improvement claims until evidence is recorded.

## Decision approval log

No new infrastructure provider or runtime has been selected by this register. The accepted items above capture directions already present in the platform plan and repository evidence; all OPEN/BLOCKED items remain unresolved.


## ADR-016 — Owner-managed Labs source lifecycle

- **Status:** Owner identity/source-management authority accepted (2026-11-04); source workspace and lifecycle are implemented in code, with external/browser verification pending
- **Accepted decision:** Add a narrow owner-only source-management capability before general CMS/Admin. The first release is a singleton trusted portfolio owner, not a multi-admin role system. This owner manages source records/files/drafts/versions/publishing/restoration and source audit history, and can inspect source-engagement aggregates.
- **Accepted owner identity:** Server-only `LABS_OWNER_USER_ID` containing the existing verified Better Auth user ID. Missing/mismatched configuration denies owner actions. First-user-wins, email matching supplied by the browser and client role flags are prohibited. The owner is the sole privileged administrator in the first release.
- **Source-access policy — ACCEPTED (2026-11-04):** every registered user with a valid Better Auth session and `emailVerified === true` automatically receives read access to every published experiment source. Guests and signed-in unverified accounts cannot view or copy source. No per-user grant/expiry/revocation workflow exists in the target design; the owner controls availability by publishing/unpublishing each source.
- **Data direction:** Source aggregate with draft/published pointers; immutable `lab_source_versions`; verified-user like state in `lab_likes`; `lab_analytics_events` for source opens/copies/like-unlike transitions; append-only `lab_source_audit_events`. Retire legacy `lab_source_grants` after safe migration/reference cleanup. Bootstrap must be idempotent and preserve source/version records.
- **Lifecycle:** Save draft, publish exact version, unpublish and restore are separate operations. Restore creates a new immutable version. Source editing is text-only and does not execute code. Only verified accounts can open/copy source; verified accounts receive persistent likes while best-effort public guest likes remain where supported. The owner dashboard shows per-experiment source opens, unique verified accounts, copies, active verified likes, verified like/unlike trends and separate guest-like action counts where measurable.
- **Owner identity and source-access rules:** RESOLVED / LOCKED. **Implemented code:** owner source workspace, immutable versions, source access and editor. **Still OPEN:** analytics retention/deduplication, account-deletion handling, version retention/storage implications and any required legacy-data migration.
- **Security gate:** Live execution of owner-authored source remains blocked until a separate isolated-preview architecture and threat-model review are approved.
- **Current implementation detail:** `docs/pages/LABS-AND-OWNER-WORKSPACE.md` and `docs/architecture/LABS-RUNTIME-AND-CODE-EXECUTION.md`.

## ADR-017 — Separate gallery posters from executable experiment previews

- **Status:** Gallery cards remain static-only. The older interactive detail-runtime portion was superseded by ADR-018 on 2026-11-07.
- **Context:** Running every experiment inside gallery cards would create multiple React roots/iframes, compiler/runtime work, animation loops and media requests. The gallery must remain lightweight while still showing each experiment's actual visual output.
- **Decision:** Gallery cards never execute experiment code. Preview selection uses (1) owner-promoted public `galleryPreview` media bound to the exact published artifact/source version; (2) an automatic PNG screenshot captured from the exact compiled immutable artifact during the release build; and (3) generic Labs artwork/neutral fallback. Owner media is verified in Cloudinary and copied to public Vercel Blob. Generated screenshots are stored separately on the immutable artifact and are not part of the runtime output manifest.
- **Detail runtime:** This older interactive detail requirement is superseded by ADR-018. The current public detail route is static/non-executable and does not embed the artifact iframe. The artifact delivery endpoint remains separate infrastructure.
- **Owner Run:** The owner Studio Run action remains a core capability that compiles/executes the current unsaved working copy in isolation. Poster capture must never replace Run, alter the working copy or be required to inspect an unsaved change.
- **Gallery preview lifecycle:** An owner can explicitly promote an owned ready image/GIF/video; the server validates ownership, provider metadata, format, size and signature, then stores it in public Vercel Blob bound to the current `sourceVersionId` and `artifactId`. During Build & Publish, the isolated release Sandbox also attempts one deterministic 1200×900 Playwright/Chromium screenshot of the exact artifact. This is non-blocking: failure records an unavailable poster and leaves the valid artifact publishable. Neither path runs on every keystroke, owner Run or a public page request.
- **Media migration:** Current implementation supports only one `fallback-preview` attachment. Target `gallery-preview`, `detail-gallery` and `runtime-fallback` roles require an explicit schema/API/data migration. Preserve private draft and historical release references; do not expose unattached Cloudinary assets.
- **Performance:** No experiment React root, iframe or compiler job in gallery cards. Images/posters are responsive and lazy-loaded. GIF/video animation is visibility/engagement-gated, reduced-motion-aware and capped; video is muted, inline and `preload="none"`.
- **Loading and interactions:** Add route-level skeletons for Labs listing/detail and owner inventory/editor without stacking duplicate global loaders. Use React 19 `useOptimistic` only for reversible server-backed actions with rollback; destructive/publish actions await server confirmation, and copy success/analytics follow successful Clipboard API acknowledgement.
- **Consequences:** Static public previews remain independent from owner Run and artifact execution. The public detail page stays static under ADR-018. Owner-promoted media and automatic release poster capture are both implemented in code; exact external provider configuration and browser/Preview acceptance remain release gates. The complete media-role migration remains future engineering work.
- **Current implementation detail:** `docs/pages/LABS-AND-OWNER-WORKSPACE.md` and `docs/architecture/LABS-RUNTIME-AND-CODE-EXECUTION.md`.

## ADR-018 — 7 November Labs catalogue, detail, owner and Analytics supersession

- **Status:** Accepted product decisions — 2026-11-07; current-code alignment incomplete.
- **Context:** A source/docs audit found contradictions between the actual public route, the runtime/media plan, the older interactive-detail requirement, owner authorization implementation and Analytics privacy documentation.
- **Public catalogue:** Only published custom experiments backed by a published source pointer and an exact matching ready artifact appear in the public /labs catalogue. Code-owned runtime registry entries are not merged into that catalogue.
- **Public detail:** /labs/[slug] remains a static, non-executable presentation containing metadata, static media, explanation, engagement and protected source access. It does not mount LabWorkspace, LabRuntimeBoundary or a published artifact iframe. Owner Run, compiler, immutable build/publish and the artifact Route Handler remain distinct infrastructure. This supersedes the public interactive-detail statement in ADR-017 and older Labs UX/PRD sections.
- **Owner identity:** The owner allowlist is LABS_OWNER_USER_ID only, matching the stable Better Auth user ID on a verified server-derived session. No LABS_OWNER_EMAIL, first-user or client-role fallback is approved. The current code still permits the email fallback; code alignment is pending and deployment owner configuration must be checked before removing it.
- **Analytics privacy:** Owner Labs Analytics is aggregate-only. Individual names, masked emails, per-user like timestamps, searchable active-liker directories and user-level source/copy/like histories are not allowed. The current experiment Analytics page still exposes an active verified-liker panel; removal/redesign is pending. Anonymous identities are never enumerated.
- **Editor:** Monaco is integrated for protected source and history (read-only) and owner editing (editable), with plain-text fallback. Old textarea-only/editor-not-installed plans are superseded.
- **Media:** Current schema is galleryPreview plus at most one fallback-preview attachment. Ordered detail-gallery and the full target roles gallery-preview/detail-gallery/runtime-fallback remain a migration task.
- **Consequences:** Documentation and target decisions are now aligned, but the owner email fallback and active-liker identity panel remain implementation gaps. Missing detail-view/preview event types, full media-role migration, personal account dashboard/deletion and extended discovery remain open PRD gaps. See [PROJECT-STATUS.md](./PROJECT-STATUS.md), [Labs and Owner Workspace](./pages/LABS-AND-OWNER-WORKSPACE.md) and [Labs Runtime and Code Execution](./architecture/LABS-RUNTIME-AND-CODE-EXECUTION.md) for current status.
- **Source of detail:** pages/LABS-AND-OWNER-WORKSPACE.md, architecture/LABS-RUNTIME-AND-CODE-EXECUTION.md, pages/AUTHENTICATION-AND-ACCOUNT-ENGINEERING.md and architecture/PRIVACY-AND-DATA-LIFECYCLE.md.
