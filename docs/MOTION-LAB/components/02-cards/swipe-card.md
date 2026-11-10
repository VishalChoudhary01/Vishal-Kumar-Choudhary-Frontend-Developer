# Swipe Card

**Status:** Spec locked · **Category:** Interactive cards and surfaces

## Purpose
A swipeable card for decision/review interfaces where left/right correspond to explicit outcomes.

## Visual composition
Keep card content stable with clear actions and an optional low-emphasis direction hint. No dating-app styling unless product context explicitly calls for it. Use semantic outcomes and restrained surface colors.
Use [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md) as the authority for semantic surfaces, Manrope typography, spacing, 8/12/16 px radii, 1 px borders and restrained shadows. Light and dark themes must look equally intentional.

## Motion choreography
During drag, follow pointer with x translation and a small rotation capped at ±5 degrees. Reveal a semantic outcome label only after a threshold is approached. On release, commit only beyond threshold; otherwise spring back. Keep velocity and distance thresholds documented and deterministic.

## Public API intent
children, threshold, onSwipeLeft, onSwipeRight, dragConstraints, disabled. Require an explicit undo/reject path when outcome is destructive.
Document final props with JSDoc. Prefer composition through children/renderItem only where genuine content customization is needed. Avoid exposing internal Motion props.

## Accessibility and responsive behavior
Offer visible action buttons and keyboard equivalents. Do not commit on touch cancel. Reduced motion uses button/state change without drag. Accept when pointer cancel returns card and outcomes are not ambiguous.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Use transform/opacity where possible, keep image/layout dimensions reserved, clean pointer/drag handlers, and pause work when not visible. No CSS file, alternate animation library or arbitrary new palette.

## Acceptance criteria
- Card is visually complete at rest and in both themes.
- Defining interaction is obvious, bounded and reversible where appropriate.
- Focus, keyboard, touch and reduced motion are supported.
- Text stays readable; no layout shift, clipping or unintended overflow occurs.
- Behavior is verified in a real browser, with tests for data/state transitions.
