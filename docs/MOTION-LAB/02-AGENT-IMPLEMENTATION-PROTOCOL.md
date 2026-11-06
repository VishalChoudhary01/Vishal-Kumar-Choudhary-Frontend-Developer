# Motion Lab — AI-Agent Implementation Protocol

**Status: LOCKED / MANDATORY**  
This file is a required contract for coding agents.

## Mandatory reading order

Before editing code, read:
1. Motion Lab README.
2. Locked Design System.
3. Motion Engineering Standard.
4. Component Inventory.
5. The exact individual component specification.

Then inspect actual repository structure, existing components/hooks, src/app/globals.css, theme tokens, installed Motion version, scripts, tests and accessibility conventions. Do not assume a proposed directory exists. Do not overwrite or duplicate an existing implementation before auditing it.

## Locked visual guardrails

- Reuse existing semantic theme tokens. Do not invent fresh colors, gradients, shadows or typography per demo.
- Manrope for interface text, Newsreader for genuine editorial display, Azeret Mono for purposeful technical labels.
- Follow the documented spacing, sizing, radius and elevation standards.
- One primary focal point; secondary details remain secondary.
- No random blobs, decorative grids, glows, fake grain, emoji icons, rainbow gradients or excessive borders.
- Prefer 8/12/16 px radii. Do not turn every control into a pill.
- Do not add arbitrary overlays that fail in the alternate theme.

## Locked motion guardrails

- Every component has a meaningful resting state.
- Define trigger and response before coding animation.
- Use choreography and values from that component's spec.
- Keep movement bounded and intentional. No bounce unless explicitly required.
- Respect touch, keyboard, focus, cancellation and reduced motion.
- No infinite loop without a user-facing purpose and pause behavior.
- Do not stack unrelated effects to make a simple component “more animated”.

## Technical guardrails

- JavaScript/JSX only.
- motion/react only.
- Tailwind CSS v4 utilities only; no new component CSS file or global rule.
- No new animation library.
- JSDoc for public prop contracts.
- No placeholder callback, fake link, random content or inert control.
- No app-wide pointer state unless the spec requires it.
- Do not alter homepage, navbar or footer outside the explicit task scope.
- Keep heavy demos out of the public homepage critical path.

## Required workflow

### 1 — Audit
Identify existing implementations, token availability, package imports, accessibility conventions and test setup. List intended file changes.

### 2 — Contract
Confirm semantic element, props, variants, states, choreography, reduced-motion behavior and event contract from the spec. If a requirement is missing, record a conservative decision before coding.

### 3 — Build
Implement the smallest complete component. Extract subcomponents only for real responsibilities. Extract shared hooks only after demonstrated reuse.

### 4 — Demo
Provide a real interactive demo showing the defining behavior and meaningful states. Controls must map to documented public props and must not compromise the component's design.

### 5 — Verify
Run narrow tests, relevant broader tests, lint and build where available. Inspect both themes and reduced motion. Pointer/drag/scroll effects require real browser and mobile-input verification.

### 6 — Report
List exact files, behavior, tests actually run, results and unverified items. Source edits alone do not mean completion.

## Prohibited AI-slop outcomes

Reject output that resembles a generic tutorial; relies on random purple/pink/blue gradients; uses generic glass panels; uses oversized pill buttons or inflated spacing without purpose; has motion unrelated to state; has inconsistent icon sizes, baselines, radius or type; uses large glow shadows to hide weak hierarchy; animates everything at once; lacks keyboard/touch behavior; ignores reduced motion; invents arbitrary design values; or prioritizes a flashy screenshot over real interaction.

## Change control

These documents are locked. If a requirement conflicts, is incomplete or technically impossible:
1. identify the exact conflict;
2. propose the smallest change;
3. record the decision in an explicit note or spec revision;
4. implement against the updated authority.

Do not silently reinterpret a locked component. Do not mark it complete merely because the page compiles.
