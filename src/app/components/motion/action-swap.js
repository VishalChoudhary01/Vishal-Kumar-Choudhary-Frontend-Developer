"use client";

import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/app/lib/utils";

const variants = {
    blur: {
        initial: {
            opacity: 0,
            filter: "blur(8px)",
            scale: 0.8,
        },

        animate: {
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
        },

        exit: {
            opacity: 0,
            filter: "blur(8px)",
            scale: 0.8,
        },
    },
};

export function ActionSwapIcon({
    value,
    animation = "blur",
    className,
    children,
}) {
    const variant =
        variants[animation] ??
        variants.blur;

    return (
        <span
            className={cn(
                "relative inline-flex items-center justify-center",
                className,
            )}
        >
            <AnimatePresence
                mode="wait"
                initial={false}
            >
                <motion.span
                    key={value}
                    initial={
                        variant.initial
                    }
                    animate={
                        variant.animate
                    }
                    exit={
                        variant.exit
                    }
                    transition={{
                        duration: 0.22,
                        ease: [
                            0.4,
                            0,
                            0.2,
                            1,
                        ],
                    }}
                    className="inline-flex items-center justify-center"
                >
                    {children}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}