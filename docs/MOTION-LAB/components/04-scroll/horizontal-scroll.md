# Horizontal Scroll

**Status:** Spec locked · **Category:** Scroll-driven components

## Purpose
A pinned or naturally horizontally scrolling collection driven by vertical scroll, for curated story content with a small number of panels.

## Visual composition
Each panel has a consistent width, stable media ratio and a clear narrative order. Provide visible progress and an unobtrusive hint only when it improves discoverability. Do not turn ordinary galleries into forced horizontal stories.
Apply the typography, spacing, semantic surface and theme rules in [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Ensure the page content remains readable at rest and no decorative layer takes priority over the message.

## Motion choreography
On desktop, map vertical section progress to x translation of the track. Pin only when the content sequence requires it and calculate travel from actual track width. Use useScroll/useTransform; no React state per frame. Release pin at exact end. On narrow screens use native horizontal scroll or stacked layout.

## Public API intent
items/children, trackRef, pin=true, panelMinWidth, gap, progress, disabled. Keep item identity stable.
Use JSDoc and expose a concise, stable contract. Prefer a local target/container ref over global document scroll unless the behavior is explicitly page-level.

## Accessibility and responsive behavior
Provide keyboard-accessible horizontal controls/scroll, focus handling and a non-pinned mobile path. Reduced motion uses native horizontal overflow or stacked panels. Accept when track end aligns without jump and content is not trapped.

## Performance and implementation notes
Use motion/react scroll values rather than React state per frame. Scope observers to the component, clean them up, reserve layout dimensions and avoid forced layout reads in scroll callbacks. Tailwind CSS v4 only; no new animation package or component stylesheet.

## Acceptance criteria
- Scroll position is mapped consistently and reversibly where specified.
- No sticky trap, jump at the start/end, hidden content or horizontal overflow.
- Keyboard, touch, mobile, reduced-motion and both theme paths are verified.
- The static layout remains complete without animation.
