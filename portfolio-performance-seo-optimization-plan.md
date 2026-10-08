# Portfolio Main Page --- Performance, SEO & Motion Optimization Implementation Plan

**Project:** Personal Portfolio\
**Primary goal:** Make the portfolio main page fast, SEO-friendly,
accessible, and maintainable without losing existing UI, Motion
animations, responsiveness, or functionality.

> **Important:** This document is an implementation specification. It
> does not assume that any component, hook, dependency, animation, or
> asset is unused until the actual codebase is inspected.

------------------------------------------------------------------------

## 0. Optimization Contract

### Core principle

The portfolio must become:

**Fast + SEO-friendly + accessible + visually preserved + fully
functional + animated + maintainable.**

Performance optimization must **not** become a redesign.

### Non-negotiable constraints

Do not remove or alter the following without explicit approval:

-   Existing UI/design
-   Layout and composition
-   Typography
-   Colors
-   Spacing
-   Responsive behavior
-   Navigation behavior
-   Existing project interactions
-   Existing links
-   Motion animations
-   Scroll animations
-   Parallax
-   Hover interactions
-   Lenis behavior
-   Intended transitions
-   Portfolio content

### Optimization philosophy

Do not optimize based on assumptions such as:

-   "`useEffect` is bad, remove it."
-   "`useMemo` is bad, remove it."
-   "`use client` is bad, remove it."
-   "Motion is slow, remove Motion."
-   "Dynamic import everything."
-   "Make everything a Server Component."
-   "Get Lighthouse to 100 at any cost."

Every change must have:

1.  Evidence
2.  A measurable reason
3.  A clear expected benefit
4.  A regression check
5.  A rollback path if the result is worse

------------------------------------------------------------------------

# Phase 1 --- Complete Codebase Inventory

## Objective

Understand the existing portfolio before touching implementation.

## Tasks

Inspect the complete project and catalog:

-   App Router routes
-   `page.*`
-   `layout.*`
-   loading/error/not-found files
-   Server Components
-   Client Components
-   UI components
-   section components
-   hooks
-   utilities
-   constants
-   data files
-   animation helpers
-   Motion components
-   Lenis implementation
-   Tailwind configuration
-   global styles
-   fonts
-   images
-   SVGs
-   videos
-   GIFs
-   icon libraries
-   dependencies
-   dynamic imports
-   API calls
-   metadata
-   SEO files
-   analytics
-   third-party scripts

## Output

Create:

`PERFORMANCE-INVENTORY.md`

with:

``` text
Routes
Components
Hooks
Utilities
Data
Animations
Assets
Dependencies
Client boundaries
Server boundaries
Third-party code
SEO configuration
```

## Definition of Done

-   [ ] Entire main-page dependency tree identified
-   [ ] All main-page sections identified
-   [ ] Client components identified
-   [ ] Server components identified
-   [ ] Motion/Lenis implementation locations identified
-   [ ] Asset locations identified
-   [ ] No code modified

------------------------------------------------------------------------

# Phase 2 --- Unused Component & Dead Code Audit

## Objective

Identify removable code before optimization.

## Inspect

### Components

Find components that appear unused.

### Hooks

Find hooks with no real consumer.

### Utilities

Find unused helper functions.

### Constants

Find unused constants.

### Data

Find unused data objects/arrays.

### Imports

Find unused imports.

### Dependencies

Identify dependencies that may no longer be required.

### Assets

Identify:

-   unused images
-   unused videos
-   unused SVGs
-   unused fonts
-   duplicate assets

### Duplicate code

Identify:

-   duplicate components
-   duplicate utility functions
-   duplicate animation configurations
-   duplicate constants
-   repeated patterns that could safely share implementation

## Important safety rules

Static search is not sufficient.

Before marking code unused, check:

-   dynamic imports
-   barrel exports
-   route conventions
-   Next.js conventions
-   metadata references
-   server actions
-   configuration files
-   runtime references
-   indirect usage

## Classification

Every candidate must be classified:

### HIGH confidence

No references found after complete repository search.

### MEDIUM confidence

No obvious references, but indirect/runtime usage is possible.

### LOW confidence

Possible usage cannot be ruled out.

## Do not delete during this phase

First produce the report.

## Output

`UNUSED-CODE-AUDIT.md`

Recommended structure:

``` text
# Unused Code Audit

## Summary

## Unused Components

## Unused Hooks

## Unused Utilities

## Unused Constants

## Unused Data

## Unused Imports

## Suspected Unused Dependencies

## Unused Assets

## Duplicate Code

## Duplicate Animation Logic

## High Confidence Cleanup

## Medium Confidence Review

## Low Confidence Review
```

## Definition of Done

-   [ ] Repository-wide search completed
-   [ ] Candidates documented
-   [ ] Confidence assigned
-   [ ] Nothing important deleted accidentally
-   [ ] No automatic deletion based only on filename/import heuristics

------------------------------------------------------------------------

# Phase 3 --- Establish Performance Baseline

## Objective

Measure the existing application before making performance changes.

Run against a production build.

Do not rely only on development mode.

## Measure

### Core Web Vitals

-   LCP
-   INP
-   CLS

### Loading

-   FCP
-   TTFB
-   resource loading
-   document response
-   critical asset loading

### Main thread

-   Total Blocking Time
-   Long Tasks
-   JavaScript execution
-   hydration work
-   scripting time
-   rendering time
-   painting time

### Resources

-   JavaScript transfer size
-   CSS transfer size
-   image transfer size
-   font transfer size
-   total requests
-   largest resources
-   third-party resources

### Next.js

Inspect production build output for:

-   route size
-   first-load JavaScript
-   shared chunks
-   client-side bundles
-   dynamically loaded chunks

## Output

`PERFORMANCE-BASELINE.md`

Include:

``` text
Metric                  Before
LCP                     ___
INP                     ___
CLS                     ___
FCP                     ___
TBT                     ___
TTFB                    ___
Initial JS              ___
Initial CSS             ___
Image transfer          ___
Font transfer           ___
Total requests          ___
```

Also record:

-   test device
-   browser
-   network condition
-   production/development mode
-   viewport
-   date
-   build identifier

## Definition of Done

-   [ ] Production build tested
-   [ ] Baseline recorded
-   [ ] Largest performance bottlenecks identified
-   [ ] No optimization implemented yet

------------------------------------------------------------------------

# Phase 4 --- Main Page Architecture Audit

## Objective

Understand how the main page renders.

For each section identify:

1.  Component
2.  Parent component
3.  Server/Client boundary
4.  Hooks
5.  State
6.  Effects
7.  Motion
8.  Lenis
9.  Event listeners
10. Browser APIs
11. Data dependencies
12. Images
13. Fonts
14. Icons
15. External dependencies
16. Render triggers
17. Hydration requirements

## Section audit template

``` text
SECTION:
Component:

Rendering:
Server / Client

Why client-side execution is required:

Hooks:
- hook
- purpose
- trigger
- render impact

State:
- state
- purpose
- update frequency

Effects:
- effect
- dependency
- reason

Motion:
- API
- trigger
- frequency
- cost

Assets:
- images
- fonts
- videos
- icons

Potential bottlenecks:

Recommended optimization:

Regression risk:

Definition of done:
```

## Definition of Done

Every main-page section has an explicit rendering/performance profile.

------------------------------------------------------------------------

# Phase 5 --- React Hook Audit

## Objective

Prevent bad AI-driven hook optimization.

Every hook must be justified individually.

## Inspect

-   `useState`
-   `useEffect`
-   `useMemo`
-   `useCallback`
-   `useRef`
-   `useContext`
-   custom hooks
-   Motion hooks
-   browser-related hooks

## For every hook ask

``` text
Why does this hook exist?
What value does it provide?
What triggers it?
How often can it run?
Does it trigger React rendering?
Does it perform browser work?
Does it perform network work?
Can the work move outside React?
Can it be derived instead of stored?
Can it be server-side?
Can it be event-driven?
Is memoization actually beneficial?
```

## `useEffect` audit

Look specifically for effects used for:

-   derived state
-   initialization that can happen during render
-   DOM synchronization
-   fetching that belongs elsewhere
-   event listeners
-   timers
-   animation loops
-   duplicated state synchronization

Do not remove effects automatically.

## `useMemo` / `useCallback`

Do not add or remove them blindly.

Determine:

-   actual computation cost
-   dependency stability
-   child memoization relationship
-   whether the memoization itself adds complexity/cost

## Definition of Done

-   [ ] Every significant hook has a documented reason
-   [ ] Unnecessary effects identified
-   [ ] Derived state identified
-   [ ] Unnecessary memoization identified
-   [ ] No behavior regression

------------------------------------------------------------------------

# Phase 6 --- Server / Client Boundary Optimization

## Objective

Reduce unnecessary client JavaScript and hydration without breaking
interactions.

## Audit

For every `"use client"` component ask:

> Does this component genuinely need browser-side React?

Possible reasons:

-   event handlers
-   local interactive state
-   browser APIs
-   Motion
-   animation state
-   client-only library
-   localStorage/sessionStorage
-   pointer/scroll interaction

If no valid reason exists, evaluate conversion to Server Component.

## Important

Do not convert a component merely to reduce a metric.

Verify:

-   UI remains identical
-   animations remain correct
-   interactions remain functional
-   server/client boundaries remain valid

## Definition of Done

-   [ ] Client boundaries justified
-   [ ] Unnecessary hydration reduced
-   [ ] Motion boundaries preserved
-   [ ] Interactive behavior unchanged

------------------------------------------------------------------------

# Phase 7 --- Motion / Animation Optimization

## Objective

Preserve the portfolio's visual quality while reducing animation
overhead.

## Audit

Inspect:

-   `motion`
-   `AnimatePresence`
-   `useScroll`
-   `useTransform`
-   `useSpring`
-   `useMotionValue`
-   `useInView`
-   variants
-   transitions
-   viewport triggers
-   continuous animations
-   pointer movement
-   mouse movement
-   scroll events
-   resize events
-   requestAnimationFrame loops

## Check for

-   animations running while off-screen
-   unnecessary continuous animation
-   excessive React state updates
-   animation values stored in React state
-   duplicated scroll subscriptions
-   duplicated Motion values
-   layout-affecting animation
-   expensive blur/filter effects
-   unnecessary DOM measurement
-   animation work repeated per render

## Prefer

-   `transform`
-   `opacity`
-   Motion values
-   viewport-based activation
-   event-driven updates
-   compositor-friendly properties
-   shared values where appropriate

## Avoid unnecessary animation of

-   `width`
-   `height`
-   `top`
-   `left`
-   `margin`
-   `padding`
-   other layout-triggering properties

## Critical rule

Do not remove a meaningful animation merely because it exists.

First optimize its execution.

## Definition of Done

-   [ ] Existing animation behavior preserved
-   [ ] Off-screen work minimized where safe
-   [ ] Layout-triggering animation minimized
-   [ ] React re-renders reduced where possible
-   [ ] No visible animation regression

------------------------------------------------------------------------

# Phase 8 --- Lenis Audit

## Objective

Ensure smooth scrolling does not become a global performance bottleneck.

Inspect:

-   Lenis initialization
-   lifecycle
-   RAF integration
-   event listeners
-   duplicated instances
-   cleanup
-   interaction with Motion
-   interaction with ScrollTrigger if present
-   mobile behavior

Verify:

-   only the required number of instances exists
-   listeners are not duplicated
-   lifecycle is correct
-   cleanup occurs when appropriate
-   animation system is not updating React state unnecessarily

## Definition of Done

-   [ ] One intentional scroll system
-   [ ] No duplicate listeners
-   [ ] Correct lifecycle
-   [ ] Smooth scrolling preserved
-   [ ] Mobile behavior preserved

------------------------------------------------------------------------

# Phase 9 --- Asset Optimization

## Objective

Reduce loading cost without reducing intended visual quality.

## Images

Inspect:

-   dimensions
-   intrinsic size
-   rendered size
-   format
-   compression
-   responsive behavior
-   loading strategy
-   priority
-   LCP relevance

Use the appropriate Next.js image strategy.

Do not blindly lazy-load above-the-fold/LCP assets.

## Videos

Inspect:

-   preload behavior
-   poster
-   dimensions
-   codec/format
-   autoplay behavior
-   mobile behavior
-   whether loading can be deferred

## GIFs

Identify GIFs that are unnecessarily expensive and evaluate video
replacement only if visual behavior remains equivalent.

## Fonts

Inspect:

-   number of font files
-   font weights
-   subsets
-   preload
-   display strategy
-   unused weights

Do not remove a font weight that the UI actually uses.

## Icons

Check for:

-   unnecessary library loading
-   oversized SVGs
-   duplicate icon systems
-   unnecessary client-side icon logic

## Definition of Done

-   [ ] LCP assets optimized
-   [ ] Below-fold assets deferred where appropriate
-   [ ] Oversized assets corrected
-   [ ] Fonts reviewed
-   [ ] No visual quality regression

------------------------------------------------------------------------

# Phase 10 --- JavaScript Bundle Optimization

## Objective

Reduce initial JavaScript without damaging functionality.

Inspect:

-   package dependencies
-   bundle analyzer output
-   shared chunks
-   large dependencies
-   duplicate dependencies
-   barrel imports
-   client-only packages
-   third-party scripts
-   dynamically loadable features

## Questions

-   Is the package needed on the homepage?
-   Does the entire package load for one small feature?
-   Can a feature be deferred?
-   Can a specific import reduce bundle size?
-   Is a dependency duplicated?
-   Is a server-only dependency entering the client bundle?

## Dynamic imports

Use only when there is evidence of benefit.

Do not create excessive chunks.

## Definition of Done

-   [ ] Largest client dependencies identified
-   [ ] Unnecessary client dependencies removed
-   [ ] Heavy below-fold functionality deferred where justified
-   [ ] Initial JavaScript reduced or better justified
-   [ ] No interaction regression

------------------------------------------------------------------------

# Phase 11 --- CSS / Rendering Optimization

## Objective

Reduce browser rendering cost while keeping the same design.

Inspect:

-   global CSS
-   Tailwind usage
-   large selectors
-   expensive filters
-   backdrop blur
-   shadows
-   layout calculations
-   DOM depth
-   forced layout
-   repeated measurements

## Pay particular attention to

-   `filter`
-   `backdrop-filter`
-   large blur
-   large shadows
-   animated layout properties
-   nested animated containers
-   unnecessary DOM wrappers

Do not remove visual effects merely because they are expensive.

Measure first.

## Definition of Done

-   [ ] Expensive rendering identified
-   [ ] Safe optimizations implemented
-   [ ] UI remains visually equivalent

------------------------------------------------------------------------

# Phase 12 --- SEO Optimization

## Objective

Improve search engine understanding without changing the portfolio's
identity.

## Check

### Metadata

-   title
-   description
-   canonical
-   robots
-   Open Graph
-   social metadata

### Structure

-   semantic HTML
-   H1
-   heading hierarchy
-   section structure
-   nav
-   main
-   footer

### Content

-   meaningful text available to crawlers
-   project descriptions
-   experience
-   skills
-   links
-   image alt text

### Technical SEO

-   sitemap
-   robots
-   canonical
-   crawlability
-   indexability
-   redirects
-   status codes

### Structured data

Evaluate appropriate structured data such as:

-   Person
-   WebSite
-   CreativeWork/Project where justified

Do not add irrelevant schema.

## Definition of Done

-   [ ] Metadata complete
-   [ ] H1 correct
-   [ ] Heading hierarchy correct
-   [ ] Semantic structure correct
-   [ ] Crawlable content preserved
-   [ ] Sitemap/robots verified
-   [ ] Structured data validated if added

------------------------------------------------------------------------

# Phase 13 --- Accessibility Audit

## Objective

Improve accessibility without removing the visual experience.

Check:

-   semantic elements
-   keyboard navigation
-   focus states
-   focus visibility
-   buttons vs links
-   accessible names
-   image alt text
-   contrast
-   heading hierarchy
-   navigation
-   form labels if applicable
-   reduced-motion behavior

## Reduced motion

Respect:

`prefers-reduced-motion`

The reduced-motion experience should remove or reduce non-essential
motion without breaking functionality.

## Definition of Done

-   [ ] Keyboard navigation works
-   [ ] Interactive elements are semantic
-   [ ] Images have appropriate alt text
-   [ ] Focus states are visible
-   [ ] Reduced-motion behavior works
-   [ ] No major accessibility regressions

------------------------------------------------------------------------

# Phase 14 --- Section-by-Section Implementation

Do not optimize all sections simultaneously.

Recommended order:

1.  Global shell
2.  Navbar
3.  Hero
4.  About/intro
5.  Skills
6.  Experience
7.  Projects
8.  Project showcase
9.  Additional sections
10. CTA
11. Footer

Use the actual portfolio section order if different.

## For every section

``` text
AUDIT
↓
IDENTIFY BOTTLENECK
↓
PROPOSE CHANGE
↓
IMPLEMENT MINIMAL CHANGE
↓
BUILD
↓
LINT
↓
TYPE CHECK
↓
VISUAL CHECK
↓
MOBILE CHECK
↓
DESKTOP CHECK
↓
ANIMATION CHECK
↓
FUNCTIONALITY CHECK
↓
PERFORMANCE CHECK
↓
ACCEPT / ROLLBACK
```

## Section acceptance criteria

A section is accepted only when:

-   [ ] UI is preserved
-   [ ] Responsive behavior is preserved
-   [ ] Animation is preserved
-   [ ] Functionality is preserved
-   [ ] No console errors
-   [ ] Build passes
-   [ ] Performance improvement is measurable or the change improves
    maintainability without measurable regression

------------------------------------------------------------------------

# Phase 15 --- Whole Page Integration Audit

After all sections are individually optimized, inspect the entire
homepage again.

Look for problems created by interaction between sections:

-   duplicate event listeners
-   duplicated Motion subscriptions
-   duplicated data
-   duplicate animation logic
-   multiple scroll systems
-   unnecessary global state
-   excessive hydration
-   repeated asset loading
-   large initial DOM
-   long tasks
-   layout shifts
-   unexpected loading waterfalls

## Definition of Done

-   [ ] Whole-page render reviewed
-   [ ] Section boundaries still make sense
-   [ ] No duplicated global behavior
-   [ ] No new performance regressions

------------------------------------------------------------------------

# Phase 16 --- Production Build Verification

Run the production build.

Verify:

-   build success
-   lint
-   type check
-   route generation
-   static/dynamic rendering behavior
-   no runtime errors
-   no hydration warnings
-   no missing assets
-   no broken links

Check browser console for:

-   errors
-   warnings
-   hydration mismatch
-   failed requests

## Definition of Done

-   [ ] Production build succeeds
-   [ ] No new console errors
-   [ ] No hydration errors
-   [ ] All main routes work

------------------------------------------------------------------------

# Phase 17 --- Final Performance Comparison

Run the same measurement process used in Phase 3.

Use identical:

-   device
-   browser
-   viewport
-   network
-   production build conditions

## Compare

  Metric          Before   After   Change
  ------------- -------- ------- --------
  LCP                            
  INP                            
  CLS                            
  FCP                            
  TBT                            
  TTFB                           
  Initial JS                     
  Initial CSS                    
  Images                         
  Fonts                          
  Requests                       

Also record:

-   largest remaining bottleneck
-   biggest improvement
-   regressions
-   intentionally retained expensive behavior
-   future optimization opportunities

------------------------------------------------------------------------

# Phase 18 --- Final Cleanup

Only after all changes have been verified:

## Remove

-   confirmed unused components
-   confirmed unused hooks
-   confirmed unused utilities
-   confirmed unused imports
-   confirmed unused dependencies
-   confirmed unused assets

## Do not remove

-   low-confidence code
-   dynamic/runtime references
-   intentionally retained fallback code
-   functionality required by other routes

Run:

-   lint
-   type check
-   build
-   tests if available
-   final visual check

------------------------------------------------------------------------

# Phase 19 --- Final Documentation

Create:

`PERFORMANCE-OPTIMIZATION-REPORT.md`

Include:

## 1. Executive Summary

What improved.

## 2. Unused Code Removed

Files and reason.

## 3. React Improvements

Client/server boundary changes, hook changes, effects, rendering.

## 4. Motion Improvements

What changed and why visual behavior remains preserved.

## 5. Lenis Improvements

Scroll-system changes.

## 6. Asset Improvements

Images, fonts, videos, icons.

## 7. Bundle Improvements

Dependencies and JavaScript.

## 8. SEO Improvements

Metadata, semantic structure, structured data, crawlability.

## 9. Accessibility Improvements

Keyboard, semantics, reduced motion, etc.

## 10. Before/After Metrics

Include the complete performance table.

## 11. Remaining Bottlenecks

Do not hide unresolved issues.

## 12. Regression Verification

Document:

-   UI
-   responsive behavior
-   animation
-   functionality
-   SEO
-   accessibility

------------------------------------------------------------------------

# Global Definition of Done

The project is complete only when all conditions are satisfied.

## Code

-   [ ] Inventory complete
-   [ ] Unused-code audit complete
-   [ ] High-confidence dead code cleaned
-   [ ] Client boundaries justified
-   [ ] Hooks audited
-   [ ] Effects audited
-   [ ] Dependencies audited

## Performance

-   [ ] Production baseline recorded
-   [ ] Main-page bottlenecks identified
-   [ ] LCP optimized
-   [ ] INP optimized
-   [ ] CLS controlled
-   [ ] JavaScript reviewed
-   [ ] Assets reviewed
-   [ ] Main-thread work reviewed
-   [ ] Long tasks reviewed

## Motion

-   [ ] Motion preserved
-   [ ] Scroll animations preserved
-   [ ] Parallax preserved
-   [ ] Hover interactions preserved
-   [ ] Lenis preserved
-   [ ] Expensive animation work optimized
-   [ ] Reduced-motion behavior supported

## SEO

-   [ ] Title
-   [ ] Description
-   [ ] Canonical
-   [ ] Robots
-   [ ] Sitemap
-   [ ] Open Graph
-   [ ] Semantic HTML
-   [ ] H1
-   [ ] Heading hierarchy
-   [ ] Alt text
-   [ ] Structured data where appropriate

## Accessibility

-   [ ] Keyboard navigation
-   [ ] Focus states
-   [ ] Semantic controls
-   [ ] Accessible names
-   [ ] Contrast
-   [ ] Reduced motion

## Functionality

-   [ ] Navigation works
-   [ ] Mobile navigation works
-   [ ] All links work
-   [ ] Project interactions work
-   [ ] Existing interactive features work
-   [ ] No hydration errors
-   [ ] No console errors

## Visual

-   [ ] Desktop unchanged
-   [ ] Tablet unchanged
-   [ ] Mobile unchanged
-   [ ] Animations unchanged
-   [ ] Typography preserved
-   [ ] Spacing preserved
-   [ ] Colors preserved

------------------------------------------------------------------------

# Final Engineering Rule

Never ask:

> "How can I make this portfolio score 100?"

Ask:

> "What is the smallest evidence-based engineering change that makes
> this portfolio faster without damaging the experience?"

The final optimization target is:

**Performance without compromise.**

**SEO without content distortion.**

**Motion without unnecessary runtime work.**

**Clean code without deleting real functionality.**

**AI assistance without blindly trusting AI refactors.**
