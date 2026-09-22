"use client";

import { motion } from "motion/react";

import { EASE } from "./actionButton.constants";

export default function ActionButtonSuccess({
    reduced = false,
}) {
    return (
        <motion.span
            aria-hidden="true"
            className="absolute z-30 grid size-4 place-items-center text-success"
            initial={
                reduced
                    ? false
                    : {
                        y: 6,
                        scale: 0.6,
                        opacity: 0,
                    }
            }
            animate={{
                y: 0,
                scale: 1,
                opacity: 1,
            }}
            transition={{
                duration: 0.3,
                ease: EASE,
            }}
        >
            <CheckIcon />
        </motion.span>
    );
}

function CheckIcon() {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-full"
        >
            <polyline points="13.5 4.5 6.5 11.5 2.5 7.5" />
        </svg>
    );
}