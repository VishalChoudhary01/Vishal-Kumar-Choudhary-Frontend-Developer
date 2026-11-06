# Spotlight Card

**Status:** Spec locked · **Category:** Interactive cards and surfaces

## Purpose
A single card receives a soft local highlight that reveals material and pointer proximity without changing its position.

## Visual composition
Use existing semantic surface, thin border and 12–16 px radius. Spotlight appears as a very low-opacity radial layer above the surface but below content; keep content contrast untouched. No bright white hotspot or multicolor bloom.
Use [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md) as the authority for semantic surfaces, Manrope typography, spacing, 8/12/16 px radii, 1 px borders and restrained shadows. Light and dark themes must look equally intentional.

## Motion choreography
Track local pointer center in CSS/Motion values, move a restrained radial light layer, fade to near-zero on leave. No spring is required for the pointer coordinate; use a short opacity transition and slight soft follow if needed. Card geometry stays fixed.

## Public API intent
children, spotlightSize (default medium), intensity (low only by default), disabled, as a surface/container. No arbitrary color by default.
Document final props with JSDoc. Prefer composition through children/renderItem only where genuine content customization is needed. Avoid exposing internal Motion props.

## Accessibility and responsive behavior
No pointer-only information. Touch has a static surface. Reduced motion disables the moving highlight. Accept when only the current card is illuminated, text contrast is unchanged and pointer leave resets.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Use transform/opacity where possible, keep image/layout dimensions reserved, clean pointer/drag handlers, and pause work when not visible. No CSS file, alternate animation library or arbitrary new palette.

## Acceptance criteria
- Card is visually complete at rest and in both themes.
- Defining interaction is obvious, bounded and reversible where appropriate.
- Focus, keyboard, touch and reduced motion are supported.
- Text stays readable; no layout shift, clipping or unintended overflow occurs.
- Behavior is verified in a real browser, with tests for data/state transitions.
