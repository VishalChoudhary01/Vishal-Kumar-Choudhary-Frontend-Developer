"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { motion, useInView } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import { cn } from "@/app/lib/utils";
import { CONTACT_MOTION, EASE_STANDARD } from "./contact.motion";

export default function ContactDirectEmail({
    email = "",
    className = "",
}) {
    const reduced = useReducedMotion();
    const rootRef = useRef(null);
    const timeoutRef = useRef(null);

    const entered = useInView(rootRef, {
        once: true,
        margin: "-40px 0px",
    });

    const show = reduced || entered;

    const [copied, setCopied] = useState(false);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    if (!email) {
        return null;
    }

    const handleClick = async () => {
        try {
            await navigator.clipboard.writeText(email);
        } catch {
            // Clipboard unavailable.
        }

        setCopied(true);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <motion.div
            ref={rootRef}
            className={className}
            initial={false}
            animate={
                show
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 14 }
            }
            transition={{
                duration: CONTACT_MOTION.reveal.duration,
                ease: CONTACT_MOTION.reveal.ease,
                delay: show && !reduced ? 0.08 : 0,
            }}
        >
            <p className="font-mono text-xs text-text-tertiary">
                Prefer email?
            </p>

            <motion.button
                type="button"
                onClick={handleClick}
                className={cn(
                    "group mt-1.5 inline-flex w-fit items-center gap-2",
                    "border-b border-transparent pb-0.5 text-left",
                    "font-mono text-xs text-text-secondary",
                    "cursor-pointer transition-colors duration-200",
                    "hover:border-border-strong hover:text-text-primary",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
                whileHover={
                    reduced
                        ? undefined
                        : {
                            x: 2,
                            y: -1,
                        }
                }
                whileTap={
                    reduced
                        ? undefined
                        : {
                            scale: 0.98,
                        }
                }
                transition={{
                    duration: CONTACT_MOTION.button.duration,
                    ease: EASE_STANDARD,
                }}
                aria-label={
                    copied
                        ? "Email address copied"
                        : `Copy email address ${email}`
                }
            >
                <span>
                    {copied ? "Copied" : email}
                </span>

                <span
                    className={cn(
                        "flex size-4 items-center justify-center transition-colors duration-200",
                        copied
                            ? "text-success"
                            : "text-text-tertiary group-hover:text-text-primary",
                    )}
                    aria-hidden="true"
                >
                    {copied ? (
                        <Check
                            size={15}
                            strokeWidth={2.3}
                        />
                    ) : (
                        <Copy
                            size={14}
                            strokeWidth={1.8}
                        />
                    )}
                </span>
            </motion.button>
        </motion.div>
    );
}