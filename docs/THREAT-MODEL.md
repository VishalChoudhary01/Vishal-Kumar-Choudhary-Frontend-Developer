# Portfolio Platform — Threat Model

**Status:** Phase 1 draft for review; not a security certification.  
**Scope:** Existing Next.js portfolio extended with admin CMS, Component Lab, authentication, user dashboard, media library, analytics and scheduled publishing.  
**Branch:** `feat/labs-public-page`  
**Related:** PRD.md, ARCHITECTURE.md, API-CONTRACTS.md, FOUNDATION-AUDIT.md, DECISIONS.md

## 1. Security objectives

1. Preserve public portfolio availability and prevent private content from entering public output.
2. Only a verified admin may create or modify privileged content and settings.
3. Registered users may access only their own private account/activity data. Any registered user with a verified email may automatically read published Labs source; guests and unverified accounts cannot.
4. Never execute untrusted Lab source with the main application's origin, secrets, cookies, server privileges or unrestricted network access.
5. Prevent media-upload abuse, cross-user cache leakage, unauthorized content changes and analytics manipulation.
6. Make publishing, scheduling, retries and recovery auditable and safe against duplicate execution.
7. Minimize personal data collection and prevent logs/analytics from exposing credentials or unnecessary personal data.

## 2. Assets and trust boundaries

### Assets to protect
- Admin sessions, role assignments and account recovery flows.
- MongoDB credentials, Cloudinary API secret, authentication secrets and scheduler credentials.
- Draft portfolio/Lab content, immutable versions and unpublished media references.
- Full Lab source and preview execution configuration.
- User profiles, likes and private activity.
- Analytics records and aggregate reports.
- Publication pointers, schedule records and content/media integrity.
- Public homepage/project pages' availability, performance, SEO and integrity.

### Trust boundaries
1. **Browser ↔ Next.js server:** all browser inputs are untrusted. UI visibility is not authorization.
2. **Guest ↔ registered user ↔ admin:** server-side role and resource policy must be checked on every protected operation.
3. **Public published content ↔ private draft/source/account data:** separate DTOs, cache policies and authorization.
4. **Next.js server ↔ MongoDB:** database credentials and repositories are server-only; never accept browser-provided query operators.
5. **Next.js server ↔ Cloudinary:** server issues narrowly constrained upload authorization; never expose the API secret.
6. **Application ↔ scheduler/worker:** authenticate calls, validate job state and make publication idempotent.
7. **Main app ↔ interactive preview runtime:** treat submitted source as hostile; use a separately reviewed execution boundary.
8. **Application ↔ external identity provider:** validate callbacks, state/nonce and return URLs according to the selected provider.
9. **Application ↔ analytics events:** client events are untrusted observations, not proof of human identity or verified use.

## 3. Threat register

Risk levels are initial qualitative assessments, not measured probabilities. They must be revised after implementation details and deployment configuration are selected.

| ID | Threat / abuse case | Initial risk | Required controls and verification |
|---|---|---:|---|
| T-01 | Guest requests draft content, full source, unpublished media or preview data directly | Critical | Published-only public queries; private DTOs; server-side authorization on every read; no-store/private caching; test HTML, RSC payloads, APIs, metadata and CDN responses as guest |
| T-02 | User modifies role/user/content IDs to access another account or admin resources (IDOR / privilege escalation) | Critical | Server-derived actor identity; deny-by-default policy; resource ownership/state checks in use cases; admin role provisioned only through trusted setup; direct-request role matrix tests |
| T-03 | Untrusted Lab source escapes preview sandbox or reads main-app context | Critical | Separate origin/runtime; no main-app credentials/cookies; strict CSP and dependency allowlist; network egress policy; CPU/memory/time limits; restrictive messaging; escape testing; no deployment before security review |
| T-04 | Draft/private response enters a shared Next.js/CDN/TanStack Query cache | Critical | Explicit cache ownership; private/no-store for actor-specific/draft/source data; cache key isolation; revalidate only after successful publication; cross-user cache tests |
| T-05 | Admin account compromised through weak session, reset or callback flow | Critical | Better Auth with MongoDB adapter is selected; approve final session lifetime/concurrency policy; secure cookie/session settings; email verification/reset protections; rate limiting; reauthentication for sensitive actions; revoke sessions where supported; recovery test plan |
| T-06 | Malicious/oversized media upload, signature reuse or unsafe media delivery | High | Admin authorization before signing; short-lived, scoped signed upload parameters; strict type/size limits; server confirmation; validate asset ownership and returned identifiers; secret isolation; abuse limits |
| T-07 | Malicious URL or open redirect during sign-in/return navigation | High | Allow only local relative return paths or exact approved origins; reject protocol-relative/backslash/control-character variants; validate provider callbacks; test encoded and double-encoded cases |
| T-08 | Forged analytics, repeated likes/copy events, bots or inflated views | High | Allowlisted event schema; bounded metadata; rate/abuse controls; idempotency/deduplication where feasible; separate guest/auth metrics; document that client events do not prove verified use |
| T-09 | Duplicate, replayed or stale scheduled-publish job publishes wrong version | High | Job targets immutable version ID; authenticated invocation; idempotency/lease; compare schedule state and due time; bounded automatic retry; explicit terminal status/manual recovery; failure/replay tests |
| T-10 | Concurrent admin edits silently overwrite newer content | High | Version/concurrency token; immutable snapshots; conflict response; restore creates a new version; tests for stale saves and simultaneous publish/edit |
| T-11 | Unsafe project links, slug collisions or malicious stored content affect visitors | High | Schema validation; slug uniqueness; URL protocol/host policy as appropriate; safe React rendering; no arbitrary HTML/script execution; safe metadata/JSON-LD generation; validation tests |
| T-12 | Contact API abuse sends spam or exhausts SMTP/provider resources | Medium–High | Request/body size limits; schema validation; rate limiting/abuse controls; safe error responses; secrets server-only; operational monitoring; preserve existing contact behavior |
| T-13 | Development source diagnostics endpoint accidentally exposes source in production | High | Preserve production 404 guard; path containment; least-privilege response; production build test verifies 404; avoid leaking file paths/contents in logs |
| T-14 | Account deletion leaves unintended personal data or breaks referenced content | High | Approve retention/deletion policy before implementation; reauthenticate/confirm; transaction or durable deletion workflow; define treatment of likes/activity; preserve unrelated public content; test retries and partial failures |
| T-15 | Logs/errors reveal tokens, passwords, source, signed upload credentials or private records | High | Redaction rules; safe domain/transport errors; no secret/source payload logging; correlation IDs; tests and log review |
| T-16 | New admin/editor/chart/sandbox code slows or destabilizes existing public portfolio | Medium–High | Lazy-load privileged/heavy modules; avoid global provider expansion; bundle analysis; same-device before/after performance; public route screenshots and regression tests |
| T-17 | Dependency, environment or database configuration drift breaks deploy or leaks secrets | High | Lockfile consistency; server-only environment validation; documented env names; deployment preview checks; secret scanning; no secret values in docs/commits |
| T-18 | Content restore/deletion removes media still referenced by live, draft or historical versions | High | Reference-aware lifecycle; no implicit asset deletion on gallery detach; block deletion while references exist or require approved archival policy; integrity tests |

## 4. Required authorization matrix

| Capability | Guest | Registered, email unverified | Registered, email verified | Owner/Admin |
|---|---|---|---|---|
| Read published portfolio/Lab metadata and public demos | Allow | Allow | Allow | Allow |
| Read full source of a published experiment | Deny | Deny | Allow automatically | Allow |
| Copy published source | Deny | Deny | Allow | Allow |
| Like/unlike public experiment | Best-effort anonymous/browser-scoped like where supported | Same best-effort public-like capability; no account linkage | Own account, one persistent active like per experiment | Own account under same invariant |
| Read own dashboard/activity | Deny | Deny | Own records only | Own records only |
| Read aggregate source-engagement analytics | Deny | Deny | Deny | Allow |
| Read/write source drafts, versions and publication | Deny | Deny | Deny | Allow after owner guard |
| Upload/manage media library | Deny | Deny | Deny | Allow after server-side checks |
| Assign Owner/Admin role | Deny | Deny | Deny | No self-service assignment; singleton owner comes only from trusted `LABS_OWNER_USER_ID` provisioning |

This matrix is the approved target source-access contract. The current implementation still has a legacy per-user grant lookup; remove it before claiming this policy is live. Interactive preview remains separately blocked pending the isolation gate.

## 5. Required defensive patterns

### Authorization
- Derive the actor from the verified server session; never accept a user ID or role as proof from the request body.
- Authorize both the action and the specific resource/version on every protected request.
- Deny by default; use safe responses that do not disclose sensitive record existence unnecessarily.
- Server Actions are endpoints from a security perspective: validate and authorize them independently.

### Data and caching
- Public DTOs contain only published, public fields.
- Draft, admin, source and account DTOs are separate from public DTOs.
- Do not serialize secrets, internal source, draft pointers or provider credentials into client components.
- Apply explicit private/no-store behavior where needed and test cross-user cache isolation.
- Validate pagination, filters, sort fields, event names, URL schemes and content schemas against allowlists.

### Preview execution
- No arbitrary submitted code in the main Next.js process or origin.
- Before selection, evaluate candidate runtime isolation, origin separation, cookies/storage, CSP, network egress, allowed packages, CPU/memory/time ceilings, inter-frame messaging, abuse monitoring and cost controls.
- Treat iframe sandbox attributes as one control, not the complete security design.
- Keep preview failures contained; timeout, malformed code and provider outage must not break public portfolio routes.

### Uploads
- Only an authorized server operation may issue constrained upload signatures.
- The browser must not receive Cloudinary API secrets.
- Validate file size, type/format, upload scope, asset ownership and confirmed metadata.
- Protect replacement and deletion through live/draft/historical usage checks.

### Scheduling
- Job payload includes an immutable version ID, not mutable “latest draft” intent.
- Authenticate internal invocations; reject stale/cancelled/early jobs.
- Use idempotency and bounded retries; preserve a safe terminal state and recovery path.
- Do not claim publication succeeded until the content state transition and cache-revalidation outcome are accounted for.

## 6. Privacy and analytics constraints

- Collect only the event fields needed for approved metrics.
- Do not put full source, credentials, message bodies or unnecessary personal data into analytics.
- Source-open and code-copy events are verified-account-only. Verified likes are persistent state transitions; public guest/unverified like actions may be counted separately where measurable as anonymous actions, not unique people.
- Aggregate source opens, unique verified accounts, copies, active likes and like/unlike transitions by experiment. Do not expose user-level source activity in the first admin dashboard.
- A copy event records a successful Clipboard API write acknowledgement accepted by the server; it does not prove the source was pasted, run or used.
- A source-open event represents a successful authorized source response, not a public experiment detail-page view.
- Verified like/unlike events are recorded only for server-confirmed changes to the unique user/experiment like state. Guest-like action events are separate best-effort counts and must not be represented as unique people.
- Event retention, event deduplication window, account-deletion treatment and Privacy Policy wording are release gates. Do not invent retention periods; disclose the selected policy before enabling production analytics.

## 7. Security verification gates

### Before authentication/account implementation
- Better Auth with the MongoDB adapter is selected. Document and test cookie, callback, verification/reset, sign-out, session invalidation and deletion behavior; approve the remaining session-lifetime/concurrency policy.
- Test user/admin role separation and safe return URL validation.

### Before CMS/media implementation
- Test draft isolation, stale-version conflicts, publish/unpublish cache invalidation, upload restrictions and reference integrity.
- Verify no draft content appears in public HTML, metadata, RSC payloads or shared caches.

### Before interactive preview implementation
- Obtain a dedicated sandbox threat-model review and document the chosen runtime's isolation guarantees and limitations.
- Test network attempts, storage/cookie access, top-navigation/popups, messaging spoofing, resource exhaustion and malformed source.
- Keep interactive execution disabled until the gate is passed.

### Before release
- Run direct-request authorization matrix and IDOR tests.
- Test production source-snapshot 404.
- Test analytics abuse, scheduler replay/retry, open redirects and secret/log redaction.
- Verify dependency lockfile, environment configuration, public route regression and rollback/recovery procedures.

## 8. Open security decisions

These are intentionally unresolved until evidence and explicit review:
1. Better Auth is now selected for the Labs authentication provider with the MongoDB adapter; session lifetime/concurrency policy and production configuration validation remain open.
2. MongoDB hosting/network access/backup/restore controls.
3. Cloudinary upload constraints and asset deletion/retention rules.
4. Interactive preview provider and sandbox architecture.
5. Durable scheduler/worker and internal invocation authentication.
6. Analytics and user activity retention/deletion policy.
7. Rate-limiting and abuse-control infrastructure.
8. Detailed cache/revalidation and incident-recovery mechanisms.

## 9. Current conclusion

The highest-risk feature is untrusted interactive source execution, followed by private-content authorization/cache isolation and admin authentication. These features require explicit security gates. The current document is a threat-model draft, not evidence that the application has implemented or passed these controls. Do not start production implementation of the sandbox, auth, or private CMS until the relevant decisions and tests are approved.


## 10. Labs authentication and protected-source implementation status — 2026-11-03

The Labs foundation uses Better Auth with the MongoDB adapter. Email/password, email verification, password reset, optional Google sign-in, server-side sessions, privacy-safe registration handling, trusted-origin validation and rate limiting are implemented. The current source endpoint still uses a legacy per-experiment grant lookup; the approved migration removes that lookup and grants published-source reads to every verified account automatically.

Remaining release/security gates:
- Configure production secrets, the trusted proxy IP header, SMTP sender, actual HTTPS Terms/Privacy URLs and version identifiers. Registration remains disabled if required delivery/legal configuration is absent.
- Configure Google OAuth and verify callback, trusted origin and verified-account linking behavior.
- Verify session cookies, origin checks, session expiration, tab synchronization and password-reset revocation in the deployed environment.
- Provision and publish an Atlas source snapshot; test Guest / signed-in-unverified denial and automatic Verified Registered User access without a grant. Confirm Owner can access drafts through a separate owner guard.
- Test direct requests, IDOR attempts, malformed source paths, oversized snapshots, no-store headers, and absence of source in anonymous HTML/RSC/public caches.
- The current repository is public and existing demo runtimes ship client-side code. Protected source snapshots must be kept separate from public runtime code; a protected viewer does not make source code in a public repository or a browser bundle confidential.
- No build/browser/security test evidence has been produced from this connected GitHub-only editing session. Do not describe the feature as production-certified or mark the security verification gate as passed.


## 11. Consent and verification data boundary

- The browser cannot submit legal-version identifiers, acceptance timestamps, user IDs or verification-state flags as authoritative data.
- Legal consent is persisted in a private receipt collection with a keyed email digest and server timestamp; the Better Auth user-create hook links the actual user ID.
- Verification-flow IDs are random, short-lived references. The success screen checks server-side state written by Better Auth's post-verification hook. Query parameters alone never prove email ownership.
- Verification-flow rows have a seven-day TTL. Legal consent receipts are not automatically expired by that transient-flow TTL.
- Resend requests return generic results to avoid revealing whether an email maps to an account.

## 8. Owner-managed Labs source threats and controls

The owner source-management workflow adds privileged code-writing and source-publication surfaces. Every verified registered account automatically receives published-source access; there is no per-user grant-management system in the target policy.

| Threat | Risk | Required controls |
|---|---:|---|
| T-OWNER-01: attacker reaches owner page/API or forges owner identity | Critical | Server-only singleton owner identity; server-derived Better Auth actor; deny if owner config is absent; recheck owner permission at transport, use-case and repository boundaries; no first-user/email/client-role fallback; negative IDOR tests |
| T-OWNER-02: source endpoint accidentally allows a guest/unverified account or an unpublished snapshot | Critical | Require server-derived Better Auth session with `emailVerified === true` on every read; require a published pointer; reject client-supplied identity/publication state; test guest, unverified, verified, owner and unpublished matrices |
| T-OWNER-03: malicious source path, oversized/binary file or crafted editor payload | High | Text-only format, strict relative-path and language allowlists, duplicate-path rejection, UTF-8 byte/file-count limits, server-computed hashes, safe error messages and mutation rate limits |
| T-OWNER-04: credentials/secrets accidentally stored in source snapshots | High | Reject/flag secret files and suspicious secret patterns before persistence; never log matched values or file contents; provide owner correction workflow; document that scanning is defense-in-depth, not proof of no secrets |
| T-OWNER-05: source draft or version leaks through guest HTML/RSC/API/cache/logging | Critical | Separate owner DTOs and source API; private/no-store headers; do not preload source; no public static assets/source maps; response/cache tests across guest, user and owner identities; redact logs and analytics |
| T-OWNER-06: editor save overwrites a newer draft or publishes unintended content | High | Immutable snapshots, expected-version/draft-pointer precondition, 409 conflicts, explicit save/publish separation, exact version ID on publish, idempotency and failure-safe pointer updates |
| T-OWNER-07: restore mutates historical source or deletes audit evidence | High | Restore creates a new immutable version; version and audit repositories are append-only to the application; no historical edit/delete UI/API; backup and migration reconciliation |
| T-OWNER-08: owner-authored code executes with main-app cookies, credentials or server privileges | Critical | Source management is text-only; do not evaluate source. Any later live preview requires a separately approved isolated runtime and its own threat-model gate. |
| T-OWNER-09: owner mutation CSRF or replay | High | Same-origin/CSRF protections compatible with Better Auth cookies, origin checks, POST/DELETE semantics, rate limiting, idempotency and audit correlation IDs |
| T-OWNER-10: source-open/copy/like analytics are forged, replayed or inflated | High | Only verified sessions may submit source-open/copy events; server derives actor and published source version; unique idempotency/event IDs; source-open recorded after successful response; copy requires client Clipboard API success acknowledgement; verified likes count only server state transitions; guest-like actions are separately categorized, rate-limited and never counted as unique people; aggregate-only admin DTOs |

### 8.1 Required verification before source-management release

- Guest and signed-in-unverified source requests return 401/403 and never include source. Verified registered accounts can read any published source without a grant. Non-owners receive 401/403 for owner endpoints and never receive drafts/version details/audit data.
- Owner identity missing, malformed, wrong, deleted or unverified denies owner operations.
- Client attempts to forge actor ID, owner role, published pointer, version number, content hash, event actor or aggregate metric values are ignored/rejected.
- Source path traversal, absolute paths, duplicate names, unsupported encodings, binary data, excessive file count/bytes and secret-like content are rejected without logging sensitive values.
- Concurrent draft saves return a conflict rather than overwriting newer content.
- Publish/unpublish/restore failures leave the previous published pointer intact; restore creates a new snapshot.
- Unpublishing denies subsequent source requests for all users. Verified-user source opens/copies/likes are idempotently counted, duplicate likes do not inflate active-like totals, and anonymous guest-like actions (if measurable) remain separately labelled.
- Test cache isolation between two verified users, a guest, an unverified account and the owner; verify every source response is private/no-store.
- Verify audit and analytics records contain no source content, clipboard text, emails, passwords, tokens, SMTP/API keys or raw secret values.
- Confirm database bootstrap/migration can be replayed and reconciled without dropping legacy data.
- Existing public Labs demos remain code-owned; no text stored in Atlas is executed by this feature.

### 8.2 Scope boundary

Owner-only source editing, snapshot storage and authorized source viewing do not approve arbitrary live execution. A later preview runtime must separately address cross-origin isolation, cookie/storage separation, strict CSP, network egress, dependency policy, resource/time limits, messaging and abuse monitoring before implementation.
