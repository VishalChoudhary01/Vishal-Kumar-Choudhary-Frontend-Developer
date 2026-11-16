# Image Sequence Scrubber

**Status:** Proposed · **Category:** Advanced visual effects · **Milestone:** 5 — Advanced interaction systems

## Purpose
A continuous frame-by-frame visual scrubber for a supplied image sequence, useful for a product turntable, process capture or spatial walkthrough. The interaction selects a position in one sequence; it is not a gallery of independently selected cards.

## Visual composition
- Render one stable media frame in a reserved aspect-ratio stage with an optional poster image and concise label.
- Use real supplied frames in a deterministic order. Preserve object-position and frame dimensions across the sequence.
- Provide a compact progress rail and current frame metadata. Do not add 3D effects or unrelated cursor decoration.
- Keep frame content secondary to surrounding explanatory text.

## Motion choreography
- Support one primary driver at a time: scroll progress, a drag scrubber or a controlled external progress value.
- Map normalized progress to a discrete frame index. Use the same mapping in both directions so reverse scrubbing is deterministic.
- Update the displayed image only when the quantized frame index changes; do not rerender on every raw scroll pixel.
- No autoplay by default. If an optional auto-play mode is ever enabled, it must pause off-screen, on hidden documents and for reduced motion; it is not part of the default contract.
- Scrub updates are immediate or minimally smoothed; do not add spring lag that disconnects the displayed frame from the user's position.

## Public API intent
`frames` (stable id, src, alt), `poster`, `mode` (scroll/drag/controlled), `targetRef`, `containerRef`, `progress`, `onProgressChange`, `onFrameChange`, `preloadRadius`, `orientation`, and `disabled`. Validate unique IDs and a bounded frame count (recommended maximum 120). The caller owns media sourcing and sequence completeness.

## Accessibility and responsive behavior
Provide a native range input for frame selection, with a useful accessible label and current frame text. Arrow keys, Home and End move deterministically. Each selected frame has appropriate alt text; the poster is a valid no-motion fallback. Reduced motion displays the poster/current frame and exposes the range control without scroll-linked movement. Touch can scrub through the native range control without trapping page scroll.

## Performance and implementation notes
Preload the poster and only a small adjacent-frame window by default; avoid mounting every frame at once. Reserve media dimensions. Scope scroll tracking to one target. Debounce network preloading, not visual frame updates; cancel pending work on unmount. Do not add a video/canvas dependency unless separately justified by measured sequence size.

## Acceptance criteria
- Progress maps monotonically and reversibly to the expected frame index.
- Only the active frame and bounded preload window are resident.
- No autoplay or hidden persistent work occurs by default.
- Range keyboard, touch, alt text and reduced-motion paths work.
- Frame changes do not cause layout shift or uncontrolled network bursts.
