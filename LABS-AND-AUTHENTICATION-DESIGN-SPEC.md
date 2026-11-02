# Labs & Authentication — Product and UX Design Specification

**Document:** `LABS-AND-AUTHENTICATION-DESIGN-SPEC.md`  
**Version:** 1.0  
**Status:** Consolidated design baseline  
**Consolidated on:** 2026-11-02  
**Scope:** Labs listing, experiment detail/workspace, protected source access, and Labs authentication UX  
**Companion architecture reference:** `DYNAMIC PORTFOLIO + LABS — PRODUCTION ARCHITECTURE IMPLEMENTATION` (currently available in the project Library as `Pasted text(9).txt`)

---

## 0. How to Read and Apply This Document

This file records the product and UX decisions made for Labs and its authentication experience. It is intended to guide a human developer or AI coding agent without allowing either to invent missing requirements.

### 0.1 Decision status labels

| Status | Meaning | Required handling |
|---|---|---|
| **LOCKED — USER SELECTED** | The user explicitly selected or approved this decision. | Implement as written. Do not reopen or silently alter it. |
| **LOCKED — RECOMMENDATION ADOPTED** | The user later instructed that remaining recommendations should be locked. This decision adopts the recommendation that had already been presented. | Treat as locked unless the user explicitly changes it. |
| **OPEN — DO NOT ASSUME** | The discussion did not provide enough information, and no recommendation was approved or adopted. | Do not choose a value, provider, policy, or implementation by guessing. Ask for a decision when the work reaches this dependency. |
| **DEFERRED** | Intentionally outside the current Labs-first scope. | Do not implement as part of the current work. |
| **REFERENCE / INHERITED CONSTRAINT** | A technical or architectural constraint comes from the existing portfolio architecture specification. | Preserve it unless the user explicitly changes the architecture. |
| **ILLUSTRATIVE ONLY** | Example copy, data, dimensions, or UI shown to explain a direction, not a final content decision. | Do not treat the example as production content or a fixed data value. |

### 0.2 Instructions for AI agents and developers

1. Read this document before designing or implementing Labs or its authentication screens.
2. Read the companion architecture reference before changing repository structure, API boundaries, database models, data flow, or infrastructure.
3. This document is a **product/UX specification**, not permission to begin implementation. Do not write or modify application code until the user explicitly authorizes implementation.
4. Do not replace, redesign, migrate, or regress the existing portfolio UI, interactions, animations, responsive behavior, SEO, or project-detail experience.
5. Keep the existing application in JavaScript. Do not introduce TypeScript or substitute the approved stack without explicit approval.
6. Do not invent an authentication provider, social provider, auth library, email service, session lifetime, password policy, authorization tier, route path, API schema, database schema, or Cloudinary upload policy where this document marks the item OPEN.
7. Do not interpret an example or illustrative wireframe as final production copy or content unless it is explicitly marked LOCKED.
8. Do not add Labs experiments to `portfolio.projects`. Labs is a separate domain.
9. Do not expose source code in public page data, listing payloads, server-rendered HTML, public caches, or anonymous API responses. Do not rely on CSS to hide source.
10. Do not require authentication for public Labs browsing or public experiment demos. Authentication and authorization are required only for protected functionality such as source access.
11. Keep the implementation defensive: absent optional media, absent controls, empty categories, missing optional content, or unavailable previews must not break the page.
12. Prefer the existing design tokens, typography, component conventions, Motion conventions, and responsive rules. Do not create a competing visual system for Labs or authentication.
13. If a new requirement conflicts with an existing architecture specification, do not silently resolve the conflict. Identify it, explain the impact, and obtain approval.
14. When a change is approved later, update this document and its decision/change log before implementing the change.

### 0.3 Decision hierarchy and known supersession

- The existing portfolio architecture reference remains the source of truth for the established technical architecture and portfolio-preservation constraints.
- This document is the source of truth for Labs presentation and authentication UX decisions recorded here.
- The user explicitly changed the work order: **complete Labs design/implementation before beginning CMS work**. Any older roadmap ordering that puts Admin/CMS ahead of Labs must not override this priority.
- An earlier decision proposed navigating directly from account creation to the Email Verification screen. That navigation was **superseded** when the user approved privacy-safe generic registration handling and a dedicated generic registration confirmation. The current Sign-up result is the generic confirmation state, not a visibly different state that reveals whether the email was already registered.
- The user instructed that remaining recommendations should be finalized. Accordingly, the previously recommended treatments listed as **LOCKED — RECOMMENDATION ADOPTED** below are now part of this baseline. Items with no recommendation or insufficient information remain OPEN.

---

## 1. Product Scope and Non-Goals

### 1.1 Purpose of Labs

Labs is a creative frontend experimentation space within the portfolio. It showcases focused experiments in motion, interaction, CSS, interface behavior, and creative coding.

Labs is not:

- A replacement for the professional Projects section.
- A generic dashboard.
- A long-form documentation archive.
- A public source-code repository.
- A requirement to sign in before browsing or using public demos.
- A CMS.

### 1.2 Projects and Labs remain separate domains

**Projects** demonstrate professional work and may contain case studies, contributions, engineering stories, showcases, and reflections.

**Labs** contain experiments, interactive demos, concise metadata, experiment-specific configuration, protected source access, and potentially separate analytics.

Do not put Labs records inside `portfolio.projects`, and do not flatten project case-study content into the Labs model.

### 1.3 Current priority

1. Finalize Labs product and UX design.
2. Implement and validate the Labs experience after explicit implementation authorization.
3. Complete the Labs authentication screens and required authentication behavior as part of the Labs scope.
4. Only after Labs is complete, begin CMS/Admin design and implementation.

**CMS/Admin is DEFERRED until Labs is complete.** Do not broaden the current scope into a CMS build.

### 1.4 Preserve the current portfolio

Changes for Labs must remain isolated and must not unnecessarily affect:

- The homepage and existing portfolio sections.
- Existing project listing and project-detail pages.
- Existing data structures and project stories.
- Existing visual design, typography, color tokens, responsive behavior, Motion, or Lenis behavior.
- Existing SEO metadata and route performance.

Do not perform a wholesale rewrite or migrate all portfolio content as a side effect of Labs work.

---

## 2. Technical and Architectural Guardrails

These are inherited from the companion architecture reference unless stated otherwise.

### 2.1 Existing stack

- Next.js App Router.
- JavaScript (not TypeScript).
- React 19.
- Tailwind CSS v4.
- Existing Motion integration (`motion/react`).
- Existing Lenis integration where already used.
- Existing portfolio UI components, tokens, and conventions.
- Express API and MongoDB are the target backend architecture described in the companion architecture reference.
- TanStack React Query is used where client-side server-state management provides value; it is not required for every server-rendered page.
- Cloudinary is the configured media-provider direction in the project context; exact Labs media workflows and upload authorization remain subject to the existing architecture and any later decisions.

Do not add replacement libraries or introduce extra dependencies without a demonstrated need and approval.

### 2.2 Architectural separation

The companion architecture establishes the general flow:

`Next.js UI → API client / React Query where appropriate → Express API → controller → service → repository → MongoDB`

Rules:

- React components must not connect directly to MongoDB.
- Do not put database queries inside React Query hooks.
- API functions call API endpoints; backend controllers call services; services call repositories.
- Keep database access out of UI components.
- Use Server Components where practical, particularly for SEO-oriented public content.
- Use Client Components only where interactivity, forms, Motion, or client-side state requires them.
- Do not turn the whole app into a Client Component.

### 2.3 Labs data and public/private boundaries

The companion architecture proposes a separate Labs domain and an illustrative Lab model containing concepts such as:

- `slug`, `title`, `description`, `category`
- `tags`, `technologies`
- publication/status and ordering metadata
- featured metadata
- thumbnail and preview references
- demo configuration
- source-access policy
- source-code data
- media references
- SEO metadata
- timestamps

This is a **conceptual model reference**, not a final schema. Do not finalize field names, field types, indexes, validators, API response shapes, or database relationships solely from the illustrative example.

Public Labs responses may contain only the metadata required for public listing/detail rendering and the public demo. They must not contain source code or private source metadata.

### 2.4 Source-code protection

The required security boundary is:

1. Public request returns public experiment metadata only.
2. A source request is made only when the user opens the protected source experience.
3. The server authenticates the request.
4. The server separately authorizes the account for that source.
5. Only after both checks pass may source content be returned.

Never:

- Include source code in the public `/labs` listing payload.
- Include source code in an anonymous Lab detail payload.
- Render source into HTML and hide it with CSS.
- Put source code in public caches or static output.
- Treat successful sign-in as proof of source authorization.

The architecture reference identifies an endpoint concept such as `GET /api/v1/labs/:slug/source`. Treat the exact route and API contract as an architecture reference until the API design is explicitly finalized.

### 2.5 Performance isolation

- `/` must not load Monaco, Lab source, Lab runtime, Lab video, or unrelated Lab-heavy dependencies.
- Existing project pages must not load Monaco or Lab-only dependencies.
- `/labs` must not load Monaco, all source files, all experiment runtimes, all videos, or all GIFs.
- `/labs` loads lightweight experiment metadata and optimized thumbnails/posters only.
- `/labs/[slug]` loads only the selected experiment runtime.
- Heavy dependencies are dynamically imported at the feature boundary.
- Monaco is dynamically imported only when an authorized user opens the source viewer. It must not be imported globally or in the Labs listing.
- Media is lazy-loaded where appropriate. Videos should use a poster first, avoid unnecessary preload, and not autoplay unless the individual experiment explicitly requires it.
- Avoid layout shift by reserving media/canvas dimensions and providing stable loading placeholders.
- Public metadata may be cached appropriately; protected source must never be publicly cached.

### 2.6 Media storage

- Do not store raw image/video binaries or large base64 payloads in MongoDB.
- Store media references/metadata in MongoDB; store actual media with the configured media provider.
- Images/video/posters are optional. Missing media must not create broken-image icons or break a page.
- Use responsive optimized media and dimensions/aspect ratios to prevent layout shift.
- Exact Cloudinary transformations, signed-upload workflow, folder naming, and asset schema are OPEN unless already specified elsewhere in the companion architecture.

### 2.7 Do not store presentation or executable logic in the database

MongoDB may describe structured content or a validated demo configuration, but frontend rendering and component implementation remain in application code.

Do not store executable arbitrary JavaScript or React component implementations in Labs content records as a substitute for a reviewed runtime architecture. Keep the experiment runtime loading mechanism explicit and code-owned.

---

## 3. Labs Landing Page — `/labs`

### 3.1 Page purpose and overall composition

The Labs landing page should communicate an editorial creative-experimentation identity and make it easy to discover experiments.

The selected direction is a **hybrid showcase**: a short editorial introduction, one featured experiment, and a structured experiment gallery.

The intended section sequence is:

1. Labs introduction / hero.
2. Featured experiment.
3. Category navigation and experiment gallery.
4. Short closing line or transition into the existing footer.

The exact hero heading, hero paragraph, gallery heading, closing copy, and final experiment content are not locked. Copy samples used during design (for example, “Experiments beyond the ordinary.” or “Experiments worth exploring.”) are **ILLUSTRATIVE ONLY**.

### 3.2 Category system

The following four primary categories are **LOCKED — USER SELECTED**:

| Canonical category | Short navigation label | Typical experiment focus |
|---|---|---|
| **Motion & Animation** | Motion | Parallax, text reveals, horizontal scroll, SVG animation, transitions, scroll-driven motion. |
| **CSS Experiments** | CSS | Masks, gradients, clipping, creative layouts, hover effects, and visual styling. |
| **Interface Interactions** | Interactions | Magnetic buttons, cursor interactions, draggable elements, tabs, and interactive components. |
| **Creative Coding** | Creative Coding | Particle systems, Canvas experiments, generative artwork, and visual simulations. |

Category rules:

- Every experiment has one primary category.
- Additional descriptive tags may be assigned independently.
- Technologies are separate metadata, not categories.
- Technology labels may include React, Next.js, JavaScript, Tailwind CSS, Motion, GSAP, Lenis, and others actually used by the experiment.
- Tags may include SVG, Parallax, Typography, Canvas, and similar descriptive labels.
- The default filter is **All**.
- Do not show a category with no published experiments.
- Category matching is based on the experiment's core purpose, not every technology used.

### 3.3 Category navigation appearance and behavior

- Editorial text navigation; do not render category pills, filled backgrounds, boxed tabs, or bordered button cards.
- Active category uses primary foreground and a persistent underline.
- Underline uses the existing accent token and a 2px thickness.
- Inactive categories use secondary foreground.
- Hover may subtly emphasize foreground; active underline remains visible.
- Use semantic, keyboard-operable controls and visible focus styles.
- Reduced-motion preferences must be respected.
- Desktop: keep categories in one row when they fit.
- Mobile: allow horizontal scrolling within the category navigation only; do not create page-level horizontal overflow.
- Selecting a category resets the visible count to the first six matching experiments.
- Selecting All resets the list to the first six experiments across all published categories.

### 3.4 Featured experiment layout

The featured experiment uses a **40:60 desktop split**:

- Left: editorial text/content, approximately 40%.
- Right: visual preview, approximately 60%.
- Text is left-aligned and vertically centered against the preview.
- Use the existing page container and spacing system.
- A 48px column gap and 64–80px section spacing were proposed as starting values; treat these as layout guidance, not hard-coded values if the existing container/system calls for a responsive adjustment.
- On mobile, content comes first and the visual follows.
- At tablet widths, stack when the split no longer has enough room.

Featured content hierarchy is **LOCKED**:

1. Eyebrow: `FEATURED EXPERIMENT`.
2. Category label.
3. Experiment title.
4. Short description (maximum two sentences).
5. `BUILT WITH` label.
6. Inline technology names separated by middle dots; do not use technology chips/pills.
7. One CTA: `Explore experiment ↗`.

The sample experiment name `Scroll-driven Text Reveal`, sample category `MOTION & INTERACTION`, and sample technology list used in the design conversation are **ILLUSTRATIVE ONLY**. They are not locked production content.

### 3.5 Featured preview frame

- Contained visual frame.
- 4:3 aspect ratio.
- No browser chrome, toolbar, fake browser header, or decorative controls.
- Artwork/media is edge-to-edge inside the frame.
- Caption, if needed, sits outside the frame.
- Use one subtle border and the portfolio's restrained radius.
- No default shadow.
- No inner padding around artwork.
- Preview is a static optimized image/poster on the listing page; do not initialize the actual experiment runtime there.
- Hover may scale media from `1` to `1.01` and subtly emphasize the frame border; frame dimensions must not change.
- Clip overflow to the frame; no layout shift.
- Do not independently animate the artwork on hover.
- Reduced motion disables the scale effect.
- Keyboard focus indication must not depend on hover.
- Touch must not depend on hover to reveal content.

### 3.6 Experiment gallery layout

- Use a uniform editorial grid; do not use masonry or mixed-size cards.
- Desktop: three columns.
- Tablet: two columns.
- Mobile: one column.
- Initial visible count: six experiments at all viewport widths.
- `Load more` appends the next six matching experiments without removing/reordering the existing visible cards.
- Display a count such as `Showing 6 of 18 experiments`.
- After loading more, update the count (for example, `Showing 12 of 18 experiments`).
- Hide Load More when all matching experiments are visible.
- Do not jump the page to the top after appending.
- When a category changes, reset to the first six matching items.
- The count must refer to the active filter's total, not the all-category total.
- Whether the first six / next six are obtained by client-side slicing or API pagination is an implementation/API decision, not locked here.

### 3.7 Gallery card structure and visual treatment

Each card is an open editorial card, not a permanent outer card panel.

Structure:

1. Dominant thumbnail (4:3).
2. Category label.
3. Experiment title.
4. Short description, capped at approximately two or three lines.
5. Inline technologies, with a maximum of three technology labels shown on the listing card. Additional technologies belong on the experiment detail page.

Visual rules:

- No permanent outer card border/background panel.
- Thumbnail may use a subtle boundary only where useful.
- Thumbnail fit depends on artwork: `cover` when crop is intended; `contain` when the full artwork must remain visible.
- Provide a designed fallback if a thumbnail is missing or fails.
- Do not autoplay video, GIFs, or experiment runtimes in the gallery.
- No image overlay controls, nested cards, decorative controls, or nested interactive controls.
- The entire card is one semantic link to `/labs/[slug]`.
- Do not nest other buttons or links inside the card link.
- Accessible name should be based on the experiment title and useful context.

Hover and focus:

- Card translates upward by approximately `-4px`.
- Thumbnail scales to approximately `1.02` within its clipped frame.
- Use subtle hover elevation/shadow only as appropriate to existing portfolio conventions.
- An arrow may translate approximately `3px`.
- Do not scale the whole card.
- Do not cause layout movement or reflow.
- Use existing Motion conventions; do not introduce another animation system.
- Reduced motion removes movement effects.
- Keyboard focus is clearly visible.
- Touch users can access all information without hover.

### 3.8 Landing page items not locked

- Exact hero headline and supporting paragraph.
- Exact gallery heading and description.
- Exact closing sentence.
- Identity and content of the featured experiment.
- Exact experiment list, thumbnail artwork, copy, and order.
- Exact card dimensions/gaps beyond the responsive grid and 4:3 media ratio.
- Final client-side vs API pagination strategy.

Do not invent production copy or experiment metadata to fill these gaps.

---

## 4. Experiment Detail Page — `/labs/[slug]`

### 4.1 Page purpose and content order

The experiment detail page is **interactive-first, not documentation-first**. Visitors should encounter the experiment, not a long technical article.

Intended order:

1. Introduction: category, experiment title, short description, and inline technologies.
2. Interactive demo/workspace.
3. Contextual controls/configuration, only when the experiment has useful controls.
4. Minimal explanation (for example, “How it works” or “About this experiment”).
5. Protected source access section.
6. Related experiments.

The exact title/description, content for a real experiment, and final section copy are authored per experiment; sample Magnetic Interaction/Pointer Calculation wording from the design conversation is illustrative only.

### 4.2 Introduction

- Show category, concise title, a one- or two-sentence description, and inline technology names.
- Avoid excessive metadata.
- Do not repeat the same description elsewhere on the page.
- Keep the visual hierarchy consistent with existing portfolio typography.

### 4.3 Workspace split

The selected desktop workspace arrangement is **70:30**:

- Experiment demo/canvas: approximately 70% of the workspace.
- Controls panel: approximately 30%, with a maximum width around 320px and a minimum target around 260px where space permits.
- The demo receives remaining available width.
- If the experiment has no useful controls, hide the controls panel entirely and let the demo use the available width.
- Mobile: demo appears first; controls follow beneath it.
- Do not force a controls sidebar for experiments with no controls.

### 4.4 Controls panel appearance

- Contained settings panel.
- Theme-aware secondary surface, softly contrasted from the page.
- Subtle thin border.
- Existing restrained radius.
- No default shadow.
- Inner padding approximately 16–20px.
- Compact heading and optional short description.
- Group controls through spacing and/or subtle dividers.
- Do not put each control into a nested card.
- Show only controls that materially affect the experiment.
- Possible control types include sliders, toggles, selects, color inputs, and numeric inputs, but only where the experiment needs them.
- Changes update the demo live.
- If the experiment is configurable, provide a Reset action at the bottom of the settings panel.
- Reset restores that experiment's defined defaults and updates the demo.
- Do not ask for confirmation for an ordinary settings reset.
- Do not show a reset control when the experiment has no configurable settings.
- Reset affects only the relevant experiment settings; it must not reset unrelated application state.

### 4.5 Experiment canvas

- Use a contained experiment canvas.
- Outer container has a subtle border, secondary neutral surface where appropriate, and restrained radius.
- No default shadow.
- No browser chrome, toolbar, or decorative header.
- The inner canvas background is experiment-specific; do not force one common background on every experiment.
- Experiment controls that belong inside the actual creative interaction may remain inside the experiment's own canvas area.
- Show a stable loading/placeholder state while the runtime initializes to prevent layout shift.

Supported aspect-ratio presets:

- `16:9`
- `4:3`
- `1:1`
- `3:4`

Responsive defaults:

- Desktop default: `16:9`.
- Mobile default: `4:3`.
- An experiment may override its ratio, including separate desktop and mobile ratios.
- Canvas width fills its demo column; height is derived from the selected ratio.
- Do not distort the experiment to fill an arbitrary fixed pixel height.

### 4.6 Canvas actions

Canvas actions are conditional and capability-based. Show only actions that are useful and supported by that experiment.

- **Restart:** restarts the experiment runtime/animation while preserving current settings.
- **Fullscreen:** show only when helpful and supported. Preserve composition/aspect behavior, allow Escape to exit, and restore the normal page layout on exit. Never enter fullscreen automatically.
- **Reset settings:** separate from Restart; only exists for configurable experiments and belongs in the settings panel, not duplicated in the canvas action row.
- Put canvas actions in a compact row below the canvas, not in a toolbar inside the canvas.
- Hide the action row when there are no supported actions.
- Actions must be keyboard-operable, visibly focused, and usable on touch.
- Reduced-motion preferences must be respected.

### 4.7 Minimal explanation

- One concise paragraph, ideally one or two sentences.
- Explain only what helps the visitor understand the experiment.
- No expandable technical documentation.
- No diagrams required by default.
- No code walkthrough.
- No long documentation sections.
- Do not repeat the intro description.

### 4.8 Related experiments

A Related Experiments section belongs after source access in the proposed page order.

**OPEN:** The detailed layout, number of items, ordering logic, matching rules, and whether the section can be omitted when there are no related experiments were not designed in this discussion. Do not invent these rules during implementation; use a defensive empty-state/omit decision only after confirming expected behavior.

---

## 5. Protected Source Access Experience

### 5.1 Public vs protected behavior

Anonymous visitors may:

- Browse `/labs`.
- View public experiment metadata.
- Open an experiment detail page.
- View and interact with the public demo.

Authentication and authorization apply to protected source functionality, not to public browsing or public demos.

### 5.2 Source access section appearance

- Compact bordered section.
- Theme-aware surface and subtle border.
- Existing restrained radius.
- Short heading and concise explanatory text.
- Primary action: `Sign in to view source`.
- Secondary action: `Create an account`.
- Preserve the current experiment/source destination through the authentication journey.
- No large promotional panel or oversized illustration.

### 5.3 Source authorization flow

1. User selects `Sign in to view source` or `Create an account`.
2. Preserve a validated internal return destination identifying the current experiment/source target.
3. If anonymous, complete the chosen authentication flow.
4. Email verification may be required after registration.
5. After verification, user manually signs in.
6. After successful sign-in, return to the preserved destination.
7. Server authenticates and separately authorizes the source request.
8. If authorized, load the protected source viewer.
9. If authenticated but unauthorized, show the Access Denied state below.

Do not automatically grant source access merely because account creation, email verification, or sign-in succeeded.

### 5.4 Protected source viewer and Monaco

- Source code is not loaded until the server confirms authentication and authorization.
- Monaco is dynamically imported only when an authorized user opens the source viewer.
- Do not load Monaco on the homepage, project pages, Labs listing, or ordinary experiment demo page.
- Do not send source in unauthenticated HTML, route data, public APIs, or metadata.
- Do not publicly cache source responses.
- Exact viewer controls, editor theme mapping, source-file navigation, copy/download behavior, and source-versioning strategy are OPEN unless specified in another approved design document.

### 5.5 Access Denied state

**LOCKED — USER SELECTED**

Copy:

- Heading: `Access not available`
- Description: `Your account doesn't currently have permission to view this experiment's source code.`
- Supporting status text may say: `You're signed in, but this source is not available to your account.`
- Action: `Back to experiment`

Visual treatment:

- Dedicated state in the source-access area.
- Small shield-alert icon.
- Theme-aware secondary surface.
- One subtle border and existing restrained radius.
- No heavy error panel, default shadow, or large illustration.

Behavior:

- Replace the protected source viewer; never render source behind the denied state.
- Keep the user signed in.
- Do not show Login or Sign-up actions.
- Public experiment page and demo remain accessible.
- No automatic logout or redirect.
- Back to experiment navigates to the public experiment detail page.
- Do not add `Request access` until a real access-request workflow exists.

**OPEN:** The actual policy that determines which account/role/entitlement is authorized for which source is not decided. Do not assume every authenticated user is allowed or that only a particular role is allowed.

---

## 6. Shared Labs Authentication Layout

### 6.1 Overall layout

**LOCKED — USER SELECTED:** Centered Focused Form layout with a contained form panel.

Use the same overall layout for:

- Login.
- Sign up.
- Forgot Password.
- Reset Password.
- Email Verification.
- Relevant confirmation, processing, and error states.

Do not use a split-screen editorial layout for authentication.

### 6.2 Shared page frame

The adopted shared layout is:

- Labs wordmark at the top-left.
- Theme control at the top-right.
- Centered authentication panel in the available page area.
- Footer/context label at the lower-left (for example, `LABS AUTHENTICATION`).
- `Back to Labs` link at the lower-right.

The exact icon/wordmark artwork and final footer microcopy should reuse the existing portfolio identity and theme controls; do not invent a new logo or theme system.

### 6.3 Centering and responsive behavior

- Full-viewport minimum height.
- Center the panel horizontally.
- Center vertically when available space allows.
- Panel height is natural; do not force a fixed height.
- If content exceeds the available viewport, allow natural page scrolling. Never clip or compress fields/content to preserve vertical centering.
- Desktop horizontal page inset: approximately 24px.
- Mobile horizontal page inset: approximately 16px.
- Mobile panel uses the available content width and appropriate inner padding.
- Respect mobile keyboard/short viewport behavior; form content must remain reachable.

### 6.4 Contained panel treatment

**LOCKED — USER SELECTED**

- Maximum width: **420px**.
- Theme-aware secondary surface.
- One subtle border.
- Existing restrained radius.
- No default shadow.
- Desktop inner padding: **24px**.
- Mobile inner padding: **16–20px**.
- No nested panels or decorative card layers.
- Existing portfolio font families, typography scale, color tokens, and light/dark theme rules.
- Use existing spacing and control conventions wherever possible.

### 6.5 Shared panel content rules

- Heading and description are centered.
- Form labels and input content are left-aligned.
- No extra eyebrow, promotional copy, or decorative illustration unless a specific screen calls for it.
- Keep the content focused and compact.
- A screen's state changes its content, not the overall page layout.

---

## 7. Shared Authentication Form Components and States

### 7.1 Input appearance

**LOCKED — USER SELECTED:** Clean Outlined Fields.

| Property | Specification |
|---|---|
| Width | Full available form width |
| Minimum height | 44px |
| Background | Theme-aware transparent/page-level surface |
| Border | 1px subtle neutral border |
| Radius | Existing restrained control radius |
| Horizontal padding | Approximately 12px |
| Label | Always visible above the field |
| Label-to-input gap | Approximately 6px |
| Text | Existing body typography |
| Placeholder | Secondary text color; never a substitute for the label |
| Shadow | None |

Do not mix outlined, filled, and underline field variants across authentication screens.

### 7.2 Input interaction states

Every relevant field must support:

- Default: subtle neutral border.
- Hover: slight border emphasis without changing dimensions.
- Focus: existing accent border.
- Keyboard focus-visible: a clear accessible focus indicator; do not rely on color alone.
- Invalid: semantic error border and inline error message.
- Disabled: visibly muted and non-interactive.
- Filled: normal foreground text without unnecessary additional decoration.

The intended custom focus treatment must preserve keyboard visibility and must not simply remove the focus outline with no accessible replacement.

### 7.3 Password visibility

**LOCKED — USER SELECTED**

- Show/hide control appears inside the password input.
- Clicking the eye reveals the password; clicking again masks it.
- Preserve the value, cursor position, and field focus.
- Use an accessible label that changes between `Show password` and `Hide password`.
- Toggling visibility must not change or submit the password value.
- Each password field has an independent toggle. In Reset Password, toggling one field must not affect the other.
- The toggle is keyboard-operable and touch-accessible.
- During submission, the toggle is disabled along with the other form controls.

### 7.4 Validation presentation

**LOCKED — USER SELECTED:** Inline field-level messages below the corresponding field.

- Place a concise message immediately below the field, approximately 4–6px spacing.
- Use the existing semantic error token and readable small text.
- Error border is semantic error color.
- A small alert icon may be used where useful; do not add decorative error backgrounds.
- Do not use a form-wide summary for ordinary field validation.
- Associate the message with the input using `aria-describedby` or an equivalent accessible relationship.
- Mark invalid fields semantically (for example `aria-invalid`).
- When several fields are invalid on submit, focus the first invalid field.
- Error content must remain readable in light and dark themes.

### 7.5 Validation timing

**LOCKED — USER SELECTED**

- Validate a field on blur.
- Validate all required fields on submission.
- Do not show premature errors before a field has been interacted with or the form has been submitted.
- Once an error exists, revalidate as the user corrects the value and clear it when valid.
- A field's error clears only when its validation succeeds.

### 7.6 Authentication-level error alert

**LOCKED — USER SELECTED:** Alert appears below the screen heading/description and above the first form field.

- Full form width.
- Subtle theme-aware error surface.
- Thin semantic error border.
- Existing restrained radius.
- Small error icon.
- Short title where useful and one concise explanatory message.
- No shadow.
- Use an appropriate accessible live-region/alert role when the message appears.
- Do not expose server internals, credentials, tokens, or account existence.

Persistence:

- Remain visible until the next submission or until the underlying issue is resolved.
- No automatic timeout.
- No default dismiss button.
- A new submission replaces the previous message.
- Remove it when the issue is successfully resolved.

### 7.7 Secondary links

**LOCKED — USER SELECTED:** Simple text links, not filled or outlined buttons.

- No button background, border, or pill styling.
- Use existing text/accent conventions.
- Accent emphasis on hover/focus and clear keyboard focus indicator.
- Underline may appear on hover; do not make the link look like a primary action.
- Use comfortable touch targets.
- `Back to Labs` is a separate navigation item in the shared page frame.

### 7.8 Primary authentication buttons

**LOCKED — USER SELECTED:** Filled accent button using the existing portfolio primary accent token. Do not invent an authentication-only accent color.

| Property | Specification |
|---|---|
| Width | Full available panel width |
| Height | 46px |
| Background | Existing primary accent token |
| Foreground | Theme-appropriate accessible contrast |
| Typography | Existing button typography, semibold |
| Radius | Existing restrained button radius |
| Shadow | None by default |
| Content | Centered label and optional spinner |

States:

- Default: filled primary accent.
- Hover: subtle accent emphasis; no size change.
- Pressed: slightly stronger accent treatment; no scale effect.
- Focus-visible: clear accessible focus ring.
- Disabled: visibly muted but readable.
- Loading: small spinner beside an action-specific label; button disabled.
- Preserve button dimensions across states to prevent layout shift.
- Respect reduced-motion settings.

### 7.9 Loading/submission behavior

**LOCKED — USER SELECTED**

- Keep the form visible while a request is processing.
- Show a small spinner and action-specific text (for example, `Signing in…`, `Creating account…`, `Sending reset link…`).
- Disable the primary button to prevent duplicate submissions.
- Temporarily disable all interactive fields and controls in the form: text inputs, password visibility controls, checkboxes, selects, and other form controls.
- Preserve all entered values while pending.
- When a request fails, restore controls and show the appropriate error.
- When successful, transition to the specified confirmation or destination.
- Do not replace the form with a full-page loading screen, modal overlay, or skeleton for ordinary submissions.
- Navigation outside the form is not automatically disabled by this rule.

### 7.10 Confirmation states

**LOCKED — USER SELECTED:** Use a dedicated confirmation state inside the same contained form panel for successful actions where the user needs feedback or a next step.

- Replace the completed form content, not the entire shared authentication layout.
- Use a subtle, simple success/email icon.
- Center heading and description.
- Keep copy short and action-oriented.
- Use the filled accent button when a primary next action exists.
- Use simple text links for secondary navigation.
- No oversized illustration, heavy celebration, or unnecessary animation.
- No automatic redirect unless explicitly specified for that flow. The flows in this document state when continuation is manual.

---

## 8. Login Screen

### 8.1 Heading and description

**LOCKED — USER SELECTED**

- Heading: `Welcome back`
- Description: `Sign in to access your Labs account.`

Existing portfolio heading/body typography, centered; approximately 8px spacing between heading and description. No eyebrow or decorative illustration.

### 8.2 Fields and order

- Email address.
- Password (with the shared show/hide control).
- `Forgot password?` link directly below the password input, right-aligned.
- Primary button: `Sign in`.
- Secondary line: `Don't have an account? Create an account`.

There is **no Remember me checkbox**. Session persistence is managed by the authentication system; absence of the checkbox does not mean permanent or short-lived sessions.

### 8.3 Forgot Password link placement

**LOCKED — USER SELECTED**

- Directly below the password field.
- Right-aligned.
- Remains right-aligned on mobile.
- Must not overlap a field-level validation message.

### 8.4 Login button and states

- Button label: `Sign in`.
- Loading label: `Signing in…`.
- Use shared filled button, loading, disabled, validation, and error rules.
- Generic credential failure example: title `Unable to sign in`; message `Check your email and password, then try again.`
- Do not reveal whether an email address is registered.

### 8.5 Sign-up link

Use simple text-link styling: `Don't have an account? Create an account`.

### 8.6 Social sign-in

**OPEN — DO NOT ASSUME**

The email/password Login form is defined, but the user did not choose whether social sign-in should be offered or which providers should be supported. Do not silently add or remove Google, GitHub, or any other provider. Provider layout, ordering, icons, callback behavior, and account-linking rules remain undecided.

---

## 9. Sign-up Screen

### 9.1 Heading and description

**LOCKED — USER SELECTED**

- Heading: `Create your account`
- Description: `Start using your Labs account.`

Use the shared centered heading/description typography and spacing.

### 9.2 Fields and order

**LOCKED — USER SELECTED**

1. Email address.
2. Password with show/hide control.
3. Short password helper text below the password field.
4. Required Terms of Service and Privacy Policy consent checkbox.
5. Primary button: `Create account`.
6. Secondary line: `Already have an account? Sign in`.

Do not add a full name, username, confirm-password field, Remember me checkbox, or additional profile fields unless separately approved.

### 9.3 Password helper text

**LOCKED — USER SELECTED:** Use concise helper text below the Password field; do not show a password strength meter.

- Example shown during design: `Use at least 8 characters.`
- Placement: immediately below the password input.
- Typography: small existing body text, secondary text token, no background.
- If a validation error exists, the error message takes priority over helper text; show the helper again after the error resolves.

**OPEN:** The actual password security policy (minimum length, maximum length, allowed characters, compromised-password checks, and any other rules) is not finalized. The example `8 characters` must not be treated as the final security policy unless the backend/security design confirms it. Helper text must match actual server-side enforcement.

### 9.4 Required legal consent

**LOCKED — USER SELECTED**

Label:

`I agree to the Terms of Service and Privacy Policy.`

- Checkbox is required and unchecked by default.
- Place below password helper/validation text and above Create account.
- Terms and Privacy Policy are separate links.
- Each link opens in a new browser tab.
- Use `noopener` and `noreferrer` (or equivalent safe link behavior).
- Opening either legal page must not toggle the checkbox.
- Preserve the original Sign-up tab and its input/checkbox state.
- Use the existing restrained checkbox style and accessible focus behavior.
- If unchecked on submit, block registration and show this inline message immediately below the checkbox: `Please accept the Terms of Service and Privacy Policy to continue.`
- Clear the consent error after the user checks the checkbox.
- Record the accepted Terms version, Privacy Policy version, and acceptance timestamp as part of the account-creation/audit design.

**OPEN:** Actual legal document content, URLs, versioning procedure, and legal review are not supplied by this design discussion. Do not create fake legal documents or invented links.

### 9.5 Sign-up primary action

- Label: `Create account`.
- Loading label: `Creating account…`.
- Use shared primary button and submission-disabled behavior.

### 9.6 Privacy-safe registration result

**LOCKED — USER SELECTED**

The public registration response must not disclose whether an email is already registered.

The Sign-up form is replaced by a dedicated confirmation state inside the same contained panel.

- Heading: `Check your email`
- Description: `If an account can be created with this address, you'll receive an email with the next steps.`
- Use a subtle email/check icon.
- Center heading and description.
- Do not show an inline duplicate-email error.
- Do not display `This email already exists` or reveal verification status.
- Do not automatically sign in.
- Do not automatically redirect.

**LOCKED — RECOMMENDATION ADOPTED:** Show a simple secondary text link `Back to sign in` beneath the generic confirmation. Do not add a second filled button unless a later approved flow requires it.

Security requirements:

- New and already-registered email submissions must produce the same user-visible response.
- Do not reveal account existence through response details, error wording, or distinguishable timing.
- Do not create duplicate accounts.
- Apply server-side rate limiting.
- The server may perform different private operations where necessary, but client-visible behavior must remain generic.

**IMPORTANT SUPERSESSION:** An earlier proposal to navigate every successful new registration directly to the Email Verification screen is superseded. The currently approved public UX is the generic registration confirmation state. Email verification remains a required account flow, but the exact delivery/verification email orchestration must preserve the generic response and is an implementation/security detail to finalize.

---

## 10. Forgot Password Screen

### 10.1 Heading and description

**LOCKED — USER SELECTED**

- Heading: `Reset your password`
- Description: `Enter your email address and we'll send you a link to reset your password.`

### 10.2 Form structure

- One field: Email address.
- Shared outlined input.
- Validate email on blur and submit.
- Primary button: `Send reset link`.
- Loading label: `Sending reset link…`.
- Disable email input and submit button during request.
- Secondary link `Back to sign in`, centered immediately below the primary button.

### 10.3 Privacy-safe reset result

**LOCKED — RECOMMENDATION ADOPTED**

After submission, replace the form with a dedicated generic confirmation state, regardless of whether an account exists for the submitted email.

- Heading: `Check your email`
- Description: `If an account exists for this email address, you'll receive instructions to reset your password.`
- Use a subtle email confirmation icon.
- Same contained panel, centered text.
- Secondary link: `Back to sign in`.
- No inline duplicate/unknown-account error.
- No automatic redirect.
- Never disclose account existence or verification status.
- Apply server-side rate limiting and avoid distinguishable response timing.

The server sends a reset message only where appropriate; the visible response remains generic.

---

## 11. Reset Password Screen

### 11.1 Heading and description

**LOCKED — USER SELECTED**

- Heading: `Create a new password`
- Description: `Choose a new password for your Labs account.`

The screen is available only through a valid password-reset flow.

### 11.2 Fields and order

**LOCKED — USER SELECTED**

1. `New Password` with visibility toggle.
2. Helper text below New Password only.
3. `Confirm New Password` with its own independent visibility toggle.
4. Primary button: `Update password`.

**LOCKED — RECOMMENDATION ADOPTED:** The primary button label is `Update password`.

The helper example from design was `Use at least 8 characters.` but the actual password requirements remain subject to the OPEN security policy. Confirmation field does not repeat the helper text.

### 11.3 Validation

- Both fields are required.
- New Password must follow the final server-side password policy.
- Confirm New Password must match New Password.
- Match validation follows the shared blur/submit timing rules.
- Mismatch message: `Passwords do not match.`
- Block submission while the values do not match.
- Clear the mismatch error when the values match.
- Each field's visibility toggle operates independently.

### 11.4 Invalid, expired, or already-used reset token

**LOCKED — USER SELECTED**

Replace the reset form with a dedicated error state in the same panel.

- Heading: `This link is no longer valid`
- Description: `This password-reset link may have expired or already been used. Request a new link to continue.`
- Primary action: `Request a new link` → Forgot Password flow.
- Secondary action: `Back to sign in`.
- No password form while token is unusable.
- Do not expose token details.
- No automatic redirect or repeated automatic retry.

### 11.5 Successful password reset

**LOCKED — USER SELECTED**

Dedicated confirmation state:

- Heading: `Password updated`
- Description: `Your password has been successfully updated. You can now sign in with your new password.`
- Primary button: `Continue to sign in`.
- Manual continuation; no automatic redirect or countdown.
- Do not automatically sign the user in.
- Clicking the button navigates to Login; the user signs in using the new password.

### 11.6 Session revocation after password reset

**LOCKED — USER SELECTED**

After a successful reset, revoke **all existing sessions** for that account across all devices and browsers.

- Invalidate server-side sessions/refresh credentials associated with the account.
- Old session credentials must be rejected by the server.
- Clear current-browser authentication cookies/state where applicable.
- Other open tabs/devices must lose protected access.
- Do not keep other sessions active.
- Do not automatically sign the current user in after reset.
- Treat the reset token as single-use.
- Clear sensitive authenticated client caches and ensure protected source cannot be reused from stale cache/history.

The reset confirmation screen remains visible after revocation.

---

## 12. Email Verification

### 12.1 Verification screen heading and description

**LOCKED — USER SELECTED**

- Heading: `Verify your email`
- Description: `Check your inbox and follow the verification link to activate your Labs account.`

### 12.2 Email address display

**LOCKED — RECOMMENDATION ADOPTED**

Show the destination email in a masked form when displaying it is useful for confirming where the message was sent.

- Do not display the complete email address unnecessarily.
- Example only: `vi••••@gmail.com`.
- The masking algorithm and behavior for short/unusual addresses are OPEN; implement a privacy-conscious masking helper rather than copying the sample literally.
- Do not let a masked address become an account-existence disclosure in generic registration/reset responses.

### 12.3 Resend verification email

**LOCKED — USER SELECTED:** 30-second cooldown.

Behavior:

- After a verification email is successfully sent, start a 30-second cooldown.
- While active, disable resend and show a countdown (for example, `Resend available in 00:30`).
- Update the countdown once per second.
- When it reaches zero, enable a text-link action such as `Resend verification email`.
- Do not automatically resend when the countdown ends.
- Clicking resend shows inline loading and prevents repeated submissions.
- On successful resend, restart the 30-second cooldown.
- On failure, show the shared authentication-level error alert.
- Server-side rate limiting is authoritative; a client countdown is only UX feedback.
- Repeated requests across tabs/devices must not bypass the server rate limit.
- Cooldown begins only after the corresponding email send succeeds.
- Resending preserves the verification context.

### 12.4 Verification token processing

**LOCKED — USER SELECTED:** Dedicated centered processing state in the same panel.

- Spinner centered above the heading.
- Heading: `Verifying your email`
- Description: `Please wait while we verify your email address.`
- No extra controls or progress bar.
- Keep visible until the server confirms success or failure.
- Do not expose token values/details.
- Do not allow duplicate verification submissions.
- Respect reduced-motion preferences.

### 12.5 Failed email verification

**LOCKED — USER SELECTED:** Dedicated error state replaces processing content.

- Heading: `This link is no longer valid`
- Description: `This verification link may have expired or already been used. Request a new verification email to continue.`
- Primary action: `Resend verification email`.
- Secondary action: `Back to sign in`.
- Resend uses the 30-second cooldown and server-side rate limiting.
- On resend success, restart the 30-second cooldown and provide clear success feedback without leaving the verification context. The exact success message and its placement are OPEN.
- On resend failure, show the shared authentication-level error alert.
- Do not expose token values or internal verification details.

Special case:

If the link was already used because the email had previously been successfully verified, show the verified success state instead of showing the invalid-link error.

### 12.6 Successful email verification

**LOCKED — USER SELECTED**

Dedicated success state:

- Heading: `Email verified`
- Description: `Your email address has been successfully verified. You can now sign in to your Labs account.`
- Primary action: `Continue to sign in`.
- Manual continuation; no automatic redirect or countdown.
- No automatic sign-in/session creation from verification alone.
- Clicking the button opens Login.
- If verification began from a protected-source journey, preserve the validated internal return destination through the subsequent Login flow.
- Otherwise, successful Login without a return destination goes to `/labs`.

### 12.7 Verification/account state distinctions

- Email verification is separate from authentication.
- A verified account is not automatically signed in.
- A verification link that is already consumed but whose email is verified should resolve to the verified state.
- An invalid/expired link that has not resulted in successful verification resolves to the dedicated invalid-link state.
- Exact email provider, token format, token lifetime, token storage, delivery retries, and verification endpoint contract are OPEN technical decisions.

---

## 13. Authentication Navigation and Session Behavior

### 13.1 Successful Login

**LOCKED — USER SELECTED**

- Redirect immediately after server-confirmed authentication/session creation.
- Do not show an intermediate `Signed in successfully` screen.
- If the user arrived from a protected experiment source, return to that validated internal destination.
- Otherwise, go to `/labs`.
- Re-check source authorization after return navigation.
- Only use validated internal return destinations. Reject external URLs and unsafe redirects.

### 13.2 Already-authenticated visitor opens Login or Sign-up

**LOCKED — USER SELECTED**

- If the user opens the Login route: redirect to the validated internal return destination or `/labs`.
- If the user opens the Sign-up route: same behavior.
- The literal route paths for Login and Sign-up are not finalized; `/login` and `/signup` are conceptual examples only.
- Do not flash/render a redundant authentication form before redirecting.
- Treat invalid/expired sessions as unauthenticated and show the requested form.
- Do not create redirect loops; reject Login/Sign-up routes as return destinations.

### 13.3 Logout

**LOCKED — USER SELECTED**

- Logout is immediate; no confirmation dialog.
- Invalidate the active server session.
- Clear authentication cookie/client authenticated state where applicable.
- Clear authenticated client caches.
- Redirect to `/labs` after successful server invalidation.
- Do not display a logout success page.
- If server invalidation fails, do not falsely report successful logout; show an appropriate error and handle remaining session state safely.
- Protected source must no longer be accessible after logout, including via stale browser history/cache.

### 13.4 Sign-out control and account menu

**LOCKED — USER SELECTED:** Sign out lives inside a compact account dropdown in the Labs header.

- Trigger: compact account icon button.
- Position: beside the theme control.
- Menu opens from and aligns to the right-side trigger.
- Theme-aware background, one subtle border, restrained radius, subtle elevation only where useful.
- Menu width target: approximately 220–240px.
- Full keyboard/touch accessibility.
- Outside click closes the menu.
- Escape closes and restores focus to the trigger.
- Menu closes when logout begins.

**LOCKED — RECOMMENDATION ADOPTED:** Keep the menu minimal. Its contents are:

1. Signed-in account email (not a fake hard-coded sample).
2. Divider.
3. `Sign out` with an icon.

Do not add My Labs, Account Settings, profile editing, or other menu destinations until a real feature is approved. The menu may show the email because the Sign-up form does not collect a name.

### 13.5 Session expiration

**LOCKED — USER SELECTED**

When session expiry blocks a protected action:

- Redirect to Login.
- Show an authentication-level alert with:
  - Title: `Session expired`
  - Message: `Your session has expired. Please sign in again to continue.`
- Preserve a validated internal return destination.
- After sign-in, return to that destination and re-check authorization.
- Clear stale authenticated state and caches.
- Do not automatically sign in again.

Public Labs browsing and public demos do not require authentication and must not be interrupted or redirected merely because an old session expired. Redirect only when protected access is attempted or an active protected view must be re-authenticated.

### 13.6 Cross-tab session synchronization

**LOCKED — RECOMMENDATION ADOPTED**

Synchronize authentication/session changes across open Labs tabs.

- When a user signs out in one tab, other tabs must clear authenticated UI state and prevent further protected actions.
- When a password reset revokes all sessions, every other tab/device must lose protected access.
- When a session expires or is invalidated, other tabs must recognize this before subsequent protected actions and clear stale auth state.
- Other tabs must not retain an authorized source viewer using stale client state.
- Public Labs pages and public demos remain usable; do not force a public page to redirect to Login simply because a session changed.
- When a tab is on a protected source view and the session becomes invalid, it must stop showing/using protected content and follow the session-expiry Login flow while preserving a validated return destination.
- Server session state remains authoritative; cross-tab messages are a notification/synchronization aid, not proof of authentication.

**OPEN:** Exact cross-tab transport (for example, BroadcastChannel, storage events, or another mechanism), polling/revalidation interval, and race-condition handling are implementation decisions. Do not choose one without examining the existing code and architecture.

### 13.7 Remember-me and session persistence

- No Remember me checkbox is shown on Login.
- Session persistence is automatic and owned by the authentication system.
- Do not infer that the session is permanent or short-lived.

**OPEN:** Session lifetime, idle timeout, absolute timeout, refresh strategy, cookie flags/domain/path, revocation storage, concurrent session policy, and reauthentication requirements have not been finalized. The companion architecture recommends secure HTTP-only cookies where appropriate; that is a preferred security direction, not a complete session design.

---

## 14. Authentication Flow Summaries

These flows summarize the approved UX. They do not define endpoint contracts, token formats, or a specific authentication library.

### 14.1 Registration

```text
Sign-up form
  → validate email/password/required consent
  → submit
  → server handles account creation and privacy-safe duplicate handling
  → show the same generic Check your email confirmation
  → user follows the appropriate email instructions
  → email verification processing
  → Email verified confirmation
  → user manually opens Login
  → sign in
  → validated return destination or /labs
```

The UI must not reveal whether a submitted email already exists. Exact server-side handling and email orchestration must preserve this generic behavior.

### 14.2 Login

```text
Login form
  → validate
  → submit (disable all form controls while pending)
  → server authenticates and creates/establishes session
  → on failure: stay on Login and show authentication alert
  → on success: immediately redirect to validated return destination or /labs
```

### 14.3 Forgot Password and Reset Password

```text
Forgot Password form
  → submit email
  → show same generic Check your email confirmation
  → user opens valid reset link
  → validate token
      ├─ invalid/expired/used: dedicated invalid-link state
      └─ valid: Reset Password form
             → validate New Password + Confirm New Password
             → update password
             → revoke all existing sessions
             → Password updated confirmation
             → manual Continue to sign in
             → Login
```

### 14.4 Protected source access

```text
Public experiment detail
  → Sign in to view source / Create an account
  → preserve validated internal experiment/source return destination
  → authenticate (and verify email if required)
  → after verification, user manually signs in
  → return to experiment/source target
  → server authenticates and separately authorizes
      ├─ allowed: return source; dynamically load source viewer/Monaco
      └─ denied: dedicated Access not available state; keep public demo usable
```

### 14.5 Session expiry/logout/password reset

```text
Logout or session revocation/expiry
  → server session becomes invalid
  → notify/synchronize other tabs
  → clear stale authenticated state/caches
  → block protected-source access
  → if user is on/attempts protected access: Login + session-expired message
  → after sign-in: validated return destination
  → public Labs browsing remains available without authentication
```

---

## 15. Accessibility, Responsive Design, and Motion Requirements

These requirements apply across Labs and authentication.

### 15.1 Accessibility

- Use semantic links for navigation and buttons for actions.
- Entire gallery card must be one link; no nested interactive elements.
- All forms have visible labels.
- Link/checkbox/button/control interactions must work by keyboard and touch.
- Show visible focus indicators that are not dependent on hover or color alone.
- Associate validation errors with their fields.
- Announce authentication alerts and confirmation/status changes appropriately to assistive technology.
- Maintain usable contrast in light and dark themes.
- Do not use placeholder text as the only field label.
- Do not rely on hover to reveal essential content.
- Fullscreen has an explicit accessible exit path and Escape support.

### 15.2 Responsive behavior

- Preserve existing portfolio breakpoints/container conventions where possible.
- Avoid page-level horizontal overflow.
- The Labs category navigation may scroll horizontally within its own region on mobile.
- Featured experiment stacks on narrow screens with copy before visual.
- Gallery: 3 desktop / 2 tablet / 1 mobile columns.
- Experiment detail: demo before controls on mobile.
- Authentication panel remains within mobile side insets and can scroll when content or keyboard requires it.
- Do not clip long form content to maintain vertical centering.

### 15.3 Motion and reduced motion

- Reuse the existing Motion conventions.
- Do not introduce an independent animation library/system.
- Keep hover/entrance effects restrained and avoid layout shift.
- Honor `prefers-reduced-motion` for hover scale/translation, state transitions, and loading animation where possible.
- No interaction may depend on motion to communicate a state.
- Preserve the existing Lenis setup; do not apply a new scroll behavior globally as part of Labs without approval.

---

## 16. Explicitly OPEN Decisions — Do Not Assume

The following items were not finalized by the discussion. They require an explicit decision or a separate architecture/security design before implementation reaches them.

### 16.1 Authentication product and provider decisions

1. Whether social sign-in exists at all.
2. If social sign-in is approved, which providers (Google, GitHub, or others) are supported.
3. Authentication provider/service/library and account-linking behavior.
4. Email delivery provider/service, sending domain, templates, retry and bounce handling.
5. Verification token format, token lifetime, single-use storage, resend/replay semantics, and verification endpoint design.
6. Password-reset token format, lifetime, single-use storage, and endpoint contract.
7. Exact authentication route paths for Login, Sign-up, Forgot Password, Reset Password, and Email Verification.
8. What happens when an unverified account attempts to log in (copy, resend path, and whether access is blocked until verified).
9. Account deletion, email change, password change outside reset, and recovery/support flows.
10. Session lifetime, idle/absolute timeout, refresh strategy, cookie settings, and concurrent session policy.
11. The exact cross-tab transport and revalidation strategy.
12. Exact masking algorithm for displayed email addresses.
13. Exact maximum/minimum password requirements and breached-password policy.
14. Exact rate limits/cooldowns for sign-up, Login, reset requests, verification resends, and failed attempts beyond the approved 30-second client resend cooldown.

### 16.2 Authorization decisions

1. Which roles/entitlements are authorized to view each experiment's source.
2. Whether source authorization is global, per experiment, role-based, allowlist-based, or entitlement-based.
3. Whether account age, verification status, admin role, or another condition changes source permission.
4. Whether a user can request access in the future (no Request access action is included now).
5. Exact unauthorized API response/status handling and security logging policy.

Do not assume that authentication means authorization.

### 16.3 Labs content and visual decisions

1. Exact landing hero heading, paragraph, gallery heading, closing line, and final copy.
2. Actual featured experiment selection and its production metadata/thumbnail.
3. Experiment list, order, publish status, and category assignments.
4. Related Experiments section layout, quantity, matching/order logic, and empty behavior.
5. Per-experiment demo behavior, control configuration, canvas background, ratio override, supported actions, and runtime strategy.
6. Final source viewer layout, editor controls, copy/download features, and code-file navigation.
7. Exact final aspect dimensions, spacing, and typography values where only guidance is recorded.
8. Whether load-more uses client-side slicing or server/API pagination.
9. Whether any individual experiment needs video, GIF, or autoplay (listing autoplay is not allowed; detail behavior must be decided per experiment).

### 16.4 Backend/data/operations decisions

1. Final Labs MongoDB schema and indexes.
2. Final endpoint list, request/response contracts, validation rules, error codes, pagination model, and API versioning.
3. Authentication/user schema beyond the conceptual architecture model.
4. Exact session store/revocation mechanism.
5. Cloudinary folder conventions, transformations, responsive media strategy, signed upload flow, and ownership metadata.
6. Lab source storage/versioning strategy (inline source snapshots vs repository integration, and any version model).
7. Analytics event scope, consent/privacy policy, retention, and aggregation.
8. Cache policy for Labs metadata, experiment detail data, demos, and source.
9. Deployment/environment configuration and secret rotation status.
10. Actual implementation milestones, release order, and measurable performance budgets.

### 16.5 Legal and consent decisions

1. Actual Terms of Service and Privacy Policy content and URLs.
2. Document versioning and publishing/review workflow.
3. Applicable legal/compliance requirements and consent retention duration.

Do not invent legal terms or URLs.

---

## 17. Deferred Work and Explicit Non-Goals

- **CMS/Admin:** DEFERRED until Labs is complete. Do not build CMS screens, content editors, admin dashboard, or bulk-management flows as part of the current Labs design scope.
- **Portfolio migration:** Do not migrate all existing static portfolio data as a side effect of Labs work.
- **Project redesign:** Do not redesign existing portfolio or project-detail pages.
- **Full Lab version history:** Architecture reference suggests keeping the service layer future-ready, but do not implement full versioning until required.
- **Advanced account profile/settings:** Not in the account menu or current authentication UX.
- **Favorites/saved experiments:** Not selected for the current scope.
- **Request-access workflow:** Not selected; no button until a real workflow is designed.
- **Long-form experiment documentation:** Explicitly not the desired detail-page direction.

---

## 18. Quality and Acceptance Checklist

Use this checklist before considering Labs design/implementation complete. A checked design rule does not prove implementation passed; implementation evidence is still required.

### 18.1 Portfolio preservation

- [ ] Existing homepage UI, content, SEO, responsive behavior, Motion, and Lenis remain intact.
- [ ] Existing project listing/detail pages remain intact.
- [ ] No Labs runtime, Monaco, source, or Lab media appears in homepage initial loads.
- [ ] No unnecessary portfolio bundle growth from Labs dependencies.

### 18.2 Labs listing

- [ ] Four approved categories and short labels are used consistently.
- [ ] All is the default filter.
- [ ] Empty categories are not displayed.
- [ ] Each experiment has exactly one primary category.
- [ ] Featured section uses 40:60 desktop layout and stacks appropriately.
- [ ] Featured preview is a static 4:3 optimized visual, not a live runtime.
- [ ] Gallery uses 3/2/1 responsive columns.
- [ ] First six items shown initially.
- [ ] Load More appends six and updates count correctly.
- [ ] Category change resets to first six matches.
- [ ] Cards are one semantic link with no nested controls.
- [ ] No gallery autoplay, live runtime, Monaco, or source payload.
- [ ] Missing thumbnail fallback works.

### 18.3 Experiment detail

- [ ] Only selected experiment runtime loads.
- [ ] Intro remains concise.
- [ ] Workspace uses 70:30 desktop layout where controls exist.
- [ ] No-control experiment hides the settings panel.
- [ ] Mobile puts demo before controls.
- [ ] Canvas uses an approved aspect preset and does not distort.
- [ ] Loading placeholder prevents layout shift.
- [ ] Restart preserves settings.
- [ ] Fullscreen appears only when supported and exits with Escape.
- [ ] Reset is separate from Restart and only shown for configurable experiments.
- [ ] Explanation is one concise paragraph, not long documentation.
- [ ] Related experiments follow the separately approved design when finalized.

### 18.4 Source protection

- [ ] Anonymous users can browse and interact with public demos.
- [ ] Anonymous payloads/HTML do not contain source.
- [ ] Public caches do not contain source.
- [ ] Authentication is checked server-side.
- [ ] Authorization is checked separately server-side.
- [ ] Unauthorized users see Access not available and no source data.
- [ ] Authorized source request is the first point where source is returned.
- [ ] Monaco is dynamically imported only for an authorized source viewer.
- [ ] Source access works correctly after the return-to-source authentication flow.

### 18.5 Authentication UX

- [ ] All authentication pages reuse the centered contained panel.
- [ ] Inputs use outlined treatment and visible labels.
- [ ] Password visibility controls preserve value/focus and are independently operable.
- [ ] Validation appears on blur/submit and is associated with the field.
- [ ] Authentication-level alert appears above the fields and persists as specified.
- [ ] Primary buttons use the existing accent token and shared loading state.
- [ ] All form controls disable during submission and restore on failure.
- [ ] Sign-up requires the legal checkbox.
- [ ] Legal links open safely in new tabs without toggling the checkbox.
- [ ] Registration and reset requests do not reveal email-account existence.
- [ ] Reset token invalid/expired/used state is separate from the form.
- [ ] Password reset revokes all sessions.
- [ ] Email verification uses centered processing, dedicated success/error states, manual continuation, and 30-second resend cooldown.
- [ ] Verification does not automatically sign the user in.
- [ ] Login success redirects immediately to a validated return destination or `/labs`.
- [ ] Already-authenticated users are redirected away from Login/Sign-up.
- [ ] Logout is immediate, invalidates session, clears authenticated state, and redirects to `/labs`.
- [ ] Session expiry redirects only when protected access is required; public Labs remains usable.
- [ ] Cross-tab session changes are synchronized without relying on client messages as authentication proof.

### 18.6 Security and privacy

- [ ] No password, token, source code, or private user data is logged.
- [ ] Passwords are securely hashed server-side; never stored in plaintext.
- [ ] Sensitive authentication data is not stored in localStorage where avoidable; companion architecture prefers secure HTTP-only cookies.
- [ ] Return destinations are validated internal URLs.
- [ ] Source is never publicly cached.
- [ ] Duplicate registration and password-reset responses do not expose account existence.
- [ ] Server-side rate limits are authoritative.
- [ ] Authorization policy is explicitly implemented and tested rather than assumed.
- [ ] Consent version and timestamp can be audited.

---

## 19. Implementation Order After Explicit Authorization

This is a recommended implementation order, not authorization to start coding:

1. Audit the actual repository and confirm the current route/component/data structure against the companion architecture.
2. Complete any remaining Labs UX decisions marked OPEN that block implementation (especially related experiments, auth providers, authorization policy, password policy, session architecture, route names, and email delivery).
3. Finalize the Labs data contract and public/private API contracts without flattening existing portfolio content.
4. Implement the Labs landing page using lightweight public metadata and static media previews.
5. Implement the experiment detail shell and one selected runtime boundary.
6. Implement the demo canvas, contextual controls, responsive ratios, and supported canvas actions.
7. Implement protected source request flow, server authorization, and lazy source viewer/Monaco.
8. Implement the approved authentication screens and flows using the selected authentication architecture/provider once decided.
9. Implement session revocation, cross-tab synchronization, safe return destinations, rate limiting, privacy-safe responses, and authorization checks.
10. Test public/private data boundaries, access denial, responsive behavior, reduced motion, keyboard accessibility, performance isolation, and portfolio non-regression.
11. Complete Labs and validate it before beginning CMS/Admin work.

Do not skip repository inspection. Do not assume the current filesystem matches a proposed architecture diagram. Do not begin the next phase until the preceding phase is understood and its acceptance criteria are checked.

---

## 20. Decision Log and Change History

### 2026-11-02 — Consolidated baseline

This document consolidates the Labs landing page, experiment detail page, protected source access, authentication visual system, Login, Sign-up, Forgot Password, Reset Password, Email Verification, session behavior, and privacy/security UX discussed with the user.

The user explicitly instructed that remaining recommendations should be locked. The following recommendations were therefore adopted into this baseline:

- Show a masked email address in the verification context when useful.
- Use a dedicated privacy-safe Forgot Password confirmation.
- Use `Update password` as the Reset Password primary action.
- Add `Back to sign in` beneath the generic Sign-up confirmation.
- Keep the account dropdown minimal: signed-in email and Sign out only.
- Synchronize session changes across open Labs tabs, with server state authoritative and public demos unaffected.

Items for which no recommendation had been approved or no sufficient information was available remain OPEN and are listed in Section 16.

### Change management

For every future approved change:

1. Update the relevant specification section.
2. Update decision status if the decision changes.
3. Record what changed, why, and the approval date here.
4. Search for dependent sections and update all affected copy, flows, tables, and checklists.
5. Check for contradictions before implementation.

Never leave an approval only in chat while the source-of-truth file remains outdated.

---

## 21. Final Instruction

**Treat this document as the authoritative Labs and Labs-authentication UX baseline.** Implement exactly what is LOCKED, preserve inherited architecture constraints, and do not guess any OPEN decision. CMS remains deferred until Labs is complete. Existing portfolio functionality and visual design must remain unaffected.
