"use client";

import { createContext, useSyncExternalStore } from "react";
import { motion } from "motion/react";

export const MotionContext = createContext({
    prefersReducedMotion: false,
});

const subscribeReducedMotion = (onStoreChange) => {
    const mediaQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );
    mediaQuery.addEventListener("change", onStoreChange);
    return () => {
        mediaQuery.removeEventListener("change", onStoreChange);
    };
};

export default function MotionProvider({ children }) {
    /* Hydration-safe: the server snapshot is false, matching the first
       client render, so the browser's actual preference is applied only
       after hydration (an update, not a mismatch). This used to be a
       useState + effect that flipped during hydration and caused React
       hydration-mismatch warnings on every masked-motion child. */
    const prefersReducedMotion = useSyncExternalStore(
        subscribeReducedMotion,
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        () => false
    );

    return (
        <MotionContext.Provider value={{ prefersReducedMotion }}>
            <motion.div style={{ display: "contents" }}>
                {children}
            </motion.div>
        </MotionContext.Provider>
    );
}