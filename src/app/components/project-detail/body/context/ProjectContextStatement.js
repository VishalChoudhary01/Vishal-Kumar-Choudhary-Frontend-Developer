"use client";

import { motion } from "motion/react";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

export default function ProjectContextStatement({ statement, visible, reduced }) {
    return (
        <motion.p initial={reduced ? false : { opacity: 0, y: 28 }} animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }} transition={reduced ? { duration: 0 } : { duration: 0.85, ease: EASE_EDITORIAL }} className="max-w-4xl font-display text-[clamp(2rem,4.2vw,4.25rem)] font-normal leading-[0.98] tracking-[-0.025em] text-text-primary">
            {statement}
        </motion.p>
    );
}