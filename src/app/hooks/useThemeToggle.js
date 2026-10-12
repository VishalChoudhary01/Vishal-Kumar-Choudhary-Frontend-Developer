"use client";

import { useTheme } from "next-themes";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { EASE_OUT_CSS } from "@/app/lib/motion/ease";

const VT_STYLE_ID = "theme-toggle-view-transition";

const VT_CSS = `
/* =========================================================
   VIEW TRANSITION FOUNDATION
   ========================================================= */

/*
 * Use the browser's normal image-pair stacking context.
 */
html[data-theme-transition]::view-transition-image-pair(root) {
    isolation: auto;
}

/*
 * Remove the browser's default cross-fade.
 */
html[data-theme-transition]::view-transition-old(root),
html[data-theme-transition]::view-transition-new(root) {
    mix-blend-mode: normal;
}

/* =========================================================
   RECTANGLE
   ========================================================= */

/*
 * LIGHT -> DARK
 *
 * OLD = LIGHT
 * NEW = DARK
 *
 * The incoming dark snapshot expands from the configured
 * starting position until it covers the viewport.
 */

html[data-theme-transition="rect"][data-theme-transition-direction="to-dark"]::view-transition-old(root) {
    z-index: 0;
    animation: none;
}

html[data-theme-transition="rect"][data-theme-transition-direction="to-dark"]::view-transition-new(root) {
    z-index: 1;

    animation:
        theme-rect-reveal
        400ms
        ease-out
        both;
}

/*
 * DARK -> LIGHT
 *
 * OLD = DARK
 * NEW = LIGHT
 *
 * The outgoing dark snapshot contracts back toward the
 * configured origin and exposes the light snapshot.
 */

html[data-theme-transition="rect"][data-theme-transition-direction="to-light"]::view-transition-new(root) {
    z-index: 0;
    animation: none;
}

html[data-theme-transition="rect"][data-theme-transition-direction="to-light"]::view-transition-old(root) {
    z-index: 1;

    animation:
        theme-rect-reverse
        400ms
        ease-out
        both;
}

@keyframes theme-rect-reveal {
    from {
        clip-path:
            var(
                --theme-transition-from,
                inset(100% 0 0 0)
            );
    }

    to {
        clip-path:
            inset(0 0 0 0);
    }
}

@keyframes theme-rect-reverse {
    from {
        clip-path:
            inset(0 0 0 0);
    }

    to {
        clip-path:
            var(
                --theme-transition-from,
                inset(100% 0 0 0)
            );
    }
}

/* =========================================================
   CIRCLE
   ========================================================= */

html[data-theme-transition="circle"][data-theme-transition-direction="to-dark"]::view-transition-old(root) {
    z-index: 0;
    animation: none;
}

html[data-theme-transition="circle"][data-theme-transition-direction="to-dark"]::view-transition-new(root) {
    z-index: 1;

    animation:
        theme-circle-reveal
        700ms
        cubic-bezier(0.4, 0, 0.2, 1)
        both;
}

html[data-theme-transition="circle"][data-theme-transition-direction="to-light"]::view-transition-new(root) {
    z-index: 0;
    animation: none;
}

html[data-theme-transition="circle"][data-theme-transition-direction="to-light"]::view-transition-old(root) {
    z-index: 1;

    animation:
        theme-circle-reverse
        700ms
        cubic-bezier(0.4, 0, 0.2, 1)
        both;
}

@keyframes theme-circle-reveal {
    from {
        clip-path:
            circle(
                0%
                at
                var(
                    --theme-transition-origin,
                    50% 100%
                )
            );
    }

    to {
        clip-path:
            circle(
                150%
                at
                var(
                    --theme-transition-origin,
                    50% 100%
                )
            );
    }
}

@keyframes theme-circle-reverse {
    from {
        clip-path:
            circle(
                150%
                at
                var(
                    --theme-transition-origin,
                    50% 100%
                )
            );
    }

    to {
        clip-path:
            circle(
                0%
                at
                var(
                    --theme-transition-origin,
                    50% 100%
                )
            );
    }
}

/* =========================================================
   CIRCLE BLUR
   ========================================================= */

html[data-theme-transition="circle-blur"][data-theme-transition-direction="to-dark"]::view-transition-old(root) {
    z-index: 0;
    animation: none;
}

html[data-theme-transition="circle-blur"][data-theme-transition-direction="to-dark"]::view-transition-new(root) {
    z-index: 1;

    animation:
        theme-circle-blur-reveal
        700ms
        cubic-bezier(0.4, 0, 0.2, 1)
        both;
}

html[data-theme-transition="circle-blur"][data-theme-transition-direction="to-light"]::view-transition-new(root) {
    z-index: 0;
    animation: none;
}

html[data-theme-transition="circle-blur"][data-theme-transition-direction="to-light"]::view-transition-old(root) {
    z-index: 1;

    animation:
        theme-circle-blur-reverse
        700ms
        cubic-bezier(0.4, 0, 0.2, 1)
        both;
}

@keyframes theme-circle-blur-reveal {
    from {
        clip-path:
            circle(
                0%
                at
                var(
                    --theme-transition-origin,
                    50% 100%
                )
            );

        filter: blur(8px);
    }

    to {
        clip-path:
            circle(
                150%
                at
                var(
                    --theme-transition-origin,
                    50% 100%
                )
            );

        filter: blur(0);
    }
}

@keyframes theme-circle-blur-reverse {
    from {
        clip-path:
            circle(
                150%
                at
                var(
                    --theme-transition-origin,
                    50% 100%
                )
            );

        filter: blur(0);
    }

    to {
        clip-path:
            circle(
                0%
                at
                var(
                    --theme-transition-origin,
                    50% 100%
                )
            );

        filter: blur(8px);
    }
}

/* =========================================================
   BLINDS
   ========================================================= */

@property --theme-transition-slat {
    syntax: "<length>";
    inherits: false;
    initial-value: 72px;
}

/*
 * LIGHT -> DARK
 */
html[data-theme-transition="blinds"][data-theme-transition-direction="to-dark"]::view-transition-old(root) {
    z-index: 0;
    animation: none;
}

html[data-theme-transition="blinds"][data-theme-transition-direction="to-dark"]::view-transition-new(root) {
    z-index: 1;

    mask-image:
        linear-gradient(
            90deg,
            #000 0
                var(--theme-transition-slat),
            transparent
                calc(
                    var(--theme-transition-slat)
                    + 20px
                )
        );

    mask-size: 72px 100%;
    mask-repeat: repeat;

    animation:
        theme-blinds-reveal
        700ms
        ${EASE_OUT_CSS}
        both;
}

/*
 * DARK -> LIGHT
 */
html[data-theme-transition="blinds"][data-theme-transition-direction="to-light"]::view-transition-new(root) {
    z-index: 0;
    animation: none;
}

html[data-theme-transition="blinds"][data-theme-transition-direction="to-light"]::view-transition-old(root) {
    z-index: 1;

    mask-image:
        linear-gradient(
            90deg,
            #000 0
                var(--theme-transition-slat),
            transparent
                calc(
                    var(--theme-transition-slat)
                    + 20px
                )
        );

    mask-size: 72px 100%;
    mask-repeat: repeat;

    animation:
        theme-blinds-reverse
        700ms
        ${EASE_OUT_CSS}
        both;
}

@keyframes theme-blinds-reveal {
    from {
        --theme-transition-slat: -20px;
    }

    to {
        --theme-transition-slat: 72px;
    }
}

@keyframes theme-blinds-reverse {
    from {
        --theme-transition-slat: 72px;
    }

    to {
        --theme-transition-slat: -20px;
    }
}

/* =========================================================
   REDUCED MOTION
   ========================================================= */

@media (prefers-reduced-motion: reduce) {
    html[data-theme-transition]::view-transition-group(root),
    html[data-theme-transition]::view-transition-old(root),
    html[data-theme-transition]::view-transition-new(root) {
        animation: none !important;
    }
}
`;

const RECT_FROM = {
    "top-left":
        "inset(0 100% 100% 0)",

    "top-right":
        "inset(0 0 100% 100%)",

    "bottom-left":
        "inset(100% 100% 0 0)",

    "bottom-right":
        "inset(100% 0 0 100%)",

    center:
        "inset(50% 50% 50% 50%)",

    "bottom-up":
        "inset(100% 0 0 0)",
};

const CIRCLE_ORIGIN = {
    "top-left":
        "0% 0%",

    "top-right":
        "100% 0%",

    "bottom-left":
        "0% 100%",

    "bottom-right":
        "100% 100%",

    center:
        "50% 50%",

    "bottom-up":
        "50% 100%",
};

function cleanupTransitionState(root) {
    delete root.dataset.themeTransition;
    delete root.dataset.themeTransitionDirection;

    root.style.removeProperty(
        "--theme-transition-from",
    );

    root.style.removeProperty(
        "--theme-transition-origin",
    );

    root.style.removeProperty(
        "--theme-transition-slat",
    );
}

export function useThemeToggle({
    variant = "rectangle",
    start = "bottom-up",
} = {}) {
    const {
        setTheme,
        resolvedTheme,
    } = useTheme();

    const reduce =
        useReducedMotion() ?? false;

    const [
        mounted,
        setMounted,
    ] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (
            document.getElementById(
                VT_STYLE_ID,
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            VT_STYLE_ID;

        style.textContent =
            VT_CSS;

        document.head.appendChild(
            style,
        );
    }, []);

    const isDark =
        mounted &&
        resolvedTheme === "dark";

    const toggle = () => {
        const next =
            isDark
                ? "light"
                : "dark";

        const goingToDark =
            next === "dark";

        /*
         * Reduced-motion and unsupported
         * browser fallback.
         */
        if (
            reduce ||
            !(
                "startViewTransition"
                in document
            )
        ) {
            setTheme(next);
            return;
        }

        const root =
            document.documentElement;

        /*
         * Direction for CSS.
         */
        root.dataset.themeTransitionDirection =
            goingToDark
                ? "to-dark"
                : "to-light";

        /*
         * Configure transition variant.
         */
        if (
            variant ===
            "rectangle"
        ) {
            root.style.setProperty(
                "--theme-transition-from",
                RECT_FROM[start],
            );

            root.dataset.themeTransition =
                "rect";
        }

        else if (
            variant ===
            "blinds"
        ) {
            root.dataset.themeTransition =
                "blinds";
        }

        else {
            root.style.setProperty(
                "--theme-transition-origin",
                CIRCLE_ORIGIN[start],
            );

            root.dataset.themeTransition =
                variant;
        }

        let transition;

        try {
            transition =
                document.startViewTransition(
                    () => {
                        /*
                         * The theme itself is changed
                         * only through next-themes.
                         */
                        setTheme(next);
                    },
                );
        } catch {
            setTheme(next);

            cleanupTransitionState(
                root,
            );

            return;
        }

        transition.finished
            .catch(() => { })
            .finally(() => {
                cleanupTransitionState(
                    root,
                );
            });
    };

    return {
        isDark,
        mounted,
        toggle,
    };
}