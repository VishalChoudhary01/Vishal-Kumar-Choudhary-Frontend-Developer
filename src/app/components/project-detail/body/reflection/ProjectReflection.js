"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import SectionHeading from "@/app/components/common/SectionHeading";
import Container from "@/app/components/common/Container";
import useReducedMotion from "@/app/hooks/useReducedMotion";
import ProjectReflectionWorked from "./ProjectReflectionWorked";
import ProjectReflectionImprove from "./ProjectReflectionImprove";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

export default function ProjectReflection({ project }) {
    const reduced = useReducedMotion();
    const sectionRef = useRef(null);

    const isInView = useInView(sectionRef, {
        once: true,
        amount: 0.2,
        margin: "0px 0px -8% 0px",
    });

    const reflection = project?.story?.reflection;

    if (!reflection) return null;

    const statement = reflection.statement;
    const worked = Array.isArray(reflection.worked) ? reflection.worked : [];
    const improve = reflection.improve;

    if (!statement && !worked.length && !improve) return null;

    const show = reduced || isInView;

    return (
        <section ref={sectionRef} id="project-reflection" aria-labelledby="project-reflection-title" className="relative bg-background">
            <Container>
                <div className="grid gap-10 px-5 py-28 sm:px-8 sm:py-36 md:gap-14 md:px-10 lg:grid-cols-[180px_1fr] lg:gap-16 lg:px-12 lg:py-44">
                    <div>
                        <SectionHeading heading="REFLECTION" align="left" />
                    </div>

                    <div>
                        <SectionHeading supporting={statement || "What held up, what could be better, and what I would carry forward."} supportingId="project-reflection-title" align="left" />

                        <motion.div
                            initial={reduced ? false : { opacity: 0, y: 24 }}
                            animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                            transition={reduced ? { duration: 0 } : { duration: 0.8, delay: 0.18, ease: EASE_EDITORIAL }}
                            className="mt-12 sm:mt-14 md:mt-16"
                        >
                            {worked.length > 0 && <ProjectReflectionWorked items={worked} visible={show} reduced={reduced} />}

                            {improve && <ProjectReflectionImprove improve={improve} visible={show} reduced={reduced} />}
                        </motion.div>
                    </div>
                </div>
            </Container>
        </section>
    );
}