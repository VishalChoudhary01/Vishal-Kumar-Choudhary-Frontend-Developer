"use client";

import {
    motion,
    useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

export default function ProjectTechItem({
    technology,
    index,
    total,
    railX,
    viewportWidth,
    visible,
    reducedMotion,
}) {
    const itemRef = useRef(null);

    const [itemCenter, setItemCenter] =
        useState(0);

    useEffect(() => {
        const item = itemRef.current;

        if (!item) {
            return;
        }

        const updatePosition = () => {
            setItemCenter(
                item.offsetLeft +
                item.offsetWidth / 2
            );
        };

        updatePosition();

        const observer =
            new ResizeObserver(updatePosition);

        observer.observe(item);

        window.addEventListener(
            "resize",
            updatePosition
        );

        return () => {
            observer.disconnect();

            window.removeEventListener(
                "resize",
                updatePosition
            );
        };
    }, [technology]);

    /*
     * ---------------------------------------------------------
     * DISTANCE FROM CENTER
     * ---------------------------------------------------------
     */
    const distance = useTransform(() => {
        const currentX = railX.get();

        const viewportCenter =
            viewportWidth / 2;

        return Math.abs(
            currentX +
            itemCenter -
            viewportCenter
        );
    });

    /*
     * ---------------------------------------------------------
     * CONVEX LENS SCALE
     * ---------------------------------------------------------
     *
     * Mobile:
     *      center  → ~1.16
     *      edges   → ~0.82
     *
     * Desktop:
     *      center  → ~1.05
     *      edges   → ~0.94
     */
    const scale = useTransform(
        distance,
        (value) => {
            const mobile =
                viewportWidth > 0 &&
                viewportWidth < 768;

            const radius = mobile
                ? 170
                : 280;

            const maxScale = mobile
                ? 1.16
                : 1.05;

            const minScale = mobile
                ? 0.82
                : 0.94;

            const progress = Math.min(
                value / radius,
                1
            );

            /*
             * Smoothstep.
             *
             * Makes the center feel physically rounded
             * rather than linearly scaled.
             */
            const smooth =
                progress *
                progress *
                (3 - 2 * progress);

            return (
                maxScale -
                smooth *
                (maxScale - minScale)
            );
        }
    );

    /*
     * ---------------------------------------------------------
     * OPACITY
     * ---------------------------------------------------------
     */
    const opacity = useTransform(
        distance,
        (value) => {
            const mobile =
                viewportWidth > 0 &&
                viewportWidth < 768;

            const radius = mobile
                ? 240
                : 360;

            const minOpacity = mobile
                ? 0.32
                : 0.58;

            const progress = Math.min(
                value / radius,
                1
            );

            return (
                1 -
                progress *
                (1 - minOpacity)
            );
        }
    );

    /*
     * ---------------------------------------------------------
     * VERTICAL LIFT
     * ---------------------------------------------------------
     *
     * The focal item slightly rises.
     */
    const y = useTransform(
        distance,
        (value) => {
            const mobile =
                viewportWidth > 0 &&
                viewportWidth < 768;

            const radius = mobile
                ? 170
                : 240;

            const progress = Math.min(
                value / radius,
                1
            );

            return (
                -(1 - progress) *
                (mobile ? 4 : 1.5)
            );
        }
    );

    return (
        <motion.div
            ref={itemRef}
            initial={
                reducedMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 10,
                    }
            }
            animate={
                reducedMotion || visible
                    ? {
                        opacity: 1,
                    }
                    : {
                        opacity: 0,
                    }
            }
            transition={
                reducedMotion
                    ? {
                        duration: 0,
                    }
                    : {
                        duration: 0.5,
                        delay:
                            index * 0.045,
                        ease: EASE_EDITORIAL,
                    }
            }
            style={{
                scale: reducedMotion
                    ? 1
                    : scale,

                opacity: reducedMotion
                    ? 1
                    : opacity,

                translateY: reducedMotion
                    ? 0
                    : y,
            }}
            className="
                group
                relative
                flex
                shrink-0
                items-center
                font-body
                text-[clamp(1rem,2.3vw,1.35rem)]
                leading-none
                tracking-[-0.015em]
                text-text-primary
                will-change-transform
            "
        >
            <span
                className="
                    relative
                    whitespace-nowrap
                    transition-colors
                    duration-200
                    ease-out
                    group-hover:text-brand
                "
            >
                {technology}

                <span
                    aria-hidden="true"
                    className="
                        absolute
                        -bottom-1
                        left-0
                        h-px
                        w-full
                        origin-left
                        scale-x-0
                        bg-brand
                        transition-transform
                        duration-250
                        ease-out
                        group-hover:scale-x-100
                    "
                />
            </span>

            {index < total - 1 && (
                <span
                    aria-hidden="true"
                    className="
                        mx-4
                        select-none
                        text-text-muted
                        sm:mx-5
                        md:mx-6
                    "
                >
                    ·
                </span>
            )}
        </motion.div>
    );
}