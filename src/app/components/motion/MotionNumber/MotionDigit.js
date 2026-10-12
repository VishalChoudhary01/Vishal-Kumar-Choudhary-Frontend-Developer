"use client";

import { motion } from "motion/react";

import { MOTION_NUMBER_EASE, MOTION_NUMBER_DEFAULTS } from "./motionNumber.constants"

const digitVariants = {
    enter: (direction) => ({
        y: direction > 0 ? "100%" : "-100%",
        opacity: 0,
    }),
    center: {
        y: "0%",
        opacity: 1,
    },
    exit: (direction) => ({
        y: direction > 0 ? "-100%" : "100%",
        opacity: 0,
    }),
};

export default function MotionDigit({
    digit,
    direction = 1,
    reduced = false,
    duration = MOTION_NUMBER_DEFAULTS.duration,
}) {
    if (reduced) {
        return (
            <span
                className="pointer-events-none absolute inset-0 inline-flex items-center justify-center"
                aria-hidden="true"
            >
                {digit}
            </span>
        );
    }

    return (
        <motion.span
            custom={direction}
            variants={digitVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
                duration,
                ease: MOTION_NUMBER_EASE,
            }}
            className="pointer-events-none absolute inset-0 inline-flex items-center justify-center"
            aria-hidden="true"
        >
            {digit}
        </motion.span>
    );
}