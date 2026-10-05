**# PROJECTS + PROJECT DETAIL PAGE — UI/UX IMPLEMENTATION SPEC**

> **Updated:** Dynamic full-bleed project-detail hero added with header relationship, layered visual system, responsive desktop/tablet/mobile behavior, `SectionHeading`/`SectionEyebrow` integration, Motion rules, accessibility, performance, and completion criteria.



**## 1. Purpose**



This document defines the final behavior and layout for:



1\. The **\*\*main portfolio Projects section\*\***

2\. The **\*\*Project card interaction\*\***

3\. The **\*\*Project detail page\*\***

4\. The shared **\*\*SectionHeading\*\*** sizing system

5\. Responsive behavior across desktop, tablet, and mobile

6\. Dynamic project-category tabs

7\. Project navigation and detail-page content boundaries
8\. Dynamic full-bleed project-detail hero with responsive layering



The goal is to make the portfolio feel like a curated product/design portfolio rather than a collection of repeated project descriptions.



**---**



**# 2. Core UX Decision**



**## Main Projects section**



The main portfolio page answers:



\> **\*\*What did I build?\*\***



It should be fast to scan.



It contains:

\- project category

\- year

\- project name

\- short description

\- project visual

\- technology stack

\- small contribution summary

\- primary project navigation action



It should **\*\*not\*\*** contain the complete case study.



**---**



**## Project Detail page**



The detail page answers:



\> **\*\*How did I build it, why did I build it, and what did I contribute?\*\***



It should contain:

\- project identity

\- concise project summary

\- large hero visual

\- stack

\- live/project links

\- contribution

\- selected product/interface decisions

\- screenshots/showcase

\- technical/product challenges

\- implementation decisions

\- reflection

\- possible improvements

\- next/previous project navigation



The detail page should **\*\*not simply repeat the entire main project card\*\***.



**---**



**# 3. Main Projects Section**



**## Section identity**



Use:



**### Eyebrow**



\`PROJECTS\`



**### Heading**



\`What I actually built.\`



Keep the current editorial tone.



Do not create a different heading style for Projects just because the detail page also uses a heading.



Instead, control visual scale through the shared \`SectionHeading\` component.



**---**



**# 4. Main Projects Section Layout**



Recommended desktop structure:



\`\`\`text

PROJECTS



What I actually built.

────────────────────────────────────────



ALL     PRODUCTS     EXPERIMENTS     TOOLS



                2026

                DEVELOPER TOOL

                ClassFuse



                Short project description...



                ┌───────────────────────────────┐

                │                               │

                │       PROJECT VISUAL          │

                │                               │

                └───────────────────────────────┘



                Stack

                Next.js · React · JavaScript · ...



                MY CONTRIBUTION



                Short contribution summary...



                View Project →

\`\`\`



The project visual should remain the dominant visual element.



**---**



**# 5. Project Category Tabs**



The category system must remain functional and data-driven.



Do **\*\*not hard-code individual project cards into category-specific components\*\***.



Project data should contain a category/type.



Example:



\`\`\`js

const projects = [

    {

        slug: "class-fuse",

        title: "ClassFuse",

        category: "tools",

        categoryLabel: "Developer Tool",

        year: "2026",

    },

    {

        slug: "spendwise",

        title: "Spendwise",

        category: "products",

        categoryLabel: "Product",

        year: "2026",

    },

];

\`\`\`



The tabs should be generated from available project categories.



Example:



\`\`\`js

const categories = [

    {

        id: "all",

        label: "ALL",

    },

    {

        id: "products",

        label: "PRODUCTS",

    },

    {

        id: "tools",

        label: "TOOLS",

    },

];

\`\`\`



The exact categories can grow later.



**---**



**# 6. Dynamic Category Behavior**



The category filter must:



\- remain functional

\- filter project cards without page reload

\- preserve the existing visual design

\- support an \`ALL\` state

\- support future project types

\- avoid hard-coded assumptions about ClassFuse

\- work correctly on mobile

\- animate filtering subtly



Filtering logic:



\`\`\`js

const filteredProjects =

    activeCategory === "all"

        ? projects

        : projects.filter(

              (project) => project.category === activeCategory

          );

\`\`\`



Do not create a separate page for every category unless there is a future product reason to do so.



**---**



**# 7. Category Tab Interaction**



Active tab:



\- teal/accent text

\- visible bottom indicator

\- stronger visual weight



Inactive tab:



\- muted text

\- no heavy container

\- no pill background

\- subtle hover transition



Avoid:



\- oversized rounded pills

\- large tab buttons

\- excessive borders

\- card-like tabs



The current editorial portfolio uses thin lines and typography; preserve that language.



**---**



**# 8. Project Card**



The project card should communicate enough information to make the user want to open the detail page.



**## Card content**



Required:



\- year

\- project type/category

\- project title

\- short description

\- project visual

\- technology stack

\- short contribution

\- \`View Project\` action



Optional:



\- small status label

\- live project indicator

\- GitHub indicator



Do not add every possible metadata field.



**---**



**# 9. Project Card Hover**



The project visual is the primary interaction surface.



On hover:



1\. Project visual can subtly scale.

2\. Overlay should remain restrained.

3\. \`View Project\` action appears or becomes more prominent.

4\. Arrow moves toward the right.

5\. Project title/visual should not jump.

6\. No aggressive zoom.

7\. No excessive glow.



The arrow movement should use a \`group-hover\` interaction.



Example behavior:



\`\`\`text

View Project  →

             →

\`\`\`



The arrow should translate slightly on hover.



Use a parent \`group\` and:



\`\`\`text

group-hover:translate-x-1

\`\`\`



or an equivalent Motion interaction.



**---**



**# 10. View Project Button**



The project card action is a navigation action.



Its job is:



\> Open the project's dedicated detail page.



Recommended label:



\`View Project\`



Alternative labels may be used globally, but keep one consistent action across the portfolio.



Do not use:



\- Read More

\- Explore

\- Learn More

\- Details



unless the portfolio intentionally adopts a different vocabulary.



\`View Project\` is clearer for a developer portfolio.



**---**



**# 11. Project Navigation**



The project action should navigate to:



\`\`\`text

/projects/[slug]

\`\`\`



Example:



\`\`\`text

/projects/class-fuse

/projects/spendwise

\`\`\`



The slug must come from project data.



Do not hard-code navigation inside each project card.



Example:



\`\`\`js

href={\`/projects/${project.slug}\`}

\`\`\`



The entire visual can optionally be clickable, but the explicit \`View Project\` action must remain discoverable.



**---**



**# 12. Main Page Content Boundary**



The main page should **\*\*not\*\*** contain:



\- long reflection

\- detailed problem solving

\- full technical architecture

\- long challenge explanations

\- detailed implementation decisions

\- complete project story

\- multiple paragraphs of retrospective content



Those belong to the detail page.



The main page should feel like a **\*\*portfolio index\*\***.



**---**



**# 13. Main Page Project Information Density**



Recommended:



\`\`\`text

Project name

1 short description

Stack

1 contribution paragraph

1 action

\`\`\`



Avoid:



\`\`\`text

Project name

Long description

5 challenge paragraphs

10 feature bullets

technical architecture

reflection

improvements

links

\`\`\`



That creates unnecessary duplication.



**---**



**# 14. Shared SectionHeading Problem**



The current \`SectionHeading\` component is being used in both:



\- main portfolio sections

\- project detail sections



The same component should remain the source of truth.



Do **\*\*not\*\*** create another heading component only to fix project detail sizing.



Instead, make the existing \`size\` API meaningful.



**---**



**# 15. SectionHeading Size System**



The current component already supports:



\`\`\`js

size = "default"

\`\`\`



and:



\`\`\`js

EDITORIAL_SIZE

MINIMAL_SIZE

\`\`\`



Use these size variants intentionally.



Recommended semantic sizes:



\`\`\`text

sm

default

lg

xl

\`\`\`



The exact Tailwind classes can be adjusted to the existing typography tokens, but the hierarchy should be:



**### Desktop**



\`\`\`text

sm       → small section/supporting heading

default  → normal editorial section heading

lg       → major page heading

xl       → hero-only heading

\`\`\`



Do not use \`xl\` for ordinary project sections.



**---**



**# 16. Projects Main Heading**



For:



\`\`\`text

PROJECTS

What I actually built.

\`\`\`



Use:



\`\`\`jsx

\<SectionHeading

    heading="PROJECTS"

    supporting="What I actually built."

    size="default"

/>

\`\`\`



The heading should be large enough to feel editorial but should not dominate the entire viewport.



**---**



**# 17. Project Detail Heading**



The detail page should use the same component but a controlled size.



Example:



\`\`\`jsx

\<SectionHeading

    heading="SHOWCASE"

    supporting="The interface, captured in the details that matter."

    size="default"

/>

\`\`\`



Do not make the detail-page heading larger simply because it is a detail page.



This prevents the problem visible in the current screenshots where:



\- main page heading is huge

\- detail page heading is also huge

\- long editorial text becomes visually overwhelming

\- the page loses hierarchy



**---**



**# 18. Desktop Heading Reduction**



The current desktop editorial heading is visually too large for repeated project/detail sections.



Reduce the default desktop size.



Target:



\`\`\`text

Main Projects:

approximately 64–80px visual scale



Detail section:

approximately 56–72px visual scale



Hero:

can remain larger when intentionally used

\`\`\`



Do not blindly use one giant \`text-8xl\` class everywhere.



The heading should respond to content length.



A long sentence should automatically receive a smaller semantic size than a short headline.



**---**



**# 19. Tablet Heading**



Tablet should reduce further.



Target:



\`\`\`text

Projects:

approximately 48–60px



Detail editorial heading:

approximately 44–56px

\`\`\`



The heading should not occupy most of the viewport height.



**---**



**# 20. Mobile Heading**



Mobile needs a significant reduction.



Target:



\`\`\`text

Projects:

approximately 34–42px



Detail editorial heading:

approximately 32–40px

\`\`\`



Long headings should wrap naturally.



Do not force extremely large text on mobile.



Avoid:



\`\`\`text

text-7xl

text-8xl

\`\`\`



for ordinary mobile section headings.



**---**



**# 21. Mobile Editorial Typography Rules**



On mobile:



\- reduce heading size

\- reduce line-height

\- keep readable line length

\- avoid excessive top/bottom spacing

\- maintain the eyebrow-to-heading relationship

\- keep decorative number subtle

\- avoid horizontal overflow



Recommended hierarchy:



\`\`\`text

EYEBROW

↓

small gap

↓

HEADING

↓

short divider

↓

content

\`\`\`



**---**



**# 22. SectionHeading Responsive API**



The component should allow a semantic size to determine responsive typography.



Example conceptual mapping:



\`\`\`js

EDITORIAL_SIZE = {

    sm: "text-3xl md:text-4xl lg:text-5xl",

    default: "text-4xl md:text-5xl lg:text-6xl",

    lg: "text-5xl md:text-6xl lg:text-7xl",

    xl: "text-6xl md:text-7xl lg:text-8xl",

};

\`\`\`



These values are examples, not mandatory exact values.



Adjust them against the existing design tokens and actual font metrics.



The important rule is:



\> **\*\*Only hero-level typography should approach extreme display sizes.\*\***



**---**



**# 23. Detail Page Structure**



The detail page should be structured as a case-study-like project presentation.



Recommended order:



\`\`\`text

1\. Project Header

2\. Hero / Primary Visual

3\. Project Meta

4\. Stack + Links

5\. Contribution

6\. Project Showcase

7\. Key Product / UX Decisions

8\. Technical / Implementation Notes

9\. Reflection

10\. What I Would Improve

11\. Continue Exploring

12\. Next Project

\`\`\`



**---**



**# 24. Project Detail Header**



The top of the detail page should establish identity immediately.



Recommended:



\`\`\`text

2026                     DEVELOPER TOOL



ClassFuse



A Tailwind CSS utility for cleaning and organizing

class lists by removing duplicate and conflicting

utilities and producing cleaner, more readable

class strings.

\`\`\`



This is enough.



Do not repeat the entire contribution section here.



**---**



**# 25. Dynamic Full-Bleed Project Hero**

The project-detail hero is the first visual statement of the case study. It must feel like a **full-bleed product presentation**, not a normal centered content section and not a generic SaaS hero.

It immediately communicates:
- what the project is
- project type and year
- what the product looks like
- concise project purpose
- available live/GitHub actions
- that the page is a detailed case study

The existing portfolio header remains part of the experience. The hero is designed **around the header**, not underneath it.

---

## 25.1 Hero Information Architecture

```text
┌──────────────────────────────────────────────────────────────────────┐
│                         FIXED / STICKY HEADER                        │
│  VKr.                              social · theme · Resume           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [BACKGROUND / PRODUCT VISUAL / GRID / ATMOSPHERE]                   │
│                                                                      │
│       CATEGORY · YEAR                                                │
│                                                                      │
│       Project Title                                                  │
│       Large controlled editorial display                             │
│                                                                      │
│       Short project description                                      │
│                                                                      │
│       META / ROLE                                                    │
│       View Live ↗        GitHub ↗                                    │
│                                                                      │
│                                           ┌───────────────────────┐  │
│                                           │     PRODUCT VISUAL    │  │
│                                           └───────────────────────┘  │
│                                                                      │
│                         SCROLL TO EXPLORE ↓                           │
└──────────────────────────────────────────────────────────────────────┘
```

The exact composition can change by project, but the hierarchy remains stable.

---

## 25.2 Full-Bleed Principle

The hero background and visual environment extend to the viewport edges while text remains constrained by the portfolio container.

```text
Viewport
│
├── Full-bleed background
├── Full-bleed atmosphere / grid
├── Product visual
├── Readability mask
└── Constrained content
    ├── eyebrow
    ├── title
    ├── description
    ├── metadata
    └── actions
```

Do not put the entire hero inside the normal `max-w-*` container. Use the global container only for readable content.

---

## 25.3 Header Relationship

The existing portfolio header remains visible above the hero. The hero must account for its actual height.

Requirements:
- header never covers eyebrow, title, description, metadata, or actions
- project content has intentional top clearance
- anchor navigation accounts for sticky-header height
- use `scroll-mt-*` where needed
- do not solve overlap with enormous permanent padding
- header remains portfolio chrome; hero remains the dominant visual

Conceptually:

```text
HEADER
────────────
FULL-BLEED HERO
────────────
```

---

## 25.4 Hero Height

Desktop should feel approximately one viewport tall:

```text
min-height: 100svh
```

Tablet may use roughly `90–100svh` depending on content. Mobile should prefer content-driven height with approximately one viewport of visual presence rather than forcing a crop with `100vh`.

Do not use `h-screen` blindly when mobile browser UI can clip content.

---

## 25.5 Hero Layer Architecture

Build the hero as deterministic layers:

```text
LAYER 0 — base page background
LAYER 1 — project atmosphere / tonal background
LAYER 2 — subtle grid / texture
LAYER 3 — sharp product visual
LAYER 4 — readability gradient / vignette
LAYER 5 — editorial content
LAYER 6 — scroll cue
```

Recommended conceptual stacking:

```text
z-0   base
z-1   atmosphere
z-2   grid
z-3   product visual
z-4   readability mask
z-10  content
z-20  scroll cue
```

Use the existing header z-index. Do not solve stacking with arbitrary `z-[9999]` values.

### Layer 0 — Base

Use existing page background tokens.

### Layer 1 — Atmosphere

Use subtle radial/linear gradients, low-opacity visual echoes, or tonal falloff. Avoid neon, unrelated colors, excessive blur, and decorative noise.

### Layer 2 — Grid / Texture

A low-opacity grid may create depth. It must be discovered rather than dominate the interface.

### Layer 3 — Product Visual

Use the real project visual with Next.js `Image`, correct aspect ratio, meaningful `alt`, responsive `sizes`, and restrained border treatment.

### Layer 4 — Readability Mask

Use only enough gradient/vignette to make text readable while keeping the screenshot visible.

### Layer 5 — Content

Content sits above the visual environment and stays inside the global readable container.

### Layer 6 — Scroll Cue

Use a minimal `SCROLL TO EXPLORE ↓` affordance near the lower portion of the hero.

---

## 25.6 Desktop Layout

Use a dynamic asymmetric composition rather than a rigid 50/50 split.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER                                                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  CONTENT ~38–44%             PRODUCT VISUAL ~56–62%                  │
│                                                                      │
│  CATEGORY · YEAR             ┌──────────────────────────────────┐   │
│                              │                                  │   │
│  Project Title               │       PRODUCT INTERFACE          │   │
│                              │                                  │   │
│  Description                 └──────────────────────────────────┘   │
│                                                                      │
│  Metadata / Actions                                                 │
│                                                                      │
│                    SCROLL TO EXPLORE ↓                               │
└──────────────────────────────────────────────────────────────────────┘
```

The visual should be slightly more dominant than text. Do not allow the text column to become excessively wide.

---

## 25.7 Hero Container

Use the existing global container system.

Conceptual targets:

```text
outer padding: approximately 5–6vw desktop
hero content max-width: approximately 1200–1400px
text max-width: approximately 520–680px
```

Follow existing design tokens instead of creating a second container system.

---

## 25.8 Eyebrow

Use the existing `SectionHeading` / `SectionEyebrow` language.

Preferred:

```text
DEVELOPER TOOL · 2026
PRODUCT · 2026
CATEGORY · YEAR
```

The eyebrow is:
- uppercase
- compact
- tracked
- secondary
- muted with subtle accent
- positioned above the title

If `SectionHeading` already renders the eyebrow, do not render a second eyebrow manually.

---

## 25.9 Hero Title Typography

The project title is the primary typographic element and may use the hero-only `SectionHeading` size.

Visual targets:

```text
Desktop short title: 88–132px
Desktop long title:  72–108px
Tablet:              56–84px
Mobile:              42–64px
```

These are targets, not mandatory fixed values. Long titles must scale down naturally.

Do not blindly use `text-9xl` for every project.

Only hero-level typography may approach extreme display sizes; ordinary detail sections remain controlled.

---

## 25.10 Hero Title Line Height

Use tight editorial line-height:

```text
desktop: 0.88–0.98
 tablet: 0.92–1.00
 mobile: 0.94–1.04
```

The title should read as one visual object rather than a stack of oversized lines.

---

## 25.11 Hero Title Width

The title must wrap naturally inside a controlled width. Do not use arbitrary manual `<br />` tags merely to reproduce one screenshot.

Long titles should reduce size before they become awkwardly wide or excessively tall.

---

## 25.12 Hero Description

Supporting copy remains concise.

```text
Desktop: 18–22px / 1.45–1.65 line-height
Tablet:  17–20px
Mobile:  16–18px
```

Recommended maximum width: approximately `520–650px`.

The description must never compete with the project title.

---

## 25.13 Hero Metadata

Use compact editorial metadata, for example:

```text
2026 · DEVELOPER TOOL · FRONTEND
```

or a deliberate stacked layout on smaller screens.

Use:
- small typography
- wide tracking
- muted color
- thin separators
- no pill containers
- no metadata cards

---

## 25.14 Hero Actions

Primary:

```text
View Live ↗
```

Secondary/conditional:

```text
GitHub ↗
```

Render actions from project data. If a link does not exist, do not render an empty or fake action.

Avoid huge pills, gradients, excessive shadows, glow, or multiple competing primary buttons.

---

## 25.15 Product Visual

The product screenshot is the hero's main visual artifact.

Preferred treatment:

```text
large screenshot
+ subtle border
+ very subtle shadow
+ restrained radius
+ atmospheric integration
```

Use `rounded-sm` or `rounded-md` only when needed. Do not wrap every screenshot in a generic `rounded-3xl` glass card.

The visual may extend beyond the content grid but must never create page-level horizontal overflow.

---

## 25.16 Dynamic Motion

Use `motion/react` for restrained movement.

Recommended entrance:

```text
eyebrow:    opacity 0 → 1, small y offset → 0
title:      opacity 0 → 1, small y offset → 0
description: opacity 0 → 1
metadata:   opacity 0 → 1
actions:    opacity 0 → 1
visual:     opacity 0 → 1, scale ~0.98 → 1
```

A subtle scroll-linked transform may affect the visual/background, but keep it small.

Avoid:
- dramatic parallax
- 3D rotations
- continuous floating
- infinite product rotation
- large scaling
- excessive blur
- scroll-jacking

The project content is the hero; Motion is support.

---

## 25.17 Motion Timing

Conceptual timing:

```text
eyebrow:      0.35–0.55s
title:        0.55–0.80s
description:  0.45–0.65s
metadata:     0.35–0.50s
actions:      0.35–0.50s
visual:       0.70–1.00s
```

Stagger only when it improves hierarchy. The hero must become readable immediately.

---

## 25.18 Reduced Motion

Keep the existing:

```js
const prefersReduced = useReducedMotion();
const shouldAnimate = animate && !prefersReduced;
```

When reduced motion is enabled:
- render content immediately
- remove parallax
- remove unnecessary transforms
- preserve readability
- preserve the product visual

---

## 25.19 Scroll Cue

Use:

```text
SCROLL TO EXPLORE
        ↓
```

Recommended typography:

```text
10–12px
uppercase
wide tracking
muted
```

A tiny vertical Motion animation is acceptable. Avoid aggressive bouncing.

---

## 25.20 Tablet Composition

Tablet is an intentional intermediate layout, not a scaled desktop.

Preferred order when space becomes constrained:

```text
HEADER
↓
EYEBROW
↓
TITLE
↓
DESCRIPTION
↓
META / ACTIONS
↓
PRODUCT VISUAL
↓
SCROLL CUE
```

On a wide tablet, a side-by-side composition is acceptable if the product visual remains large enough. On a narrow tablet, stack it.

Do not create a separate tablet information architecture.

---

## 25.21 Mobile Composition

Mobile should prioritize readability and product inspection:

```text
HEADER
↓
EYEBROW
↓
PROJECT TITLE
↓
DESCRIPTION
↓
META
↓
ACTIONS
↓
PRODUCT VISUAL
↓
SCROLL CUE
```

Do not force the desktop two-column structure on narrow screens.

---

## 25.22 Mobile Typography

Target ranges:

```text
eyebrow:     10–12px
title:       42–64px
description: 16–18px
metadata:    11–13px
actions:     14–16px
```

Do not default to `text-7xl`, `text-8xl`, or `text-9xl` on mobile.

Long titles must wrap naturally and remain readable.

---

## 25.23 Mobile Spacing

Use intentional rhythm rather than giant margins:

```text
header → eyebrow:       24–40px
eyebrow → title:        10–16px
title → description:    18–28px
description → metadata: 20–28px
metadata → actions:     18–24px
actions → visual:       32–48px
visual → scroll cue:    28–40px
```

These are ranges, not mandatory exact values. The goal is breathing room without empty space that only increases page height.

---

## 25.24 Mobile Product Visual

Keep the product visual large enough to inspect.

Use the available mobile content width and preserve aspect ratio. If the screenshot is very wide, use an intentional crop only when important interface information is not lost; otherwise prefer `object-contain`.

Never allow the screenshot to create horizontal overflow.

---

## 25.25 Full-Bleed Mobile Visual

The visual may intentionally break out of the text container:

```text
┌──────────────────────────────┐
│ text container               │
│ project title               │
│ description                 │
├──────────────────────────────┤
│      FULL-BLEED VISUAL      │
└──────────────────────────────┘
```

If using a breakout, implement it safely and verify scrollbar behavior. Do not use unsafe `100vw` patterns that introduce horizontal overflow.

---

## 25.26 Hero Overflow Rules

Internal visual overflow is allowed; page-level horizontal overflow is not.

Test:
- desktop
- tablet
- iPhone-width mobile
- Android-width mobile
- browser zoom
- long titles
- long descriptions
- wide screenshots

Do not blindly hide overflow on the whole application to conceal a layout bug.

---

## 25.27 Background Visual Treatment

If the product screenshot is echoed into the background:

```text
background copy → low opacity / soft / large scale
foreground copy → sharp / readable / high contrast
```

Do not make two copies of the same UI equally prominent.

---

## 25.28 Theme Behavior

Dark theme:
- deep background
- light editorial text
- subtle teal accent
- muted borders

Light theme:
- light background
- dark editorial text
- same accent language
- subtle neutral borders

Keep composition identical between themes; only tonal values change.

---

## 25.29 Accessibility

Requirements:
- semantic `h1`
- exactly one primary page heading
- meaningful image `alt`
- keyboard-accessible actions
- visible focus state
- sufficient contrast
- no information dependent on color alone
- no information dependent on animation alone
- reduced-motion support

The hero must remain fully understandable with Motion disabled.

---

## 25.30 Semantic Heading Rule

The project title is the page's only `h1`.

Later sections use `h2` as appropriate:

```text
h1 → ClassFuse
h2 → SHOWCASE
h2 → DESIGN DECISIONS
h2 → IMPLEMENTATION
h2 → REFLECTION
h2 → WHAT I WOULD IMPROVE
```

Visual size and semantic level are independent.

---

## 25.31 Hero Data Contract

The hero consumes the shared project data source:

```js
{
  title,
  year,
  categoryLabel,
  description,
  image,
  imageAlt,
  links: {
    live,
    github
  }
}
```

Optional project-specific fields may include:

```js
role,
status,
accent,
heroPosition,
heroObjectFit
```

All optional fields need safe defaults. Never hard-code ClassFuse, Spendwise, year, or category values inside the reusable hero component.

---

## 25.32 Hero Component Responsibility

Recommended component:

```text
ProjectDetailHero.jsx
```

Responsibilities:
- consume project data
- render full-bleed structure
- render identity/title/description
- render metadata
- render conditional links
- render product visual
- manage Motion
- respect reduced motion
- preserve responsive layering

It must not own:
- project data source
- unrelated routing logic
- global theme state
- showcase gallery
- reflection
- next/previous navigation

---

## 25.33 Suggested Hero Component Structure

Conceptually:

```text
ProjectDetailHero
│
├── HeroBackground
│   ├── Base
│   ├── Atmosphere
│   └── Grid
│
├── HeroVisual
│   ├── ProductImage
│   └── ReadabilityOverlay
│
├── HeroContent
│   ├── SectionHeading
│   ├── ProjectMeta
│   └── ProjectActions
│
└── HeroScrollCue
```

Do not automatically create a file for every node. Extract only clear reusable responsibilities.

---

## 25.34 SectionHeading Usage

The existing `SectionHeading` remains the source of truth for editorial typography.

Use the hero-only semantic size:

```jsx
<SectionHeading
  heading={project.title}
  supporting={project.description}
  size="xl"
  ...
/>
```

Use the closest existing API if the current component differs.

Do not enlarge the global default `SectionHeading` just to solve the hero.

`xl` is reserved for hero-level typography; ordinary detail sections remain smaller.

---

## 25.35 SectionEyebrow Usage

If `SectionHeading` already renders `SectionEyebrow`, use that implementation and do not render a second eyebrow.

The visual relationship is:

```text
CATEGORY · YEAR
      ↓
PROJECT TITLE
      ↓
DESCRIPTION
```

---

## 25.36 Accent Divider

A thin accent/neutral divider may support the editorial hierarchy.

Keep it thin and restrained. Do not use large decorative shapes.

---

## 25.37 Depth Rules

Create depth with:

```text
position
opacity
scale
gradient
subtle shadow
thin border
```

Avoid:

```text
heavy glow
large drop shadows
3D rotation
neon bloom
excessive blur
floating glass cards
```

The product itself supplies most of the richness.

---

## 25.38 Performance

The hero is above the fold, so performance is critical.

Requirements:
- optimized Next.js `Image`
- correct dimensions/aspect ratio
- responsive `sizes`
- no unnecessary secondary screenshots above the fold
- no multiple large background assets when one will do
- no expensive continuous animation
- minimal client-side state
- no layout shift

The hero should become usable as early as possible.

---

## 25.39 Loading State

Before the product image loads:
- preserve the image aspect ratio
- avoid layout collapse
- use a restrained neutral surface
- avoid a giant skeleton
- avoid flashing unrelated content

Transition from placeholder to image subtly.

---

## 25.40 Image Failure State

If the hero image fails:
- preserve the hero layout
- keep the visual area reserved
- use a neutral fallback
- keep title/description/meta/actions fully usable
- never expose a broken-image icon as the main design

---

## 25.41 Desktop Completion Criteria

- [ ] Existing header remains visible and usable
- [ ] Header never covers hero content
- [ ] Hero visually occupies approximately one viewport
- [ ] Background reaches viewport edges
- [ ] Text remains inside the global container
- [ ] Project title is the primary visual hierarchy
- [ ] Hero typography is controlled by the semantic heading system
- [ ] Long titles scale appropriately
- [ ] Description remains readable
- [ ] Category/year metadata is visible
- [ ] Live link is conditional
- [ ] GitHub link is conditional
- [ ] Product screenshot is visually dominant
- [ ] Screenshot remains sharp and correctly proportioned
- [ ] Atmosphere/grid remains secondary
- [ ] Layering is deterministic
- [ ] Radius remains restrained
- [ ] No excessive glassmorphism or glow
- [ ] Motion is subtle
- [ ] Reduced motion works
- [ ] Title remains crisp after animation
- [ ] Scroll cue is visible but secondary
- [ ] Hero feels like a product case study, not a SaaS template

---

## 25.42 Tablet Completion Criteria

- [ ] Header remains usable
- [ ] Title scales down correctly
- [ ] Description remains readable
- [ ] Metadata wraps intentionally
- [ ] Actions remain reachable
- [ ] Product visual remains large enough to inspect
- [ ] Side-by-side layout is used only when space allows
- [ ] Narrow tablets can use a stacked composition
- [ ] No horizontal overflow
- [ ] No unnecessary vertical gaps
- [ ] Hero remains visually strong
- [ ] Background layering remains subtle
- [ ] Motion remains restrained

---

## 25.43 Mobile Completion Criteria

- [ ] Header does not cover hero content
- [ ] Eyebrow is visible
- [ ] Project title is readable without zooming
- [ ] Long title wraps naturally
- [ ] No default `text-7xl`/`text-8xl`/`text-9xl` hero sizing
- [ ] Description remains readable
- [ ] Metadata does not overflow
- [ ] Actions remain touch-friendly
- [ ] Product visual remains inspectable
- [ ] Breakout visual, if used, does not create horizontal overflow
- [ ] No excessive empty vertical space
- [ ] Scroll cue remains secondary
- [ ] Reduced motion works
- [ ] Theme switching works
- [ ] Focus states remain visible
- [ ] No information depends on hover
- [ ] Hero remains premium rather than merely compressed

---

## 25.44 Hero Visual Quality Gate

Inspect at:

```text
Desktop: 1440×900, 1920×1080
Tablet:  1024×768, 834×1112
Mobile:  390×844, 375×812
```

Also inspect:

```text
200% browser zoom
reduced motion
light theme
dark theme
short project title
long project title
missing GitHub
missing live link
missing hero image
slow image loading
```

The hero is complete only when the composition survives these conditions.

---

**---**

**# 26. Hero Visual**



The hero visual should be the strongest visual element.



For ClassFuse:



\- use the actual product screenshot

\- preserve aspect ratio

\- show enough interface detail

\- use restrained border treatment

\- avoid excessive rounded cards

\- maintain the dark editorial environment



The visual should feel like a product artifact, not a decorative image.



**---**



**# 27. Project Meta**



Immediately around the hero, show concise metadata.



Recommended:



\`\`\`text

2026

Developer Tool



Next.js · React · JavaScript · Tailwind CSS

Redux Toolkit · Motion · Lenis · next-themes

\`\`\`



Do not repeat the same stack in several locations.



**---**



**# 28. Links**



Project links should remain visible and easy to find.



Recommended:



\`\`\`text

View Project →

GitHub ↗

\`\`\`



If there is no GitHub repository, do not render the GitHub action.



If there is no live site, do not render the live-site action.



Data-driven conditional rendering is required.



**---**



**# 29. Contribution Section**



Use:



\`\`\`text

MY CONTRIBUTION

\`\`\`



Then one concise paragraph.



Example:



\> Designed and developed the frontend interface for a Tailwind CSS utility focused on cleaning, organizing, and formatting utility class strings.



Then use a small number of concrete contribution points.



Recommended:



\`\`\`text

• Clean and format multiline Tailwind class lists

• Remove duplicate utility classes

• Handle conflicting Tailwind utilities

• Organize utilities into a cleaner Tailwind class order

\`\`\`



Do not make this a huge résumé-style list.



**---**



**# 30. Stack Placement**



The stack can remain close to the project hero because it is useful metadata.



Do not build a giant technology grid.



Recommended presentation:



\`\`\`text

Next.js · React · JavaScript · Tailwind CSS · Redux Toolkit · Motion · Lenis

\`\`\`



Typography should be compact and secondary.



**---**



**# 31. Project Showcase**



This is where the detail page should become visually different from the main page.



Use multiple product screenshots or focused interface captures.



Possible structure:



\`\`\`text

SHOWCASE



The interface, captured in the details that matter.



[large screenshot]



[focused screenshot]     [focused screenshot]



[large screenshot]

\`\`\`



Each screenshot should have a reason for existing.



Avoid screenshot galleries where every image looks identical.



**---**



**# 32. Showcase Captions**



Use captions only when they add context.



Example:



\`\`\`text

Input workflow

Cleaning multiline Tailwind utility strings.



Output workflow

Organized utility classes ready to copy.

\`\`\`



Do not write long paragraphs below every screenshot.



**---**



**# 33. Product / UX Decisions**



This section should explain decisions that demonstrate design thinking.



Example:



\`\`\`text

DESIGN DECISIONS



Immediate feedback

The interface keeps input and output close together so the result

can be understood without navigating away.



Focused workflow

The product centers on one developer task instead of introducing

unnecessary dashboard complexity.



Readable output

The cleaned class string remains easy to scan and copy.

\`\`\`



This is much more valuable than simply listing features.



**---**



**# 34. Technical Decisions**



Use a short technical section where relevant.



Example:



\`\`\`text

IMPLEMENTATION



Tailwind CSS is both the subject of the utility and the styling

system of the product.



Motion is used for interaction and transition feedback rather

than decorative animation.



Smooth scrolling is used to make the portfolio presentation feel

more intentional without interfering with the utility itself.

\`\`\`



Keep this section concise.



**---**



**# 35. Reflection**



The existing reflection section is visually too large.



Current concept:



\> ClassFuse combines a focused developer utility with a frontend interface designed around immediate input, processing, and output.



This is good content but should be treated as a **\*\*reflection statement\*\***, not a giant hero.



Use a smaller editorial heading size.



Example:



\`\`\`text

REFLECTION



ClassFuse combines a focused developer utility with a frontend

interface designed around immediate input, processing, and output.

\`\`\`



Then follow with supporting observations.



**---**



**# 36. Reflection Supporting Content**



The existing points are appropriate:



\`\`\`text

Keeping the product centered around one developer workflow

makes the interface easy to understand.



Using Tailwind CSS as both the product domain and the application's

styling system keeps the project closely aligned with its purpose.



Motion and smooth scrolling add interaction without replacing

the utility's primary function.

\`\`\`



Keep them as separate editorial rows.



Do not convert every statement into a large heading.



**---**



**# 37. What I Would Improve**



Keep this section.



It demonstrates self-evaluation.



Recommended:



\`\`\`text

WHAT I WOULD IMPROVE



Further improvements would depend on the next product requirements,

particularly around expanding formatting capabilities and refining

the developer workflow.

\`\`\`



This section should be compact.



It should not occupy an enormous vertical space.



**---**



**# 38. Detail Page Spacing**



The detail page should use intentional rhythm.



Recommended hierarchy:



\`\`\`text

Page top

↓

Project identity

↓

Hero visual

↓

Metadata

↓

Contribution

↓

Showcase

↓

Decisions

↓

Reflection

↓

Improvements

↓

Next project

\`\`\`



Avoid huge blank gaps between every section.



Whitespace should create hierarchy, not simply increase page length.



**---**



**# 39. Existing Detail Page Problem**



The current screenshots show two important issues:



**### Problem 1**



The editorial headings are too large.



**### Problem 2**



The detail page contains some information that belongs more naturally to the main project card.



The solution is not to remove useful information.



The solution is to assign each piece of information to the correct page.



**---**



**# 40. Main Page vs Detail Page Responsibility**



\| Content | Main Page | Detail Page |

\|---|---:|---:|

\| Project title | Yes | Yes |

\| Short description | Yes | Yes, concise |

\| Year | Yes | Yes |

\| Category | Yes | Yes |

\| Stack | Yes | Yes |

\| Contribution | Short | Full |

\| Project visual | Yes | Yes |

\| Multiple screenshots | No | Yes |

\| UX decisions | No | Yes |

\| Technical decisions | No | Yes |

\| Reflection | No | Yes |

\| Improvements | No | Yes |

\| GitHub | Optional | Yes if available |

\| Live project | Yes | Yes |

\| Next project | No | Yes |



**---**



**# 41. Continue Exploring**



The bottom navigation should remain.



Recommended:



\`\`\`text

CONTINUE EXPLORING

────────────────────────────────────



NEXT



Spendwise →

\`\`\`



It should feel like a natural transition rather than a giant CTA.



If there is a previous project, optionally provide:



\`\`\`text

← Previous

Next →

\`\`\`



Do not make this section unnecessarily tall.



**---**



**# 42. Project Data Model**



Use a single project data source.



Example:



\`\`\`js

const projects = [

    {

        slug: "class-fuse",

        title: "ClassFuse",

        year: "2026",

        category: "tools",

        categoryLabel: "Developer Tool",

        description:

            "A Tailwind CSS utility for cleaning and organizing class lists by removing duplicate and conflicting utilities.",

        image: "/projects/class-fuse/hero.webp",

        stack: [

            "Next.js",

            "React",

            "JavaScript",

            "Tailwind CSS",

            "Redux Toolkit",

            "Motion",

            "Lenis",

            "next-themes",

            "React Icons",

        ],

        contribution: {

            summary:

                "Designed and developed the frontend interface for a Tailwind CSS utility focused on cleaning, organizing, and formatting utility class strings.",

            points: [

                "Clean and format multiline Tailwind class lists",

                "Remove duplicate utility classes",

                "Handle conflicting Tailwind utilities",

                "Organize utilities into a cleaner Tailwind class order",

            ],

        },

        links: {

            live: "https\://class-fuse.vercel.app",

            github: "",

        },

        showcase: [],

        decisions: [],

        reflection: "",

        improvements: "",

    },

];

\`\`\`



The exact schema can evolve, but the important rule is:



\> **\*\*Project cards and project detail pages should consume the same project data.\*\***



**---**



**# 43. Suggested Folder Structure**



\`\`\`text

app/

├── page.js

├── projects/

│   └── [slug]/

│       └── page.js

│

components/

├── projects/

│   ├── ProjectsSection.jsx

│   ├── ProjectFilters.jsx

│   ├── ProjectList.jsx

│   ├── ProjectCard.jsx

│   ├── ProjectCardMedia.jsx

│   ├── ProjectCardMeta.jsx

│   ├── ProjectCardAction.jsx

│   │

│   └── detail/

│       ├── ProjectDetailHeader.jsx

│       ├── ProjectDetailHero.jsx

│       ├── ProjectMeta.jsx

│       ├── ProjectContribution.jsx

│       ├── ProjectShowcase.jsx

│       ├── ProjectDecisions.jsx

│       ├── ProjectTechnicalNotes.jsx

│       ├── ProjectReflection.jsx

│       ├── ProjectImprovements.jsx

│       └── ProjectNextNavigation.jsx

│

data/

└── projects.js

│

components/

└── section_heading_comp/

    ├── SectionHeading.jsx

    ├── SectionHeadingWords.jsx

    ├── SectionHeadingDatum.jsx

    └── sectionHeading.constants.js

\`\`\`



Do not over-componentize trivial markup.



The split should exist where components have a clear responsibility.



**---**



**# 44. SectionHeading Component Rules**



Keep the current API:



\`\`\`jsx

\<SectionHeading

    heading=""

    supporting=""

    align="left"

    contentAlign="left"

    variant="editorial"

    size="default"

    className=""

    supportingClassName=""

    animate

    once

    supportingId

    number

/>

\`\`\`



The \`size\` prop is the primary control for hierarchy.



Do not introduce project-specific props such as:



\`\`\`text

projectHeading

detailHeading

classFuseHeading

\`\`\`



That would couple the reusable component to one page.



**---**



**# 45. SectionHeading Implementation Principle**



The component should:



1\. Resolve heading/supporting aliases.

2\. Resolve alignment.

3\. Respect reduced motion.

4\. Use the existing word animation.

5\. Select typography from the size map.

6\. Keep the same editorial composition.

7\. Remain responsive.

8\. Avoid project-specific styling.



The existing animation logic should remain intact unless there is a visual bug.



**---**



**# 46. Reduced Motion**



Keep:



\`\`\`js

const prefersReduced = useReducedMotion();

\`\`\`



and:



\`\`\`js

const shouldAnimate = animate && !prefersReduced;

\`\`\`



Do not remove accessibility behavior while changing typography.



The heading should still render correctly when animation is disabled.



**---**



**# 47. Heading Animation**



Do not make the heading animation more dramatic to compensate for smaller typography.



The purpose is:



\> reveal → settle → read



not:



\> animate → distract → read



After animation completes, text must remain crisp and stable.



**---**



**# 48. Desktop Layout Width**



The current project content should not become excessively wide.



Recommended:



\`\`\`text

Main content:

max-width around 1100–1200px



Editorial text:

max-width around 850–1000px



Long reflection:

max-width around 900px

\`\`\`



Exact values should follow the existing container system.



**---**



**# 49. Project Detail Text Width**



Long editorial text should not span the entire browser width.



For a large desktop display:



\`\`\`text

\|-----------------------------------------------|

\|       readable editorial content              |

\|-----------------------------------------------|

\`\`\`



Avoid:



\`\`\`text

\|---------------------------------------------------------------|

\| extremely long line across entire viewport                    |

\|---------------------------------------------------------------|

\`\`\`



The screenshots currently show the correct general direction, but the typography is oversized.



**---**



**# 50. Mobile Main Projects**



Mobile should prioritize:



\`\`\`text

PROJECTS

What I actually built.



ALL   PRODUCTS   TOOLS



2026

DEVELOPER TOOL



ClassFuse



Short description



[project visual]



Stack



MY CONTRIBUTION



Short summary



View Project →

\`\`\`



Avoid forcing desktop two-column structures onto mobile.



**---**



**# 51. Mobile Project Card**



On mobile:



\- stack content vertically

\- keep project visual large enough to inspect

\- reduce metadata spacing

\- keep action reachable

\- prevent long stack strings from causing overflow

\- allow description to wrap naturally

\- keep category tabs horizontally scrollable if necessary



Do not shrink everything until it becomes unreadable.



**---**



**# 52. Mobile Category Tabs**



If categories exceed available width:



\`\`\`text

ALL  PRODUCTS  TOOLS  EXPERIMENTS →

\`\`\`



Use horizontal scrolling.



Do not wrap categories into multiple rows unless there is a strong design reason.



Hide the scrollbar visually if the existing design system supports that without custom CSS.



**---**



**# 53. Tablet**



Tablet should sit between desktop and mobile.



Use:



\- reduced heading size

\- reduced section gaps

\- project visual width around content container

\- readable text width

\- same category behavior

\- same navigation behavior



Do not create a tablet-only information architecture.



**---**



**# 54. Interaction Motion**



Use \`motion/react\`.



Recommended:



**### Filter change**



Small opacity/position transition.



**### Card hover**



Small media scale.



**### Arrow**



Small horizontal movement.



**### Detail page sections**



Subtle reveal when entering viewport.



Avoid:



\- large rotations

\- excessive parallax

\- springy card movement

\- continuous animation

\- excessive blur

\- distracting 3D effects



The project content is the hero.



**---**



**# 55. Hover State Accessibility**



Do not make important information available only on hover.



The \`View Project\` action must remain accessible through normal layout and keyboard navigation.



The hover treatment is enhancement, not the only navigation mechanism.



**---**



**# 56. Keyboard Interaction**



Project cards/actions must support:



\- keyboard focus

\- visible focus state

\- Enter activation

\- normal Next.js navigation



Do not remove browser focus behavior.



If a whole card is made clickable, avoid nesting an interactive link inside another link.



Prefer either:



1\. A single card link with visual child content



or



2\. A non-link card containing one explicit project link.



**---**



**# 57. Image Rules**



Use Next.js \`Image\`.



Do not replace project images with plain \`\<img>\`.



Use:



\`\`\`jsx

\<Image

    src={project.image}

    alt={project.title}

    fill

    sizes="..."

/>

\`\`\`



when using a positioned media container.



The image must:



\- preserve aspect ratio

\- avoid layout shift

\- have meaningful alt text

\- remain sharp on high-density screens



**---**



**# 58. Image Hover**



Recommended:



\`\`\`text

scale: 1.02–1.04

\`\`\`



Do not use extreme:



\`\`\`text

scale: 1.15+

\`\`\`



The product screenshot should remain recognizable.



**---**



**# 59. Project Card CTA Motion**



Recommended conceptual interaction:



\`\`\`text

View Project  →

                    hover

View Project    →

\`\`\`



The text stays stable.



Only the arrow moves slightly.



This creates the feeling that the interaction is responsive without looking like a button animation demo.



**---**



**# 60. Dynamic Data Safety**



If a project has no:



\- GitHub

\- live link

\- showcase images

\- contribution points

\- reflection



the relevant section/action should not render empty space.



Use conditional rendering.



**---**



**# 61. Detail Page Route Safety**



If the slug does not exist:



\`\`\`text

/projects/unknown-project

\`\`\`



should use the application's not-found behavior.



Do not render a broken detail page.



Use the project's slug as the canonical identifier.



**---**



**# 62. SEO / Metadata**



Each project detail page should have project-specific metadata.



Conceptually:



\`\`\`text

title:

ClassFuse — Frontend Project | Vishal Kumar Choudhary



description:

A frontend case study of ClassFuse, a Tailwind CSS utility

for cleaning and organizing utility class strings.

\`\`\`



Do not use the same metadata for every project.



**---**



**# 63. What Should Be Removed From Current Detail Page**



The current detail page should avoid repeating the exact main-page presentation.



Specifically reduce duplication around:



\- long project introduction

\- repeated contribution information

\- repeated project summary

\- repeated stack presentation



Instead, use the detail page to add depth.



**---**



**# 64. What Should Remain In Detail Page**



Keep:



\- project identity

\- hero screenshot

\- stack

\- links

\- contribution

\- showcase

\- design/technical decisions

\- reflection

\- improvements

\- next project



These demonstrate actual frontend engineering and product thinking.



**---**



**# 65. Visual Design Direction**



The visual language should remain:



\- dark

\- editorial

\- restrained

\- premium

\- typography-led

\- subtle teal accent

\- thin dividers

\- controlled whitespace

\- minimal rounded corners

\- product-focused



Avoid turning the project section into:



\- dashboard UI

\- card-grid SaaS landing page

\- excessive glassmorphism

\- huge rounded containers

\- neon-heavy developer aesthetic



**---**



**# 66. Radius Rules**



Follow the existing restrained radius system.



Prefer:



\`\`\`text

rounded-sm

rounded-md

\`\`\`



where necessary.



Avoid making every:



\- tab

\- button

\- image

\- section

\- container



a pill or heavily rounded card.



**---**



**# 67. Color Hierarchy**



Use existing design tokens.



Primary:



\- text primary



Secondary:



\- text muted



Accent:



\- teal/cyan project accent



Borders:



\- subtle neutral border



Do not introduce project-specific colors unless the project visual itself requires them.



**---**



**# 68. Desktop Header Relationship**



The fixed/sticky navbar should not visually compete with project content.



Make sure:



\- project content has enough top spacing

\- headings are not hidden behind navbar

\- anchor navigation accounts for sticky header height

\- detail sections do not begin underneath the navigation



The screenshot currently shows the navbar overlaying content in some scroll positions.



This should be checked carefully.



**---**



**# 69. Sticky Navbar Overlap Fix**



For anchor-based sections, use appropriate scroll margin.



Conceptually:



\`\`\`text

scroll-mt-[navbar-height]

\`\`\`



or the project's equivalent spacing token.



Do not solve overlap by adding enormous permanent padding to every section.



**---**



**# 70. Main Page Project Section Completion Criteria**



The Projects section is complete when:



\- [ ] \`PROJECTS\` eyebrow is visible.

\- [ ] \`What I actually built.\` uses controlled responsive typography.

\- [ ] Heading is smaller than the current oversized version.

\- [ ] Desktop heading does not dominate the viewport.

\- [ ] Tablet heading scales correctly.

\- [ ] Mobile heading is readable and compact.

\- [ ] Category tabs remain functional.

\- [ ] \`ALL\` shows every project.

\- [ ] Category filters show only matching projects.

\- [ ] Tabs are generated from project/category data.

\- [ ] Project card content comes from project data.

\- [ ] Project image uses Next.js \`Image\`.

\- [ ] Project CTA navigates to \`/projects/[slug]\`.

\- [ ] Hover arrow moves using group hover/Motion.

\- [ ] Hover does not cause layout shift.

\- [ ] Keyboard focus remains visible.

\- [ ] No unnecessary project-detail content is duplicated.

\- [ ] No horizontal overflow occurs on mobile.



**---**



**# 71. Project Detail Completion Criteria**



The detail page is complete when:



\- [ ] Correct project loads from slug.

\- [ ] Invalid slug uses not-found behavior.

\- [ ] Project title and category are data-driven.

\- [ ] Year is data-driven.

\- [ ] Description is concise.

\- [ ] Hero visual is prominent.

\- [ ] Stack is displayed once in a meaningful location.

\- [ ] Live link is conditional.

\- [ ] GitHub link is conditional.

\- [ ] Contribution is present.

\- [ ] Showcase content is project-specific.

\- [ ] Design/UX decisions explain reasoning.

\- [ ] Technical decisions are concise.

\- [ ] Reflection uses controlled heading scale.

\- [ ] Improvement section is compact.

\- [ ] Previous/next navigation works where available.

\- [ ] No duplicated main-page content overwhelms the detail page.

\- [ ] Mobile layout is fully responsive.

\- [ ] Tablet layout is intentional.

\- [ ] Desktop layout has controlled content width.

\- [ ] Sticky navbar does not cover content.



**---**



**# 72. SectionHeading Completion Criteria**



The shared component is complete when:



\- [ ] Existing API continues to work.

\- [ ] \`size\` controls typography semantically.

\- [ ] \`sm\`, \`default\`, \`lg\`, and optional \`xl\` are supported.

\- [ ] Default is no longer excessively large.

\- [ ] Mobile typography is reduced.

\- [ ] Tablet typography is reduced.

\- [ ] Desktop typography is controlled.

\- [ ] Long editorial text remains readable.

\- [ ] Existing animation still works.

\- [ ] Reduced-motion behavior remains intact.

\- [ ] Heading remains crisp after animation.

\- [ ] No project-specific props are introduced.

\- [ ] No custom CSS is required.

\- [ ] Tailwind remains the styling system.



**---**



**# 73. Final Information Architecture**



The portfolio should now communicate two different levels:



\`\`\`text

HOME

│

├── About

├── Experience

│

└── Projects

      │

      ├── All

      ├── Products

      ├── Tools

      └── Other dynamic categories

            │

            ├── Project Card

            │      └── View Project →

            │

            └── /projects/[slug]

                    │

                    ├── Project Identity

                    ├── Hero

                    ├── Stack + Links

                    ├── Contribution

                    ├── Showcase

                    ├── Decisions

                    ├── Technical Notes

                    ├── Reflection

                    ├── Improvements

                    └── Next Project

\`\`\`



**---**



**# 74. Final Design Principle**



The most important rule for this iteration:



\> **\*\*The main page should make me interested. The detail page should make me trust the work.\*\***



The main Projects section is the portfolio index.



The Project Detail page is the evidence.



Do not make both pages say the same thing at different scroll positions.



The main page should be:



\`\`\`text

FAST

CLEAR

VISUAL

SCANNABLE

\`\`\`



The detail page should be:



\`\`\`text

DETAILED

INTENTIONAL

EVIDENCE-DRIVEN

REFLECTIVE

\`\`\`



And the shared \`SectionHeading\` should provide one consistent typographic language across both, with responsive size variants rather than separate heading systems.
