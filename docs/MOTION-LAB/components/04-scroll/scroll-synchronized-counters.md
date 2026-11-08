# Scroll-Synchronized Counters

**Status:** Spec locked · **Category:** Scroll-driven components

## Purpose
A numeric readout that interpolates as its associated section progresses, useful for showing milestones or proportional completion.

## Visual composition
Use tabular numerals, fixed metric width and a concise unit. Number should be part of the content hierarchy, not a decorative giant counter.
Apply the typography, spacing, semantic surface and theme rules in [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Ensure the page content remains readable at rest and no decorative layer takes priority over the message.

## Motion choreography
Map local scroll progress to a numeric range using useTransform, then format for display. Reversible on upward scroll. No artificial ticking independent of scroll. Use a single shared progress value for related readouts.

## Public API intent
from, to, format, targetRef, offset, prefix, suffix, disabled. Define whether source data is progress or illustrative.
Use JSDoc and expose a concise, stable contract. Prefer a local target/container ref over global document scroll unless the behavior is explicitly page-level.

## Accessibility and responsive behavior
Expose final/meaningful static label for reduced motion and assistive tech; do not announce every intermediate value. Accept when number remains mathematically consistent in either scroll direction.

## Performance and implementation notes
Use motion/react scroll values rather than React state per frame. Scope observers to the component, clean them up, reserve layout dimensions and avoid forced layout reads in scroll callbacks. Tailwind CSS v4 only; no new animation package or component stylesheet.

## Acceptance criteria
- Scroll position is mapped consistently and reversibly where specified.
- No sticky trap, jump at the start/end, hidden content or horizontal overflow.
- Keyboard, touch, mobile, reduced-motion and both theme paths are verified.
- The static layout remains complete without animation.
