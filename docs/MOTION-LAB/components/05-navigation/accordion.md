# Accordion

**Status:** Spec locked · **Category:** Navigation and layout

## Purpose
A disclosure for grouped information where users need to expand/collapse sections in place.

## Visual composition
Use a clean row with 44 px minimum trigger height, title at 14–16 px and a 16 px chevron. Border separators are subtle; expanded content has 12–20 px breathing room. Avoid nested cards for every row.
Use the project's semantic colors, Manrope type, 8/12 px control radius, 1 px border and existing elevation from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the interface quiet and clearly hierarchical in both themes.

## Motion choreography
Chevron rotates 0–90/180 degrees over 160–200 ms. Content uses height/layout transition over 220–300 ms and opacity may be minimal. Preserve natural flow and do not use a fixed max-height.

## Public API intent
items with id/title/content, value/defaultValue, type (single/multiple), collapsible, onValueChange. Keep IDs stable.
Document the final contract with JSDoc. Prefer controlled state and stable item IDs; do not expose Motion internals to consuming pages.

## Accessibility and responsive behavior
Trigger is a button with aria-expanded/controls. Enter/Space toggles; focus remains in trigger. Reduced motion immediate. Accept when content is not clipped with dynamic height and all panels have correct relationships.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Keep transitions on transform/opacity where possible; layout animation is permitted only for real size/position changes. Clean up focus, scroll-lock and event listeners. Do not add a new global navigation system unless the exact task asks for it.

## Acceptance criteria
- Navigation/disclosure semantics are correct and active state is clear without animation.
- Keyboard, focus return, Escape and touch behaviors match the component's role.
- Motion is restrained, reversible and does not shift unrelated page content.
- Both themes and reduced-motion behavior are verified.
