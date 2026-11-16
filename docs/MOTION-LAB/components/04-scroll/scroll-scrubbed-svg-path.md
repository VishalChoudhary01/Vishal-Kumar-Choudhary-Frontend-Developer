# Scroll-Scrubbed SVG Path

**Status:** Proposed · **Category:** Scroll-driven components · **Milestone:** 5 — Advanced interaction systems

## Purpose
A meaningful SVG route, diagram connector or illustration stroke whose drawn length is directly scrubbed by scroll progress. Unlike Animated SVG Line, the path does not play once and finish: it follows scroll position in both directions.

## Visual composition
- Use a stable SVG `viewBox`, preserved aspect ratio and crisp 1–2 px semantic stroke.
- The path must explain a real sequence, route or relationship. Do not add decorative scribbles.
- Optional milestones may sit on the path, with concise labels outside the stroke's visual footprint.
- Keep geometry simple and responsive. Reserve the SVG's final dimensions before drawing.

## Motion choreography
- Read a local target or container with `useScroll`.
- Map the configured start/end range to SVG `pathLength` 0–1 using `useTransform`.
- Scroll reversal reverses the stroke exactly. Optional low-latency smoothing is opt-in and must not create visible lag behind scroll.
- For multiple paths, distribute progress in explicit reading order and use small bounded ranges; do not animate all paths independently without a narrative reason.
- No autoplay, loop or unrelated scale/rotation.

## Public API intent
`paths` (stable id, path data, accessible label and optional progress range), `viewBox`, `targetRef`, `containerRef`, `start`, `end`, `strokeWidth`, `showMilestones`, `smoothing`, and `disabled`. Validate IDs, finite ranges and path presence.

## Accessibility and responsive behavior
Provide a text/list equivalent describing the route or sequence; SVG is decorative when that equivalent is present. Reduced motion renders the complete path and all milestone labels. Never make information available only after scrolling. Keep touch scrolling native.

## Performance and implementation notes
Use `motion/react` SVG path `pathLength`, `useScroll` and `useTransform`. Prefer one target observer and a small number of paths. Avoid React state per scroll frame, SVG filters and unnecessary DOM nodes. Use Tailwind CSS v4 utilities; no component CSS file.

## Acceptance criteria
- Drawing progress matches local scroll progress and reverses smoothly.
- Path geometry remains crisp at responsive sizes and browser zoom.
- All semantic content is available without animation.
- Reduced motion shows the final diagram immediately.
- Scroll profiling confirms no per-frame React render or layout read.
