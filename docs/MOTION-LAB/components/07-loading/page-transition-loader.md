# Page Transition Loader

**Status:** Spec locked · **Category:** Loading and progress

## Purpose
A consistent route transition indicator for route changes where the app already owns navigation state.

## Visual composition
Prefer a thin top progress line or a brief content fade that does not block navigation. Avoid full-screen branded overlays unless the established page loader explicitly requires them. Keep semantic theme background.
Use semantic colors, existing type, spacing and radius tokens from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Loading UI must look calm and product-grade, never like a decorative animation demo.

## Motion choreography
Show promptly after navigation begins; progress can be indeterminate or route-signal driven. Exit on route ready over 160–240 ms. No arbitrary fake progress reaching 90% then waiting. Prevent duplicate transitions with existing page loader.

## Public API intent
active, progress optional, onComplete, variant. Integrate with the existing route/page loader rather than building a second global loading owner.
Public props must be documented with JSDoc. Do not fabricate operation state or own data fetching unless the component is explicitly a route/progress controller integrated with an existing provider.

## Accessibility and responsive behavior
Expose busy state at the correct region, do not trap input, and ensure route content remains accessible. Reduced motion removes large overlays. Accept when back/forward navigation and failed transitions clear correctly.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Keep skeleton dimensions stable, pause loops off-screen where possible, and clean timers/observers. No new animation framework or component CSS file.

## Acceptance criteria
- Loading/progress state accurately represents its source and never misleads.
- Content dimensions remain stable and errors have a clear fallback.
- Accessible status semantics and reduced motion are implemented.
- Both themes and narrow viewports are verified.
