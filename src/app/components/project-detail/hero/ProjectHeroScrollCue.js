"use client";

import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

export default function ProjectHeroScrollCue({
    reduced = false,
}) {
    return (
        <motion.div
            initial={
                reduced
                    ? false
                    : {
                        opacity: 0,
                    }
            }
            animate={{
                opacity: 1,
            }}
            transition={{
                duration: reduced ? 0 : 0.7,
                delay: reduced ? 0 : 1,
                ease: EASE_EDITORIAL,
            }}
            className="mt-12 flex items-center justify-center gap-3 sm:mt-14 lg:mt-16"
        >
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-text-muted">
                Scroll to explore
            </span>

            <motion.span
                animate={
                    reduced
                        ? undefined
                        : {
                            y: [0, 4, 0],
                        }
                }
                transition={
                    reduced
                        ? undefined
                        : {
                            duration: 1.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }
                }
                className="text-text-secondary"
            >
                <ArrowDown
                    size={13}
                    strokeWidth={1.5}
                />
            </motion.span>
        </motion.div>
    );
}