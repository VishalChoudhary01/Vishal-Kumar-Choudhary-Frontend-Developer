# Documentation vs Implementation — Gap Audit

**Audit date:** 2026-11-07  
**Repository:** `VishalChoudhary01/Vishal-Kumar-Choudhary-Frontend-Developer`  
**Branch audited:** `feat/labs-platform-integration`  
**Source snapshot at audit start:** `fb6f85917d4bdc477e01a200889cf370bd2fe59a`  
**Scope:** Read-only comparison of documentation and current repository implementation. No application behavior or source code was changed.

> This report is a findings register, not a declaration that all features are release-ready. It separates implementation gaps, documentation mismatches, product decisions and external verification still required.

---

## 1. Executive result

The repository has substantial engineering documentation, but it is **not yet a fully consistent reverse-engineering handover**. A developer or AI agent can understand most major systems, but several important docs currently describe different behaviors for the same feature. There are also approved PRD requirements that are not implemented, and a number of current-state guides need to be corrected before they can safely be used as the sole implementation authority.

The most important issue is the public Labs detail runtime:

- The current public Labs listing is source-backed custom experiments only.
- The current public detail page is a **static presentation page**; it does not mount the published artifact iframe or execute the experiment runtime.
- The runtime compiler, immutable artifact storage and public artifact Route Handler exist, but the page does not wire that runtime into the visitor-facing detail route.
- The PRD and one approved UX section still say the detail page must run the exact published artifact.
- The newer Runtime and Media Plan explicitly says the public detail page must remain static and must not mount an executable runtime.

That is a product-contract conflict, not simply a missing line in a guide. It needs one explicit decision before more Labs detail work is authorized.

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

**Required decision:**
1. Keep the current static detail-page product contract, and reconcile PRD/UX/current-state guides to say that the public detail page presents metadata, static media, likes and protected source only; or
2. Approve a new integration phase to mount the exact published runtime, with readiness, timeout, failed/unsupported, retry and fallback states, and then revise the static-detail plan.

Do not implement the second behavior by assumption. Gallery cards must remain static in either option.

### GAP-02 — Public Labs catalogue eligibility is incorrectly described in current docs

**Priority:** P0 — correct current-state documentation  
**Actual implementation:** `/labs` lists only MongoDB custom experiments with `kind === "custom"`, `status === "published"`, a published source pointer and a ready artifact matching the exact source version. The public detail lookup uses the same source/artifact eligibility. The 7 November source-only decision is explicit in `LABS-PUBLIC-PAGE-REDESIGN-PLAN.md`, Section 15.

**Stale guidance:**
- `pages/LABS-AND-OWNER-WORKSPACE.md` says the public collection combines code-owned built-in experiments and published custom experiments.
- Its detail-page section says `LabWorkspace` chooses a built-in runtime or published custom iframe.
- `PROJECT-STATUS.md` says the public Labs collection/detail should validate built-in demos and custom runtime.
- Older sections in the Labs UX spec and other plans still describe public code-owned demos.

**Required correction:** public discovery is currently custom-source-only. Keep the four code-owned runtime modules as code-owned/owner-import material where needed, but do not describe them as public catalogue entries. Add the 7 November source-only decision to the UX spec's supersession section and update the current Labs guide/status/runtime guide accordingly.

### GAP-03 — Owner identity code does not match the locked owner decision

**Priority:** P0 — security decision required  
**Locked product decision:** `LABS-AND-AUTHENTICATION-DESIGN-SPEC.md`, Section 37.2 and `LABS-SOURCE-MANAGEMENT-SPEC.md`, Section 13 state the initial owner is selected only by server-only `LABS_OWNER_USER_ID`, matching the stable Better Auth user ID.

**Actual code:** `src/app/lib/labs/owner-access.js` returns owner when either:
- configured `LABS_OWNER_USER_ID` matches; or
- configured `LABS_OWNER_EMAIL` matches the verified account email.

The email fallback is also described in `pages/LABS-AND-OWNER-WORKSPACE.md` and `operations/ENVIRONMENT-AND-RELEASE.md`.

**Required decision:** either remove the email fallback and enforce the locked ID-only decision, or explicitly amend the owner-identity decision because email bootstrap is now intentionally supported. Verify Preview/Production configuration before changing code so the active owner is not locked out. Do not silently describe the two policies as identical.

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

Resolve GAP-03 (ID-only owner identity vs ID-or-email fallback) before relying on the lock statement in the source-management spec. Check which owner variable is configured in each deployment before any code change.

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

- `docs/README.md` has 49 relative Markdown links; the audit found zero missing link targets.
- The root README does not directly index every active Labs implementation plan. Some are referenced by other specs; a compact “active Labs plans and release runbooks” section would make those documents easier to discover.
- The current page guides do not yet provide standalone current-state page guides for the authentication route group, Privacy Policy page and shared error page. Those areas are described in auth/legal plans and current code, but not with the same route → component → state → API → error/accessibility map used for Contact and Labs.
- The Motion Lab reference library is clearly a set of future component specifications. Add this status explicitly to the main README/Project Status so its 120 component spec files cannot be mistaken for implemented UI components.

---

## 9. Recommended correction order

Do not fix every missing PRD feature at once. First make the source of truth unambiguous.

### Phase A — Lock the conflicting behavior
1. Decide public experiment detail: static detail or exact published interactive runtime.
2. Decide owner bootstrap: `LABS_OWNER_USER_ID` only or explicit verified-email fallback.
3. Decide the narrow owner-only active verified-liker identity exception.
4. Confirm search/filter/sort, user dashboard/profile/deletion, media roles, schedule and analytics instrumentation as current scope or deferred.

### Phase B — Correct documentation before more code
1. Reconcile `LABS-AND-OWNER-WORKSPACE.md`, `PROJECT-STATUS.md`, `LABS-RUNTIME-AND-CODE-EXECUTION.md` to match the chosen public detail behavior and current source-only catalogue.
2. Update the Labs UX spec's supersession section with the 7 November source-only decision and Google/GitHub implementation status.
3. Mark old textarea and pre-Monaco source-editor statements superseded.
4. Correct Threat Model's legacy-grant statement and Analytics' stale chart checklist.
5. Update PRD implementation-status wording for Analytics detail route, while preserving target requirements that remain unimplemented.
6. Reconcile the active liker privacy exception and owner identity rule in Decisions.
7. Refresh the audit metrics/counts and README navigation.

### Phase C — Only then authorize implementation
Prioritize security and release gates before new product scope:
- owner authorization resolution;
- exact current-HEAD Preview/browser regression of Source Library, editor, Run/Save/Restore/Publish and public Labs;
- runtime contract decision and tests;
- media-role migration plan;
- event-retention/detail-view/preview-instrumentation contract;
- contact hardening;
- then explicitly approved PRD gaps.

---

## 10. Audit conclusion

The platform is much further along than a simple portfolio: it has detailed page, motion, mascot, sound, theme, contact, Labs, analytics, source editing, compiler and API documentation. However, the documentation cannot yet be treated as one fully reconciled specification.

**The biggest immediate risk is not a missing feature alone; it is that an AI agent could follow a stale document and implement the wrong public Labs behavior or owner authorization rule.**

Resolve the P0 conflicts and reconcile the current-state guides before using the documents as a “rebuild from scratch” package. Then decide which PRD requirements are still in scope versus explicitly deferred. No code implementation should start from an ambiguous contract.
