# Animated Timeline

**Status:** Spec locked · **Category:** Data visualization and metrics

## Purpose
A sequence of dated milestones or process events where the connector and entries reveal in reading order.

## Visual composition
Use clear date/title/description hierarchy with 1–2 px connector, small semantic markers and consistent 16–24 px entry gaps. Avoid arbitrary colorful cards for every event.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Charts must communicate data first: restrained palette, legible labels, semantic meaning and clear units. Never add visual polish that distorts magnitude or hides uncertainty.

## Motion choreography
On first in-view entry, draw connector with pathLength over 500–800 ms; entries fade/y 4–8 px with 50–80 ms stagger. Active/current marker is semantic and stable. No ongoing animation after reveal.

## Public API intent
items with id/date/title/body/status, orientation (vertical default), activeId, once, duration. Use chronological input ordering or explicit order.
Use JSDoc contracts and validate numeric input. Do not generate fake data in the component. Empty/loading/error states must be explicit and belong to caller or documented component states.

## Accessibility and responsive behavior
Use ordered list semantics and real text dates; timeline must read sensibly without connector. Reduced motion shows all entries. Accept when long descriptions, mobile stacking and missing dates remain clear.

## Performance and implementation notes
Use motion/react and SVG/HTML primitives as appropriate. Avoid React state updates per frame; use MotionValues for interpolation. Keep axes/layout stable and test resize. Tailwind CSS v4 only; no new chart/animation library unless a separately approved decision is made.

## Acceptance criteria
- Every visual value matches source data and scale semantics.
- Labels, units and status are understandable without animation or color alone.
- Empty, zero, negative and large values are handled explicitly where applicable.
- Both themes, responsive behavior and reduced motion are verified.
- Animation does not distort, delay or misrepresent live data.
