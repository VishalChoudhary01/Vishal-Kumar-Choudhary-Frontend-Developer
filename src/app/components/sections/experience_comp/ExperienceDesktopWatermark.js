"use client";

import { AnimatePresence, motion } from "motion/react";

import ExperienceWatermark from "./ExperienceWatermark";
import { EASE_EDITORIAL } from "./experience.constants";

export default function ExperienceDesktopWatermark({
    experience,
    breakpoint,
    reducedMotion,
}) {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[calc(100%+0.75rem)] z-[-1]"
        >
            {reducedMotion ? (
                <div
                    key={experience.id}
                    className="absolute right-0 top-0"
                >
                    <ExperienceWatermark
                        experience={experience}
                        breakpoint={breakpoint}
                    />
                </div>
            ) : (
                <AnimatePresence
                    initial={false}
                >
                    <motion.div
                        key={experience.id}
                        className="absolute right-0 top-0"
                        initial={{
                            opacity: 0,
                            y: 10,
                            scale: 1.04,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: -6,
                            scale: 0.98,
                        }}
                        transition={{
                            duration: 0.65,
                            ease: EASE_EDITORIAL,
                        }}
                    >
                        <ExperienceWatermark
                            experience={experience}
                            breakpoint={breakpoint}
                        />
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}