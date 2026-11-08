# Scroll-Linked Rotation

**Status:** Spec locked · **Category:** Scroll-driven components

## Purpose
A deliberate rotation of an icon, image or small visual object that directly corresponds to scroll progress.

## Visual composition
Only a single visual element rotates. Keep its center and bounding box stable and use rotation to express progress/orientation; no spinning decorative artwork on ordinary page scroll.
Apply the typography, spacing, semantic surface and theme rules in [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Ensure the page content remains readable at rest and no decorative layer takes priority over the message.

## Motion choreography
Map normalized scroll progress to a bounded range, normally 0–90 degrees or one intentional full turn for a clear progress symbol. Linear mapping; reverse with scroll. Do not add spring inertia that breaks correspondence.

## Public API intent
children, targetRef, from/to (bounded), offset, disabled. Rotation axis defaults Z; X/Y require a justified 3D context.
Use JSDoc and expose a concise, stable contract. Prefer a local target/container ref over global document scroll unless the behavior is explicitly page-level.

## Accessibility and responsive behavior
Reduced motion fixes element at its end state or shows a progress label. Accept when rotation is deterministic, does not clip nearby elements and does not cause high-frequency React renders.

## Performance and implementation notes
Use motion/react scroll values rather than React state per frame. Scope observers to the component, clean them up, reserve layout dimensions and avoid forced layout reads in scroll callbacks. Tailwind CSS v4 only; no new animation package or component stylesheet.

## Acceptance criteria
- Scroll position is mapped consistently and reversibly where specified.
- No sticky trap, jump at the start/end, hidden content or horizontal overflow.
- Keyboard, touch, mobile, reduced-motion and both theme paths are verified.
- The static layout remains complete without animation.
