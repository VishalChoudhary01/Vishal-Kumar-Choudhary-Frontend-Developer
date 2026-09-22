"use client";

import { createContext, useEffect, useState } from "react";
import { motion } from "motion/react";

export const MotionContext = createContext({
    prefersReducedMotion: false,
});

export default function MotionProvider({ children }) {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (event) => {
            setPrefersReducedMotion(event.matches);
        };

        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    return (
        <MotionContext.Provider value={{ prefersReducedMotion }}>
            <motion.div style={{ display: "contents" }}>
                {children}
            </motion.div>
        </MotionContext.Provider>
    );
}