"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import Container from "@/app/components/common/Container";
import useReducedMotion from "@/app/hooks/useReducedMotion";
import ProjectNavigationItem from "./ProjectNavigationItem";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

export default function ProjectNavigation({ prevProject, nextProject }) {
    const reduced = useReducedMotion();
    const sectionRef = useRef(null);

    const isInView = useInView(sectionRef, {
        once: true,
        amount: 0.2,
        margin: "0px 0px -8% 0px",
    });

    if (!prevProject && !nextProject) return null;

    const show = reduced || isInView;

    return (
        <section ref={sectionRef} id="project-navigation" aria-label="Project navigation" className="bg-background">
            <Container>
                <div className="px-5 py-16 sm:px-8 sm:py-20 md:px-10 md:py-24 lg:px-12">
                    <div className="mb-6 flex items-center gap-4 sm:mb-8">
                        <span className="h-px w-9 bg-brand" />
                        <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-text-muted sm:text-xs">
                            Continue exploring
                        </p>
                    </div>

                    <div className="border-y border-border">
                        <div className="grid grid-cols-2 border-y border-border">
                            {prevProject && (
                                <motion.div
                                    initial={reduced ? false : { opacity: 0, x: -12 }}
                                    animate={show ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                                    transition={reduced ? { duration: 0 } : { duration: 0.55, ease: EASE_EDITORIAL }}
                                    className={nextProject ? "pr-4 md:border-r md:border-border md:pr-6 lg:pr-8" : "col-span-2"}
                                >
                                    <ProjectNavigationItem project={prevProject} direction="previous" />
                                </motion.div>
                            )}

                            {nextProject && (
                                <motion.div
                                    initial={reduced ? false : { opacity: 0, x: 12 }}
                                    animate={show ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
                                    transition={reduced ? { duration: 0 } : { duration: 0.55, delay: 0.05, ease: EASE_EDITORIAL }}
                                    className={prevProject ? "pl-4 md:pl-6 lg:pl-8" : "col-span-2"}
                                >
                                    <ProjectNavigationItem project={nextProject} direction="next" />
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}