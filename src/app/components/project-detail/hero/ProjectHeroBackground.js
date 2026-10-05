/* ------------------------------------------------------------------
   LAYERS 0–2 — HERO BACKGROUND (base · atmosphere · grid).
   Theme-token driven: hairlines and washes use CSS variables, so
   dark and light only differ through the token values. Decorative
   only — never pushes layout width, never competes with content.
------------------------------------------------------------------ */
"use client";

import { motion } from "motion/react";

import { EASE, DURATION, DELAY } from "./projectHeroMotion";

export default function ProjectHeroBackground({ parallaxStyle, reduced = false }) {
    return (
        <motion.div
            aria-hidden="true"
            style={parallaxStyle}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : DURATION.atmosphere, delay: reduced ? 0 : DELAY.atmosphere, ease: EASE }}
            className="pointer-events-none absolute inset-0 z-0"
        >
            {/* LAYER 1 — atmosphere: soft petrol wash behind the visual */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_58%_at_68%_16%,var(--brand-soft)_0%,transparent_66%)] opacity-70 dark:opacity-30" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_48%_at_10%_88%,var(--surface-3)_0%,transparent_62%)] opacity-80 dark:opacity-45" />

            {/* LAYER 2 — editorial grid: hairlines discovered, not noticed */}
            <div
                className="absolute inset-0 opacity-50 dark:opacity-30"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
                    backgroundSize: "min(16.66%, 213px) min(120px, 12.5vh)",
                }}
            />

            {/* LAYER 5 — readability gradient: content side stays calm */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_70%_at_28%_50%,var(--background)_18%,transparent_74%)] opacity-90" />
        </motion.div>
    );
}
