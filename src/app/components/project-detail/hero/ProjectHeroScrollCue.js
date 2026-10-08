"use client";

import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";

import { EASE, DELAY } from "./projectHeroMotion";
import { usePageLoader } from "@/app/providers/PageLoaderProvider";

export default function ProjectHeroScrollCue({ reduced = false }) {
    const { heroReady } = usePageLoader();

    return (
        <div
            className="
                relative
                z-20
                flex
                w-full
                justify-center

                px-5
                pb-6

                sm:pb-8

                lg:pb-10
            "
        >
            <motion.div
                initial={
                    reduced
                        ? false
                        : {
                            opacity: 0,
                        }
                }
                animate={
                    heroReady
                        ? {
                            opacity: 1,
                        }
                        : {
                            opacity: 0,
                        }
                }
                transition={{
                    duration: reduced ? 0 : 0.7,
                    delay: reduced ? 0 : DELAY.cue,
                    ease: EASE,
                }}
                className="
                    flex
                    items-center
                    justify-center
                    gap-3

                    /*
                     * MOBILE
                     *
                     * Slightly quieter because the transition itself
                     * is now doing more visual work.
                     */
                    max-md:opacity-80
                "
            >
                <span
                    className="
                        font-mono
                        text-[0.62rem]
                        uppercase
                        tracking-[0.2em]
                        text-text-secondary
                        dark:text-text-tertiary
                    "
                >
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
        </div>
    );
}