# Section Transition

**Status:** Spec locked · **Category:** Scroll-driven components

## Purpose
A consistent entrance boundary between adjacent sections, providing hierarchy without turning the entire page into a sequence of theatrical animations.

## Visual composition
Use the section's real content and existing divider/surface tokens. The transition is a simple reveal or divider draw; avoid full-screen color wipes unless the specific story calls for it.
Apply the typography, spacing, semantic surface and theme rules in [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Ensure the page content remains readable at rest and no decorative layer takes priority over the message.

## Motion choreography
Trigger when section enters view. Choose one: divider scaleX 0→1 over 450–600 ms, or content opacity/y reveal over 350–450 ms. Do not run both on every element. Once by default.

## Public API intent
variant (divider/reveal), children, once, delay, amount, disabled. API should not own section layout.
Use JSDoc and expose a concise, stable contract. Prefer a local target/container ref over global document scroll unless the behavior is explicitly page-level.

## Accessibility and responsive behavior
Content remains rendered and accessible. Reduced motion presents final state. Accept when sections do not wait to become readable and reveal does not create visual jumps.

## Performance and implementation notes
Use motion/react scroll values rather than React state per frame. Scope observers to the component, clean them up, reserve layout dimensions and avoid forced layout reads in scroll callbacks. Tailwind CSS v4 only; no new animation package or component stylesheet.

## Acceptance criteria
- Scroll position is mapped consistently and reversibly where specified.
- No sticky trap, jump at the start/end, hidden content or horizontal overflow.
- Keyboard, touch, mobile, reduced-motion and both theme paths are verified.
- The static layout remains complete without animation.
