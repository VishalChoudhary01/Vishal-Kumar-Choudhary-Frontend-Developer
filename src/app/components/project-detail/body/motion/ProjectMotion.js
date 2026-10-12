"use client";

import SectionHeading from "@/app/components/common/SectionHeading";
import Container from "@/app/components/common/Container";
import useReducedMotion from "@/app/hooks/useReducedMotion";
import ProjectMotionList from "./ProjectMotionList";

export default function ProjectMotion({ project }) {
    const reduced = useReducedMotion();

    const motionStory = project?.story?.motion;

    if (!motionStory) {
        return null;
    }

    return (
        <section
            id="project-motion"
            aria-labelledby="project-motion-title"
            className="relative overflow-x-clip bg-background"
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

                        <div className="mt-8 sm:mt-10">
                            <ProjectMotionList
                                motion={motionStory}
                                reduced={reduced}
                            />
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
