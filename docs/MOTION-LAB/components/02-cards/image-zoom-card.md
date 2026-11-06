# Image Zoom Card

**Status:** Spec locked · **Category:** Interactive cards and surfaces

## Purpose
A card where imagery gently enlarges within its frame to signal that the image is interactive or opens a detail.

## Visual composition
Use a fixed aspect-ratio media window with object-cover image, semantic surface, and 12–16 px radius. Text/caption lives outside the clipping media where possible; do not zoom the entire card.
Use [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md) as the authority for semantic surfaces, Manrope typography, spacing, 8/12/16 px radii, 1 px borders and restrained shadows. Light and dark themes must look equally intentional.

## Motion choreography
On hover/focus, scale image from 1 to 1.035–1.05 over 320–420 ms using Soft/Enter easing. Keep container dimensions fixed and clip only the image layer. Leave returns to 1. Avoid zooming text, borders or controls.

## Public API intent
src/alt, children/caption, href, zoom (default 1.04; cap 1.06), disabled. Preserve image semantics and loading behavior.
Document final props with JSDoc. Prefer composition through children/renderItem only where genuine content customization is needed. Avoid exposing internal Motion props.

## Accessibility and responsive behavior
Touch gets no hover zoom. Keyboard focus may apply subtle zoom if image link is focus target. Reduced motion disables scale. Accept when no image overflow escapes, no layout shift occurs and alternative text is supplied.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Use transform/opacity where possible, keep image/layout dimensions reserved, clean pointer/drag handlers, and pause work when not visible. No CSS file, alternate animation library or arbitrary new palette.

## Acceptance criteria
- Card is visually complete at rest and in both themes.
- Defining interaction is obvious, bounded and reversible where appropriate.
- Focus, keyboard, touch and reduced motion are supported.
- Text stays readable; no layout shift, clipping or unintended overflow occurs.
- Behavior is verified in a real browser, with tests for data/state transitions.
