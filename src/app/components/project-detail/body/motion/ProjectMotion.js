"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import SectionHeading from "@/app/components/common/SectionHeading";
import Container from "@/app/components/common/Container";
import useReducedMotion from "@/app/hooks/useReducedMotion";
import ProjectMotionList from "./ProjectMotionList";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

export default function ProjectMotion({ project }) {
    const reduced = useReducedMotion();
    const sectionRef = useRef(null);

    const isInView = useInView(sectionRef, {
        once: true,
        amount: 0.2,
        margin: "0px 0px -8% 0px",
    });

    const motionStory = project?.story?.motion;

    if (!motionStory) {
        return null;
    }

    const show = reduced || isInView;

    return (
        <section
            ref={sectionRef}
            id="project-motion"
            aria-labelledby="project-motion-title"
            className="relative bg-background"
        >
            <Container>
                <div className="grid gap-8 px-5 py-12 sm:gap-10 sm:px-8 sm:py-14 md:px-10 lg:grid-cols-[180px_1fr] lg:gap-16 lg:px-12">
                    <div>
                        <SectionHeading label="MOTION" align="left" />
                    </div>

                    <div>
                        <SectionHeading
                            supporting={
                                motionStory.statement ||
                                "Interaction that supports the interface without competing with the core task."
                            }
                            supportingId="project-motion-title"
                            align="left"
                            size="compact"
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
                                        duration: 0.8,
                                        delay: 0.18,
                                        ease: EASE_EDITORIAL,
                                    }
                            }
                            className="mt-8 sm:mt-10"
                        >
                            <ProjectMotionList
                                motion={motionStory}
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