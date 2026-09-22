"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { usePageLoader } from "@/app/providers/PageLoaderProvider";

/* ==========================================================================
   DRAWN TITLE
   ========================================================================== */

/*
 * Parent <motion.h1> owns:
 * - Typography
 * - Scale
 * - Scroll transforms
 *
 * DrawnTitle owns only:
 * - Initial outline drawing
 * - Final solid text reveal
 *
 * Sequence:
 *
 * OUTLINE
 *    ↓
 * FRONTEND draws
 *    ↓
 * DEVELOPER draws
 *    ↓
 * outline completes
 *    ↓
 * SOLID gradient text fades in
 */

export function DrawnTitle() {
  const [drawComplete, setDrawComplete] = useState(false);
  const { heroReady } = usePageLoader();

  return (
    <span
      className="relative block w-full overflow-visible"
      aria-label="FRONTEND DEVELOPER"
    >
      {/* ==============================================================
                LAYER 1 — FINAL SOLID TEXT
                ============================================================== */}

      <span
        aria-hidden="true"
        className="relative z-[1] block overflow-visible"
      >
        <motion.span
          className="block bg-linear-to-b from-text-primary via-text-tertiary to-surface-3 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{
            opacity: drawComplete ? 1 : 0,
          }}
          transition={{
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          FRONTEND
        </motion.span>

        <motion.span
          className="block bg-linear-to-b from-text-primary via-text-tertiary to-surface-3 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{
            opacity: drawComplete ? 1 : 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.03,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          DEVELOPER
        </motion.span>
      </span>

      {/* ==============================================================
                LAYER 2 — OUTLINE DRAWING
                ============================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] overflow-visible"
      >
        <DrawnCharacterLine
          text="FRONTEND"
          ready={heroReady}
        />

        <DrawnCharacterLine
          text="DEVELOPER"
          ready={heroReady}
          startDelay={0.55}
          onComplete={() => {
            setDrawComplete(true);
          }}
        />
      </div>
    </span>
  );
}

/* ==========================================================================
   DRAWN CHARACTER LINE
   ========================================================================== */

function DrawnCharacterLine({
  text,
  startDelay = 0,
  ready = true,
  onComplete,
}) {
  const characters = [...text];

  const CHARACTER_DURATION = 0.16;
  const CHARACTER_STAGGER = 0.055;

  return (
    <span
      className="block whitespace-nowrap overflow-visible"
      style={{
        color: "transparent",
        WebkitTextFillColor: "transparent",
        WebkitTextStroke: "1px var(--text-primary)",
        textStroke: "1px var(--text-primary)",
      }}
    >
      {characters.map((character, index) => {
        const isLast =
          index === characters.length - 1;

        const animationDelay =
          startDelay +
          index * CHARACTER_STAGGER;

        return (
          <motion.span
            key={`${character}-${index}`}
            className="inline-block overflow-visible"
            initial={{
              opacity: 0,

              /*
               * IMPORTANT:
               *
               * Negative top/bottom values prevent the
               * large serif glyphs from being clipped.
               *
               * Horizontal clipping still performs
               * the original left-to-right draw.
               */
              clipPath:
                "inset(-0.12em 100% -0.12em 0)",

              transform:
                "translate3d(0, 2px, 0)",
            }}
            animate={{
              opacity: ready ? 1 : 0,

              clipPath: ready
                ? "inset(-0.12em 0% -0.12em 0)"
                : "inset(-0.12em 100% -0.12em 0)",

              transform: ready
                ? "translate3d(0, 0, 0)"
                : "translate3d(0, 2px, 0)",
            }}
            transition={{
              opacity: {
                duration: 0.1,
                delay: animationDelay,
                ease: "linear",
              },

              clipPath: {
                duration:
                  CHARACTER_DURATION,
                delay: animationDelay,
                ease: [0.16, 1, 0.3, 1],
              },

              transform: {
                duration:
                  CHARACTER_DURATION,
                delay: animationDelay,
                ease: [0.16, 1, 0.3, 1],
              },
            }}
            onAnimationComplete={
              ready && isLast
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