# Shared Element Transition

**Status:** Proposed · **Category:** Navigation and layout · **Milestone:** 5 — Advanced interaction systems

## Purpose
A visual element that preserves identity while moving between two UI layouts, such as a project thumbnail expanding into a project detail hero. The source and destination represent the same entity and share a stable transition identity.

## Visual composition
- The shared element retains its image/content identity, aspect relationship and semantic context during the transition.
- Use the normal source and destination layouts; motion connects them rather than replacing them with an invented overlay.
- Keep the source and destination geometry intentional. Avoid extreme scaling, rounded-to-square surprises or text that becomes unreadable mid-flight.
- Supporting content may crossfade independently while the shared visual remains the transition anchor.

## Motion choreography
- Wrap participating views in a common `LayoutGroup` and assign the same stable `layoutId` to the source and destination element.
- Use `AnimatePresence` only where conditional source/destination mounting requires coordinated exit/entry.
- Prefer the project's Standard/Balanced timing and a restrained opacity crossfade for supporting content. Do not add bounce or cursor effects.
- Navigation remains user-controlled. The component must not intercept or replace Next.js navigation.
- If source and destination are not both present in the expected layout transition context, render a normal non-animated change rather than a broken ghost element.

## Public API intent
A small `SharedElementGroup` boundary and `SharedElement` primitive with `id`, `groupId`, `children`, optional semantic element selection, and `disabled`. IDs must be stable, unique within the group and derived from real entity identity. Do not expose arbitrary Motion props.

## Accessibility and responsive behavior
Source and destination keep their native link/button semantics and accessible names. Focus remains with the navigation action and is not moved by the transition. Reduced motion disables spatial layout travel and uses an immediate swap or brief opacity change. Ensure the destination is readable at narrow widths.

## Performance and implementation notes
Use `motion/react` `LayoutGroup`, `layoutId`, `layout` and `AnimatePresence` only where required. Keep the shared element subtree small, reserve image aspect ratios, and avoid global transition managers. In Next.js App Router, integrate at a stable shared layout boundary and preserve normal URL, history and scroll behavior.

## Acceptance criteria
- Matching source/destination IDs transition as one visual entity.
- Missing or mismatched IDs fail safely to normal navigation.
- Focus, screen-reader names, URL history and scroll behavior remain correct.
- Reduced motion avoids spatial travel.
- No stale shared element, layout flash or route interception occurs.
