"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react"
import { useEffect, useRef } from "react"

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

    /*
     * ---------------------------------------------------------
     * ACTUAL ITEM CENTER
     * ---------------------------------------------------------
     *
     * Instead of using offsetLeft, we continuously derive the
     * item's real rendered position.
     *
     * This is important because the parent track is translated
     * by Motion.
     */
    const itemCenterX = useMotionValue(0);

    /*
     * ---------------------------------------------------------
     * UPDATE POSITION
     * ---------------------------------------------------------
     */
    useEffect(() => {
        const updatePosition = () => {
            const item = itemRef.current;

            if (!item) {
                return;
            }

            const rect =
                item.getBoundingClientRect();

            /*
             * item -> track -> viewport (the clipping box).
             *
             * The focal point must be the viewport's REAL center.
             * The rail sits inside a padded container, so its left
             * edge is not screen x = 0. Comparing against
             * `viewportWidth / 2` alone shifted the whole lens
             * left by the container offset and the item sitting on
             * the center axis ended up at minimum scale.
             */
            const viewport =
                item.parentElement?.parentElement;

            const viewportRect =
                viewport?.getBoundingClientRect();

            const viewportCenter = viewportRect
                ? viewportRect.left +
                viewportRect.width / 2
                : viewportWidth / 2;

            itemCenterX.set(
                rect.left +
                rect.width / 2 -
                viewportCenter
            );
        };

        updatePosition();

        /*
         * The track moves through MotionValue.
         * Subscribe directly to that movement.
         */
        const unsubscribe =
            railX.on("change", updatePosition);

        window.addEventListener(
            "resize",
            updatePosition
        );

        window.addEventListener(
            "scroll",
            updatePosition,
            {
                passive: true,
            }
        );

        return () => {
            unsubscribe();

            window.removeEventListener(
                "resize",
                updatePosition
            );

            window.removeEventListener(
                "scroll",
                updatePosition
            );
        };
    }, [railX, viewportWidth, itemCenterX]);

    /*
     * ---------------------------------------------------------
     * DISTANCE FROM OPTICAL CENTER
     * ---------------------------------------------------------
     */
    const distance = useTransform(
        itemCenterX,
        (offsetFromCenter) =>
            Math.abs(offsetFromCenter)
    );

    /*
     * ---------------------------------------------------------
     * CONVEX LENS SCALE
     * ---------------------------------------------------------
     */
    const scale = useTransform(
        distance,
        (value) => {
            const mobile =
                viewportWidth > 0 &&
                viewportWidth < 768;

            /*
             * MOBILE uses a deliberately softer lens.
             *
             * A 320-430px viewport cannot carry the desktop
             * range: 1.16 -> 0.82 makes the focal technology
             * oversized and its neighbours unreadably small.
             */
            const radius = mobile
                ? 135
                : 280;

            const maxScale = mobile
                ? 1.06
                : 1.05;

            const minScale = mobile
                ? 0.93
                : 0.94;

            const progress = Math.min(
                value / radius,
                1
            );

            /*
             * Smooth optical falloff.
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
     * ENTRANCE REVEAL
     * ---------------------------------------------------------
     *
     * The reveal shares the same MotionValue pipeline as the
     * lens instead of living on `animate`.
     *
     * Having `opacity` on BOTH `animate` and `style` made the
     * entrance animation win: the DOM stayed at opacity 1 until
     * the rail first moved, so distant technologies never faded
     * while the rail was at rest.
     */
    const reveal = useMotionValue(
        reducedMotion ? 1 : 0
    );

    useEffect(() => {
        if (reducedMotion) {
            reveal.set(1);
            return;
        }

        const entrance = animate(
            reveal,
            visible ? 1 : 0,
            {
                duration: 0.5,
                delay: index * 0.045,
                ease: EASE_EDITORIAL,
            }
        );

        return () => entrance.stop();
    }, [
        visible,
        reducedMotion,
        index,
        reveal,
    ]);

    /*
     * ---------------------------------------------------------
     * OPACITY
     * ---------------------------------------------------------
     */
    const lensOpacity = useTransform(
        distance,
        (value) => {
            const mobile =
                viewportWidth > 0 &&
                viewportWidth < 768;

            /*
             * MOBILE keeps its stack readable: mobile users have
             * less spatial context, so the far technologies stay
             * around 0.55 - 0.6 instead of fading to 0.3.
             */
            const radius = mobile
                ? 220
                : 360;

            const minOpacity = mobile
                ? 0.55
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
     * REVEAL x LENS — the entrance fade and the optical falloff
     * multiply instead of fighting over the same property.
     */
    const opacity = useTransform(
        [lensOpacity, reveal],
        ([lens, revealed]) =>
            lens * revealed
    );

    /*
     * ---------------------------------------------------------
     * VERTICAL LIFT
     * ---------------------------------------------------------
     */
    const y = useTransform(
        distance,
        (value) => {
            const mobile =
                viewportWidth > 0 &&
                viewportWidth < 768;

            const radius = mobile
                ? 135
                : 240;

            const progress = Math.min(
                value / radius,
                1
            );

            /*
             * No bounce: 0-2px on mobile, a whisper on desktop.
             */
            return (
                -(1 - progress) *
                (mobile ? 2 : 1.5)
            );
        }
    );

    return (
        <motion.div
            ref={itemRef}
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
            className="group relative flex shrink-0 items-center font-body text-[clamp(1rem,2.3vw,1.35rem)] leading-none tracking-[-0.015em] text-text-primary will-change-transform"
        >
            <span
                className="relative whitespace-nowrap transition-colors duration-200 ease-out group-hover:text-brand"
            >
                {technology}

                <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-brand transition-transform duration-250 ease-out group-hover:scale-x-100"
                />
            </span>

            {index < total - 1 && (
                <span
                    aria-hidden="true"
                    className="mx-3 select-none text-text-muted sm:mx-5 md:mx-6"
                >
                    ·
                </span>
            )}
        </motion.div>
    );
}