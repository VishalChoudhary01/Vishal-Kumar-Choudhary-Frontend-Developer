"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { RiArrowRightLine } from "react-icons/ri";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import { cn } from "@/app/lib/utils";

const EASE = [0.16, 1, 0.3, 1];

const FOCUS_CLASSES =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function EditorialCta({
    href = "#projects",
    label = "Explore Projects",
    className = "",
    labelClassName = "",
}) {
    const reducedMotion = useReducedMotion();
    const [engaged, setEngaged] = useState(false);

    const baseClasses = cn(
        "group inline-flex items-center gap-[9px] select-none",
        "border-0 bg-transparent p-0",
        "text-text-primary",
        FOCUS_CLASSES,
        className
    );

    const labelClasses = cn(
        "type-label font-medium tracking-[0.5px]",
        labelClassName
    );

    /*
     * ============================================================
     * REDUCED MOTION
     * ============================================================
     */
    if (reducedMotion) {
        return (
            <a
                href={href}
                className={baseClasses}
            >
                <span className={labelClasses}>
                    {label}
                </span>

                <span aria-hidden="true" className=" relative size-8 shrink-0 overflow-hidden rounded-full border border-brand/60 text-brand " >
                    <span className=" absolute inset-0 flex items-center justify-center " >
                        <RiArrowRightLine
                            className="size-[18px]"

                        />
                    </span>
                </span>
            </a>
        );
    }

    return (
        <motion.a
            href={href}
            className={baseClasses}
            initial={false}
            whileTap={{ scale: 0.99 }}
            onHoverStart={() => setEngaged(true)}
            onHoverEnd={() => setEngaged(false)}
            onFocus={() => setEngaged(true)}
            onBlur={() => setEngaged(false)}
        >
            <span className={labelClasses}>
                {label}
            </span>

            {/* ======================================================
                ARROW CIRCLE
            ====================================================== */}
            <span
                aria-hidden="true"
                className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand/60 text-brand"
            >
                {/* CURRENT ARROW */}
                <motion.span
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{
                        x: engaged ? "calc(100% + 32px)" : 0,
                    }}
                    transition={{
                        duration: 0.48,
                        ease: EASE,
                    }}
                >
                    <RiArrowRightLine className="size-[18px]" />
                </motion.span>

                {/* INCOMING ARROW */}
                <motion.span
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{
                        x: "calc(-100% - 32px)",
                    }}
                    animate={{
                        x: engaged
                            ? 0
                            : "calc(-100% - 32px)",
                    }}
                    transition={{
                        duration: 0.48,
                        ease: EASE,
                    }}
                >
                    <RiArrowRightLine className="size-[18px]" />
                </motion.span>
            </span>
        </motion.a>
    );
}