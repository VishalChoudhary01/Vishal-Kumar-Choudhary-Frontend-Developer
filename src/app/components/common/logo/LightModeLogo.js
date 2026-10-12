"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react"

export default function LightModeLogo() {
    const logoProgress = useMotionValue(0);
    const [isHovered, setIsHovered] = useState(false);

    // ---------------------------------------------
    // TEXT: outline → solid, left to right
    // ---------------------------------------------
    const logoClip = useTransform(
        logoProgress,
        [0, 1],
        [
            "inset(0% 100% 0% 0%)",
            "inset(0% 0% 0% 0%)",
        ]
    );

    useEffect(() => {
        const controls = animate(logoProgress, 1, {
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
        });

        return () => controls.stop();
    }, [logoProgress]);

    // ---------------------------------------------
    // RESPONSIVE TEXT
    // ---------------------------------------------
    const textClasses = `
    whitespace-nowrap
    font-body
    font-semibold
    leading-[0.8]
    tracking-[-0.08em]
    text-[2rem]
    max-md:text-[1.75rem]
    max-sm:text-[1.5rem]
  `;

    return (
        <motion.div
            className="relative top-2 flex size-[6rem] items-center justify-center [perspective:600px] max-md:size-[5rem] max-md:my-1.5 max-sm:size-[4.25rem] max-sm:my-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* ---------------------------------------------
          RING
          --------------------------------------------- */}
            <motion.div
                className="pointer-events-none absolute inset-0 flex items-center justify-center will-change-transform [transform-style:preserve-3d] text-[#161616]"
                animate={
                    isHovered
                        ? {
                            opacity: 0.9,
                            rotateX: 65,
                            rotateY: 15,
                            rotateZ: 360,
                            scale: 1.03,
                        }
                        : {
                            opacity: 0.42,
                            rotateX: 0,
                            rotateY: 0,
                            rotateZ: 0,
                            scale: 1,
                        }
                }
                transition={{
                    duration: 1.1,
                    ease: [0.22, 1, 0.36, 1],
                }}
            >
                <svg
                    viewBox="0 0 100 100"
                    className="h-full w-full overflow-visible"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                    />
                </svg>
            </motion.div>

            {/* ---------------------------------------------
          TEXT
          --------------------------------------------- */}
            <div className="relative z-10 w-fit">
                {/* OUTLINE */}
                {/* <p>, not <h2>: brand mark, not a content heading (Phase 12: SEO). */}
                <p
                    className={`
            ${textClasses}
            text-[#161616]
          `}
                    style={{
                        WebkitTextFillColor: "transparent",
                        WebkitTextStroke: "0.9px #161616",
                    }}
                >
                    V Kr.
                </p>

                {/* SOLID */}
                <motion.p
                    aria-hidden="true"
                    style={{
                        clipPath: logoClip,
                    }}
                    className={`
            ${textClasses}
            absolute
            inset-0
            text-[#161616]
          `}
                >
                    V Kr.
                </motion.p>
            </div>
        </motion.div>
    );
}