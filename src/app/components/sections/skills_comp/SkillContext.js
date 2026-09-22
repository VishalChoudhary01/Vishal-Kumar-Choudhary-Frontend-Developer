"use client";

import { motion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1];

export default function SkillContext({
    text,
    hoverNote,
    animate,
    interactive,
    motionProps,
}) {
    const emphasisClass = hoverNote
        ? "text-text-secondary"
        : "text-text-tertiary";

    if (!animate) {
        return (
            <p className="mt-3 flex items-baseline gap-2 font-mono text-[0.68rem] text-text-tertiary">
                <span
                    aria-hidden="true"
                    className="shrink-0 text-brand opacity-70"
                >
                    —
                </span>

                <span>{text}</span>
            </p>
        );
    }

    return (
        <motion.p
            className={`mt-3 flex items-baseline gap-2 font-mono text-[0.68rem] transition-[transform,color] duration-300 ${emphasisClass} ${interactive ? "md:group-hover:translate-x-1" : ""}`}
            {...motionProps}
        >
            <span
                aria-hidden="true"
                className={`shrink-0 text-brand transition-opacity duration-300 ${hoverNote ? "opacity-100" : "opacity-70"}`}
            >
                —
            </span>

            <motion.span
                key={text}
                initial={{
                    opacity: 0,
                    y: 3,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.18,
                    ease: EASE,
                }}
            >
                {text}
            </motion.span>
        </motion.p>
    );
}