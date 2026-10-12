"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";

import ActionButtonRipple from "./action_button_comp/ActionButtonRipple";
import ActionButtonContent from "./action_button_comp/ActionButtonContent";
import ActionButtonSubmitting from "./action_button_comp/ActionButtonSubmitting";
import ActionButtonSuccess from "./action_button_comp/ActionButtonSuccess";

import { DEFAULT_ICON_ANIMATION, DEFAULT_LABEL_ANIMATION, DEFAULT_RIPPLE_ANIMATION, } from "./action_button_comp/actionButton.constants";

export default function ActionButton({
    label = "Send Message",
    submittingLabel = "Sending…",
    successLabel = "Message sent ✓",

    status = "idle",
    disabled = false,
    type = "submit",

    icon = null,
    iconSize = 16,
    iconPosition = "right",
    iconClassName = "",

    labelAnimation = DEFAULT_LABEL_ANIMATION,
    iconAnimation = DEFAULT_ICON_ANIMATION,

    ripple = true,
    rippleClassName = "bg-foreground",
    rippleAnimation = DEFAULT_RIPPLE_ANIMATION,

    width = "md:w-[125px]",
    height = "h-[46px]",

    className = "",

    reduced: forceReduced = false,

    onClick,
    onPointerEnter,
    onPointerLeave,
}) {
    const buttonRef = useRef(null);

    const prefersReduced = useReducedMotion();
    const reduced = forceReduced || prefersReduced;

    const [hovered, setHovered] = useState(false);

    const [rippleOrigin, setRippleOrigin] = useState({
        x: 0,
        y: 0,
    });

    const [rippleSize, setRippleSize] = useState(0);

    const isSubmitting = status === "submitting";
    const isSuccess = status === "success";

    const buttonDisabled = disabled || isSubmitting;

    const currentLabel = isSuccess
        ? successLabel
        : isSubmitting
            ? submittingLabel
            : label;

    const labelHoverX =
        iconPosition === "left"
            ? labelAnimation.distance
            : -labelAnimation.distance;

    const calculateRipple = (event) => {
        const button = buttonRef.current;

        if (!button) {
            return;
        }

        const rect = button.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const distances = [
            Math.hypot(x, y),
            Math.hypot(rect.width - x, y),
            Math.hypot(x, rect.height - y),
            Math.hypot(
                rect.width - x,
                rect.height - y
            ),
        ];

        const radius = Math.max(...distances);

        setRippleOrigin({
            x,
            y,
        });

        setRippleSize(radius * 2);
    };

    const handlePointerEnter = (event) => {
        if (buttonDisabled) {
            return;
        }

        if (!reduced && ripple) {
            calculateRipple(event);
        }

        setHovered(true);

        onPointerEnter?.(event);
    };

    const handlePointerLeave = (event) => {
        if (buttonDisabled) {
            return;
        }

        setHovered(false);

        onPointerLeave?.(event);
    };

    const iconInitial = reduced
        ? iconAnimation.to
        : iconAnimation.from;

    const iconAnimate = reduced
        ? iconAnimation.to
        : hovered
            ? iconAnimation.to
            : iconAnimation.from;

    return (
        <motion.button
            ref={buttonRef}
            type={type}
            disabled={buttonDisabled}
            aria-busy={isSubmitting}
            onClick={onClick}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            whileTap={
                reduced || buttonDisabled
                    ? undefined
                    : {
                        scale: 0.985,
                    }
            }
            transition={{
                scale: {
                    duration: 0.12,
                    ease: DEFAULT_ICON_ANIMATION.ease,
                },
            }}
            className={`${width} ${height} group relative inline-flex cursor-pointer select-none isolate items-center justify-center overflow-hidden rounded-full border border-transparent bg-brand p-0 font-body text-brand-contrast transition-[background-color,border-color] duration-300 hover:border-brand-hover hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-brand ${buttonDisabled ? "cursor-not-allowed opacity-60" : ""} ${reduced ? "motion-reduce:transition-none" : ""} ${className}`}
        >
            <ActionButtonRipple
                enabled={ripple}
                reduced={reduced}
                hovered={hovered}
                origin={rippleOrigin}
                size={rippleSize}
                className={rippleClassName}
                animation={rippleAnimation}
            />

            <ActionButtonContent
                label={currentLabel}
                icon={icon}
                iconSize={iconSize}
                iconPosition={iconPosition}
                iconClassName={iconClassName}
                hovered={hovered}
                reduced={reduced}
                disabled={buttonDisabled}
                labelHoverX={labelHoverX}
                labelAnimation={labelAnimation}
                iconInitial={iconInitial}
                iconAnimate={iconAnimate}
                iconAnimation={iconAnimation}
            />

            {isSubmitting && (
                <ActionButtonSubmitting reduced={reduced} />
            )}

            {isSuccess && (
                <ActionButtonSuccess reduced={reduced} />
            )}
        </motion.button>
    );
}