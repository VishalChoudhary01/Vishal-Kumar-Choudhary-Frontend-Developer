# Split Heading Reveal

**Status:** Spec locked · **Category:** Typography and text

## Purpose
A heading entrance that splits into a chosen semantic unit—line or word—and reveals the pieces in an editorial sequence.

## Typography and visual treatment
Prefer split by line for responsive headlines; word split only when the copy is short. Preserve semantic reading order and original typography. No arbitrary rotate or fade combinations.
Typography, colors and spacing follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Use Manrope, Newsreader or Azeret Mono only according to role. Never invent a display style for animation's sake.

## Motion choreography
Default mode: each line rises from a clip mask by 0.6–0.8em over 520–680 ms with 60–85 ms stagger. The text remains opacity 1 where clipping is enough; avoid redundant opacity if it weakens crispness.

## Public API intent
text/children, splitBy (line/word), stagger, duration, delay, amount, once. Character splitting is a separate component.
Document the API with JSDoc and keep the input contract stable. Content should remain declarative; callers must not manually manage animated letter state unless the specification explicitly requires it.

## Accessibility and responsive behavior
Screen reader receives one complete heading. Recalculate line grouping on resize and font load without flashing. Reduced motion displays final heading. Accept when no duplicate text is announced and responsive line breaks stay correct.

## Performance and implementation notes
Use motion/react. Prefer opacity, transform and clipping for text. Avoid layout animation for each glyph. Ensure text can be measured after font load and viewport resize. Use Tailwind CSS v4 only; no component CSS file.

## Acceptance criteria
- Final text is immediately available semantically and visually under reduced motion.
- Typography, wrapping, line height and baseline match the unanimated version.
- Light/dark contrast remains readable during every frame.
- Animation triggers only at the documented event and stops/reset predictably.
- Long content, locale characters and responsive wrapping are tested where relevant.
