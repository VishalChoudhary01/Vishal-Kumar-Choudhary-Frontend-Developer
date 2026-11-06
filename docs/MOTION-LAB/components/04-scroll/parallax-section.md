# Parallax Section

**Status:** Spec locked · **Category:** Scroll-driven components

## Purpose
A section where background/media layers move at different rates relative to scroll to create measured depth.

## Visual composition
The primary content remains anchored and readable. Limit depth layers to two or three real visual layers; use neutral media and existing semantic colors. No arbitrary floating blobs.
Apply the typography, spacing, semantic surface and theme rules in [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Ensure the page content remains readable at rest and no decorative layer takes priority over the message.

## Motion choreography
Use useScroll with target offsets for section progress. Translate background/media by a small percentage (normally 3–8% of its own dimension) while content remains fixed. The effect is reversible with scroll and never changes document flow.

## Public API intent
children, background/media layers, speed low/medium, offset, disabled. Avoid exposing raw scroll offsets without validation.
Use JSDoc and expose a concise, stable contract. Prefer a local target/container ref over global document scroll unless the behavior is explicitly page-level.

## Accessibility and responsive behavior
On mobile reduce speed or disable. Reduced motion uses static layers. Ensure no sticky overlap, scroll jank or horizontal overflow. Accept when movement is subtle and scroll progress maps consistently both directions.

## Performance and implementation notes
Use motion/react scroll values rather than React state per frame. Scope observers to the component, clean them up, reserve layout dimensions and avoid forced layout reads in scroll callbacks. Tailwind CSS v4 only; no new animation package or component stylesheet.

## Acceptance criteria
- Scroll position is mapped consistently and reversibly where specified.
- No sticky trap, jump at the start/end, hidden content or horizontal overflow.
- Keyboard, touch, mobile, reduced-motion and both theme paths are verified.
- The static layout remains complete without animation.
