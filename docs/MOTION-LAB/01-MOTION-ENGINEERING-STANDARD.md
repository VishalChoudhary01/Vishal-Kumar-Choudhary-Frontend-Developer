# Motion Lab — Motion Engineering Standard

**Status: LOCKED ENGINEERING STANDARD**  
**Runtime:** Motion for React, imported only from motion/react.

## Approved stack

Next.js App Router, React 19, JavaScript/JSX with JSDoc, Tailwind CSS v4 and Motion React. Do not add GSAP, Framer Motion imports, React Spring, anime.js, Lottie or another motion runtime. Do not migrate components to TypeScript or add component-specific CSS files.

## Motion API selection

| Need | Prefer |
|---|---|
| Declarative state/entrance/exit | motion.div, motion.button, etc. |
| Pointer/scroll values | useMotionValue |
| Physical smoothing | useSpring |
| Derived transform/opacity | useTransform |
| Scroll position | useScroll |
| In-view trigger | useInView |
| Reduced-motion preference | useReducedMotion |
| Conditional exit mounting | AnimatePresence |
| Layout transition | layout/layoutId where justified |
| SVG path drawing | Motion SVG path with pathLength |
| Drag | Motion drag APIs with constraints |

Choose the smallest API that expresses the behavior. Do not add hooks simply because they are available.

## Component boundary

- Use semantic HTML. Use button for actions and anchor for navigation; do not make a clickable div.
- Decorative layers use aria-hidden and pointer-events-none.
- Parent components should not need to understand MotionValues, spring config or internal state.
- Expose intent through a small stable API; do not forward every Motion prop.
- Document public props, defaults, valid values and callback signatures with JSDoc.
- Keep implementation together until reuse or complexity justifies extraction.
- Use existing project conventions before adding new utilities.

## Required state model

Every applicable component explicitly handles:
1. Idle/default.
2. Hover (fine pointer only).
3. Focus-visible (keyboard).
4. Pressed/active.
5. Selected/expanded/open.
6. Disabled/unavailable.
7. Loading, success or error.
8. Dragging/snapping.
9. Exit/reset/dismissed.

Semantic state must match visual state: aria-expanded, aria-pressed, aria-selected, disabled, aria-busy and aria-invalid as appropriate. Movement or color alone cannot communicate a required state.

## Pointer and touch rules

- Prefer Pointer Events over mouse-only handlers.
- Respect pointerType; no magnetic, cursor or hover effect for touch.
- Detect coarse/fine pointer capability when the visual pointer is essential.
- Calculate pointer position relative to the component bounds unless the spec explicitly defines a viewport effect.
- Clamp pointer-driven translation, rotation and scale.
- Reset on pointer leave, pointer cancel, blur and unmount where appropriate.
- Drag defines axis, constraints, momentum, snapping, cancellation and keyboard alternative.
- Do not block touch scrolling unless the region is an explicit gesture surface with an accessible alternative.

## Reduced motion

Use useReducedMotion from motion/react or the existing project hook after inspecting it.

When reduced motion is requested:
- remove large spatial travel, parallax, rotation, scale overshoot and scroll pinning when disorienting;
- stop ambient loops, particle systems, trails and nonessential cursor effects;
- show the final state immediately or use minimal opacity when appropriate;
- preserve content, state communication, focus and functionality;
- keep essential feedback such as selected, invalid or success states;
- never make motion necessary to understand the result.

Reduced motion is a separate acceptance path, not a code branch to forget.

## Timing and choreography

Follow the locked timing and easing table in 00-DESIGN-SYSTEM.md. Define a clear sequence: optional anticipation, primary change, restrained settle. Stagger only related items; 35–70 ms is the normal range. Routine UI must not use long cascades. Interaction response starts within one frame. Exit is usually shorter than entry. Loops need a documented purpose, pause/visibility behavior and reduced-motion fallback.

## Performance

- Prefer transform and opacity.
- Use MotionValues for pointer updates; do not call React state setters for every pointer event or frame.
- Avoid synchronous layout reads on every move. Cache bounds when practical and refresh after resize/layout changes.
- Clean up listeners, timers, observers and animation controls.
- Avoid large numbers of simultaneously animated DOM nodes. Use canvas or SVG only when scale justifies it and accessibility remains available.
- Do not animate box-shadow blur, filters or full-screen backdrops every frame.
- Pause continuous work off-screen and on hidden documents where practical.
- Lazy-load heavy demonstrations; do not add all playground effects to the public homepage critical path.
- Prevent hydration mismatch: deterministic render, no random render-time positions and no direct browser APIs during server render.

## Layout correctness

Keep layout sizing in Tailwind and animate visual properties in Motion. Do not mix Tailwind transform utilities and Motion transforms on the same element unless composition is explicitly understood. Use a dedicated child transform layer if needed. Reserve final layout size before entrance. Use overflow-hidden only for intentional masks; keep focus rings outside clipped containers. Do not solve stacking issues with arbitrary extreme z-index values.

## Accessibility

- Keyboard interaction equals pointer interaction for all actions.
- Keep visible focus in both themes.
- Respect native semantics and disabled behavior.
- Expose expanded, selected, pressed, busy and invalid states with appropriate ARIA.
- Dialogs, menus, popovers and tooltips must have correct focus, Escape and dismissal behavior.
- Do not communicate information through color, motion or sound alone.
- Do not move focus on hover.
- Motion demos include static content or controls that explain the current state.

## Testing contract

Each component needs tests for meaningful state/value behavior, keyboard interaction and reduced motion. Complex layout, pointer, scroll and drag components need responsive/browser checks. Review light and dark themes. Prefer behavior-level tests; avoid fragile tests that only search JSX strings when observable tests are practical.

## Code quality

Use descriptive names, small event handlers and no unexplained magic numbers. Extract tokens only when they represent intentional shared design. Avoid side effects during render. Clean up timers and listeners. Do not silence lint warnings without investigation. Never claim tests, browser checks or builds passed unless actually run.
