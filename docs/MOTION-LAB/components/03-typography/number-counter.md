# Number Counter

**Status:** Spec locked · **Category:** Typography and text

## Purpose
A count-up/count-down transition for a value with known start and end points, typically for a one-time statistic reveal.

## Typography and visual treatment
Use tabular numerals where available, fixed width where practical and no decorative wheel. Keep unit/prefix/suffix separate from the numeric value.
Typography, colors and spacing follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Use Manrope, Newsreader or Azeret Mono only according to role. Never invent a display style for animation's sake.

## Motion choreography
When entering view or when value changes, interpolate numerically from previous value to target over 700–1100 ms with Soft/Standard easing. Use reduced duration for small deltas. Do not animate from zero on every rerender.

## Public API intent
value, from, duration, decimals, prefix, suffix, locale, triggerOnce, formatOptions. Value must be a number or safely parseable structured value.
Document the API with JSDoc and keep the input contract stable. Content should remain declarative; callers must not manually manage animated letter state unless the specification explicitly requires it.

## Accessibility and responsive behavior
Provide final value to assistive tech, keep visual count hidden from duplicate announcement. Reduced motion shows final value. Accept for negative values, decimals, locale formatting and repeated updates without NaN or jitter.

## Performance and implementation notes
Use motion/react. Prefer opacity, transform and clipping for text. Avoid layout animation for each glyph. Ensure text can be measured after font load and viewport resize. Use Tailwind CSS v4 only; no component CSS file.

## Acceptance criteria
- Final text is immediately available semantically and visually under reduced motion.
- Typography, wrapping, line height and baseline match the unanimated version.
- Light/dark contrast remains readable during every frame.
- Animation triggers only at the documented event and stops/reset predictably.
- Long content, locale characters and responsive wrapping are tested where relevant.
