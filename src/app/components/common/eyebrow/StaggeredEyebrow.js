"use client";

import { motion, useInView, useReducedMotion, } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { usePageLoader } from "@/app/providers/PageLoaderProvider";
import { cn } from "@/app/lib/utils";

const EASE = [0.16, 1, 0.3, 1];

const VIEW_DURATION = 0.9;
const HOVER_DURATION = 0.45;

export default function StaggeredEyebrow({
    label = "INTRODUCTION",

    // Viewport
    delay = 0.15,
    stagger = 0.034,

    // Hover
    hoverStagger = 0.034,

    amount = 0.4,
    once = true,
    show,

    className = "",
}) {
    const { heroReady } = usePageLoader();
    const shouldReduceMotion = useReducedMotion();

    const containerRef = useRef(null);

    const isInView = useInView(containerRef, {
        amount,
        once,
    });

    const [isHovered, setIsHovered] = useState(false);
    const [revealStarted, setRevealStarted] = useState(false);
    const [revealCompleted, setRevealCompleted] = useState(false);

    /*
     * Start the viewport animation only when:
     *
     * 1. Page loader has completed
     * 2. Eyebrow is inside viewport
     * 3. Motion is allowed
     */
    useEffect(() => {
        if (
            heroReady &&
            isInView &&
            !shouldReduceMotion &&
            !revealStarted
        ) {
            setRevealStarted(true);
        }
    }, [
        heroReady,
        isInView,
        shouldReduceMotion,
        revealStarted,
    ]);

    const getPhase = () => {
        if (shouldReduceMotion) {
            return "reduced";
        }

        if (isHovered) {
            return "hover";
        }

        if (revealStarted && !revealCompleted) {
            return "reveal";
        }

        return "rest";
    };

    const phase = getPhase();

    return (
        <span
            ref={containerRef}
            aria-label={label}
            className={`inline-flex items-center cursor-pointer text-brand text-xl ${className}`}
            onMouseEnter={() => {
                if (!shouldReduceMotion) {
                    setIsHovered(true);
                }
            }}
            onMouseLeave={() => {
                if (!shouldReduceMotion) {
                    setIsHovered(false);
                }
            }}
        >
            <span
                aria-hidden="true"
                className="inline-flex items-center"
            >
                {label.split("").map((letter, index) => {
                    const isSpace = letter === " ";

                    const viewDelay =
                        delay + index * stagger;

                    const hoverDelay =
                        index * hoverStagger;

                    const isLastLetter =
                        index === label.length - 1;

                    /*
                     * ==========================================================
                     * ORIGINAL LETTER
                     * ==========================================================
                     *
                     * REST
                     * y = 0
                     *
                     * VIEW
                     * 0 → -125% → 0
                     *
                     * HOVER
                     * 0 → -125%
                     *
                     * LEAVE
                     * -125% → 0
                     */
                    const originalAnimation =
                        phase === "reveal"
                            ? {
                                y: [
                                    "0%",
                                    "-125%",
                                    "0%",
                                ],
                            }
                            : phase === "hover"
                                ? {
                                    y: "-125%",
                                }
                                : {
                                    y: "0%",
                                };

                    /*
                     * ==========================================================
                     * INCOMING LETTER
                     * ==========================================================
                     *
                     * REST
                     * y = 125%
                     *
                     * VIEW
                     * 125% → 0 → 125%
                     *
                     * HOVER
                     * 125% → 0
                     *
                     * LEAVE
                     * 0 → 125%
                     */
                    const incomingAnimation =
                        phase === "reveal"
                            ? {
                                y: [
                                    "125%",
                                    "0%",
                                    "125%",
                                ],
                            }
                            : phase === "hover"
                                ? {
                                    y: "0%",
                                }
                                : {
                                    y: "125%",
                                };

                    const transition =
                        phase === "reveal"
                            ? {
                                duration: VIEW_DURATION,
                                delay: viewDelay,
                                ease: EASE,
                                times: [0, 0.5, 1],
                            }
                            : {
                                duration: HOVER_DURATION,
                                delay: hoverDelay,
                                ease: EASE,
                            };

                    return (
                        <span key={`${letter}-${index}`} className={cn("relative inline-grid h-[18px] place-items-center overflow-hidden tracking-widest font-bold leading-[18px]", isSpace ? "w-[0.28em]" : "min-w-[0.15em]")}>
                            {/* =================================================
                                ORIGINAL
                            ================================================== */}
                            <motion.span
                                className=" col-start-1 row-start-1 whitespace-pre "
                                initial={{
                                    y: "0%",
                                }}
                                animate={originalAnimation}
                                transition={transition}
                                onAnimationComplete={() => {
                                    /*
                                     * Only mark the entire viewport
                                     * animation complete after the
                                     * last letter finishes.
                                     */
                                    if (
                                        phase === "reveal" &&
                                        isLastLetter
                                    ) {
                                        setRevealCompleted(true);
                                    }
                                }}
                            >
                                {letter}
                            </motion.span>

                            {/* =================================================
                                INCOMING
                            ================================================== */}
                            <motion.span className=" col-start-1 row-start-1 whitespace-pre " initial={{ y: "125%", }} animate={incomingAnimation} transition={transition} >
                                {letter}
                            </motion.span>
                        </span>
                    );
                })}
            </span>
        </span>
    );
}