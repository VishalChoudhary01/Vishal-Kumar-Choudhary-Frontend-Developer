# PROJECT DETAIL LAYOUT — COMPLETE IMPLEMENTATION SPEC

## Objective

Design and implement the **project detail content layout** as a premium editorial portfolio experience.

For this specification, intentionally **exclude**:

- Showcase / Screenshot Gallery
- Footer
- Previous / Next Project Navigation

The focus is the actual project-detail content structure, hierarchy, responsive layering, spacing, typography, and motion.

The page must feel:

- premium
- editorial
- technically credible
- intentional
- calm
- readable
- responsive
- compact where content allows
- free from unnecessary empty space

Do not add sections merely to fill the viewport.

---

# 1. Core Page Structure

The content should follow this hierarchy:

```text
PROJECT DETAIL
│
├── Project Introduction
│
├── Project Context / Overview
│
├── Reflection
│   └── Supporting Reflection Points
│
└── What I Would Improve
```

The sections should feel like **one continuous narrative**, not separate cards.

---

# 2. Existing Portfolio System

Use the existing portfolio design system.

Existing components should be reused wherever applicable:

- `SectionHeading`
- `SectionEyebrow`
- existing typography tokens
- existing container system
- existing border/divider treatment
- existing color tokens
- existing motion utilities/hooks

Do not recreate a competing heading system.

Every major content section should use the existing:

```text
SectionEyebrow
+
SectionHeading
```

where appropriate.

---

# 3. Project Introduction

The project introduction establishes identity and context.

Include:

- project eyebrow/category
- project title
- concise project description
- role
- stack
- project type
- year/status if available
- optional project links if already supported

### Desktop layering

Use an intentional editorial composition:

```text
┌───────────────────────────────────────────────┐
│                                               │
│  EYEBROW                                      │
│                                               │
│        PROJECT TITLE                          │
│        Supporting description                │
│                                               │
│  ───────────────────────────────────────────  │
│                                               │
│  Role     Stack     Type     Year             │
│                                               │
└───────────────────────────────────────────────┘
```

Do not center every element by default.

Use the existing portfolio alignment/grid.

The project title should be the dominant visual element.

Metadata should be visually quieter.

---

# 4. Project Introduction — Responsive Layering

## Desktop

Use multiple visual layers:

### Layer 1 — Background

- page background
- subtle decorative elements if already part of the design

### Layer 2 — Section identity

- eyebrow
- optional decorative section number

### Layer 3 — Primary content

- project title
- description

### Layer 4 — Supporting content

- metadata
- links

The layers should establish hierarchy without overlapping unnecessarily.

---

## Tablet

Reduce the horizontal complexity.

Recommended structure:

```text
EYEBROW

PROJECT TITLE
Description

──────────────

Metadata
```

Do not force the desktop asymmetric layout if it causes cramped content.

The tablet layout should feel deliberate rather than like a broken desktop layout.

---

## Mobile

Use a clear vertical hierarchy:

```text
EYEBROW

PROJECT TITLE

Description

Metadata
```

Do not place multiple metadata groups beside each other if they become too narrow.

Use natural stacking.

Avoid excessive top and bottom padding.

---

# 5. Project Context / Overview

The overview explains:

- what the project is
- what problem it addresses
- what the project focuses on
- what frontend concerns were involved

Use:

- `SectionEyebrow`
- `SectionHeading`
- concise supporting copy

Do not create a large block of uninterrupted text.

---

# 6. Overview Layout

Desktop should use an editorial two-column relationship where useful:

```text
┌────────────────────┬───────────────────────────┐
│ EYEBROW            │                           │
│                    │ SECTION HEADING           │
│                    │                           │
│                    │ Supporting explanation    │
│                    │                           │
└────────────────────┴───────────────────────────┘
```

The left side establishes section identity.

The right side carries the primary information.

The exact proportions should follow the existing portfolio grid.

Do not create a rigid 50/50 split if the content benefits from another ratio.

---

# 7. Overview — Tablet

Tablet can retain the relationship between identity and content if there is enough width.

If not:

```text
EYEBROW
SECTION HEADING
Supporting content
```

Do not squeeze two columns into narrow tablet widths.

The breakpoint should be content-driven.

---

# 8. Overview — Mobile

Mobile should become one readable column:

```text
EYEBROW

SECTION HEADING

Supporting content
```

The heading and paragraph should not be separated by oversized gaps.

The section should move naturally into the next section.

---

# 9. Reflection Section

The reflection communicates the engineering and product thinking behind the project.

Use:

- `SectionEyebrow`
- `SectionHeading`

The main reflection can be a large editorial statement.

Example direction:

> Spendwise became an exercise in connecting several frontend concerns into one product workflow: state management, product data extraction, comparison, responsive UI, and spending visualization.

The exact project content should remain truthful to the actual implementation.

Do not invent functionality.

---

# 10. Reflection Layering

The reflection should use a clear hierarchy:

```text
EYEBROW
        ↓
PRIMARY REFLECTION HEADING
        ↓
DIVIDER
        ↓
SUPPORTING REFLECTION POINTS
```

The main statement should receive the most visual weight.

Supporting points should be smaller.

Do not make every sentence look like a heading.

---

# 11. Reflection Supporting Points

Use concise editorial statements rather than feature cards.

Possible structure:

```text
01

The list-first model gives the product
a clear relationship between shopping
planning, products, prices, and spending.

──────────────────────────────

02

Centralized state management helps
coordinate interactions across the
dashboard, lists, and product workflows.

──────────────────────────────

03

Responsive list-detail interfaces reinforced
the importance of treating mobile as a
deliberate layout.
```

The numbers should remain subtle.

They are structural markers, not decorative hero elements.

---

# 12. Reflection — Desktop Layering

Desktop:

```text
Section identity
        ↓
Large reflection statement
        ↓
Accent/divider
        ↓
Reflection points
```

Supporting points should align to the same content grid.

Avoid creating isolated floating cards.

The section should feel like editorial writing.

---

# 13. Reflection — Tablet Layering

Tablet should reduce the horizontal complexity.

Recommended:

```text
EYEBROW
HEADING

Reflection statement

────────────

Reflection point
────────────
Reflection point
────────────
Reflection point
```

Maintain hierarchy.

Do not retain excessive desktop indentation if it makes the content feel disconnected.

---

# 14. Reflection — Mobile Layering

Mobile should use one strong vertical flow.

```text
EYEBROW

REFLECTION HEADING

Reflection statement

────────────

Point 01
────────────
Point 02
────────────
Point 03
```

The reflection heading must not consume the entire viewport.

Reduce typography progressively.

---

# 15. What I Would Improve

This section communicates engineering maturity.

Use:

```text
WHAT I WOULD IMPROVE

Short, honest explanation of what
would be the next architectural or
product improvement.
```

Example direction:

> The next stage would be to move beyond the current client-side architecture toward persistent user accounts, multi-user data, multiple synchronized lists, and a server-backed data layer.

Only use improvements that are actually relevant to the project.

Do not invent a roadmap.

---

# 16. What I Would Improve — Layout

This section should be intentionally quieter than the reflection.

Desktop:

```text
────────────────────────────────────────────

WHAT I WOULD IMPROVE

        Supporting paragraph
        Supporting paragraph

────────────────────────────────────────────
```

The section does not need a large visual treatment.

Its purpose is clarity and honesty.

---

# 17. Responsive Layering System

The entire page should use a consistent three-stage layout strategy.

## Desktop

Prioritize:

- editorial composition
- asymmetric grid
- strong typography
- layered hierarchy
- generous but controlled spacing

## Tablet

Prioritize:

- content relationships
- reduced horizontal complexity
- smaller typography
- preserved hierarchy

## Mobile

Prioritize:

- single-column flow
- readable line lengths
- compact spacing
- clear hierarchy
- touch-friendly controls
- no horizontal overflow

---

# 18. IMPORTANT — LAYOUT LAYERING

Do not interpret "layering" as putting everything on top of everything.

Layering means **visual hierarchy and spatial relationships**.

Correct:

```text
Background
   ↓
Section identity
   ↓
Heading
   ↓
Supporting content
   ↓
Divider
   ↓
Next content group
```

Incorrect:

```text
Heading
overlapping
paragraph
overlapping
metadata
overlapping
decorative element
```

Unless an intentional decorative effect already exists in the portfolio, content should not overlap.

---

# 19. Container System

Use the existing project container.

The content should have a stable horizontal boundary.

Do not allow:

- text to touch viewport edges
- headings to become unnecessarily wide
- paragraphs to span the entire screen

Desktop may use a wider visual container.

Long-form text should remain narrower.

---

# 20. Content Width Hierarchy

Use different widths intentionally.

### Large heading

Can occupy a wider region.

### Body text

Should use a comfortable reading width.

### Supporting metadata

Can remain compact.

Conceptually:

```text
HEADING
──────────────────────────────────────

Body text
────────────────────────

Metadata
────────────
```

Do not force every element to have the same width.

---

# 21. Spacing Philosophy

The most important rule:

> **Do not add spacing just because the viewport has empty space.**

Spacing must communicate relationships.

Use smaller spacing:

- between eyebrow and heading when they belong together
- between heading and supporting text
- between metadata items

Use larger spacing:

- between major sections
- before a major section begins
- after a substantial editorial statement

Use divider spacing intentionally.

---

# 22. Avoid Unnecessary Spacing

Do NOT:

- add huge `min-height` values to content sections
- vertically center every section
- add `py-40` or `py-48` everywhere
- create blank viewport-sized gaps
- add arbitrary margins to compensate for typography
- push content down simply to make a section feel "premium"

A premium layout is not defined by empty space.

---

# 23. Spacing Relationship Model

Use this hierarchy:

```text
Eyebrow
  ↓ small

Heading
  ↓ moderate

Description
  ↓ moderate

Metadata
  ↓

Section end
  ↓ larger

Next section
```

The spacing between unrelated sections should be noticeably larger than spacing within a content group.

---

# 24. Desktop Spacing

Desktop should feel spacious but efficient.

Do not let a section occupy an entire viewport if its content only requires half of it.

A section should finish when its content finishes.

Prefer content-driven spacing over viewport-driven spacing.

---

# 25. Tablet Spacing

Reduce desktop spacing.

Example conceptual direction:

```text
Desktop:
large section spacing

Tablet:
medium-large section spacing

Mobile:
medium section spacing
```

Do not simply keep desktop padding at tablet sizes.

---

# 26. Mobile Spacing

Mobile requires the most discipline.

Avoid:

- oversized top padding
- oversized bottom padding
- giant gaps between heading and paragraph
- excessive divider spacing

The visitor should be able to move through the story efficiently.

---

# 27. Typography Scaling

Use responsive Tailwind classes.

Do not use one giant fixed heading size across every breakpoint.

Conceptual pattern:

```text
Desktop → large
Tablet  → medium-large
Mobile  → medium
```

The heading should scale based on available width and line wrapping.

Avoid awkward:

```text
one
word
per
line
```

wrapping.

---

# 28. Line Length

Body content should have a comfortable maximum width.

Avoid:

```text
This is a paragraph that stretches from one side of the
screen to the other and becomes difficult to read...
```

Prefer a controlled measure.

This is especially important for the reflection section.

---

# 29. Dividers

Use thin dividers to establish rhythm.

Dividers should:

- use existing border colors
- remain subtle
- align with content
- separate meaningful groups

Do not place dividers after every sentence.

---

# 30. Decorative Numbers

If the existing design uses oversized background numbers:

```text
01
02
03
```

they should remain:

- very low contrast
- behind the content
- non-interactive
- visually secondary

They must never reduce text readability.

On mobile, reduce their size or hide them if they interfere with content.

---

# 31. Motion

Use `motion/react`.

Motion should support hierarchy.

Recommended:

### Section entrance

```text
opacity: 0 → 1
y: small positive value → 0
```

### Text reveal

Use subtle word/line reveal only where already consistent with the portfolio.

### Dividers

A small accent line may reveal horizontally.

Do not animate every paragraph independently.

---

# 32. Motion Rules by Device

Desktop:

- subtle section reveals
- optional editorial text reveal

Tablet:

- reduce movement distance

Mobile:

- keep animation short and lightweight

Reduced motion:

- remove movement
- preserve readable content
- avoid animation-dependent layout

---

# 33. Existing SectionHeading Behavior

The existing `SectionHeading` component should remain the source of truth.

Do not create:

```text
ProjectSectionTitle
CustomHeading
ReflectionHeading
OverviewHeading
```

if they duplicate the same functionality.

Instead configure the existing heading component through props.

---

# 34. Existing SectionEyebrow Behavior

Use the existing `SectionEyebrow` for:

- section labels
- section identity
- editorial context

Do not replace it with arbitrary uppercase text styled manually.

---

# 35. Component Architecture

Suggested structure:

```text
ProjectDetail
│
├── ProjectIntro
│
├── ProjectOverview
│
├── ProjectReflection
│   ├── ReflectionHeader
│   └── ReflectionPoints
│
└── ProjectImprovement
```

Use the existing shared heading components inside these sections.

Keep components focused.

Do not over-componentize simple text blocks.

---

# 36. Data-Driven Project Content

Project-specific information should come from structured data where practical.

Example:

```js
{
  title,
  eyebrow,
  description,
  role,
  stack,
  type,
  year,
  overview,
  reflection,
  reflectionPoints,
  improvements
}
```

The layout should remain reusable for other projects.

---

# 37. Accessibility

Ensure:

- semantic heading order
- readable contrast
- keyboard accessibility for links
- visible focus states
- meaningful link labels
- reduced-motion support

Do not skip heading levels simply for visual sizing.

---

# 38. Performance

Keep the content page lightweight.

Avoid unnecessary:

- client components
- scroll listeners
- layout measurements
- animation loops

Use motion only where it provides actual value.

---

# 39. Engineering Quality

Before considering implementation complete:

- no console errors
- no hydration warnings
- no invalid nesting
- no unused imports
- no unnecessary client-side rendering
- no horizontal overflow
- no duplicated heading logic
- no layout shift
- no accidental fixed heights
- no breakpoint-specific hacks unless justified

---

# 40. Visual Quality Rules

The page should feel:

- editorial
- premium
- restrained
- spacious but not empty
- technical
- human
- intentional

Avoid:

- excessive rounded cards
- pills everywhere
- glassmorphism
- giant gradients
- decorative blobs
- fake metrics
- fake product claims
- oversized empty sections
- excessive animations
- unnecessary visual noise

---

# 41. PARAMETERS OF DONE

## Structure

- [ ] Project introduction exists.
- [ ] Project context/overview exists.
- [ ] Reflection section exists.
- [ ] Reflection supporting points exist.
- [ ] What I Would Improve exists.
- [ ] Showcase gallery is intentionally excluded from this implementation scope.
- [ ] Footer/project navigation is intentionally excluded from this implementation scope.

## Existing Components

- [ ] `SectionHeading` is reused.
- [ ] `SectionEyebrow` is reused.
- [ ] Existing typography system is preserved.
- [ ] Existing container system is preserved.
- [ ] Existing design tokens are preserved.

## Desktop

- [ ] Editorial hierarchy is clear.
- [ ] Layout uses intentional columns/layers.
- [ ] Content does not stretch unnecessarily.
- [ ] Heading scale is controlled.
- [ ] Section spacing is generous but content-driven.
- [ ] No viewport-sized empty gaps are introduced.

## Tablet

- [ ] Desktop composition transitions intentionally.
- [ ] Columns collapse when content becomes cramped.
- [ ] Typography scales down.
- [ ] Horizontal padding remains balanced.
- [ ] Section spacing is reduced appropriately.
- [ ] No desktop spacing values blindly carry over.

## Mobile

- [ ] Layout becomes a clean single-column flow.
- [ ] Heading sizes are reduced.
- [ ] Eyebrow remains visible and aligned.
- [ ] Metadata stacks naturally.
- [ ] Reflection remains readable.
- [ ] No horizontal overflow exists.
- [ ] No unnecessary vertical whitespace exists.
- [ ] No section is artificially stretched to fill the viewport.

## Layering

- [ ] Background is visually separate from content.
- [ ] Section identity is distinct.
- [ ] Heading is dominant.
- [ ] Supporting content is secondary.
- [ ] Dividers establish rhythm.
- [ ] Decorative numbers never compete with content.
- [ ] No accidental content overlap exists.

## Spacing

- [ ] Spacing reflects content relationships.
- [ ] Related elements are grouped tightly.
- [ ] Major sections have clear separation.
- [ ] Empty space is intentional.
- [ ] No arbitrary `min-height` is used to create visual gaps.
- [ ] No excessive padding is repeated across every section.

## Typography

- [ ] Heading hierarchy is obvious.
- [ ] Desktop heading does not dominate unnecessarily.
- [ ] Tablet heading scales appropriately.
- [ ] Mobile heading remains readable.
- [ ] Body text has comfortable line length.
- [ ] Supporting text does not look like a heading.

## Motion

- [ ] Motion uses `motion/react`.
- [ ] Motion is subtle.
- [ ] Motion supports hierarchy.
- [ ] Mobile motion is lighter.
- [ ] Reduced motion is respected.
- [ ] Content does not depend on animation completion.

## Product / UX

- [ ] Visitor understands the project quickly.
- [ ] Visitor understands the project's purpose.
- [ ] Visitor understands the frontend/engineering thinking.
- [ ] Reflection feels authentic.
- [ ] Improvement section communicates maturity.
- [ ] The entire page reads as one continuous story.

## Final Quality

- [ ] No unnecessary sections.
- [ ] No unnecessary spacing.
- [ ] No unnecessary decoration.
- [ ] No duplicated design systems.
- [ ] No broken responsive behavior.
- [ ] No console/hydration errors.
- [ ] Production-ready across desktop, tablet, and mobile.

---

# FINAL INSTRUCTION

Implement this as a **content-first project detail layout**, not a collection of oversized sections.

The most important design principle is:

> **Every pixel of space should have a reason.**

Use strong typography and hierarchy where content deserves attention.

Use whitespace to separate ideas, not to artificially make the page longer.

Use desktop layering for editorial composition.

Use tablet layering to simplify the composition before it becomes cramped.

Use mobile layering to create a clean single-column reading experience.

The final result should feel like a senior designer and frontend engineer deliberately composed the page — not like a desktop layout that was simply given smaller widths.
