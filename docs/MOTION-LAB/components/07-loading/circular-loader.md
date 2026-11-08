# Circular Loader

**Status:** Spec locked · **Category:** Loading and progress

## Purpose
An indeterminate activity indicator for a short operation with no meaningful numeric progress.

## Visual composition
Use a 16–24 px circular stroke, 2 px or proportionate thickness, semantic brand or text-secondary. Avoid multicolor arcs and large centered spinners for local actions.
Use semantic colors, existing type, spacing and radius tokens from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Loading UI must look calm and product-grade, never like a decorative animation demo.

## Motion choreography
Rotate a simple stroke at a steady 800–1100 ms per turn, linear. A gap/arc may use strokeDashoffset, but no scale bounce. Stop when loading ends or component unmounts.

## Public API intent
size, label, colorVariant (semantic), speed within safe range. Prefer small inline sizes.
Public props must be documented with JSDoc. Do not fabricate operation state or own data fetching unless the component is explicitly a route/progress controller integrated with an existing provider.

## Accessibility and responsive behavior
Expose role=status or progressbar with accessible label; decorative circle hidden. Reduced motion uses static activity icon/text. Accept when spinner cannot be mistaken for a determinate percentage.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Keep skeleton dimensions stable, pause loops off-screen where possible, and clean timers/observers. No new animation framework or component CSS file.

## Acceptance criteria
- Loading/progress state accurately represents its source and never misleads.
- Content dimensions remain stable and errors have a clear fallback.
- Accessible status semantics and reduced motion are implemented.
- Both themes and narrow viewports are verified.
