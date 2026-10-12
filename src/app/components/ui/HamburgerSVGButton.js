"use client";

import { forwardRef } from "react";
import { motion } from "motion/react";

import { cn } from "@/app/lib/utils";

const HamburgerSVGButton = forwardRef(
    function HamburgerSVGButton(
        {
            isOpen = false,
            onClick,
            className = "",
            size = 40,
        },
        ref
    ) {
        const iconSize = 20;

        return (
            <motion.button
                ref={ref}
                type="button"
                onClick={onClick}
                aria-label={
                    isOpen ? "Close menu" : "Open menu"
                }
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                whileTap={{ scale: 0.92 }}
                transition={{
                    duration: 0.16,
                    ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                    width: size,
                    height: size,
                }}
                className={cn(
                    "relative flex shrink-0",
                    "items-center justify-center",
                    "rounded-full",
                    "text-text-primary",
                    "transition-colors duration-200",
                    "hover:bg-surface-2",
                    "hover:text-brand",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-brand",
                    "focus-visible:ring-offset-2",
                    "focus-visible:ring-offset-background",
                    className
                )}
            >
                <motion.svg
                    width={iconSize}
                    height={iconSize}
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    {/* TOP LINE */}
                    <motion.line
                        x1="3"
                        x2="17"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        initial={false}
                        animate={{
                            y1: isOpen ? 10 : 5,
                            y2: isOpen ? 10 : 5,
                            rotate: isOpen ? 45 : 0,
                            scaleX: isOpen ? 1 : 1,
                        }}
                        transition={{
                            duration: 0.32,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        style={{
                            transformOrigin: "10px 10px",
                        }}
                    />

                    {/* MIDDLE LINE */}
                    <motion.line
                        x1="3"
                        x2="17"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        initial={false}
                        animate={{
                            y1: 10,
                            y2: 10,
                            opacity: isOpen ? 0 : 1,
                            scaleX: isOpen ? 0.2 : 1,
                        }}
                        transition={{
                            duration: 0.2,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        style={{
                            transformOrigin: "10px 10px",
                        }}
                    />

                    {/* BOTTOM LINE */}
                    <motion.line
                        x1="3"
                        x2="17"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        initial={false}
                        animate={{
                            y1: isOpen ? 10 : 15,
                            y2: isOpen ? 10 : 15,
                            rotate: isOpen ? -45 : 0,
                            scaleX: isOpen ? 1 : 1,
                        }}
                        transition={{
                            duration: 0.32,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        style={{
                            transformOrigin: "10px 10px",
                        }}
                    />
                </motion.svg>
            </motion.button>
        );
    }
);

HamburgerSVGButton.displayName =
    "HamburgerSVGButton";

export default HamburgerSVGButton;