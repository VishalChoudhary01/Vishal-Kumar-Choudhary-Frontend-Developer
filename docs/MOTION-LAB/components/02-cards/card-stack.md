# Card Stack

**Status:** Spec locked · **Category:** Interactive cards and surfaces

## Purpose
A layered composition that presents a small set of related cards and lets users cycle or drag between them outside a scroll-bound story.

## Visual composition
Show a clear top card, with behind cards partially offset and toned down. Keep each card surface and radius consistent. Avoid exaggerated fan angles or random decorative shadows.
Use [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md) as the authority for semantic surfaces, Manrope typography, spacing, 8/12/16 px radii, 1 px borders and restrained shadows. Light and dark themes must look equally intentional.

## Motion choreography
Next/previous interaction moves the top card out by a bounded directional translate/rotate (maximum around 6 degrees), then reorders and settles the next card into focus. Use spring only for drag release; buttons use timed easing. Limit visible layers to three.

## Public API intent
items, activeIndex, onChange, renderItem, direction, dragEnabled, disabled. Provide controls if collection can be changed.
Document final props with JSDoc. Prefer composition through children/renderItem only where genuine content customization is needed. Avoid exposing internal Motion props.

## Accessibility and responsive behavior
Provide previous/next buttons and keyboard alternatives; drag cannot be sole interaction. Reduced motion swaps active card with a short fade. Accept when z-order, focus and active index remain synchronized.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Use transform/opacity where possible, keep image/layout dimensions reserved, clean pointer/drag handlers, and pause work when not visible. No CSS file, alternate animation library or arbitrary new palette.

## Acceptance criteria
- Card is visually complete at rest and in both themes.
- Defining interaction is obvious, bounded and reversible where appropriate.
- Focus, keyboard, touch and reduced motion are supported.
- Text stays readable; no layout shift, clipping or unintended overflow occurs.
- Behavior is verified in a real browser, with tests for data/state transitions.
