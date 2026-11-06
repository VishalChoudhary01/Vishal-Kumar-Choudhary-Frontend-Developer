# Outline-to-Fill Text

**Status:** Spec locked · **Category:** Typography and text

## Purpose
A decorative title treatment that begins as an outlined typographic word and fills with brand color on hover, focus or an explicit event.

## Typography and visual treatment
Use Newsreader/display only when the existing heading role supports it. Outline uses text-secondary and a thin stroke; fill is semantic brand. Both text layers must occupy identical geometry and share baseline/letter spacing. No shadow or glow.
Typography, colors and spacing follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Use Manrope, Newsreader or Azeret Mono only according to role. Never invent a display style for animation's sake.

## Motion choreography
Reveal fill left-to-right with clipPath inset from 100% to 0 over 700–850 ms Enter easing. Optional thin scan marker travels with the reveal. Hover/focus activates; leave returns to outline. Event-driven scan may briefly fill and then reset. This is not a scaleX text squeeze.

## Public API intent
text, active/hovered, eventTarget or onActivate, reducedMotion, duration. Avoid duplicating visible text for assistive technology.
Document the API with JSDoc and keep the input contract stable. Content should remain declarative; callers must not manually manage animated letter state unless the specification explicitly requires it.

## Accessibility and responsive behavior
Text remains selectable or has a real semantic source node. Keyboard focus mirrors hover; touch uses explicit activation. Reduced motion switches state immediately. Accept when stroke is legible at all sizes and fill perfectly overlaps outline.

## Performance and implementation notes
Use motion/react. Prefer opacity, transform and clipping for text. Avoid layout animation for each glyph. Ensure text can be measured after font load and viewport resize. Use Tailwind CSS v4 only; no component CSS file.

## Acceptance criteria
- Final text is immediately available semantically and visually under reduced motion.
- Typography, wrapping, line height and baseline match the unanimated version.
- Light/dark contrast remains readable during every frame.
- Animation triggers only at the documented event and stops/reset predictably.
- Long content, locale characters and responsive wrapping are tested where relevant.
