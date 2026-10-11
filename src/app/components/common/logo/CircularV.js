"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react"

export default function CircularV() {
    const krProgress = useMotionValue(0);
    const [isHovered, setIsHovered] = useState(false);

    // =========================================================
    // KR FILL
    // Outline → Solid
    // Left → Right
    // =========================================================

    const krClip = useTransform(
        krProgress,
        [0, 1],
        [
            "inset(0% 100% 0% 0%)",
            "inset(0% 0% 0% 0%)",
        ]
    );

    // =========================================================
    // KR LOAD REVEAL
    // =========================================================

    useEffect(() => {
        const controls = animate(krProgress, 1, {
            duration: 1.9,
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1],
        });

        return () => controls.stop();
    }, [krProgress]);

    // =========================================================
    // TYPOGRAPHY
    // Keep this compact for navbar usage.
    // =========================================================

    const textClasses = `
        whitespace-nowrap
        font-body
        font-semibold
        leading-[0.8]
        tracking-[-0.08em]

        text-[1.05rem]
        sm:text-[1.15rem]
        md:text-[1.25rem]
        lg:text-[1.35rem]
        xl:text-[1.4rem]
    `;

    return (
        <motion.div
            className="relative flex items-center cursor-pointer [perspective:800px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="V Kr logo"
        >
            {/* =====================================================
                LOGO
                ===================================================== */}

            <div
                className="relative z-10 flex items-center"
            >
                {/* =================================================
                    V BADGE
                    =================================================

                    IMPORTANT:
                    The badge is intentionally compact.

                    Light mode:
                    background = dark
                    V = light

                    Dark mode:
                    background = light
                    V = dark
                ================================================= */}

                <div
                    className="relative flex shrink-0 items-center justify-center size-[3rem] sm:size-[3.15rem] md:size-[3.3rem] lg:size-[3.45rem] xl:size-[3.35rem] rounded-full bg-[#222222] dark:bg-[#F1EFE8] [transform-style:preserve-3d]"
                >
                    {/* =============================================
                        3D RING

                        Only slightly larger than badge.
                        ============================================= */}

                    <motion.div
                        className="pointer-events-none absolute inset-[-0.16rem] origin-center [transform-style:preserve-3d] will-change-transform"
                        animate={
                            isHovered
                                ? {
                                    opacity: 0.8,
                                    rotateX: 42,
                                    rotateY: 24,
                                    rotateZ: 360,
                                    scale: 1.025,
                                }
                                : {
                                    opacity: 0.32,
                                    rotateX: 0,
                                    rotateY: 0,
                                    rotateZ: 0,
                                    scale: 1,
                                }
                        }
                        transition={{
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <svg
                            viewBox="0 0 100 100"
                            className="h-full w-full overflow-visible text-[#222222] dark:text-[#F1EFE8]"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="46"
                                pathLength="1"
                                stroke="currentColor"
                                strokeLinecap="round"
                                initial={{
                                    pathLength: 0,
                                    opacity: 0,
                                    strokeWidth: 1,
                                }}
                                animate={{
                                    pathLength: 1,
                                    opacity: 1,
                                    strokeWidth: isHovered ? 1.55 : 1,
                                }}
                                transition={{
                                    pathLength: {
                                        duration: 1.65,
                                        delay: 1.4,
                                        ease: [0.22, 1, 0.36, 1],
                                    },

                                    opacity: {
                                        duration: 0.2,
                                        delay: 0.9,
                                        ease: "easeOut",
                                    },

                                    strokeWidth: {
                                        duration: 0.3,
                                        ease: [0.22, 1, 0.36, 1],
                                    },
                                }}
                            />
                        </svg>
                    </motion.div>

                    {/* =============================================
                        V

                        IMPORTANT:
                        V is transparent.

                        The stroke is intentionally the SAME
                        color as the badge background.

                        This means the badge color shows through
                        the V instead of creating a filled V.

                        Light:
                        badge = dark
                        V stroke = light

                        Dark:
                        badge = light
                        V stroke = dark
                        ============================================= */}

                    <span
                        className={`
                            relative
                            z-10

                            select-none

                            ${textClasses}

                            text-transparent

                            [-webkit-text-stroke:0.9px_#F1EFE8]

                            dark:[-webkit-text-stroke:0.9px_#222222]
                        `}
                    >
                        V
                    </span>
                </div>

                {/* =================================================
                    KR

                    Outside the circular V badge.
                ================================================= */}

                <div
                    className="relative ml-[0.2rem] sm:ml-[0.25rem] md:ml-[0.3rem] lg:ml-[0.35rem]"
                >
                    {/* =============================================
                        KR OUTLINE
                        ============================================= */}

                    <span
                        className={`
                            ${textClasses}

                            block
                            select-none

                            text-transparent

                            [-webkit-text-stroke:0.8px_#222222]

                            dark:[-webkit-text-stroke:0.8px_#F1EFE8]
                        `}
                    >
                        Kr.
                    </span>

                    {/* =============================================
                        KR SOLID

                        Outline → Filled
                        Left → Right
                    ============================================= */}

                    <motion.span
                        aria-hidden="true"
                        className={`
                            ${textClasses}

                            pointer-events-none
                            absolute
                            inset-0

                            select-none

                            text-[#222222]
                            dark:text-[#F1EFE8]
                        `}
                        style={{
                            clipPath: krClip,
                        }}
                    >
                        Kr.
                    </motion.span>
                </div>
            </div>
        </motion.div>
    );
}