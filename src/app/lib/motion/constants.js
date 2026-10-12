/**
 * Motion duration tokens.
 * Keep all timing centralized here — never scatter raw ms values in components.
 */
export const motionDuration = {
  instant: 0.08,
  fast: 0.14,
  ui: 0.2,
  standard: 0.32,
  rich: 0.45,
  section: 0.6,
  cinematic: 0.85,
  hero: 1.0,
};

/**
 * Spring configs for Motion values.
 * Springs create weight, not bounce.
 */
export const springConfig = {
  /** Gentle damping — navigation, small indicators */
  gentle: { stiffness: 300, damping: 30 },

  /** Medium weight — cursor, medium elements */
  medium: { stiffness: 200, damping: 25 },

  /** Heavy — large elements, hero focal geometry */
  heavy: { stiffness: 120, damping: 20 },

  /** Ultra-smooth — scroll-linked transforms */
  smooth: { stiffness: 180, damping: 28 },
};

/**
 * Transition presets for use in motion components.
 */
export const transitions = {
  fast: {
    duration: motionDuration.fast,
    ease: [0.22, 1, 0.36, 1],
  },
  standard: {
    duration: motionDuration.standard,
    ease: [0.22, 1, 0.36, 1],
  },
  rich: {
    duration: motionDuration.rich,
    ease: [0.16, 1, 0.3, 1],
  },
  section: {
    duration: motionDuration.section,
    ease: [0.22, 1, 0.36, 1],
  },
  cinematic: {
    duration: motionDuration.cinematic,
    ease: [0.16, 1, 0.3, 1],
  },
};
