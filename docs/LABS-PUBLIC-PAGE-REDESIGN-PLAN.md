# Labs Public Page Redesign — Phased Plan

> **Supersession note (2026-11-07):** Sections 1–14 preserve earlier design/audit history and may refer to four code-owned demos or a combined built-in/custom public catalogue. Section 15 records the accepted source-only catalogue decision and is authoritative: current /labs lists only eligible published custom experiments. The public detail page is static/non-executable. Follow Section 15, Section 39 of LABS-AND-AUTHENTICATION-DESIGN-SPEC.md and pages/LABS-AND-OWNER-WORKSPACE.md for current behavior. Historical proposals are not implementation instructions.

**Status:** Phases 1–4 implementation committed. Hero/collection/pagination automated checks and production compilation have passed in an isolated build; database-index provisioning and browser visual QA remain pending. The hero viewport-fit refinement is recorded below. Hero Motion, statistics count-up and authentication-aware CTAs are included in scope.  
**Branch:** `feat/labs-platform-integration`  
**Updated:** 7 November 2026  
**Scope:** Public `/labs` discovery page.  
**Primary design authority:** [Component Lab Design Specification](./DESIGN-LAB.md)  
**Related implementation authority:** [Labs Experiment Studio — Runtime, Publishing and Media Contract](./LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md)

This plan redesigns the Labs landing/discovery experience while preserving the existing public data, publication, preview, engagement and authorization contracts. It does not authorize changes to the navbar, experiment detail page, owner/admin workspace, source permissions, publishing pipeline or runtime execution.

## 1. Goals

- Make the opening viewport memorable, illustrative and clearly identifiable as a frontend-experiment collection.
- Give the hero and featured-experiment sections separate jobs and a stronger visual hierarchy.
- Make the collection easier to scan, filter and explore across mobile, tablet and desktop.
- Make every visual/card correspond to an actual published experiment and its actual preview.
- Prevent artwork and card typography from clipping or overflowing inside responsive cards.
- Preserve accessibility, reduced-motion behavior, current portfolio tokens and the restrained radius system.
- Add scaling only when catalogue size and measured rendering cost justify it.

## 2. Current implementation audit

### 2.1 Route and composition

The public route is `src/app/labs/page.js`. It currently composes:

1. `LabsIntroduction` — headline, description, published-experiment count and active-discipline count.
2. `FeaturedExperiment` — a separate featured-experiment presentation.
3. `LabsCollection` — category navigation, result count, card grid and progressive loading.

The current shell is `src/app/components/labs/LabsPageShell.js`. It renders the existing shared `Navbar`.

**Navbar constraint:** The navbar, its component, layout, content, behavior, theme control and account controls are out of scope. The redesign may adjust the spacing of page content below it, but must not modify the navbar or replace it with a new Labs-specific header.

### 2.2 Real experiment sources

The route combines two approved sources:

- Four code-owned experiments in `src/app/data/labsExperiments.js`. Their runtime keys are allowlisted and lazily registered in `src/app/components/labs/runtime/registry.js`.
- Owner-created custom experiments returned by `getPublishedCustomLabExperiments()`. A custom experiment is eligible only when it is published, its source is published, and a ready immutable build artifact matches the exact published source version and artifact pointer.

The four current code-owned entries are:

- Magnetic Interaction
- Scroll-driven Text Reveal
- Gradient Bloom
- Generative Particle Field

A source workspace added to an existing built-in experiment does not create another gallery entry. A distinct custom entry appears only after its own publication and artifact eligibility checks pass.

### 2.3 Existing discovery behavior

- Categories are defined in `LAB_CATEGORIES`: Motion, CSS, Interactions and Creative Coding.
- The visible category list is derived from categories that actually occur in the published collection, plus All.
- Category filtering happens in `useLabCategoryFilter`.
- `useLabLoadMore` initially exposes six matching experiments and progressively reveals more.
- The category strip is a small fixed navigation set, not a large virtualized dataset.
- Cards use `LabExperimentPreview`; the public gallery does not need to mount the experiment runtime to show a card.

### 2.4 Preview and artwork behavior

The current media contract is owned by the Runtime and Media Plan:

1. Valid owner-promoted media bound to the current published release.
2. The generated screenshot/poster for that exact immutable release.
3. The existing Labs artwork or a neutral fallback.

The poster is generated during Build & Publish, not by running the compiler or experiment on the public listing request. Stale media from an older artifact/source version must never be shown as the current release preview.

The four code-owned demos may use their purpose-built `LabArtwork` illustrations when no published media/poster exists. A custom experiment must never be represented by a fabricated project or an illustration that falsely claims to show its output. If its valid preview is unavailable, use the approved neutral/unavailable treatment.

### 2.5 Problems visible in the current screenshots and code

- The hero is mostly a large text block and two metrics; it does not yet establish a distinctive visual identity for an interactive-experiment collection.
- The featured section reads as a conventional text-and-preview split and needs a stronger editorial presentation.
- The collection heading, category strip, result status and cards feel like separate basic blocks rather than one cohesive discovery experience.
- The second card's scroll-text artwork visibly clips. Its type scale currently relies on viewport width, so a three-column card can inherit text that is too large for its own preview container.
- Card previews need consistent internal spacing, legible metadata and predictable artwork bounds at each grid size.
- The initial six-item progressive reveal is reasonable for the current small collection, but it is not a server-side pagination strategy for an indefinitely growing catalogue.

## 3. Locked constraints and product rules

### 3.1 No fake cards or mock experiments

- Do not add placeholder projects, sample cards, invented titles, fabricated engagement values or hardcoded counts.
- The UI must render from the final eligible experiment collection supplied by the route.
- Built-in experiments are added, edited or removed through the code-owned catalogue and corresponding reviewed runtime implementation/registry—not by placing ad-hoc card markup in the page.
- A new code-owned runtime must have a real implementation and a valid catalogue definition. Its runtime key must be explicitly allowlisted.
- A new owner-created gallery entry must pass the published source + exact ready artifact/version eligibility gate.
- Creating or editing a source for an existing built-in entry must not silently create another card.
- If there are no eligible experiments, show a genuine empty state. If a real experiment has no usable visual, use the approved neutral/unavailable preview state; do not fabricate an experiment card.

### 3.2 One source of truth for the featured experiment

- The featured spotlight must resolve to an item in the same final published experiment collection used by the gallery.
- Keep an explicit, reviewable featured selection (initially the existing Magnetic Interaction item is eligible) but resolve it against the actual route data; do not maintain a second mock/duplicate experiment object.
- If the selected item is not eligible or no experiments are published, hide the spotlight or use a deterministic eligible fallback. Never render a made-up item.
- The spotlight and card use the shared preview selection policy so media precedence and stale-artifact protection remain consistent.
- The spotlight may reuse the same real experiment that appears in the collection. It must never create a second experiment record or a different title/description for visual effect.

### 3.3 Public previews remain non-executable

- Hero and featured artwork use static media, generated posters or approved code-owned artwork.
- Gallery cards and the featured spotlight must not mount the owner editor, compiler, an experiment React tree, an iframe or a Canvas animation loop.
- The public detail route and owner Run flow keep their existing separate behavior.
- Like/unlike continues to use the existing `LabLikeButton`, engagement API, optimistic reconciliation and accessibility state. Do not replace it with decorative counters.
- Poster capture, source access and publication rules remain unchanged.

### 3.4 Visual system

- Reuse existing portfolio colors, typography, spacing and theme tokens.
- Use Tailwind CSS v4 utilities and existing design tokens; do not introduce a new styling system or unnecessary custom CSS.
- Keep radii restrained. Avoid turning every control and card into a pill.
- Use the existing semantic text/border/surface/brand tokens in both themes.
- Motion should clarify hierarchy and interaction, not delay access to content. Respect reduced motion.
- The page must remain usable without hover, pointer effects or animation.

## 4. Proposed target composition

### 4.1 Hero — editorial identity plus illustrative field

Replace the current plain text-and-metrics composition with an asymmetric hero:

**Content side**
- A compact eyebrow that identifies the page as a frontend-experiment collection.
- A large editorial headline with one clear accent treatment.
- A short, specific explanation of what visitors can explore.
- One primary in-page action to reach the collection and one secondary action to reach the real featured experiment when available.
- A small dynamic collection summary. Published experiment and active-category counts must come from the route data, never from manually typed values.

**Illustrative side**
- A distinctive, lightweight visual field built with reviewed SVG/Tailwind/CSS primitives: grid, layered geometry, directional lines, nodes, light gradients and restrained motion.
- Its composition should relate to the portfolio's existing brand and to the ideas of motion, interaction and experimentation.
- It is a conceptual page illustration, not a fake project card and not a claim that a specific experiment is running.
- Do not use generic stock imagery, random dashboard UI, fake browser windows or fabricated project thumbnails.
- Where a real experiment preview is used as part of the composition, it must come from the eligible experiment dataset and shared preview policy.

**Layout behavior**
- Desktop: asymmetric two-column layout with intentional negative space and a clear focal point.
- Tablet: preserve the headline/artwork relationship without squeezing the text.
- Mobile: stack the copy and illustration, keep the headline readable, make the collection action easy to reach and avoid a tall empty hero.
- Adjust only page-content offsets below the existing navbar; navbar geometry and behavior stay untouched.

#### Hero motion system

The hero should feel intentionally animated, not like a collection of unrelated entrance effects.

- Use `motion/react` for coordinated entrance and state transitions. Reuse the project's `useReducedMotion` convention.
- Reveal the eyebrow, headline, supporting copy, actions and illustration in a small, ordered stagger when the hero enters. Keep travel distances short and durations restrained; the text must remain readable immediately.
- The illustration may use subtle layered drift/opacity or a restrained one-time reveal. Avoid continuous distracting loops, cursor-following effects, scroll hijacking, large parallax travel and animation that blocks interaction.
- The hero statistics must animate from the real initial state to their real values once when the statistics enter view. Use the shared `MotionNumber` visual language or a focused Labs stat wrapper. Any new initial-count animation must be opt-in; the default behavior of shared `MotionNumber` must remain unchanged for like counts and other existing consumers.
- Stats are real values: published experiment count and number of represented active categories from the eligible published array. Never animate to a placeholder number or an invented target.
- Count animation must be deterministic, bounded and triggered once per page view. It must not restart every time the user scrolls away and back.
- Respect `prefers-reduced-motion`: display the final values immediately, without count-up or stagger delay.
- Do not use `aria-live` to announce every animation frame. Expose the final numeric value and an accurate accessible label; decorative movement remains hidden from assistive technology.

#### Authentication-aware hero actions

The hero actions must reflect the actual Labs authentication state. Resolve the session on the server in the existing `/labs` request path and pass only the minimum safe auth state to the hero. Do not make the navbar the source of truth and do not modify its component, layout, loading behavior or account controls.

| Resolved state | Primary action | Secondary action |
|---|---|---|
| Guest / signed out | **Create account** → `/labs/signup?returnTo=%2Flabs` | **Sign in** → `/labs/login?returnTo=%2Flabs` |
| Signed in, email unverified | **Verify email** → `/labs/verify-email?returnTo=%2Flabs` | **Explore experiments** → collection anchor |
| Signed in, email verified | **Explore experiments** → collection anchor | **Explore featured experiment** → real featured slug, only when one is eligible |

Rules:
- Never show Sign in/Create account actions to a user whose session is already authenticated.
- Never show a Verify email action to a guest or verified user.
- When session resolution fails or remains unknown, show only the neutral in-page Explore action; do not flash guest CTAs or misclassify the visitor.
- Preserve safe local return navigation to `/labs` on auth routes. The auth pages remain responsible for registration readiness, provider availability, verification and redirect guards.
- Do not add an owner-only management CTA unless the route already has a reliable server-derived owner capability. Do not infer ownership from a client-side email or a hidden URL.
- The CTA group must remain useful when no featured item is available; omit the featured action and keep the collection action.
- Keep CTA labels and destination state consistent with the existing Labs auth routes. The navbar remains unchanged.

### 4.2 Featured experiment — real work as the focal showcase

Upgrade `FeaturedExperiment` into a deliberate editorial spotlight rather than a conventional image/card split.

- Use one actual eligible experiment from the final route collection.
- Give its preview a strong, stable stage with a predictable aspect ratio and enough room for the real image/poster/artwork.
- Present the real category, title, concise description, technology metadata and a clear Explore/Open action.
- Use typography, alignment, an index/eyebrow and a restrained accent rule to create hierarchy.
- Keep the preview image non-cropping and never stretch intrinsic media.
- Make the mobile order intentional: preview and content should not become an excessively long or disconnected sequence.
- Do not add fake ratings, view counts, badges, dates or popularity claims. Only show engagement or metrics when backed by current data and clearly labelled.
- Keep the detail route as the destination; this section is a discovery presentation, not a second runtime.

### 4.3 Collection — clearer navigation and more expressive cards

The collection should feel like a single discovery surface:

- A strong section heading and one short supporting sentence.
- A compact category-navigation row with the existing All, Motion, CSS, Interactions and Creative Coding choices, showing only categories that have real entries.
- Active state remains obvious without relying on color alone; retain keyboard access and clear pressed/current state.
- Counts, when shown, derive from the currently eligible list and update with filtering.
- Keep horizontal scrolling as the narrow-screen fallback for the small category set.
- Add search only when it can query real title/description/technology/tag fields with predictable behavior. Do not add unsupported sorting metrics.
- Use a responsive grid: one column on narrow phones, two on tablet/small desktop, and three on wide desktop unless the content width makes a different count more readable.
- Cards should have consistent preview frames, source-backed visuals, clear category/title/description hierarchy, technology metadata and the existing Like interaction.
- Give cards a restrained hover/focus treatment, not an unnecessary pile of transitions or decorative borders.
- Use a stable sequence label only if it represents the current real result order; it must not imply a fixed total when filtering or pagination changes that total.
- A no-results state must offer a clear way back to All/reset. The empty collection state is separate and must not pretend that unpublished entries exist.

### 4.4 Fix artwork sizing at the component boundary

The card clipping in the reference screenshot must be fixed as part of the visual redesign.

- Preview artwork typography must size against the preview container, not only the browser viewport.
- Use container-aware sizing or an equivalent component-level responsive constraint for the Scroll-driven Text Reveal illustration.
- Bound headline width, line count and vertical placement so every word remains inside the preview frame.
- Preserve the artwork's intentional composition on large cards while preventing overflow on three-column, two-column and mobile cards.
- Audit the other `LabArtwork` variants for the same viewport-relative sizing issue.
- Keep `overflow-hidden` as a final safety boundary, not as a way to conceal oversized text.

## 5. Category navigation and virtualization decision

### 5.1 Category navigation

Do **not** virtualize category navigation in this redesign.

The current category source contains four fixed categories plus All. Virtualizing five small controls would add complexity, create avoidable keyboard/focus problems and provide no meaningful performance gain. Keep it as a semantic, horizontally scrollable navigation/filter row.

If category taxonomy grows substantially in a future product change, reassess the control itself (searchable select/combobox or grouped filter panel) before considering virtualization.

### 5.2 Experiment card list

Do not add virtualization merely because the page uses a grid. The current collection begins with six visible items and can reveal more through the existing progressive-load hook.

Scaling sequence:

1. Keep the current progressive reveal for a small catalogue and refine its layout/empty states.
2. When the published catalogue becomes large enough that returning every custom experiment in the initial route payload is costly, move to bounded server-side cursor pagination with a stable sort/tie-breaker and validated category/search parameters.
3. Keep page size bounded (initial target: 18–24 cards) and provide an accessible Load more or URL-backed pagination path.
4. Profile card rendering after pagination. Consider grid virtualization only when a large in-memory result set (initial evaluation threshold: around 60+ currently loaded cards) produces measured render/scroll cost that warrants it.
5. If virtualization is adopted, use stable experiment slugs as keys, preserve keyboard focus and reading order, reserve preview aspect ratios, support browser find where feasible, and avoid breaking screen-reader navigation or direct links.

The 60-card value is an evaluation trigger, not a requirement to install a library. Measure first. Do not add a virtualization dependency during the initial visual redesign unless profiling proves it is needed.

## 6. Phased implementation

### Phase 0 — Design and data guardrails (this document)

- Confirm the public route composition and all real experiment data sources.
- Lock the existing navbar as out of scope.
- Lock the featured-item resolver and no-fake-card rules.
- Record poster/media precedence and the non-executable public-preview requirement.
- Define responsive, accessibility and performance acceptance criteria.

**Exit gate:** The page implementation can proceed without inventing content or changing a separate Labs subsystem.

### Phase 1 — Hero redesign

- Rework `LabsIntroduction` into the approved hero composition (keep the existing component name initially or extract a focused `LabsHero` component if that produces a cleaner responsibility boundary).
- Resolve and pass the minimum server-side auth state to the hero; implement the guest, signed-in-unverified, verified and unknown CTA matrix without editing the navbar.
- Add a coordinated, reduced-motion-aware hero reveal and one-time count-up animation for data-backed experiment/category statistics. Keep the shared `MotionNumber` default behavior unchanged.
- Create the lightweight, brand-aligned conceptual hero illustration.
- Connect the displayed counts to the exact eligible published collection.
- Add collection/featured anchors and meaningful focus/hover states.
- Keep `LabsPageShell`, `Navbar` and the global page-loader contract unchanged.
- Check hero height and copy/artwork balance at desktop, tablet and mobile breakpoints.

**Exit gate:** The first viewport has a clear visual focal point, useful content hierarchy and no fake project preview.

### Phase 2 — Featured experiment spotlight

<badge>Implementation committed — verification pending</badge>

Implemented:
- Added a pure featured resolver that selects the preferred slug from the final eligible collection and deterministically falls back to the first valid eligible item. It returns null for empty/invalid content.
- Replaced the separate featured display object with a selected slug; title, description, category, technologies and preview now come from the same actual experiment record passed to the gallery.
- Rebuilt FeaturedExperiment as an editorial spotlight with a large media stage, category, title, supporting description, technology list and one real detail-page action.
- Added restrained motion/react in-view reveal and reduced-motion handling.
- Reused LabExperimentPreview and its existing uploaded media → exact generated release poster → artwork fallback.
- Fixed the shared preview image onError callback so failed image media is recorded and the validated next fallback can be selected.
- Added tests/labs-featured-experiment.test.mjs and registered it as test:labs-featured-experiment in the production build sequence.
- Hero featured CTA now uses the resolved featured record, so it cannot point to an item that the spotlight does not render.

Still pending:
- Run the new featured-experiment test suite and existing public hero/media suites.
- Run lint and the full production build.
- Inspect a new Preview at desktop/tablet/mobile in both themes and reduced-motion mode.
- Verify missing preferred featured slug, no eligible experiment, broken uploaded media, generated poster and artwork fallback in the browser.

**Exit gate:** The section always presents a real eligible experiment or does not render; all preview fallbacks and responsive states pass browser verification.

### Phase 3 — Collection, categories and card presentation

<badge>Implementation committed — verification pending</badge>

Implemented:
- Reworked the collection heading, eyebrow, result context and category navigation as one continuous discovery section.
- Added data-derived category counts through `buildLabCategoryOptions()`; only categories represented by actual published experiments are shown. No placeholder categories/counts are introduced.
- Restyled category navigation as compact bordered controls with clear active state, count labels, keyboard focus and horizontal overflow on narrow screens. Category navigation is intentionally not virtualized.
- Rebuilt card composition with a consistent 4:3 preview, source-backed category/index overlay, restrained hover/focus affordance, improved typography/description rhythm and compact technology metadata.
- Added reduced-motion-aware in-view Motion reveals to cards; the reveal does not block interaction or content access.
- Preserved the actual `LabLikeButton` component, server-provided engagement, optimistic reconciliation and existing count behavior.
- Preserved the existing six-item progressive-load behavior and made the next batch size explicit in the Load more control.
- Added a distinct no-results state/reset action and retained the genuine empty-collection state.
- Applied container-query typography to the built-in Scroll Text, Gradient Bloom and Generative Particle artworks (plus a container boundary on the Magnetic artwork) to prevent viewport-sized text clipping inside cards.
- Added `tests/labs-public-collection.test.mjs` for data-backed category counts, real card links/likes, progressive loading, reduced-motion reveals and container-relative artwork; registered it as `test:labs-public-collection` in the production build sequence.

Still pending:
- Run the new collection suite, Phase 1/2 suites and existing Labs test suites.
- Run ESLint and a clean production build.
- Inspect real cards across desktop/tablet/mobile, both themes, narrow viewports and 200%/400% zoom.
- Verify long titles/descriptions, all four built-in artworks, source-backed custom preview media and the Like interaction in an authenticated/guest browser journey.

**Exit gate:** Cards are visually consistent and responsive; each card links to an eligible experiment and has no clipped content or fabricated data. Existing Like and progressive loading behavior must pass regression checks.

### Phase 4 — Catalogue scaling and discovery behavior

<badge>Implementation committed — verification pending</badge>

Implemented:
- Replaced the public route's unbounded custom experiment list query with an initial page of at most 18 eligible custom experiments plus the four code-owned built-ins.
- Added `GET /api/v1/labs` with a fixed 18-item page size, category allow-list, validated cursor, and no client-controlled page-size override.
- Added a server aggregation that first filters published custom experiment records by the validated category and stable keyset cursor, then joins the currently published source and the exact ready build artifact/version. Only eligible entries count toward the page limit or appear in the response.
- Kept the listing projection limited to public display metadata and approved preview/artifact fields. Source file contents, drafts and owner-private fields are not serialized by the public list endpoint.
- Added a stable keyset order of `publishedAt DESC, _id DESC`; `updatedAt` is intentionally not part of the cursor because it can change while a visitor paginates.
- Added cursor validation for encoded payload shape, ISO publication date, ObjectId and maximum length. Empty, malformed and oversized cursors are rejected.
- Applied the cursor match before source/artifact lookups to reduce work on subsequent pages. Added matching global and category compound indexes.
- Added an explicit `npm run db:ensure-labs-public-indexes` provisioning script so the production MongoDB indexes can be deliberately created and verified.
- Added full eligible custom category-count aggregation and merged those counts with built-in experiment counts. The hero count, collection total and category controls represent the full published collection—not only the first page.
- Added `useLabPublicCollection` to cache the initial/all page and category-specific pages, fetch the next cursor only when the local loaded items have been revealed, and preserve the six-card reveal cadence.
- Category navigation remains a small horizontally scrollable control and is not virtualized. Search, URL-backed filter state, speculative sort modes and a virtualization dependency were not added.
- Added `tests/labs-public-pagination.test.mjs` for cursor validation/order, server eligibility-before-limit, route bounds, initial-page wiring, client page fetching and index alignment. Updated collection tests for the paginated data hook and complete server counts; all new suites are included in the production build chain.

Still pending:
- Run `npm run test:labs-public-pagination`, `npm run test:labs-public-collection` and the full existing Labs test suite.
- Run `npm run db:ensure-labs-public-indexes` against the intended MongoDB environment and verify the indexes exist with the expected key order.
- Run an Atlas/MongoDB integration check with more than 18 custom records, same-timestamp records, null publication dates, multiple categories, stale/missing source versions and missing/not-ready artifacts. Confirm page boundaries have no duplicates or omissions and ineligible records do not consume page slots.
- Run `npm run lint`, SEO validation and the clean production build.
- Inspect the initial route payload and successive pages in a Preview deployment; validate category switching, repeated navigation/cache, failed page retry, Like loading for subsequent cards, mobile keyboard access and screen-reader result announcements.
- Profile a realistically large catalogue before considering any virtualization. The initial 18-item server page is a bounded query/payload target, not a guarantee that MongoDB aggregate latency has been measured.

**Exit gate:** Large catalogues remain bounded, ordered, eligible, accessible and free of duplicates/skipped entries; deployed indexes and database boundary cases are verified.

### Phase 5 — Visual QA, accessibility and release verification

- Verify desktop, tablet and mobile layouts, both themes and reduced-motion behavior.
- Check keyboard-only operation for category controls, search (if introduced), cards, Like and calls to action.
- Check visible focus, semantic names/status announcements, color contrast, text wrapping, 200%/400% zoom and narrow viewport overflow.
- Confirm no untrusted source runs in the listing, and that gallery/featured code paths do not load editor/compiler/runtime dependencies.
- Run the relevant Labs tests, lint, SEO validation and a clean Next.js production build.
- Deploy a new Preview for the exact branch commit and perform browser visual QA before declaring the redesign complete.

**Exit gate:** Automated and browser checks pass; no navbar, detail-page, authentication, publishing, source-access, Like API or owner-workspace regression is observed.

## 7. Target code areas

Expected first-pass files (final list may change after component design):

- `src/app/labs/page.js` — final published collection, featured-item resolution and minimal server-resolved auth state for hero CTAs.
- `src/app/components/labs/LabsIntroduction.js` or a new `LabsHero.js` — hero structure.
- A new focused hero illustration component under `src/app/components/labs/landing/`.
- `src/app/components/labs/FeaturedExperiment.js` — featured spotlight.
- `src/app/components/labs/LabsCollection.js` — collection layout, category strip and card presentation.
- `src/app/components/labs/LabExperimentPreview.js` — only if required to correct preview rendering/visibility behavior without changing the media contract.
- `src/app/components/labs/landing/LabArtwork.js` — container-safe built-in artwork.
- `src/app/hooks/labs/useLabCategoryFilter.js` and `useLabLoadMore.js` — only if the revised discovery behavior requires it.

Do not modify `src/app/components/layout/Navbar.js`, the Labs shell's navbar integration, detail page source access, admin/source management, compiler, runtime registry behavior, publishing APIs, like persistence or analytics contracts as part of the visual phases unless a separate approved issue explicitly requires it.

## 8. Non-goals

- No navbar redesign or navbar component edits.
- No fabricated sample projects or mock experiment records.
- No arbitrary new experiment/category entries added solely to fill empty space.
- No new experiment runtime or changes to the four existing built-in runtime implementations.
- No public execution of source code in hero/featured/gallery previews.
- No detail-page redesign, source-reader migration, admin redesign or analytics redesign.
- No changes to login, guest identity, likes, publication eligibility, artifact lifecycle or poster capture.
- No category-tab virtualization.
- No new virtual-list dependency without measured need.
- No stock imagery or third-party image dependency for the hero.

## 9. Acceptance checklist

### Content integrity
- [ ] Every experiment card is derived from the eligible published collection.
- [ ] The four built-in entries map to real code-owned implementations and allowlisted runtime keys.
- [ ] Custom entries require published source and an exact matching ready artifact/version.
- [ ] A source workspace for a built-in entry does not create a second card.
- [ ] Featured content resolves to a real eligible experiment or is omitted.
- [ ] Counts and result labels reflect the current filtered/published dataset.
- [ ] Hero statistics animate once from the correct initial state to the real published counts; reduced-motion users see final values immediately.
- [ ] Stats remain accessible and do not announce per-frame changes to screen readers.
- [ ] Guest CTAs show Create account + Sign in with safe returnTo values.
- [ ] Signed-in unverified users see Verify email + Explore experiments; verified users see discovery actions, never guest auth CTAs.
- [ ] Unknown session state never flashes or mislabels guest CTAs.

### Visual and responsive quality
- [ ] Hero is visually distinctive and illustrative without implying a fake experiment.
- [ ] Featured spotlight has a clear hierarchy and a real preview.
- [ ] Collection heading, categories and cards read as one coherent system.
- [ ] No artwork text or metadata clips at any responsive card width.
- [ ] Preview images preserve intrinsic proportions and media precedence.
- [ ] Navbar is visually and behaviorally unchanged.

### Interaction and accessibility
- [ ] Category filtering remains keyboard-operable and announces the selected state/results.
- [ ] No-results and empty states are distinct and useful.
- [ ] Cards and actions have visible focus and meaningful accessible names.
- [ ] Like/unlike behavior and server reconciliation remain intact.
- [ ] Reduced-motion users can access the same content and actions.
- [ ] Layout remains usable at narrow widths and 200%/400% zoom.

### Performance and regression
- [ ] Listing and featured previews do not mount source runtimes or compiler/editor modules.
- [ ] Media remains tied to the exact published artifact/version.
- [ ] No category virtualization or unnecessary list dependency is introduced.
- [ ] Server pagination is added only when catalogue size justifies it.
- [ ] Existing detail, admin, source, publish, poster, Like and analytics behavior passes regression checks.
- [ ] Lint, relevant tests, SEO validation, clean production build and new Preview browser QA pass.

## 10. Implementation status

This document is a plan and a set of constraints. No UI implementation phase is marked complete by creating or updating this file. Update each phase's status and evidence here as code, tests and Preview verification are completed. Production readiness must not be inferred from a Git commit alone.


## 11. Phase 1 implementation progress — 7 November 2026

**Status:** Code committed to `feat/labs-platform-integration`; acceptance and release verification pending.

Implemented:
- Replaced the text-and-stat-only introduction with a responsive two-column editorial hero. The existing `LabsIntroduction` component name and public route composition are retained.
- Added the lightweight `LabsHeroArtwork` SVG illustration. It uses a connected-node/interaction-field concept, existing theme tokens and a small one-time Motion reveal. It is decorative and does not represent a fabricated experiment or execute experiment code.
- Added coordinated `motion/react` entrance variants for the hero content.
- Added one-time, in-view statistic count-up using MotionValues and `useTransform`, avoiding a React state update on every animation frame. The values come from the real published experiment array and its represented category count.
- Added reduced-motion behavior: count values move directly to the final number and illustration/content transitions are disabled or reduced through the existing `useReducedMotion` provider convention.
- Extracted `getLabsHeroActions` into `src/app/lib/labs/hero-cta.mjs`; guest, unverified, verified and unknown states are explicit. Featured experiment links are restricted to safe internal `/labs/:slug` paths.
- Resolved the auth session on the server in `src/app/labs/page.js`. Auth runtime unavailability is classified as unknown, not as guest. Authentication destinations retain a safe `returnTo=/labs`.
- Added `tests/labs-public-hero.test.mjs` for CTA state mapping, internal featured-link validation, server auth classification, MotionValue/count-up safeguards and reduced-motion illustration behavior. Added this suite to the production build test sequence as `test:labs-public-hero`.
- Left `src/app/components/layout/Navbar.js`, its shell integration, the featured section, gallery, detail page, publication pipeline, likes and source access untouched.

Verification still pending:
- Execute `npm run test:labs-public-hero` in the repository checkout.
- Run ESLint for changed files and the full production build (which includes the existing Labs suites and SEO validation).
- Perform authenticated browser checks for guest, signed-in-unverified, verified and unknown/configuration-unavailable states.
- Visually inspect desktop/tablet/mobile and light/dark themes, keyboard focus, reduced motion, 200%/400% zoom, artwork bounds and hero-to-featured spacing.
- Confirm the existing navbar is visually and behaviorally unchanged in a Preview deployment created from the exact resulting branch commit.

No claim of passing tests, production build, browser QA or deployment is made by this source commit.


## 12. Phase 2 implementation progress — 7 November 2026

**Status:** Code committed to feat/labs-platform-integration; test, build and browser verification pending.

Changed:
- src/app/lib/labs/featured-experiment.mjs — pure featured resolver.
- src/app/data/labsExperiments.js — exports the chosen featured slug, not a copied featured display object.
- src/app/labs/page.js — resolves the featured record from the final combined built-in + eligible custom collection and passes the same resolved record to the hero CTA and spotlight.
- src/app/components/labs/FeaturedExperiment.js — responsive editorial featured spotlight with Motion reveal.
- src/app/components/labs/LabExperimentPreview.js — fixed the image error handler to call the existing fallback-state helper.
- tests/labs-featured-experiment.test.mjs — eligibility, fallback, route integration, reduced-motion and media-error regression coverage.
- package.json — added test:labs-featured-experiment to the normal build test sequence.

No navbar, gallery-card layout, category filtering, detail route, experiment runtime, compiler, publication, source-access, Like API or owner/admin workspace behavior was intentionally changed.

**Verification is not claimed:** No test, lint, build or browser Preview result is recorded as passed by these commits.

## 13. Phase 3 implementation progress — 7 November 2026

**Status:** Code committed to feat/labs-platform-integration; automated, build and browser verification pending.

Changed:
- src/app/components/labs/LabsCollection.js — collection hierarchy, category controls, result status, card composition, reduced-motion reveals, empty/no-results states and Load more presentation.
- src/app/lib/labs/category-options.mjs — derives category filter labels/counts from the currently eligible collection.
- src/app/hooks/labs/useLabCategoryFilter.js — uses the data-backed category helper and keeps current category filtering behavior.
- src/app/hooks/labs/useLabLoadMore.js — retains six-item batches and exposes the real next-batch size.
- src/app/components/labs/landing/LabArtwork.js — container-relative type sizing for artwork labels/headlines.
- tests/labs-public-collection.test.mjs — category, source integrity, Motion, artwork and progressive loading checks.
- package.json — adds test:labs-public-collection to the production build test chain.

Preserved: experiment slug identity, real data only, shared preview renderer, existing LikeButton/API/engagement data, category filter semantics, six-item progressive reveal, non-executable public previews and the unchanged navbar.

**Verification is not claimed:** The new tests, ESLint, production build, deployed Preview and browser visual/accessibility checks have not been run in this editing session.

## 14. Phase 4 implementation progress — 7 November 2026

**Status:** Code committed to feat/labs-platform-integration; automated tests, MongoDB index provisioning, integration checks, build and browser QA pending.

Changed:
- src/app/lib/labs/public-experiments.js — bounded eligibility aggregation and keyset page query.
- src/app/lib/labs/public-experiment-cursor.mjs — validated publication-date/ObjectId cursor.
- src/app/api/v1/labs/route.js — fixed-size public listing endpoint.
- src/app/labs/page.js — initial bounded page, full eligible counts and server summary props.
- src/app/hooks/labs/useLabPublicCollection.js — category page cache, server fetch, cursor continuation and six-card reveal.
- src/app/components/labs/LabsCollection.js — paginated collection state, category loading and retry feedback.
- src/app/lib/labs/category-options.mjs and src/app/hooks/labs/useLabCategoryFilter.js — server-complete counts in the category filter summary.
- src/app/lib/labs/models/LabExperiment.js — compound page/cursor indexes.
- scripts/ensure-labs-public-pagination-indexes.mjs and package.json — explicit DB index provisioning command.
- tests/labs-public-pagination.test.mjs and updates to tests/labs-public-collection.test.mjs — cursor, query, route and UI contract coverage.

Behavior preserved: built-in experiments remain code-owned and always included; custom records must match a current published source and exact ready artifact/version; page size is fixed server-side; category counts include the complete eligible collection; six cards are revealed per action; Like remains on its existing API; no category virtualization is introduced.

**Verification is not claimed:** No pagination test, DB index creation, Atlas integration test, production build, or browser Preview was executed by these commits. The explicit index provisioning command must be run in the intended DB environment before production release.

## 7. Hero viewport-fit refinement — 7 November 2026

The first-viewport review identified excess vertical spacing and an overly dashboard-like right illustration. Refine only the public Labs hero; keep the shared navbar and all routes/data/engagement behavior unchanged.

- On desktop, the hero should use a viewport-aware minimum height that accounts for the existing 78 px desktop navbar, with content vertically centered inside the available area.
- Reduce top/bottom padding, eyebrow-to-heading gap, copy gap, CTA gap and statistics spacing so the first viewport feels composed rather than vertically stretched.
- Keep the editorial two-line heading and existing real-data statistics/auth-aware actions. Reduce display sizing slightly at wide widths to maintain hierarchy without dominating the viewport.
- Replace the bordered/grid-and-caption illustration with a cleaner orbit/network composition: fewer rings and nodes, no dashboard frame, no invented labels or corner annotations.
- Use only restrained semantic brand tones. Orbit motion should be slow and local; reduced motion renders the illustration in a stable static state.
- The illustration remains conceptual and decorative. It must not resemble a fake experiment preview or add interactive functionality.
- Mobile remains content-first and naturally stacked, without forcing a viewport-height hero.

Acceptance: 1440×900 and 1920×1080 desktop first-view checks, tablet width, 390×844 mobile, both themes, reduced motion, keyboard action focus, no horizontal overflow and no navbar changes.


## 15. Public Labs source-only catalogue decision — 7 November 2026

**Status:** Locked requirement; implementation is committed in the source-only gallery changes.

The public `/labs` experience must contain only owner-managed MongoDB custom experiments that pass all existing publication gates:

1. `LabExperiment.kind === "custom"` and `status === "published"`.
2. Matching `LabSource` record with `published === true`, a valid `publishedVersionId` and `publishedArtifactId`.
3. Matching `LabBuildArtifact` with `status === "ready"`, the exact experiment slug and the exact published source version.

This supersedes the earlier Phase 0/4 note that included four code-owned catalogue demos. Legacy code-owned definitions and runtime modules remain available to owner-side migration/source-management tools, but are not part of public discovery.

- Hero statistics, featured selection, category counts, gallery cards and Load more results derive only from the eligible custom-source page.
- Public detail route `/labs/[slug]` resolves only through `getPublishedCustomLabExperimentBySlug`; a legacy code-owned-only slug returns not-found.
- Public sitemap Lab URLs derive from the same source + exact-ready-artifact eligibility query.
- `LabExperimentPreview` displays only owner-promoted release media, the exact-release generated poster or a validated source-derived thumbnail. It must not import or render `LabArtwork` or per-slug hard-coded artwork.
- If no valid source media exists, show a neutral “Preview media unavailable” state; do not fabricate an experiment image.
- The hero illustration is separate conceptual brand artwork, not an experiment preview. Its wrapper stretches to the grid track, uses a sparse abstract field and 68–92 second loops, and renders a static composition for reduced-motion users.

The source-backed slugs supplied for review (MagneticButton Component, Magnetic Interaction 2, Fluid Gradient Playground and SpotlightDock) should appear automatically when their MongoDB records satisfy the existing published-source/exact-ready-artifact checks. Do not hard-code their slugs or display metadata into the public page.

**Regression gates:** Public listing, detail, featured item, category counts, pagination and sitemap contain no code-owned experiment records; Likes remain keyed to actual source-backed slugs; no private source content is serialized in the listing; preview media is tied to the current release; navbar, source access, owner source management and publication behavior remain otherwise unchanged.
