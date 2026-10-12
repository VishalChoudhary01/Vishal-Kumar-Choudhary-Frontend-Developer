"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react"

export default function VKrLogo() {
  const logoProgress = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  // =============================================
  // STAGE 2
  // OUTLINE → SOLID, LEFT → RIGHT
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
  // TEXT REVEAL ON LOAD
  // =============================================
  useEffect(() => {
    const controls = animate(logoProgress, 1, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    });

    return () => controls.stop();
  }, [logoProgress]);

  // =============================================
  // RESPONSIVE TEXT
  // =============================================
  const textClasses = `
    whitespace-nowrap
    font-body
    font-semibold
    leading-[0.8]
    tracking-[-0.08em]

    text-[1.35rem]
    sm:text-[1.5rem]
    md:text-[1.65rem]
    lg:text-[1.8rem]
    xl:text-[2rem]
  `;

  return (
    <motion.div
      className="relative top-1 flex items-center justify-center size-[6rem] [perspective:800px] [transform-style:preserve-3d] sm:size-[6.5rem] md:size-[7rem] lg:size-[7.5rem] xl:size-[8rem]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* =================================================
          RING SYSTEM
          All rings share the same center.
          ================================================= */}

      <div
        className="pointer-events-none absolute inset-0 [transform-style:preserve-3d]"
      >
        {/* =============================================
            RING 1
            LEFT ↔ RIGHT
            ============================================= */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center will-change-transform [transform-style:preserve-3d] text-[#222222] dark:text-[#F1EFE8]"
          animate={
            isHovered
              ? {
                  opacity: 0.8,
                  rotateY: 360,
                  scale: 1.02,
                }
              : {
                  opacity: 0.35,
                  rotateY: 0,
                  scale: 1,
                }
          }
          transition={{
            duration: 1.2,
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
              r="29"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* =============================================
            RING 2
            TOP ↕ BOTTOM
            ============================================= */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center will-change-transform [transform-style:preserve-3d] text-[#222222] dark:text-[#F1EFE8]"
          animate={
            isHovered
              ? {
                  opacity: 0.65,
                  rotateX: 360,
                  scale: 1.01,
                }
              : {
                  opacity: 0.2,
                  rotateX: 0,
                  scale: 1,
                }
          }
          transition={{
            duration: 1.45,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.04,
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
              r="29"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* =============================================
            RING 3
            DIAGONAL ↗ ↙
            X + Y
            ============================================= */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center will-change-transform [transform-style:preserve-3d] text-[#222222] dark:text-[#F1EFE8]"
          animate={
            isHovered
              ? {
                  opacity: 0.5,
                  rotateX: 360,
                  rotateY: 360,
                  rotateZ: 12,
                  scale: 1.015,
                }
              : {
                  opacity: 0.14,
                  rotateX: 0,
                  rotateY: 0,
                  rotateZ: 0,
                  scale: 1,
                }
          }
          transition={{
            duration: 1.65,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.08,
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
              r="29"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* =============================================
            RING 4
            OPPOSITE DIAGONAL ↖ ↘
            X - Y
            ============================================= */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center will-change-transform [transform-style:preserve-3d] text-[#222222] dark:text-[#F1EFE8]"
          animate={
            isHovered
              ? {
                  opacity: 0.42,
                  rotateX: -360,
                  rotateY: 360,
                  rotateZ: -12,
                  scale: 1.01,
                }
              : {
                  opacity: 0.1,
                  rotateX: 0,
                  rotateY: 0,
                  rotateZ: 0,
                  scale: 1,
                }
          }
          transition={{
            duration: 1.8,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.12,
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
              r="29"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      </div>

      {/* =================================================
          TEXT
          ALWAYS FIXED IN CENTER
          ================================================= */}
      <div className="relative z-10 w-fit">
        {/* OUTLINE */}
        {/*
          <p>, not <h2>: this brand mark sits inside the mobile-menu
          <header>. As an <h2> it preceded the page <h1> in the heading
          outline on every route (Phase 12: SEO).
        */}
        <p
          className={`
            ${textClasses}
            text-transparent
            [-webkit-text-stroke:0.2px_#222222]
            dark:[-webkit-text-stroke:0.2px_#F1EFE8]
          `}
        >
          V Kr.
        </p>

        {/*
          SOLID — pseudo-element overlay, same treatment as VKrLogo.

          This used to be a second <p>V Kr.</p>, which doubled the link's
          visible text and tripped axe's label-content-name-mismatch (visible
          "V Kr. V Kr." not contained in the accessible name "V Kr."). The
          ::before (see .logo-solid in globals.css) paints the solid fill
          with no real text node, so visible text == accessible name.

          textClasses rides on the wrapper so the ::before inherits the font
          metrics and stays pixel-aligned with the outline <p>.
        */}
        <motion.div
          aria-hidden="true"
          className={`logo-solid pointer-events-none absolute inset-0 ${textClasses}`}
          initial={{ "--logo-clip": "inset(0% 100% 0% 0%)" }}
          style={{
            "--logo-clip": logoClip,
          }}
        />
      </div>
    </motion.div>
  );
}