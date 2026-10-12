"use client";

import { motion } from "motion/react";
import { useState } from "react";

/**
 * AnimatedOutlineText
 *
 * Reusable editorial typography animation:
 *
 *   outline draws → outline settles → solid fill appears
 *
 * The component intentionally does NOT own scroll transforms.
 * A parent component can control scale / y / opacity through Motion.
 */
export default function AnimatedOutlineText({
    children,
    className = "",

    // Animation
    delay = 0,
    characterDuration = 0.16,
    characterStagger = 0.055,
    fillDelay = 0.55,

    // Visual
    strokeWidth = "1px",

    // Behavior
    reducedMotion = false,
    onComplete,
}) {
    const [completedContent, setCompletedContent] =
        useState(null);

    /**
     * Derive completion during render instead of resetting it in an
     * effect.
     *
     * The draw animation must restart from scratch whenever the content
     * (e.g. a project title) changes. Storing the content that produced
     * the completion — rather than a bare boolean reset by an effect —
     * makes `drawComplete` a pure function of the current children: the
     * moment `children` changes, it reads as false again with no
     * cascading re-render (react-hooks/set-state-in-effect).
     */
    const drawComplete = completedContent === children;

    /**
     * Convert children into lines.
     *
     * Supported:
     *
     * "Portfolio"
     *
     * ["Portfolio", "Redesign"]
     *
     * <>Portfolio<br />Redesign</>
     *
     * For the portfolio Hero, arrays are the cleanest option.
     */
    const lines = normalizeLines(children);

    /**
     * Reduced-motion mode.
     *
     * No drawing animation.
     * Immediately show the final readable title.
     */
    if (reducedMotion) {
        return (
            <span
                className={`block ${className}`}
            >
                {lines.map((line, index) => (
                    <span
                        key={`reduced-${index}`}
                        className="block"
                    >
                        {line}
                    </span>
                ))}
            </span>
        );
    }

    const handleComplete = () => {
        setCompletedContent(children);
        onComplete?.();
    };

    return (
        <span
            className={`relative block ${className}`}
        >
            {/* =========================================================
                FINAL SOLID TEXT
                ========================================================= */}

            <span
                aria-hidden="true"
                className="relative z-[1] block"
            >
                {lines.map((line, index) => (
                    <motion.span
                        key={`fill-${index}`}
                        className="block"
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: drawComplete
                                ? 1
                                : 0,
                        }}
                        transition={{
                            duration: 0.45,
                            delay: index * 0.03,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                    >
                        {line}
                    </motion.span>
                ))}
            </span>

            {/* =========================================================
                OUTLINE DRAWING
                ========================================================= */}

            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[2] block select-none"
            >
                {lines.map((line, lineIndex) => (
                    <OutlineLine
                        key={`outline-${lineIndex}`}
                        text={line}
                        startDelay={
                            delay +
                            lineIndex * fillDelay
                        }
                        characterDuration={
                            characterDuration
                        }
                        characterStagger={
                            characterStagger
                        }
                        strokeWidth={strokeWidth}
                        onComplete={
                            lineIndex ===
                                lines.length - 1
                                ? handleComplete
                                : undefined
                        }
                    />
                ))}
            </span>
        </span>
    );
}

/* ==========================================================================
   OUTLINE LINE
   ========================================================================== */

function OutlineLine({
    text,
    startDelay,
    characterDuration,
    characterStagger,
    strokeWidth,
    onComplete,
}) {
    const characters = [...String(text)];

    return (
        <span
            className="block whitespace-nowrap"
            style={{
                color: "transparent",
                WebkitTextFillColor: "transparent",
                WebkitTextStroke:
                    `${strokeWidth} var(--text-primary)`,
                textStroke:
                    `${strokeWidth} var(--text-primary)`,
            }}
        >
            {characters.map((character, index) => {
                const isLast =
                    index === characters.length - 1;

                /**
                 * Spaces should not receive an animation.
                 * They still need to occupy their natural width.
                 */
                if (character === " ") {
                    return (
                        <span
                            key={`space-${index}`}
                            className="inline-block"
                        >
                            {" "}
                        </span>
                    );
                }

                const characterDelay =
                    startDelay +
                    index * characterStagger;

                return (
                    <motion.span
                        key={`${character}-${index}`}
                        className="inline-block"
                        initial={{
                            opacity: 0,
                            clipPath:
                                "inset(0 100% 0 0)",
                            transform:
                                "translate3d(0, 2px, 0)",
                        }}
                        animate={{
                            opacity: 1,
                            clipPath:
                                "inset(0 0% 0 0)",
                            transform:
                                "translate3d(0, 0, 0)",
                        }}
                        transition={{
                            opacity: {
                                duration: 0.1,
                                delay: characterDelay,
                                ease: "linear",
                            },

                            clipPath: {
                                duration:
                                    characterDuration,
                                delay: characterDelay,
                                ease: [
                                    0.16,
                                    1,
                                    0.3,
                                    1,
                                ],
                            },

                            transform: {
                                duration:
                                    characterDuration,
                                delay: characterDelay,
                                ease: [
                                    0.16,
                                    1,
                                    0.3,
                                    1,
                                ],
                            },
                        }}
                        onAnimationComplete={
                            isLast
                                ? onComplete
                                : undefined
                        }
                    >
                        {character}
                    </motion.span>
                );
            })}
        </span>
    );
}

/* ==========================================================================
   CHILDREN NORMALIZATION
   ========================================================================== */

function normalizeLines(children) {
    /**
     * Array:
     *
     * ["FRONTEND", "DEVELOPER"]
     */
    if (Array.isArray(children)) {
        return children.map(String);
    }

    /**
     * Plain string:
     *
     * "FRONTEND DEVELOPER"
     */
    if (typeof children === "string") {
        return [children];
    }

    /**
     * For other React nodes, keep them as one line.
     *
     * This allows the component to remain flexible without
     * trying to inspect arbitrary React children.
     */
    return [children];
}