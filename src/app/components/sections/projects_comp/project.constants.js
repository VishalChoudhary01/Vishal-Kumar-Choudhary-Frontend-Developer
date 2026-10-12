export const EASE_EDITORIAL = [0.22, 1, 0.36, 1];

/*
 * Card radius — responsive by breakpoint.
 *
 * Mobile uses a restrained, editorial radius; the desktop value is
 * preserved exactly as designed (md: keeps the previous class).
 */
const RADIUS_DESKTOP_2XL = "rounded-md sm:rounded-lg md:rounded-2xl";
const RADIUS_DESKTOP_XL = "rounded-md sm:rounded-lg md:rounded-xl";

export const PROJECT_TYPE_LABELS = {
    "landing-page": "WEB EXPERIENCE",
    website: "WEBSITE",
    editorial: "EDITORIAL",
    redesign: "REDESIGN",
    product: "PRODUCT",
    tool: "TOOL",
    "web-app": "WEB APP",
    game: "GAME",
    interactive: "INTERACTIVE",
    experiment: "EXPERIMENT",
};

export const PROJECT_VARIANTS = {
    editorial: {
        featured: {
            aspect: "16/9",
            radius: RADIUS_DESKTOP_2XL,
        },
        split: {
            aspect: "16/10",
            radius: RADIUS_DESKTOP_XL,
        },
        minimal: {
            aspect: "16/10",
            radius: RADIUS_DESKTOP_XL,
        },
    },

    product: {
        interface: {
            aspect: "16/10",
            radius: RADIUS_DESKTOP_2XL,
        },
        showcase: {
            aspect: "16/9",
            radius: RADIUS_DESKTOP_XL,
        },
    },

    interactive: {
        immersive: {
            aspect: "16/9",
            radius: RADIUS_DESKTOP_2XL,
        },
        experiment: {
            aspect: "4/3",
            radius: RADIUS_DESKTOP_XL,
        },
    },

    visual: {
        cinematic: {
            aspect: "21/9",
            radius: RADIUS_DESKTOP_2XL,
        },
        gallery: {
            aspect: "16/9",
            radius: RADIUS_DESKTOP_XL,
        },
    },
};

export const PRESENTATION_DEFAULTS = {
    editorial: {
        variant: "featured",
        hover: "mediaDepth",
    },
    product: {
        variant: "interface",
        hover: "mediaScale",
    },
    interactive: {
        variant: "immersive",
        hover: "interactiveHover",
    },
    visual: {
        variant: "cinematic",
        hover: "interactiveHover",
    },
};