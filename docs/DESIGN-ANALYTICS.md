# Design Specification — Analytics Dashboard

**Status:** Product/design requirements; implementation pending  
**Related:** [PRD](./PRD.md), [Admin design](./DESIGN-ADMIN.md)

## 1. Purpose
Give the portfolio owner reliable insight into Lab discovery and engagement, without presenting estimates as exact people counts or implying actions prove downstream outcomes. Analytics are private to authorized admins. Personal user activity is separately scoped to the owning user.

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
- Like actions and net likes (likes minus unlikes, with definition visible).
- Full-source access events.
- Copy-code actions.
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
| `like` | Like state was successfully created/activated | A unique person for guest activity |
| `unlike` | Like state was successfully removed/deactivated | A negative rating |
| `source_access` | Authorized full-source response/access flow completed | Source was read or used |
| `code_copy` | Copy action was triggered/reported by the supported client flow | Code was pasted, executed or shipped |
| `preview_start` | Preview was successfully initiated under the agreed lifecycle definition | Preview completed successfully |
| `preview_interaction` | An explicitly instrumented supported interaction occurred | Every possible interaction or meaningful learning |

Only record successful server-confirmed state changes as likes/unlikes. Client-side attempted events should be distinguished from server-confirmed outcomes.

## 4. Metric definitions
- **Views:** qualifying `experiment_view` events after documented bot and deduplication rules.
- **Copy actions:** qualifying `code_copy` events; never label these “code usage.”
- **Like actions:** successful like state changes; distinguish current active likes from action counts.
- **Net likes:** successful like actions minus successful unlike actions within the selected interval. State whether this is period net change or current active total.
- **Source accesses:** successful authorized source access events, not client button clicks alone.
- **Preview starts:** events meeting the agreed successful-start threshold.
- **Copies per view:** qualifying copy actions divided by qualifying views for the same period/filter; define behavior when views are zero.
- **Authenticated activity:** events tied to a valid account under disclosed rules.
- **Guest activity:** events not tied to an authenticated account; cannot reliably identify a person across devices.
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
- Apply rate limits and bot/abuse safeguards.
- Avoid logging full source code, tokens, passwords, raw request headers or unnecessary personal identifiers.
- Guest likes are best-effort and not guaranteed unique or cross-device.
- Authenticated likes enforce one active like per user/experiment.
- Restrict analytics endpoints to authorized roles; prevent arbitrary query filters from accessing personal records.
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
