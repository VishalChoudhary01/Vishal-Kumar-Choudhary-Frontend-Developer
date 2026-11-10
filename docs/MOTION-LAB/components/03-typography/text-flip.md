# Text Flip

**Status:** Spec locked · **Category:** Typography and text

## Purpose
A controlled transition between two concise text states, such as “Available” and “Copied”, or rotating contextual labels.

## Typography and visual treatment
Both labels use identical type scale, alignment and reserved line height. Keep the container width stable where possible. Use surface styling only when label is a control/status.
Typography, colors and spacing follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Use Manrope, Newsreader or Azeret Mono only according to role. Never invent a display style for animation's sake.

## Motion choreography
Old label exits upward while new label enters from below within a clipped line-height viewport over 180–260 ms. Only switch when state actually changes. No perspective flip or rotation unless a specific spec requests it.

## Public API intent
value, label, duration, direction, aria-live for status transitions. Both strings should be concise.
Document the API with JSDoc and keep the input contract stable. Content should remain declarative; callers must not manually manage animated letter state unless the specification explicitly requires it.

## Accessibility and responsive behavior
Avoid repeated announcements; aria-live is polite only for meaningful status. Reduced motion crossfades or updates instantly. Accept when longer text cannot resize or clip the control unexpectedly.

## Performance and implementation notes
Use motion/react. Prefer opacity, transform and clipping for text. Avoid layout animation for each glyph. Ensure text can be measured after font load and viewport resize. Use Tailwind CSS v4 only; no component CSS file.

## Acceptance criteria
- Final text is immediately available semantically and visually under reduced motion.
- Typography, wrapping, line height and baseline match the unanimated version.
- Light/dark contrast remains readable during every frame.
- Animation triggers only at the documented event and stops/reset predictably.
- Long content, locale characters and responsive wrapping are tested where relevant.
