# Labs Owner Console — Analytics and Source Management Plan

**Status:** Active execution plan. Phases 0–5 have implementation code committed; the route split, custom analytics correction, metadata editor, source creation handoff and initial live Analytics dashboard have Preview build coverage. Anonymous protected-route smoke tests pass. Authenticated owner actions, Atlas-backed reconciliation and visual/accessibility QA remain pending. Deterministic instrumented-event rankings and per-experiment aggregate analytics are committed and included in READY Preview deployment `dpl_ADaqDDWRKP2WjESBaKA2dqgBuv7a`; anonymous detail-page protection/return-path smoke test passes. Authenticated Atlas reconciliation and visual/accessibility QA remain pending. Phase 6 regression/release verification and further analytics instrumentation remain outstanding.  
**Audited branch:** `feat/labs-platform-integration`  
**Audited commit:** `3cfacf96ec6847e78fa2fc8f83b9bd18cd573fad`  
**Audit date:** 2026-11-06  
**Related authorities:** `PRD.md`, `DESIGN-ANALYTICS.md`, `LABS-SOURCE-MANAGEMENT-SPEC.md`, `API-CONTRACTS.md`, `IMPLEMENTATION-PLAN.md`, and `LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md`.

This document coordinates the next owner-console changes. It does not replace the detailed product, analytics, source-lifecycle, API, security or runtime specifications. Those documents remain the detailed authorities for their respective domains.

---

## 1. Objective and boundaries

Separate the current owner experience into clear, non-overlapping destinations while extending it without regressing existing behavior:

1. **Analytics** — explain what is happening across Labs, show correctly defined aggregate metrics, trends and experiment rankings, and refresh the dashboard while it is open.
2. **Source Library** — find experiments, see source-workspace state, initialize a source workspace and open it.
3. **Source Workspace** — retain the existing code-file editing, draft/version, preview, audit and publication lifecycle.
4. **Experiment Details Editor** — edit experiment metadata independently of source files.

This is a Labs-specific owner console, not authorization to build the deferred general portfolio CMS.

### Out of scope for this plan

- Replacing the public Labs listing, its four code-owned demos or their existing detail-page interactions.
- Replacing the current source editor or changing its storage/version model for visual convenience.
- Changing the locked owner identity or verified-account source-access policy.
- Building a general portfolio CMS, portfolio-wide analytics or multi-admin role management.
- Reworking the isolated compiler, runtime, poster and media pipeline. Those remain governed by the Runtime and Media Plan.
- Adding a WebSocket provider, Redis, a charting package or a client-state library before a measured need and an explicit technical decision exist.

## 2. Source-of-truth responsibilities — avoid duplicated requirements

| Document | Owns | Must not duplicate |
|---|---|---|
| `PRD.md` | Approved product requirements and non-negotiable outcomes | Detailed implementation steps or component code |
| `DESIGN-ANALYTICS.md` | Metric definitions, event semantics, dashboard content, visual/accessibility rules | Source-editor lifecycle or phase sequencing |
| `LABS-SOURCE-MANAGEMENT-SPEC.md` | Owner authorization, source inventory/editor, file validation, immutable versions, draft/publish/restore and audit rules | Analytics visualization specification |
| `API-CONTRACTS.md` | Existing and proposed endpoint methods, payload expectations, authorization and error behavior | Dashboard layout and visual design |
| This plan | Current-state gaps, target route responsibilities, implementation order, preservation constraints and phase gates | Full metric catalog, source lifecycle rules or Studio runtime plan |
| `LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md` | Isolated execution, React/JSX, Tailwind v4, Motion runtime, media roles, generated posters and release gates | Owner analytics/dashboard requirements |

When a detail belongs to another authority, link to it and update that document if its requirement changes. Do not copy the same rules into multiple documents and let them drift.

## 3. Audited implementation baseline

The findings below are based on the audited branch and commit listed at the top. They are a code inspection, not proof of deployed Atlas or browser behavior.

### 3.1 Current routes and UI

| Current route/component | Verified responsibility | Gap |
|---|---|---|
| `/admin/labs/sources` | Owner-protected page currently renders source-engagement analytics first and `LabSourceInventory` below it | Analytics and library are combined in one route/page |
| `/admin/labs/sources/[slug]` | Owner-only source workspace rendered by `LabSourceEditor` | Keep it; do not replace or duplicate it |
| `/admin/labs/sources/import` | Existing source import entry point | Preserve its current flow and return behavior |
| `/admin/labs/experiments/new` | Creates an owner experiment through `LabExperimentCreateForm`; successful creation navigates using the API-returned workspace URL | Preserve the existing create flow |
| `LabsAccountControl` | The owner account menu currently links to `/admin/labs/sources` | Point the owner to the new Analytics landing route or owner console entry, while retaining a clear Source Library link in the owner navigation |

The current Sources page uses server-side `getLabsOwnerAnalytics` data. It contains metric cards, a basic daily activity bar chart, an experiment table and like activity, followed by the source inventory. It is not a dedicated live analytics client.

### 3.2 Existing source functionality — preserve it

The current `LabSourceInventory` supports source-state filters/search, loading/error handling, source creation for an eligible experiment, opening an existing workspace and guarded custom-experiment deletion.

The current `LabSourceEditor` already supports:

- Add, import, edit, rename and remove text files, with path/language/content validation.
- HTML/CSS, React JS and React TSX starter files.
- File selection, file reordering, size/count reporting and unsaved-change protection.
- Local unsaved working-copy changes and explicit draft saving.
- Immutable saved versions, history, read-only version preview and restore-as-new-draft.
- Isolated preview integration already present in the editor; its deployed behavior remains governed by the Runtime and Media Plan.
- Explicit publish/unpublish confirmations and server-confirmed outcomes.
- Owner audit history and guarded destructive deletion for owner-created experiments.

**Do not rebuild these actions in Analytics or the Source Library.** The Source Library links into this existing workspace. The new Experiment Details Editor handles catalogue metadata only; it does not edit source files.

### 3.3 Existing APIs and data

- `GET /api/v1/admin/labs/analytics?days=7|30|90|365` exists and enforces owner access.
- `GET/POST /api/v1/admin/labs/sources` exist for inventory and source-head creation.
- Owner source read, versions, restore, publish, unpublish and audit endpoints exist.
- `POST /api/v1/admin/labs/experiments` creates an owner-created experiment; `DELETE /api/v1/admin/labs/experiments/:slug` deletes an eligible custom experiment.
- `PATCH /api/v1/admin/labs/experiments/:slug` now updates only custom experiment catalogue metadata. It uses the existing owner/same-origin guards, server validation, expected-`updatedAt` concurrency, immutable slug/system fields and an append-only metadata-update audit event. It does not touch source files or publication pointers.
- The current `LabAnalyticsEvent` schema accepts `source_open`, `code_copy`, `like`, `unlike`, `guest_like` and `guest_unlike`.
- The existing `MotionNumber` component uses `motion/react` and respects reduced motion. Reuse it for dashboard counts.
- The existing theme exposes semantic `brand`, `info`, `success`, `warning` and `error` tokens in light and dark themes.

### 3.4 Analytics correctness gaps to resolve before adding more UI

1. **Static catalogue assumption:** `owner-analytics.js` builds experiment rows from the code-owned `publishedLabExperiments` array. Owner-created experiments are stored in MongoDB and can be published independently. The aggregate must use a unified catalogue of eligible code-owned and database-backed custom experiments.
2. **Source-event validation:** the current source-event route validates a slug against the code-owned published list before recording `source_open` or `code_copy`. It must resolve published custom experiments as well, while still rechecking the exact published source/version and verified session.
3. **View tracking is absent:** the current event schema does not record `experiment_view`. Do not display experiment views as a metric until qualifying view instrumentation and deduplication are implemented.
4. **Preview tracking is absent:** `preview_start` and `preview_interaction` are not in the current event schema. Do not show these as real metrics until the runtime supplies a reliable server-accepted event lifecycle.
5. **Daily series is sparse:** the current aggregation returns active dates only. The graph should receive a complete date range with explicit zero-activity days, generated consistently for its selected period/timezone.
6. **Unique-account labels need precision:** the current total adds per-experiment distinct verified-account counts. The same account can be counted once for each experiment. Label the total as a sum of per-experiment unique accounts (experiment-account pairs), not as a deduplicated total of individual people/accounts across all Labs.
7. **Current state versus period events:** active likes are current-state aggregates; like/unlike actions are period events. Never combine or label them as the same measure.
8. **Chart scope:** existing activity is aggregated daily in UTC. Keep timezone and bucket boundaries explicit when improving the graph.

Do not backfill or fabricate historical views, preview events or custom-experiment engagement. Newly instrumented metrics begin when their instrumentation is released; communicate that boundary in the UI and reporting documentation.

## 4. Target information architecture

The existing public and source-workspace routes remain. Separate the owner destinations as follows:

| Target route | Page responsibility | Primary actions |
|---|---|---|
| `/admin/labs/analytics` | Owner analytics overview and live-updating aggregate dashboard | Change reporting period, inspect trends/rankings, open experiment analytics |
| `/admin/labs/analytics/[slug]` | One experiment's aggregate analytics | Inspect its views/opens/copies/likes and trends; link to its public page and owner workspace |
| `/admin/labs/sources` | Source Library / experiment inventory | Search/filter, initialize a missing source workspace, open an existing workspace, start a new experiment, open metadata editing, guarded deletion where supported |
| `/admin/labs/sources/[slug]` | Existing source-code workspace | Edit files, preview, save drafts, review/restore versions, publish/unpublish, inspect audit |
| `/admin/labs/experiments/new` | Existing custom-experiment creation flow | Create experiment metadata and navigate to the returned workspace |
| `/admin/labs/experiments/[slug]/edit` | New metadata-only editor for an existing owner-created experiment | Edit title, description, explanation, category and technologies |

These are Labs-specific routes. Confirm the App Router folder structure before implementation; do not create duplicate routes or rename the existing source workspace.

### Navigation behavior

- The owner account-menu entry should lead to `/admin/labs/analytics` as the owner-console landing destination.
- The Analytics and Source Library pages should provide consistent owner navigation between each other.
- Direct navigation to every owner route must still run the existing server-side owner guard.
- `/admin/labs/sources` must remain the Source Library route, not redirect to Analytics.
- Keep existing deep links to `/admin/labs/sources/[slug]` and the import route working.
- Preserve the requested return destination during sign-in; safe return-path validation and owner reauthorization remain server responsibilities.
- Do not expose owner navigation to normal or unverified accounts.

## 5. Capability separation and non-duplicative workflows

### 5.1 Experiment metadata versus source files

These are separate records and editing tasks:

- **Experiment metadata:** title, description, explanation, category and technologies on the `LabExperiment` catalogue record.
- **Source snapshot:** file paths, languages and code text in the source-version workflow.
- **Media metadata/assets:** role, alt text, caption, ordering and asset references governed by the Runtime and Media Plan.

The metadata editor must not edit source files or source-version pointers. The source editor must not silently mutate experiment title/category/description. Publishing source remains separate from publishing a custom experiment/runtime release.

The metadata update operation should be a same-origin owner-only `PATCH /api/v1/admin/labs/experiments/:slug` handled by the existing experiment-management domain boundary. It must validate the current `LabExperiment` schema, preserve immutable/system-owned fields and write a safe audit record. Keep the canonical slug immutable in this phase; changing it would affect routes, source heads, published artifacts, event attribution and historical links.

### 5.2 Source initialization and editing handoff

- If an experiment has no source head, show **Create source** / **Initialize source**.
- On successful source-head creation, navigate directly to `/admin/labs/sources/[slug]`; do not require a second click to open the newly created workspace.
- If the source head already exists, show **Open workspace** and never issue a duplicate create request.
- If the creation request fails or conflicts, preserve the inventory state and show an actionable error. Do not navigate to a workspace that was not confirmed by the server.
- Keep the existing experiment-creation form's successful `workspaceUrl` navigation.
- Do not add a second source editor, another version system or parallel draft/publish buttons to the library.

## 6. Analytics data and presentation

The full event and metric definitions remain in `DESIGN-ANALYTICS.md`. The following implementation rules prevent misleading numbers:

- Build summary cards, chart series, rankings and experiment detail from the same selected date period and filter state.
- Clearly distinguish public experiment detail views from protected source opens.
- Count a source open only after the verified source endpoint successfully returns the currently published source.
- Count a code copy only after successful Clipboard API acknowledgement and server acceptance; it does not mean code was pasted or executed.
- Count like/unlike actions only for actual server-confirmed state transitions. Keep active like state separate from action counts and anonymous actions separate from verified accounts.
- Show a rate only when its denominator is non-zero; expose the numerator and denominator/formula.
- A missing metric implementation must be shown as unavailable/not yet instrumented, not as zero.
- Return aggregates only. Never send raw analytics rows, user IDs, emails, clipboard content or source code to the dashboard.
- Include generated/updated time, period, timezone and a clear stale/error status. Do not label a poll response as real-time to the millisecond.

### 6.1 Live-update transport: polling first

**First release decision:** use owner-authorized HTTP polling through the existing analytics endpoint. Target a 10-second refresh interval while the dashboard is visible.

Required behavior:

1. Server-render the initial authorized aggregate payload so the page has meaningful data before the first client refresh.
2. Refresh the active period with `cache: no-store` and the existing same-origin session credentials.
3. Pause polling while `document.visibilityState !== "visible"`; resume on visibility/focus.
4. Prevent overlapping requests and abort an in-flight request on route change/unmount.
5. Add bounded retry/backoff on errors (for example 10s → 20s → 40s → 60s maximum); do not spin or replace valid prior data with fabricated zeroes.
6. Keep the last successful data visible with an explicit stale/last-updated indicator when refresh fails.
7. Provide a manual refresh action and avoid polling when the dashboard is not mounted.
8. Apply the selected date range consistently to every refresh; do not reset filters after polling.
9. Animate only values/points that actually changed. A refresh must not replay the entire entrance animation or shift the layout.
10. Include a reduced-motion path that updates values without positional/counting transitions.

Keep the client refresh transport behind a small dashboard data adapter/hook so a future push transport can deliver the same normalized aggregate shape. Polling is the selected first implementation; WebSockets are not a prerequisite.

### 6.2 WebSocket upgrade path — conditional, not part of the first release

Consider WebSockets only when measured polling load, latency or product requirements justify a persistent connection. Before choosing it:

- Verify the hosting/runtime behavior for long-lived connections and reconnects.
- Select a shared cross-instance event/pub-sub mechanism; do not assume an in-memory connection registry works across serverless instances.
- Define event delivery, authorization refresh, backpressure, replay/reconnect and fallback-to-polling behavior.
- Measure active owner sessions, event volume, database aggregation cost and user-visible latency.
- Document provider, cost, monitoring, failure modes and security before adding infrastructure.

Do not add Redis, a hosted WebSocket provider or a second backend simply because the chart is animated. The chart must remain transport-independent.

### 6.3 Motion and semantic visual rules

- Reuse `src/app/components/motion/MotionNumber`; extend it only where locale/grouping support is needed. Do not add a competing animated-number implementation.
- Use `motion/react` already installed by the project for restrained chart/metric transitions.
- Use existing semantic theme variables in both light and dark themes. Reserve `success`, `warning` and `error` for their actual status meanings; do not assign them arbitrarily to likes or neutral activity.
- Use brand/info/neutral treatment for series distinctions where appropriate, and pair color with labels, stroke patterns or markers. Color must not be the only means of identifying a series.
- Preserve tabular number alignment and locale-aware formatting. Define units, timezone, chart interval and missing-day behavior.
- Every chart must have an accessible textual/table equivalent, keyboard/focus support for interactive details and responsive behavior without page-level horizontal overflow.
- Respect reduced-motion settings. Avoid looping/decorative animation and do not make animated movement necessary to understand a value.
- Do not add a chart package until the team has compared the current stack and an explicit dependency decision is recorded. A lightweight SVG/CSS chart using existing Motion is a valid first candidate, subject to accessibility and performance tests.

## 7. Implementation sequence

Work in small phases with separate reviewable commits. Do not begin a later phase while its dependency gate is failing.

### Phase 0 — Baseline and regression inventory

**Work**
- Reconfirm the current branch/head and inspect actual route, API, model and theme files before code changes.
- Record current create-source, edit-file, import, draft-save, version-list/view/restore, preview, publish, unpublish, audit and guarded-delete behavior.
- Capture existing Analytics and Source Library behavior at desktop/mobile sizes.
- Record build/lint/tests and known runtime/media regressions without treating them as fixed by this work.

**Gate**
- A test checklist exists for every existing action above.
- Known failures are explicitly separated from regressions introduced by this scope.
- No implementation begins from stale screenshots or a different branch snapshot.

### Phase 1 — Split the owner routes and navigation

**Work**
- Create the dedicated Analytics route using the current server-side owner guard and initial aggregate query.
- Move only analytics presentation into Analytics; do not move, rewrite or duplicate Source Inventory logic.
- Keep `/admin/labs/sources` as the Source Library and remove the analytics sections from that page.
- Add shared, consistent owner navigation between Analytics and Source Library.
- Update the owner account menu to enter Analytics; do not alter normal-user menu behavior.
- Preserve import, create-experiment, source-workspace and deep-link routes.

**Gate**
- Analytics and Source Library are separate pages with distinct responsibilities.
- All direct routes and all relevant APIs independently enforce the owner guard.
- Existing source inventory filters, source create/open/delete and import entry points still work.
- Existing source editor URL and owner sign-in return destination continue to work.
- No public Labs route, public demo or shared homepage layout changes.

### Phase 2 — Correct the analytics catalogue and event coverage

**Work**
- Introduce one server-side canonical catalogue/resolver for code-owned published experiments and eligible published custom experiments. Deduplicate by canonical slug and define deterministic precedence.
- Update owner aggregates to query custom experiment engagement as well as code-owned experiments.
- Update source-event validation to accept eligible published custom experiments without weakening verified-session, publication, source-version or idempotency checks.
- Keep source opens/copies restricted to verified accounts and source-version matched.
- Add `experiment_view` only with an agreed qualifying-view and deduplication rule.
- Add preview events only after the isolated runtime has a stable successful-start signal and an explicit allowlist for interactions.
- Fill missing dates in daily chart series and make timezone/bucket boundaries explicit.
- Audit unique-account arithmetic, current-like state, period-like actions and guest-like reporting.

**Gate**
- Built-in and published custom experiments reconcile against controlled fixtures.
- A custom source open/copy succeeds only for a verified account and current published source; guest/unverified requests remain denied.
- Replayed event IDs do not inflate counts.
- Unpublished/deleted experiments do not appear as live/published ranking entries; historical-retention behavior is explicitly defined.
- Each metric has an implementation status, written definition and fixture before it appears as a normal number.

### Phase 3 — Add experiment metadata editing

**Work**
**Code committed / Preview build-verified:** the metadata-only route, editor, owner PATCH, shared validation, expected-`updatedAt` concurrency, slug/system-field exclusion and audit action are present. Remaining work is authenticated owner verification, stale-conflict testing and persisted audit confirmation.

- Metadata route: `/admin/labs/experiments/[slug]/edit`.
- Mutation: same-origin owner-guarded `PATCH /api/v1/admin/labs/experiments/:slug`, preserving the existing DELETE method.
- Reuse `experiment-management.js` and current `LabExperiment` validators; do not call Mongoose from UI components.
- Editable fields: title, description, explanation, category and technologies only.
- Slug, kind, status, publication timestamp, creator identity and media attachment internals are not editable through this form.
- The client sends the last-seen `updatedAt`; stale updates return 409 rather than overwrite newer metadata.
- A successful metadata change appends `experiment_metadata_updated` to the owner audit collection.
- The edit form has validation feedback, save/cancel, pending/success/error states and unsaved-change protection.

**Gate**
- Existing custom experiment creation and deletion continue to work.
- Metadata update changes only allowed catalogue fields and never changes source files, source-version pointers, publication state or artifacts.
- Stale updates return a conflict and do not overwrite newer data.
- Built-in code-owned experiment metadata cannot be edited through the custom-experiment PATCH path.
- The canonical slug and existing links remain stable.

### Phase 4 — Improve the Source Library handoff

**Work**
- Keep the existing inventory component and its state filters/search.
- Navigate to the confirmed source workspace after a successful source-head creation.
- Keep an existing source on the Open workspace path; handle conflict/duplicate creation safely.
- Make the library row actions explicit and non-repetitive: open workspace, edit experiment details, create source where missing, delete custom experiment where allowed.
- Keep metadata editing and source-code editing clearly labelled as separate actions.
- Do not place another analytics graph or metric-card collection in the Source Library.

**Gate**
- Create-source never produces a duplicate and never navigates on a failed request.
- A newly created workspace opens directly.
- Existing search, status filters, refresh, empty/loading/error states and destructive confirmation still work.

### Phase 5 — Live Analytics client and visualizations

**Work**
- Add an Analytics client refresh layer using the polling contract in Section 6.1.
- Reuse `MotionNumber` for summary counts; add locale support only if needed.
- Build a multi-series trend chart for instrumented metrics, with complete daily/monthly buckets appropriate to the selected period.
- Add period controls, metric context/definitions, hover/focus detail, accessible table data and last-updated/stale states.
- Add rankings for metrics that are genuinely instrumented and a dedicated experiment analytics detail route.
- Use theme semantic tokens, not hard-coded colour assumptions.
- Lazy-load analytics-only chart code; keep dashboard/editor bundles out of public Labs and homepage bundles.

**Gate**
- Polling follows visibility, cancellation, no-overlap, backoff and manual-refresh rules.
- Controlled new events visibly update only the appropriate card/chart series.
- Errors preserve last-known-good data and never masquerade as zero activity.
- Reduced-motion users receive accurate static updates.
- Chart values reconcile with API fixtures and table equivalents.
- Responsive, keyboard, screen-reader, contrast and light/dark verification passes.

### Phase 6 — Integrated security, regression and release verification

**Work**
- Run owner/guest/unverified/verified authorization tests for pages and every API.
- Verify source bytes never enter guest/unverified HTML, RSC payloads, public DTOs, source maps, logs or shared caches.
- Test event origin checks, server-derived actor IDs, idempotency, rate limits and stale version handling.
- Re-run all source editor lifecycle tests and media/runtime release gates applicable to the branch.
- Run build, targeted lint, relevant unit/integration/e2e tests and browser QA.
- Compare public Labs and homepage behavior against the Phase 0 baseline.

**Gate**
- No existing functionality is removed or silently changed.
- Existing public routes, four code-owned demos, source access policy, file editing, drafts, immutable versions, restore, preview, audit, publish/unpublish and guarded deletion pass.
- New metadata edit, separated routes and analytics polling pass their tests.
- All unresolved deployment/Atlas/SMTP/Cloudinary/runtime items remain visible as release blockers; documentation completion is not production approval.

## 7A. Execution log — 2026-11-06

| Item | Status | Evidence / remaining check |
|---|---|---|
| Phase 0 repository/route/API/component audit | Complete | Re-audited branch head `db4691163fd0a98d39b4f81fb391996dad45f82c`; source page, inventory, source editor/import, analytics API/service, owner menu, theme tokens and MotionNumber inspected |
| Dedicated Analytics route | Build-verified | `src/app/admin/labs/analytics/page.js` reuses the existing server owner guard and analytics aggregation/UI; Preview deployment reached READY and its route manifest includes this route |
| Source Library route | Build-verified | `src/app/admin/labs/sources/page.js` renders the existing `LabSourceInventory` without analytics; route manifest includes it |
| Shared owner navigation | Build-verified | `LabsOwnerNavigation` provides Analytics and Source Library destinations; account menu contains both links. Authenticated owner-menu interaction still needs browser QA |
| Legacy reporting-period bookmarks | Route smoke-tested | Anonymous request to a valid `?days=30` bookmark returns the login page with `returnTo=/admin/labs/analytics`; code forwards valid 7/30/90/365 values |
| Owner verification return path | Build-verified / partly smoke-tested | Notice validates exact allowed owner return paths; source editor and import pass their own destination. Verification completion itself still needs an authenticated browser test |
| Source creation-to-editor handoff | Code committed / Preview build-verified | LabSourceInventory validates the server-confirmed slug and opens the new workspace. A 409 conflict quietly refreshes inventory and never navigates to an unconfirmed path. Authenticated create/duplicate behavior against Atlas remains pending |
| Custom experiment analytics + source event coverage | Code committed / build-verified | Owner aggregation now combines code-owned experiments with published custom experiments whose source version matches a ready artifact; source-open/copy event validation accepts the same published custom catalogue. Atlas-backed reconciliation and verified event round-trip are still pending |
| Custom experiment metadata editor/PATCH | Code committed / build-verified | Preview route manifest contains `/admin/labs/experiments/[slug]/edit`; anonymous request returns login with the exact edit destination. Authenticated save, stale conflict and Atlas audit verification remain pending |
| Complete daily date buckets | Code committed / build-verified | Analytics now emits a complete UTC date series with zero-activity days; zero-value days render zero-height bars and the empty state checks actual activity | 
| Live polling, MotionNumber and multi-series chart | Code committed / Preview build-verified on commit `e2673785bd882a0b787318e9551d49b8e9e9468b` | Visible-tab 10-second polling, visibility pause, abort/no-overlap, bounded backoff, stale-data preservation and manual refresh. MotionNumber supports locale grouping; chart shows four instrumented series and an accessible daily table |
| Instrumented-event rankings | Code committed / Preview build-verified | Collection analytics adds deterministic top-five rankings for source opens and code copies in the selected period, plus current active likes; zero-value entries are omitted and ties resolve by title then slug |
| Per-experiment analytics API/detail route | Code committed / Preview build-verified | Adds owner-only `GET /api/v1/admin/labs/analytics/:slug` and `/admin/labs/analytics/[slug]`; aggregate-only output includes period metrics, current active likes and UTC daily series for published built-in or eligible custom experiments |
| Analytics detail return-path protection | Code committed / Preview build-verified / page smoke-tested | Exact slug route is allowlisted through owner login/verification handling; API response remains private/no-store and exposes no raw events or account identifiers |
| Pure analytics regression tests | Added; 6 tests pass locally | Node-native tests cover ranking order/ties/limits, valid and invalid periods, complete UTC date buckets, invalid bounds and custom artifact/source-version eligibility |
| Reporting-period upper bound | Code committed | Collection event aggregation now matches `occurredAt <= generatedAt` as well as the lower bound, preventing future-dated records from inflating period totals |
| Build and protected-route smoke test | Passed on latest rankings/detail Preview | Deployment `dpl_ADaqDDWRKP2WjESBaKA2dqgBuv7a` reached READY; route manifest includes collection/detail pages and APIs. Anonymous detail-page protection/return-path check passed. The latest test-gating and period-bound commits need a fresh Preview build |

### Phase 2 initial code progress — 2026-11-06

| Item | Status | Evidence / remaining check |
|---|---|---|
| Built-in + custom analytics catalogue | Code committed / build-verified | Owner analytics now combines the static built-in catalogue with `getPublishedCustomLabExperiments()`, which includes only published custom experiments whose current source pointer matches a ready artifact |
| Custom source-open/copy event validation | Code committed / build-verified | Source-event route uses the same published custom experiment resolver; the existing verified-session, same-origin, source-version/file validation and event-id deduplication remain in place |
| Complete UTC daily series | Code committed / build-verified | Server aggregation emits each UTC calendar date across the rolling period; missing dates contain zero values |
| Zero-data chart behavior | Code committed / build-verified | Chart distinguishes no activity from an empty date array and renders zero-height bars for zero activity |
| Atlas reconciliation | Pending | Verify real custom experiment documents, source heads, immutable versions, ready artifacts, likes and event counts against expected aggregates |
| Verified custom event round-trip | Pending | Use an actual published custom experiment and verified test account; verify source-open after successful source response, clipboard-success copy, exact source version and replayed event IDs |
| Experiment detail views and preview events | Not started | Keep unavailable until qualifying-view/deduplication rules and successful runtime-start signals are approved and implemented |

The READY Preview deployment used commit `782d276d0a44dde14bbcf0c9fae5d4a5615afc0e`. Next verification requires provisioned Atlas data and an authenticated verified test account; do not infer production data correctness from compilation.

### Phase 3 metadata editor progress — 2026-11-06

| Item | Status | Evidence / remaining check |
|---|---|---|
| Metadata-only owner edit page | Code committed / build-verified | `/admin/labs/experiments/[slug]/edit` is in the READY Preview route manifest; anonymous smoke test redirects to login with the exact edit path in `returnTo` |
| Source Library entry point | Code committed / build-verified | Custom experiment rows expose **Edit details**; deleting experiments do not expose the edit action |
| Metadata PATCH | Code committed / build-verified | Existing `DELETE /api/v1/admin/labs/experiments/:slug` remains; `PATCH` is added to the same route with owner and same-origin checks |
| Editable field boundary | Code committed / build-verified | Only title, description, explanation, category and technologies are accepted; slug, kind/status, publication time, creator and media internals are not passed to the update service |
| Shared validation | Code committed / build-verified | Create and edit share `validateExperimentMetadata`; metadata update additionally requires a well-formed technology array |
| Stale-update protection | Code committed / build-verified | Client supplies expected `updatedAt`; server compares within a transaction and returns conflict for stale tokens; the next timestamp advances monotonically |
| Audit | Code committed / build-verified | `experiment_metadata_updated` is an allowed append-only source audit action written in the same MongoDB transaction as the metadata update |
| Owner auth return paths | Code committed / build-verified | Exact metadata edit path is accepted by owner return-path validation through login, verification and password recovery pages |
| Authenticated end-to-end edit | Pending | Use a provisioned owner account and actual custom experiment; verify successful edit, reload persistence, concurrent stale save rejection, audit entry and unchanged source/published artifact pointers |

The metadata-edit Preview deployment reached READY:
- Deployment: `dpl_6EbiWW3bPgpuih2exTZwWNBndscK`
- Commit: `d2c6ce5724f57ad6809ab6b24a6fa26ed4325509`
- Build: Next.js compile succeeded in 4.4s; SEO validation passed with zero warnings; deployment reached READY.
- Route manifest: `/admin/labs/experiments/[slug]/edit` and the existing `/api/v1/admin/labs/experiments/[slug]` route are present.
- Anonymous smoke test: `/admin/labs/experiments/fluid-gradient-playground/edit` resolves to the sign-in screen with the exact edit destination in `returnTo`.

This does not prove an authenticated owner save, conflict response or MongoDB audit transaction. Those tests remain required before Phase 3 is considered fully accepted.

### Phase 4 source-workspace handoff — 2026-11-06

| Item | Status | Evidence / remaining check |
|---|---|---|
| Confirmed creation response | Code committed / Preview build-verified | The inventory validates `payload.data.slug` against the requested canonical slug before navigation |
| Automatic workspace navigation | Code committed / Preview build-verified | After a successful server response, the owner is sent directly to `/admin/labs/sources/[slug]`; no second Open workspace click is required |
| Duplicate/conflict behavior | Code committed / Preview build-verified | A 409 triggers a quiet inventory refresh and an actionable message; it does not navigate to an unconfirmed path or retry creation automatically |
| Authenticated create flow | Pending | Verify against a provisioned owner and actual eligible experiment in Atlas; confirm new workspace loads and is immediately editable |

Preview deployment `dpl_AzAnNtSHEwjdbkE6qVCW5nQMPHhf` reached READY for commit `ddf5686526133f304376300a9435dbf79a2d0d53`. Its route manifest retained the Source Library, source workspace, import, metadata editor and Analytics routes.

### Phase 5 live Analytics dashboard — 2026-11-06

| Item | Status | Evidence / remaining check |
|---|---|---|
| Server-first data and owner authorization | Code committed / Preview build-verified | The Analytics Server Component retains the owner guard and initial aggregate query, then passes only the aggregate payload to the route-scoped client dashboard |
| 10-second polling | Code committed / Preview build-verified | Uses the existing owner analytics GET endpoint and current reporting-period query |
| Visibility and request lifecycle | Code committed / Preview build-verified | Polling pauses while hidden; focus/visibility resumes; AbortController cleans up; overlapping requests are prevented |
| Failure behavior | Code committed / Preview build-verified | Exponential bounded backoff up to 60 seconds, manual refresh and visible stale/error banner; last successful data remains on screen |
| Animated counters | Code committed / Preview build-verified | Reuses existing MotionNumber; locale support adds en-IN digit grouping; reduced-motion behavior remains within the existing component |
| Multi-series trend chart | Code committed / Preview build-verified | Motion-driven SVG series for source opens, code copies, verified like actions and anonymous like actions; semantic theme variables; empty state and accessible daily data table |
| Uninstrumented metrics | Intentionally not displayed | Experiment detail views, preview starts and preview interactions remain absent until events are defined and recorded; no fake zero metrics are added |
| Authenticated refresh round-trip | Pending | Verify the owner dashboard updates after real accepted source/like/copy events, filters survive polling, stale state clears after recovery and no duplicate requests occur |
| Visual/accessibility QA | Pending | Verify desktop/mobile widths, zoom, focus, screen reader table, light/dark semantic contrast, reduced motion and chart readability with real data |
| Final HEAD Preview build | Pending | Functional build READY for e2673785bd882a0b787318e9551d49b8e9e9468b; cleanup-only HEAD 50b09ef3add5de456831e22955da77aa1f18fc70 has not been separately deployed because Vercel returned the free-plan daily deployment API quota limit (retry after 24 hours) |

The READY live-dashboard Preview was `dpl_2q1CRakZTVJw2QLMNUsDFL6EBThQ` at `e2673785bd882a0b787318e9551d49b8e9e9468b`. Next.js compiled successfully in 20.3 seconds; SEO validation reported zero warnings. The route manifest contained Analytics, Source Library and existing owner workspace/editor routes. The subsequent `50b09ef3...` commit only removes an unused icon import; no runtime behavior changes, but a separate deployment could not be created because Vercel's free-plan API deployment limit was reached.
### Phase 5 follow-up — rankings and per-experiment analytics — 2026-11-06

| Item | Status | Evidence / remaining check |
|---|---|---|
| Collection rankings | Code committed / Preview build-verified | Deterministic top-five source-open and code-copy rankings use the selected period; active-like ranking uses current state. Zero-value entries are omitted; ties resolve by title then slug |
| Experiment detail route | Code committed / Preview build-verified | `/admin/labs/analytics/[slug]` reuses the existing owner authorization and only resolves rows included in the published experiment catalogue |
| Detail API | Code committed / Preview build-verified | `GET /api/v1/admin/labs/analytics/:slug?days=7|30|90|365` returns aggregate experiment metrics, current active likes and UTC daily series; private/no-store and no event/user payloads |
| Metric boundaries | Code committed | Public experiment detail views and preview starts remain intentionally absent because those event types are not instrumented. Source opens are not labelled as views; active likes are labelled current state |
| Authenticated detail and ranking reconciliation | Pending | Verify with the owner account against real Atlas records; compare rankings to fixtures and confirm built-in/custom published experiments only |
| Detail page visual/accessibility QA | Pending | Test small/large screens, table alternatives, focus order, screen reader labels, contrast and zoom |

### Analytics unit-test coverage — 2026-11-06

- Added `npm run test:labs-analytics` using Node's built-in test runner; no third-party testing dependency was added.
- The normal `npm run build` now runs this suite before SEO validation and Next.js compilation.
- Six deterministic tests cover ranking order, tie-breaking, zero-value omission, limits, reporting period normalization, complete UTC daily buckets, invalid/reversed date bounds and published-custom artifact eligibility.
- Extracted pure calculations into `owner-analytics-utils.mjs` so the production aggregation and tests use the same functions.
- Custom published experiments are included only when the source is published and the ready artifact matches both the experiment slug and the exact published source version.
- The collection event aggregation now bounds both ends of the selected reporting period (`since <= occurredAt <= generatedAt`).

Local verification output: **6 tests passed, 0 failed**. The latest code/test-gating changes are committed after the READY ranking/detail deployment and still require a fresh Preview build.

### Additional authorization discrepancy found during audit

The current `src/app/lib/labs/owner-access.js` accepts either `LABS_OWNER_USER_ID` **or** `LABS_OWNER_EMAIL`, while the locked owner-identity decision in the source-management specification says `LABS_OWNER_USER_ID` only. This route-split slice deliberately does not remove the email fallback because doing so without checking the configured Preview environment could lock out the current owner. Reconcile the code and deployment configuration in the authorization verification phase before treating the owner-identity decision as enforced.

## 8. Preservation contract — non-negotiable

Every implementation PR in this plan must explicitly confirm:

- [ ] The four existing code-owned public demos and their public routes remain unchanged.
- [ ] Public Labs listing/detail, category filtering, likes, source CTA and verified-user source access remain functional.
- [ ] Guests and signed-in unverified users cannot access protected source; every verified account can access published source automatically.
- [ ] Owner access still depends on the server-side singleton `LABS_OWNER_USER_ID` and a verified session; no client role/email shortcut is introduced.
- [ ] Source inventory search, filters, refresh, source creation, open-workspace and guarded deletion remain functional.
- [ ] The source editor retains file add/import/edit/rename/delete/reorder, validation, unsaved-state warnings and the 40-file/size/path policies.
- [ ] Draft save remains explicit and does not publish; immutable version history and restore-as-new-draft remain intact.
- [ ] Preview, publish, unpublish, audit and concurrency protections are preserved.
- [ ] Custom experiment creation/deletion, runtime and media workflows are not replaced by metadata editing.
- [ ] No new owner-only imports, chart libraries or editor dependencies enter the public homepage/Labs listing critical bundles.
- [ ] Existing light/dark theme, Tailwind v4, Motion and reduced-motion conventions are preserved.
- [ ] All API responses retain correct private/no-store behavior and no sensitive event/source data is exposed.

A feature is not complete merely because its new screen renders. It is complete only when the preservation contract and the phase-specific gate pass.

## 9. Release and open decisions

### Locked for this plan

- Owner: singleton server-side `LABS_OWNER_USER_ID`; verified Better Auth session required.
- Source access: every verified account can read every currently published source; guests/unverified users cannot.
- Existing stack: Next.js App Router, JavaScript, Tailwind CSS v4, `motion/react`, MongoDB/Mongoose and current deployment platform.
- Initial live refresh: 10-second visible-tab polling with backoff and visibility pause.
- Animated number component: reuse the existing `MotionNumber`.

### Open; do not silently assume

1. Exact chart rendering implementation after accessibility/performance comparison; no chart library is selected by this plan.
2. Exact event definition and deduplication window for experiment detail views.
3. Preview-start success threshold and explicitly instrumented interaction allowlist; dependent on runtime lifecycle readiness.
4. Analytics retention, account-deletion treatment and production Privacy Policy review.
5. Whether/when WebSockets are justified, and which shared pub/sub/hosting provider would support reliable cross-instance delivery.
6. Whether historical aggregates for deleted/unpublished custom experiments should remain reportable and how they are labelled.
7. Exact update concurrency token for experiment metadata PATCH; it must be backed by persisted state and tested for stale writes.

Resolve these decisions in the owning specification/API contract before implementing the dependent phase.

## 10. Definition of done

The owner can move between Analytics and Source Library without losing route context; the Source Library opens the existing source editor; experiment metadata has its own safe edit workflow; and Analytics displays only correctly instrumented, aggregate data that refreshes while visible. Existing public Labs, source access, source editing/versioning/publication, runtime/media foundations and owner security remain intact.

This plan's execution log distinguishes committed code from verified behavior. A successful build and anonymous protected-route smoke test do not prove authenticated owner browser behavior, Atlas correctness, accessibility or production readiness. Production release still requires the explicit gates in this document and the linked source/runtime/security authorities.
