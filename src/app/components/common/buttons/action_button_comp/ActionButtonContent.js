"use client";

import { motion } from "motion/react";

import ActionButtonIcon from "./ActionButtonIcon";

export default function ActionButtonContent({
    label,
    icon,
    iconSize,
    iconPosition,
    iconClassName = "",
    hovered,
    reduced,
    disabled,
    labelHoverX,
    labelAnimation,
    iconInitial,
    iconAnimate,
    iconAnimation,
}) {
    return (
        <span className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden">
            <motion.span
                className="whitespace-nowrap text-[15px] font-normal leading-none tracking-[-0.35px]"
                animate={{
                    x: reduced || disabled ? 0 : hovered ? labelHoverX : 0,
                }}
                transition={{
                    duration: labelAnimation.duration,
                    ease: labelAnimation.ease,
                }}
            >
                {label}
            </motion.span>

            {!disabled && icon && iconPosition === "right" && (
                <motion.span
                    aria-hidden="true"
                    className={`absolute right-[14px] z-30 grid size-4 place-items-center ${iconClassName}`}
                    initial={iconInitial}
                    animate={iconAnimate}
                    transition={{
                        duration: iconAnimation.duration,
                        ease: iconAnimation.ease,
                    }}
                >
                    <ActionButtonIcon
                        icon={icon}
                        size={iconSize}
                    />
                </motion.span>
            )}

            {!disabled && icon && iconPosition === "left" && (
                <motion.span
                    aria-hidden="true"
                    className={`absolute left-[14px] z-30 grid size-4 place-items-center ${iconClassName}`}
                    initial={iconInitial}
                    animate={iconAnimate}
                    transition={{
                        duration: iconAnimation.duration,
                        ease: iconAnimation.ease,
                    }}
                >
                    <ActionButtonIcon
                        icon={icon}
                        size={iconSize}
                    />
                </motion.span>
            )}
        </span>
    );
}