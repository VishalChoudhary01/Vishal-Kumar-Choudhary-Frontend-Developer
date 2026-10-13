"use client";

import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

import useUiSound from "@/app/hooks/useUiSound";
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

    // One shared, bounded audio pool for the entire desktop rail.
    const { play: playTechTick } = useUiSound(
        "/mp3/tick-004.mp3",
        {
            volume: 0.16,
            interrupt: false,
            maxVoices: 5,
        },
    );

    // Raw page scroll as a MotionValue.
    const pageScroll = useMotionValue(
        typeof window !== "undefined" ? window.scrollY : 0,
    );

    // Measure the clipping viewport and full technology track.
    useEffect(() => {
        const viewport = viewportRef.current;
        const track = trackRef.current;

        if (!viewport || !track) {
            return undefined;
        }

        const measure = () => {
            setDimensions({
                viewport: viewport.getBoundingClientRect().width,
                track: track.scrollWidth,
            });
        };

        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(viewport);
        observer.observe(track);

        window.addEventListener("resize", measure);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, [technologies]);

    // Update the page scroll MotionValue without React state updates.
    useEffect(() => {
        const updateScroll = () => {
            pageScroll.set(window.scrollY);
        };

        updateScroll();

        window.addEventListener("scroll", updateScroll, {
            passive: true,
        });

        return () => {
            window.removeEventListener("scroll", updateScroll);
        };
    }, [pageScroll]);

    // Calculate the scroll range anchored to the technology viewport.
    useEffect(() => {
        const computeRange = () => {
            const viewport = viewportRef.current;

            if (!viewport) {
                return null;
            }

            const rect = viewport.getBoundingClientRect();
            const absoluteTop = rect.top + window.scrollY;
            const absoluteBottom = rect.bottom + window.scrollY;

            const start =
                absoluteTop - window.innerHeight * 0.8;

            const naturalEnd =
                absoluteBottom - window.innerHeight * 0.2;

            const minimumRange = Math.max(
                window.innerHeight * 0.75,
                500,
            );

            const end = Math.max(
                naturalEnd,
                start + minimumRange,
            );

            return { start, end };
        };

        const updateRange = () => {
            const next = computeRange();

            if (!next) {
                return;
            }

            setRange((previous) =>
                previous.start === next.start &&
                    previous.end === next.end
                    ? previous
                    : next,
            );
        };

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

        window.addEventListener("scroll", schedule, {
            passive: true,
        });
        window.addEventListener("resize", schedule);
        window.addEventListener("orientationchange", schedule);
        window.addEventListener("load", schedule);

        if (document.fonts?.ready) {
            document.fonts.ready.then(schedule);
        }

        return () => {
            if (frame) {
                cancelAnimationFrame(frame);
            }

            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            window.removeEventListener("orientationchange", schedule);
            window.removeEventListener("load", schedule);
        };
    }, [technologies]);

    const travel = Math.max(
        0,
        dimensions.track - dimensions.viewport,
    );

    // Page scroll to normalized 0...1 progress.
    const progress = useTransform(pageScroll, (scroll) => {
        const distance = range.end - range.start;

        if (distance <= 0) {
            return 0;
        }

        const value = (scroll - range.start) / distance;
        return Math.max(0, Math.min(1, value));
    });

    // Translate the track by exactly its overflow.
    const targetX = useTransform(
        progress,
        (value) => -travel * value,
    );

    // Existing spring-driven rail motion.
    const railX = useSpring(
        targetX,
        reducedMotion
            ? {
                stiffness: 1000,
                damping: 100,
                mass: 1,
            }
            : SPRING_CONFIG,
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
                    {/* Center axis */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px -translate-x-1/2 bg-brand/20"
                    />

                    {/* Center optical field */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-28 -translate-x-1/2 bg-gradient-to-r from-transparent via-background/20 to-transparent sm:w-24 sm:via-background/10"
                    />

                    <motion.div
                        ref={trackRef}
                        style={{
                            x: reducedMotion ? 0 : railX,
                        }}
                        className="flex w-max items-center gap-0 px-[50vw] py-8 sm:py-9 md:py-10"
                    >
                        {technologies.map((technology, index) => (
                            <ProjectTechItem
                                key={`${technology}-${index}`}
                                technology={technology}
                                index={index}
                                total={technologies.length}
                                railX={railX}
                                viewportWidth={dimensions.viewport}
                                visible={isInView}
                                reducedMotion={reducedMotion}
                                onCenterCross={playTechTick}
                            />
                        ))}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
