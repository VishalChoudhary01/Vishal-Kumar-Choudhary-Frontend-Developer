# PROJECT DETAIL PAGE — FINAL IMPLEMENTATION SPEC

> **Status:** Locked implementation specification  
> **Scope:** Project detail page only  
> **Source:** Existing `PROJECTS + PROJECT DETAIL PAGE — UI/UX IMPLEMENTATION SPEC`  
> **Primary change:** Remove repeated information and unnecessary vertical whitespace without redesigning the locked Hero or Showcase visual systems.

---

# 1. Purpose

This document is the implementation source of truth for the next Project Detail Page refinement.

The existing project-detail specification already defines:

- dynamic project routing
- shared project data
- dynamic category/filter behavior
- full-bleed project-detail Hero
- Showcase visual system
- SectionHeading system
- Motion/react behavior
- responsive desktop/tablet/mobile behavior
- project navigation
- accessibility and performance rules

The current iteration is **not a visual redesign**.

The goal is to:

1. identify repeated information across the detail page;
2. remove or consolidate unnecessary repetition;
3. preserve the locked Hero layout and visual layer architecture;
4. preserve the locked Showcase layout and visual treatment;
5. reduce unnecessary vertical spacing between sections and their content;
6. keep the information hierarchy clear;
7. keep the mobile experience compact and intentional;
8. keep the desktop experience editorial without large dead zones;
9. hide `View Source`/GitHub CTA on mobile while preserving it on desktop when a source URL exists;
10. preserve the canonical project data model and dynamic routing.

The core principle remains:

> **The main page creates interest. The detail page provides evidence.**

The main page must not become a mini case study, and the detail page must not repeat the main page at every scroll position.

---

# 2. Existing Source-of-Truth Rules

The existing specification establishes that the portfolio uses one shared project data source and that project cards/detail pages consume that data.

The existing document also establishes the detail-page hierarchy:

```text
Project Identity
↓
Hero
↓
Stack + Links
↓
Contribution
↓
Showcase
↓
Decisions
↓
Technical Notes
↓
Reflection
↓
Improvements
↓
Next Project
```

These architectural decisions remain valid.

The current implementation must modify presentation and content boundaries rather than replace the project architecture.

---

# 3. LOCKED — DO NOT REDESIGN

The following areas are **LOCKED**.

## 3.1 Project Detail Hero

The current full-bleed Hero system is locked.

Do not redesign:

- full-bleed composition
- visual layer architecture
- product visual placement
- hero atmosphere
- grid/texture treatment
- readability mask
- hero typography concept
- Hero content hierarchy
- scroll cue
- Motion language
- desktop asymmetric composition
- mobile composition
- tablet composition
- theme behavior
- restrained radius treatment

The existing Hero specification explicitly defines a full-bleed project presentation with layered background, product visual, readability treatment, constrained content, metadata, actions, and scroll cue.

### Allowed Hero changes

Only make changes required for:

- removing duplicated metadata;
- correct conditional source/live links;
- responsive source-link behavior;
- reducing accidental spacing caused by implementation;
- preventing content overlap;
- preserving correct semantic hierarchy;
- correcting unintended layout gaps.

### Not allowed

Do not redesign the Hero because this task is about content repetition and vertical rhythm.

---

# 4. LOCKED — SHOWCASE

The existing Showcase layout and visual direction are also locked.

The Showcase is the primary visual evidence area.

Preserve:

- existing Showcase composition;
- screenshot hierarchy;
- image order;
- visual treatment;
- image aspect ratios;
- project-specific screenshots;
- captions where useful;
- Motion behavior where already implemented;
- responsive image behavior;
- restrained borders/radius;
- editorial presentation.

The Showcase must continue to feel visually different from the main project card.

### Allowed Showcase changes

Only:

- reduce unnecessary whitespace before/after the Showcase;
- reduce heading-to-content spacing where excessive;
- remove duplicate explanatory text;
- correct broken image rendering if caused by implementation;
- preserve responsive behavior;
- preserve image loading/performance behavior.

### Not allowed

Do not redesign the Showcase grid, composition, image treatment, or visual concept as part of this task.

---

# 5. Core Problem — Repetition

The current page can repeat the same project information in multiple locations.

Typical repeated information includes:

- project title;
- project description;
- year;
- category;
- role;
- stack;
- contribution;
- project purpose;
- implementation summary.

The solution is **not** to delete useful project information blindly.

Instead classify each item:

```text
UNIQUE
↓
KEEP

DUPLICATE
↓
KEEP ONCE

NEAR-DUPLICATE
↓
MERGE

GENERIC FILLER
↓
REMOVE

CASE-STUDY EVIDENCE
↓
KEEP IN DETAIL PAGE
```

---

# 6. Final Information Hierarchy

The Project Detail page must communicate in this order:

```text
01 — Project identity
02 — Hero / primary visual
03 — Essential project metadata
04 — Contribution
05 — Showcase
06 — Product / UX decisions
07 — Technical / implementation decisions
08 — Reflection
09 — What I would improve
10 — Continue exploring
```

The exact existing component structure may differ.

Do not force a component rewrite if the current components already provide these responsibilities.

---

# 7. Information Ownership

Every piece of content should have one primary owner.

| Information | Hero | Meta | Contribution | Showcase | Decisions | Technical | Reflection | Improvements |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Project title | Primary | No | No | No | No | No | No | No |
| Year | Yes | Optional | No | No | No | No | No | No |
| Category | Yes | Optional | No | No | No | No | No | No |
| Short description | Yes | No | No | No | No | No | No | No |
| Stack | Compact | Primary | No | No | No | Context only | No | No |
| Live link | Yes | Optional | No | No | No | No | No | No |
| GitHub/source | Yes | Optional | No | No | No | No | No | No |
| Contribution | Brief | No | Primary | No | No | Context | No | No |
| Screenshots | Hero visual | No | No | Primary | No | No | No | No |
| UX decisions | No | No | No | No | Primary | No | No | No |
| Technical decisions | No | No | No | No | Optional | Primary | No | No |
| Reflection | No | No | No | No | No | No | Primary | No |
| Future improvements | No | No | No | No | No | No | No | Primary |

The same factual statement should not appear repeatedly merely because it can fit in several sections.

---

# 8. Hero Content Boundary

The Hero should establish:

```text
CATEGORY · YEAR
PROJECT TITLE
SHORT PURPOSE/DESCRIPTION
META
LIVE / SOURCE ACTIONS
PRODUCT VISUAL
SCROLL CUE
```

The Hero must not contain the complete contribution story.

Avoid placing a long contribution paragraph inside the Hero simply because contribution exists in the data.

Contribution belongs to its dedicated section.

---

# 9. Hero Metadata Duplication Rule

If the Hero already communicates:

```text
2026 · DEVELOPER TOOL
```

do not immediately repeat:

```text
2026
Developer Tool
```

unless the second presentation serves a clearly different purpose.

If the stack is shown directly below the Hero, do not repeat the same complete stack again later without a meaningful reason.

---

# 10. Stack Rule

The technology stack should have one clear primary presentation.

Recommended:

```text
Next.js · React · JavaScript · Tailwind CSS · Redux Toolkit · Motion · Lenis
```

The stack should remain compact.

Do not create:

- large technology cards;
- giant logo grids;
- repeated stack lists;
- decorative technology sections that add no evidence.

If a technology is discussed in Technical Decisions, mention the **reason/role**, not simply the technology name again.

Bad:

> React, Next.js, Redux Toolkit and Motion were used.

Better:

> Redux Toolkit kept shared project state predictable while Motion handled focused interaction feedback.

---

# 11. Contribution Section

Contribution remains a distinct evidence section.

Use:

```text
MY CONTRIBUTION

Short summary paragraph

• Concrete contribution
• Concrete contribution
• Concrete contribution
```

Keep the number of points intentionally small.

The contribution section must not repeat the exact Hero description.

The contribution section must answer:

> **What did I personally build or own?**

---

# 12. Showcase Section

Showcase answers:

> **What does the actual product/interface look like?**

Keep the existing locked visual composition.

Each screenshot must have a reason to exist.

Captions should be short.

Do not place long case-study paragraphs below every image.

### Spacing rule

Reduce only the whitespace around the Showcase.

Do not change:

- screenshot arrangement;
- image hierarchy;
- image styling;
- locked layout;
- visual concept.

---

# 13. Product / UX Decisions

This section answers:

> **Why was the interface designed this way?**

Use project-specific decisions.

Good:

```text
Immediate feedback
The input and output remain visually close so the result is understandable
without unnecessary navigation.

Focused workflow
The interface centers on the primary developer task instead of adding
unnecessary dashboard complexity.
```

Avoid generic statements that could apply to every project.

---

# 14. Technical / Implementation Section

This section answers:

> **How was the product implemented and what engineering decisions mattered?**

Do not turn it into a technology inventory.

Instead explain:

- architecture choices;
- state-management choices;
- data flow;
- extraction/processing logic;
- reusable components;
- performance decisions;
- Motion implementation;
- responsive implementation;
- meaningful tradeoffs.

Only include technologies when they support an engineering explanation.

---

# 15. Reflection

Reflection should remain compact.

It should communicate:

- what the project taught you;
- what worked;
- what tradeoff mattered;
- what changed your thinking.

Do not repeat the complete project story.

Recommended structure:

```text
REFLECTION

One concise reflection statement.

Supporting observations:
- ...
- ...
- ...
```

The heading should remain controlled and should not become a giant visual block.

---

# 16. What I Would Improve

Keep this section.

It demonstrates self-evaluation.

It should answer:

> **If I continued this project, what would I change next?**

Keep it concise.

Do not repeat the Technical section.

Do not turn it into a roadmap unless the project actually has one.

---

# 17. Continue Exploring / Project Navigation

Keep the existing bottom navigation.

The navigation remains:

```text
CONTINUE EXPLORING

← Previous Project

Next Project →
```

It must remain data-driven.

Do not hardcode specific projects.

Do not make the navigation unnecessarily tall.

The bottom area should feel like a transition to the next case study, not a second CTA section.

---

# 18. Major Vertical Spacing Rule

This is the main visual change for the current iteration.

The page currently contains excessive vertical space between:

```text
Section heading
↓
content
↓
next section
```

The new rule is:

> **Whitespace must establish hierarchy, not artificially increase page length.**

Do not remove all breathing room.

Do not make the page dense.

Instead create a tighter editorial rhythm.

---

# 19. Section Spacing Model

Use three levels of vertical spacing.

## Level A — Heading to Content

Small-to-medium gap.

```text
EYEBROW
↓
small gap
↓
HEADING
↓
controlled gap
↓
CONTENT
```

Avoid huge gaps between a heading and its own content.

---

## Level B — Content Internal Spacing

Use smaller gaps between related elements.

For example:

```text
paragraph
↓
small gap
↓
supporting point
```

Do not use large section-sized spacing between items that belong to the same section.

---

## Level C — Section to Section

This should be the largest spacing level.

But it must still be proportional to the content.

A short section should not receive the same giant bottom margin as a large Showcase.

Conceptually:

```text
short content
↓
medium section gap
↓
next section
```

not:

```text
short content
↓
huge blank viewport
↓
next section
```

---

# 20. Remove Fixed Viewport Spacing Where It Is Not Needed

Search for patterns such as:

```text
min-h-screen
h-screen
min-h-[...]
py-[very-large-value]
my-[very-large-value]
mt-[very-large-value]
mb-[very-large-value]
```

Do not remove them blindly.

Determine whether each one exists for:

- Hero;
- Showcase composition;
- intentional visual staging;
- actual layout requirement.

If it exists only to create empty space between ordinary detail sections, reduce/remove it.

### Important

The Hero is exempt where its locked full-viewport presentation requires it.

The Showcase is exempt where its locked visual composition requires intentional space.

Ordinary editorial sections should not behave like full-screen slides.

---

# 21. Section-Specific Spacing Rules

## Project Meta

Keep close to the Hero.

Do not create a large empty gap after Hero metadata before stack/links.

---

## Contribution

Keep the heading and paragraph close.

Avoid:

```text
MY CONTRIBUTION

[large empty region]

paragraph
```

---

## Showcase

Keep enough space for the Showcase to feel important.

But eliminate accidental empty space before and after the section.

---

## Decisions

Use tighter editorial rows.

Do not place a full viewport of space around a short decision.

---

## Technical

Keep technical explanation close to its heading.

Avoid giant gaps between technical points.

---

## Reflection

Reflection should be visually calm, not vertically enormous.

---

## Improvements

Keep compact.

The section should end naturally and move toward navigation.

---

# 22. Mobile Spacing

Mobile should be intentionally tighter.

Do not inherit desktop vertical spacing unchanged.

Reduce:

- section top padding;
- section bottom padding;
- heading-to-content gap;
- paragraph spacing;
- metadata spacing;
- gap between short sections.

Maintain enough room for touch interaction.

---

# 23. Desktop Spacing

Desktop should retain editorial breathing room but eliminate dead zones.

The page should not contain:

```text
short paragraph
↓
hundreds of pixels of empty background
↓
next heading
```

unless that spacing is clearly part of the locked visual composition.

---

# 24. Tablet Spacing

Tablet should sit between desktop and mobile.

Do not create a separate information architecture.

Only adjust:

- spacing scale;
- typography;
- content width;
- media dimensions.

---

# 25. Source / GitHub CTA — Responsive Rule

This rule is mandatory.

If a source/GitHub URL exists:

```text
DESKTOP
View Source / GitHub → visible

MOBILE
View Source / GitHub → hidden
```

If no source URL exists:

```text
DESKTOP
source action absent

MOBILE
source action absent
```

The project data must still retain the source URL.

Do not mutate the project object based on viewport.

Prefer responsive presentation logic over creating separate project datasets.

---

# 26. Live Link Rule

Live project links remain data-driven.

If `live` exists:

```text
View Live
```

If it does not:

```text
do not render empty action space
```

Do not create fake links.

---

# 27. Responsive Action Layout

Desktop may show:

```text
View Live ↗
GitHub ↗
```

Mobile may show:

```text
View Live ↗
```

when live exists.

If only GitHub exists, follow the project-data rules and the mobile source-hiding rule: do not expose the source CTA on mobile.

The remaining action layout must not leave a large empty gap.

---

# 28. Dynamic Project Data

Continue using one canonical project object.

Conceptually:

```js
{
  slug,
  title,
  year,
  category,
  categoryLabel,
  description,
  image,
  imageAlt,
  stack,
  contribution,
  links: {
    live,
    github
  },
  showcase,
  decisions,
  technicalNotes,
  reflection,
  improvements
}
```

The actual existing schema is authoritative.

Do not rename fields unless necessary.

Do not create:

```text
mobileProject
desktopProject
heroProject
showcaseProject
```

copies of the same data.

---

# 29. Dynamic Routing

Preserve:

```text
/projects/[slug]
```

The slug remains the canonical project identifier.

Invalid slugs must use the application's not-found behavior.

Do not hardcode:

```text
ClassFuse
Spendwise
System Canvas
```

inside reusable detail components.

---

# 30. SectionHeading — Preserve Shared System

The existing `SectionHeading` remains the source of truth.

Do not create:

```text
ProjectDetailHeading
ShowcaseHeading
ReflectionHeading
```

only to change typography.

Use the existing semantic size API.

Recommended:

```text
sm
default
lg
xl
```

where `xl` remains hero-level.

Ordinary detail sections should use controlled sizes.

---

# 31. Heading Hierarchy

Semantic hierarchy:

```text
h1
Project Title

h2
SHOWCASE

h2
DESIGN DECISIONS

h2
IMPLEMENTATION

h2
REFLECTION

h2
WHAT I WOULD IMPROVE
```

Visual size and semantic level are independent.

Do not use giant display typography for every `h2`.

---

# 32. Typography Rule

The existing specification identifies oversized ordinary editorial headings as a problem.

Therefore:

- Hero title remains large because it is locked;
- ordinary detail headings become controlled;
- long supporting text gets smaller semantic sizing;
- mobile headings remain readable without dominating the viewport.

Do not globally enlarge `SectionHeading`.

Do not solve spacing problems by making typography smaller than necessary.

---

# 33. Motion Rules

Keep `motion/react`.

Motion should support:

- section reveal;
- image reveal;
- filter transitions where applicable;
- CTA interaction;
- subtle navigation feedback.

Do not introduce new large animations merely because whitespace is being reduced.

The hierarchy must still read correctly with animation disabled.

Keep:

```js
const prefersReduced = useReducedMotion();
const shouldAnimate = animate && !prefersReduced;
```

or the equivalent existing implementation.

---

# 34. Hero Motion — LOCKED

Do not redesign Hero animation.

Preserve the existing:

- entrance sequence;
- product visual reveal;
- subtle background/visual movement;
- reduced-motion behavior;
- crisp settled typography.

Only fix accidental layout shifts or spacing.

---

# 35. Showcase Motion — LOCKED

Preserve existing Showcase Motion.

Only adjust timing/spacing if required to remove unnecessary dead space.

Do not add:

- aggressive parallax;
- continuous floating;
- excessive scaling;
- 3D rotation;
- scroll-jacking.

---

# 36. Accessibility

Preserve:

- one `h1`;
- semantic `h2`s;
- keyboard-accessible links/buttons;
- visible focus states;
- meaningful image alt text;
- sufficient contrast;
- reduced-motion support;
- information independence from animation;
- information independence from hover.

The mobile source-link hiding must not hide information that is necessary to understand the project.

---

# 37. Performance

Do not introduce new expensive client-side behavior merely to solve responsive presentation.

Prefer:

- CSS responsive behavior;
- existing Tailwind breakpoints;
- existing Motion system;
- existing project data;
- existing Next.js Image behavior.

Avoid:

- duplicated data;
- unnecessary resize listeners;
- expensive scroll handlers;
- repeated calculations;
- unnecessary client components.

---

# 38. Implementation Phases

## PHASE 0 — Baseline and Safety

Before editing:

1. Run the application.
2. Open multiple project detail routes.
3. Capture the current desktop/tablet/mobile state.
4. Identify current section order.
5. Identify Hero components.
6. Identify Showcase components.
7. Identify all metadata components.
8. Identify project action components.
9. Identify SectionHeading implementation.
10. Identify project data source.

### Done when

- every detail-page component is mapped;
- existing Hero is identified;
- existing Showcase is identified;
- source/live links are identified;
- no changes have yet been made to locked visual systems.

---

## PHASE 1 — Content Duplication Audit

Search the project-detail implementation and project data for:

- title;
- description;
- year;
- category;
- role;
- stack;
- contribution;
- project purpose;
- technical summary;
- reflection;
- improvements.

Create an internal ownership map.

### Done when

Every repeated item has one clear primary location.

---

## PHASE 2 — Main Page vs Detail Boundary

Verify that the main project card only handles discovery.

Remove from the main card only where currently duplicated and unnecessary:

- long case-study content;
- long technical explanation;
- detailed reflection;
- detailed improvement notes;
- detailed decision explanations.

Do not remove information from the canonical project data.

### Done when

The main page is concise while detail data remains intact.

---

## PHASE 3 — Detail Page Content Consolidation

Refactor the detail sections.

Rules:

- Hero = identity and concise purpose;
- Meta = essential metadata;
- Contribution = ownership/evidence;
- Showcase = visual evidence;
- Decisions = UX/product reasoning;
- Technical = engineering reasoning;
- Reflection = learning;
- Improvements = future direction;
- Navigation = transition.

### Done when

No two adjacent sections explain the same thing in different words.

---

## PHASE 4 — LOCK HERO

Verify the existing Hero without redesigning it.

Check:

- full-bleed background;
- layered visual system;
- product screenshot;
- title;
- description;
- metadata;
- live/source actions;
- scroll cue;
- responsive composition;
- reduced motion.

Apply only:

- duplication fixes;
- responsive source CTA rule;
- accidental spacing fixes.

### Done when

The Hero looks visually the same in principle and remains the strongest opening element.

---

## PHASE 5 — LOCK SHOWCASE

Verify the existing Showcase.

Do not redesign its layout.

Apply only:

- spacing reduction;
- duplicate text removal;
- image/fallback fixes;
- responsive spacing corrections.

### Done when

The Showcase remains visually identical in concept but no longer has unnecessary vertical dead space around it.

---

## PHASE 6 — Vertical Rhythm Refactor

Audit every ordinary detail section.

Search for excessive:

```text
py-
pt-
pb-
mt-
mb-
gap-
min-h-
h-screen
```

Reduce only spacing that does not contribute to hierarchy.

Use:

```text
heading
↓
controlled gap
↓
content
↓
medium section gap
↓
next heading
```

### Done when

The page is visibly shorter without becoming cramped.

---

## PHASE 7 — Mobile Responsive Cleanup

At mobile widths:

- hide source/GitHub CTA;
- keep live CTA when available;
- reduce section spacing;
- reduce heading-to-content gaps;
- prevent metadata overflow;
- preserve Showcase composition;
- preserve Hero composition;
- prevent horizontal overflow.

### Done when

Mobile feels intentionally designed rather than vertically stretched.

---

## PHASE 8 — Tablet Cleanup

Verify:

- content width;
- heading size;
- section spacing;
- Hero;
- Showcase;
- actions;
- metadata;
- navigation.

### Done when

Tablet is neither a squeezed desktop nor an oversized mobile page.

---

## PHASE 9 — Desktop Cleanup

Verify:

- Hero;
- Showcase;
- section hierarchy;
- content width;
- whitespace;
- navigation.

### Done when

Desktop has editorial breathing room without large empty zones.

---

## PHASE 10 — Motion and Reduced Motion QA

Verify all existing Motion.

Check:

- section reveals;
- Hero entrance;
- Showcase entrance;
- CTA interactions;
- heading animation;
- reduced motion.

### Done when

Motion supports the content rather than masking spacing problems.

---

## PHASE 11 — Data and Route QA

Test:

```text
/projects/class-fuse
/projects/spendwise
/projects/system-canvas
```

and every other project in the data source.

Test:

- valid slug;
- invalid slug;
- source exists;
- source missing;
- live exists;
- live missing;
- showcase exists;
- showcase empty;
- contribution exists;
- optional content missing.

### Done when

No runtime error or empty layout appears.

---

## PHASE 12 — Final Visual QA

Inspect:

```text
Desktop
1440×900
1920×1080

Tablet
1024×768
834×1112

Mobile
390×844
375×812
320×800
```

Also inspect:

```text
Light theme
Dark theme
Reduced motion
200% browser zoom
Long project title
Short project title
Long description
Missing GitHub
Missing live URL
Missing optional sections
Wide showcase image
```

---

# 39. Parameters of Done

## Content

- [ ] No unnecessary project-summary repetition.
- [ ] No unnecessary year repetition.
- [ ] No unnecessary category repetition.
- [ ] No unnecessary stack repetition.
- [ ] Contribution appears in one primary location.
- [ ] UX decisions remain evidence-driven.
- [ ] Technical decisions remain evidence-driven.
- [ ] Reflection remains distinct.
- [ ] Improvements remain distinct.

## Hero

- [ ] Existing full-bleed Hero layout is preserved.
- [ ] Existing layer architecture is preserved.
- [ ] Existing product visual treatment is preserved.
- [ ] Hero remains visually dominant.
- [ ] No duplicate metadata is introduced.
- [ ] Live link is conditional.
- [ ] Source link is conditional.
- [ ] Source link is desktop-only.
- [ ] Mobile does not show source/GitHub CTA.
- [ ] Reduced motion works.
- [ ] Hero title remains crisp after animation.

## Showcase

- [ ] Existing Showcase layout is preserved.
- [ ] Existing visual hierarchy is preserved.
- [ ] Screenshots remain project-specific.
- [ ] No unnecessary redesign occurs.
- [ ] Captions remain concise.
- [ ] Duplicate Showcase explanation is removed.
- [ ] Excessive spacing around Showcase is reduced.

## Spacing

- [ ] Heading-to-content gaps are reduced where excessive.
- [ ] Section-to-section gaps are reduced where excessive.
- [ ] Short sections no longer create giant blank regions.
- [ ] Ordinary sections do not use unnecessary viewport-height spacing.
- [ ] Hero viewport height remains intact where required.
- [ ] Showcase visual breathing room remains intentional.
- [ ] Mobile spacing is tighter than desktop.
- [ ] Tablet spacing is intermediate.
- [ ] No section feels cramped.

## Responsive

- [ ] 320px works.
- [ ] 375px works.
- [ ] 390px works.
- [ ] 430px works.
- [ ] Tablet works.
- [ ] Desktop works.
- [ ] No horizontal overflow.
- [ ] No clipped text.
- [ ] No broken actions.
- [ ] No accidental mobile source button.

## Data

- [ ] One canonical project dataset remains.
- [ ] No separate mobile project dataset exists.
- [ ] No separate desktop project dataset exists.
- [ ] Existing optional fields remain safe.
- [ ] Project slugs remain stable.
- [ ] Dynamic previous/next navigation remains functional.
- [ ] Dynamic project filtering remains functional on the main page.

## Engineering

- [ ] Existing component architecture is reused where appropriate.
- [ ] No unnecessary duplicate components are introduced.
- [ ] `SectionHeading` remains shared.
- [ ] Tailwind remains the styling system.
- [ ] Motion/react remains the animation system.
- [ ] Reduced-motion behavior remains intact.
- [ ] No unnecessary viewport JavaScript is added.
- [ ] No broken imports.
- [ ] No unused refactored components.
- [ ] No TypeScript/lint errors.
- [ ] Production build succeeds.

---

# 40. Visual Quality Gate

The final Project Detail page should feel:

```text
EDITORIAL
↓
CALM
↓
PRODUCT-FOCUSED
↓
EVIDENCE-DRIVEN
↓
INTENTIONAL
```

It should not feel:

```text
LONG FOR THE SAKE OF BEING LONG
↓
REPETITIVE
↓
EMPTY
↓
OVERSIZED
↓
CARD-HEAVY
```

The visitor should be able to move from:

```text
Hero
↓
Contribution
↓
Showcase
↓
Decisions
↓
Technical
↓
Reflection
↓
Improvements
```

without encountering the same project explanation repeatedly.

---

# 41. Final Architecture

```text
PROJECT DETAIL

┌───────────────────────────────────────────────┐
│ LOCKED FULL-BLEED HERO                       │
│                                               │
│ Category · Year                              │
│ Project Title                                │
│ Short Description                            │
│ Metadata                                     │
│ Live / Source (desktop conditional)           │
│ Product Visual                               │
│ Scroll Cue                                   │
└───────────────────────────────────────────────┘
                    ↓
             Essential Meta
                    ↓
             My Contribution
                    ↓
┌───────────────────────────────────────────────┐
│ LOCKED SHOWCASE                              │
│                                               │
│ Existing visual composition                   │
│ Existing screenshot hierarchy                 │
└───────────────────────────────────────────────┘
                    ↓
             Design Decisions
                    ↓
             Implementation
                    ↓
                Reflection
                    ↓
           What I Would Improve
                    ↓
             Continue Exploring
                    ↓
             Previous / Next
```

---

# 42. Non-Negotiable Rules

## DO

- preserve the existing Hero;
- preserve the existing Showcase;
- remove repeated information;
- reduce unnecessary vertical space;
- keep one canonical project dataset;
- keep dynamic project routing;
- keep dynamic project filters;
- hide source/GitHub on mobile;
- keep source/GitHub on desktop when available;
- preserve live links;
- preserve Motion;
- preserve reduced-motion behavior;
- preserve accessibility;
- preserve the editorial visual language.

## DO NOT

- redesign the Hero;
- redesign the Showcase;
- replace the existing visual system;
- delete project data;
- create mobile/desktop duplicate data;
- hardcode project navigation;
- hardcode categories;
- add giant new cards;
- add giant technology grids;
- use huge empty section spacing;
- use `h-screen` for ordinary content sections;
- make every section a full-screen slide;
- add unnecessary animations;
- show `View Source` on mobile;
- break existing project routes.

---

# 43. Final Principle

> **Do not make the Project Detail page shorter by removing evidence. Make it shorter by removing repetition and dead space.**

The Hero remains the cinematic introduction.

The Showcase remains the visual evidence.

The content sections explain the decisions.

The spacing creates hierarchy.

The project data remains canonical.

The main portfolio remains the discovery layer.

The detail page remains the evidence layer.

**The final result should feel like the same portfolio system — simply sharper, tighter, more intentional, and easier to read.**
