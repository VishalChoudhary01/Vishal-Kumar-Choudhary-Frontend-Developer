# Scroll-Synchronized Text

**Status:** Spec locked · **Category:** Typography and text

## Purpose
Text progressively emphasizes or reveals in direct relation to scroll progress inside a story section.

## Typography and visual treatment
Use a readable display/body size with sensible line length. Unread text uses text-tertiary with adequate contrast; emphasized text uses primary. Keep line breaks stable.
Typography, colors and spacing follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Use Manrope, Newsreader or Azeret Mono only according to role. Never invent a display style for animation's sake.

## Motion choreography
Use useScroll on the local target and useTransform to map progress into a per-word/line opacity or color range. Progress must be reversible when scrolling upward. Avoid pinning unless the host story spec explicitly requires it.

## Public API intent
text/children, targetRef or container ref, start/end offsets, mode (line/word), reducedMotion, once false by default for reversible progress.
Document the API with JSDoc and keep the input contract stable. Content should remain declarative; callers must not manually manage animated letter state unless the specification explicitly requires it.

## Accessibility and responsive behavior
All text remains present and accessible before animation. Reduced motion presents full readable text without scroll dependency. Accept when scrolling backward reverses naturally and no per-frame React state updates occur.

## Performance and implementation notes
Use motion/react. Prefer opacity, transform and clipping for text. Avoid layout animation for each glyph. Ensure text can be measured after font load and viewport resize. Use Tailwind CSS v4 only; no component CSS file.

## Acceptance criteria
- Final text is immediately available semantically and visually under reduced motion.
- Typography, wrapping, line height and baseline match the unanimated version.
- Light/dark contrast remains readable during every frame.
- Animation triggers only at the documented event and stops/reset predictably.
- Long content, locale characters and responsive wrapping are tested where relevant.
