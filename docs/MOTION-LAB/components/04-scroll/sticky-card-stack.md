# Sticky Card Stack

**Status:** Spec locked · **Category:** Scroll-driven components

## Purpose
A scroll sequence where successive cards pin, overlap and recede to explain ordered steps or progressive information.

## Visual composition
Use identical card geometry, 16 px or less radius, readable surface contrast and clear numeric/step hierarchy. Visible next-card edges are intentional but never obscure current content.
Apply the typography, spacing, semantic surface and theme rules in [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Ensure the page content remains readable at rest and no decorative layer takes priority over the message.

## Motion choreography
Each card sticks with a calculated top offset and transitions subtly as later cards overlap: scale reduces no more than 0.03, y remains constrained and opacity stays readable. Progress is derived from scroll; use transforms rather than repeated layout. The final card releases cleanly.

## Public API intent
items, topOffset, overlap, scaleStep (small), containerRef, disabled. Content height must account for all panels.
Use JSDoc and expose a concise, stable contract. Prefer a local target/container ref over global document scroll unless the behavior is explicitly page-level.

## Accessibility and responsive behavior
On mobile prefer a vertical unpinned list if sticky height would consume the viewport. Reduced motion renders a normal stacked list. Accept when no card is permanently occluded and scroll reaches the footer naturally.

## Performance and implementation notes
Use motion/react scroll values rather than React state per frame. Scope observers to the component, clean them up, reserve layout dimensions and avoid forced layout reads in scroll callbacks. Tailwind CSS v4 only; no new animation package or component stylesheet.

## Acceptance criteria
- Scroll position is mapped consistently and reversibly where specified.
- No sticky trap, jump at the start/end, hidden content or horizontal overflow.
- Keyboard, touch, mobile, reduced-motion and both theme paths are verified.
- The static layout remains complete without animation.
