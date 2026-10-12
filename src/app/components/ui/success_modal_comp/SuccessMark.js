"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";

import { SUCCESS_MODAL_EASE, SUCCESS_MODAL_MOTION } from "./successModal.motion"

const MotionCheck = motion.create(Check);

export default function SuccessMark({ reduced }) {
    return (
        <div className="relative flex size-14 items-center justify-center">
            <motion.span
                className="absolute inset-0 rounded-full bg-success-soft"
                initial={reduced ? false : { opacity: 0, scale: 0.65 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.55,
                    ease: SUCCESS_MODAL_EASE,
                    delay: 0.08,
                }}
                aria-hidden="true"
            />

            <motion.span
                className="absolute inset-1 rounded-full border border-success/20"
                initial={reduced ? false : { opacity: 0, scale: 0.75, rotate: -25 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{
                    duration: 0.5,
                    ease: SUCCESS_MODAL_EASE,
                    delay: 0.12,
                }}
                aria-hidden="true"
            />

            <motion.span
                className="relative z-10 flex size-10 items-center justify-center rounded-full bg-success text-brand-contrast"
                initial={reduced ? false : { opacity: 0, scale: 0.65 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: SUCCESS_MODAL_MOTION.mark.duration,
                    ease: SUCCESS_MODAL_EASE,
                    delay: 0.18,
                }}
            >
                <MotionCheck
                    size={21}
                    strokeWidth={2.5}
                    initial={reduced ? false : { opacity: 0, scale: 0.5, rotate: -12 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 22,
                        delay: 0.28,
                    }}
                    aria-hidden="true"
                />
            </motion.span>
        </div>
    );
}