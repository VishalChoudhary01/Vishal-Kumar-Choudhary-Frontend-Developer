# Parallax Image Card

**Status:** Spec locked · **Category:** Interactive cards and surfaces

## Purpose
A media card with two or three depth layers responding subtly to pointer position, used for a feature image or visual preview.

## Visual composition
Image is the main layer; optional caption or overlay is a separate layer. Surface and radius follow standard card tokens. Use real media, not arbitrary blobs or texture overlays.
Use [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md) as the authority for semantic surfaces, Manrope typography, spacing, 8/12/16 px radii, 1 px borders and restrained shadows. Light and dark themes must look equally intentional.

## Motion choreography
Map pointer to at most ±4 px image translation and ±2 px overlay counter-translation using a Soft spring. Keep image clipped to its frame. Reset on leave; never combine with high tilt or zoom by default.

## Public API intent
src/alt, caption, href, intensity low/medium, disabled. Expose only content-level properties.
Document final props with JSDoc. Prefer composition through children/renderItem only where genuine content customization is needed. Avoid exposing internal Motion props.

## Accessibility and responsive behavior
Disable for coarse pointers and reduced motion. Keep image alt meaningful and content independent of parallax. Accept when the effect is nearly imperceptible at rest, bounded and does not create scroll overflow.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Use transform/opacity where possible, keep image/layout dimensions reserved, clean pointer/drag handlers, and pause work when not visible. No CSS file, alternate animation library or arbitrary new palette.

## Acceptance criteria
- Card is visually complete at rest and in both themes.
- Defining interaction is obvious, bounded and reversible where appropriate.
- Focus, keyboard, touch and reduced motion are supported.
- Text stays readable; no layout shift, clipping or unintended overflow occurs.
- Behavior is verified in a real browser, with tests for data/state transitions.
