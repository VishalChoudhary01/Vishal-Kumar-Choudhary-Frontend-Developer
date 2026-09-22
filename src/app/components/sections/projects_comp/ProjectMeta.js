"use client";

import { motion } from "motion/react";
import { toTransition } from "@/app/lib/motion/projectPresets";

export default function ProjectMeta({
    technologies,
    entrance,
    isInView = true,
    className = "",
}) {
    if (
        !technologies ||
        technologies.length === 0
    ) {
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
            <ul className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.68rem] leading-relaxed text-text-muted">
                {technologies.map(
                    (technology, index) => (
                        <li
                            key={technology}
                            className="inline-flex items-center gap-x-2"
                        >
                            {index > 0 && (
                                <span
                                    aria-hidden="true"
                                    className="text-text-muted"
                                >
                                    ·
                                </span>
                            )}

                            <span>
                                {technology}
                            </span>
                        </li>
                    )
                )}
            </ul>
        </motion.div>
    );
}