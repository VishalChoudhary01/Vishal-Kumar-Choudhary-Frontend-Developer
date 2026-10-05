/* ------------------------------------------------------------------
   PROJECT HERO MOTION SYSTEM.
   One easing curve, one delay sequence (spec §30–31).
   Sequence: background 0.00 → eyebrow 0.05 → visual 0.15 → title 0.10
             → description 0.25 → meta 0.35 → actions 0.40 → cue 0.70
------------------------------------------------------------------ */

export const EASE = [0.22, 1, 0.36, 1];

export const DURATION = {
    atmosphere: 1.1,
    title: 0.9,
    block: 0.7,
    visual: 1.1,
    cue: 0.7,
};

export const DELAY = {
    atmosphere: 0,
    eyebrow: 0.05,
    visual: 0.15,
    title: 0.1,
    description: 0.25,
    meta: 0.35,
    actions: 0.4,
    cue: 0.7,
};

/* Entrance presets. Reduced motion renders instantly (no transform,
   no blur, no parallax) so all content stays immediately accessible. */
export function heroEntrance(reduced, { delay = 0, y = 18, blur = 0 } = {}) {
    if (reduced) {
        return {
            initial: false,
            animate: { opacity: 1 },
            transition: { duration: 0 },
        };
    }

    return {
        initial: {
            opacity: 0,
            y,
            ...(blur ? { filter: `blur(${blur}px)` } : {}),
        },
        animate: {
            opacity: 1,
            y: 0,
            ...(blur ? { filter: "blur(0px)" } : {}),
        },
        transition: { duration: DURATION.block, delay, ease: EASE },
    };
}
