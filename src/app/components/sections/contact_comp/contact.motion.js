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
        y: 20,
    },

    field: {
        duration: 0.26,
        ease: EASE_STANDARD,
    },

    focus: {
        duration: 0.35,
        ease: EASE_FOCUS,
    },

    button: {
        duration: 0.3,
        ease: EASE_STANDARD,
        pressDuration: 0.12,
        pressScale: 0.98,
    },

    error: {
        duration: 0.25,
        ease: EASE_STANDARD,
        y: -4,
    },

    success: {
        duration: 0.6,
        ease: EASE_FOCUS,
    },

    stagger: 0.06,

    background: {
        duration: 42,
        ease: "easeInOut",
    },
};

export const CONTACT_STAGGER = {
    intro: 0,
    name: 0.06,
    email: 0.12,
    projectType: 0.18,
    message: 0.24,
    submit: 0.3,
    directEmail: 0.36,
};