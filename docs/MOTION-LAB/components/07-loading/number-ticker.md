# Number Ticker

**Status:** Spec locked · **Category:** Loading and progress

## Purpose
An odometer-style digit roll for a compact value update where the changing digits themselves are the feedback.

## Visual composition
Use tabular numerals and per-digit fixed-width columns. Prefix/suffix remain static. Keep font size moderate and align baselines. No oversized casino/scoreboard style unless data visualization specifically calls for it.
Use semantic colors, existing type, spacing and radius tokens from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Loading UI must look calm and product-grade, never like a decorative animation demo.

## Motion choreography
For changed digits, translate the digit column vertically to the new glyph position over 260–380 ms using Balanced spring or Standard easing. Handle carries and negative/sign changes predictably; do not roll unchanged digits.

## Public API intent
value, decimals, locale, prefix, suffix, duration, animateOnChange. Use actual number formatting and stable column keys.
Public props must be documented with JSDoc. Do not fabricate operation state or own data fetching unless the component is explicitly a route/progress controller integrated with an existing provider.

## Accessibility and responsive behavior
Expose one formatted value to screen readers and hide digit columns. Reduced motion swaps instantly. Accept when digits do not jump widths, decimals/locales remain correct and repeated updates do not queue stale animations.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Keep skeleton dimensions stable, pause loops off-screen where possible, and clean timers/observers. No new animation framework or component CSS file.

## Acceptance criteria
- Loading/progress state accurately represents its source and never misleads.
- Content dimensions remain stable and errors have a clear fallback.
- Accessible status semantics and reduced motion are implemented.
- Both themes and narrow viewports are verified.
