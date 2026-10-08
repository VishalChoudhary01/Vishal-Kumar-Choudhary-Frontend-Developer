"use client";

import SectionHeading from "@/app/components/common/SectionHeading";
import Container from "@/app/components/common/Container";

import useReducedMotion from "@/app/hooks/useReducedMotion";

import ProjectApproachList from "./ProjectApproachList";

export default function ProjectApproach({ project }) {
    const reduced = useReducedMotion();

    const approach = project?.story?.approach;

    if (!Array.isArray(approach) || !approach.length) {
        return null;
    }

    return (
        <section id="project-approach" aria-labelledby="project-approach-title" className="relative overflow-x-clip bg-background">
            <Container>
                <div className="grid gap-8 px-5 py-12 sm:gap-10 sm:px-8 sm:py-14 md:px-10 lg:grid-cols-[180px_1fr] lg:gap-16 lg:px-12">
                    <div>
                        <SectionHeading label="APPROACH" align="left" />
                    </div>

                    <div>
                        <SectionHeading supporting="How the problem shaped the decisions." supportingId="project-approach-title" align="left" size="compact" />

                        <div className="mt-8 sm:mt-10">
                            <ProjectApproachList items={approach} reduced={reduced} />
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
