"use client";

import { motion } from "motion/react";

import { EASE, DURATION } from "./projectHeroMotion";

export default function ProjectHeroBackground({ reduced = false }) {
    return (
        <motion.div
            aria-hidden="true"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
                duration: reduced ? 0 : DURATION.atmosphere,
                delay: reduced ? 0 : 0.2,
                ease: EASE,
            }}
            className="
                pointer-events-none
                absolute
                inset-0
                z-[1]
                overflow-hidden
            "
        >
            {/* =========================================================
                LAYER 1 — BASE ATMOSPHERE
            ========================================================= */}

            <div
                className="
                    absolute
                    inset-0
                    bg-white/[0.015]
                    dark:bg-black/[0.18]
                "
            />

            {/* =========================================================
                LAYER 2 — TECHNICAL GRID

                Desktop remains unchanged.
                Mobile becomes quieter.
            ========================================================= */}

            <div
                className="
                    absolute
                    inset-0
                    opacity-[0.10]
                    dark:opacity-[0.14]
                    max-md:opacity-[0.055]
                    dark:max-md:opacity-[0.08]
                "
                style={{
                    backgroundImage:
                        "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
                    backgroundSize:
                        "min(16.66%, 213px) min(120px, 12.5vh)",
                }}
            />

            {/* =========================================================
                LAYER 3 — GLOBAL CONTRAST

                Desktop unchanged.

                Mobile transparent so the upper screenshot remains
                atmospheric instead of becoming washed out.
            ========================================================= */}

            <div
                className="
                    absolute
                    inset-0
                    bg-white/[0.025]
                    dark:bg-black/[0.26]
                    max-md:bg-transparent
                    dark:max-md:bg-transparent
                "
            />

            {/* =========================================================
                LAYER 4 — PRIMARY ATMOSPHERIC FIELD

                DESKTOP
                ---------------------------------------------------------
                Existing desktop treatment remains untouched.

                MOBILE
                ---------------------------------------------------------
                The readable zone moves to the lower-left because
                mobile hero content lives there.

                The field is intentionally taller than before so the
                eyebrow is included inside the readable atmosphere.

                Strongest:
                    bottom-left

                Fades toward:
                    top
                    right
            ========================================================= */}

            <div
                className="
                    absolute
                    inset-0

                    bg-[radial-gradient(ellipse_105%_115%_at_-8%_50%,rgba(255,255,255,0.90)_0%,rgba(255,255,255,0.78)_22%,rgba(255,255,255,0.56)_40%,rgba(255,255,255,0.32)_57%,rgba(255,255,255,0.13)_72%,rgba(255,255,255,0)_91%)]

                    dark:bg-[radial-gradient(ellipse_105%_115%_at_-8%_50%,rgba(0,0,0,0.90)_0%,rgba(0,0,0,0.78)_22%,rgba(0,0,0,0.58)_40%,rgba(0,0,0,0.36)_57%,rgba(0,0,0,0.15)_72%,rgba(0,0,0,0)_91%)]

                    max-md:bg-[radial-gradient(ellipse_145%_72%_at_4%_78%,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.86)_18%,rgba(255,255,255,0.68)_34%,rgba(255,255,255,0.46)_50%,rgba(255,255,255,0.22)_66%,rgba(255,255,255,0.06)_82%,rgba(255,255,255,0)_100%)]

                    dark:max-md:bg-[radial-gradient(ellipse_145%_72%_at_4%_78%,rgba(0,0,0,0.86)_0%,rgba(0,0,0,0.76)_18%,rgba(0,0,0,0.62)_34%,rgba(0,0,0,0.44)_50%,rgba(0,0,0,0.22)_66%,rgba(0,0,0,0.07)_82%,rgba(0,0,0,0)_100%)]
                "
            />

            {/* =========================================================
                LAYER 5 — SECONDARY HORIZONTAL ATMOSPHERE

                Desktop only.

                Mobile removed because the mobile composition is
                vertically weighted rather than horizontally weighted.
            ========================================================= */}

            <div
                className="
                    absolute
                    inset-0

                    bg-linear-to-r
                    from-white/[0.20]
                    via-white/[0.10]
                    via-[38%]
                    to-transparent
                    to-[76%]

                    dark:from-black/[0.20]
                    dark:via-black/[0.10]
                    dark:via-[38%]
                    dark:to-transparent
                    dark:to-[76%]

                    max-md:bg-none
                "
            />

            {/* =========================================================
                LAYER 6 — CONTENT READABILITY CORE

                DESKTOP
                ---------------------------------------------------------
                Existing desktop field stays unchanged.

                MOBILE
                ---------------------------------------------------------
                Stronger and taller.

                This is the important mobile readability field.

                It reaches the eyebrow from underneath while still
                disappearing toward the upper-right.

                Think:

                         transparent
                       ╱──────────────╲
                     ╱                  ╲
                   ╱     screenshot      ╲
                  │                       │
                  │   eyebrow             │
                  │   ClassFuse            │
                  │   description          │
                  │   metadata             │
                  │   VIEW LIVE            │
                   ╲██████████████████████╱
                    ██████████████████████
            ========================================================= */}

            <div
                className="
                    absolute
                    inset-0

                    bg-[radial-gradient(ellipse_58%_52%_at_22%_50%,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.12)_38%,rgba(255,255,255,0.045)_62%,transparent_86%)]

                    dark:bg-[radial-gradient(ellipse_58%_52%_at_22%_50%,rgba(0,0,0,0.20)_0%,rgba(0,0,0,0.11)_38%,rgba(0,0,0,0.04)_62%,transparent_86%)]

                    max-md:bg-[radial-gradient(ellipse_140%_66%_at_4%_76%,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0.48)_24%,rgba(255,255,255,0.32)_43%,rgba(255,255,255,0.17)_61%,rgba(255,255,255,0.055)_80%,transparent_100%)]

                    dark:max-md:bg-[radial-gradient(ellipse_140%_66%_at_4%_76%,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.45)_24%,rgba(0,0,0,0.30)_43%,rgba(0,0,0,0.16)_61%,rgba(0,0,0,0.05)_80%,transparent_100%)]
                "
            />

            {/* =========================================================
                LAYER 7 — MOBILE CONTENT WHITE LIFT

                NEW.

                This specifically solves the issue visible in your
                screenshot.

                The eyebrow was still sitting on the darker image.

                This field lifts the entire content column:

                    eyebrow
                    title
                    description
                    metadata
                    action

                without turning the entire mobile hero white.

                IMPORTANT:

                - very strong around content
                - transparent toward top
                - transparent toward right
                - no rectangular edge
            ========================================================= */}

            <div
                className="
                    absolute
                    inset-0

                    hidden
                    max-md:block

                    bg-[radial-gradient(ellipse_125%_58%_at_2%_70%,rgba(255,255,255,0.48)_0%,rgba(255,255,255,0.34)_26%,rgba(255,255,255,0.20)_46%,rgba(255,255,255,0.09)_64%,rgba(255,255,255,0.025)_80%,transparent_100%)]

                    dark:bg-[radial-gradient(ellipse_125%_58%_at_2%_70%,rgba(0,0,0,0.46)_0%,rgba(0,0,0,0.34)_26%,rgba(0,0,0,0.21)_46%,rgba(0,0,0,0.10)_64%,rgba(0,0,0,0.025)_80%,transparent_100%)]
                "
            />

            {/* =========================================================
                LAYER 8 — MOBILE LEFT/BOTTOM IMAGE SUPPRESSION

                Only quietens the screenshot underneath the content.

                The upper screenshot remains visible.
            ========================================================= */}

            <div
                className="
                    absolute
                    inset-0

                    bg-[linear-gradient(90deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0.34)_18%,rgba(255,255,255,0.22)_34%,rgba(255,255,255,0.10)_50%,rgba(255,255,255,0.025)_65%,transparent_78%)]

                    dark:bg-[linear-gradient(90deg,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0.31)_18%,rgba(0,0,0,0.21)_34%,rgba(0,0,0,0.10)_50%,rgba(0,0,0,0.025)_65%,transparent_78%)]

                    max-md:bg-[radial-gradient(ellipse_125%_50%_at_4%_76%,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.18)_30%,rgba(255,255,255,0.09)_52%,rgba(255,255,255,0.025)_72%,transparent_94%)]

                    dark:max-md:bg-[radial-gradient(ellipse_125%_50%_at_4%_76%,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0.20)_30%,rgba(0,0,0,0.10)_52%,rgba(0,0,0,0.025)_72%,transparent_94%)]
                "
            />

            {/* =========================================================
                LAYER 9 — LOWER ATMOSPHERE

                Supports the transition without creating a hard line.
            ========================================================= */}

            <div
                className="
                    absolute
                    inset-0

                    bg-[radial-gradient(ellipse_72%_42%_at_25%_78%,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.055)_40%,transparent_78%)]

                    dark:bg-[radial-gradient(ellipse_72%_42%_at_25%_78%,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.055)_40%,transparent_78%)]

                    max-md:bg-[radial-gradient(ellipse_135%_40%_at_8%_88%,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.07)_40%,transparent_78%)]

                    dark:max-md:bg-[radial-gradient(ellipse_135%_40%_at_8%_88%,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0.07)_40%,transparent_78%)]
                "
            />

            {/* =========================================================
                LAYER 10 — HERO → SNAPSHOT TRANSITION

                Desktop stays strong.

                Mobile is softer and starts lower so the Snapshot
                section does not wash into the hero content.
            ========================================================= */}

            <div
                className="
                    absolute
                    inset-x-0
                    bottom-0

                    h-[10vh]
                    min-h-[120px]
                    max-h-[140px]

                    bg-[linear-gradient(to_bottom,rgba(247,244,238,0)_0%,rgba(247,244,238,0.025)_18%,rgba(247,244,238,0.12)_38%,rgba(247,244,238,0.38)_58%,rgba(247,244,238,0.72)_76%,#f7f4ee_100%)]

                    dark:bg-[linear-gradient(to_bottom,rgba(11,15,12,0)_0%,rgba(11,15,12,0.025)_18%,rgba(11,15,12,0.12)_38%,rgba(11,15,12,0.38)_58%,rgba(11,15,12,0.72)_76%,#0b0f0c_100%)]

                    max-md:h-[13vh]
                    max-md:min-h-[90px]
                    max-md:max-h-[125px]

                    max-md:bg-[linear-gradient(to_bottom,rgba(247,244,238,0)_0%,rgba(247,244,238,0.02)_25%,rgba(247,244,238,0.10)_48%,rgba(247,244,238,0.32)_68%,rgba(247,244,238,0.68)_84%,#f7f4ee_100%)]

                    dark:max-md:bg-[linear-gradient(to_bottom,rgba(11,15,12,0)_0%,rgba(11,15,12,0.02)_25%,rgba(11,15,12,0.10)_48%,rgba(11,15,12,0.32)_68%,rgba(11,15,12,0.68)_84%,#0b0f0c_100%)]
                "
            />

            {/* =========================================================
                LAYER 11 — EDGE VIGNETTE
            ========================================================= */}

            <div
                className="
                    absolute
                    inset-0

                    shadow-[inset_0_0_90px_rgb(0_0_0/0.045)]
                    dark:shadow-[inset_0_0_130px_rgb(0_0_0/0.26)]

                    max-md:shadow-[inset_0_0_35px_rgb(0_0_0/0.025)]
                    dark:max-md:shadow-[inset_0_0_55px_rgb(0_0_0/0.14)]
                "
            />
        </motion.div>
    );
}