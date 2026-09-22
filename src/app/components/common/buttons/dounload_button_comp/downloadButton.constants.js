export const EASE = [0.22, 1, 0.36, 1];

export const DEFAULT_ICON_ANIMATION = {
    from: {
        x: 0,
        y: -9,
        scale: 0.7,
        opacity: 0,
        rotate: 0,
    },

    to: {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        rotate: 0,
    },

    duration: 0.3,
    ease: EASE,
};

export const DEFAULT_COVER_ANIMATION = {
    duration: 0.55,
    opacityDuration: 0.28,
    ease: EASE,
};

export const DEFAULT_CONTENT_ANIMATION = {
    duration: 0.2,
    distance: 6,
    ease: EASE,
};

export const DEFAULT_PROGRESS_ANIMATION = {
    duration: 0.2,
    ease: "linear",
};