# Morphing Menu Icon

**Status:** Spec locked · **Category:** Navigation and layout

## Purpose
A compact menu trigger that transitions between menu and close while exposing the open state.

## Visual composition
Use a 40–44 px hit area and 18–22 px icon geometry. Lines have consistent stroke and rounded caps; surface is transparent or semantic surface. Icon does not grow beyond the target.
Use the project's semantic colors, Manrope type, 8/12 px control radius, 1 px border and existing elevation from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the interface quiet and clearly hierarchical in both themes.

## Motion choreography
Transform three bars into a close mark with line rotation/translation/opacity over 180–240 ms. Do not use a spring bounce. Open and close are reversible and tied to the actual menu state.

## Public API intent
open, onOpenChange, label, disabled, size. The trigger owns state only if uncontrolled mode is deliberately supported.
Document the final contract with JSDoc. Prefer controlled state and stable item IDs; do not expose Motion internals to consuming pages.

## Accessibility and responsive behavior
button with aria-expanded and aria-controls; Escape closes menu at the menu layer. Keyboard focus remains visible. Reduced motion switches line positions instantly. Accept when icon remains centered and state is not just decorative.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Keep transitions on transform/opacity where possible; layout animation is permitted only for real size/position changes. Clean up focus, scroll-lock and event listeners. Do not add a new global navigation system unless the exact task asks for it.

## Acceptance criteria
- Navigation/disclosure semantics are correct and active state is clear without animation.
- Keyboard, focus return, Escape and touch behaviors match the component's role.
- Motion is restrained, reversible and does not shift unrelated page content.
- Both themes and reduced-motion behavior are verified.
