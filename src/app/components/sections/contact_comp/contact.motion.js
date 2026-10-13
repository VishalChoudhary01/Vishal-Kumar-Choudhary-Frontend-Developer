export const EASE_STANDARD = [
    0.22,
    1,
    0.36,
    1,
];

export const EASE_FOCUS = [
    0.16,
    1,
    0.3,
    1,
];

export const EASE_REVEAL = [
    0.16,
    1,
    0.3,
    1,
];

export const CONTACT_MOTION = {
    reveal: {
        duration: 0.6,
        ease: EASE_REVEAL,
    },

    focus: {
        duration: 0.35,
        ease: EASE_FOCUS,
    },

    error: {
        duration: 0.25,
        ease: EASE_STANDARD,
        y: -4,
    },

    background: {
        duration: 42,
        ease: "easeInOut",
    },
};

export const CONTACT_STAGGER = {
    name: 0.06,
    projectType: 0.18,
    message: 0.24,
    submit: 0.3,
};