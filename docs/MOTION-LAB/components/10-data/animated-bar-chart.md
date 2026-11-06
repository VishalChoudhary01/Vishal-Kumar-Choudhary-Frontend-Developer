# Animated Bar Chart

**Status:** Spec locked · **Category:** Data visualization and metrics

## Purpose
A data-backed comparison or category chart in which bar length communicates numeric magnitude.

## Visual composition
Use restrained categorical colors, preferably one brand series and semantic status only when meaning requires it. Axis labels, ticks and data labels have legible contrast. No gradients, decorative 3D or unnecessary shadows.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Charts must communicate data first: restrained palette, legible labels, semantic meaning and clear units. Never add visual polish that distorts magnitude or hides uncertainty.

## Motion choreography
Bars grow from zero or prior value to actual value using scaleX/scaleY over 450–700 ms, with 35–60 ms stagger for a small number of categories. Keep scale origin at baseline. On data update, animate to new values; do not restart every render.

## Public API intent
data, xKey, valueKey/series, formatter, orientation, animateOnMount, duration, onItemFocus. Values must be finite and labels unique.
Use JSDoc contracts and validate numeric input. Do not generate fake data in the component. Empty/loading/error states must be explicit and belong to caller or documented component states.

## Accessibility and responsive behavior
Provide an accessible table/list summary or aria-label/description; hover tooltip has keyboard equivalent. Reduced motion renders final bars. Accept with negative, zero, missing and large values plus narrow viewports.

## Performance and implementation notes
Use motion/react and SVG/HTML primitives as appropriate. Avoid React state updates per frame; use MotionValues for interpolation. Keep axes/layout stable and test resize. Tailwind CSS v4 only; no new chart/animation library unless a separately approved decision is made.

## Acceptance criteria
- Every visual value matches source data and scale semantics.
- Labels, units and status are understandable without animation or color alone.
- Empty, zero, negative and large values are handled explicitly where applicable.
- Both themes, responsive behavior and reduced motion are verified.
- Animation does not distort, delay or misrepresent live data.
