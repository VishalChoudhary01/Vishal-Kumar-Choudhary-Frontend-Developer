"use client";

import { motion } from "motion/react";

export default function HeroAmbientBackground() {
    return (
        <div
            aria-hidden="true"
            className="
        pointer-events-none
        absolute
        inset-0
        -z-10
        overflow-hidden
        bg-[#f7f5ef]
        dark:bg-[#080b09]
      "
        >
            {/* Main ambient atmosphere */}
            <motion.div
                className="
          absolute
          left-[-10%]
          top-[58%]
          h-[55%]
          w-[75%]
          rounded-full
          bg-[radial-gradient(ellipse_at_center,rgba(91,190,177,0.16)_0%,rgba(91,190,177,0.08)_32%,transparent_72%)]
          blur-[70px]
          dark:bg-[radial-gradient(ellipse_at_center,rgba(20,120,108,0.18)_0%,rgba(20,120,108,0.09)_32%,transparent_72%)]
          dark:blur-[90px]
        "
                animate={{
                    x: [0, 35, -20, 0],
                    y: [0, -12, 18, 0],
                    scale: [1, 1.04, 0.98, 1],
                }}
                transition={{
                    duration: 24,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Very soft lower-left light */}
            <motion.div
                className="
          absolute
          left-[-12%]
          bottom-[-22%]
          h-[55%]
          w-[55%]
          rounded-full
          bg-[radial-gradient(ellipse_at_center,rgba(225,235,226,0.55)_0%,rgba(225,235,226,0.22)_35%,transparent_72%)]
          blur-[85px]
          dark:bg-[radial-gradient(ellipse_at_center,rgba(38,73,65,0.12)_0%,rgba(38,73,65,0.05)_38%,transparent_72%)]
        "
                animate={{
                    x: [0, 20, -15, 0],
                    scale: [1, 1.03, 0.99, 1],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Extremely subtle warm atmosphere on the lower-right */}
            <motion.div
                className="
          absolute
          right-[-15%]
          bottom-[-20%]
          h-[50%]
          w-[48%]
          rounded-full
          bg-[radial-gradient(ellipse_at_center,rgba(224,220,170,0.18)_0%,rgba(224,220,170,0.06)_38%,transparent_72%)]
          blur-[100px]
          dark:bg-[radial-gradient(ellipse_at_center,rgba(111,104,54,0.07)_0%,rgba(111,104,54,0.025)_40%,transparent_72%)]
        "
                animate={{
                    x: [0, -18, 12, 0],
                    y: [0, 10, -8, 0],
                    scale: [1, 1.025, 0.985, 1],
                }}
                transition={{
                    duration: 32,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Soft fade toward the top — keeps typography area quiet */}
            <div
                className="
          absolute
          inset-0
          bg-gradient-to-b
          from-[#f7f5ef]
          via-transparent
          to-transparent
          dark:from-[#080b09]
          dark:via-transparent
          dark:to-transparent
        "
            />

            {/* Optional extremely subtle vignette */}
            <div
                className="
          absolute
          inset-0
          bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(247,245,239,0.12)_100%)]
          dark:bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.18)_100%)]
        "
            />
        </div>
    );
}