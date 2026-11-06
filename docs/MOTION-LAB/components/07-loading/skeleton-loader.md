# Skeleton Loader

**Status:** Spec locked · **Category:** Loading and progress

## Purpose
A structural placeholder that preserves expected content geometry while data is pending.

## Visual composition
Skeleton shapes follow the actual final component: correct line widths, image ratios and card padding. Use a single low-contrast semantic surface tone or subtle shimmer; no high-contrast gradients or rounded pills for every line.
Use semantic colors, existing type, spacing and radius tokens from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Loading UI must look calm and product-grade, never like a decorative animation demo.

## Motion choreography
Default is static surface placeholders. Optional shimmer is a low-contrast translation across a clipped area over 1.4–1.8 s, linear, paused off-screen and disabled for reduced motion. Do not animate every skeleton independently.

## Public API intent
variant/shape, rows, mediaRatio, animate (default false/low), label. Prefer composition that mirrors final content structure.
Public props must be documented with JSDoc. Do not fabricate operation state or own data fetching unless the component is explicitly a route/progress controller integrated with an existing provider.

## Accessibility and responsive behavior
Use aria-busy on the loading region and hide decorative skeletons from assistive tech. Reduced motion uses static placeholders. Accept when layout dimensions match final content and CLS is negligible.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Keep skeleton dimensions stable, pause loops off-screen where possible, and clean timers/observers. No new animation framework or component CSS file.

## Acceptance criteria
- Loading/progress state accurately represents its source and never misleads.
- Content dimensions remain stable and errors have a clear fallback.
- Accessible status semantics and reduced motion are implemented.
- Both themes and narrow viewports are verified.
