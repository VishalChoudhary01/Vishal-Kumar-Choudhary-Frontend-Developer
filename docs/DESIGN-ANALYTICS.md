# Design Specification — Analytics Dashboard

**Status:** Product/design authority. Dedicated Analytics/Source Library routes, custom published-experiment aggregation/source-event validation, metadata editor, create-to-workspace handoff, live polling dashboard, rankings and experiment detail route are implemented in code. The current four-series SVG chart is temporary and explicitly rejected as the final UX because it overlays unlike metrics on a shared scale and offers insufficient inspection. This document specifies its replacement: a lazy-loaded, single-metric Chart.js canvas column chart; compatibility and visual QA are pending. Authenticated owner refresh, Atlas reconciliation and visual/accessibility QA remain pending. Public experiment-view/preview instrumentation and global ranking by views remain incomplete. This document defines the analytics experience and metric semantics; delivery order is in [the Labs Owner Console plan](./LABS-OWNER-CONSOLE-ANALYTICS-AND-SOURCE-MANAGEMENT-PLAN.md).  
**Related:** [PRD](./PRD.md), [Admin design](./DESIGN-ADMIN.md), [Labs Owner Console plan](./LABS-OWNER-CONSOLE-ANALYTICS-AND-SOURCE-MANAGEMENT-PLAN.md)

## 1. Purpose
Give the portfolio owner reliable insight into Lab discovery and engagement, without presenting estimates as exact people counts or implying actions prove downstream outcomes. Analytics are private to the singleton owner/admin. For the first source-engagement release, reporting is aggregate per experiment and reporting period; it does not expose individual users' source-view/copy/like histories.

## 2. Dashboard structure
### Header and global controls
- Page title and concise explanation of the reporting scope.
- Date range selector with clear timezone and inclusive/exclusive boundary behavior.
- Optional comparison period only if its calculation is clearly defined.
- Segment filters: guest vs authenticated where measurable; experiment/category/technology where applicable.
- Explicit applied-filter summary and reset action.
- Loading, error and no-data states.

### Summary metric cards
At minimum, display the following where reliable event data exists:
- Experiment detail views.
- Current active likes per experiment, successful like actions and successful unlike actions.
- Successful source-viewer opens (distinct from public experiment detail-page views).
- Unique verified accounts that opened source.
- Code-copy actions after a successful Clipboard API write.
- Preview starts.
- Instrumented preview interactions.
- Copies per view or another explicitly defined engagement rate.
- Unique-like counts must be labelled according to the actual deduplication model, not assumed unique people.

Each card should include the selected date window, unit/definition and a link to relevant details when possible. Do not show fabricated zeroes while data is still loading or unavailable.

### Trend analysis
- Daily or monthly trends appropriate to the selected range.
- Choose aggregation intervals deterministically and label them.
- Keep chart scales, units and missing-data treatment clear.
- Provide an accessible table or text summary equivalent to every chart.
- Do not imply causation from a correlation or trend.

### Rankings
- Most viewed experiments.
- Most copied experiments.
- Most liked experiments/net likes, with definition visible.
- Optional engagement-rate ranking only with a minimum-sample rule to prevent tiny denominators from misleading.
- Link each row to the admin experiment record and, when published, its public detail page.
- Include enough context (views, copies, likes, period) to explain ranking.

### Experiment detail analytics
For a selected experiment:
- Views, likes/unlikes, source accesses, copy actions, preview starts and instrumented interactions.
- Trend over the selected period.
- Guest/authenticated split where measurable.
- Engagement rate formula and numerator/denominator.
- Event-data quality notes where deduplication or missing instrumentation affects interpretation.

## 3. Event definitions
Event names are conceptual until the event schema is approved. Store a consistent event identifier, event type, timestamp, experiment/content ID, relevant version where applicable, actor category (guest/authenticated/system), session or deduplication key where appropriate, and a validated metadata allowlist. Avoid collecting unnecessary personal data.

| Event | Meaning | Does not mean |
|---|---|---|
| `experiment_view` | A qualifying Lab detail view after the agreed deduplication rules | A unique human visitor unless separately justified |
| `like` | Verified account's current like state was successfully created/activated | A unique person for guest activity |
| `unlike` | Verified account's current like state was successfully removed/deactivated | A negative rating |
| `source_open` | A verified account successfully opened the protected source viewer and the published source response completed | A public detail-page view, proof source was read/understood, or source was used |
| `code_copy` | The client reported a successful Clipboard API write and the server accepted the idempotent event for a verified account | Code was pasted, executed or shipped |
| `preview_start` | Preview was successfully initiated under the agreed lifecycle definition | Preview completed successfully |
| `preview_interaction` | An explicitly instrumented supported interaction occurred | Every possible interaction or meaningful learning |

Only record verified-account likes/unlikes when the server confirms a state transition; a retry that leaves state unchanged must not create another event. Best-effort guest likes may be counted separately as anonymous `guest_like` / `guest_unlike` action events where the public mechanism reports them; do not claim unique people or cross-device identity. Source opens are logged only after a successful authorized source response. Client-side attempted events are never counted as successful copy outcomes.

## 4. Metric definitions
- **Views:** qualifying `experiment_view` events after documented bot and deduplication rules.
- **Copy actions:** qualifying `code_copy` events; never label these “code usage.”
- **Like actions:** verified-account server-confirmed state changes; distinguish current active verified likes from action counts. Report best-effort guest like/unlike actions separately where measurable.
- **Net likes:** successful like actions minus successful unlike actions within the selected interval. State whether this is period net change or current active total.
- **Source opens:** successful authorized source-viewer opens, not public detail-page views or source-button clicks alone. Deduplicate retries for one open using an idempotency key.
- **Unique verified accounts opening source:** distinct server-derived user IDs with at least one successful source-open event in the selected period; label this as accounts, not people.
- **Copy actions:** successful Clipboard API write acknowledgements accepted by the server for a verified account; do not call this code usage.
- **Preview starts:** events meeting the agreed successful-start threshold.
- **Copies per view:** qualifying copy actions divided by qualifying views for the same period/filter; define behavior when views are zero.
- **Verified-account source activity:** source-open and code-copy events are accepted only from a valid Better Auth session with `emailVerified === true`; verified likes are persistent account state.
- **Guest/unverified source activity:** guests and unverified users cannot open/copy source. Public guest likes may be recorded separately as best-effort actions where measurable and must not be treated as unique people.
- **Unique visitor/session estimates:** do not add until identifier, consent/privacy and deduplication rules are approved.

Metric names and formulas must be displayed or discoverable in the UI. Avoid combining events from incompatible definitions or version scopes.

## 5. Filtering and query behavior
- Date filters use a documented timezone and boundary convention.
- Content filters compose predictably; selected filters are visible.
- Sorting is deterministic, including tie-breaking.
- Pagination is server-driven for large result sets.
- Empty range and no-data are different from a failed query.
- Apply filters consistently to summary cards, charts, rankings and exported/detail rows.
- If the UI supports CSV export later, it requires a separate scope and privacy review; export is not assumed in MVP.

## 6. Data integrity, abuse and privacy
- Validate event type and payload server-side.
- Use idempotency/deduplication keys where appropriate.
- **Implemented:** source-open and code-copy ingestion applies an atomic MongoDB fixed-window quota per verified account and event type: 30 source opens/minute and 20 code copies/minute across experiments. HMAC-derived limiter keys avoid persisting raw user IDs in the quota collection; TTL cleanup removes the limiter record after 24 hours. A rejected request returns 429 with `Retry-After`; duplicate accepted event IDs do not consume quota.
- Avoid logging full source code, tokens, passwords, raw request headers or unnecessary personal identifiers.
- Public guest likes retain the existing best-effort browser-storage behavior where supported; they are not guaranteed unique or cross-device.
- Verified-account likes enforce one active like per user/experiment, using a unique state record. Repeated like/unlike retries do not inflate event counts. Guest-like events remain separate anonymous action counts.
- Restrict analytics endpoints to the singleton owner/admin. Return aggregate counts/trends by experiment and date range; do not expose raw event rows, user IDs or emails in the dashboard.
- Define analytics retention and deletion policy before production. Content version retention is unlimited, but that does not imply unlimited analytics/user-activity retention.
- Account deletion must follow the documented treatment of account-linked analytics and likes.

## 7. Visual and accessibility rules
- Reuse the admin visual system and existing design tokens; avoid introducing an unrelated chart theme.
- Use clear labels, units, restrained visual hierarchy and consistent number/date formatting.
- Do not encode meaning by color alone.
- Charts require keyboard-accessible controls where interactive and an accessible textual/table equivalent.
- Responsive layout should reflow cards and charts without clipped labels or forced horizontal page scrolling.
- Reduced-motion preferences must be respected; avoid decorative chart animation that obscures data.
- Include last-updated or reporting-window context where useful, but only when the backend can provide it accurately.

## 8. Performance
- Load charting code only on the analytics route and lazy-load heavy chart modules.
- Aggregate on the server/database rather than sending raw event histories to the browser.
- Add indexes based on approved query patterns after measurement.
- Bound date ranges and result sizes; use pagination and query timeouts.
- Never load analytics visualization dependencies on the public homepage.

## 9. Analytics acceptance checklist
- [ ] Every displayed metric has a written definition and a test fixture.
- [ ] Guest and authenticated events are separated where measurable.
- [ ] Client attempts are not confused with server-confirmed state changes.
- [ ] Copy actions are not represented as verified code usage.
- [ ] Filters apply consistently to cards, trends and rankings.
- [ ] Zero-data, partial-data, loading and query-error states are distinct.
- [ ] Trend/ranking calculations reconcile against known event fixtures.
- [ ] Charts have accessible text/table equivalents and responsive behavior.
- [ ] Rate limits, deduplication, privacy and retention are documented.
- [ ] Analytics code does not affect the public homepage bundle.


## 10. Labs implementation mapping

This section maps the analytics design to the current Labs code. Metric meanings, event rules, privacy limits, visualization accessibility and metric interpretation are defined above; do not restate or redefine them in another document.

### Current owner Analytics baseline

- The current owner page is `/admin/labs/sources`, where an analytics overview is rendered above the source inventory. This is a temporary combined presentation, not the target information architecture.
- `GET /api/v1/admin/labs/analytics?days=7|30|90|365` returns owner-only aggregate source engagement.
- The current model records source opens, successful code-copy reports, verified like/unlike state transitions and anonymous guest-like actions.
- The current dashboard renders summary cards, rankings, a four-series SVG trend component and an experiment table, with 10-second visible-tab polling. LabsEngagementTrendChart is temporary: all four measures share one Y scale, geometry is manually fixed at 960×280, ticks are sparse and there is no useful crosshair/tooltip inspection. It is not the accepted final chart UX; see Chart redesign — replacement plan below.
- The owner analytics aggregation now combines the code-owned published catalogue with `getPublishedCustomLabExperiments()`. A custom row is included only when its experiment is published, its source is published, and a ready artifact matches both the experiment slug and exact published source version. The same eligibility resolver is covered by a Node-native regression test; reconcile against real Atlas records before trusting production totals.
- Collection analytics now returns deterministic top-five rankings for source opens and copies in the selected period, plus current active likes. Ties are ordered by title and then slug; zero-value entries are omitted. Active-like ranking is current state, not period activity.
- `/admin/labs/analytics/[slug]` and `GET /api/v1/admin/labs/analytics/:slug` provide a private aggregate detail view for one published built-in or eligible custom experiment. It reports only measured source opens, per-experiment distinct verified accounts, copies, verified/anonymous like actions, current active likes and UTC daily trends. Preview build verification and authenticated Atlas reconciliation are pending.
- Experiment detail views, preview starts and preview interactions are requirements, not currently instrumented event types. They must not be represented as zero-valued live metrics.
- The project's `MotionNumber` component and `motion/react` are the existing count-animation foundation. Reuse them; do not add a second counter system.

### Target page ownership

- `/admin/labs/analytics` owns collection-wide metrics, trends and rankings.
- `/admin/labs/analytics/[slug]` owns the selected experiment's aggregate analytics (code and Preview build verified; anonymous detail return-path smoke test passed).
- `/admin/labs/sources` owns the source inventory only; it links to the existing source workspace and the metadata editor where appropriate.
- `/admin/labs/sources/[slug]` remains the source-code editing/version/publication workspace.

The inventory and source workspace must not become alternate analytics dashboards. See the [Labs Owner Console plan](./LABS-OWNER-CONSOLE-ANALYTICS-AND-SOURCE-MANAGEMENT-PLAN.md) for route ownership and phase gates.

### Live refresh interaction contract

The first live release now uses the existing owner analytics GET endpoint with visible-tab polling at a 10-second interval. It pauses while hidden, resumes on focus/visibility, prevents overlapping requests, aborts on unmount, preserves the last successful snapshot on failure, uses bounded backoff and exposes manual refresh plus a truthful last-updated/stale state. The same reporting period is applied to every request. This is code- and Preview-build-verified; authenticated event-to-screen refresh and browser QA remain pending.

The collection event query bounds both ends of the selected reporting window (`since <= occurredAt <= generatedAt`) to prevent future-dated events from inflating totals. Pure ranking, period normalization, UTC daily-series and custom-artifact eligibility helpers have a Node-native regression suite that runs before the production build. The previous READY Preview ran six tests; this branch now extends the suite to twelve cases covering actor attribution, active-like attribution, collection totals and source-event rate-limit policy. The latest rate-limited event-write changes require a fresh Preview build before being marked verified; authenticated Atlas reconciliation remains pending. The refresh transport must return the same normalized aggregate shape so a later push transport can be evaluated without rewriting charts. WebSockets are not required for the first release; any future upgrade must document hosting, cross-instance fanout, reconnect/replay, authorization and fallback behavior before adding infrastructure.


### Chart redesign — replacement plan (2026-11-06)

**Decision:** replace the current four-series SVG graph with a lazy-loaded **Chart.js canvas column chart**, showing one selected metric at a time. Use the direct chart.js package, not an additional React wrapper in the first implementation. Chart.js 4.6.1 is MIT-licensed and provides canvas rendering, bar charts, responsive sizing, axes and tooltip primitives. Keep the dependency isolated to the private Analytics route. This is a library decision for historical daily analytics; no package has been installed yet.

**Why the current chart is rejected**
- Source opens, copies and like actions can differ by orders of magnitude. Overlaying all four on one Y-axis makes lower-volume measures appear flat or invisible.
- The 960×280 SVG uses fixed plot geometry and hand-built path/tick placement rather than a chart scale/layout engine.
- There is no crosshair or useful point inspection readout; users must infer values from a sparse axis and open the table.
- Four line colours create legend work without helping the user compare the data correctly.
- “Live engagement trends” is misleading: the data is daily aggregation refreshed by polling, not a real-time event stream.

**Chart panel layout**
1. Heading: **Activity over time**. Supporting text states the selected metric, bucket grain and UTC timezone.
2. Metric selector: four native, keyboard-operable options — **Source opens**, **Code copies**, **Verified like/unlike actions**, **Anonymous like/unlike actions**. Selecting one replaces the active dataset and gives it its own Y scale.
3. Keep the existing page-level reporting-period control (7, 30, 90, 365 days). Do not render a second period/window control inside the chart.
4. Main canvas: one brand-coloured dataset, visible zero baseline, subtle horizontal grid, readable date ticks, integer Y-axis labels and a compact tooltip containing full date/range, metric name and exact value.
5. Point readout: when a point is hovered/tapped, show its date/range and count in normal HTML text. With no point selected, show the most recent bucket's date and value.
6. Keep the existing summary cards and rankings. Do not chart active-like state as a daily series: **active likes are a current snapshot**, not a daily event measure.

**Bucket and aggregation rules**
- 7, 30 and 90 day selections use one bar per UTC calendar date from the existing daily response.
- The 365 day selection groups daily rows into UTC weeks (Monday–Sunday). First/last partial weeks are clearly identified in the tooltip. Weekly values are sums of daily buckets; they must sum exactly to the selected period total.
- Preserve explicit zero-activity dates. A valid all-zero series is not the same as an empty or failed query.
- Validate values as finite, non-negative integers; sort by bucket start; reject duplicate/out-of-order dates in the pure transform rather than silently drawing a misleading sequence.
- Show only the four currently instrumented event metrics. Do not add experiment views, preview starts, preview interactions, rates or active-like history until those definitions/data exist.

**Chart.js implementation contract**
- Lazy-load the chart module only on the Analytics overview and experiment-detail routes; do not add chart code to public Labs or the homepage bundle.
- Load Chart.js through a small client-only adapter/component. Prefer core chart.js with only the required bar controller, bar element, category scale, linear scale and tooltip registered. No date adapter is needed for current UTC category labels.
- Use a dedicated, relatively positioned parent container and Chart.js responsive sizing. Keep a stable height; destroy the chart instance on unmount/rebuild and update the existing instance when period, metric or data changes.
- Set the Y scale to begin at zero, use integer tick formatting, no dual axis and no stacked series. The 365-day weekly view uses the same zero-based axis.
- Resolve chart/grid/text colours from active semantic theme tokens after mount. Do not hard-code a second independent light/dark palette or use success/error merely to colour neutral metrics.
- Use restrained transitions for metric selection or real data changes. Disable chart animation for reduced-motion preferences and avoid replaying an entrance animation after every 10-second poll.
- Tooltips are exact: dates in UTC, numbers in en-IN, no inferred percentages and no claims that a copy means code usage.

**Interaction and accessibility**
- The four metric controls are native buttons with aria-pressed, visible focus and keyboard access.
- Give the canvas an accessible name/description identifying selected metric and period. Retain an equivalent HTML table behind a labelled disclosure; it contains the same daily/weekly values and totals.
- The selected-point date/value readout is regular DOM text, not canvas-only text.
- Hover and touch inspection are optional. The table and metric controls remain usable without a pointer.
- Respect reduced motion, light/dark theme, 200% zoom and narrow mobile widths without page-level horizontal scrolling.

**Library comparison and fallback**

| Candidate | Assessment for this dashboard | Decision |
|---|---|---|
| Chart.js 4.6.1 | MIT; canvas renderer; standard categorical bar charts, zero-based axes, tooltips and responsive sizing; appropriate for daily/weekly historical counts | **Selected for implementation spike** |
| Liveline 0.0.7 | MIT canvas renderer and real-time scrubbing/multi-series support, but API is designed around a moving seconds-based live window; pre-1.0, and canvas has no built-in keyboard/ARIA data navigation | Keep as an option for a future true streaming/tick chart, not the daily historical graph |
| ApexCharts | Strong line/bar/time-series and built-in keyboard/ARIA support, but current redistribution terms can require OEM licensing for interactive charts embedded in products used by other people | Do not add until the exact deployment/use case is cleared against the current license |
| Hand-built Canvas 2D | Full visual control, but we would own axis ticks, date scales, hit testing, tooltips, resizing, high-DPI rendering, touch and accessibility fallback | Only fallback if Chart.js fails the spike; do not rebuild a chart engine prematurely |

**Implementation spike before package adoption**
1. Add the exact Chart.js version chosen at implementation time; record the lockfile and license. Do not add ApexCharts or Liveline in parallel.
2. Render fixtures for 7, 30, 90 and 365 day windows, including all-zero, sparse, spike, repeated-value and first/last partial-week cases.
3. Verify first/last selected dates remain visible, UTC labels do not drift by timezone, and 365-day weekly sums reconcile exactly with the daily table and API totals.
4. Verify zero baseline, integer ticks, one high-volume metric cannot flatten another, and tooltips match the exact table row.
5. Verify theme changes, resize, device pixel ratio 1/2, mobile touch, keyboard-only metric switching, table navigation and reduced motion.
6. Verify client-only loading under Next.js App Router, React Strict Mode mount/unmount, polling updates and no leaked chart instances/listeners.
7. Measure the private Analytics bundle and render/update cost with 365 daily inputs. If the spike fails correctness, accessibility or performance gates, do not ship the package; evaluate a small purpose-built canvas renderer with independently tested pure geometry utilities.

**Chart acceptance gate**
- [ ] One metric at a time; no unlike metrics share a Y-axis.
- [ ] Y-axis starts at zero and displays integer event counts.
- [ ] 7/30/90 daily and 365 weekly bucket rules are visible and documented.
- [ ] Weekly and daily aggregates reconcile exactly with API totals and the HTML table.
- [ ] Hover/tap inspection displays exact date and value.
- [ ] Empty, all-zero, loading, stale and error states are distinct.
- [ ] Keyboard, screen-reader equivalent, touch, reduced motion, light/dark and narrow-screen checks pass.
- [ ] Chart library is lazy-loaded and absent from public Labs/homepage bundles.
- [ ] No WebSocket, Redis or additional backend is introduced for chart animation.

### Custom experiment and instrumentation gaps

Before the richer chart and rankings are trusted:

1. **Code committed / Preview build-verified:** include code-owned experiments and published custom experiments whose source pointer matches a ready artifact in one slug-deduplicated server-side aggregation catalogue.
2. **Code committed / Preview build-verified:** allow published custom experiments through the protected source-event route only when the resolver confirms published status, source publication and a ready matching artifact; the event handler still requires a verified session and exact current source version. Atlas-backed event round-trip remains pending.
3. Add qualifying experiment-detail view instrumentation and a documented deduplication policy before showing view counts.
4. Add preview-start and preview-interaction events only after the isolated runtime exposes a reliable successful-start signal and a bounded interaction allowlist.
5. **Code committed / Preview build-verified:** return complete UTC calendar-date buckets for the selected rolling interval, including zero-activity days; the chart renders true zero-height bars. Keep timezone and bucket boundaries explicit.
6. Label collection-wide unique-account totals correctly: summing per-experiment unique verified accounts counts experiment-account pairs, not globally unique accounts.
7. Keep current active-like state separate from period like/unlike actions; report anonymous activity separately and do not call it people.

Do not fabricate/backfill events from page loads, historical deployment logs or existing source records. Newly instrumented metrics begin when the corresponding event path ships; communicate any coverage boundary in the dashboard.

### Visual and motion integration

Use existing semantic theme tokens and the admin design system. Keep series identities clear in both light and dark modes, use labels/markers in addition to colour, preserve tabular number formatting and provide a chart-equivalent table. Use `MotionNumber` for changed metrics and restrained `motion/react` transitions for actual chart data changes; do not replay full entrance animation on each refresh. Respect reduced motion and avoid layout shifts.

### Readiness status

- [x] Server-side owner aggregate endpoint exists for the initial source-engagement metrics.
- [x] Initial source-open, copy and like/unlike event records exist.
- [ ] Add qualifying experiment-detail view instrumentation and a documented deduplication policy.
- [ ] Instrument preview start/interactions after runtime lifecycle approval.
- [x] Separate Analytics and Source Library routes (Preview build verified; authenticated owner UI QA remains pending).
- [x] Add visible-tab 10-second polling, no-overlap/abort/backoff and truthful stale/error state (Preview build verified; authenticated refresh round-trip remains pending).
- [x] Add complete UTC date buckets including zero-activity days.
- [x] Existing four-series SVG baseline is code/build verified but explicitly temporary and rejected as the final chart.
- [ ] Replace it with the selected single-metric Chart.js canvas design after the compatibility spike and chart acceptance gate pass.
- [x] Add deterministic rankings for currently instrumented source opens, copies and current active likes (Preview build verified; authenticated Atlas reconciliation pending).
- [x] Add owner-only aggregate experiment analytics API and `/admin/labs/analytics/[slug]` detail page (Preview build verified; authenticated Atlas reconciliation pending).
- [ ] Add public experiment-view and preview-event instrumentation before ranking by views or showing those metrics.
- [ ] Verify chart accessibility, responsive layout, reduced motion and light/dark semantic contrast in an authenticated browser.
- [ ] Approve retention/account-deletion policy before production analytics release.
