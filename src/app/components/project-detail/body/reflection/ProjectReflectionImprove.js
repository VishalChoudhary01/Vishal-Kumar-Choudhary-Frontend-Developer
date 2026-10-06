"use client";

import { motion } from "motion/react";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

export default function ProjectReflectionImprove({ improve, visible, reduced }) {
    return (
        <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={reduced ? { duration: 0 } : { duration: 0.7, delay: 0.16, ease: EASE_EDITORIAL }}
            className="border-b border-border pt-7 sm:pt-8"
        >
            <div className="max-w-2xl">
                <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">
                    What I would improve
                </h3>

                <p className="mt-3 font-body text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
                    {improve}
                </p>
            </div>
        </motion.div>
    );
}