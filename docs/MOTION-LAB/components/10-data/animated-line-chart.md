# Animated Line Chart

**Status:** Spec locked · **Category:** Data visualization and metrics

## Purpose
A trend chart where a line path reveals once and subsequent changes reflect the actual data series.

## Visual composition
Use a 1.5–2 px semantic brand line, quiet gridlines and legible axes. Area fill is optional, low-opacity and secondary. No rainbow multi-series palette; use a restrained, distinguishable series set.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Charts must communicate data first: restrained palette, legible labels, semantic meaning and clear units. Never add visual polish that distorts magnitude or hides uncertainty.

## Motion choreography
On initial render, reveal pathLength 0→1 over 650–900 ms. Points may fade in only if they are meaningful. On data change, update path without fake drawing from unrelated origin. Use a stable SVG viewBox and preserve aspect ratio.

## Public API intent
data, xKey, series, formatter, domain, animateOnMount, duration, showPoints, accessibleDescription. Must handle sparse/missing values deliberately.
Use JSDoc contracts and validate numeric input. Do not generate fake data in the component. Empty/loading/error states must be explicit and belong to caller or documented component states.

## Accessibility and responsive behavior
Provide data summary/table, keyboard-accessible point/series inspection and non-color differentiation. Reduced motion draws final path. Accept when empty/single-point/negative data are correct and resizing doesn't distort axes.

## Performance and implementation notes
Use motion/react and SVG/HTML primitives as appropriate. Avoid React state updates per frame; use MotionValues for interpolation. Keep axes/layout stable and test resize. Tailwind CSS v4 only; no new chart/animation library unless a separately approved decision is made.

## Acceptance criteria
- Every visual value matches source data and scale semantics.
- Labels, units and status are understandable without animation or color alone.
- Empty, zero, negative and large values are handled explicitly where applicable.
- Both themes, responsive behavior and reduced motion are verified.
- Animation does not distort, delay or misrepresent live data.
