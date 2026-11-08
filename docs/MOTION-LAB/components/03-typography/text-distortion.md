# Text Distortion

**Status:** Spec locked · **Category:** Typography and text

## Purpose
A controlled distortion of one short display word to demonstrate an experimental visual effect, not a default content animation.

## Typography and visual treatment
Text remains high contrast and legible before and after. Keep effect localized to a masked layer; no glitch palette, chromatic split or aggressive jitter by default.
Typography, colors and spacing follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Use Manrope, Newsreader or Azeret Mono only according to role. Never invent a display style for animation's sake.

## Motion choreography
Trigger one short distortion pass under 500 ms using low-amplitude skew/letter spacing/opacity displacement; return to exact typography baseline. Use no random perpetual jitter. Prefer transform over layout properties.

## Public API intent
text, trigger, intensity low, duration, disabled. Advanced distortion may be opt-in and must degrade to normal text.
Document the API with JSDoc and keep the input contract stable. Content should remain declarative; callers must not manually manage animated letter state unless the specification explicitly requires it.

## Accessibility and responsive behavior
Reduced motion skips distortion. Provide actual string to screen readers. Accept when readability is maintained, no layout width changes and effect never loops without explicit user action.

## Performance and implementation notes
Use motion/react. Prefer opacity, transform and clipping for text. Avoid layout animation for each glyph. Ensure text can be measured after font load and viewport resize. Use Tailwind CSS v4 only; no component CSS file.

## Acceptance criteria
- Final text is immediately available semantically and visually under reduced motion.
- Typography, wrapping, line height and baseline match the unanimated version.
- Light/dark contrast remains readable during every frame.
- Animation triggers only at the documented event and stops/reset predictably.
- Long content, locale characters and responsive wrapping are tested where relevant.
