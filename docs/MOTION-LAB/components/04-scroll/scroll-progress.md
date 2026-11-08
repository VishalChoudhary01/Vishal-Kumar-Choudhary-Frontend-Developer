# Scroll Progress

**Status:** Spec locked · **Category:** Scroll-driven components

## Purpose
A progress indicator for a document, article or specific section, helping users understand position.

## Visual composition
Use a 2–3 px linear track or a compact radial indicator. Track and fill use semantic border/brand tokens with sufficient contrast. It must not compete with the page title.
Apply the typography, spacing, semantic surface and theme rules in [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Ensure the page content remains readable at rest and no decorative layer takes priority over the message.

## Motion choreography
Map scroll progress directly to scaleX/rotate or strokeDashoffset with linear timing. No spring lag; indicator must reflect actual position. Section mode maps target progress and reverses on upward scroll.

## Public API intent
targetRef optional, position (top/bottom/inline), thickness, showLabel, format, disabled. Avoid global fixed placement unless caller opts in.
Use JSDoc and expose a concise, stable contract. Prefer a local target/container ref over global document scroll unless the behavior is explicitly page-level.

## Accessibility and responsive behavior
Use aria-valuenow/min/max when it conveys meaningful progress; decorative reading progress can be aria-hidden. Reduced motion retains instantaneous indicator. Accept when progress stays accurate on resize, content changes and reverse scroll.

## Performance and implementation notes
Use motion/react scroll values rather than React state per frame. Scope observers to the component, clean them up, reserve layout dimensions and avoid forced layout reads in scroll callbacks. Tailwind CSS v4 only; no new animation package or component stylesheet.

## Acceptance criteria
- Scroll position is mapped consistently and reversibly where specified.
- No sticky trap, jump at the start/end, hidden content or horizontal overflow.
- Keyboard, touch, mobile, reduced-motion and both theme paths are verified.
- The static layout remains complete without animation.
