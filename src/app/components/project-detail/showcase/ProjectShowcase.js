"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import SectionHeading from "@/app/components/common/SectionHeading";
import Container from "@/app/components/common/Container";
import useReducedMotion from "@/app/hooks/useReducedMotion";
import ProjectShowcaseGrid from "./ProjectShowcaseGrid";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

export default function ProjectShowcase({ project }) {
    const reduced = useReducedMotion();
    const sectionRef = useRef(null);

    const isInView = useInView(sectionRef, {
        once: true,
        amount: 0.12,
        margin: "0px 0px -8% 0px",
    });

    const showcase = project?.story?.showcase;

    if (!Array.isArray(showcase) || !showcase.length) {
        return null;
    }

    const show = reduced || isInView;

    return (
        <section
            ref={sectionRef}
            id="project-showcase"
            aria-labelledby="project-showcase-title"
            className="relative bg-background"
        >
            <Container>
                <div className="grid gap-10 px-5 py-16 sm:px-8 sm:py-24 md:gap-14 md:px-10 lg:grid-cols-[180px_1fr] lg:gap-16 lg:px-12 lg:py-28">
                    <div>
                        <SectionHeading heading="SHOWCASE" align="left" />
                    </div>

                    <div>
                        <SectionHeading
                            supporting="The interface, captured in the details that matter."
                            supportingId="project-showcase-title"
                            align="left"
                        />

                        <motion.div
                            initial={
                                reduced
                                    ? false
                                    : { opacity: 0, y: 24 }
                            }
                            animate={
                                show
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: 0, y: 24 }
                            }
                            transition={
                                reduced
                                    ? { duration: 0 }
                                    : {
                                        duration: 0.9,
                                        delay: 0.18,
                                        ease: EASE_EDITORIAL,
                                    }
                            }
                            className="mt-8 sm:mt-10 md:mt-12"
                        >
                            <ProjectShowcaseGrid
                                items={showcase}
                                visible={show}
                                reduced={reduced}
                            />
                        </motion.div>
                    </div>
                </div>
            </Container>
        </section>
    );
}