# Reveal Content Card

**Status:** Spec locked · **Category:** Interactive cards and surfaces

## Purpose
A card whose secondary content is progressively disclosed on hover, focus or explicit activation.

## Visual composition
Default card contains full title and enough context to understand its action. Secondary information has reserved space or a deliberate overlay that does not obscure the title. Keep surface neutral and radius standard.
Use [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md) as the authority for semantic surfaces, Manrope typography, spacing, 8/12/16 px radii, 1 px borders and restrained shadows. Light and dark themes must look equally intentional.

## Motion choreography
Reveal secondary content with opacity plus small vertical shift (4–8 px) over 180–260 ms. Avoid large height jumps when triggered by hover; for click expansion use layout animation. Reset on leave only for nonessential preview content.

## Public API intent
title, summary, details, revealMode (hover/focus/click), expanded, onExpandedChange. Do not hide required content exclusively behind hover.
Document final props with JSDoc. Prefer composition through children/renderItem only where genuine content customization is needed. Avoid exposing internal Motion props.

## Accessibility and responsive behavior
All secondary content must be reachable by keyboard and touch. Prefer explicit click for content needed by every user. Reduced motion toggles visibility immediately. Accept when there is no inaccessible hover-only detail and no abrupt card reflow.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Use transform/opacity where possible, keep image/layout dimensions reserved, clean pointer/drag handlers, and pause work when not visible. No CSS file, alternate animation library or arbitrary new palette.

## Acceptance criteria
- Card is visually complete at rest and in both themes.
- Defining interaction is obvious, bounded and reversible where appropriate.
- Focus, keyboard, touch and reduced motion are supported.
- Text stays readable; no layout shift, clipping or unintended overflow occurs.
- Behavior is verified in a real browser, with tests for data/state transitions.
