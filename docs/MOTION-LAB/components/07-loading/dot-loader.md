# Dot Loader

**Status:** Spec locked · **Category:** Loading and progress

## Purpose
A compact indeterminate cue for inline waiting where a spinner would be visually heavy.

## Visual composition
Three small circles of equal size (4–6 px) in secondary/brand-muted tone. Place next to a real loading label where ambiguity exists. No large colored dots or emoji-like bounce.
Use semantic colors, existing type, spacing and radius tokens from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Loading UI must look calm and product-grade, never like a decorative animation demo.

## Motion choreography
Animate dots sequentially with restrained opacity or 2–3 px y travel; 350–500 ms phase offset and total cycle around 1.0–1.3 s. Pause off-screen; no scale balloon.

## Public API intent
size, label, tone, speed. Keep dot count fixed at three unless spec changes.
Public props must be documented with JSDoc. Do not fabricate operation state or own data fetching unless the component is explicitly a route/progress controller integrated with an existing provider.

## Accessibility and responsive behavior
Use aria-label/status and hide dots from screen reader. Reduced motion renders static ellipsis or label. Accept when loop is not distracting and does not change line height.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Keep skeleton dimensions stable, pause loops off-screen where possible, and clean timers/observers. No new animation framework or component CSS file.

## Acceptance criteria
- Loading/progress state accurately represents its source and never misleads.
- Content dimensions remain stable and errors have a clear fallback.
- Accessible status semantics and reduced motion are implemented.
- Both themes and narrow viewports are verified.
