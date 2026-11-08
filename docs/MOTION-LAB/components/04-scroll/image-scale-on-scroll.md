# Image Scale on Scroll

**Status:** Spec locked · **Category:** Scroll-driven components

## Purpose
A single image subtly changes scale as the user scrolls through its section to emphasize reveal or depth.

## Visual composition
Image sits in a fixed-ratio clipping frame. Caption and controls stay outside the animated image layer. Use the actual project asset and meaningful alt text.
Apply the typography, spacing, semantic surface and theme rules in [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Ensure the page content remains readable at rest and no decorative layer takes priority over the message.

## Motion choreography
Map section progress to restrained scale such as 1.04→1.0 or 1.0→1.05. Use useScroll/useTransform and keep it reversible. No bounce, filter animation or image crop jump.

## Public API intent
src, alt, targetRef, startScale/endScale with safe bounds, offset, disabled. Keep default range within 0.98–1.06.
Use JSDoc and expose a concise, stable contract. Prefer a local target/container ref over global document scroll unless the behavior is explicitly page-level.

## Accessibility and responsive behavior
Reduced motion leaves the image at its final/static crop. Mobile can use a smaller scale range. Accept when intrinsic image size is reserved and there is no CLS or overflow.

## Performance and implementation notes
Use motion/react scroll values rather than React state per frame. Scope observers to the component, clean them up, reserve layout dimensions and avoid forced layout reads in scroll callbacks. Tailwind CSS v4 only; no new animation package or component stylesheet.

## Acceptance criteria
- Scroll position is mapped consistently and reversibly where specified.
- No sticky trap, jump at the start/end, hidden content or horizontal overflow.
- Keyboard, touch, mobile, reduced-motion and both theme paths are verified.
- The static layout remains complete without animation.
