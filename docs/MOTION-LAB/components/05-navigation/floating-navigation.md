# Floating Navigation

**Status:** Spec locked · **Category:** Navigation and layout

## Purpose
A compact navigation control that appears after the primary header/hero or follows scroll direction in long pages.

## Visual composition
Use a small semantic surface with subtle border and medium shadow, 44 px action targets and concise labels. Avoid oversized floating capsules or multiple floating bars.
Use the project's semantic colors, Manrope type, 8/12 px control radius, 1 px border and existing elevation from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the interface quiet and clearly hierarchical in both themes.

## Motion choreography
Appear after a meaningful scroll threshold with opacity and y 6–10 px over 180–240 ms. Optional hide-on-down/show-on-up uses hysteresis thresholds to avoid flicker. It must not continuously chase every small scroll delta.

## Public API intent
items, visible, threshold, hideOnDown, onActiveChange, placement. Do not replace global navbar unless explicitly requested.
Document the final contract with JSDoc. Prefer controlled state and stable item IDs; do not expose Motion internals to consuming pages.

## Accessibility and responsive behavior
Keep page content unobscured, provide landmark/navigation label and keyboard order. Reduced motion toggles visibility without travel. Accept when scroll direction jitter does not flicker and it respects safe areas.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Keep transitions on transform/opacity where possible; layout animation is permitted only for real size/position changes. Clean up focus, scroll-lock and event listeners. Do not add a new global navigation system unless the exact task asks for it.

## Acceptance criteria
- Navigation/disclosure semantics are correct and active state is clear without animation.
- Keyboard, focus return, Escape and touch behaviors match the component's role.
- Motion is restrained, reversible and does not shift unrelated page content.
- Both themes and reduced-motion behavior are verified.
