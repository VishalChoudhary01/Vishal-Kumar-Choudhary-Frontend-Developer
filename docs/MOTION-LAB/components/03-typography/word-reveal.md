# Word Reveal

**Status:** Spec locked · **Category:** Typography and text

## Purpose
Entrance effect for a short sentence or heading where words enter in a measured sequence.

## Typography and visual treatment
Preserve text width, line wrapping and font exactly. Each word sits in a clipping wrapper only when vertical reveal is selected; avoid inserting visible gaps or changing normal whitespace.
Typography, colors and spacing follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Use Manrope, Newsreader or Azeret Mono only according to role. Never invent a display style for animation's sake.

## Motion choreography
On entry, words translate upward 0.35–0.6em and fade in with 45–65 ms stagger. Use 420–560 ms Enter easing. Do not animate word rotation or scale by default. Long copy should use normal fade/line reveal.

## Public API intent
text/children, stagger (default 55 ms), distance, once, amount, delay, ariaLabel. Maintain text flow.
Document the API with JSDoc and keep the input contract stable. Content should remain declarative; callers must not manually manage animated letter state unless the specification explicitly requires it.

## Accessibility and responsive behavior
Accessible text is exposed once; visual word spans are hidden from screen reader. Reduced motion reveals all words immediately. Accept when line wrapping and screen reader reading order remain identical to the source.

## Performance and implementation notes
Use motion/react. Prefer opacity, transform and clipping for text. Avoid layout animation for each glyph. Ensure text can be measured after font load and viewport resize. Use Tailwind CSS v4 only; no component CSS file.

## Acceptance criteria
- Final text is immediately available semantically and visually under reduced motion.
- Typography, wrapping, line height and baseline match the unanimated version.
- Light/dark contrast remains readable during every frame.
- Animation triggers only at the documented event and stops/reset predictably.
- Long content, locale characters and responsive wrapping are tested where relevant.
