"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

import  useReducedMotion  from "@/app/hooks/useReducedMotion";

import SurfaceSVG from "./SurfaceSVG";
import IntroLetters from "./IntroLetters";

/* ==========================================================================
   ASSET PRELOADING
   ==========================================================================
   Critical assets that must load before the loader dismisses.
   The hero image is the most important — its entrance animation should not
   start until the image is decoded and ready.
   ========================================================================== */

const CRITICAL_ASSETS = [
  "/images/vishal-kumar-choudhary-work.webp",
];

function preloadAssets(urls) {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve; /* don't block on failed assets */
          img.src = url;
        })
    )
  );
}

/* ==========================================================================
   CRAFTING LETTER PERSONALITIES
   ========================================================================== */

const LETTERS = [
  {
    char: "C",

    // Energetic jump
    initial: {
      y: 50,
      x: 0,
      opacity: 0,
      rotate: 0,
      scale: 8.6,
    },

    animate: {
      y: 0,
      x: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
    },

    transition: {
      type: "tween",
      duration: 0.55,
      delay: 0.2,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },

  {
    char: "R",

    // Curious rotational arrival
    initial: {
      y: 0,
      x: -40,
      opacity: 0,
      rotate: -180,
      scale: 0.5,
    },

    animate: {
      y: 0,
      x: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
    },

    transition: {
      type: "tween",
      duration: 0.6,
      delay: 0.35,
      ease: [0.22, 1.2, 0.36, 1],
    },
  },

  {
    char: "A",

    // Small drop + landing
    initial: {
      y: -60,
      x: 0,
      opacity: 0,
      rotate: 0,
      scale: 1.15,
    },

    animate: {
      y: 0,
      x: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
    },

    transition: {
      type: "tween",
      duration: 0.5,
      delay: 0.52,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  {
    char: "F",

    // Tips from upper-right
    initial: {
      y: -30,
      x: 30,
      opacity: 0,
      rotate: 45,
      scale: 0.7,
    },

    animate: {
      y: 0,
      x: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
    },

    transition: {
      type: "tween",
      duration: 0.45,
      delay: 0.68,
      ease: [0.16, 1.4, 0.3, 1],
    },
  },

  {
    char: "T",

    // Sideways wobble
    initial: {
      y: 0,
      x: 35,
      opacity: 0,
      rotate: 0,
      scale: 0.8,
    },

    animate: {
      y: 0,
      x: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
    },

    transition: {
      type: "tween",
      duration: 0.48,
      delay: 0.82,
      ease: [0.22, 1.2, 0.36, 1],
    },
  },

  {
    char: "I",

    // Fast vertical entrance
    initial: {
      y: 55,
      x: 0,
      opacity: 0,
      rotate: 0,
      scale: 0.9,
    },

    animate: {
      y: 0,
      x: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
    },

    transition: {
      type: "tween",
      duration: 0.35,
      delay: 0.95,
      ease: [0.34, 1.8, 0.64, 1],
    },
  },

  {
    char: "N",

    // Casual horizontal arrival
    initial: {
      y: 0,
      x: 45,
      opacity: 0,
      rotate: 0,
      scale: 0.85,
    },

    animate: {
      y: 0,
      x: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
    },

    transition: {
      type: "tween",
      duration: 0.5,
      delay: 1.05,
      ease: [0.16, 1, 0.3, 1],
    },
  },

  {
    char: "G",

    // Final little flourish
    initial: {
      y: 40,
      x: 20,
      opacity: 0,
      rotate: -90,
      scale: 0.6,
    },

    animate: {
      y: 0,
      x: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
    },

    transition: {
      type: "tween",
      duration: 0.65,
      delay: 1.18,
      ease: [0.34, 1.4, 0.64, 1],
    },
  },
];

/* ==========================================================================
   REDUCED MOTION
   ========================================================================== */

const LETTERS_REDUCED = LETTERS.map((letter) => ({
  ...letter,

  initial: {
    y: 10,
    x: 0,
    opacity: 0,
    rotate: 0,
    scale: 1,
  },

  animate: {
    y: 0,
    x: 0,
    opacity: 1,
    rotate: 0,
    scale: 1,
  },

  transition: {
    type: "tween",
    duration: 0.35,
    delay: letter.transition.delay,
    ease: [0.16, 1, 0.3, 1],
  },
}));

/* ==========================================================================
   TIMING
   ========================================================================== */

const LAST_LETTER_DELAY =
  LETTERS[LETTERS.length - 1].transition.delay;

const LAST_LETTER_DURATION =
  LETTERS[LETTERS.length - 1].transition.duration;

const SETTLE_PAUSE = 0.22;

const PRE_PEEL_DURATION = 0.12;

const PEEL_DURATION = 0.78;

/* ==========================================================================
   COMPONENT
   ========================================================================== */

export default function PortfolioIntro({ onComplete }) {
  const reducedMotion = useReducedMotion();

  const [phase, setPhase] = useState("intro");
  const [assetsReady, setAssetsReady] = useState(false);

  const peelTimerRef = useRef(null);
  const completeTimerRef = useRef(null);

  const hasCalledComplete = useRef(false);

  /* ------------------------------------------------------------------------
     PRELOAD CRITICAL ASSETS
     ------------------------------------------------------------------------ */

  useEffect(() => {
    preloadAssets(CRITICAL_ASSETS).then(() => {
      setAssetsReady(true);
    });
  }, []);

  /* ------------------------------------------------------------------------
     CLEANUP
     ------------------------------------------------------------------------ */

  useEffect(() => {
    return () => {
      if (peelTimerRef.current) {
        clearTimeout(peelTimerRef.current);
      }

      if (completeTimerRef.current) {
        clearTimeout(completeTimerRef.current);
      }
    };
  }, []);

  /* ------------------------------------------------------------------------
     LOCK PAGE SCROLL
     ------------------------------------------------------------------------ */

  useEffect(() => {
    const html = document.documentElement;

    html.style.overflow = "hidden";

    return () => {
      html.style.overflow = "";
    };
  }, []);

  /* ------------------------------------------------------------------------
     WAIT FOR CRAFTING → PRE-PEEL
     ------------------------------------------------------------------------ */

  useEffect(() => {
    if (phase !== "intro") {
      return;
    }

    const totalLetterTime =
      LAST_LETTER_DELAY +
      LAST_LETTER_DURATION;

    const pause = reducedMotion
      ? 0.05
      : SETTLE_PAUSE;

    const delay =
      (totalLetterTime + pause) * 1000;

    peelTimerRef.current = setTimeout(() => {
      setPhase(
        reducedMotion
          ? "peeling"
          : "pre-peel"
      );
    }, delay);

    return () => {
      if (peelTimerRef.current) {
        clearTimeout(peelTimerRef.current);
      }
    };
  }, [phase, reducedMotion]);

  /* ------------------------------------------------------------------------
     PRE-PEEL → PEEL
     ------------------------------------------------------------------------ */

  useEffect(() => {
    if (phase !== "pre-peel") {
      return;
    }

    const timer = setTimeout(() => {
      setPhase("peeling");
    }, PRE_PEEL_DURATION * 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [phase]);

  /* ------------------------------------------------------------------------
     PEEL → COMPLETE
     ------------------------------------------------------------------------ */

  useEffect(() => {
    if (phase !== "peeling") {
      return;
    }

    const duration = reducedMotion
      ? 0.2
      : PEEL_DURATION;

    completeTimerRef.current = setTimeout(() => {
      if (hasCalledComplete.current) {
        return;
      }

      /* Wait for both peel animation AND critical assets */
      if (!assetsReady) {
        /* Assets still loading — poll until ready */
        const poll = setInterval(() => {
          if (assetsReady && !hasCalledComplete.current) {
            clearInterval(poll);
            hasCalledComplete.current = true;
            onComplete?.();
          }
        }, 50);

        return () => clearInterval(poll);
      }

      hasCalledComplete.current = true;
      onComplete?.();
    }, duration * 1000);

    return () => {
      if (completeTimerRef.current) {
        clearTimeout(completeTimerRef.current);
      }
    };
  }, [phase, reducedMotion, onComplete, assetsReady]);

  /* ------------------------------------------------------------------------
     ANIMATION STATES
     ------------------------------------------------------------------------ */

  const surfaceAnimation =
    phase === "pre-peel"
      ? {
        y: "-0.8%",
        rotate: -0.15,
        scaleX: 1.002,
        scaleY: 1,
      }
      : phase === "peeling"
        ? {
          y: "-108%",
          rotate: -0.5,
          scaleX: 1.01,
          scaleY: 1.005,
        }
        : {
          y: 0,
          rotate: 0,
          scaleX: 1,
          scaleY: 1,
        };

  const surfaceTransition =
    phase === "pre-peel"
      ? {
        type: "tween",
        duration: PRE_PEEL_DURATION,
        ease: [0.33, 1, 0.68, 1],
      }
      : phase === "peeling"
        ? {
          type: "tween",
          duration: reducedMotion
            ? 0.2
            : PEEL_DURATION,
          ease: [0.76, 0, 0.24, 1],
        }
        : {
          duration: 0,
        };

  return (
    <div className=" fixed inset-0 z-[9999] h-[100dvh] w-screen overflow-hidden bg-background dark:bg-background " aria-hidden="true" >
      {/* ================================================================
          PHYSICAL SURFACE
          ================================================================ */}

      <motion.div className=" absolute inset-0 flex flex-col items-center justify-center "
        initial={false} animate={surfaceAnimation} transition={surfaceTransition} style={{ willChange: "transform", transformOrigin: "50% 0%", }} >

        <SurfaceSVG />

        {/* TOP EDGE ACCENT */}

        <div className=" pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-90 from-transparent via-border-subtle to-transparent opacity-5 " />

        {/* INTRO CONTENT */}

        <div className=" relative z-10 flex w-full max-w-[900px] flex-col items-center px-6 sm:px-8 " >
          {/* Supporting text */}

          <motion.p
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              type: "tween",
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
            className=" mb-4 text-center text-[9px] font-medium uppercase tracking-[0.18em] sm:mb-5 sm:text-[10px] sm:tracking-[0.2em] lg:text-[13px] text-text-tertiary "

          >
            Good to have you here
          </motion.p>

          {/* CRAFTING */}

          <IntroLetters
            reducedMotion={reducedMotion}
            LETTERS={LETTERS}
            LETTERS_REDUCED={LETTERS_REDUCED}
          />
        </div>

        {/* ==============================================================
            PEEL EDGE DEPTH
            ============================================================== */}

        {phase === "pre-peel" || phase === "peeling" ? (
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-[rgba(0,0,0,0.055)] to-transparent ${phase === "pre-peel" ? "opacity-[0.45]" :"opacity-[0.8]"}`}

            aria-hidden="true"
          />
        ) : null}
      </motion.div>
    </div>
  );
}