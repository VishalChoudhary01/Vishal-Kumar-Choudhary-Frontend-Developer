# Live Status Indicator

**Status:** Spec locked · **Category:** Data visualization and metrics

## Purpose
A small indicator showing a real connected/running/healthy state, such as live sync or service status.

## Visual composition
Use a 7–8 px dot and concise label. Status maps to semantic success/warning/error/info tokens. Keep it inline and quiet; avoid large pulse rings or green-only status without text.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Charts must communicate data first: restrained palette, legible labels, semantic meaning and clear units. Never add visual polish that distorts magnitude or hides uncertainty.

## Motion choreography
State change crossfades the dot/label over 120–180 ms. An optional one-shot pulse may occur on transition to live, but no infinite pulse by default. If live monitoring is active, a subtle 1.8–2.4 s opacity breath is opt-in and paused when not visible.

## Public API intent
status, label, showDot, pulseOnChange, livePulse, updatedAt. Status must come from actual source.
Use JSDoc contracts and validate numeric input. Do not generate fake data in the component. Empty/loading/error states must be explicit and belong to caller or documented component states.

## Accessibility and responsive behavior
Expose status text to assistive tech; decorative dot aria-hidden. Reduced motion no pulse. Accept when offline/error is unambiguous and indicator does not suggest live when data is stale.

## Performance and implementation notes
Use motion/react and SVG/HTML primitives as appropriate. Avoid React state updates per frame; use MotionValues for interpolation. Keep axes/layout stable and test resize. Tailwind CSS v4 only; no new chart/animation library unless a separately approved decision is made.

## Acceptance criteria
- Every visual value matches source data and scale semantics.
- Labels, units and status are understandable without animation or color alone.
- Empty, zero, negative and large values are handled explicitly where applicable.
- Both themes, responsive behavior and reduced motion are verified.
- Animation does not distort, delay or misrepresent live data.
