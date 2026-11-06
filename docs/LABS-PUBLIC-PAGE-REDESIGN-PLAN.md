# Labs Public Page Redesign — Phased Plan

**Status:** Planning only — no public-page UI implementation is included in this document update. Hero Motion, statistics count-up and authentication-aware CTAs are included in scope.  
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

- Resolve the featured item against the final `experiments` array in `src/app/labs/page.js`.
- Remove the separate-data assumption where it could drift from the list of eligible experiments.
- Rebuild the spotlight layout around real preview media, category, title, description, technologies and one clear detail-page action.
- Verify the current featured built-in record and the no-eligible-feature state.
- Preserve the shared upload → generated poster → artwork media policy and stale-artifact checks.

**Exit gate:** The section always presents a real eligible experiment or does not render.

### Phase 3 — Collection, categories and card presentation

- Rework the collection heading, navigation spacing, count/readout and card grid as one coherent section.
- Keep the current four category definitions and derive visibility/counts from real entries.
- Improve card preview hierarchy, title/description rhythm, technology metadata and Like placement.
- Fix the Scroll-driven Text Reveal artwork clipping and audit all artwork variants for container sizing.
- Keep all previews static and media-only; preserve existing like/unlike and engagement error states.
- Add or improve loading/no-results/empty states only where current data flow needs them.

**Exit gate:** Cards are visually consistent and responsive; each card links to an eligible experiment and has no clipped content or fabricated data.

### Phase 4 — Catalogue scaling and discovery behavior

- Measure the route payload and card-rendering cost with the expected catalogue size.
- Keep the category navigation unvirtualized.
- If the catalogue has grown enough, introduce bounded server pagination with stable ordering and validated filters/search.
- Evaluate virtualization only after pagination and only if profiling demonstrates a real remaining rendering bottleneck.
- Add URL-backed filter/search state only with clear reset and back-navigation behavior.
- Do not introduce sort options that depend on unavailable or misleading engagement values.

**Exit gate:** Large catalogues remain bounded, ordered, accessible and free of duplicates/skipped entries.

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
