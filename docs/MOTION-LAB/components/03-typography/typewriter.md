# Typewriter

**Status:** Spec locked · **Category:** Typography and text

## Purpose
An optional progressive text reveal for a short quote, command or demo phrase where incremental writing is meaningful.

## Typography and visual treatment
Use existing body/mono role and stable text container. Reserve final line space when possible. A blinking caret is optional, thin and low contrast; no terminal green by default.
Typography, colors and spacing follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Use Manrope, Newsreader or Azeret Mono only according to role. Never invent a display style for animation's sake.

## Motion choreography
Reveal by grapheme cluster at 25–45 ms per character, with a configurable pause at punctuation. Pause and resume only when the demo requires it. Stop when complete; do not erase and rewrite in an infinite loop.

## Public API intent
text, speed, start, onComplete, cursor, reducedMotion. Support pause/cancel only if required by the host.
Document the API with JSDoc and keep the input contract stable. Content should remain declarative; callers must not manually manage animated letter state unless the specification explicitly requires it.

## Accessibility and responsive behavior
Expose full final string to assistive tech; visual progression is hidden from screen reader. Reduced motion renders all text. Accept when it does not block essential instructions or create layout shift.

## Performance and implementation notes
Use motion/react. Prefer opacity, transform and clipping for text. Avoid layout animation for each glyph. Ensure text can be measured after font load and viewport resize. Use Tailwind CSS v4 only; no component CSS file.

## Acceptance criteria
- Final text is immediately available semantically and visually under reduced motion.
- Typography, wrapping, line height and baseline match the unanimated version.
- Light/dark contrast remains readable during every frame.
- Animation triggers only at the documented event and stops/reset predictably.
- Long content, locale characters and responsive wrapping are tested where relevant.
