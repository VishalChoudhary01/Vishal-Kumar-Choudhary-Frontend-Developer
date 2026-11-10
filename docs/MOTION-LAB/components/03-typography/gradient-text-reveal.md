# Gradient Text Reveal

**Status:** Spec locked · **Category:** Typography and text

## Purpose
A restrained brand-tinted reveal for a short highlight phrase when semantic emphasis is needed.

## Typography and visual treatment
Use only two neighboring brand tones or a brand-to-transparent mask; the default palette remains semantic petrol. Text contrast must remain high. No rainbow, purple/blue sweep, chrome or metallic effect.
Typography, colors and spacing follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Use Manrope, Newsreader or Azeret Mono only according to role. Never invent a display style for animation's sake.

## Motion choreography
Move a static gradient mask or background-position once over the text over 600–850 ms on entry. Prefer clip reveal over endless shimmer. Once complete, the fill settles and stops. Do not animate background continuously.

## Public API intent
text/children, trigger, duration, direction, intensity low, disabled. Color is semantic/token-derived, not arbitrary default strings.
Document the API with JSDoc and keep the input contract stable. Content should remain declarative; callers must not manually manage animated letter state unless the specification explicitly requires it.

## Accessibility and responsive behavior
Use a solid readable fallback for forced colors and reduced motion. Keep the actual text accessible. Accept when contrast is verified and gradient adds meaning rather than decoration.

## Performance and implementation notes
Use motion/react. Prefer opacity, transform and clipping for text. Avoid layout animation for each glyph. Ensure text can be measured after font load and viewport resize. Use Tailwind CSS v4 only; no component CSS file.

## Acceptance criteria
- Final text is immediately available semantically and visually under reduced motion.
- Typography, wrapping, line height and baseline match the unanimated version.
- Light/dark contrast remains readable during every frame.
- Animation triggers only at the documented event and stops/reset predictably.
- Long content, locale characters and responsive wrapping are tested where relevant.
