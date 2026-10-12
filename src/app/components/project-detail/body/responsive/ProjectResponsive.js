"use client";

import SectionHeading from "@/app/components/common/SectionHeading";
import Container from "@/app/components/common/Container";
import useReducedMotion from "@/app/hooks/useReducedMotion";
import ProjectResponsiveList from "./ProjectResponsiveList";

export default function ProjectResponsive({ project }) {
    const reduced = useReducedMotion();

    if (!project?.story?.responsive) {
        return null;
    }

    return (
        <section
            id="project-responsive"
            aria-labelledby="project-responsive-title"
            className="relative overflow-x-clip bg-background"
        >
            <Container>
                <div className="grid gap-8 px-5 py-12 sm:gap-10 sm:px-8 sm:py-14 md:px-10 lg:grid-cols-[180px_1fr] lg:gap-16 lg:px-12">
                    <div>
                        <SectionHeading
                            label="RESPONSIVE"
                            align="left"
                        />
                    </div>

                    <div>
                        <SectionHeading
                            supporting="The workflow adapts without losing its primary relationship."
                            supportingId="project-responsive-title"
                            align="left"
                            size="compact"
                        />

                        <div className="mt-8 sm:mt-10">
                            <ProjectResponsiveList
                                responsive={project?.story?.responsive}
                                reduced={reduced}
                            />
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
