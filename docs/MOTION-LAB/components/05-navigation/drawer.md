# Drawer

**Status:** Spec locked · **Category:** Navigation and layout

## Purpose
A contextual side or bottom panel for secondary actions, filters or settings without losing page context.

## Visual composition
Panel width typically 320–420 px on desktop or 100% width on mobile bottom sheet. Use semantic elevated surface, 16 px radius only where edge is not flush, and a quiet border. Header/title and close target are clear.
Use the project's semantic colors, Manrope type, 8/12 px control radius, 1 px border and existing elevation from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the interface quiet and clearly hierarchical in both themes.

## Motion choreography
Backdrop fades over 160–220 ms. Drawer translates from chosen edge over 260–360 ms Standard spring/timed transition; exit 180–240 ms. Avoid bounce. Respect reduced-motion and maintain stable internal scroll.

## Public API intent
open, onOpenChange, side (left/right/bottom), title, children, modal, size. Defaults should be safe for viewport.
Document the final contract with JSDoc. Prefer controlled state and stable item IDs; do not expose Motion internals to consuming pages.

## Accessibility and responsive behavior
Modal drawer traps focus and closes on Escape; non-modal drawer must not trap. Provide labelled region/dialog semantics, focus return and background scroll behavior. Accept at narrow viewports, landscape and keyboard.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Keep transitions on transform/opacity where possible; layout animation is permitted only for real size/position changes. Clean up focus, scroll-lock and event listeners. Do not add a new global navigation system unless the exact task asks for it.

## Acceptance criteria
- Navigation/disclosure semantics are correct and active state is clear without animation.
- Keyboard, focus return, Escape and touch behaviors match the component's role.
- Motion is restrained, reversible and does not shift unrelated page content.
- Both themes and reduced-motion behavior are verified.
