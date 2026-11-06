# Scroll Storytelling

**Status:** Spec locked · **Category:** Scroll-driven components

## Purpose
A coordinated sequence where scrolling updates text and media to tell one structured story. Use only where sequence and context are essential.

## Visual composition
One dominant media panel and one concise text panel. Active step has clear contrast; inactive steps remain visible enough to preserve context. Avoid multiple simultaneous parallax, blur, masks and color changes.
Apply the typography, spacing, semantic surface and theme rules in [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Ensure the page content remains readable at rest and no decorative layer takes priority over the message.

## Motion choreography
Use a measured story container with defined step boundaries. As each step becomes active, transition media opacity/transform and text state over 300–450 ms; scroll drives active index, but state changes only at deliberate thresholds. Pinning is optional and must be short.

## Public API intent
steps with id/title/body/media, activeIndex, onStepChange, pin, offsets. Keep state controlled or derive deterministically from scroll.
Use JSDoc and expose a concise, stable contract. Prefer a local target/container ref over global document scroll unless the behavior is explicitly page-level.

## Accessibility and responsive behavior
On mobile unpin and place media with its step or use native step navigation. Reduced motion keeps content in normal flow with active-step semantics. Accept when every step can be read without precise scroll gestures.

## Performance and implementation notes
Use motion/react scroll values rather than React state per frame. Scope observers to the component, clean them up, reserve layout dimensions and avoid forced layout reads in scroll callbacks. Tailwind CSS v4 only; no new animation package or component stylesheet.

## Acceptance criteria
- Scroll position is mapped consistently and reversibly where specified.
- No sticky trap, jump at the start/end, hidden content or horizontal overflow.
- Keyboard, touch, mobile, reduced-motion and both theme paths are verified.
- The static layout remains complete without animation.
