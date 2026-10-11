"use client";

import { motion } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";

import SuccessMark from "./SuccessMark";
import { SUCCESS_MODAL_EASE, SUCCESS_MODAL_MOTION } from "./successModal.motion"

export default function SuccessModalContent({
    title,
    message,
    ctaLabel,
    onClose,
    reduced,
}) {
    return (
        <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-modal-title"
            aria-describedby="success-modal-message"
            data-success-modal
            tabIndex={-1}
            className="relative w-full max-w-[430px] overflow-hidden rounded-[20px] border border-border bg-surface-elevated px-5 py-8 text-center shadow-[0_24px_80px_-18px_rgb(0_0_0/0.28)] outline-none sm:px-10 sm:py-10"
            initial={reduced ? false : { opacity: 0, y: 16, scale: 0.975 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: 8, scale: 0.985 }}
            transition={{
                duration: SUCCESS_MODAL_MOTION.modal.duration,
                ease: SUCCESS_MODAL_EASE,
            }}
            onClick={(event) => event.stopPropagation()}
        >
            <motion.span
                className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-brand"
                initial={reduced ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                    duration: SUCCESS_MODAL_MOTION.progress.duration,
                    ease: SUCCESS_MODAL_EASE,
                    delay: 0.02,
                }}
                aria-hidden="true"
            />

            <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full text-text-tertiary transition-colors duration-200 hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-elevated sm:right-4 sm:top-4"
                aria-label="Close success message"
            >
                <X size={16} strokeWidth={1.8} />
            </button>

            <div className="flex justify-center">
                <SuccessMark reduced={reduced} />
            </div>

            <motion.h2
                id="success-modal-title"
                className="mt-5 font-display text-[clamp(1.7rem,5vw,2.2rem)] font-normal leading-[1.05] tracking-[-0.03em] text-text-primary"
                initial={reduced ? false : { opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: SUCCESS_MODAL_MOTION.title.duration,
                    ease: SUCCESS_MODAL_EASE,
                    delay: SUCCESS_MODAL_MOTION.title.delay,
                }}
            >
                {title}
            </motion.h2>

            <motion.p
                id="success-modal-message"
                className="mx-auto mt-3 max-w-[34ch] font-body text-sm leading-relaxed text-text-secondary sm:text-[15px]"
                initial={reduced ? false : { opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: SUCCESS_MODAL_MOTION.message.duration,
                    ease: SUCCESS_MODAL_EASE,
                    delay: SUCCESS_MODAL_MOTION.message.delay,
                }}
            >
                {message}
            </motion.p>

            <motion.div
                className="mt-7"
                initial={reduced ? false : { opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: SUCCESS_MODAL_MOTION.action.duration,
                    ease: SUCCESS_MODAL_EASE,
                    delay: SUCCESS_MODAL_MOTION.action.delay,
                }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 py-2.5 font-mono text-xs text-text-primary transition-all duration-300 hover:border-border-strong hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-elevated"
                >
                    <span>{ctaLabel}</span>

                    <ArrowUpRight
                        size={14}
                        strokeWidth={1.8}
                        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                    />
                </button>
            </motion.div>
        </motion.div>
    );
}