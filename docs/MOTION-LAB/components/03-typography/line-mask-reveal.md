# Line Mask Reveal

**Status:** Spec locked · **Category:** Typography and text

## Purpose
Entrance treatment for headings or short copy where each line rises into view through its own clipping window.

## Typography and visual treatment
Use the existing display/body type role, natural line width and original line breaks. Each line has a dedicated overflow mask with a small vertical travel; no outline, gradient or glow is required.
Typography, colors and spacing follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Use Manrope, Newsreader or Azeret Mono only according to role. Never invent a display style for animation's sake.

## Motion choreography
When entering view once, each line moves from y 0.8–1em to 0 with opacity 0→1 over 550–700 ms. Stagger lines 70–100 ms. Exit/replay is not automatic. Reserve final line height so no layout shift.

## Public API intent
as/component wrapper, children or text, once, amount, stagger (default 80 ms), distance (default 0.9em), delay, disabled. Preserve semantic text structure.
Document the API with JSDoc and keep the input contract stable. Content should remain declarative; callers must not manually manage animated letter state unless the specification explicitly requires it.

## Accessibility and responsive behavior
Keep real text in the DOM, expose it once to assistive technology, handle wrapped text after font load and reduced motion by showing final text immediately. Accept when clipping does not cut ascenders/descenders and line breaks match all viewports.

## Performance and implementation notes
Use motion/react. Prefer opacity, transform and clipping for text. Avoid layout animation for each glyph. Ensure text can be measured after font load and viewport resize. Use Tailwind CSS v4 only; no component CSS file.

## Acceptance criteria
- Final text is immediately available semantically and visually under reduced motion.
- Typography, wrapping, line height and baseline match the unanimated version.
- Light/dark contrast remains readable during every frame.
- Animation triggers only at the documented event and stops/reset predictably.
- Long content, locale characters and responsive wrapping are tested where relevant.
