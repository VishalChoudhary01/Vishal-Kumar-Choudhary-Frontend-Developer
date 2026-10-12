"use client";

import { motion } from "motion/react";

const TRANSITION = {
    duration: 20,
    ease: "easeInOut",
    repeat: Infinity,
};

const LIGHT = [
    "var(--atmosphere-light-a)",
    "var(--atmosphere-light-b)",
    "var(--atmosphere-light-c)",
    "var(--atmosphere-light-d)",
    "var(--atmosphere-light-a)",
];

const DARK = [
    "var(--atmosphere-dark-a)",
    "var(--atmosphere-dark-b)",
    "var(--atmosphere-dark-c)",
    "var(--atmosphere-dark-d)",
    "var(--atmosphere-dark-a)",
];

export default function FooterAtmosphere({
    reduced = false,

    /*
     * Passed by Footer as heroReady && isInView. Before it flips, the
     * footer is either behind the loader or below the fold, so the
     * infinite color cycle is invisible anyway — render the static
     * equivalent instead and start the loop only when it can be seen.
     */
    active = true,
}) {
    if (reduced || !active) {
        return (
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-atmosphere-light-a dark:bg-atmosphere-dark-a"
            />
        );
    }

    return (
        <>
            <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 dark:hidden"
                animate={{
                    backgroundColor: LIGHT,
                }}
                transition={TRANSITION}
            />

            <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 hidden dark:block"
                animate={{
                    backgroundColor: DARK,
                }}
                transition={TRANSITION}
            />
        </>
    );
}