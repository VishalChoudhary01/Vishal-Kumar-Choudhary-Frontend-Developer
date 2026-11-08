# Image Reveal Loader

**Status:** Spec locked · **Category:** Loading and progress

## Purpose
A transition from a genuine loading placeholder into the loaded image, improving perceived continuity.

## Visual composition
Reserve image aspect ratio and display final crop as soon as loaded. Placeholder uses semantic surface. Image must have meaningful alt text and object positioning. Do not use fake blurred unrelated artwork.
Use semantic colors, existing type, spacing and radius tokens from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Loading UI must look calm and product-grade, never like a decorative animation demo.

## Motion choreography
On image load, fade opacity 0→1 over 240–360 ms and optionally clip a simple inset mask from 4% to 0. Keep image's layout box fixed. On error, show an explicit fallback rather than leaving shimmer.

## Public API intent
src, alt, aspectRatio, objectPosition, fallback, onLoad/onError. Works with next/image or existing image conventions.
Public props must be documented with JSDoc. Do not fabricate operation state or own data fetching unless the component is explicitly a route/progress controller integrated with an existing provider.

## Accessibility and responsive behavior
Reduced motion swaps immediately. Keep alt text and loading behavior correct. Accept for cached, delayed and failed image loads, no layout shift and no infinite loader after error.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Keep skeleton dimensions stable, pause loops off-screen where possible, and clean timers/observers. No new animation framework or component CSS file.

## Acceptance criteria
- Loading/progress state accurately represents its source and never misleads.
- Content dimensions remain stable and errors have a clear fallback.
- Accessible status semantics and reduced motion are implemented.
- Both themes and narrow viewports are verified.
