# Text Scramble

**Status:** Spec locked · **Category:** Typography and text

## Purpose
A short technical/editorial reveal that resolves a compact label from temporary glyph substitutions to the final string.

## Typography and visual treatment
Keep final font, width and baseline stable. Use the existing mono role for technical labels or normal type for a short title. Temporary glyphs use the same width-aware character set and neutral color; no green hacker-rain effect.
Typography, colors and spacing follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Use Manrope, Newsreader or Azeret Mono only according to role. Never invent a display style for animation's sake.

## Motion choreography
On trigger, resolve characters left-to-right with a controlled per-character interval (20–35 ms) and total run under 900 ms. Already resolved characters remain fixed. Use deterministic seeded sequences to prevent hydration mismatch. Cancel on unmount or text change.

## Public API intent
text, triggerKey, duration (default 650 ms), characterSet (safe whitelist), onComplete, reducedMotion. Keep length modest.
Document the API with JSDoc and keep the input contract stable. Content should remain declarative; callers must not manually manage animated letter state unless the specification explicitly requires it.

## Accessibility and responsive behavior
Expose the final text to assistive tech from the start; animated copy is aria-hidden. Reduced motion shows final text immediately. Accept when no layout shift occurs and there is no random animation during server render.

## Performance and implementation notes
Use motion/react. Prefer opacity, transform and clipping for text. Avoid layout animation for each glyph. Ensure text can be measured after font load and viewport resize. Use Tailwind CSS v4 only; no component CSS file.

## Acceptance criteria
- Final text is immediately available semantically and visually under reduced motion.
- Typography, wrapping, line height and baseline match the unanimated version.
- Light/dark contrast remains readable during every frame.
- Animation triggers only at the documented event and stops/reset predictably.
- Long content, locale characters and responsive wrapping are tested where relevant.
