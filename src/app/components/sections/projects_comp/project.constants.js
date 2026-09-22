export const EASE_EDITORIAL = [0.22, 1, 0.36, 1];

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
            radius: "rounded-2xl",
        },
        split: {
            aspect: "16/10",
            radius: "rounded-xl",
        },
        minimal: {
            aspect: "16/10",
            radius: "rounded-xl",
        },
    },

    product: {
        interface: {
            aspect: "16/10",
            radius: "rounded-2xl",
        },
        showcase: {
            aspect: "16/9",
            radius: "rounded-xl",
        },
    },

    interactive: {
        immersive: {
            aspect: "16/9",
            radius: "rounded-2xl",
        },
        experiment: {
            aspect: "4/3",
            radius: "rounded-xl",
        },
    },

    visual: {
        cinematic: {
            aspect: "21/9",
            radius: "rounded-2xl",
        },
        gallery: {
            aspect: "16/9",
            radius: "rounded-xl",
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