# Character Reveal

**Status:** Spec locked · **Category:** Typography and text

## Purpose
A typographic accent for a short display phrase where individual characters create a deliberate rhythm. Use sparingly; not for paragraphs or long content.

## Typography and visual treatment
Typography and letter spacing remain unchanged from the page hierarchy. Characters are visually grouped into words with preserved whitespace. No per-letter color cycling or random rotations.
Typography, colors and spacing follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Use Manrope, Newsreader or Azeret Mono only according to role. Never invent a display style for animation's sake.

## Motion choreography
On entry, each character rises 0.35–0.55em and fades to full opacity with 18–28 ms stagger, 320–480 ms duration and Enter easing. Limit to around 24 characters by default; longer text falls back to word/line reveal.

## Public API intent
text, once, stagger, distance, duration, maxCharacters (default 24), ariaLabel override. Do not require caller to split spans.
Document the API with JSDoc and keep the input contract stable. Content should remain declarative; callers must not manually manage animated letter state unless the specification explicitly requires it.

## Accessibility and responsive behavior
Render a single accessible text node/label and hide the visual split copy from assistive technology. Respect locale grapheme clusters, not naive UTF-16 chars. Reduced motion displays final text. Accept when punctuation, emoji/combining marks and whitespace are not broken.

## Performance and implementation notes
Use motion/react. Prefer opacity, transform and clipping for text. Avoid layout animation for each glyph. Ensure text can be measured after font load and viewport resize. Use Tailwind CSS v4 only; no component CSS file.

## Acceptance criteria
- Final text is immediately available semantically and visually under reduced motion.
- Typography, wrapping, line height and baseline match the unanimated version.
- Light/dark contrast remains readable during every frame.
- Animation triggers only at the documented event and stops/reset predictably.
- Long content, locale characters and responsive wrapping are tested where relevant.
