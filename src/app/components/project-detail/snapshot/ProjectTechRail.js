"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { useEffect, useRef, useState } from "react";

import ProjectTechItem from "./ProjectTechItem";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

const SPRING_CONFIG = {
    stiffness: 160,
    damping: 28,
    mass: 0.5,
};

export default function ProjectTechRail({
    technologies,
    isInView,
    reducedMotion,
}) {
    const sectionRef = useRef(null);
    const viewportRef = useRef(null);
    const trackRef = useRef(null);

    const [dimensions, setDimensions] = useState({
        viewport: 0,
        track: 0,
    });

    const [range, setRange] = useState({
        start: 0,
        end: 0,
    });

    /*
     * ---------------------------------------------------------
     * RAW PAGE SCROLL
     * ---------------------------------------------------------
     *
     * We use a MotionValue so the rail can update directly from
     * the browser scroll position.
     */
    const pageScroll = useMotionValue(
        typeof window !== "undefined"
            ? window.scrollY
            : 0
    );

    /*
     * ---------------------------------------------------------
     * MEASURE TRACK
     * ---------------------------------------------------------
     */
    useEffect(() => {
        const viewport = viewportRef.current;
        const track = trackRef.current;

        if (!viewport || !track) {
            return;
        }

        const measure = () => {
            setDimensions({
                viewport:
                    viewport.getBoundingClientRect()
                        .width,

                track: track.scrollWidth,
            });
        };

        measure();

        const observer =
            new ResizeObserver(measure);

        observer.observe(viewport);
        observer.observe(track);

        window.addEventListener(
            "resize",
            measure
        );

        return () => {
            observer.disconnect();

            window.removeEventListener(
                "resize",
                measure
            );
        };
    }, [technologies]);

    /*
     * ---------------------------------------------------------
     * UPDATE PAGE SCROLL MOTION VALUE
     * ---------------------------------------------------------
     */
    useEffect(() => {
        const updateScroll = () => {
            pageScroll.set(window.scrollY);
        };

        updateScroll();

        window.addEventListener(
            "scroll",
            updateScroll,
            {
                passive: true,
            }
        );

        return () => {
            window.removeEventListener(
                "scroll",
                updateScroll
            );
        };
    }, [pageScroll]);

    /*
     * ---------------------------------------------------------
     * CALCULATE RAIL SCROLL RANGE
     * ---------------------------------------------------------
     */
    useEffect(() => {
        const computeRange = () => {
            const viewport = viewportRef.current;

            if (!viewport) {
                return null;
            }

            const rect =
                viewport.getBoundingClientRect();

            const absoluteTop =
                rect.top + window.scrollY;

            const absoluteBottom =
                rect.bottom + window.scrollY;

            /*
             * ANCHORED ON THE TECHNOLOGY VIEWPORT, NOT THE SECTION.
             *
             * The Snapshot heading establishes the section first.
             * Tying the range to the rail itself keeps the track
             * at its initial position while the heading is being
             * read, and only starts the horizontal travel once the
             * technology viewport is approaching the screen.
             */
            const start =
                absoluteTop -
                window.innerHeight * 0.8;

            /*
             * Finish while the rail is still on screen: the range
             * ends when the rail's bottom reaches 20% from the top
             * of the viewport, so the final technology reaches the
             * focal zone before the section scrolls away instead
             * of finishing its travel off-screen.
             */
            const naturalEnd =
                absoluteBottom -
                window.innerHeight * 0.2;

            /*
             * Guard for unusually short windows, where the
             * natural interval would move the rail too fast per
             * scroll pixel.
             */
            const minimumRange = Math.max(
                window.innerHeight * 0.75,
                500
            );

            const end = Math.max(
                naturalEnd,
                start + minimumRange
            );

            return { start, end };
        };

        const updateRange = () => {
            const next = computeRange();

            if (!next) {
                return;
            }

            /*
             * Only commit when the range actually moved, so plain
             * scrolling never re-renders this subtree.
             */
            setRange((previous) =>
                previous.start === next.start &&
                previous.end === next.end
                    ? previous
                    : next
            );
        };

        /*
         * MEASURING ONLY ON MOUNT IS NOT ENOUGH.
         *
         * The rail's document position can change after mount:
         * the hero entrance transform, the font swap and lazy
         * content above all shift it. Mount-time values left
         * `start` hundreds of pixels off, so the rail began
         * responding at the wrong point in the page scroll.
         *
         * Re-measure whenever the page scrolls, coalesced to one
         * measurement per animation frame. The equality guard
         * above keeps this effectively free during normal
         * scrolling.
         */
        let frame = 0;

        const schedule = () => {
            if (frame) {
                return;
            }

            frame = requestAnimationFrame(() => {
                frame = 0;
                updateRange();
            });
        };

        updateRange();

        window.addEventListener(
            "scroll",
            schedule,
            {
                passive: true,
            }
        );

        window.addEventListener("resize", schedule);

        window.addEventListener(
            "orientationchange",
            schedule
        );

        window.addEventListener("load", schedule);

        if (document.fonts?.ready) {
            document.fonts.ready.then(schedule);
        }

        return () => {
            if (frame) {
                cancelAnimationFrame(frame);
            }

            window.removeEventListener(
                "scroll",
                schedule
            );

            window.removeEventListener(
                "resize",
                schedule
            );

            window.removeEventListener(
                "orientationchange",
                schedule
            );

            window.removeEventListener("load", schedule);
        };
    }, [technologies]);

    /*
     * ---------------------------------------------------------
     * HORIZONTAL TRAVEL
     * ---------------------------------------------------------
     */
    const travel = Math.max(
        0,
        dimensions.track -
        dimensions.viewport
    );

    /*
     * ---------------------------------------------------------
     * PAGE SCROLL → 0...1
     * ---------------------------------------------------------
     */
    const progress = useTransform(
        pageScroll,
        (scroll) => {
            const distance =
                range.end -
                range.start;

            if (distance <= 0) {
                return 0;
            }

            const value =
                (scroll - range.start) /
                distance;

            return Math.max(
                0,
                Math.min(1, value)
            );
        }
    );

    /*
     * ---------------------------------------------------------
     * PROGRESS → HORIZONTAL POSITION
     * ---------------------------------------------------------
     */
    const targetX = useTransform(
        progress,
        (value) => {
            /*
             * Travel exactly the overflow of the track.
             *
             * The track carries px-[50vw] padding at both ends, so
             * landing on `-travel` frames the final item against the
             * center optical field. Anything past `-travel` (the old
             * mobile 1.2x multiplier) scrolls the last item off the
             * left edge and leaves the rail empty at the end of the
             * range.
             */
            return -travel * value;
        }
    );

    /*
     * ---------------------------------------------------------
     * PHYSICAL SPRING
     * ---------------------------------------------------------
     */
    const railX = useSpring(
        targetX,
        reducedMotion
            ? {
                stiffness: 1000,
                damping: 100,
                mass: 1,
            }
            : SPRING_CONFIG
    );

    return (
        <div
            ref={sectionRef}
            className="relative mt-8 sm:mt-10 md:mt-12"
        >
            <motion.div
                initial={
                    reducedMotion
                        ? false
                        : {
                            opacity: 0,
                            y: 20,
                        }
                }
                animate={
                    reducedMotion || isInView
                        ? {
                            opacity: 1,
                            y: 0,
                        }
                        : {
                            opacity: 0,
                            y: 20,
                        }
                }
                transition={
                    reducedMotion
                        ? {
                            duration: 0,
                        }
                        : {
                            duration: 0.75,
                            delay: 0.12,
                            ease: EASE_EDITORIAL,
                        }
                }
            >
                <div
                    ref={viewportRef}
                    className="relative overflow-hidden border-b border-border"
                >
                    {/* CENTER AXIS */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px -translate-x-1/2 bg-brand/20"
                    />

                    {/* CENTER OPTICAL FIELD */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-28 -translate-x-1/2 bg-gradient-to-r from-transparent via-background/20 to-transparent sm:w-24 sm:via-background/10"
                    />

                    <motion.div
                        ref={trackRef}
                        style={{
                            x: reducedMotion
                                ? 0
                                : railX,
                        }}
                        className="flex w-max items-center gap-0 px-[50vw] py-8 sm:py-9 md:py-10"
                    >
                        {technologies.map(
                            (technology, index) => (
                                <ProjectTechItem
                                    key={`${technology}-${index}`}
                                    technology={technology}
                                    index={index}
                                    total={
                                        technologies.length
                                    }
                                    railX={railX}
                                    viewportWidth={
                                        dimensions.viewport
                                    }
                                    visible={isInView}
                                    reducedMotion={
                                        reducedMotion
                                    }
                                />
                            )
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}