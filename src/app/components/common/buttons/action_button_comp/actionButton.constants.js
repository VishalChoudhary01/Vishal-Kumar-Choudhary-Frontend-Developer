export const EASE = [0.16, 1, 0.3, 1];

export const DEFAULT_LABEL_ANIMATION = {
    distance: 12,
    duration: 0.4,
    ease: EASE,
};

export const DEFAULT_ICON_ANIMATION = {
    from: {
        x: -5,
        y: 7,
        scale: 0.6,
        opacity: 0,
        rotate: -12,
    },
    to: {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        rotate: 0,
    },
    duration: 0.36,
    ease: EASE,
};

export const DEFAULT_RIPPLE_ANIMATION = {
    duration: 0.55,
    opacityDuration: 0.28,
    ease: EASE,
};