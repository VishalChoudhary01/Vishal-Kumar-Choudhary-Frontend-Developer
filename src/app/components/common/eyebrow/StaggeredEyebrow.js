"use client";

import {
    motion,
    useInView,
    useReducedMotion,
} from "motion/react";

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
     * ---------------------------------------------------------------
     * START VIEW ANIMATION
     * ---------------------------------------------------------------
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

    /*
     * ---------------------------------------------------------------
     * ANIMATION PHASE
     * ---------------------------------------------------------------
     */

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
            className={cn(
                `
                    inline-flex
                    items-center
                    cursor-pointer

                    /*
                     * ---------------------------------------------------
                     * EYEBROW TYPE SCALE
                     * ---------------------------------------------------
                     *
                     * Mobile:
                     * ~13px
                     *
                     * Tablet:
                     * ~13.75px
                     *
                     * Desktop:
                     * ~15px
                     *
                     * This sits between the original text-xl size
                     * and the overly reduced 0.72rem version.
                     */
                    text-[0.82rem]
                    leading-[1]

                    sm:text-[0.86rem]

                    lg:text-[0.95rem]

                    font-medium
                    uppercase
                    tracking-[0.16em]

                    text-brand
                `,
                className
            )}
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
                     * =====================================================
                     * ORIGINAL LETTER
                     * =====================================================
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
                     * =====================================================
                     * INCOMING LETTER
                     * =====================================================
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

                    /*
                     * =====================================================
                     * TRANSITION
                     * =====================================================
                     */

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
                        <span
                            key={`${letter}-${index}`}
                            className={cn(
                                `
                                    relative
                                    inline-grid

                                    /*
                                     * Slightly taller than the previous
                                     * 12px so the larger eyebrow doesn't
                                     * clip during the letter animation.
                                     */
                                    h-[14px]

                                    place-items-center
                                    overflow-hidden

                                    leading-[14px]
                                    font-medium
                                `,
                                isSpace
                                    ? "w-[0.28em]"
                                    : "min-w-[0.12em]"
                            )}
                        >
                            {/* =================================================
                                ORIGINAL
                            ================================================== */}

                            <motion.span
                                className="
                                    col-start-1
                                    row-start-1
                                    whitespace-pre
                                "
                                initial={{
                                    y: "0%",
                                }}
                                animate={originalAnimation}
                                transition={transition}
                                onAnimationComplete={() => {
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

                            <motion.span
                                className="
                                    col-start-1
                                    row-start-1
                                    whitespace-pre
                                "
                                initial={{
                                    y: "125%",
                                }}
                                animate={incomingAnimation}
                                transition={transition}
                            >
                                {letter}
                            </motion.span>
                        </span>
                    );
                })}
            </span>
        </span>
    );
}