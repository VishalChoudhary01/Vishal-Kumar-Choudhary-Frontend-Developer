# Animated Border Card

**Status:** Spec locked · **Category:** Interactive cards and surfaces

## Purpose
A low-key moving border accent for one highlighted card, where the edge communicates focus or feature status.

## Visual composition
Use existing card surface and 1 px border. An accent travels along a thin inset perimeter using a mask or SVG stroke; do not create rainbow gradients, thick glowing frames or constant high-energy loops.
Use [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md) as the authority for semantic surfaces, Manrope typography, spacing, 8/12/16 px radii, 1 px borders and restrained shadows. Light and dark themes must look equally intentional.

## Motion choreography
Default state is a static subtle border. On hover/focus, animate a single brand stroke or low-opacity perimeter sweep over 500–800 ms, then stop or settle. If a featured status loops, it must be slow, low-contrast and pausable. Use no blur filter.

## Public API intent
children, active, accent (semantic brand only), animateOnHover (default true), disabled. Keep card content separate from stroke layer.
Document final props with JSDoc. Prefer composition through children/renderItem only where genuine content customization is needed. Avoid exposing internal Motion props.

## Accessibility and responsive behavior
Focus-visible must provide a static border independent of animation. Reduced motion uses a static accent. Accept when the border does not distract from content and no extra DOM loop runs off-screen.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Use transform/opacity where possible, keep image/layout dimensions reserved, clean pointer/drag handlers, and pause work when not visible. No CSS file, alternate animation library or arbitrary new palette.

## Acceptance criteria
- Card is visually complete at rest and in both themes.
- Defining interaction is obvious, bounded and reversible where appropriate.
- Focus, keyboard, touch and reduced motion are supported.
- Text stays readable; no layout shift, clipping or unintended overflow occurs.
- Behavior is verified in a real browser, with tests for data/state transitions.
