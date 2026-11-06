# Expandable Card

**Status:** Spec locked · **Category:** Interactive cards and surfaces

## Purpose
A compact summary card expands to show additional related content while preserving context. Use for optional details, not as a substitute for page navigation.

## Visual composition
Collapsed and expanded states share one surface and hierarchy. Use a modest 12–16 px radius, 1 px border and consistent padding. A clear trigger area and trailing chevron communicate expansion. Content order remains predictable.
Use [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md) as the authority for semantic surfaces, Manrope typography, spacing, 8/12/16 px radii, 1 px borders and restrained shadows. Light and dark themes must look equally intentional.

## Motion choreography
Animate actual content presence with height/layout transition over 240–360 ms and opacity/short y reveal for newly shown content. Chevron rotates 0–180 degrees over 180 ms. Use AnimatePresence only when exit is needed. Avoid auto-scrolling the page or animating max-height hacks.

## Public API intent
title, summary, children/details, expanded, defaultExpanded, onExpandedChange, disabled. Use button trigger and aria-controls target.
Document final props with JSDoc. Prefer composition through children/renderItem only where genuine content customization is needed. Avoid exposing internal Motion props.

## Accessibility and responsive behavior
aria-expanded and aria-controls must stay synchronized. Enter/Space toggles; focus remains on trigger. Reduced motion shows/hides content immediately. Accept when dynamic content does not clip and multiple cards can remain independently controlled.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Use transform/opacity where possible, keep image/layout dimensions reserved, clean pointer/drag handlers, and pause work when not visible. No CSS file, alternate animation library or arbitrary new palette.

## Acceptance criteria
- Card is visually complete at rest and in both themes.
- Defining interaction is obvious, bounded and reversible where appropriate.
- Focus, keyboard, touch and reduced motion are supported.
- Text stays readable; no layout shift, clipping or unintended overflow occurs.
- Behavior is verified in a real browser, with tests for data/state transitions.
