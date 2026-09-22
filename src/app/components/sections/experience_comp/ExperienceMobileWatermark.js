"use client";

import { AnimatePresence, motion } from "motion/react";

import ExperienceWatermark from "./ExperienceWatermark";
import { EASE_EDITORIAL } from "./experience.constants";

export default function ExperienceMobileWatermark({
    experience,
    breakpoint,
    reducedMotion,
}) {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
            {reducedMotion ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <ExperienceWatermark
                        experience={experience}
                        breakpoint={breakpoint}
                        backdrop
                    />
                </div>
            ) : (
                <AnimatePresence
                    initial={false}
                    mode="sync"
                >
                    <motion.div
                        key={experience.id}
                        className="absolute top-[65%] left-[20%]    flex items-center justify-center"
                        initial={{
                            opacity: 0,
                            scale: 1.05,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.98,
                        }}
                        transition={{
                            duration: 0.45,
                            ease: EASE_EDITORIAL,
                        }}
                    >
                        <ExperienceWatermark
                            experience={experience}
                            breakpoint={breakpoint}
                            backdrop
                        />
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}