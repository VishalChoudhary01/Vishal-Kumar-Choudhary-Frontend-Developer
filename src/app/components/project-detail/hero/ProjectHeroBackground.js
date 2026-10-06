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

                DESKTOP — unchanged
                MOBILE — intentionally quieter
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

                Mobile intentionally almost transparent.
                We do NOT want the top half washed out.
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
                Keep exactly as it is.

                MOBILE
                ---------------------------------------------------------
                Completely redesigned.

                The readable area now lives at the BOTTOM-LEFT,
                because the mobile hero content lives there.

                TOP = transparent
                MIDDLE = mostly transparent
                BOTTOM LEFT = readable
            ========================================================= */}

            <div
                className="
                    absolute
                    inset-0

                    bg-[radial-gradient(ellipse_105%_115%_at_-8%_50%,rgba(255,255,255,0.90)_0%,rgba(255,255,255,0.78)_22%,rgba(255,255,255,0.56)_40%,rgba(255,255,255,0.32)_57%,rgba(255,255,255,0.13)_72%,rgba(255,255,255,0)_91%)]

                    dark:bg-[radial-gradient(ellipse_105%_115%_at_-8%_50%,rgba(0,0,0,0.90)_0%,rgba(0,0,0,0.78)_22%,rgba(0,0,0,0.58)_40%,rgba(0,0,0,0.36)_57%,rgba(0,0,0,0.15)_72%,rgba(0,0,0,0)_91%)]

                    max-md:bg-[radial-gradient(ellipse_145%_62%_at_8%_88%,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.66)_22%,rgba(255,255,255,0.46)_42%,rgba(255,255,255,0.22)_62%,rgba(255,255,255,0.06)_80%,rgba(255,255,255,0)_100%)]

                    dark:max-md:bg-[radial-gradient(ellipse_145%_62%_at_8%_88%,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.62)_22%,rgba(0,0,0,0.42)_42%,rgba(0,0,0,0.20)_62%,rgba(0,0,0,0.06)_80%,rgba(0,0,0,0)_100%)]
                "
            />

            {/* =========================================================
                LAYER 5 — HORIZONTAL ATMOSPHERE

                DESKTOP — unchanged.

                MOBILE — REMOVED.

                A horizontal gradient is the wrong geometry for
                bottom-left mobile content.
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

                DESKTOP — unchanged.

                MOBILE
                ---------------------------------------------------------
                A second bottom-left radial field.

                This is softer than Layer 4.

                It creates enough contrast for:
                    eyebrow
                    title
                    description
                    metadata
                    action

                without creating a visible panel.
            ========================================================= */}

            <div
                className="
                    absolute
                    inset-0

                    bg-[radial-gradient(ellipse_58%_52%_at_22%_50%,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.12)_38%,rgba(255,255,255,0.045)_62%,transparent_86%)]

                    dark:bg-[radial-gradient(ellipse_58%_52%_at_22%_50%,rgba(0,0,0,0.20)_0%,rgba(0,0,0,0.11)_38%,rgba(0,0,0,0.04)_62%,transparent_86%)]

                    max-md:bg-[radial-gradient(ellipse_135%_58%_at_10%_82%,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.18)_30%,rgba(255,255,255,0.08)_52%,rgba(255,255,255,0.025)_70%,transparent_90%)]

                    dark:max-md:bg-[radial-gradient(ellipse_135%_58%_at_10%_82%,rgba(0,0,0,0.30)_0%,rgba(0,0,0,0.20)_30%,rgba(0,0,0,0.10)_52%,rgba(0,0,0,0.035)_70%,transparent_90%)]
                "
            />

            {/* =========================================================
                LAYER 7 — IMAGE SUPPRESSION

                DESKTOP — unchanged.

                MOBILE
                ---------------------------------------------------------
                Do NOT suppress the entire left side.

                Instead, only suppress the image underneath the
                bottom-left content.

                Therefore the top remains visually transparent.
            ========================================================= */}

            <div
                className="
                    absolute
                    inset-0

                    bg-[linear-gradient(90deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0.34)_18%,rgba(255,255,255,0.22)_34%,rgba(255,255,255,0.10)_50%,rgba(255,255,255,0.025)_65%,transparent_78%)]

                    dark:bg-[linear-gradient(90deg,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0.31)_18%,rgba(0,0,0,0.21)_34%,rgba(0,0,0,0.10)_50%,rgba(0,0,0,0.025)_65%,transparent_78%)]

                    max-md:bg-[radial-gradient(ellipse_125%_48%_at_8%_88%,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0.22)_30%,rgba(255,255,255,0.10)_52%,rgba(255,255,255,0.035)_70%,transparent_92%)]

                    dark:max-md:bg-[radial-gradient(ellipse_125%_48%_at_8%_88%,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.24)_30%,rgba(0,0,0,0.12)_52%,rgba(0,0,0,0.035)_70%,transparent_92%)]
                "
            />

            {/* =========================================================
                LAYER 8 — LOWER ATMOSPHERE

                Desktop unchanged.

                Mobile is concentrated near the content zone.
            ========================================================= */}

            <div
                className="
                    absolute
                    inset-0

                    bg-[radial-gradient(ellipse_72%_42%_at_25%_78%,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.055)_40%,transparent_78%)]

                    dark:bg-[radial-gradient(ellipse_72%_42%_at_25%_78%,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.055)_40%,transparent_78%)]

                    max-md:bg-[radial-gradient(ellipse_135%_40%_at_10%_88%,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.07)_40%,transparent_78%)]

                    dark:max-md:bg-[radial-gradient(ellipse_135%_40%_at_10%_88%,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0.07)_40%,transparent_78%)]
                "
            />

            {/* =========================================================
                LAYER 9 — HERO → SNAPSHOT TRANSITION

                IMPORTANT:

                Desktop stays exactly as before.

                Mobile:
                - shorter
                - softer
                - starts lower

                This prevents the Snapshot color from washing over
                the project metadata and VIEW LIVE action.
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
                LAYER 10 — EDGE VIGNETTE

                Desktop unchanged.

                Mobile extremely subtle.
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