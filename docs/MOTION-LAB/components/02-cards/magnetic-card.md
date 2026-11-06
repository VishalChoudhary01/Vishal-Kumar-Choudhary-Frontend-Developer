# Magnetic Card

**Status:** Spec locked · **Category:** Interactive cards and surfaces

## Purpose
A larger surface subtly attracts toward the pointer, useful for a single featured interactive tile in a creative showcase.

## Visual composition
Card remains editorial and content-first. Keep normal card padding, semantic surface and border. The whole card can translate a few pixels but internal text should not distort; avoid perspective tilt combined with strong translation.
Use [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md) as the authority for semantic surfaces, Manrope typography, spacing, 8/12/16 px radii, 1 px borders and restrained shadows. Light and dark themes must look equally intentional.

## Motion choreography
Map local pointer offset to a bounded translation of at most ±8 px, strength 0.04–0.07, using a Soft spring. Reset to origin on leave/cancel/blur. Do not add tilt unless explicitly enabled as a separate variant; avoid stacking both by default.

## Public API intent
children, strength (default 0.05), maxDistance (8 px), disabled, href or render semantics. Internal links remain independently operable.
Document final props with JSDoc. Prefer composition through children/renderItem only where genuine content customization is needed. Avoid exposing internal Motion props.

## Accessibility and responsive behavior
Disable on touch/coarse pointer and reduced motion. Preserve click target and keyboard focus. Accept when the card never overlaps or pushes neighboring layout, and reset is exact.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Use transform/opacity where possible, keep image/layout dimensions reserved, clean pointer/drag handlers, and pause work when not visible. No CSS file, alternate animation library or arbitrary new palette.

## Acceptance criteria
- Card is visually complete at rest and in both themes.
- Defining interaction is obvious, bounded and reversible where appropriate.
- Focus, keyboard, touch and reduced motion are supported.
- Text stays readable; no layout shift, clipping or unintended overflow occurs.
- Behavior is verified in a real browser, with tests for data/state transitions.
