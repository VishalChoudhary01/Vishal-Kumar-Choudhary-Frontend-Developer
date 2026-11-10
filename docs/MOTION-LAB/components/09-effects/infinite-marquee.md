# Infinite Marquee

**Status:** Spec locked · **Category:** Advanced visual effects

## Purpose
A continuous horizontal or vertical sequence for logos, tags or short editorial messages that genuinely benefit from ambient movement.

## Visual composition
Use a single row with consistent item spacing and text/icon alignment. Surface is transparent or semantic; separators are restrained. Avoid oversized duplicate rows, gradient masks that hide items and high-speed movement.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Effects are art-directed exceptions, not permission to invent a palette. The main content and function always outrank the visual effect.

## Motion choreography
Use a linear translate loop with exact duplicate track width and seamless wrap. Default speed 30–50 px/s; slower for text. Pause on hover/focus and document whether direction reverses. Respect reduced motion with static wrap or manual scroll.

## Public API intent
items, speed, direction, gap, pauseOnHover, pauseOnFocus, label, reducedMotion. Ensure track can be measured and duplicated without visible seam.
Document the API with JSDoc. Prefer named variants and safe bounds over arbitrary style strings or unbounded intensity props.

## Accessibility and responsive behavior
Provide static readable content for AT (one semantic copy; visual clone aria-hidden). Pause on focus and hover. Reduced motion turns off autoplay. Accept when loop seam is invisible and no hydration mismatch/overflow occurs.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. SVG/canvas/filter complexity must be justified by the effect and profiled. Keep work local, bounded and pauseable. A static fallback is mandatory for every advanced effect.

## Acceptance criteria
- Visual effect has a clear purpose and stays subordinate to content.
- Motion has a trigger, bounded range, reset and reduced-motion fallback.
- No random palette, unbounded loop, layout shift or persistent rendering work.
- Keyboard/touch alternative and static fallback are usable.
- Performance is checked in a real browser/device before approval.
