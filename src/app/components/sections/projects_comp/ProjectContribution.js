"use client";

import { motion } from "motion/react";
import { toTransition } from "@/app/lib/motion/projectPresets";

export default function ProjectContribution({
    text,
    entrance,
    isInView = true,
    className = "",
}) {
    if (!text) {
        return null;
    }

    const config =
        entrance || {
            initial: {
                opacity: 0,
                y: 12,
            },
            animate: {
                opacity: 1,
                y: 0,
            },
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
        };

    return (
        <motion.div
            className={className}
            initial={
                isInView
                    ? config.initial
                    : false
            }
            animate={
                isInView
                    ? config.animate
                    : config.initial
            }
            transition={toTransition(config)}
        >
            <p className="mb-1.5 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-muted">
                My contribution
            </p>

            <p className="max-w-xl font-body text-sm leading-relaxed text-text-secondary">
                {text}
            </p>
        </motion.div>
    );
}