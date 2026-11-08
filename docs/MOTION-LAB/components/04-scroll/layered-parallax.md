# Layered Parallax

**Status:** Spec locked · **Category:** Scroll-driven components

## Purpose
A multi-layer scene in which visual layers move at distinct but restrained rates for a creative hero or story panel.

## Visual composition
Limit to two or three visual layers with clear depth order. Use intentional assets, restrained contrast and real content. No random blobs or textures. Main content must remain anchored and readable.
Apply the typography, spacing, semantic surface and theme rules in [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Ensure the page content remains readable at rest and no decorative layer takes priority over the message.

## Motion choreography
Scroll or pointer input maps to bounded per-layer offsets: foreground 2–4%, midground 4–6%, background 6–8% maximum. Each layer has separate MotionValues/spring where pointer-driven, or scroll transforms for scroll-driven. Avoid combining both unless specified.

## Public API intent
layers with depth, targetRef, inputMode (scroll/pointer), intensity low, disabled. Define z-order in implementation notes.
Use JSDoc and expose a concise, stable contract. Prefer a local target/container ref over global document scroll unless the behavior is explicitly page-level.

## Accessibility and responsive behavior
Disable pointer mode on touch, reduce ranges on small screens, static composition for reduced motion. Accept when layer edges never expose empty background and no page overflow occurs.

## Performance and implementation notes
Use motion/react scroll values rather than React state per frame. Scope observers to the component, clean them up, reserve layout dimensions and avoid forced layout reads in scroll callbacks. Tailwind CSS v4 only; no new animation package or component stylesheet.

## Acceptance criteria
- Scroll position is mapped consistently and reversibly where specified.
- No sticky trap, jump at the start/end, hidden content or horizontal overflow.
- Keyboard, touch, mobile, reduced-motion and both theme paths are verified.
- The static layout remains complete without animation.
