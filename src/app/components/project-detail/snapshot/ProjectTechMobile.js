"use client";

import {
    motion,
    useMotionValue,
    useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";

import useUiSound from "@/app/hooks/useUiSound";

const FOCAL_RADIUS = 200;
const FADE_RADIUS = 320;
const FOCAL_SCALE = 1.08;
const DISTANT_SCALE = 0.95;
const DISTANT_OPACITY = 0.5;

const smoothstep = (progress) =>
    progress * progress * (3 - 2 * progress);

function ProjectTechMobileItem({
    technology,
    tick,
    reducedMotion,
    onCenterCross,
}) {
    const itemRef = useRef(null);
    const previousOffsetRef = useRef(null);
    const distance = useMotionValue(0);

    /*
     * Calculate vertical distance from viewport center.
     * The shared parent tick emits once per scroll frame.
     */
    useEffect(() => {
        const item = itemRef.current;

        if (!item) {
            return undefined;
        }

        const update = (detectCrossing = false) => {
            const rect = item.getBoundingClientRect();
            const itemCenter = rect.top + rect.height / 2;
            const viewportCenter = window.innerHeight / 2;
            const nextOffset = itemCenter - viewportCenter;
            const previousOffset = previousOffsetRef.current;

            const crossedCenter =
                previousOffset !== null &&
                (
                    (previousOffset > 0 && nextOffset <= 0) ||
                    (previousOffset < 0 && nextOffset >= 0)
                );

            previousOffsetRef.current = nextOffset;
            distance.set(Math.abs(nextOffset));

            if (detectCrossing && crossedCenter) {
                onCenterCross?.();
            }
        };

        // Initial measuring must not play a sound.
        update(false);

        const handleScrollTick = () => update(true);
        const handleResize = () => update(false);

        const unsubscribe = tick.on(
            "change",
            handleScrollTick,
        );

        window.addEventListener("resize", handleResize);

        return () => {
            unsubscribe();
            window.removeEventListener("resize", handleResize);
        };
    }, [tick, distance, onCenterCross]);

    const scale = useTransform(distance, (value) => {
        const progress = Math.min(value / FOCAL_RADIUS, 1);

        return (
            FOCAL_SCALE -
            smoothstep(progress) *
            (FOCAL_SCALE - DISTANT_SCALE)
        );
    });

    const opacity = useTransform(distance, (value) => {
        const progress = Math.min(value / FADE_RADIUS, 1);

        return (
            1 -
            smoothstep(progress) *
            (1 - DISTANT_OPACITY)
        );
    });

    return (
        <motion.li
            ref={itemRef}
            style={{
                scale: reducedMotion ? 1 : scale,
                opacity: reducedMotion ? 1 : opacity,
            }}
            className="whitespace-nowrap py-4 font-body text-[1rem] leading-none tracking-[-0.015em] text-text-primary will-change-transform sm:py-5 sm:text-[1.05rem]"
        >
            {technology}
        </motion.li>
    );
}

/*
 * Mobile keeps normal vertical page scrolling.
 * An item plays one tick when its center crosses the viewport center.
 */
export default function ProjectTechMobile({
    technologies,
    reducedMotion,
}) {
    const tick = useMotionValue(0);

    // One bounded pool shared by every mobile technology item.
    const { play: playTechTick } = useUiSound(
        "/mp3/tick-004.mp3",
        {
            volume: 0.16,
            interrupt: false,
            maxVoices: 5,
        },
    );

    /*
     * Publish one rAF-coalesced tick per scroll frame.
     * No startup tick or resize tick: those must not play sounds.
     */
    useEffect(() => {
        let frame = 0;

        const update = () => {
            frame = 0;
            tick.set(tick.get() + 1);
        };

        const schedule = () => {
            if (frame) {
                return;
            }

            frame = requestAnimationFrame(update);
        };

        window.addEventListener("scroll", schedule, {
            passive: true,
        });

        return () => {
            if (frame) {
                cancelAnimationFrame(frame);
            }

            window.removeEventListener("scroll", schedule);
        };
    }, [tick]);

    return (
        <ul className="flex flex-col items-center pt-2 pb-4 text-center">
            {technologies.map((technology, index) => (
                <ProjectTechMobileItem
                    key={`${technology}-${index}`}
                    technology={technology}
                    tick={tick}
                    reducedMotion={reducedMotion}
                    onCenterCross={playTechTick}
                />
            ))}
        </ul>
    );
}
