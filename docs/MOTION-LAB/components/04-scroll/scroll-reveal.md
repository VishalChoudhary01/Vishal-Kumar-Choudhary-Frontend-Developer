# Scroll Reveal

**Status:** Spec locked · **Category:** Scroll-driven components

## Purpose
A general in-view entrance for content that benefits from a gentle appearance cue without requiring scroll-linked choreography.

## Visual composition
Content begins in its natural layout slot with opacity and optional small vertical offset. Use one consistent variant per group; do not mix multiple unrelated entrance styles in one section.
Apply the typography, spacing, semantic surface and theme rules in [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Ensure the page content remains readable at rest and no decorative layer takes priority over the message.

## Motion choreography
Trigger once when 15–25% of the target enters view. Animate opacity 0→1 and y 12–20 px→0 over 380–520 ms Enter easing. Stagger siblings 40–60 ms. Reversing out of view is not the default; use explicit once=false only for a deliberate reversible story.

## Public API intent
children, once=true, amount=0.18, distance=16, duration=0.45, delay, disabled. Support a wrapper or variants composition for groups.
Use JSDoc and expose a concise, stable contract. Prefer a local target/container ref over global document scroll unless the behavior is explicitly page-level.

## Accessibility and responsive behavior
Do not hide essential content behind scrolling; server-render final content. Reduced motion shows immediately. Accept when no layout shift occurs and observers/listeners clean up.

## Performance and implementation notes
Use motion/react scroll values rather than React state per frame. Scope observers to the component, clean them up, reserve layout dimensions and avoid forced layout reads in scroll callbacks. Tailwind CSS v4 only; no new animation package or component stylesheet.

## Acceptance criteria
- Scroll position is mapped consistently and reversibly where specified.
- No sticky trap, jump at the start/end, hidden content or horizontal overflow.
- Keyboard, touch, mobile, reduced-motion and both theme paths are verified.
- The static layout remains complete without animation.
