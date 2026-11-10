# Metric Card

**Status:** Spec locked · **Category:** Data visualization and metrics

## Purpose
A summary surface combining a real metric, label, contextual delta and optional miniature trend.

## Visual composition
Use 16 px radius maximum, semantic surface, 1 px border and small shadow only when elevated. Label 12–13 px secondary; metric 24–32 px depending on hierarchy; delta is compact and semantic. Avoid gradients, huge icons and inflated padding.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Charts must communicate data first: restrained palette, legible labels, semantic meaning and clear units. Never add visual polish that distorts magnitude or hides uncertainty.

## Motion choreography
On mount, metric uses Animated Number behavior and supporting trend line may reveal once. Hover lift is optional and must not be combined with glow. Data update animates only the number that changes.

## Public API intent
label, value, formatter, delta, deltaDirection, comparisonLabel, trendData, loading, href. Metric source remains caller-owned.
Use JSDoc contracts and validate numeric input. Do not generate fake data in the component. Empty/loading/error states must be explicit and belong to caller or documented component states.

## Accessibility and responsive behavior
Trend direction has text/icon meaning, not color alone. Use aria-label/description and loading semantics. Reduced motion final metric. Accept with long labels, no delta, negative changes, skeleton and actual live updates.

## Performance and implementation notes
Use motion/react and SVG/HTML primitives as appropriate. Avoid React state updates per frame; use MotionValues for interpolation. Keep axes/layout stable and test resize. Tailwind CSS v4 only; no new chart/animation library unless a separately approved decision is made.

## Acceptance criteria
- Every visual value matches source data and scale semantics.
- Labels, units and status are understandable without animation or color alone.
- Empty, zero, negative and large values are handled explicitly where applicable.
- Both themes, responsive behavior and reduced motion are verified.
- Animation does not distort, delay or misrepresent live data.
