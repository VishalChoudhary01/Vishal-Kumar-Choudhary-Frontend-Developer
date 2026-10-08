/**
 * PROJECT MOTION PRESETS — reusable animation configurations.
 *
 * All motion values are controlled presets. Project data references preset
 * names; the presentation system maps them to animation configs. This keeps
 * the portfolio visually coherent — no arbitrary values from content data.
 *
 * Usage:
 *   import { ENTRANCE_PRESETS, MEDIA_PRESETS, HOVER_PRESETS } from "@/lib/motion/projectPresets";
 *   const config = ENTRANCE_PRESETS[project.motion.entrance] ?? ENTRANCE_PRESETS.editorialReveal;
 */

/* ============================================================================
   EASING CURVES — consistent with portfolio's existing motion language
   ========================================================================== */

const EASE_STANDARD = [0.22, 1, 0.36, 1];
const EASE_SMOOTH = [0.16, 1, 0.3, 1];
const EASE_OUT = [0, 0, 0.2, 1];

/* ============================================================================
   ENTRANCE PRESETS — how project content enters the viewport
   ========================================================================== */

export const ENTRANCE_PRESETS = {
  /**
   * editorialReveal — staggered editorial entrance.
   * Content rises through overflow-hidden masks in a choreographed sequence.
   * Default for editorial projects.
   */
  editorialReveal: {
    label: {
      duration: 0.5,
      delay: 0,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
    },
    category: {
      duration: 0.4,
      delay: 0.03,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
    },
    title: {
      duration: 0.55,
      delay: 0.05,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
    },
    description: {
      duration: 0.5,
      delay: 0.1,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 14 },
      animate: { opacity: 1, y: 0 },
    },
    media: {
      duration: 0.65,
      delay: 0.15,
      ease: EASE_SMOOTH,
      initial: { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0 },
    },
    meta: {
      duration: 0.45,
      delay: 0.22,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
    },
    contribution: {
      duration: 0.45,
      delay: 0.28,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
    },
    features: {
      duration: 0.4,
      delay: 0.34,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
    },
    actions: {
      duration: 0.4,
      delay: 0.38,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
    },
  },

  /**
   * productReveal — slightly faster entrance, more matter-of-fact.
   * Product projects communicate functionality; entrance is clean and direct.
   */
  productReveal: {
    label: {
      duration: 0.45,
      delay: 0,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 14 },
      animate: { opacity: 1, y: 0 },
    },
    category: {
      duration: 0.35,
      delay: 0.02,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
    },
    title: {
      duration: 0.5,
      delay: 0.04,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 14 },
      animate: { opacity: 1, y: 0 },
    },
    description: {
      duration: 0.45,
      delay: 0.08,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
    },
    media: {
      duration: 0.6,
      delay: 0.12,
      ease: EASE_SMOOTH,
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
    meta: {
      duration: 0.4,
      delay: 0.18,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
    },
    contribution: {
      duration: 0.4,
      delay: 0.22,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
    },
    features: {
      duration: 0.35,
      delay: 0.26,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
    },
    actions: {
      duration: 0.35,
      delay: 0.3,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
    },
  },

  /**
   * interactiveReveal — dramatic entrance for experiments/games.
   * Media takes visual priority with a bolder reveal.
   */
  interactiveReveal: {
    label: {
      duration: 0.5,
      delay: 0,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
    },
    category: {
      duration: 0.4,
      delay: 0.04,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
    },
    title: {
      duration: 0.55,
      delay: 0.06,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
    },
    description: {
      duration: 0.5,
      delay: 0.12,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 14 },
      animate: { opacity: 1, y: 0 },
    },
    media: {
      duration: 0.75,
      delay: 0.08,
      ease: EASE_SMOOTH,
      initial: { opacity: 0, scale: 0.96, y: 28 },
      animate: { opacity: 1, scale: 1, y: 0 },
    },
    meta: {
      duration: 0.4,
      delay: 0.24,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
    },
    contribution: {
      duration: 0.4,
      delay: 0.28,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
    },
    features: {
      duration: 0.35,
      delay: 0.32,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
    },
    actions: {
      duration: 0.35,
      delay: 0.36,
      ease: EASE_STANDARD,
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
    },
  },
};

/* ============================================================================
   MEDIA PRESETS — how project media enters and behaves at rest
   ========================================================================== */

export const MEDIA_PRESETS = {
  /**
   * mediaReveal — standard viewport reveal with subtle scale.
   * Clean, premium, works for all project types.
   */
  mediaReveal: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, ease: EASE_SMOOTH },
  },

  /**
   * cinematicReveal — dramatic scale-in for visual-first projects.
   * Media starts slightly zoomed and settles into place.
   */
  cinematicReveal: {
    initial: { opacity: 0, scale: 0.96, y: 24 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { duration: 0.8, ease: EASE_SMOOTH },
  },

  /**
   * productReveal — interface-first reveal for product projects.
   * Clean, direct, emphasizes functionality.
   */
  productReveal: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: EASE_STANDARD },
  },
};

/* ============================================================================
   HOVER PRESETS — how media responds on desktop hover
   ========================================================================== */

export const HOVER_PRESETS = {
  /**
   * mediaDepth — subtle 3D tilt + scale on hover.
   * Used for editorial/featured projects.
   */
  mediaDepth: {
    scale: { hovered: 1.025, titleHovered: 1.01, rest: 1 },
    perspective: 1200,
    rotateMax: 1.5,
    translateMax: 10,
    transition: { duration: 0.5, ease: EASE_STANDARD },
  },

  /**
   * mediaScale — simple scale without 3D tilt.
   * Used for projects where tilt would be distracting.
   */
  mediaScale: {
    scale: { hovered: 1.02, titleHovered: 1.008, rest: 1 },
    perspective: null,
    rotateMax: 0,
    translateMax: 0,
    transition: { duration: 0.45, ease: EASE_STANDARD },
  },

  /**
   * interactiveHover — bold scale for interactive/experiment projects.
   */
  interactiveHover: {
    scale: { hovered: 1.03, titleHovered: 1.015, rest: 1 },
    perspective: 1400,
    rotateMax: 1.2,
    translateMax: 8,
    transition: { duration: 0.55, ease: EASE_SMOOTH },
  },
};

/* ============================================================================
   SCROLL PRESETS — subtle viewport-position responses
   ========================================================================== */

export const SCROLL_PRESETS = {
  /**
   * softDepth — extremely subtle depth shift as media enters viewport.
   */
  softDepth: {
    translateY: [12, 0],
    scale: [0.985, 1],
    transition: { duration: 0.8, ease: EASE_SMOOTH },
  },

  /**
   * none — no scroll-linked transforms. Content is static after entrance.
   */
  none: null,
};

/* ============================================================================
   PROJECT ITEM REVEAL — per-item viewport entry for project-detail sections
   ========================================================================== */

/**
 * PROJECT_ITEM_REVEAL — a single content item entering the viewport.
 *
 * Used by the project-detail body sections (context, approach, engineering,
 * motion, responsive, reflection) so that EACH meaningful item owns its own
 * entry animation instead of the whole list moving as one block.
 *
 * Direction is RIGHT → LEFT: the item slides in from the right while a
 * clip-path wipe opens it from its right edge, plus a slight shear so the
 * motion reads as designed rather than a bare fade.
 *
 * No bounce, no spring overshoot, no rotation, no scale, no vertical
 * travel. Items are triggered by their own viewport position, with only a
 * very small index stagger.
 */
export const PROJECT_ITEM_REVEAL = {
    initial: {
        opacity: 0,
        x: 56,
        skewX: -3,
        clipPath: "inset(0 0 0 100%)",
    },
    whileInView: {
        opacity: 1,
        x: 0,
        skewX: 0,
        clipPath: "inset(0 0 0 0%)",
    },
    viewport: {
        once: true,
        /*
         * amount is 0 (intersection, not ratio) on purpose: the initial
         * clip-path wipe paints the item at zero area, so Chromium reports
         * intersectionRatio === 0 while the item is in view. Triggering on
         * isIntersecting keeps the reveal reliable in every browser.
         */
        amount: 0,
        margin: "0px 0px -8% 0px",
    },
    transition: {
        duration: 0.7,
        ease: EASE_SMOOTH,
    },
};

/**
 * Build Motion props for one project-detail content item.
 *
 * Spreads directly onto a motion element that KEEPS its existing element
 * type and classNames — never wrap an existing item in another container.
 *
 * @param {number} index - position in the list (drives the tiny 60ms stagger)
 * @param {boolean} reduced - reduced-motion preference; renders immediately
 * @returns {object} props for a motion element
 */
export function projectItemReveal(index = 0, reduced = false) {
    if (reduced) {
        return {
            initial: false,
            viewport: PROJECT_ITEM_REVEAL.viewport,
            transition: { duration: 0 },
        };
    }

    return {
        initial: PROJECT_ITEM_REVEAL.initial,
        whileInView: PROJECT_ITEM_REVEAL.whileInView,
        viewport: PROJECT_ITEM_REVEAL.viewport,
        transition: {
            ...PROJECT_ITEM_REVEAL.transition,
            delay: index * 0.06,
        },
    };
}

/* ============================================================================
   UTILITY — resolve a preset by name with fallback
   ========================================================================== */

/**
 * Safely resolve a preset from a presets map.
 * Falls back to the first preset in the map if the name is not found.
 */
export function resolvePreset(map, name) {
  if (name && map[name]) return map[name];
  const keys = Object.keys(map);
  return keys.length > 0 ? map[keys[0]] : null;
}

/**
 * Build a Motion transition object from a preset entry.
 * Presets store duration/delay/ease at the top level;
 * this converts them to the { duration, delay, ease } shape Motion expects.
 */
export function toTransition(preset) {
  if (!preset) return { duration: 0.5, ease: [0.22, 1, 0.36, 1] };
  return {
    duration: preset.duration ?? 0.5,
    delay: preset.delay ?? 0,
    ease: preset.ease ?? [0.22, 1, 0.36, 1],
  };
}
