# Animated Donut Chart

**Status:** Spec locked · **Category:** Data visualization and metrics

## Purpose
A proportion chart with a clear total and limited number of meaningful segments.

## Visual composition
Use a quiet track and a small set of semantic or documented series colors. Central total/label is visually dominant; legend includes labels and values. No extruded 3D, excessive gradients or thick decorative glow.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Charts must communicate data first: restrained palette, legible labels, semantic meaning and clear units. Never add visual polish that distorts magnitude or hides uncertainty.

## Motion choreography
Animate each segment's strokeDasharray/offset from zero to actual proportional share over 500–750 ms with short stagger. Keep order stable and round values to a total of 100 only for display, not by mutating data. Updates transition to new shares.

## Public API intent
data [{id,label,value,colorToken}], total, formatter, size, thickness, animateOnMount, duration. Validate nonnegative finite values.
Use JSDoc contracts and validate numeric input. Do not generate fake data in the component. Empty/loading/error states must be explicit and belong to caller or documented component states.

## Accessibility and responsive behavior
Provide legend and total for screen readers; do not rely on color alone, use patterns/labels if series are similar. Reduced motion shows final arcs. Accept for zero total, one segment, many segments and light/dark themes.

## Performance and implementation notes
Use motion/react and SVG/HTML primitives as appropriate. Avoid React state updates per frame; use MotionValues for interpolation. Keep axes/layout stable and test resize. Tailwind CSS v4 only; no new chart/animation library unless a separately approved decision is made.

## Acceptance criteria
- Every visual value matches source data and scale semantics.
- Labels, units and status are understandable without animation or color alone.
- Empty, zero, negative and large values are handled explicitly where applicable.
- Both themes, responsive behavior and reduced motion are verified.
- Animation does not distort, delay or misrepresent live data.
