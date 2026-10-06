"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, } from "motion/react";

import SectionHeading from "@/app/components/common/SectionHeading";
import useBreakpoint from "@/app/hooks/useBreakpoint";
import useReducedMotion from "@/app/hooks/useReducedMotion";
import { portfolio } from "@/app/data/portfolio";

import ExperienceCompanyHeader from "./experience_comp/ExperienceCompanyHeader";
import ExperienceCompanySelector from "./experience_comp/ExperienceCompanySelector";
import ExperienceDetailTabs from "./experience_comp/ExperienceDetailTabs";
import ExperienceTabContent from "./experience_comp/ExperienceTabContent";
import ExperienceMetadata from "./experience_comp/ExperienceMetadata";
import ExperienceDesktopWatermark from "./experience_comp/ExperienceDesktopWatermark";
import ExperienceMobileWatermark from "./experience_comp/ExperienceMobileWatermark";

import { EASE, TAB_LABELS, } from "./experience_comp/experience.constants";

export default function ExperienceSection() {
    const reducedMotion = useReducedMotion();
    const breakpoint = useBreakpoint();

    const isMobile = breakpoint === "mobile";

    const sectionRef = useRef(null);
    const contentRef = useRef(null);

    const contentInView = useInView(
        contentRef,
        {
            once: true,
            margin: "-80px 0px",
        }
    );

    const backdropOpacity = useMotionValue(0);

    const [activeIndex, setActiveIndex] =
        useState(0);

    const [activeTab, setActiveTab] =
        useState("Overview");

    const experiences = portfolio.experience;

    const active = experiences[activeIndex];

    const tabs = TAB_LABELS.filter(
        (tab) =>
            tab !== "Impact" ||
            (active.impact &&
                active.impact.length > 0)
    );

    const selectCompany = (index) => {
        setActiveIndex(index);
        setActiveTab("Overview");
    };

    const companyPanel = (
        <div className="relative">
            <ExperienceCompanyHeader
                experience={active}
            />
        </div>
    );

    return (
        <section
            ref={sectionRef}
            id="experience"
            className="relative bg-background px-5 py-28 sm:px-8 sm:py-36 md:px-10 lg:py-44"
        >
            <div className="relative z-10 mx-auto max-w-7xl">
                <div className="grid gap-10 md:gap-14 lg:grid-cols-[180px_1fr] lg:gap-16">
                    {/* Section heading */}
                    <div>
                        <SectionHeading
                            label="EXPERIENCE"
                            align="left"
                            number={"05"}
                        />
                    </div>

                    {/* Experience content */}
                    <div>
                        {/* Supporting heading + desktop watermark */}
                        <div className="relative isolate">
                            <SectionHeading
                                supporting="Where I've applied my craft."
                                align="left"
                                size="compact"
                            />

                            {!isMobile && (
                                <ExperienceDesktopWatermark
                                    experience={active}
                                    breakpoint={breakpoint}
                                    reducedMotion={
                                        reducedMotion
                                    }
                                />
                            )}
                        </div>

                        {/* Main experience grid */}
                        <motion.div
                            ref={contentRef}
                            initial={
                                reducedMotion
                                    ? false
                                    : {
                                        opacity: 0,
                                        y: 16,
                                    }
                            }
                            animate={
                                reducedMotion ||
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
                                ease: EASE,
                            }}
                            className="mt-10 grid gap-10 md:mt-12 md:grid-cols-[0.28fr_0.72fr] md:gap-12 lg:grid-cols-[0.32fr_0.68fr] lg:gap-16"
                        >
                            {/* Company navigation */}
                            <ExperienceCompanySelector
                                experiences={
                                    experiences
                                }
                                activeIndex={
                                    activeIndex
                                }
                                onSelect={
                                    selectCompany
                                }
                            />

                            {/* Company details */}
                            <div className="flex flex-col">
                                {/* Company header */}
                                {reducedMotion ? (
                                    companyPanel
                                ) : (
                                    <AnimatePresence
                                        mode="wait"
                                        initial={false}
                                    >
                                        <motion.div
                                            key={
                                                active.id
                                            }
                                            initial={{
                                                opacity: 0,
                                                y: isMobile
                                                    ? 10
                                                    : 14,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: isMobile
                                                    ? -5
                                                    : -6,
                                            }}
                                            transition={{
                                                duration:
                                                    isMobile
                                                        ? 0.45
                                                        : 0.55,
                                                ease: EASE,
                                            }}
                                            className="relative"
                                        >
                                            {companyPanel}
                                        </motion.div>
                                    </AnimatePresence>
                                )}

                                {/* Detail tabs */}
                                <div className="mt-6 md:mt-8">
                                    <ExperienceDetailTabs
                                        tabs={tabs}
                                        activeTab={
                                            activeTab
                                        }
                                        onSelect={
                                            setActiveTab
                                        }
                                        reducedMotion={
                                            reducedMotion
                                        }
                                    />
                                </div>

                                {/* Tab content */}
                                <div className="pt-6 md:pt-8">
                                    {reducedMotion ? (
                                        <div
                                            key={`${active.id}-${activeTab}`}
                                            className="min-h-[120px]"
                                        >
                                            <ExperienceTabContent
                                                experience={
                                                    active
                                                }
                                                activeTab={
                                                    activeTab
                                                }
                                            />
                                        </div>
                                    ) : (
                                        <AnimatePresence
                                            mode="wait"
                                            initial={false}
                                        >
                                            <motion.div
                                                key={`${active.id}-${activeTab}`}
                                                initial={{
                                                    opacity: 0,
                                                    y: isMobile
                                                        ? 6
                                                        : 8,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    y: isMobile
                                                        ? -4
                                                        : -6,
                                                }}
                                                transition={{
                                                    duration:
                                                        isMobile
                                                            ? 0.3
                                                            : 0.4,
                                                    ease: EASE,
                                                }}
                                                className="min-h-[120px]"
                                            >
                                                <ExperienceTabContent
                                                    experience={
                                                        active
                                                    }
                                                    activeTab={
                                                        activeTab
                                                    }
                                                />
                                            </motion.div>
                                        </AnimatePresence>
                                    )}
                                </div>

                                {/* Metadata */}
                                <ExperienceMetadata
                                    metadata={
                                        active.metadata
                                    }
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Mobile fixed watermark */}
            {isMobile && (
                <ExperienceMobileWatermark
                    experience={active}
                    breakpoint={breakpoint}
                    reducedMotion={
                        reducedMotion
                    }
                    sectionRef={sectionRef}
                    backdropOpacity={
                        backdropOpacity
                    }
                />
            )}
        </section>
    );
}