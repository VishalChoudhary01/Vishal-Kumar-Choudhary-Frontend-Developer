# Blur Reveal

**Status:** Spec locked · **Category:** Typography and text

## Purpose
A subtle entrance for imagery or short text where a brief soft-to-sharp transition supports focus and hierarchy.

## Typography and visual treatment
Base content is fully rendered in its final layout. Use no decorative glow. Initial blur must be modest and must not make content appear hidden for long.
Typography, colors and spacing follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Use Manrope, Newsreader or Azeret Mono only according to role. Never invent a display style for animation's sake.

## Motion choreography
On first in-view entry, animate opacity 0→1 and filter blur 4–6 px→0 over 420–560 ms Enter easing. Stagger related elements 40–60 ms. Do not loop or blur large text for extended time.

## Public API intent
children, once, amount, duration, delay, initialBlur (cap 6 px), disabled. Default applies only to a single wrapper.
Document the API with JSDoc and keep the input contract stable. Content should remain declarative; callers must not manually manage animated letter state unless the specification explicitly requires it.

## Accessibility and responsive behavior
Reduced motion skips blur and spatial movement. Do not use for critical data that must be immediately readable. Accept when animation does not cause perceived loading, clipping or expensive filter work on large surfaces.

## Performance and implementation notes
Use motion/react. Prefer opacity, transform and clipping for text. Avoid layout animation for each glyph. Ensure text can be measured after font load and viewport resize. Use Tailwind CSS v4 only; no component CSS file.

## Acceptance criteria
- Final text is immediately available semantically and visually under reduced motion.
- Typography, wrapping, line height and baseline match the unanimated version.
- Light/dark contrast remains readable during every frame.
- Animation triggers only at the documented event and stops/reset predictably.
- Long content, locale characters and responsive wrapping are tested where relevant.
