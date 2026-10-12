"use client";

import { AnimatePresence, motion } from "motion/react";

import DownloadButtonIcon from "./DownloadButtonIcon";
import { EASE } from "./downloadButton.constants";

export default function DownloadButtonContent({
    label,
    icon,
    iconSize = 18,
    iconPosition = "right",
    iconInitial,
    iconAnimate,
    iconAnimation,
    downloading = false,
    completed = false,
    reduced = false,
}) {
    return (
        <AnimatePresence
            mode="popLayout"
            initial={false}
        >
            <motion.span
                key={`${label}-${downloading}-${completed}`}
                className="pointer-events-none relative z-20 flex items-center justify-center gap-2"
                initial={
                    reduced
                        ? {
                            opacity: 1,
                            y: 0,
                        }
                        : {
                            opacity: 0,
                            y: 6,
                        }
                }
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                exit={
                    reduced
                        ? {
                            opacity: 1,
                            y: 0,
                        }
                        : {
                            opacity: 0,
                            y: -6,
                        }
                }
                transition={{
                    duration: reduced ? 0 : 0.2,
                    ease: EASE,
                }}
            >
                <span className="whitespace-nowrap text-[15px] font-medium leading-none tracking-[-0.3px]">
                    {label}
                </span>

                {icon && iconPosition !== "none" && (
                    <motion.span
                        aria-hidden="true"
                        className={
                            iconPosition === "left"
                                ? "order-first grid size-5 shrink-0 place-items-center"
                                : "grid size-5 shrink-0 place-items-center"
                        }
                        initial={iconInitial}
                        animate={
                            downloading || completed
                                ? {
                                    x: 0,
                                    y: 0,
                                    scale: 1,
                                    opacity: 1,
                                    rotate: 0,
                                }
                                : iconAnimate
                        }
                        transition={{
                            duration: reduced
                                ? 0
                                : iconAnimation.duration,
                            ease: iconAnimation.ease,
                        }}
                    >
                        <DownloadButtonIcon
                            icon={icon}
                            size={iconSize}
                        />
                    </motion.span>
                )}
            </motion.span>
        </AnimatePresence>
    );
}