"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
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

    useEffect(() => {
        setMounted(true);
    }, []);

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

    useEffect(() => {
        if (open) {
            return;
        }

        const previousElement = previousFocusRef.current;

        if (previousElement && typeof previousElement.focus === "function") {
            previousElement.focus();
            previousFocusRef.current = null;
        }
    }, [open]);

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

                    <div
                        className="fixed inset-0 z-[201] flex items-center justify-center overflow-y-auto p-4 sm:p-6"
                        onClick={onClose}
                    >
                        <SuccessModalContent
                            title={title}
                            message={message}
                            ctaLabel={ctaLabel}
                            onClose={onClose}
                            reduced={reduced}
                        />
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body,
    );
}