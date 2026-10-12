"use client";

import { AnimatePresence, motion } from "motion/react";
import { educationData } from "./education.data";

const EASE = [0.22, 1, 0.36, 1];

export default function EducationIntro({
    activeIndex = 0,
}) {
    const { records, totalLabel } = educationData;

    const safeIndex = Math.min(
        activeIndex,
        records.length - 1
    );

    const active = records[safeIndex];

    const number = String(safeIndex + 1).padStart(2, "0");

    return (
        <div className="max-w-none">
            <div
                className="flex items-baseline gap-2"
                aria-live="polite"
            >
                <span className="relative inline-block h-[clamp(1.75rem,4vw,2.5rem)] overflow-hidden align-baseline">
                    <AnimatePresence
                        mode="popLayout"
                        initial={false}
                    >
                        <motion.span
                            key={number}
                            initial={{
                                y: "100%",
                                opacity: 0,
                            }}
                            animate={{
                                y: 0,
                                opacity: 1,
                            }}
                            exit={{
                                y: "-100%",
                                opacity: 0,
                            }}
                            transition={{
                                duration: 0.45,
                                ease: EASE,
                            }}
                            className="block whitespace-nowrap font-display text-[clamp(1.75rem,4vw,2.5rem)] font-normal tabular-nums leading-none tracking-[-0.01em] text-text-primary"
                        >
                            {number}
                        </motion.span>
                    </AnimatePresence>
                </span>

                <span className="font-mono text-[0.68rem] tabular-nums tracking-[0.14em] text-text-muted">
                    / {totalLabel}
                </span>
            </div>

            <div className="mt-2.5 overflow-hidden">
                <AnimatePresence
                    mode="popLayout"
                    initial={false}
                >
                    <motion.p
                        key={`${active.degree}-${active.institution}`}
                        initial={{
                            y: "100%",
                            opacity: 0,
                        }}
                        animate={{
                            y: 0,
                            opacity: 1,
                        }}
                        exit={{
                            y: "-60%",
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.4,
                            ease: EASE,
                        }}
                        className="flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-secondary"
                    >
                        <span
                            aria-hidden="true"
                            className="h-[5px] w-[5px] rounded-[1px] bg-brand"
                        />

                        <span>
                            {active.degree} ·{" "}
                            {active.institution}
                        </span>
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    );
}