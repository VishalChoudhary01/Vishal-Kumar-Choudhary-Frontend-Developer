# Motion Lab — Component Specification System

**Status: LOCKED DESIGN AUTHORITY**  
**Stack:** Next.js App Router, React 19, JavaScript/JSX, Tailwind CSS v4, Motion via motion/react.

## Purpose

Motion Lab is a production-quality component library, not a collection of animation tricks. Every component must solve a real interaction or communication need, look finished at rest, respond precisely, remain usable without animation, and feel appropriate in a serious product or portfolio.

This documentation is the source of truth for future AI-agent implementation. An agent must read the global standards and the exact component specification before creating or modifying a component.

## Locked documentation hierarchy

1. [Design system and visual language](./00-DESIGN-SYSTEM.md) — color, type, spacing, radius, borders, elevation and visual-quality rules.
2. [Motion engineering standard](./01-MOTION-ENGINEERING-STANDARD.md) — Motion API, timing, easing, physics, input handling, reduced motion and performance.
3. [AI-agent implementation protocol](./02-AGENT-IMPLEMENTATION-PROTOCOL.md) — mandatory implementation, testing, review and anti-slop rules.
4. [Component inventory](./03-COMPONENT-INVENTORY.md) — canonical names, ownership, dependencies and build sequence.
5. [Individual component specifications](./components/) — one build-ready specification per component.

## Locked product principles

- Professional, quiet, editorial and technically precise; never playful by default.
- The resting state must already look finished. Hover is not a substitute for good design.
- Motion communicates state, hierarchy, cause and effect. Decorative movement needs a clear reason.
- One dominant motion idea per component. Do not stack unrelated scale, rotate, blur, bounce, glow and parallax effects.
- Every component defines idle, trigger, active, exit/reset, keyboard and reduced-motion behavior.
- Use existing portfolio semantic theme tokens. Do not invent a new palette for each component.
- Use Tailwind CSS v4 utilities. Do not add a custom CSS file or global selector for a single component.
- Use JavaScript and JSX. Do not migrate the project to TypeScript or replace the chosen stack.
- Use motion/react only; do not introduce GSAP, another animation framework or runtime CSS animation dependency.
- Components must be independently composable and expose a stable, small API.
- No fake functionality, dead controls, placeholder interactions, random demo data or unexplained decoration.

## Component specification contract

Every component document defines intended use, visual composition, motion choreography, timing/easing, interaction states, API surface, responsive behavior, accessibility, reduced-motion behavior, performance rules and acceptance criteria.

When a detail is not specified, follow the global standards and make the smallest conservative decision. Do not invent a new color language, typography system, spacing scale, radius family or animation style.

## Implementation sequence

Follow the milestones in [Component Inventory](./03-COMPONENT-INVENTORY.md). Implement one component at a time. Extract shared hooks and primitives only when at least two components genuinely need the same behavior. Do not create speculative abstractions.

## Definition of done

A component is complete only when:
- Its visual design matches this system in light and dark themes.
- Idle, hover, focus-visible, pressed, disabled, loading/error/success states are intentional where applicable.
- Pointer, touch, keyboard and reduced-motion paths have been checked.
- Motion does not cause layout shift, accidental page scroll, hidden focus or inaccessible content.
- Responsive behavior is verified at narrow, medium and wide viewports.
- Public API defaults are safe and hide unnecessary Motion internals.
- A real interactive demo and usage example exist.
- Tests cover meaningful state and interaction behavior.
- No build, lint or console errors are introduced.

## Authority

These specifications lock intended behavior. They do not claim any component is already implemented. Inspect existing production components and project tokens before reuse or replacement. Changes to locked rules require an explicit documented decision before implementation.
