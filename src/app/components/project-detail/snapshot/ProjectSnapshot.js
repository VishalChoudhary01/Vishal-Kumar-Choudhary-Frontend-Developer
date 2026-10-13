"use client";

import { useRef, useSyncExternalStore } from "react";
import { useInView } from "motion/react";

import SectionHeading from "@/app/components/common/SectionHeading";
import Container from "@/app/components/common/Container";

import useReducedMotion from "@/app/hooks/useReducedMotion";

import ProjectTechRail from "./ProjectTechRail";
import ProjectTechMobile from "./ProjectTechMobile";

/*
 * ---------------------------------------------------------
 * RESPONSIVE STRATEGY
 * ---------------------------------------------------------
 *
 * Desktop keeps the horizontal optical rail.
 *
 * Below the project's 768px breakpoint there is not enough
 * width to make a premium focal composition out of
 * `React · Vite · Tailwind · Redux`, so mobile renders a
 * vertical kinetic list instead: the page's normal vertical
 * scroll drives which technology is in focus.
 */
const MOBILE_QUERY = "(max-width: 767px)";

function subscribeToMobile(callback) {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);

    mediaQuery.addEventListener("change", callback);

    return () => {
        mediaQuery.removeEventListener("change", callback);
    };
}

function getMobileSnapshot() {
    return window.matchMedia(MOBILE_QUERY).matches;
}

function getServerMobileSnapshot() {
    /*
     * Server renders the desktop rail; the client switches to the
     * vertical list right after hydration without a mismatch.
     */
    return false;
}

export default function ProjectSnapshot({ project }) {
    const reducedMotion = useReducedMotion();
    const sectionRef = useRef(null);

    const isMobile = useSyncExternalStore(
        subscribeToMobile,
        getMobileSnapshot,
        getServerMobileSnapshot
    );

    const isInView = useInView(sectionRef, {
        once: true,
        amount: 0.2,
        margin: "0px 0px -8% 0px",
    });

    const technologies = project?.technologies ?? [];

    if (!technologies.length) {
        return null;
    }

    return (
        <section
            ref={sectionRef}
            id="project-snapshot"
            aria-label="Project technology stack"
            className="relative isolate overflow-hidden bg-background"
        >
            <Container>
                <div
                    className="grid gap-8 px-5 py-12 sm:gap-10 sm:px-8 sm:py-14 md:px-10 md:py-16 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:py-20"
                >
                    {/* Section eyebrow */}
                    <div>
                        <SectionHeading
                            label="TECHNOLOGY"
                            align="left"
                        />
                    </div>

                    {/*
                        Section content

                        min-w-0 is REQUIRED. Below lg this grid is a single
                        implicit `auto` column, so the default
                        `min-width: auto` of a grid item lets the column
                        grow to the tech rail's max-content width (the
                        track is w-max + whitespace-nowrap). The rail's
                        clipping viewport then becomes exactly as wide as
                        the track, `track - viewport` collapses to 0 and
                        the rail never moves. min-w-0 keeps the column at
                        the container width so the track overflows and
                        scrolls.
                    */}
                    <div className="min-w-0">
                        <SectionHeading
                            supporting="The work, reduced to what matters."
                            supportingId="project-snapshot-title"
                            align="left"
                        />

                        {isMobile ? (
                            <ProjectTechMobile
                                technologies={technologies}
                                reducedMotion={reducedMotion}
                            />
                        ) : (
                            <ProjectTechRail
                                technologies={technologies}
                                isInView={isInView}
                                reducedMotion={reducedMotion}
                            />
                        )}
                    </div>
                </div>
            </Container>
        </section>
    );
}