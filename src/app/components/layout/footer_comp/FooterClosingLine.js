"use client";

import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1];

export default function FooterClosingLine({
    text,
    children,
    show = false,
    reduced = false,
    delay = 0,
}) {
    return (
        <span className="block overflow-hidden py-[0.08em]">
            <motion.span
                className="block"
                initial={reduced ? false : { opacity: 0, y: "80px" }}
                animate={{
                    opacity: show ? 1 : 0,
                    y: show ? 0 : "80px",
                }}
                transition={{
                    duration: 0.9,
                    ease: EASE,
                    delay,
                }}
            >
                {text ? (
                    <span className="block text-text-primary">
                        {text}
                    </span>
                ) : (
                    children
                )}
            </motion.span>
        </span>
    );
}