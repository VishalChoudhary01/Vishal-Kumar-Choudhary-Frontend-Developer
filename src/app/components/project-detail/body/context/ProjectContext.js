"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import SectionHeading from "@/app/components/common/SectionHeading";
import Container from "@/app/components/common/Container";
import useReducedMotion from "@/app/hooks/useReducedMotion";
import ProjectContextBody from "./ProjectContextBody";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

export default function ProjectContext({ project }) {
    const reduced = useReducedMotion();
    const sectionRef = useRef(null);

    const isInView = useInView(sectionRef, {
        once: true,
        amount: 0.2,
        margin: "0px 0px -8% 0px",
    });

    const context = project?.story?.context;

    if (!context) {
        return null;
    }

    const statement = context.statement;
    const body = context.body;

    if (!statement && !body) {
        return null;
    }

    const show = reduced || isInView;

    return (
        <section ref={sectionRef} id="project-context" aria-labelledby="project-context-title" className="relative bg-background">
            <Container>
                <div className="grid gap-8 px-5 py-12 sm:gap-10 sm:px-8 sm:py-14 md:px-10 lg:grid-cols-[180px_1fr] lg:gap-16 lg:px-12">
                    <div>
                        <SectionHeading heading="CONTEXT" align="left" />
                    </div>

                    <div> 
                        <SectionHeading
                            supporting={statement || "Why this project existed and what it needed to solve."}
                            supportingId="project-context-title"
                            align="left" 
                            size="compact"
                        />

                        <motion.div initial={reduced ? false : { opacity: 0, y: 24 }} animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={reduced ? { duration: 0 } : { duration: 0.8, delay: 0.18, ease: EASE_EDITORIAL }} className="mt-8 sm:mt-10">
                            {body && <ProjectContextBody body={body} visible={show} reduced={reduced} />}

                            {project?.contribution && (
                                <motion.div
                                    initial={reduced ? false : { opacity: 0, y: 24 }}
                                    animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                                    transition={reduced ? { duration: 0 } : { duration: 0.8, delay: 0.24, ease: EASE_EDITORIAL }}
                                    className="mt-8 max-w-2xl sm:mt-10"
                                >
                                    <p className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-muted">
                                        My contribution
                                    </p>

                                    <p className="font-body text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
                                        {project.contribution}
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </Container>
        </section>
    );
}