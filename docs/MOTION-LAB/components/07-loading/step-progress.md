# Step Progress

**Status:** Spec locked · **Category:** Loading and progress

## Purpose
A sequential workflow indicator showing completed, current and upcoming stages.

## Visual composition
Use compact numbered steps or a thin connected rail with short titles. Completed state uses semantic success/brand; current state is prominent; future is muted but readable. Avoid giant circles and rainbow status steps.
Use semantic colors, existing type, spacing and radius tokens from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Loading UI must look calm and product-grade, never like a decorative animation demo.

## Motion choreography
On step change, active indicator moves to the current step over 180–260 ms; completed connector fills sequentially once. No animation of all steps on every rerender.

## Public API intent
steps with id/label/status, activeStep, onStepChange only if interactive, orientation, showLabels. State comes from actual workflow.
Public props must be documented with JSDoc. Do not fabricate operation state or own data fetching unless the component is explicitly a route/progress controller integrated with an existing provider.

## Accessibility and responsive behavior
Expose ordered list and current step semantics; do not make noninteractive progress appear clickable. Reduced motion instant. Accept with long labels, narrow screens and skipped/failed steps.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Keep skeleton dimensions stable, pause loops off-screen where possible, and clean timers/observers. No new animation framework or component CSS file.

## Acceptance criteria
- Loading/progress state accurately represents its source and never misleads.
- Content dimensions remain stable and errors have a clear fallback.
- Accessible status semantics and reduced motion are implemented.
- Both themes and narrow viewports are verified.
