# Documentation vs Implementation — Gap Audit

**Audit date:** 2026-11-07  
**Repository:** `VishalChoudhary01/Vishal-Kumar-Choudhary-Frontend-Developer`  
**Branch audited:** `feat/labs-platform-integration`  
**Source snapshot at audit start:** `fb6f85917d4bdc477e01a200889cf370bd2fe59a`  
**Scope:** Initial read-only comparison of documentation and current repository implementation. No application behavior or source code was changed. A corrective documentation pass followed on 2026-11-07; see Section 11 for accepted decisions and updated status.

> This report is a findings register, not a declaration that all features are release-ready. It separates implementation gaps, documentation mismatches, product decisions and external verification still required.

---

## 1. Executive result

> **Point-in-time note:** Sections 1–10 preserve the original audit findings as observed before follow-up decision and documentation commits. They are historical findings, not all outstanding today. The 7 November follow-up in Section 11 records what is now decided, what documentation has been reconciled, and what still requires application-code or deployment work.

The repository has substantial engineering documentation, but it is **not yet a fully consistent reverse-engineering handover**. A developer or AI agent can understand most major systems, but several important docs currently describe different behaviors for the same feature. There are also approved PRD requirements that are not implemented, and a number of current-state guides need to be corrected before they can safely be used as the sole implementation authority.

The most important issue is the public Labs detail runtime:

- The current public Labs listing is source-backed custom experiments only.
- The current public detail page is a **static presentation page**; it does not mount the published artifact iframe or execute the experiment runtime.
- The runtime compiler, immutable artifact storage and public artifact Route Handler exist, but the page does not wire that runtime into the visitor-facing detail route.
- The earlier PRD and UX specification versions said the detail page must run the exact published artifact; that requirement is now superseded by the accepted 7 November static-detail decision in Section 39 of the Labs UX specification and ADR-018.
- The newer Runtime and Media Plan explicitly says the public detail page must remain static and must not mount an executable runtime.

The product decision is now resolved in favor of static/non-executable public detail. The remaining task is to keep older phase notes clearly superseded and preserve owner Run/build/artifact infrastructure separately.

There are also security-policy conflicts (owner identity), media-role migration gaps, analytics instrumentation gaps, missing PRD account/discovery features, stale implementation-plan statements and unverified deployment behavior.

## 2. Audit coverage and limitations

Repository inventory observed at the start of the audit:

| Area | Observed |
|---|---:|
| Markdown files under `docs/` | 172 |
| Files under `src/app/` | 389 |
| App page files | 18 |
| API Route Handler files | 36 |
| Labs/Portfolio Mongoose model files | 12 |
| Test files under `tests/` | 24 |
| Individual Motion Lab component specification files | 120 |

The audit reviewed the current engineering guides and their implementation entry points, the PRD, Decisions, Threat Model, Foundation Audit, API contracts, project structure, core Labs/auth/source/runtime/media/analytics plans, Motion Lab's governing standards and inventory, the current route tree, the data model catalogue and the build/test script.

**Scope limitation:** the 120 individual Motion Lab component specifications were inventoried as a library and their governing documents were read; every one of those 120 individual component files was not reviewed line-by-line against a corresponding implementation. The Motion Lab README itself clearly says the specifications describe intended future components and do not claim implementation. The individual spec library should not be interpreted as 120 production components.

This was a repository-source/document audit. It did not run npm install, the test suite, lint, production build, Playwright/browser QA, Atlas migrations/index inspection, SMTP delivery, OAuth, Cloudinary, Vercel Blob or Sandbox calls. Build history documented in older records is not evidence that the exact current branch head has passed those checks.

---

## 3. Critical findings — resolve before further implementation

### GAP-01 — Public Labs detail runtime has contradictory product contracts

**Priority:** P0 — product decision required  
**Actual implementation observed:**
- `src/app/labs/page.js` reads the published custom experiment page from `getPublishedCustomLabExperimentPage`.
- `src/app/api/v1/labs/route.js` exposes only the custom source-backed collection with a fixed page size of 18.
- `src/app/labs/[slug]/page.js` renders `LabDetailHeader`, `LabExperimentPreview`, `LabExplanation` and `LabSourceAccess`.
- The detail page does not import/mount `LabWorkspace`, `LabRuntimeBoundary` or an artifact iframe.
- `src/app/components/labs/LabExperimentPreview.js` explicitly describes itself as a non-executable renderer.
- Runtime compiler, artifact storage and `GET /api/v1/labs/[slug]/runtime/[artifactId]/[[...path]]` exist separately.

**Conflicting documents:**
- `PRD.md`, FR-02, says a published experiment detail page runs the exact immutable published artifact.
- `LABS-AND-AUTHENTICATION-DESIGN-SPEC.md`, Section 38.1 and 38.3, says the detail page runs/attempts the actual published artifact.
- `LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md`, Section 6, says the public detail page is static and must not mount `LabWorkspace`, `LabRuntimeBoundary`, an artifact iframe or executable runtime.
- `pages/LABS-AND-OWNER-WORKSPACE.md` and `architecture/LABS-RUNTIME-AND-CODE-EXECUTION.md` currently describe a runtime iframe on public detail, which does not match the current page source.

**Accepted decision (2026-11-07):** keep static public detail. PRD FR-02, Labs UX Section 39, current Labs guide and runtime guide now record the accepted contract. Do not mount the artifact iframe unless the decision is explicitly reopened. Gallery cards remain static.

### GAP-02 — Public Labs catalogue eligibility is incorrectly described in current docs

**Priority:** P0 — correct current-state documentation  
**Actual implementation:** `/labs` lists only MongoDB custom experiments with `kind === "custom"`, `status === "published"`, a published source pointer and a ready artifact matching the exact source version. The public detail lookup uses the same source/artifact eligibility. The 7 November source-only decision is explicit in `LABS-PUBLIC-PAGE-REDESIGN-PLAN.md`, Section 15.

**Stale guidance:**
- `pages/LABS-AND-OWNER-WORKSPACE.md` says the public collection combines code-owned built-in experiments and published custom experiments.
- Its detail-page section says `LabWorkspace` chooses a built-in runtime or published custom iframe.
- `PROJECT-STATUS.md` says the public Labs collection/detail should validate built-in demos and custom runtime.
- Older sections in the Labs UX spec and other plans still describe public code-owned demos.

**Accepted decision and docs corrected (2026-11-07):** public discovery is source-backed custom-only. Code-owned runtime registry entries remain code-owned material and are not public catalogue entries. The Labs UX Section 39, Labs public page redesign Section 15, current Labs guide and Project Status now identify this rule as authoritative.

### GAP-03 — Owner identity code does not match the locked owner decision

**Priority:** P0 — security decision required  
**Locked product decision:** `LABS-AND-AUTHENTICATION-DESIGN-SPEC.md`, Section 37.2 and `LABS-SOURCE-MANAGEMENT-SPEC.md`, Section 13 state the initial owner is selected only by server-only `LABS_OWNER_USER_ID`, matching the stable Better Auth user ID.

**Actual code:** `src/app/lib/labs/owner-access.js` returns owner when either:
- configured `LABS_OWNER_USER_ID` matches; or
- configured `LABS_OWNER_EMAIL` matches the verified account email.

The email fallback is also described in `pages/LABS-AND-OWNER-WORKSPACE.md` and `operations/ENVIRONMENT-AND-RELEASE.md`.

**Accepted target decision (2026-11-07):** LABS_OWNER_USER_ID only. The current owner-access.js still accepts LABS_OWNER_EMAIL as a fallback; remove that branch after confirming deployed owner provisioning. The new auth guide, Threat Model, environment runbook, ADR-018 and Project Status disclose this mismatch. Do not claim ID-only enforcement until the source code is aligned.

### GAP-04 — Analytics event coverage does not meet all PRD metrics

**Priority:** P1 — approved analytics scope gap  
**Actual event types in `src/app/lib/labs/models/LabAnalyticsEvent.js`:**
- `source_open`
- `code_copy`
- `like`
- `unlike`
- `guest_like`
- `guest_unlike`

There is no current event type for experiment detail views, preview starts or preview interactions. The event producers and current analytics guide also distinguish these from Portfolio Analytics page visits.

**PRD expectations:** FR-06 includes experiment detail views, preview starts and explicitly instrumented preview interactions, in addition to source opens, copies and likes.

**Existing documentation:** `DESIGN-ANALYTICS.md` correctly marks detail-view and preview instrumentation as pending. Do not show unavailable metrics as zero or pretend Portfolio Analytics page-visit records are a substitute for Labs event instrumentation.

**Required action:** keep the gap visible in the dashboard/PRD; decide whether to implement detail-view deduplication and preview-start signals, and define them before adding cards/rankings. Preview interactions should remain deferred until a reliable runtime signal and allowlist are defined.

### GAP-05 — Media model has not migrated to the approved role model

**Priority:** P1 — data model/UX gap  
**Target requirement:** PRD FR-09 and the Labs UX specification describe:
- `gallery-preview`;
- `detail-gallery`;
- `runtime-fallback`.

**Actual schema in `src/app/lib/labs/models/LabExperiment.js`:**
- `galleryPreview` is a separate public static preview reference tied to artifact/source version.
- `mediaAttachments` allows at most one attachment, with the single role `fallback-preview`.

The upload pipeline supports authenticated Cloudinary image/video assets and promotion to public Blob for the selected gallery preview. It does not currently provide a multi-item ordered detail-gallery role or the full three-role attachment model.

**Current documents:** the Runtime and Media Plan and UX Section 38.3 acknowledge that only the legacy single fallback-preview attachment is implemented and role-aware controls require migration. The current Labs guide should repeat that limitation wherever it describes media.

**Required action:** treat role migration and ordered detail gallery as pending. Do not document `fallback-preview` as if it were already the fully approved `runtime-fallback` model.

### GAP-06 — Personal account dashboard/profile/account deletion requirements are not implemented

**Priority:** P1 — product scope gap  
**PRD FR-04 and FR-05 describe:**
- profile management;
- account deletion;
- a user dashboard with account summary/settings;
- liked experiments;
- recently viewed experiments;
- recently accessed components;
- personal activity.

**Current route inventory:** there are sign-up, login, verification, reset and forgot-password routes, but no user dashboard/account settings/delete page. Likes exist, but a personal account activity dashboard is not present in the route tree.

**Required action:** decide whether these requirements remain approved for this project or should be moved to deferred scope. Do not imply that the existing owner analytics dashboard is the user dashboard; they are different products and permissions.

---

## 4. Significant documentation mismatches

These should be corrected before using the documents as implementation instructions.

| Document | Finding | Correct source / action |
|---|---|---|
| `pages/LABS-AND-OWNER-WORKSPACE.md` | Built-in public catalogue and interactive detail runtime claims do not match the current page source. | Reconcile to the source-only catalogue decision and static detail implementation unless GAP-01 is changed. |
| `PROJECT-STATUS.md` | Public Labs row still references built-in demos and custom published runtime verification as though both are the current public experience. | State source-backed custom-only listing and static detail page; record artifact runtime infrastructure separately. |
| `architecture/LABS-RUNTIME-AND-CODE-EXECUTION.md` | Describes published artifact iframe in public detail as current integrated page behavior. | Distinguish artifact-serving capability from actual route integration; resolve GAP-01 first. |
| `LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md`, Section 7 | Heading says Monaco reader/editor is planned/not implemented. | Later sections and `LABS-DETAIL-PRESENTATION-AND-MONACO-EDITOR-IMPLEMENTATION-PLAN.md` record public read-only, owner editable and version-history Monaco as implemented in branch source. Replace old heading/status with the current state and pending browser acceptance. |
| `LABS-SOURCE-MANAGEMENT-SPEC.md`, Phase A/D | Calls the textarea editor the selected current editor and says Monaco was not added. | Superseded by current Monaco integration. Mark the textarea decision historical and link the newer phased plan. |
| `THREAT-MODEL.md`, authorization/source access | Says current implementation still performs legacy per-user grant lookup. | `source-access.js` currently requires verified session + canonical published source and does not use a grant lookup. Keep `LabSourceGrant` identified as legacy model/migration material, not current authorization. |
| `DESIGN-ANALYTICS.md`, readiness checklist | Older checkboxes say the SVG is temporary and Chart.js replacement remains pending. | Later section says Chart.js single-metric chart exists; current analytics engineering guide also describes it. Reconcile the checklist and retain browser/accessibility verification as pending. |
| `PRD.md`, FR-10 | Says experiment-specific Analytics detail route remains a target addition. | `/admin/labs/analytics/[slug]` exists in the current route tree and is documented. Update implementation status without weakening remaining Atlas/browser gates. |
| `LABS-AND-AUTHENTICATION-DESIGN-SPEC.md`, Section 0.3 | Says current code has Google login only and no GitHub provider. | Section 36 and current `auth.js` show both Google and GitHub provider configuration code behind credential gates. Live provider setup/E2E remains pending. |
| `DOCUMENTATION-AUDIT-REPORT.md` | Reports 185 docs paths and 42 README links. | Current audit observed 172 Markdown files and 49 README relative links. Refresh metrics and date when this report is next updated. |
| `PROJECT-STATUS.md` | Its opening product-boundary list is interrupted by the mascot/theme/contact documentation paragraphs before the numbered list. | Reformat the opening into one coherent summary; these system notes should be in a dedicated “current homepage systems” subsection. |

### Additional decision conflicts to record

1. **Active verified-liker identity panel:** `LABS-AND-AUTHENTICATION-DESIGN-SPEC.md`, Section 37.7 says the first release does not show individual names/emails. The current Analytics implementation and `DESIGN-ANALYTICS.md` describe an owner-only current active verified-liker list for one experiment (name, masked email, time, pagination/search), not a historical browsing timeline. Decide whether this narrow current-state exception is approved and record it in the privacy/analytics decision log.
2. **Source viewer editor choice:** the old source spec says textarea/no Monaco; the newer detail/Monaco plan records Monaco integrated. The current code uses shared `LabCodeEditor`. Update all older statements as superseded, not as current design.
3. **Public built-in demo eligibility:** the latest 7 November source-only public catalogue decision must be explicitly added to the Labs UX spec's known-supersession list so the older public-demo language does not reappear during future changes.

---

## 5. Requirements that remain open or explicitly deferred

These are not necessarily bugs. They are either target PRD requirements not implemented or decisions that the repository already marks open/deferred.

| Capability | Current finding | Classification |
|---|---|---|
| Labs catalogue search by title/description/technology/tags | API supports category + cursor only; no search query or text indexing contract. | PRD gap / decide or defer |
| Filters by technology, animation type and tags | Only the four approved Labs categories are exposed by the public API/UI. | PRD gap / decide or defer |
| Sort by newest, most viewed, liked and copied | Current page uses server publication order/cursor; no visitor-selected sort controls. | PRD gap / decide or defer |
| User dashboard | No current dashboard route or personal activity UI. | PRD gap / decide or defer |
| Profile management/account deletion | No user-facing settings/delete route found. | PRD gap / decide or defer |
| Scheduled publication | No scheduler model, schedule API or worker route in the current model/API tree; ADR-010 remains OPEN. | Explicitly open/deferred |
| Portfolio CMS | No general Portfolio content editor/models/routes. | Approved future work |
| Project Detail CMS | Project content remains code-owned; no dynamic detail content editor. | Approved future work |
| Google/GitHub live OAuth | Provider code and UI are present when credential pairs exist; provider-console variables/callbacks and full E2E are unverified. | Code present / verification pending |
| Labs media role migration | No ordered detail-gallery role; only galleryPreview plus one fallback-preview attachment. | Approved target / implementation pending |
| Labs detail runtime | Artifact route exists; public page does not embed it. Product contract conflicts. | P0 decision required |
| Labs detail-page views/preview events | Not present in event model/producers. | PRD instrumentation gap |
| Analytics event retention/account deletion | Event collection has no TTL in model; retention/deletion policy review is pending. | Privacy/release gate |
| Multi-admin roles | Current system is a singleton owner. | Explicitly out of scope |
| Motion Lab components | 120 component specifications exist, but the inventory is a future component specification system, not a claim of 120 implemented components. | Reference library / future implementation |
| General Portfolio media administration | Labs-specific media upload/promotion exists; general Portfolio media manager is deferred with CMS. | Approved future work |

---

## 6. Security and operational items

### 6.1 Owner identity

The target decision is now accepted: LABS_OWNER_USER_ID only. The code still allows LABS_OWNER_EMAIL as a fallback. Remove that branch after confirming which owner ID is provisioned in Preview/Production; do not re-open the policy silently or risk locking out the owner.

### 6.2 Contact endpoint hardening

The contact-specific engineering guide already records the source-observed gaps:
- no explicit route-level rate limiter/CAPTCHA;
- no explicit same-origin check;
- no explicit request byte ceiling;
- no idempotency/deduplication key;
- HTML email `<title>` interpolates a subject containing user input without escaping the subject itself;
- transporter close occurs on success, not a `finally` path.

The contact API still uses Gmail SMTP in source, while `.env.example` still contains a stale Resend block. These are known issues to plan, not proof that SMTP integration is absent.

### 6.3 Deployment verification

Code presence and build history do not establish:
- live MongoDB collections/indexes/TTL state;
- data migration/reconciliation and transaction capability;
- real Cloudinary upload-intent/finalize/promotion behavior;
- real Blob artifact serving and immutable pointer consistency;
- current Sandbox snapshot/limits and deployed Run behavior;
- current exact-HEAD Preview page integration;
- owner-authenticated browser behavior for source editor/version restore/publish and analytics;
- full OAuth callback/account-linking behavior;
- real SMTP delivery after deployment configuration;
- keyboard, responsive, theme, zoom and reduced-motion acceptance.

The current branch HEAD must be the subject of those checks; do not use an older READY Preview as evidence for newer commits.

---

## 7. Test and verification coverage gaps

There are 24 test files under `tests/`; the package build script runs focused Labs, Portfolio Analytics, Monaco, scroll and SEO tests.

No dedicated test file or build test script was found for:
- Contact form validation/submission/email composition/API;
- theme View Transition direction/variant/fallback behavior;
- Vee mascot section/pose/scan interactions or WebGL lifecycle;
- `useUiSound`, AudioContext unlock/decoding/voice cleanup or the three active SFX call sites;
- public homepage section/browser scroll choreography as an integrated visual test;
- project detail full-page route visual/accessibility behavior;
- auth page complete browser journeys (sign-up → verify → sign-in → reset → logout);
- user-facing account settings/dashboard, because these pages do not currently exist.

This does not mean none of these functions work; it means the committed automated suite does not establish those behaviors. They require either focused tests or an explicit browser acceptance record.

---

## 8. Documentation structure and navigation observations

- The initial audit snapshot had 49 README links. After the corrective pass, docs/README.md contains 59 Markdown links to 44 unique relative targets; all 44 current targets were re-fetched successfully.
- The index now directly links the new authentication, privacy/data-lifecycle and error/not-found guides. Remaining Labs implementation plans are reachable from the Labs specs and runbooks.
- The initial audit found no standalone current-state guides for authentication, Privacy Policy/data lifecycle and shared error surfaces. The follow-up pass added pages/AUTHENTICATION-AND-ACCOUNT-ENGINEERING.md, architecture/PRIVACY-AND-DATA-LIFECYCLE.md and pages/ERROR-AND-NOT-FOUND-ENGINEERING.md.
- The Motion Lab reference library is clearly a set of future component specifications. Add this status explicitly to the main README/Project Status so its 120 component spec files cannot be mistaken for implemented UI components.

---

## 9. Corrective order after the 7 November decisions

The three policy decisions that previously blocked documentation reconciliation have been accepted:
1. Public Labs catalogue is source-backed custom experiments only; public detail is static/non-executable.
2. Owner identity target is singleton LABS_OWNER_USER_ID only.
3. Owner Labs Analytics is aggregate-only; no individual active verified-liker identity data.

Documentation has been reconciled across the current Labs guide, runtime/Monaco plans, source-management spec, PRD, Threat Model, Analytics design/current guide, environment runbook, owner-console plan, ADR log, README and Project Status. Section 39 of the Labs UX specification and ADR-018 provide the supersession record.

Remaining implementation order:
- **P0 security/privacy alignment:** remove LABS_OWNER_EMAIL fallback after validating deployed owner config; remove/redesign active verified-liker identity panel and ensure API/DTO output is aggregate-only.
- **P1 metric scope:** decide and implement or explicitly defer experiment detail-view metrics; define whether preview-start/interactions have a meaningful signal while public detail is static; keep Portfolio Analytics visits separate.
- **P1 data model:** design and implement ordered detail-gallery and complete target media-role schema; current model remains galleryPreview plus one fallback-preview attachment.
- **P1 product gaps:** decide scope for search/filter/sort and personal dashboard/profile/account deletion; implement only after explicit authorization.
- **Release verification:** run the exact current-HEAD test/build and authenticated Preview/Atlas/browser checks. This documentation task did not run them.
- **Separate security hardening:** implement contact route protections recorded in the contact guide.

Do not treat documentation updates or accepted decisions as completed application-code changes.

---

## 10. Audit conclusion

The platform is much further along than a simple portfolio: it has detailed page, motion, mascot, sound, theme, contact, Labs, analytics, source editing, compiler and API documentation. However, the documentation cannot yet be treated as one fully reconciled specification.

**The biggest immediate risk is not a missing feature alone; it is that an AI agent could follow a stale document and implement the wrong public Labs behavior or owner authorization rule.**

Resolve the P0 conflicts and reconcile the current-state guides before using the documents as a “rebuild from scratch” package. Then decide which PRD requirements are still in scope versus explicitly deferred. No code implementation should start from an ambiguous contract.


## 11. Corrective documentation pass — 7 November 2026

### 11.1 Accepted decisions and resolved documentation conflicts

| Finding | Follow-up status | Authoritative record |
|---|---|---|
| Public Labs detail runtime conflict | Decision accepted: public detail remains static/non-executable. Older interactive-detail requirements are superseded. | LABS-AND-AUTHENTICATION-DESIGN-SPEC.md §39; PRD FR-02; pages/LABS-AND-OWNER-WORKSPACE.md; architecture/LABS-RUNTIME-AND-CODE-EXECUTION.md |
| Public catalogue built-in/custom conflict | Decision accepted: source-backed published custom experiments only. Built-in runtime registry entries are not merged into /labs. | LABS-AND-AUTHENTICATION-DESIGN-SPEC.md §39; LABS-PUBLIC-PAGE-REDESIGN-PLAN.md §15; PROJECT-STATUS.md |
| Owner ID/email mismatch | Target decision accepted: LABS_OWNER_USER_ID only. Current owner-access.js still has LABS_OWNER_EMAIL fallback; code alignment remains P0. | ADR-018; Threat Model §4/§10; pages/AUTHENTICATION-AND-ACCOUNT-ENGINEERING.md |
| Active verified-liker identity panel | Target decision accepted: aggregate-only; individual account identities/timestamps/search are not allowed. Current Analytics detail UI still has the panel; code alignment remains P0. | ADR-018; DESIGN-ANALYTICS.md §8; architecture/PRIVACY-AND-DATA-LIFECYCLE.md |
| Monaco state | Current branch integrates read-only public/history and editable owner Monaco with plain-text fallback. Historical textarea/not-implemented statements are superseded. | LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md §7; LABS-DETAIL-PRESENTATION-AND-MONACO-EDITOR-IMPLEMENTATION-PLAN.md §14 |
| Legacy source grant lookup | Current source-access service no longer queries LabSourceGrant. The model/collection remains legacy migration material. | pages/LABS-AND-OWNER-WORKSPACE.md §4; Threat Model §4/§10 |

### 11.2 New standalone implementation guides

Added and linked from docs/README.md:
- pages/AUTHENTICATION-AND-ACCOUNT-ENGINEERING.md — Better Auth, verification, password reset, optional OAuth, return paths, owner/source authorization and unimplemented account capabilities.
- architecture/PRIVACY-AND-DATA-LIFECYCLE.md — account, verification, source engagement, likes, page visits, cookies, providers, retention and deletion gaps.
- pages/ERROR-AND-NOT-FOUND-ENGINEERING.md — root App Router 404/500 boundaries, production-safe messaging, development diagnostics and guarded chunk-load recovery.

Also corrected/reconciled the Labs current-state guide/runtime guide, PRD, Threat Model, Analytics docs, source-management and Monaco plans, owner-console plan, Labs auth/source-access runbook, public page redesign plan, ADR log, environment runbook, Project Status and README.

### 11.3 Remaining known gaps

The documentation is more consistent, but this is not a full PRD implementation:
- owner email fallback still exists in code despite the ID-only target;
- individual verified-liker panel still exists in code despite aggregate-only target;
- Labs detail-view and preview event instrumentation are absent;
- ordered detail-gallery and complete attachment-role migration are absent;
- personal account dashboard/profile/self-service deletion are absent;
- public Labs search/expanded filters/user-selected sort are absent;
- Labs analytics event retention and account-deletion treatment are not settled;
- contact endpoint hardening remains open;
- provider credentials, database indexes and third-party services were not exercised in this documentation pass.

### 11.4 Navigation verification

The current docs/README.md has 59 Markdown links and 44 unique relative targets. All 44 targets were fetched successfully on feat/labs-platform-integration. The earlier 49-link count remains the initial audit snapshot.

### 11.5 Verification boundary

This follow-up used repository source/document inspection and GitHub file updates. It did not run npm install, tests, lint, production build, browser/Playwright QA, Atlas queries/migrations, SMTP delivery, OAuth callback flows, Cloudinary, Vercel Blob or Vercel Sandbox calls. Do not claim current-HEAD release verification from this documentation pass.
