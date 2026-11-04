# Portfolio Platform — Threat Model

**Status:** Phase 1 draft for review; not a security certification.  
**Scope:** Existing Next.js portfolio extended with admin CMS, Component Lab, authentication, user dashboard, media library, analytics and scheduled publishing.  
**Branch:** `docs/portfolio-platform-spec`  
**Related:** PRD.md, ARCHITECTURE.md, API-CONTRACTS.md, FOUNDATION-AUDIT.md, DECISIONS.md

## 1. Security objectives

1. Preserve public portfolio availability and prevent private content from entering public output.
2. Only a verified admin may create or modify privileged content and settings.
3. Registered users may access only their own private account/activity data and the Lab capabilities explicitly granted to them.
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
| T-05 | Admin account compromised through weak session, reset or callback flow | Critical | Choose and configure established auth provider; secure cookie/session settings; email verification/reset protections; rate limiting; reauthentication for sensitive actions; revoke sessions where supported; recovery test plan |
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

| Capability | Guest | Registered user | Admin |
|---|---|---|---|
| Read published portfolio/project/Lab metadata | Allow | Allow | Allow |
| Read permitted partial Lab source | Allow | Allow | Allow |
| Read full Lab source | Deny | Allow only when policy permits | Allow |
| Start approved interactive preview | Deny unless later explicitly approved | Allow under preview policy | Allow under preview policy |
| Like experiment | Guest policy only, privacy/abuse limited | Own account, one active like per experiment | Own account under same rule; admin status does not bypass invariant |
| Read own dashboard/activity | Deny | Own records only | Own records only unless a separate, approved admin analytics capability applies |
| Read admin analytics | Deny | Deny | Allow |
| Read/write drafts, versions, publication and schedules | Deny | Deny | Allow after server-side checks |
| Upload/manage media library | Deny | Deny | Allow after server-side checks |
| Assign Admin role | Deny | Deny | No self-service assignment; trusted provisioning procedure only |

This matrix is a planning contract. Exact distinctions for source/preview access and account deletion must be finalized before endpoints are implemented.

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
- Guest identifiers, if used, require an explicit privacy review and must not be described as verified unique people.
- Separate guest and authenticated engagement metrics where attribution differs.
- A copy event records an observed copy action; it does not prove the source was pasted, run or used.
- Activity retention, deletion, export and analytics retention are unresolved policy decisions. Do not invent a retention period.

## 7. Security verification gates

### Before authentication/account implementation
- Select provider/session approach and document cookie, callback, verification/reset, sign-out, session invalidation and deletion behavior.
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

The Labs foundation now uses Better Auth with the MongoDB adapter. Email/password, email verification, password reset, optional Google sign-in, server-side sessions, privacy-safe registration handling, trusted-origin validation, rate limiting and explicit per-experiment source grants are implemented in the application branch.

Remaining release/security gates:
- Configure production secrets, the trusted proxy IP header, SMTP sender, actual HTTPS Terms/Privacy URLs and version identifiers. Registration remains disabled if required delivery/legal configuration is absent.
- Configure Google OAuth and verify callback, trusted origin and verified-account linking behavior.
- Verify session cookies, origin checks, session expiration, tab synchronization and password-reset revocation in the deployed environment.
- Provision an Atlas source snapshot and a grant, then test the Guest / authenticated-ungranted / authenticated-granted / expired-grant / revoked-grant matrix.
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

The owner source-management workflow adds privileged code-writing and access-grant surfaces. It does not relax the existing public/private source boundary.

| Threat | Risk | Required controls |
|---|---:|---|
| T-OWNER-01: attacker reaches owner page/API or forges owner identity | Critical | Server-only singleton owner identity; server-derived Better Auth actor; deny if owner config is absent; recheck owner permission at transport, use-case and repository boundaries; no first-user/email/client-role fallback; negative IDOR tests |
| T-OWNER-02: regular user grants themselves or another user source access | Critical | Owner-only grant mutations; accept normalized email, resolve user server-side; require verified target; never accept user ID, grantor, active state or role from the browser; unique user/experiment index; audit grant/revoke |
| T-OWNER-03: malicious source path, oversized/binary file or crafted editor payload | High | Text-only format, strict relative-path and language allowlists, duplicate-path rejection, UTF-8 byte/file-count limits, server-computed hashes, safe error messages and mutation rate limits |
| T-OWNER-04: credentials/secrets accidentally stored in source snapshots | High | Reject/flag secret files and suspicious secret patterns before persistence; never log matched values or file contents; provide owner correction workflow; document that scanning is defense-in-depth, not proof of no secrets |
| T-OWNER-05: source draft or version leaks through guest HTML/RSC/API/cache/logging | Critical | Separate owner DTOs and source API; private/no-store headers; do not preload source; no public static assets/source maps; response/cache tests across guest, user and owner identities; redact logs and analytics |
| T-OWNER-06: editor save overwrites a newer draft or publishes unintended content | High | Immutable snapshots, expected-version/draft-pointer precondition, 409 conflicts, explicit save/publish separation, exact version ID on publish, idempotency and failure-safe pointer updates |
| T-OWNER-07: restore mutates historical source or deletes audit evidence | High | Restore creates a new immutable version; version and audit repositories are append-only to the application; no historical edit/delete UI/API; backup and migration reconciliation |
| T-OWNER-08: owner-authored code executes with main-app cookies, credentials or server privileges | Critical | Source management is text-only; do not evaluate source. Any later live preview requires a separately approved isolated runtime and its own threat-model gate. |
| T-OWNER-09: owner mutation CSRF or replay | High | Same-origin/CSRF protections compatible with Better Auth cookies, origin checks, POST/DELETE semantics, rate limiting, idempotency and audit correlation IDs |

### 8.1 Required verification before source-management release

- Guest and regular verified-user direct requests to every owner endpoint return 401/403 and never include source, version drafts, target-user information or audit details.
- Owner identity missing, malformed, wrong, deleted or unverified denies owner operations.
- Client attempts to forge actor ID, owner role, target user ID, grantor, published pointer, version number, content hash or audit actor are ignored/rejected.
- Source path traversal, absolute paths, duplicate names, unsupported encodings, binary data, excessive file count/bytes and secret-like content are rejected without logging sensitive values.
- Concurrent draft saves return a conflict rather than overwriting newer content.
- Publish/unpublish/restore failures leave the previous published pointer intact; restore creates a new snapshot.
- Grant/revoke/expiry take effect on the next protected source request and do not reveal account existence through public endpoints.
- Test cache isolation between two registered users, an owner, a guest and an ungranted account.
- Verify audit entries contain no source content, passwords, tokens, SMTP/API keys or raw secret values.
- Confirm database bootstrap/migration can be replayed and reconciled without dropping legacy data.
- Existing public Labs demos remain code-owned; no text stored in Atlas is executed by this feature.

### 8.2 Scope boundary

Owner-only source editing, snapshot storage and authorized source viewing do not approve arbitrary live execution. A later preview runtime must separately address cross-origin isolation, cookie/storage separation, strict CSP, network egress, dependency policy, resource/time limits, messaging and abuse monitoring before implementation.
