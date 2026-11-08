# Linear Progress

**Status:** Spec locked · **Category:** Loading and progress

## Purpose
A determinate horizontal progress bar backed by a real percentage or unit of work.

## Visual composition
Track 3–6 px high, subtle semantic inset surface, filled portion brand. Rounded ends only as needed for track geometry. Label/value should be outside or above, not crammed inside.
Use semantic colors, existing type, spacing and radius tokens from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Loading UI must look calm and product-grade, never like a decorative animation demo.

## Motion choreography
Map numeric progress to scaleX with transform-origin left; use 120–220 ms ease for incremental updates. Do not spring behind the actual value or invent progress. Indeterminate mode uses a bounded traveling segment only when actual total is unknown.

## Public API intent
value (0–100) or indeterminate, label, showValue, size, status. Validate and clamp numeric values.
Public props must be documented with JSDoc. Do not fabricate operation state or own data fetching unless the component is explicitly a route/progress controller integrated with an existing provider.

## Accessibility and responsive behavior
Use role=progressbar and correct aria-valuenow only when determinate. Reduced motion updates exact value instantly. Accept with 0/100, decreasing progress, errors and screen reader labels.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Keep skeleton dimensions stable, pause loops off-screen where possible, and clean timers/observers. No new animation framework or component CSS file.

## Acceptance criteria
- Loading/progress state accurately represents its source and never misleads.
- Content dimensions remain stable and errors have a clear fallback.
- Accessible status semantics and reduced motion are implemented.
- Both themes and narrow viewports are verified.
