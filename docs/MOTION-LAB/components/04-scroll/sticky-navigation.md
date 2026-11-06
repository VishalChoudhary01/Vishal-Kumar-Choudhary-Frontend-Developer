# Sticky Navigation

**Status:** Spec locked · **Category:** Scroll-driven components

## Purpose
Navigation that tracks current page section and optionally changes surface after the hero, supporting long-form pages.

## Visual composition
Use existing navigation component conventions, modest surface contrast, 1 px border and compact 44 px targets. Active item is indicated by brand underline or text, not oversized animated capsule unless the host design already uses one.
Apply the typography, spacing, semantic surface and theme rules in [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Ensure the page content remains readable at rest and no decorative layer takes priority over the message.

## Motion choreography
Use IntersectionObserver to identify current section with a stable threshold/rootMargin. Active underline animates via shared layoutId over 180–240 ms. Header show/hide, if enabled, is a separate bounded y/opacity transition based on direction threshold.

## Public API intent
items with href/sectionId, activeId, sticky, hideOnScroll, onActiveChange. Do not duplicate global navbar without explicit use case.
Use JSDoc and expose a concise, stable contract. Prefer a local target/container ref over global document scroll unless the behavior is explicitly page-level.

## Accessibility and responsive behavior
Use native anchors, keyboard focus, aria-current and responsive overflow. Reduced motion makes indicator switch instantly. Accept when active section is stable near boundaries and anchors account for fixed header offset.

## Performance and implementation notes
Use motion/react scroll values rather than React state per frame. Scope observers to the component, clean them up, reserve layout dimensions and avoid forced layout reads in scroll callbacks. Tailwind CSS v4 only; no new animation package or component stylesheet.

## Acceptance criteria
- Scroll position is mapped consistently and reversibly where specified.
- No sticky trap, jump at the start/end, hidden content or horizontal overflow.
- Keyboard, touch, mobile, reduced-motion and both theme paths are verified.
- The static layout remains complete without animation.
