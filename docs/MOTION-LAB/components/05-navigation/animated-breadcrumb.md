# Animated Breadcrumb

**Status:** Spec locked · **Category:** Navigation and layout

## Purpose
A compact path indicator that clarifies hierarchy in nested navigation.

## Visual composition
Use small 12–13 px text, secondary labels and a clear current-page label. Separators are subdued 12 px chevrons or slashes. Avoid pill containers around each item.
Use the project's semantic colors, Manrope type, 8/12 px control radius, 1 px border and existing elevation from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the interface quiet and clearly hierarchical in both themes.

## Motion choreography
On route changes, current item fades in or slides 2–3 px over 140–180 ms; separators remain static. Do not animate every ancestor on every route change. Preserve stable item keys.

## Public API intent
items with label/href, currentLabel, separator, maxItems/collapseMode. Use native links and aria-current page.
Document the final contract with JSDoc. Prefer controlled state and stable item IDs; do not expose Motion internals to consuming pages.

## Accessibility and responsive behavior
Current page is text, not link; links keyboard accessible. Mobile collapsed mode must expose hidden ancestors. Reduced motion updates immediately. Accept when long paths wrap/collapse without horizontal overflow.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Keep transitions on transform/opacity where possible; layout animation is permitted only for real size/position changes. Clean up focus, scroll-lock and event listeners. Do not add a new global navigation system unless the exact task asks for it.

## Acceptance criteria
- Navigation/disclosure semantics are correct and active state is clear without animation.
- Keyboard, focus return, Escape and touch behaviors match the component's role.
- Motion is restrained, reversible and does not shift unrelated page content.
- Both themes and reduced-motion behavior are verified.
