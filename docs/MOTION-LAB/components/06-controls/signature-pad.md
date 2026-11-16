# Signature Pad

**Status:** Proposed · **Category:** Micro-interaction controls · **Milestone:** 5 — Advanced interaction systems

## Purpose
A focused handwriting/signature input surface that captures a user's own pointer strokes as structured vector paths. The unique interaction is authoring a stroke through direct pen, touch or mouse input; it does not animate a pre-authored illustration or scrub a path according to scroll.

## Visual composition
- Use a quiet semantic surface, 1 px border and 8–12 px radius. The drawing surface is the focal point; controls remain compact and secondary.
- Provide a restrained baseline or subtle corner metadata only when useful. Do not use decorative grids, glowing borders, cursors or glass effects.
- The canvas must have a reserved aspect ratio and a clear empty state with concise instruction.
- Ink uses the semantic brand token by default. Allow a small named set of accessible ink widths/colors only when product context needs it; do not expose arbitrary visual intensity.
- Controls are visible buttons with consistent 36–44 px sizing: Undo, Clear, and optionally Replay. Avoid icon-only controls without accessible names.

## Motion choreography
- Pointer down begins a new stroke and captures the pointer only within the drawing surface. Pointer move appends bounded points; use event coalescing when available without storing unbounded samples.
- Render live ink immediately to a canvas or equivalent drawing layer. Do not trigger a React render for every pointer sample.
- On pointer up, simplify/smooth the captured points into a deterministic vector path, commit one stroke to state, and notify the caller once.
- Optional replay animates the completed user's own paths with SVG `pathLength` over a short bounded duration (default 450 ms per stroke). Replay is user-triggered and never loops.
- Undo removes only the latest committed stroke; Clear resets the signature after an optional caller-configured confirmation for destructive workflows.
- Pointer cancel, lost capture, disabled state and unmount end the active stroke without committing a partial path. No auto-submit.

## Public API intent
`value` (optional controlled array of normalized strokes), `defaultValue`, `onChange`, `onComplete`, `label`, `disabled`, `readOnly`, `aspectRatio`, `strokeWidth`, `ink` (semantic token name), `maxStrokes` (default 80), `maxPointsPerStroke` (default 600), `playbackOnComplete`, `playbackDuration`, `showControls`, and `onClear`. Each stroke contains a stable ID and normalized point coordinates in the 0–1 range plus an optional normalized SVG path. Validate finite coordinates and enforce collection bounds. Submission and persistence belong to the caller.

## Accessibility and responsive behavior
- Use a labelled drawing region with an accessible instruction and a concise status announcement when a stroke is added, undone or cleared.
- Provide visible Undo and Clear buttons; keyboard users must not be required to draw to operate these actions.
- The drawing surface supports pointer/touch and pen. It must not capture pointers outside its bounds; use an appropriate touch-action policy only on the drawing surface and keep the controls scrollable.
- Provide a non-canvas accessible description and expose a serialized SVG or stroke data callback for downstream use.
- Reduced motion disables replay animation while preserving live drawing and controls. Focus indicators must remain visible in both themes and targets should meet 44 × 44 px.

## Performance and implementation notes
Use a bounded canvas for live pointer rendering and keep committed vector stroke data in React state; batch state commits to one per completed stroke, not per pointer move. Normalize coordinates against the drawing surface so resize does not corrupt the signature. Clean up active pointer capture and animation controls on cancel/unmount. If coalesced pointer events are supported, cap the stored samples. Use `motion/react` only for optional path replay and restrained control feedback. Follow Tailwind CSS v4 utilities; no new animation library or component stylesheet.

## Acceptance criteria
- Mouse, touch and pen produce normalized, deterministic strokes.
- Pointer cancel and lost capture never commit partial strokes.
- Undo removes exactly one stroke; Clear resets all strokes; limits are enforced.
- Controlled and uncontrolled APIs remain synchronized without update loops.
- Resize preserves stroke geometry and aspect ratio.
- Reduced motion disables replay but not signature capture.
- No React render occurs for each pointer sample, and export data remains available to the caller.
