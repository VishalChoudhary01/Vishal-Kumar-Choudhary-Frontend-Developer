# Scroll Direction Indicator

**Status:** Spec locked · **Category:** Scroll-driven components

## Purpose
A small cue that shows whether the user is scrolling down/up or signals a boundary without competing with navigation.

## Visual composition
Use a 16–20 px arrow or compact text marker, with neutral border/surface. Avoid a large floating pill or distracting repeated movement.
Apply the typography, spacing, semantic surface and theme rules in [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Ensure the page content remains readable at rest and no decorative layer takes priority over the message.

## Motion choreography
Derive direction from scroll delta with a small threshold to ignore noise. Change arrow orientation/visibility over 150–220 ms. Hide or settle after boundary/idle according to caller behavior. Avoid spring on continuous direction detection.

## Public API intent
threshold, target/window, showAt, hideAt, onDirectionChange, disabled. Default is local section observation when possible.
Use JSDoc and expose a concise, stable contract. Prefer a local target/container ref over global document scroll unless the behavior is explicitly page-level.

## Accessibility and responsive behavior
Do not steal focus or announce every direction change. Reduced motion swaps icon instantly. Accept when small scroll jitter does not flicker the indicator and event listener is cleaned up.

## Performance and implementation notes
Use motion/react scroll values rather than React state per frame. Scope observers to the component, clean them up, reserve layout dimensions and avoid forced layout reads in scroll callbacks. Tailwind CSS v4 only; no new animation package or component stylesheet.

## Acceptance criteria
- Scroll position is mapped consistently and reversibly where specified.
- No sticky trap, jump at the start/end, hidden content or horizontal overflow.
- Keyboard, touch, mobile, reduced-motion and both theme paths are verified.
- The static layout remains complete without animation.
