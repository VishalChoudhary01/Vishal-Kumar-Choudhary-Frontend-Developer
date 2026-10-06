# PROJECT DETAIL PAGE REFINEMENT SPECIFICATION

**Scope:** Existing portfolio project-detail pages\
**Primary goal:** Refine content, typography, spacing, layout,
responsive behavior, and information hierarchy without breaking the
existing main page, project detail routes, project data, or parameters.

------------------------------------------------------------------------

## 1. SOURCE OF TRUTH

Use the existing project data as the authoritative content source.

Current projects:

-   `class-fuse`
-   `spendwise`
-   `system-canvas`
-   `nextjs-master`

The existing data contains project identity, description, role, year,
technologies, contribution, features, media, links, presentation,
motion, content flags, and story sections. Do not invent unsupported
functionality, users, metrics, business outcomes, backend architecture,
authentication, databases, APIs, analytics results, or performance
scores.

The implementation may **trim, combine, clarify, or rewrite existing
wording** for readability, but must preserve its meaning.

The supplied project data already contains dedicated Context, Approach,
Design, Engineering, Motion, Responsive, Showcase, Reflection, and
Improvement content. The problem is primarily presentation density and
repetition, not missing content.

------------------------------------------------------------------------

# 2. NON-NEGOTIABLE ARCHITECTURE RULE

The project detail page is data-driven.

Do not replace the project schema with hardcoded project-specific JSX.

Do not duplicate project content inside components.

Continue using the existing project object and dynamic route/params.

Preserve:

-   project slugs
-   dynamic project routes
-   project lookup
-   project listing
-   category/filter system
-   project cards
-   project navigation
-   live links
-   GitHub links
-   technologies
-   media
-   content visibility flags
-   story data

If a schema change is genuinely required, preserve backward
compatibility and update every consumer.

Prefer component/layout fixes over schema changes.

------------------------------------------------------------------------

# 3. ROUTES THAT MUST CONTINUE WORKING

Verify:

``` text
/projects/class-fuse
/projects/spendwise
/projects/system-canvas
/projects/nextjs-master
```

Do not change route structure or slug values.

------------------------------------------------------------------------

# 4. LOCKED AREAS --- DO NOT REDESIGN

## Hero

The project-detail Hero is locked.

Do not change:

-   composition
-   background
-   layers
-   visual
-   image treatment
-   typography
-   layout
-   content placement
-   animation

Only fix a technical regression if the refinement accidentally affects
it.

## Showcase

The Showcase is locked.

Do not change:

-   structure
-   image layout
-   image treatment
-   sizing
-   animation
-   captions
-   visual hierarchy
-   section composition

## Project Navigation

Do not redesign previous/next project navigation, its layout,
typography, animation, or behavior.

## Common Navbar

Do not modify the shared navbar, logo, social icons, theme toggle,
layout, spacing, positioning, or animation.

## Common Footer

Do not modify the shared footer, content, layout, typography, spacing,
or animation.

------------------------------------------------------------------------

# 5. IN-SCOPE SECTIONS

Refine only the content sections around the locked areas:

1.  Snapshot, if currently implemented
2.  Context
3.  Approach
4.  Design
5.  Engineering
6.  Motion
7.  Responsive
8.  Reflection
9.  What I Would Improve

Performance Analytics is a future section and must NOT be implemented
now unless it already exists.

Do not fabricate performance data.

------------------------------------------------------------------------

# 6. TARGET INFORMATION ARCHITECTURE

``` text
HERO
↓
SNAPSHOT / PROJECT ORIENTATION
↓
CONTEXT
↓
APPROACH
↓
DESIGN
↓
ENGINEERING
↓
MOTION
↓
RESPONSIVE
↓
SHOWCASE
↓
REFLECTION
↓
WHAT I WOULD IMPROVE
↓
PROJECT NAVIGATION
↓
COMMON FOOTER
```

Each section must answer one question:

  Section       Question
  ------------- ----------------------------------------------
  Snapshot      What is this project?
  Context       Why did it exist?
  Approach      What decisions shaped it?
  Design        How did those decisions become an interface?
  Engineering   How was it built?
  Motion        How does interaction support it?
  Responsive    How does it adapt?
  Showcase      What does it actually look like?
  Reflection    What was learned?
  Improvement   What would be improved next?

Do not let multiple sections answer the same question.

------------------------------------------------------------------------

# 7. PRIMARY UX PROBLEM

Too many sections currently behave like miniature Hero sections:

``` text
large eyebrow
↓
large heading
↓
large gap
↓
large supporting paragraph
↓
large gap
↓
content
```

Repeated across the page, this creates unnecessary vertical length.

Fix this through:

-   content trimming
-   stronger hierarchy
-   smaller supporting typography
-   intentional max-widths
-   compact list structures
-   reduced section padding
-   removing repeated explanations

Do NOT simply make every font smaller.

------------------------------------------------------------------------

# 8. TYPOGRAPHY SYSTEM

Inspect the existing typography tokens first.

Hero typography remains locked.

For normal case-study sections use a clear hierarchy.

### Major section headings

Use for:

-   Context
-   Design
-   Engineering
-   Reflection

Approximate range:

``` text
text-[clamp(2.75rem,5vw,5rem)]
```

Do not blindly use the maximum.

### Supporting section headings

Use for:

-   Approach
-   Motion
-   Responsive
-   Improvement

Approximate range:

``` text
text-[clamp(2rem,3.5vw,3.5rem)]
```

### Content item titles

Approximately:

``` text
text-xl md:text-2xl
```

or equivalent existing token.

### Supporting text

Approximately:

``` text
text-base md:text-lg
```

with readable line-height.

Supporting copy must remain visually subordinate to headings.

------------------------------------------------------------------------

# 9. HEADING WIDTH

Use intentional max-widths.

Avoid headings spanning the entire viewport.

Avoid overly narrow columns that create unnecessary line breaks.

Target approximately 1--3 lines for major desktop headings where content
allows.

Do not add manual `<br />` tags solely to force arbitrary line breaks.

------------------------------------------------------------------------

# 10. CONTENT RULE

Allowed:

-   shorten
-   combine
-   clarify
-   remove repetition
-   improve readability
-   improve recruiter scanability
-   improve technical precision

Not allowed:

-   invent features
-   invent metrics
-   invent users
-   invent business outcomes
-   invent technical architecture
-   change product capabilities

Example:

Allowed:

> Compare currently available prices.

Not allowed:

> Track historical price changes.

The second changes the product capability.

------------------------------------------------------------------------

# 11. SNAPSHOT

If Snapshot exists, keep it compact.

Its job is orientation.

It may show existing:

-   role
-   year
-   category/type
-   relevant metadata

Do not repeat the same information as a large paragraph immediately
afterward.

Do not turn Snapshot into a second Hero.

------------------------------------------------------------------------

# 12. CONTEXT

Purpose:

> Why did this project exist?

Use the existing `story.context`.

Trim repeated body text.

Preferred composition:

``` text
CONTEXT

Concise heading / statement

One concise supporting explanation
```

Context should explain:

-   problem
-   purpose
-   central workflow

Do not turn it into a technology section.

### ClassFuse

Keep the source-supported concepts:

-   Tailwind class strings become difficult to read/manage
-   focused formatting workflow
-   duplicate/conflicting utility cleanup
-   organized output

### Spendwise

Keep:

-   shopping planning
-   shopping lists
-   product organization
-   supported current price comparison
-   list totals
-   spending tracking

Do not add historical price tracking, lowest-ever price, target alerts,
or historical trends.

### System Canvas

Keep:

-   structured color/theme system
-   interactive frontend workspace
-   React application
-   theme/color information

Do not invent Figma integration, collaboration, token synchronization,
or enterprise functionality.

### Next.js Master

Keep:

-   reusable frontend patterns
-   Next.js/React
-   responsive implementation
-   centralized state
-   interaction layer

Do not present it as a production SaaS without source support.

------------------------------------------------------------------------

# 13. APPROACH

Approach communicates decisions, not generic features.

Preferred structure:

``` text
APPROACH

Short supporting statement.

01  Decision
    Concise explanation

02  Decision
    Concise explanation

03  Decision
    Concise explanation
```

Desktop may use a compact two-column arrangement if it fits the existing
editorial grid.

Mobile stacks naturally.

Each item should generally be 1--3 concise sentences.

Do not turn every item into a giant card.

Do not repeat Context.

------------------------------------------------------------------------

# 14. DESIGN

Purpose:

> How did the decisions become an interface?

Focus on:

-   hierarchy
-   workflow priority
-   interface relationships
-   visual organization

Preferred structure:

``` text
DESIGN

Concise design statement.

Short explanation of the main
interface relationship or hierarchy.
```

Do not add unsupported generic claims such as "beautiful", "modern", or
"intuitive".

Do not make Design another Hero.

------------------------------------------------------------------------

# 15. ENGINEERING

Engineering is a high-value section for a frontend portfolio.

It must be highly scannable.

Preferred structure:

``` text
ENGINEERING

How the interface was structured and implemented.

01
Technology / decision
Concise project-specific explanation.

02
Technology / decision
Concise project-specific explanation.
```

Do not explain technologies like a tutorial.

Bad:

> React is a JavaScript library for building user interfaces.

Good:

> React provides the component architecture used to structure the
> application's interface.

Focus on:

``` text
technology
+
actual use in this project
```

### ClassFuse engineering emphasis

Use existing source-supported items such as:

-   Next.js + React
-   Tailwind CSS
-   Redux Toolkit
-   class composition
-   developer tooling

### Spendwise engineering emphasis

Use:

-   Next.js + React
-   Redux Toolkit
-   product extraction
-   Cheerio
-   ApexCharts
-   Tailwind responsive architecture

### System Canvas engineering emphasis

Use:

-   React
-   Vite
-   Tailwind CSS
-   Redux Toolkit
-   React Router
-   testing/quality tooling where already supported

### Next.js Master engineering emphasis

Use:

-   Next.js
-   React
-   reusable components
-   Tailwind
-   Redux Toolkit / React Redux
-   Motion
-   Lenis
-   existing interface utilities

Do not remove meaningful source-supported technical information merely
to shorten the page.

Instead make it compact.

------------------------------------------------------------------------

# 16. MOTION

Motion should be compact.

Use only source-supported concepts:

-   Motion for UI animation/transitions
-   Lenis for smooth scrolling
-   interaction supports the interface
-   animation does not replace the product's primary purpose

Preferred:

``` text
MOTION

Interaction that supports the interface
without competing with the core task.

Motion
UI transitions and interaction feedback.

Lenis
Smooth scrolling behavior.
```

Do not invent animation architecture, physics, gestures, performance
metrics, or scroll-linked effects.

Use the existing `motion/react` architecture.

------------------------------------------------------------------------

# 17. RESPONSIVE

Do not write a generic "the website is responsive".

Use the existing desktop/tablet/mobile content.

Preferred:

``` text
RESPONSIVE

The workflow adapts without losing
its primary relationship.

DESKTOP
Short explanation.

TABLET
Short explanation.

MOBILE
Short explanation.
```

Do not make three huge sections.

Mobile should use compact stacked rows.

------------------------------------------------------------------------

# 18. SHOWCASE

LOCKED.

Do not redesign or resize it as part of this task.

Improve the content before/after it instead.

------------------------------------------------------------------------

# 19. REFLECTION

Reflection should answer:

> What did this project reinforce or teach?

Use `reflection.worked`.

Preferred:

``` text
REFLECTION

What worked and what the project reinforced.

01
Lesson

Short explanation.

02
Lesson

Short explanation.

03
Lesson

Short explanation.
```

Do not repeat Context.

Do not repeat the Engineering section.

------------------------------------------------------------------------

# 20. WHAT I WOULD IMPROVE

Keep it concise.

Use only existing source-supported next steps.

Do not invent a roadmap.

For example, Spendwise already supports future directions around
persistent accounts, multi-user data, synchronized lists, and a
server-backed data layer. Do not describe those as already implemented.

------------------------------------------------------------------------

# 21. PERFORMANCE ANALYTICS --- FUTURE

Do not implement this section now unless it already exists.

When added later, use only measured data.

Never fabricate:

-   Lighthouse scores
-   Core Web Vitals
-   bundle size
-   load time
-   optimization percentages

------------------------------------------------------------------------

# 22. SPACING SYSTEM

Inspect existing spacing tokens before changing them.

Conceptual rhythm:

``` text
section start
↓
small eyebrow
↓
20–40px
↓
heading
↓
24–40px
↓
supporting copy
↓
40–72px
↓
content
↓
64–120px
↓
next section
```

Use the project's existing Tailwind scale where possible.

Spacing must reflect hierarchy.

------------------------------------------------------------------------

# 23. NO VIEWPORT-HEIGHT CONTENT SECTIONS

Do not use:

``` text
min-h-screen
h-screen
min-h-[100vh]
```

for ordinary content sections unless an existing section genuinely
requires viewport staging.

Most sections should have natural height.

------------------------------------------------------------------------

# 24. NO ARTIFICIAL SPACERS

Do not add empty spacer elements such as:

``` jsx
<div className="h-[300px]" />
```

Do not use giant arbitrary margins to create a "premium" feeling.

------------------------------------------------------------------------

# 25. EDITORIAL GRID

Preserve the existing editorial grid.

Keep:

-   consistent section-marker alignment
-   consistent content alignment
-   readable content column
-   coherent left/right relationships

Do not replace it with a completely unrelated grid.

------------------------------------------------------------------------

# 26. SECTION MARKERS

If the current implementation uses numbered section markers, preserve
that language:

``` text
01 CONTEXT
02 APPROACH
03 DESIGN
04 ENGINEERING
05 MOTION
06 RESPONSIVE
```

Keep numbers subtle.

They should support navigation and rhythm, not become the main visual
element.

------------------------------------------------------------------------

# 27. CARDS / CONTAINERS

Do not turn every content item into a card.

Avoid introducing unnecessary:

-   rounded containers
-   shadows
-   glass panels
-   decorative backgrounds
-   repeated card borders

The case study should remain editorial and open.

------------------------------------------------------------------------

# 28. COLOR

Do not introduce new colors.

Use existing semantic design tokens.

Preserve:

-   background
-   text
-   muted text
-   border
-   accent
-   dark-theme values

Do not add decorative gradients just to fill empty space.

------------------------------------------------------------------------

# 29. DARK MODE

Every changed section must work in:

-   light mode
-   dark mode

Check:

-   heading contrast
-   body contrast
-   eyebrow visibility
-   section numbers
-   dividers
-   links
-   focus states

Do not introduce light-only hardcoded colors.

------------------------------------------------------------------------

# 30. ACCESSIBILITY

Preserve or improve:

-   semantic headings
-   correct heading order
-   link semantics
-   keyboard focus
-   reduced-motion support
-   image alt text
-   readable contrast

Visual size and semantic heading level are separate concerns.

------------------------------------------------------------------------

# 31. TAILWIND ONLY

All styling changes must use Tailwind CSS.

Do not introduce:

-   CSS modules
-   custom CSS files
-   styled-components
-   emotion
-   inline style objects
-   another styling library

Use the existing Tailwind configuration and design tokens.

------------------------------------------------------------------------

# 32. COMPONENT ARCHITECTURE

Before editing:

1.  Inspect the project detail route.
2.  Inspect the page component.
3.  Inspect section components.
4.  Inspect heading components.
5.  Inspect section containers.
6.  Inspect list components.
7.  Inspect Motion wrappers.
8.  Inspect responsive utilities.
9.  Inspect project data.
10. Inspect the main project listing and filters.

Reuse existing components.

If a shared heading component is causing all sections to look like
Heroes, improve it through variants rather than duplicating components.

Possible conceptual variants:

``` text
major
supporting
compact
item
```

Use the project's existing naming conventions if different.

------------------------------------------------------------------------

# 33. NO PROJECT-SPECIFIC LAYOUT HACKS

Do not write:

``` jsx
project.name === "ClassFuse"
```

just to change layout.

Do not create special-case spacing for one project.

The system must work for all current and future projects.

------------------------------------------------------------------------

# 34. CONTENT VISIBILITY

Respect the existing:

``` text
project.content
```

flags.

If a section is disabled, do not render it.

Do not hardcode all sections as always visible.

------------------------------------------------------------------------

# 35. MAIN PAGE PROTECTION

The main portfolio project listing is outside the scope.

Do not redesign:

-   project cards
-   project filters
-   listing layout
-   listing typography
-   listing motion

After changes, verify the main page still consumes the project data
correctly.

------------------------------------------------------------------------

# 36. IMPLEMENTATION PHASES

## PHASE 0 --- AUDIT / BASELINE

Inspect:

-   route structure
-   project schema
-   page component
-   all section components
-   typography
-   spacing
-   Motion
-   Tailwind tokens
-   main project listing
-   filters
-   locked areas

Do not modify code until the architecture is understood.

### Done

-   [ ] Dynamic route understood.
-   [ ] Shared data dependencies understood.
-   [ ] Shared components identified.
-   [ ] Main page dependency identified.
-   [ ] Locked areas identified.
-   [ ] No assumptions are being made.

------------------------------------------------------------------------

## PHASE 1 --- CONTENT AUDIT

Review all projects and all in-scope sections.

Trim only repetition and filler.

Preserve meaningful information.

### Done

-   [ ] Context explains purpose without repeating the Hero.
-   [ ] Approach contains decisions.
-   [ ] Design contains interface reasoning.
-   [ ] Engineering contains implementation reasoning.
-   [ ] Motion is concise.
-   [ ] Responsive is concise.
-   [ ] Reflection contains lessons.
-   [ ] Improvement is source-supported.
-   [ ] No unsupported claims were added.

------------------------------------------------------------------------

## PHASE 2 --- HEADING SYSTEM

Refine shared heading variants.

Hero and Showcase remain untouched.

### Done

-   [ ] Hero unchanged.
-   [ ] Showcase unchanged.
-   [ ] Major headings smaller than Hero.
-   [ ] Supporting headings smaller than major headings.
-   [ ] Item headings subordinate.
-   [ ] Heading line wrapping is intentional.
-   [ ] No unnecessary manual line breaks.

------------------------------------------------------------------------

## PHASE 3 --- BODY TYPOGRAPHY

Refine:

-   body size
-   line-height
-   max-width
-   muted text
-   item descriptions

### Done

-   [ ] Paragraphs no longer compete with headings.
-   [ ] Body text does not create unnecessary height.
-   [ ] Line length is comfortable.
-   [ ] Mobile remains readable.
-   [ ] Dark mode remains readable.

------------------------------------------------------------------------

## PHASE 4 --- SPACING

Audit:

-   section padding
-   heading margins
-   body margins
-   list gaps
-   divider gaps
-   section-to-section gaps

Remove:

-   viewport-height hacks
-   spacer elements
-   huge arbitrary margins
-   repeated large gaps

### Done

-   [ ] Normal sections have natural height.
-   [ ] No spacer hacks.
-   [ ] No unnecessary `min-h-screen`.
-   [ ] Heading-to-content spacing is intentional.
-   [ ] Section spacing varies by hierarchy.
-   [ ] Mobile spacing is reduced appropriately.

------------------------------------------------------------------------

## PHASE 5 --- APPROACH LAYOUT

Make Approach a compact editorial list.

### Done

-   [ ] Items are scannable.
-   [ ] No giant cards.
-   [ ] Titles are subordinate.
-   [ ] Descriptions are concise.
-   [ ] Mobile stacks cleanly.

------------------------------------------------------------------------

## PHASE 6 --- ENGINEERING LAYOUT

Make Engineering the strongest technical section.

### Done

-   [ ] Stack is easy to scan.
-   [ ] Explanations are project-specific.
-   [ ] Generic technology definitions are removed.
-   [ ] Meaningful technical information is retained.
-   [ ] Section does not become excessively tall.
-   [ ] Mobile remains compact.

------------------------------------------------------------------------

## PHASE 7 --- MOTION + RESPONSIVE

Compact both sections.

### Done

-   [ ] Motion is not oversized.
-   [ ] Responsive is not three giant sections.
-   [ ] No unsupported animation claims.
-   [ ] Responsive descriptions remain source-accurate.
-   [ ] Mobile behavior is clearly communicated.

------------------------------------------------------------------------

## PHASE 8 --- REFLECTION + IMPROVEMENT

### Done

-   [ ] Reflection does not repeat Context.
-   [ ] Reflection does not repeat Engineering.
-   [ ] Improvement does not invent features.
-   [ ] Final sections are concise.
-   [ ] Transition into navigation feels intentional.

------------------------------------------------------------------------

## PHASE 9 --- RESPONSIVE QA

Test:

``` text
320px
375px
390px
430px
768px
1024px
1280px
1440px
1920px
```

### Done

-   [ ] No horizontal overflow.
-   [ ] No clipped headings.
-   [ ] No overlapping section markers.
-   [ ] No broken dividers.
-   [ ] No unexplained whitespace.
-   [ ] No navbar collision.
-   [ ] No Showcase regression.
-   [ ] No navigation regression.

------------------------------------------------------------------------

## PHASE 10 --- DARK MODE QA

### Done

-   [ ] Light mode works.
-   [ ] Dark mode works.
-   [ ] Headings have sufficient contrast.
-   [ ] Body text remains readable.
-   [ ] Muted text remains readable.
-   [ ] Section numbers remain subtle.
-   [ ] Dividers remain visible.
-   [ ] No light-only hardcoded colors.

------------------------------------------------------------------------

## PHASE 11 --- MOTION / ACCESSIBILITY QA

### Done

-   [ ] Existing Motion system still works.
-   [ ] No excessive animation added.
-   [ ] Reduced motion is respected.
-   [ ] Keyboard focus remains visible.
-   [ ] Heading semantics remain correct.

------------------------------------------------------------------------

## PHASE 12 --- REGRESSION QA

Verify all:

``` text
/projects/class-fuse
/projects/spendwise
/projects/system-canvas
/projects/nextjs-master
```

Also verify:

-   main project listing
-   category filters
-   project cards
-   project order
-   featured state
-   live links
-   GitHub links
-   media
-   dynamic params
-   previous/next navigation
-   Hero
-   Showcase
-   common Navbar
-   common Footer

### Done

-   [ ] All project routes load.
-   [ ] All params work.
-   [ ] Main listing still works.
-   [ ] Filters still work.
-   [ ] Existing links still work.
-   [ ] Hero unchanged.
-   [ ] Showcase unchanged.
-   [ ] Navigation unchanged.
-   [ ] Navbar unchanged.
-   [ ] Footer unchanged.

------------------------------------------------------------------------

# 37. FINAL VISUAL TARGET

The page should feel like:

``` text
editorial portfolio
+
frontend case study
+
engineering documentation
```

It should NOT feel like:

``` text
marketing landing page
```

and should NOT feel like:

``` text
technical README
```

Target rhythm:

``` text
HERO
████████████████████

CONTEXT
██████████

APPROACH
███████

DESIGN
████████

ENGINEERING
███████████

MOTION
██████

RESPONSIVE
██████

SHOWCASE
████████████████████

REFLECTION
████████

IMPROVEMENT
█████

NAVIGATION
████
```

These are hierarchy targets, not literal pixel heights.

------------------------------------------------------------------------

# 38. PARAMETERS OF DONE --- MASTER CHECKLIST

## Content

-   [ ] Existing project data remains the source of truth.
-   [ ] Repetitive wording is trimmed.
-   [ ] No unsupported information is invented.
-   [ ] Product meaning is preserved.
-   [ ] Project-specific differences remain.
-   [ ] No section is unnecessarily long.

## Typography

-   [ ] Hero unchanged.
-   [ ] Showcase unchanged.
-   [ ] Major headings have appropriate scale.
-   [ ] Supporting headings are smaller.
-   [ ] Item titles are clearly subordinate.
-   [ ] Body text is readable and restrained.
-   [ ] Mobile typography is balanced.
-   [ ] Headings do not create unnecessary wrapping.

## Spacing

-   [ ] No unnecessary viewport-height content sections.
-   [ ] No spacer hacks.
-   [ ] No giant arbitrary margins.
-   [ ] Heading-to-body spacing is intentional.
-   [ ] List spacing is compact.
-   [ ] Section spacing reflects hierarchy.
-   [ ] Mobile spacing is controlled.

## Layout

-   [ ] Editorial grid remains coherent.
-   [ ] Section markers align.
-   [ ] Content width is readable.
-   [ ] Approach is scannable.
-   [ ] Engineering is scannable.
-   [ ] Responsive content is compact.
-   [ ] No excessive cards or containers.

## Responsive

-   [ ] 320px works.
-   [ ] 375px works.
-   [ ] 390px works.
-   [ ] 430px works.
-   [ ] 768px works.
-   [ ] 1024px works.
-   [ ] 1280px works.
-   [ ] 1440px works.
-   [ ] 1920px works.
-   [ ] No horizontal overflow.
-   [ ] No clipped content.
-   [ ] No broken alignment.

## Theme

-   [ ] Light mode works.
-   [ ] Dark mode works.
-   [ ] Contrast is acceptable.
-   [ ] Existing design tokens are preserved.

## Architecture

-   [ ] Dynamic routes work.
-   [ ] Existing params work.
-   [ ] Existing schema works.
-   [ ] Main project listing works.
-   [ ] Filters work.
-   [ ] No project-specific layout hacks.
-   [ ] Components remain reusable.
-   [ ] Tailwind remains the styling system.
-   [ ] Existing Motion architecture remains intact.

## Locked areas

-   [ ] Hero unchanged.
-   [ ] Showcase unchanged.
-   [ ] Project navigation unchanged.
-   [ ] Common Navbar unchanged.
-   [ ] Common Footer unchanged.

------------------------------------------------------------------------

# 39. FINAL QUALITY REVIEW

Review the completed implementation as four people.

### Normal visitor

Can I understand the project without reading an essay?

### Recruiter

Can I quickly identify what this developer actually built and what
frontend decisions they made?

### Senior frontend engineer

Can I identify meaningful implementation decisions rather than a generic
technology list?

### UI/UX designer

Does every section have a clear purpose, visual hierarchy, and
appropriate amount of space?

If any answer is no, refine the relevant section before declaring the
task complete.

------------------------------------------------------------------------

# 40. FINAL IMPLEMENTATION REPORT

After implementation, report:

1.  Files changed
2.  Components changed
3.  Sections refined
4.  Content trimmed/rewritten
5.  Typography changes
6.  Spacing changes
7.  Responsive changes
8.  Accessibility changes
9.  What was intentionally left untouched
10. Any issue that could not be verified

Do not claim something was fixed unless it was actually inspected and
implemented.

------------------------------------------------------------------------

# 41. FINAL PRINCIPLE

The goal is not simply:

> Make the page shorter.

The goal is:

> **Increase the amount of useful information communicated per viewport
> while preserving the portfolio's visual identity and technical
> architecture.**

The final page should make it immediately clear:

-   what the project is
-   why it exists
-   what decisions were made
-   how it was built
-   how it behaves responsively
-   what the developer learned
-   what could improve next

without unnecessary repetition or visual weight.

**More signal per viewport.**
