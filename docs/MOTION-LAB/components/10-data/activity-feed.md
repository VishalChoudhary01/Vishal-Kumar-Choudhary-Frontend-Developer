# Activity Feed

**Status:** Spec locked · **Category:** Data visualization and metrics

## Purpose
A stream of real events such as audit entries, recent updates or notifications, where new items should be discoverable.

## Visual composition
Use compact list rows with timestamp, event description and optional avatar/icon only when source provides it. Neutral divider, semantic status and clear chronology. Avoid card-within-card stacking.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Charts must communicate data first: restrained palette, legible labels, semantic meaning and clear units. Never add visual polish that distorts magnitude or hides uncertainty.

## Motion choreography
New item inserts at top or correct chronological position with opacity/y 4 px and layout animation over 180–260 ms. Existing items shift with layout transition. Do not pulse every row or replay entrance on rerender.

## Public API intent
items with stable id/timestamp/type/description, maxItems, live, onLoadMore. Input must be real event data.
Use JSDoc contracts and validate numeric input. Do not generate fake data in the component. Empty/loading/error states must be explicit and belong to caller or documented component states.

## Accessibility and responsive behavior
Use list semantics; live announcements should be controlled (polite, batched), not announce the entire feed repeatedly. Reduced motion insertion is immediate. Accept when duplicate IDs, out-of-order events and pagination work.

## Performance and implementation notes
Use motion/react and SVG/HTML primitives as appropriate. Avoid React state updates per frame; use MotionValues for interpolation. Keep axes/layout stable and test resize. Tailwind CSS v4 only; no new chart/animation library unless a separately approved decision is made.

## Acceptance criteria
- Every visual value matches source data and scale semantics.
- Labels, units and status are understandable without animation or color alone.
- Empty, zero, negative and large values are handled explicitly where applicable.
- Both themes, responsive behavior and reduced motion are verified.
- Animation does not distort, delay or misrepresent live data.
