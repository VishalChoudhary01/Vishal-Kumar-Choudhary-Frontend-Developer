# Comparison Bar

**Status:** Spec locked · **Category:** Data visualization and metrics

## Purpose
A direct comparison of two or more values on the same scale, for budgets, progress or category performance.

## Visual composition
Use shared baseline, clear category labels and a consistent neutral/brand series. Positive/negative semantics use success/error only when those meanings are valid. Value labels align and stay readable; no gradient fill by default.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Charts must communicate data first: restrained palette, legible labels, semantic meaning and clear units. Never add visual polish that distorts magnitude or hides uncertainty.

## Motion choreography
Bars animate scaleX from baseline to actual normalized value over 400–650 ms. Compare values on the same scale and use a stable maximum. On update, move to the new value without restarting. Negative values use an explicit zero axis.

## Public API intent
items with id/label/value, max, formatter, orientation, showDifference, disabled. Define shared units and comparison scale.
Use JSDoc contracts and validate numeric input. Do not generate fake data in the component. Empty/loading/error states must be explicit and belong to caller or documented component states.

## Accessibility and responsive behavior
Provide text labels and exact formatted values; do not rely on color alone. Reduced motion renders final bars. Accept with zero, equal, negative (if supported), large and missing values and small screens.

## Performance and implementation notes
Use motion/react and SVG/HTML primitives as appropriate. Avoid React state updates per frame; use MotionValues for interpolation. Keep axes/layout stable and test resize. Tailwind CSS v4 only; no new chart/animation library unless a separately approved decision is made.

## Acceptance criteria
- Every visual value matches source data and scale semantics.
- Labels, units and status are understandable without animation or color alone.
- Empty, zero, negative and large values are handled explicitly where applicable.
- Both themes, responsive behavior and reduced motion are verified.
- Animation does not distort, delay or misrepresent live data.
