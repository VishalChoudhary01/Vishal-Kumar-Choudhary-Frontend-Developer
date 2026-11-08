# 3D Tilt Card

**Status:** Spec locked · **Category:** Interactive cards and surfaces

## Purpose
A media/content card that responds to pointer location with a subtle perspective tilt, suitable for a featured project or product preview.

## Visual composition
Use a stable card surface with a clear image/content hierarchy, 16 px radius, semantic surface and subtle border. The media may have a separate inner layer for parallax; body content must remain readable and not be tilted independently in a way that harms legibility.
Use [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md) as the authority for semantic surfaces, Manrope typography, spacing, 8/12/16 px radii, 1 px borders and restrained shadows. Light and dark themes must look equally intentional.

## Motion choreography
Map pointer coordinates across the card to a restrained rotateX/rotateY range (maximum about ±5 degrees). Use a spring (Balanced or Soft) for settle and reset on leave. A small highlight may track pointer at low opacity, but it is optional and must not become a second dominant effect. No constant idle rotation.

## Public API intent
children, intensity (low/medium; default low), maxTilt (5 deg cap), perspective (600–1000 px), disabled, onPointerEnter/Leave. Avoid exposing raw Motion props.
Document final props with JSDoc. Prefer composition through children/renderItem only where genuine content customization is needed. Avoid exposing internal Motion props.

## Accessibility and responsive behavior
Keep full card layout readable, keyboard focus visible and link semantics intact. Disable tilt on touch/coarse pointers and reduced motion. Accept when boundaries reset exactly, no text readability loss and no mobile clipping.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Use transform/opacity where possible, keep image/layout dimensions reserved, clean pointer/drag handlers, and pause work when not visible. No CSS file, alternate animation library or arbitrary new palette.

## Acceptance criteria
- Card is visually complete at rest and in both themes.
- Defining interaction is obvious, bounded and reversible where appropriate.
- Focus, keyboard, touch and reduced motion are supported.
- Text stays readable; no layout shift, clipping or unintended overflow occurs.
- Behavior is verified in a real browser, with tests for data/state transitions.
