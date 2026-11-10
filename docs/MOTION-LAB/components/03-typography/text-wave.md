# Text Wave

**Status:** Spec locked · **Category:** Typography and text

## Purpose
A gentle, local wave for a very short decorative word or status label, not body copy.

## Typography and visual treatment
Use regular font weight and normal letter spacing. Individual glyph movement must remain within the line box; no color cycling or exaggerated sine wave.
Typography, colors and spacing follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Use Manrope, Newsreader or Azeret Mono only according to role. Never invent a display style for animation's sake.

## Motion choreography
On explicit hover/focus or activation, a single damped wave passes across characters with vertical travel limited to 2–3 px and 22–35 ms stagger. Duration under 700 ms; return to baseline. Do not auto-loop.

## Public API intent
text, trigger (hover/focus/press), amplitude (default 2 px; cap 4), stagger, disabled. Must support a plain-text fallback.
Document the API with JSDoc and keep the input contract stable. Content should remain declarative; callers must not manually manage animated letter state unless the specification explicitly requires it.

## Accessibility and responsive behavior
Keep a single accessible text node and hide split visual glyphs. Disable on touch unless explicit activation. Reduced motion uses no wave. Accept when line height does not change and no glyph is clipped.

## Performance and implementation notes
Use motion/react. Prefer opacity, transform and clipping for text. Avoid layout animation for each glyph. Ensure text can be measured after font load and viewport resize. Use Tailwind CSS v4 only; no component CSS file.

## Acceptance criteria
- Final text is immediately available semantically and visually under reduced motion.
- Typography, wrapping, line height and baseline match the unanimated version.
- Light/dark contrast remains readable during every frame.
- Animation triggers only at the documented event and stops/reset predictably.
- Long content, locale characters and responsive wrapping are tested where relevant.
