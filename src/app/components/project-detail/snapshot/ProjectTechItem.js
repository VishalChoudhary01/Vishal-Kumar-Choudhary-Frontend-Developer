
"use client";

import {
    animate,
    motion,
    useMotionValue,
    useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

export default function ProjectTechItem({
    technology,
    index,
    total,
    railX,
    viewportWidth,
    visible,
    reducedMotion,
    onCenterCross,
}) {
    const itemRef = useRef(null);
    const labelRef = useRef(null);

    const itemCenterX = useMotionValue(0);

    /*
     * DESKTOP CENTER CROSSING
     *
     * Keep sound detection independent from the visual effects.
     * The sound plays when the item crosses the actual center axis.
     */
    useEffect(() => {
        const item = itemRef.current;
        const label = labelRef.current;
        const viewport = item?.parentElement?.parentElement;

        if (!item || !label || !viewport) {
            return undefined;
        }

        let baseOffset = 0;
        let previousOffset = null;

        const measureBaseline = () => {
            const labelRect = label.getBoundingClientRect();
            const viewportRect = viewport.getBoundingClientRect();

            const currentX = reducedMotion
                ? 0
                : Number(railX.get()) || 0;

            const renderedOffset =
                labelRect.left +
                labelRect.width / 2 -
                (viewportRect.left + viewportRect.width / 2);

            baseOffset = renderedOffset - currentX;
            previousOffset = baseOffset + currentX;

            itemCenterX.set(previousOffset);
        };

        // Initial measurement must never trigger a sound.
        measureBaseline();

        const unsubscribe = reducedMotion
            ? () => { }
            : railX.on("change", (latestX) => {
                const currentX = Number(latestX) || 0;
                const nextOffset = baseOffset + currentX;

                const crossedCenter =
                    previousOffset !== null &&
                    (
                        (previousOffset > 0 && nextOffset <= 0) ||
                        (previousOffset < 0 && nextOffset >= 0)
                    );

                previousOffset = nextOffset;
                itemCenterX.set(nextOffset);

                if (crossedCenter) {
                    onCenterCross?.();
                }
            });

        // Resize and layout changes update the baseline silently.
        const handleResize = () => {
            measureBaseline();
        };

        const resizeObserver = new ResizeObserver(handleResize);

        resizeObserver.observe(item);
        resizeObserver.observe(label);
        resizeObserver.observe(viewport);

        window.addEventListener("resize", handleResize);

        return () => {
            unsubscribe();
            resizeObserver.disconnect();

            window.removeEventListener("resize", handleResize);
        };
    }, [
        railX,
        itemCenterX,
        onCenterCross,
        reducedMotion,
        viewportWidth,
    ]);

    /*
     * OPTICAL DISTANCE
     */
    const distance = useTransform(
        itemCenterX,
        (offsetFromCenter) => Math.abs(offsetFromCenter),
    );

    /*
     * WHOLE ITEM SCALE
     *
     * Keep the movement subtle so the rail geometry remains stable.
     */
    const scale = useTransform(distance, (value) => {
        const mobile = viewportWidth > 0 && viewportWidth < 768;

        const radius = mobile ? 135 : 280;
        const maxScale = mobile ? 1.06 : 1.03;
        const minScale = mobile ? 0.90 : 0.92;

        const progress = Math.min(value / radius, 1);
        const smooth = progress * progress * (3 - 2 * progress);

        return maxScale - smooth * (maxScale - minScale);
    });

    /*
     * LABEL SCALE
     *
     * The label itself becomes more prominent near the center,
     * without changing the rail's measured layout dimensions.
     */
    const labelScale = useTransform(distance, (value) => {
        const mobile = viewportWidth > 0 && viewportWidth < 768;

        const radius = mobile ? 170 : 220;
        const focalScale = mobile ? 1.12 : 1.16;
        const distantScale = 0.92;

        const progress = Math.min(value / radius, 1);
        const smooth = progress * progress * (3 - 2 * progress);

        return (
            focalScale -
            smooth * (focalScale - distantScale)
        );
    });

    /*
     * ENTRANCE REVEAL
     */
    const reveal = useMotionValue(reducedMotion ? 1 : 0);

    useEffect(() => {
        if (reducedMotion) {
            reveal.set(1);
            return undefined;
        }

        const entrance = animate(reveal, visible ? 1 : 0, {
            duration: 0.5,
            delay: index * 0.045,
            ease: EASE_EDITORIAL,
        });

        return () => entrance.stop();
    }, [
        visible,
        reducedMotion,
        index,
        reveal,
    ]);

    /*
     * LENS OPACITY
     *
     * Distant items fade more strongly.
     */
    const lensOpacity = useTransform(distance, (value) => {
        const mobile = viewportWidth > 0 && viewportWidth < 768;

        const radius = mobile ? 200 : 320;
        const minOpacity = mobile ? 0.30 : 0.35;

        const progress = Math.min(value / radius, 1);
        const smooth = progress * progress * (3 - 2 * progress);

        return 1 - smooth * (1 - minOpacity);
    });

    const opacity = useTransform(
        [lensOpacity, reveal],
        ([lens, revealed]) => lens * revealed,
    );

    /*
     * SUBTLE VERTICAL LIFT
     */
    const y = useTransform(distance, (value) => {
        const mobile = viewportWidth > 0 && viewportWidth < 768;

        const radius = mobile ? 135 : 240;
        const progress = Math.min(value / radius, 1);

        return -(1 - progress) * (mobile ? 2 : 1.5);
    });

    return (
        <motion.div
            ref={itemRef}
            style={{
                scale: reducedMotion ? 1 : scale,
                opacity: reducedMotion ? 1 : opacity,
                translateY: reducedMotion ? 0 : y,
            }}
            className="group relative flex shrink-0 items-center font-body text-[clamp(0.82rem,1.5vw,1.05rem)] leading-none tracking-[-0.015em] text-text-primary will-change-transform"
        >
            <motion.span
                ref={labelRef}
                style={{
                    scale: reducedMotion ? 1 : labelScale,
                    transformOrigin: "center center",
                }}
                className="relative inline-block whitespace-nowrap transition-colors duration-200 ease-out group-hover:text-brand"
            >
                {technology}

                <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-brand transition-transform duration-250 ease-out group-hover:scale-x-100"
                />
            </motion.span>

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
