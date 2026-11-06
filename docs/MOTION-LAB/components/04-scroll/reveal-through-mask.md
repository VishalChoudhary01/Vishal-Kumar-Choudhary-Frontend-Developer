# Reveal Through Mask

**Status:** Spec locked · **Category:** Scroll-driven components

## Purpose
A scroll-linked clipping treatment for an image or surface, used when the reveal direction is part of the story.

## Visual composition
Use a clean media frame with no extra glow. Mask follows the content silhouette or a simple rectangle; visible edge remains crisp. Do not use complex arbitrary polygons that break on responsive sizes.
Apply the typography, spacing, semantic surface and theme rules in [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Ensure the page content remains readable at rest and no decorative layer takes priority over the message.

## Motion choreography
Map scroll progress to clipPath inset or mask size from hidden to full. Progress reverses with scroll. Keep clipping on the media layer only; transition from 0.1 to 1.0 progress across the target range.

## Public API intent
children/media, direction (left/right/top/bottom), targetRef, offset, disabled. Keep mask geometry simple and responsive.
Use JSDoc and expose a concise, stable contract. Prefer a local target/container ref over global document scroll unless the behavior is explicitly page-level.

## Accessibility and responsive behavior
Provide static full media for reduced motion and assistive tech. Avoid masking text needed before scroll. Accept when no image is clipped permanently at short viewport or browser zoom.

## Performance and implementation notes
Use motion/react scroll values rather than React state per frame. Scope observers to the component, clean them up, reserve layout dimensions and avoid forced layout reads in scroll callbacks. Tailwind CSS v4 only; no new animation package or component stylesheet.

## Acceptance criteria
- Scroll position is mapped consistently and reversibly where specified.
- No sticky trap, jump at the start/end, hidden content or horizontal overflow.
- Keyboard, touch, mobile, reduced-motion and both theme paths are verified.
- The static layout remains complete without animation.
