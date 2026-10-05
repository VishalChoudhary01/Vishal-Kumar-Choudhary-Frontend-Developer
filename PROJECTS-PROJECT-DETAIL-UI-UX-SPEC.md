# PROJECTS + PROJECT DETAIL PAGE — UI/UX IMPLEMENTATION SPEC

## 1. Purpose

This document defines the final behavior and layout for:

1. The **main portfolio Projects section**
2. The **Project card interaction**
3. The **Project detail page**
4. The shared **SectionHeading** sizing system
5. Responsive behavior across desktop, tablet, and mobile
6. Dynamic project-category tabs
7. Project navigation and detail-page content boundaries

The goal is to make the portfolio feel like a curated product/design portfolio rather than a collection of repeated project descriptions.

---

# 2. Core UX Decision

## Main Projects section

The main portfolio page answers:

> **What did I build?**

It should be fast to scan.

It contains:
- project category
- year
- project name
- short description
- project visual
- technology stack
- small contribution summary
- primary project navigation action

It should **not** contain the complete case study.

---

## Project Detail page

The detail page answers:

> **How did I build it, why did I build it, and what did I contribute?**

It should contain:
- project identity
- concise project summary
- large hero visual
- stack
- live/project links
- contribution
- selected product/interface decisions
- screenshots/showcase
- technical/product challenges
- implementation decisions
- reflection
- possible improvements
- next/previous project navigation

The detail page should **not simply repeat the entire main project card**.

---

# 3. Main Projects Section

## Section identity

Use:

### Eyebrow

`PROJECTS`

### Heading

`What I actually built.`

Keep the current editorial tone.

Do not create a different heading style for Projects just because the detail page also uses a heading.

Instead, control visual scale through the shared `SectionHeading` component.

---

# 4. Main Projects Section Layout

Recommended desktop structure:

```text
PROJECTS

What I actually built.
────────────────────────────────────────

ALL     PRODUCTS     EXPERIMENTS     TOOLS

                2026
                DEVELOPER TOOL
                ClassFuse

                Short project description...

                ┌───────────────────────────────┐
                │                               │
                │       PROJECT VISUAL          │
                │                               │
                └───────────────────────────────┘

                Stack
                Next.js · React · JavaScript · ...

                MY CONTRIBUTION

                Short contribution summary...

                View Project →
```

The project visual should remain the dominant visual element.

---

# 5. Project Category Tabs

The category system must remain functional and data-driven.

Do **not hard-code individual project cards into category-specific components**.

Project data should contain a category/type.

Example:

```js
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
```

The tabs should be generated from available project categories.

Example:

```js
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
```

The exact categories can grow later.

---

# 6. Dynamic Category Behavior

The category filter must:

- remain functional
- filter project cards without page reload
- preserve the existing visual design
- support an `ALL` state
- support future project types
- avoid hard-coded assumptions about ClassFuse
- work correctly on mobile
- animate filtering subtly

Filtering logic:

```js
const filteredProjects =
    activeCategory === "all"
        ? projects
        : projects.filter(
              (project) => project.category === activeCategory
          );
```

Do not create a separate page for every category unless there is a future product reason to do so.

---

# 7. Category Tab Interaction

Active tab:

- teal/accent text
- visible bottom indicator
- stronger visual weight

Inactive tab:

- muted text
- no heavy container
- no pill background
- subtle hover transition

Avoid:

- oversized rounded pills
- large tab buttons
- excessive borders
- card-like tabs

The current editorial portfolio uses thin lines and typography; preserve that language.

---

# 8. Project Card

The project card should communicate enough information to make the user want to open the detail page.

## Card content

Required:

- year
- project type/category
- project title
- short description
- project visual
- technology stack
- short contribution
- `View Project` action

Optional:

- small status label
- live project indicator
- GitHub indicator

Do not add every possible metadata field.

---

# 9. Project Card Hover

The project visual is the primary interaction surface.

On hover:

1. Project visual can subtly scale.
2. Overlay should remain restrained.
3. `View Project` action appears or becomes more prominent.
4. Arrow moves toward the right.
5. Project title/visual should not jump.
6. No aggressive zoom.
7. No excessive glow.

The arrow movement should use a `group-hover` interaction.

Example behavior:

```text
View Project  →
             →
```

The arrow should translate slightly on hover.

Use a parent `group` and:

```text
group-hover:translate-x-1
```

or an equivalent Motion interaction.

---

# 10. View Project Button

The project card action is a navigation action.

Its job is:

> Open the project's dedicated detail page.

Recommended label:

`View Project`

Alternative labels may be used globally, but keep one consistent action across the portfolio.

Do not use:

- Read More
- Explore
- Learn More
- Details

unless the portfolio intentionally adopts a different vocabulary.

`View Project` is clearer for a developer portfolio.

---

# 11. Project Navigation

The project action should navigate to:

```text
/projects/[slug]
```

Example:

```text
/projects/class-fuse
/projects/spendwise
```

The slug must come from project data.

Do not hard-code navigation inside each project card.

Example:

```js
href={`/projects/${project.slug}`}
```

The entire visual can optionally be clickable, but the explicit `View Project` action must remain discoverable.

---

# 12. Main Page Content Boundary

The main page should **not** contain:

- long reflection
- detailed problem solving
- full technical architecture
- long challenge explanations
- detailed implementation decisions
- complete project story
- multiple paragraphs of retrospective content

Those belong to the detail page.

The main page should feel like a **portfolio index**.

---

# 13. Main Page Project Information Density

Recommended:

```text
Project name
1 short description
Stack
1 contribution paragraph
1 action
```

Avoid:

```text
Project name
Long description
5 challenge paragraphs
10 feature bullets
technical architecture
reflection
improvements
links
```

That creates unnecessary duplication.

---

# 14. Shared SectionHeading Problem

The current `SectionHeading` component is being used in both:

- main portfolio sections
- project detail sections

The same component should remain the source of truth.

Do **not** create another heading component only to fix project detail sizing.

Instead, make the existing `size` API meaningful.

---

# 15. SectionHeading Size System

The current component already supports:

```js
size = "default"
```

and:

```js
EDITORIAL_SIZE
MINIMAL_SIZE
```

Use these size variants intentionally.

Recommended semantic sizes:

```text
sm
default
lg
xl
```

The exact Tailwind classes can be adjusted to the existing typography tokens, but the hierarchy should be:

### Desktop

```text
sm       → small section/supporting heading
default  → normal editorial section heading
lg       → major page heading
xl       → hero-only heading
```

Do not use `xl` for ordinary project sections.

---

# 16. Projects Main Heading

For:

```text
PROJECTS
What I actually built.
```

Use:

```jsx
<SectionHeading
    heading="PROJECTS"
    supporting="What I actually built."
    size="default"
/>
```

The heading should be large enough to feel editorial but should not dominate the entire viewport.

---

# 17. Project Detail Heading

The detail page should use the same component but a controlled size.

Example:

```jsx
<SectionHeading
    heading="SHOWCASE"
    supporting="The interface, captured in the details that matter."
    size="default"
/>
```

Do not make the detail-page heading larger simply because it is a detail page.

This prevents the problem visible in the current screenshots where:

- main page heading is huge
- detail page heading is also huge
- long editorial text becomes visually overwhelming
- the page loses hierarchy

---

# 18. Desktop Heading Reduction

The current desktop editorial heading is visually too large for repeated project/detail sections.

Reduce the default desktop size.

Target:

```text
Main Projects:
approximately 64–80px visual scale

Detail section:
approximately 56–72px visual scale

Hero:
can remain larger when intentionally used
```

Do not blindly use one giant `text-8xl` class everywhere.

The heading should respond to content length.

A long sentence should automatically receive a smaller semantic size than a short headline.

---

# 19. Tablet Heading

Tablet should reduce further.

Target:

```text
Projects:
approximately 48–60px

Detail editorial heading:
approximately 44–56px
```

The heading should not occupy most of the viewport height.

---

# 20. Mobile Heading

Mobile needs a significant reduction.

Target:

```text
Projects:
approximately 34–42px

Detail editorial heading:
approximately 32–40px
```

Long headings should wrap naturally.

Do not force extremely large text on mobile.

Avoid:

```text
text-7xl
text-8xl
```

for ordinary mobile section headings.

---

# 21. Mobile Editorial Typography Rules

On mobile:

- reduce heading size
- reduce line-height
- keep readable line length
- avoid excessive top/bottom spacing
- maintain the eyebrow-to-heading relationship
- keep decorative number subtle
- avoid horizontal overflow

Recommended hierarchy:

```text
EYEBROW
↓
small gap
↓
HEADING
↓
short divider
↓
content
```

---

# 22. SectionHeading Responsive API

The component should allow a semantic size to determine responsive typography.

Example conceptual mapping:

```js
EDITORIAL_SIZE = {
    sm: "text-3xl md:text-4xl lg:text-5xl",
    default: "text-4xl md:text-5xl lg:text-6xl",
    lg: "text-5xl md:text-6xl lg:text-7xl",
    xl: "text-6xl md:text-7xl lg:text-8xl",
};
```

These values are examples, not mandatory exact values.

Adjust them against the existing design tokens and actual font metrics.

The important rule is:

> **Only hero-level typography should approach extreme display sizes.**

---

# 23. Detail Page Structure

The detail page should be structured as a case-study-like project presentation.

Recommended order:

```text
1. Project Header
2. Hero / Primary Visual
3. Project Meta
4. Stack + Links
5. Contribution
6. Project Showcase
7. Key Product / UX Decisions
8. Technical / Implementation Notes
9. Reflection
10. What I Would Improve
11. Continue Exploring
12. Next Project
```

---

# 24. Project Detail Header

The top of the detail page should establish identity immediately.

Recommended:

```text
2026                     DEVELOPER TOOL

ClassFuse

A Tailwind CSS utility for cleaning and organizing
class lists by removing duplicate and conflicting
utilities and producing cleaner, more readable
class strings.
```

This is enough.

Do not repeat the entire contribution section here.

---

# 25. Hero Visual

The hero visual should be the strongest visual element.

For ClassFuse:

- use the actual product screenshot
- preserve aspect ratio
- show enough interface detail
- use restrained border treatment
- avoid excessive rounded cards
- maintain the dark editorial environment

The visual should feel like a product artifact, not a decorative image.

---

# 26. Project Meta

Immediately around the hero, show concise metadata.

Recommended:

```text
2026
Developer Tool

Next.js · React · JavaScript · Tailwind CSS
Redux Toolkit · Motion · Lenis · next-themes
```

Do not repeat the same stack in several locations.

---

# 27. Links

Project links should remain visible and easy to find.

Recommended:

```text
View Project →
GitHub ↗
```

If there is no GitHub repository, do not render the GitHub action.

If there is no live site, do not render the live-site action.

Data-driven conditional rendering is required.

---

# 28. Contribution Section

Use:

```text
MY CONTRIBUTION
```

Then one concise paragraph.

Example:

> Designed and developed the frontend interface for a Tailwind CSS utility focused on cleaning, organizing, and formatting utility class strings.

Then use a small number of concrete contribution points.

Recommended:

```text
• Clean and format multiline Tailwind class lists
• Remove duplicate utility classes
• Handle conflicting Tailwind utilities
• Organize utilities into a cleaner Tailwind class order
```

Do not make this a huge résumé-style list.

---

# 29. Stack Placement

The stack can remain close to the project hero because it is useful metadata.

Do not build a giant technology grid.

Recommended presentation:

```text
Next.js · React · JavaScript · Tailwind CSS · Redux Toolkit · Motion · Lenis
```

Typography should be compact and secondary.

---

# 30. Project Showcase

This is where the detail page should become visually different from the main page.

Use multiple product screenshots or focused interface captures.

Possible structure:

```text
SHOWCASE

The interface, captured in the details that matter.

[large screenshot]

[focused screenshot]     [focused screenshot]

[large screenshot]
```

Each screenshot should have a reason for existing.

Avoid screenshot galleries where every image looks identical.

---

# 31. Showcase Captions

Use captions only when they add context.

Example:

```text
Input workflow
Cleaning multiline Tailwind utility strings.

Output workflow
Organized utility classes ready to copy.
```

Do not write long paragraphs below every screenshot.

---

# 32. Product / UX Decisions

This section should explain decisions that demonstrate design thinking.

Example:

```text
DESIGN DECISIONS

Immediate feedback
The interface keeps input and output close together so the result
can be understood without navigating away.

Focused workflow
The product centers on one developer task instead of introducing
unnecessary dashboard complexity.

Readable output
The cleaned class string remains easy to scan and copy.
```

This is much more valuable than simply listing features.

---

# 33. Technical Decisions

Use a short technical section where relevant.

Example:

```text
IMPLEMENTATION

Tailwind CSS is both the subject of the utility and the styling
system of the product.

Motion is used for interaction and transition feedback rather
than decorative animation.

Smooth scrolling is used to make the portfolio presentation feel
more intentional without interfering with the utility itself.
```

Keep this section concise.

---

# 34. Reflection

The existing reflection section is visually too large.

Current concept:

> ClassFuse combines a focused developer utility with a frontend interface designed around immediate input, processing, and output.

This is good content but should be treated as a **reflection statement**, not a giant hero.

Use a smaller editorial heading size.

Example:

```text
REFLECTION

ClassFuse combines a focused developer utility with a frontend
interface designed around immediate input, processing, and output.
```

Then follow with supporting observations.

---

# 35. Reflection Supporting Content

The existing points are appropriate:

```text
Keeping the product centered around one developer workflow
makes the interface easy to understand.

Using Tailwind CSS as both the product domain and the application's
styling system keeps the project closely aligned with its purpose.

Motion and smooth scrolling add interaction without replacing
the utility's primary function.
```

Keep them as separate editorial rows.

Do not convert every statement into a large heading.

---

# 36. What I Would Improve

Keep this section.

It demonstrates self-evaluation.

Recommended:

```text
WHAT I WOULD IMPROVE

Further improvements would depend on the next product requirements,
particularly around expanding formatting capabilities and refining
the developer workflow.
```

This section should be compact.

It should not occupy an enormous vertical space.

---

# 37. Detail Page Spacing

The detail page should use intentional rhythm.

Recommended hierarchy:

```text
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
```

Avoid huge blank gaps between every section.

Whitespace should create hierarchy, not simply increase page length.

---

# 38. Existing Detail Page Problem

The current screenshots show two important issues:

### Problem 1

The editorial headings are too large.

### Problem 2

The detail page contains some information that belongs more naturally to the main project card.

The solution is not to remove useful information.

The solution is to assign each piece of information to the correct page.

---

# 39. Main Page vs Detail Page Responsibility

| Content | Main Page | Detail Page |
|---|---:|---:|
| Project title | Yes | Yes |
| Short description | Yes | Yes, concise |
| Year | Yes | Yes |
| Category | Yes | Yes |
| Stack | Yes | Yes |
| Contribution | Short | Full |
| Project visual | Yes | Yes |
| Multiple screenshots | No | Yes |
| UX decisions | No | Yes |
| Technical decisions | No | Yes |
| Reflection | No | Yes |
| Improvements | No | Yes |
| GitHub | Optional | Yes if available |
| Live project | Yes | Yes |
| Next project | No | Yes |

---

# 40. Continue Exploring

The bottom navigation should remain.

Recommended:

```text
CONTINUE EXPLORING
────────────────────────────────────

NEXT

Spendwise →
```

It should feel like a natural transition rather than a giant CTA.

If there is a previous project, optionally provide:

```text
← Previous
Next →
```

Do not make this section unnecessarily tall.

---

# 41. Project Data Model

Use a single project data source.

Example:

```js
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
            live: "https://class-fuse.vercel.app",
            github: "",
        },
        showcase: [],
        decisions: [],
        reflection: "",
        improvements: "",
    },
];
```

The exact schema can evolve, but the important rule is:

> **Project cards and project detail pages should consume the same project data.**

---

# 42. Suggested Folder Structure

```text
app/
├── page.js
├── projects/
│   └── [slug]/
│       └── page.js
│
components/
├── projects/
│   ├── ProjectsSection.jsx
│   ├── ProjectFilters.jsx
│   ├── ProjectList.jsx
│   ├── ProjectCard.jsx
│   ├── ProjectCardMedia.jsx
│   ├── ProjectCardMeta.jsx
│   ├── ProjectCardAction.jsx
│   │
│   └── detail/
│       ├── ProjectDetailHeader.jsx
│       ├── ProjectDetailHero.jsx
│       ├── ProjectMeta.jsx
│       ├── ProjectContribution.jsx
│       ├── ProjectShowcase.jsx
│       ├── ProjectDecisions.jsx
│       ├── ProjectTechnicalNotes.jsx
│       ├── ProjectReflection.jsx
│       ├── ProjectImprovements.jsx
│       └── ProjectNextNavigation.jsx
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
```

Do not over-componentize trivial markup.

The split should exist where components have a clear responsibility.

---

# 43. SectionHeading Component Rules

Keep the current API:

```jsx
<SectionHeading
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
```

The `size` prop is the primary control for hierarchy.

Do not introduce project-specific props such as:

```text
projectHeading
detailHeading
classFuseHeading
```

That would couple the reusable component to one page.

---

# 44. SectionHeading Implementation Principle

The component should:

1. Resolve heading/supporting aliases.
2. Resolve alignment.
3. Respect reduced motion.
4. Use the existing word animation.
5. Select typography from the size map.
6. Keep the same editorial composition.
7. Remain responsive.
8. Avoid project-specific styling.

The existing animation logic should remain intact unless there is a visual bug.

---

# 45. Reduced Motion

Keep:

```js
const prefersReduced = useReducedMotion();
```

and:

```js
const shouldAnimate = animate && !prefersReduced;
```

Do not remove accessibility behavior while changing typography.

The heading should still render correctly when animation is disabled.

---

# 46. Heading Animation

Do not make the heading animation more dramatic to compensate for smaller typography.

The purpose is:

> reveal → settle → read

not:

> animate → distract → read

After animation completes, text must remain crisp and stable.

---

# 47. Desktop Layout Width

The current project content should not become excessively wide.

Recommended:

```text
Main content:
max-width around 1100–1200px

Editorial text:
max-width around 850–1000px

Long reflection:
max-width around 900px
```

Exact values should follow the existing container system.

---

# 48. Project Detail Text Width

Long editorial text should not span the entire browser width.

For a large desktop display:

```text
|-----------------------------------------------|
|       readable editorial content              |
|-----------------------------------------------|
```

Avoid:

```text
|---------------------------------------------------------------|
| extremely long line across entire viewport                    |
|---------------------------------------------------------------|
```

The screenshots currently show the correct general direction, but the typography is oversized.

---

# 49. Mobile Main Projects

Mobile should prioritize:

```text
PROJECTS
What I actually built.

ALL   PRODUCTS   TOOLS

2026
DEVELOPER TOOL

ClassFuse

Short description

[project visual]

Stack

MY CONTRIBUTION

Short summary

View Project →
```

Avoid forcing desktop two-column structures onto mobile.

---

# 50. Mobile Project Card

On mobile:

- stack content vertically
- keep project visual large enough to inspect
- reduce metadata spacing
- keep action reachable
- prevent long stack strings from causing overflow
- allow description to wrap naturally
- keep category tabs horizontally scrollable if necessary

Do not shrink everything until it becomes unreadable.

---

# 51. Mobile Category Tabs

If categories exceed available width:

```text
ALL  PRODUCTS  TOOLS  EXPERIMENTS →
```

Use horizontal scrolling.

Do not wrap categories into multiple rows unless there is a strong design reason.

Hide the scrollbar visually if the existing design system supports that without custom CSS.

---

# 52. Tablet

Tablet should sit between desktop and mobile.

Use:

- reduced heading size
- reduced section gaps
- project visual width around content container
- readable text width
- same category behavior
- same navigation behavior

Do not create a tablet-only information architecture.

---

# 53. Interaction Motion

Use `motion/react`.

Recommended:

### Filter change

Small opacity/position transition.

### Card hover

Small media scale.

### Arrow

Small horizontal movement.

### Detail page sections

Subtle reveal when entering viewport.

Avoid:

- large rotations
- excessive parallax
- springy card movement
- continuous animation
- excessive blur
- distracting 3D effects

The project content is the hero.

---

# 54. Hover State Accessibility

Do not make important information available only on hover.

The `View Project` action must remain accessible through normal layout and keyboard navigation.

The hover treatment is enhancement, not the only navigation mechanism.

---

# 55. Keyboard Interaction

Project cards/actions must support:

- keyboard focus
- visible focus state
- Enter activation
- normal Next.js navigation

Do not remove browser focus behavior.

If a whole card is made clickable, avoid nesting an interactive link inside another link.

Prefer either:

1. A single card link with visual child content

or

2. A non-link card containing one explicit project link.

---

# 56. Image Rules

Use Next.js `Image`.

Do not replace project images with plain `<img>`.

Use:

```jsx
<Image
    src={project.image}
    alt={project.title}
    fill
    sizes="..."
/>
```

when using a positioned media container.

The image must:

- preserve aspect ratio
- avoid layout shift
- have meaningful alt text
- remain sharp on high-density screens

---

# 57. Image Hover

Recommended:

```text
scale: 1.02–1.04
```

Do not use extreme:

```text
scale: 1.15+
```

The product screenshot should remain recognizable.

---

# 58. Project Card CTA Motion

Recommended conceptual interaction:

```text
View Project  →
                    hover
View Project    →
```

The text stays stable.

Only the arrow moves slightly.

This creates the feeling that the interaction is responsive without looking like a button animation demo.

---

# 59. Dynamic Data Safety

If a project has no:

- GitHub
- live link
- showcase images
- contribution points
- reflection

the relevant section/action should not render empty space.

Use conditional rendering.

---

# 60. Detail Page Route Safety

If the slug does not exist:

```text
/projects/unknown-project
```

should use the application's not-found behavior.

Do not render a broken detail page.

Use the project's slug as the canonical identifier.

---

# 61. SEO / Metadata

Each project detail page should have project-specific metadata.

Conceptually:

```text
title:
ClassFuse — Frontend Project | Vishal Kumar Choudhary

description:
A frontend case study of ClassFuse, a Tailwind CSS utility
for cleaning and organizing utility class strings.
```

Do not use the same metadata for every project.

---

# 62. What Should Be Removed From Current Detail Page

The current detail page should avoid repeating the exact main-page presentation.

Specifically reduce duplication around:

- long project introduction
- repeated contribution information
- repeated project summary
- repeated stack presentation

Instead, use the detail page to add depth.

---

# 63. What Should Remain In Detail Page

Keep:

- project identity
- hero screenshot
- stack
- links
- contribution
- showcase
- design/technical decisions
- reflection
- improvements
- next project

These demonstrate actual frontend engineering and product thinking.

---

# 64. Visual Design Direction

The visual language should remain:

- dark
- editorial
- restrained
- premium
- typography-led
- subtle teal accent
- thin dividers
- controlled whitespace
- minimal rounded corners
- product-focused

Avoid turning the project section into:

- dashboard UI
- card-grid SaaS landing page
- excessive glassmorphism
- huge rounded containers
- neon-heavy developer aesthetic

---

# 65. Radius Rules

Follow the existing restrained radius system.

Prefer:

```text
rounded-sm
rounded-md
```

where necessary.

Avoid making every:

- tab
- button
- image
- section
- container

a pill or heavily rounded card.

---

# 66. Color Hierarchy

Use existing design tokens.

Primary:

- text primary

Secondary:

- text muted

Accent:

- teal/cyan project accent

Borders:

- subtle neutral border

Do not introduce project-specific colors unless the project visual itself requires them.

---

# 67. Desktop Header Relationship

The fixed/sticky navbar should not visually compete with project content.

Make sure:

- project content has enough top spacing
- headings are not hidden behind navbar
- anchor navigation accounts for sticky header height
- detail sections do not begin underneath the navigation

The screenshot currently shows the navbar overlaying content in some scroll positions.

This should be checked carefully.

---

# 68. Sticky Navbar Overlap Fix

For anchor-based sections, use appropriate scroll margin.

Conceptually:

```text
scroll-mt-[navbar-height]
```

or the project's equivalent spacing token.

Do not solve overlap by adding enormous permanent padding to every section.

---

# 69. Main Page Project Section Completion Criteria

The Projects section is complete when:

- [ ] `PROJECTS` eyebrow is visible.
- [ ] `What I actually built.` uses controlled responsive typography.
- [ ] Heading is smaller than the current oversized version.
- [ ] Desktop heading does not dominate the viewport.
- [ ] Tablet heading scales correctly.
- [ ] Mobile heading is readable and compact.
- [ ] Category tabs remain functional.
- [ ] `ALL` shows every project.
- [ ] Category filters show only matching projects.
- [ ] Tabs are generated from project/category data.
- [ ] Project card content comes from project data.
- [ ] Project image uses Next.js `Image`.
- [ ] Project CTA navigates to `/projects/[slug]`.
- [ ] Hover arrow moves using group hover/Motion.
- [ ] Hover does not cause layout shift.
- [ ] Keyboard focus remains visible.
- [ ] No unnecessary project-detail content is duplicated.
- [ ] No horizontal overflow occurs on mobile.

---

# 70. Project Detail Completion Criteria

The detail page is complete when:

- [ ] Correct project loads from slug.
- [ ] Invalid slug uses not-found behavior.
- [ ] Project title and category are data-driven.
- [ ] Year is data-driven.
- [ ] Description is concise.
- [ ] Hero visual is prominent.
- [ ] Stack is displayed once in a meaningful location.
- [ ] Live link is conditional.
- [ ] GitHub link is conditional.
- [ ] Contribution is present.
- [ ] Showcase content is project-specific.
- [ ] Design/UX decisions explain reasoning.
- [ ] Technical decisions are concise.
- [ ] Reflection uses controlled heading scale.
- [ ] Improvement section is compact.
- [ ] Previous/next navigation works where available.
- [ ] No duplicated main-page content overwhelms the detail page.
- [ ] Mobile layout is fully responsive.
- [ ] Tablet layout is intentional.
- [ ] Desktop layout has controlled content width.
- [ ] Sticky navbar does not cover content.

---

# 71. SectionHeading Completion Criteria

The shared component is complete when:

- [ ] Existing API continues to work.
- [ ] `size` controls typography semantically.
- [ ] `sm`, `default`, `lg`, and optional `xl` are supported.
- [ ] Default is no longer excessively large.
- [ ] Mobile typography is reduced.
- [ ] Tablet typography is reduced.
- [ ] Desktop typography is controlled.
- [ ] Long editorial text remains readable.
- [ ] Existing animation still works.
- [ ] Reduced-motion behavior remains intact.
- [ ] Heading remains crisp after animation.
- [ ] No project-specific props are introduced.
- [ ] No custom CSS is required.
- [ ] Tailwind remains the styling system.

---

# 72. Final Information Architecture

The portfolio should now communicate two different levels:

```text
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
            │      └── View Project →
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
```

---

# 73. Final Design Principle

The most important rule for this iteration:

> **The main page should make me interested. The detail page should make me trust the work.**

The main Projects section is the portfolio index.

The Project Detail page is the evidence.

Do not make both pages say the same thing at different scroll positions.

The main page should be:

```text
FAST
CLEAR
VISUAL
SCANNABLE
```

The detail page should be:

```text
DETAILED
INTENTIONAL
EVIDENCE-DRIVEN
REFLECTIVE
```

And the shared `SectionHeading` should provide one consistent typographic language across both, with responsive size variants rather than separate heading systems.
