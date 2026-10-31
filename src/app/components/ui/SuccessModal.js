
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import useUiSound from "@/app/hooks/useUiSound";

import SuccessModalContent from "./success_modal_comp/SuccessModalContent";
import {
    SUCCESS_MODAL_EASE,
    SUCCESS_MODAL_MOTION,
} from "./success_modal_comp/successModal.motion";

export default function SuccessModal({
    open,
    onClose,
    title = "Message received",
    message = "Thanks for reaching out. I'll get back to you soon.",
    ctaLabel = "Send another message",
}) {
    const reduced = useReducedMotion();
    const [mounted, setMounted] = useState(false);
    const previousFocusRef = useRef(null);

    // Confirmation sound for successful form submission.
    const { play: playConfirmationSound, stop: stopConfirmationSound, } = useUiSound("/mp3/confirmation-002.mp3", { volume: 0.35, interrupt: true, });
    
    
    useEffect(() => {
        setMounted(true);
    }, []);

    // Play once when the mounted modal opens.
    useEffect(() => {
        if (!mounted) {
            return;
        }

        if (!open) {
            stopConfirmationSound();
            return;
        }

        playConfirmationSound();

        return () => {
            stopConfirmationSound();
        };
    }, [
        mounted,
        open,
        playConfirmationSound,
        stopConfirmationSound,
    ]);

    // Save focus and move focus into the dialog when it opens.
    useEffect(() => {
        if (!open) {
            return;
        }

        previousFocusRef.current = document.activeElement;

        const timer = window.setTimeout(() => {
            document.querySelector("[data-success-modal]")?.focus();
        }, 120);

        return () => {
            window.clearTimeout(timer);
        };
    }, [open]);

    // Restore focus when the dialog closes.
    useEffect(() => {
        if (open) {
            return;
        }

        const previousElement = previousFocusRef.current;

        if (
            previousElement &&
            typeof previousElement.focus === "function"
        ) {
            previousElement.focus();
            previousFocusRef.current = null;
        }
    }, [open]);

    // Close the dialog with Escape.
    const handleKeyDown = useCallback(
        (event) => {
            if (event.key === "Escape" && open) {
                onClose();
            }
        },
        [open, onClose],
    );

    useEffect(() => {
        if (!open) {
            return;
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, handleKeyDown]);

    // Prevent background scrolling while the dialog is open.
    useEffect(() => {
        if (!open) {
            return;
        }

        document.body.classList.add("overflow-hidden");

        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, [open]);

    if (!mounted) {
        return null;
    }

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-[200] bg-surface-overlay/60 backdrop-blur-[4px]"
                        initial={reduced ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduced ? undefined : { opacity: 0 }}
                        transition={{
                            duration: SUCCESS_MODAL_MOTION.backdrop.duration,
                            ease: SUCCESS_MODAL_EASE,
                        }}
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Modal position and 3D perspective */}
                    <div
                        className="fixed inset-0 z-[201] flex items-center justify-center overflow-y-auto p-4 sm:p-6"
                        style={{
                            perspective: 750,
                            perspectiveOrigin: "50% 45%",
                        }}
                        onClick={onClose}
                    >
                        <motion.div
                            initial={
                                reduced
                                    ? false
                                    : {
                                        opacity: 0,
                                        scale: 0.92,
                                        y: 14,
                                        z: -48,
                                        rotateX: -5,
                                        rotateY: -72,
                                    }
                            }
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                z: 0,
                                rotateX: 0,
                                rotateY: 0,
                            }}
                            exit={
                                reduced
                                    ? undefined
                                    : {
                                        opacity: 0,
                                        scale: 0.96,
                                        y: 10,
                                        z: -24,
                                        rotateX: 4,
                                        rotateY: 28,
                                    }
                            }
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 24,
                                mass: 0.8,
                            }}
                            style={{
                                transformStyle: "preserve-3d",
                                transformOrigin: "center center",
                                willChange: reduced
                                    ? "auto"
                                    : "transform, opacity",
                            }}
                        >
                            <SuccessModalContent
                                title={title}
                                message={message}
                                ctaLabel={ctaLabel}
                                onClose={onClose}
                                reduced={reduced}
                            />
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body,
    );
}
