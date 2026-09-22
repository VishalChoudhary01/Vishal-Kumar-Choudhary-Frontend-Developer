"use client";

import { motion } from "motion/react";
import { cn } from "@/app/lib/utils";

export default function DownloadButtonCover({
    enabled = true,
    reduced = false,
    hovered = false,
    origin = {
        x: 0,
        y: 0,
    },
    size = 0,
    className = "bg-foreground",
    animation,
}) {
    if (!enabled) {
        return null;
    }

    return (
        <motion.span
            aria-hidden="true"
            className={cn(
                "pointer-events-none absolute z-10 rounded-full",
                className
            )}
            style={{
                left: origin.x,
                top: origin.y,
                width: size,
                height: size,
                translateX: "-50%",
                translateY: "-50%",
            }}
            initial={false}
            animate={
                reduced
                    ? {
                        scale: 0,
                        opacity: 0,
                    }
                    : {
                        scale: hovered ? 1 : 0,
                        opacity: hovered ? 1 : 0,
                    }
            }
            transition={{
                scale: {
                    duration: animation.duration,
                    ease: animation.ease,
                },
                opacity: {
                    duration: animation.opacityDuration,
                    ease: animation.ease,
                },
            }}
        />
    );
}