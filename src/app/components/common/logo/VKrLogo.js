"use client";

import { useEffect, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";

import { usePageLoader } from "@/app/providers/PageLoaderProvider";

export default function VKrLogo() {
  const { heroReady } = usePageLoader();

  const logoProgress = useMotionValue(0);

  const [isHovered, setIsHovered] = useState(false);

  // =============================================
  // TEXT REVEAL
  // WAIT FOR LOADER
  // =============================================
  useEffect(() => {
    /*
     * Loader is still running.
     * Keep logo at initial state.
     */
    if (!heroReady) {
      logoProgress.set(0);
      setIsHovered(false);

      return;
    }

    /*
     * Loader completed.
     * Now start logo reveal.
     */
    const controls = animate(
      logoProgress,
      1,
      {
        duration: 1.9,
        delay: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }
    );

    return () => controls.stop();
  }, [heroReady, logoProgress]);

  // =============================================
  // CLIP
  // =============================================
  const logoClip = useTransform(
    logoProgress,
    [0, 1],
    [
      "inset(0% 100% 0% 0%)",
      "inset(0% 0% 0% 0%)",
    ]
  );

  // =============================================
  // RESPONSIVE TEXT
  // =============================================
  const textClasses = `
        whitespace-nowrap
        font-body
        font-semibold
        leading-[0.8]
        tracking-[-0.08em]

        text-[1.15rem]
        sm:text-[1.4rem]
        md:text-[1.55rem]
        lg:text-[1.6rem]
        xl:text-[1.7rem]
    `;

  return (
    <motion.div
      className="
                relative
                flex
                items-center
                justify-center
                cursor-pointer

                size-[6rem]

                [perspective:800px]

                sm:size-[6.5rem]
                md:size-[7rem]
                lg:size-[7.5rem]
                xl:size-[6.5rem]
            "
      onMouseEnter={() => {
        if (heroReady) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      {/* =================================================
                SVG RING
            ================================================= */}
      <motion.div
        className="
                    pointer-events-none
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center

                    origin-center
                    [transform-origin:center]
                    [transform-style:preserve-3d]

                    will-change-transform

                    text-[#222222]
                    dark:text-[#F1EFE8]
                "
        animate={
          heroReady && isHovered
            ? {
              opacity: 0.72,
              rotateX: 42,
              rotateY: 24,
              rotateZ: 360,
              scale: 1.025,
            }
            : {
              opacity: heroReady ? 0.3 : 0,
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
          className="
                        h-full
                        w-full
                        overflow-visible
                        text-foreground
                        dark:text-foreground
                        dark:opacity-80
                    "
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <motion.circle
            cx="50"
            cy="50"
            r="29"
            pathLength="1"
            stroke="currentColor"
            strokeLinecap="round"
            initial={{
              pathLength: 0,
              opacity: 0,
              strokeWidth: 1.2,
            }}
            animate={{
              pathLength: heroReady ? 1 : 0,
              opacity: heroReady ? 1 : 0,
              strokeWidth: isHovered
                ? 1.8
                : 1.2,
            }}
            transition={{
              pathLength: {
                duration: 1.65,
                delay: heroReady ? 1.4 : 0,
                ease: [0.22, 1, 0.36, 1],
              },

              opacity: {
                duration: 0.2,
                delay: heroReady ? 0.9 : 0,
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

      {/* =================================================
                V Kr.
            ================================================= */}
      <div className="relative z-10 w-fit">
        {/* OUTLINE */}
        <h2
          className={`
                        ${textClasses}

                        text-transparent

                        [-webkit-text-stroke:0.2px_#222222]
                        dark:[-webkit-text-stroke:0.2px_#F1EFE8]
                    `}
        >
          V Kr.
        </h2>

        {/* SOLID REVEAL */}
        <motion.h2
          aria-hidden="true"
          initial={{
            clipPath:
              "inset(0% 100% 0% 0%)",
          }}
          style={{
            clipPath: logoClip,
          }}
          className={`
                        ${textClasses}

                        absolute
                        inset-0

                        text-[#222222]
                        dark:text-[#F1EFE8]
                    `}
        >
          V Kr.
        </motion.h2>
      </div>
    </motion.div>
  );
}