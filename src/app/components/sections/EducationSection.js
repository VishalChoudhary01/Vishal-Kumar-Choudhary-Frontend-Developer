"use client";

import { useRef, useState } from "react";
import {
    motion,
    useInView,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import useBreakpoint from "@/app/hooks/useBreakpoint";
import EducationHeader from "./education_comp/EducationHeader";
import EducationIntro from "./education_comp/EducationIntro";
import EducationStack from "./education_comp/EducationStack";
import EducationStatic from "./education_comp/EducationStatic";
import EducationHandoff from "./education_comp/EducationHandoff";

import { educationData } from "./education_comp/education.data";
import {
    DEPTH_PROFILES,
    PIN_SCROLL_FACTOR,
    focalIndex,
} from "./education_comp/education.motion";

export default function Education() {
    const reducedMotion = useReducedMotion();

    if (reducedMotion) {
        return <EducationStatic />;
    }

    return <DynamicEducation />;
}

function DynamicEducation() {
    const breakpoint = useBreakpoint();
    const profile =
        DEPTH_PROFILES[breakpoint] ?? DEPTH_PROFILES.desktop;

    const wrapRef = useRef(null);
    const contentRef = useRef(null);
    const lastFocal = useRef(0);

    const [activeIndex, setActiveIndex] = useState(0);

    const contentInView = useInView(contentRef, {
        once: true,
        margin: "-80px 0px",
    });

    const { scrollYProgress } = useScroll({
        target: wrapRef,
        offset: ["start start", "end start"],
    });

    const pinProgress = useTransform(
        scrollYProgress,
        (value) => Math.min(1, value * PIN_SCROLL_FACTOR)
    );

    useMotionValueEvent(pinProgress, "change", (value) => {
        const next = focalIndex(
            value,
            educationData.total
        );

        if (next !== lastFocal.current) {
            lastFocal.current = next;
            setActiveIndex(next);
        }
    });

    return (
        <section
            id="education"
            aria-labelledby="education-heading"
            className="relative bg-background"
        >
            <div
                ref={wrapRef}
                className="relative mx-auto h-[310svh] w-full max-w-7xl px-5 sm:px-8 md:px-10"
            >
                <div className="sticky top-0 h-[100svh] overflow-hidden">
                    <div className="relative z-10 flex h-full flex-col pt-[calc(env(safe-area-inset-top,0px)+64px)] pb-10 md:pt-[84px] md:pb-14">
                        <div className="shrink-0">
                            <EducationHeader
                                pinned
                                headingId="education-heading"
                                headingSize={
                                    breakpoint === "mobile"
                                        ? "default"
                                        : "compact"
                                }
                            />
                        </div>

                        <motion.div
                            ref={contentRef}
                            initial={{
                                opacity: 0,
                                y: 16,
                            }}
                            animate={
                                contentInView
                                    ? {
                                        opacity: 1,
                                        y: 0,
                                    }
                                    : {
                                        opacity: 0,
                                        y: 16,
                                    }
                            }
                            transition={{
                                duration: 0.6,
                                delay: 0.1,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="grid min-h-0 flex-1 grid-cols-1 gap-8 md:grid-cols-[minmax(0,9fr)_minmax(0,17fr)] md:items-stretch md:gap-10 lg:gap-14"
                        >
                            <div className="hidden md:flex md:flex-col md:justify-center">
                                <EducationIntro
                                    activeIndex={activeIndex}
                                />
                            </div>

                            <div className="relative min-h-0">
                                <EducationStack
                                    profile={profile}
                                    pinProgress={pinProgress}
                                />
                            </div>
                        </motion.div>
                    </div>

                    <EducationHandoff progress={pinProgress} />
                </div>
            </div>
        </section>
    );
}