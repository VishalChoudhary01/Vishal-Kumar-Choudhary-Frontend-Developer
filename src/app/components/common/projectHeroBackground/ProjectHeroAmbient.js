"use client";

import { motion, useReducedMotion } from "motion/react";
import "./ProjectHeroAmbient.css";

export default function ProjectHeroAmbient() {
    const reducedMotion = useReducedMotion();

    return (
        <div
            aria-hidden="true"
            className="
        pointer-events-none
        absolute
        inset-0
        z-0
        overflow-hidden
        bg-[#f7f5ef]
        dark:bg-[#080b09]
      "
        >
            {/* Soft teal atmospheric field */}
            <motion.div
                className="
          absolute
          left-[-18%]
          top-[42%]
          h-[70%]
          w-[85%]
          rounded-full
          project-hero-ambient-teal
        "
                animate={
                    reducedMotion
                        ? undefined
                        : {
                            x: [0, 45, -25, 0],
                            y: [0, -18, 12, 0],
                            scale: [1, 1.035, 0.985, 1],
                        }
                }
                transition={{
                    duration: 34,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Pale lower-left atmosphere */}
            <motion.div
                className="
          absolute
          bottom-[-32%]
          left-[-22%]
          h-[65%]
          w-[65%]
          rounded-full
          project-hero-ambient-light
        "
                animate={
                    reducedMotion
                        ? undefined
                        : {
                            x: [0, 28, -18, 0],
                            y: [0, -10, 8, 0],
                            scale: [1, 1.04, 0.98, 1],
                        }
                }
                transition={{
                    duration: 42,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Very subtle warm field */}
            <motion.div
                className="
          absolute
          bottom-[-30%]
          right-[-20%]
          h-[65%]
          w-[62%]
          rounded-full
          project-hero-ambient-warm
        "
                animate={
                    reducedMotion
                        ? undefined
                        : {
                            x: [0, -30, 18, 0],
                            y: [0, 12, -8, 0],
                            scale: [1, 1.035, 0.985, 1],
                        }
                }
                transition={{
                    duration: 46,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Very faint overall atmosphere */}
            <div className="absolute inset-0 project-hero-ambient-wash" />

            {/* Edge depth */}
            <div className="absolute inset-0 project-hero-ambient-vignette" />

            {/* Optional grain */}
            <div className="absolute inset-0 project-hero-ambient-grain" />
        </div>
    );
}