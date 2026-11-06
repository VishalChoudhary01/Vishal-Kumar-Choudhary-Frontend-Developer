# Fluid Navigation

**Status:** Spec locked · **Category:** Advanced visual effects

## Purpose
A nav indicator with a softly elastic transition between adjacent active links, appropriate to a focused tab/segmented navigation.

## Visual composition
Navigation labels remain still and readable. Active indicator is a 1–2 px underline or low-contrast surface. Avoid liquid goo visuals and overexpanded pill backgrounds.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Effects are art-directed exceptions, not permission to invent a palette. The main content and function always outrank the visual effect.

## Motion choreography
Use shared layoutId and a restrained spring (Snappy/Balanced) to travel between tab positions; slight stretch is allowed only if subtle and single-axis. Settle within 250–350 ms. Do not run for every hover if active selection has not changed.

## Public API intent
items, activeId, onChange, orientation, indicatorVariant, disabled. Reuse Animated Tabs where semantics match; this is an expressive indicator variant rather than duplicate navigation state.
Document the API with JSDoc. Prefer named variants and safe bounds over arbitrary style strings or unbounded intensity props.

## Accessibility and responsive behavior
Use proper tab/link semantics, keyboard and touch support. Reduced motion moves indicator instantly. Accept when indicator bounds align with active item and does not collide with labels.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. SVG/canvas/filter complexity must be justified by the effect and profiled. Keep work local, bounded and pauseable. A static fallback is mandatory for every advanced effect.

## Acceptance criteria
- Visual effect has a clear purpose and stays subordinate to content.
- Motion has a trigger, bounded range, reset and reduced-motion fallback.
- No random palette, unbounded loop, layout shift or persistent rendering work.
- Keyboard/touch alternative and static fallback are usable.
- Performance is checked in a real browser/device before approval.
