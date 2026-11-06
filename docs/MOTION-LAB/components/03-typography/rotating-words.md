# Rotating Words

**Status:** Spec locked · **Category:** Typography and text

## Purpose
A heading phrase with a fixed prefix and one changing word to show a concise set of related concepts.

## Typography and visual treatment
Keep prefix fixed. Reserve height and preferably width for the longest word. Use identical type scale and baseline across all values. No random word order.
Typography, colors and spacing follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Use Manrope, Newsreader or Azeret Mono only according to role. Never invent a display style for animation's sake.

## Motion choreography
Animate current word out with opacity/y -0.25em and next word in from 0.25em over 220–320 ms. Change interval should be deliberate (at least 2.5–3.5 s) and pause when not visible or when hovered/focused where appropriate. No constant fast cycling.

## Public API intent
prefix, words, interval, startIndex, paused, ariaLabel. Explicitly validate non-empty words.
Document the API with JSDoc and keep the input contract stable. Content should remain declarative; callers must not manually manage animated letter state unless the specification explicitly requires it.

## Accessibility and responsive behavior
Expose a stable accessible phrase; announce only if changing content is genuinely meaningful. Reduced motion switches words without spatial transition and can disable autoplay. Accept when longest word does not reflow the heading.

## Performance and implementation notes
Use motion/react. Prefer opacity, transform and clipping for text. Avoid layout animation for each glyph. Ensure text can be measured after font load and viewport resize. Use Tailwind CSS v4 only; no component CSS file.

## Acceptance criteria
- Final text is immediately available semantically and visually under reduced motion.
- Typography, wrapping, line height and baseline match the unanimated version.
- Light/dark contrast remains readable during every frame.
- Animation triggers only at the documented event and stops/reset predictably.
- Long content, locale characters and responsive wrapping are tested where relevant.
