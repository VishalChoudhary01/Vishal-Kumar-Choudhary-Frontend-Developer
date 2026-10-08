"use client";

import { motion } from "motion/react";
import SectionHeading from "@/app/components/common/SectionHeading";
import Container from "@/app/components/common/Container";
import useReducedMotion from "@/app/hooks/useReducedMotion";
import { projectItemReveal } from "@/app/lib/motion/projectPresets";
import ProjectContextBody from "./ProjectContextBody";

export default function ProjectContext({ project }) {
    const reduced = useReducedMotion();

    const context = project?.story?.context;

    if (!context) {
        return null;
    }

    const statement = context.statement;
    const body = context.body;

    if (!statement && !body) {
        return null;
    }

    return (
        <section id="project-context" aria-labelledby="project-context-title" className="relative overflow-x-clip bg-background">
            <Container>
                <div className="grid gap-8 px-5 py-12 sm:gap-10 sm:px-8 sm:py-14 md:px-10 lg:grid-cols-[180px_1fr] lg:gap-16 lg:px-12">
                    <div>
                        <SectionHeading label="CONTEXT" align="left" />
                    </div>

                    <div> 
                        <SectionHeading
                            supporting={statement || "Why this project existed and what it needed to solve."}
                            supportingId="project-context-title"
                            align="left"  />

                        <div className="mt-8 sm:mt-10">
                            {body && <ProjectContextBody body={body} reduced={reduced} />}

                            {project?.contribution && (
                                <motion.div
                                    {...projectItemReveal(0, reduced)}
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
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
