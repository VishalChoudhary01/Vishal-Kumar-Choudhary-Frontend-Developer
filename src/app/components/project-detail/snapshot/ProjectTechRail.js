"use client";

import {
    motion,
    useScroll,
    useSpring,
    useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

import ProjectTechItem from "./ProjectTechItem";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

const SPRING_CONFIG = {
    stiffness: 150,
    damping: 26,
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

    const [scrollRange, setScrollRange] = useState({
        start: 0,
        end: 1,
    });

    /*
     * ---------------------------------------------------------
     * GLOBAL PAGE SCROLL
     * ---------------------------------------------------------
     *
     * Do NOT use the short rail section as the useScroll target.
     *
     * Mobile browsers are much more reliable when the horizontal
     * movement is derived from the actual document scroll position.
     */
    const { scrollY } = useScroll();

    /*
     * ---------------------------------------------------------
     * MEASURE RAIL
     * ---------------------------------------------------------
     */
    useEffect(() => {
        const viewport = viewportRef.current;
        const track = trackRef.current;

        if (!viewport || !track) {
            return;
        }

        const updateMeasurements = () => {
            const viewportWidth =
                viewport.getBoundingClientRect().width;

            const trackWidth =
                track.scrollWidth;

            setDimensions({
                viewport: viewportWidth,
                track: trackWidth,
            });
        };

        updateMeasurements();

        const resizeObserver =
            new ResizeObserver(updateMeasurements);

        resizeObserver.observe(viewport);
        resizeObserver.observe(track);

        window.addEventListener(
            "resize",
            updateMeasurements
        );

        return () => {
            resizeObserver.disconnect();

            window.removeEventListener(
                "resize",
                updateMeasurements
            );
        };
    }, [technologies]);

    /*
     * ---------------------------------------------------------
     * MEASURE PAGE SCROLL RANGE
     * ---------------------------------------------------------
     *
     * We explicitly calculate where this rail should start and
     * finish responding to the page scroll.
     *
     * This avoids depending on:
     *
     *     offset: ["start 90%", "end 10%"]
     *
     * which is too dependent on the height of this small section.
     */
    useEffect(() => {
        const updateScrollRange = () => {
            const section = sectionRef.current;

            if (!section) {
                return;
            }

            const rect =
                section.getBoundingClientRect();

            const pageScroll =
                window.scrollY;

            const sectionTop =
                rect.top + pageScroll;

            const sectionBottom =
                rect.bottom + pageScroll;

            /*
             * Start when the rail is approaching the viewport.
             */
            const start =
                sectionTop -
                window.innerHeight * 0.9;

            /*
             * Finish after the rail has moved through the
             * viewport.
             */
            const end =
                sectionBottom -
                window.innerHeight * 0.1;

            /*
             * Ensure there is ALWAYS a useful scroll range.
             *
             * This is particularly important on mobile where
             * the section can be very short.
             */
            const minimumRange =
                Math.max(
                    window.innerHeight * 0.9,
                    500
                );

            setScrollRange({
                start,
                end: Math.max(
                    end,
                    start + minimumRange
                ),
            });
        };

        updateScrollRange();

        window.addEventListener(
            "resize",
            updateScrollRange
        );

        window.addEventListener(
            "orientationchange",
            updateScrollRange
        );

        return () => {
            window.removeEventListener(
                "resize",
                updateScrollRange
            );

            window.removeEventListener(
                "orientationchange",
                updateScrollRange
            );
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
     * PAGE SCROLL → RAIL PROGRESS
     * ---------------------------------------------------------
     *
     * This is the important part.
     *
     * We directly convert document scrollY into a 0 → 1
     * progress value.
     */
    const progress = useTransform(
        scrollY,
        (latestScrollY) => {
            const range =
                scrollRange.end -
                scrollRange.start;

            if (range <= 0) {
                return 0;
            }

            const raw =
                (latestScrollY -
                    scrollRange.start) /
                range;

            return Math.min(
                1,
                Math.max(0, raw)
            );
        }
    );

    /*
     * ---------------------------------------------------------
     * PROGRESS → HORIZONTAL POSITION
     * ---------------------------------------------------------
     *
     * Mobile gets a little more travel.
     *
     * This creates the feeling that the technology rail is
     * moving faster than the page itself.
     */
    const targetX = useTransform(
        progress,
        (value) => {
            const mobile =
                dimensions.viewport > 0 &&
                dimensions.viewport < 768;

            const multiplier = mobile
                ? 1.2
                : 1;

            return (
                -travel *
                value *
                multiplier
            );
        }
    );

    /*
     * ---------------------------------------------------------
     * PHYSICAL INERTIA
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
            className="
                relative
                mt-8

                sm:mt-10

                md:mt-12
            "
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
                    className="
                        relative
                        overflow-hidden
                        border-b
                        border-border
                    "
                >
                    {/* Center optical axis */}
                    <div
                        aria-hidden="true"
                        className="
                            pointer-events-none
                            absolute
                            inset-y-0
                            left-1/2
                            z-20
                            w-px
                            -translate-x-1/2
                            bg-brand/20
                        "
                    />

                    {/* Optical focus */}
                    <div
                        aria-hidden="true"
                        className="
                            pointer-events-none
                            absolute
                            inset-y-0
                            left-1/2
                            z-10
                            w-28
                            -translate-x-1/2
                            bg-gradient-to-r
                            from-transparent
                            via-background/20
                            to-transparent

                            sm:w-24
                            sm:via-background/10
                        "
                    />

                    <motion.div
                        ref={trackRef}
                        style={{
                            x: reducedMotion
                                ? 0
                                : railX,
                        }}
                        className="
                            flex
                            w-max
                            items-center
                            gap-0
                            px-[50vw]
                            py-8

                            sm:py-9

                            md:py-10
                        "
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