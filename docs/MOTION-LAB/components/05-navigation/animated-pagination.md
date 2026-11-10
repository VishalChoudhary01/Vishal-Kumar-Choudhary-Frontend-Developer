# Animated Pagination

**Status:** Spec locked · **Category:** Navigation and layout

## Purpose
A page selector for a bounded result set with a clear current page and predictable keyboard behavior.

## Visual composition
Use text/number controls with 36–44 px hit targets. Active page has brand emphasis and subtle background or underline. Prev/next icons are consistent and disabled states legible. Avoid wide pill carousel.
Use the project's semantic colors, Manrope type, 8/12 px control radius, 1 px border and existing elevation from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the interface quiet and clearly hierarchical in both themes.

## Motion choreography
Active indicator uses shared layoutId or opacity/small scale over 160–220 ms; page content can crossfade only if loading. Do not animate old/new numbers across each other with unnecessary rotations.

## Public API intent
page, pageCount, onPageChange, siblingCount, disabled, ariaLabel. Clamp page boundaries and support ellipsis.
Document the final contract with JSDoc. Prefer controlled state and stable item IDs; do not expose Motion internals to consuming pages.

## Accessibility and responsive behavior
Buttons have accessible names; current page exposes aria-current page. Preserve focus predictably when data changes. Reduced motion makes indicator immediate. Accept when page one/last, tiny page counts and ellipsis states are correct.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Keep transitions on transform/opacity where possible; layout animation is permitted only for real size/position changes. Clean up focus, scroll-lock and event listeners. Do not add a new global navigation system unless the exact task asks for it.

## Acceptance criteria
- Navigation/disclosure semantics are correct and active state is clear without animation.
- Keyboard, focus return, Escape and touch behaviors match the component's role.
- Motion is restrained, reversible and does not shift unrelated page content.
- Both themes and reduced-motion behavior are verified.
