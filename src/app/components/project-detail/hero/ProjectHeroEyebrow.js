"use client";

import { motion } from "motion/react";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

export default function ProjectHeroEyebrow({ text, reduced = false }) {
    const letters = String(text).split("");

    return (
        <div
            aria-label={text}
            className="overflow-hidden font-mono text-[0.68rem] font-medium uppercase tracking-[0.22em] text-text-muted sm:text-[0.7rem]"
        >
            <span
                aria-hidden="true"
                className="flex flex-wrap"
            >
                {letters.map((letter, index) => (
                    <motion.span
                        key={`${letter}-${index}`}
                        className="inline-block whitespace-pre"
                        initial={
                            reduced
                                ? false
                                : {
                                    opacity: 0,
                                    y: "100%",
                                }
                        }
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: reduced ? 0 : 0.55,
                            delay: reduced ? 0 : index * 0.035,
                            ease: EASE_EDITORIAL,
                        }}
                    >
                        {letter}
                    </motion.span>
                ))}
            </span>
        </div>
    );
}