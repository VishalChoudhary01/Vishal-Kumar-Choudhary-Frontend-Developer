# Animated Number

**Status:** Spec locked · **Category:** Data visualization and metrics

## Purpose
A reusable numeric display for real metrics, supporting formatting and restrained value-change feedback.

## Visual composition
Use tabular numerals, aligned baseline and a clear label/unit. Metric size follows hierarchy; do not default every number to oversized display type. Keep semantic status/trend separate from raw numeric value.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Charts must communicate data first: restrained palette, legible labels, semantic meaning and clear units. Never add visual polish that distorts magnitude or hides uncertainty.

## Motion choreography
On value update, interpolate from previous to current over 350–700 ms with Standard/Soft easing. Small deltas may be shorter. Avoid rolling digits unless Number Ticker is explicitly selected. Never count up from zero on every mount by default.

## Public API intent
value, formatOptions, locale, prefix, suffix, duration, trend, label, animateOnChange. Value must be finite and formatting stable.
Use JSDoc contracts and validate numeric input. Do not generate fake data in the component. Empty/loading/error states must be explicit and belong to caller or documented component states.

## Accessibility and responsive behavior
Expose the final formatted number once to assistive tech. Reduced motion updates immediately. Accept with decimals, negatives, locale separators, large values and rapid updates.

## Performance and implementation notes
Use motion/react and SVG/HTML primitives as appropriate. Avoid React state updates per frame; use MotionValues for interpolation. Keep axes/layout stable and test resize. Tailwind CSS v4 only; no new chart/animation library unless a separately approved decision is made.

## Acceptance criteria
- Every visual value matches source data and scale semantics.
- Labels, units and status are understandable without animation or color alone.
- Empty, zero, negative and large values are handled explicitly where applicable.
- Both themes, responsive behavior and reduced motion are verified.
- Animation does not distort, delay or misrepresent live data.
