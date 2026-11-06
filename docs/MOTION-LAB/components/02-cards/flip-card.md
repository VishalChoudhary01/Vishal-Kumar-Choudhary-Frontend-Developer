# Flip Card

**Status:** Spec locked · **Category:** Interactive cards and surfaces

## Purpose
A card with two intentional faces, such as a brief preview and its related explanation. Use only where the reverse side adds real value.

## Visual composition
Both faces share a fixed size and border/radius. Use a neutral semantic surface and consistent padding. Back face content must be readable and have a clear return affordance; decorative 3D gloss is not allowed.
Use [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md) as the authority for semantic surfaces, Manrope typography, spacing, 8/12/16 px radii, 1 px borders and restrained shadows. Light and dark themes must look equally intentional.

## Motion choreography
Rotate the inner face container by 180 degrees around Y over 420–520 ms with perspective 800–1000 px and backface-visibility handling. Avoid bounce. For reduced motion, crossfade or swap immediately. No continuous rotation.

## Public API intent
front, back, flipped, defaultFlipped, onFlip, aria-labels. Provide an explicit flip trigger if hover is not sufficient.
Document final props with JSDoc. Prefer composition through children/renderItem only where genuine content customization is needed. Avoid exposing internal Motion props.

## Accessibility and responsive behavior
Hover flip must not be the only path; support keyboard button and touch tap, prevent focus moving behind the hidden face, and announce state. Accept when backface never leaks, card height is stable and reduced-motion is usable.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Use transform/opacity where possible, keep image/layout dimensions reserved, clean pointer/drag handlers, and pause work when not visible. No CSS file, alternate animation library or arbitrary new palette.

## Acceptance criteria
- Card is visually complete at rest and in both themes.
- Defining interaction is obvious, bounded and reversible where appropriate.
- Focus, keyboard, touch and reduced motion are supported.
- Text stays readable; no layout shift, clipping or unintended overflow occurs.
- Behavior is verified in a real browser, with tests for data/state transitions.
