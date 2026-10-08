"use client";

import SectionHeading from "@/app/components/common/SectionHeading";
import Container from "@/app/components/common/Container";
import useReducedMotion from "@/app/hooks/useReducedMotion";
import ProjectEngineeringList from "./ProjectEngineeringList";

export default function ProjectEngineering({ project }) {
    const reduced = useReducedMotion();

    const engineering = project?.story?.engineering;

    if (!Array.isArray(engineering) || !engineering.length) {
        return null;
    }

    return (
        <section
            id="project-engineering"
            aria-labelledby="project-engineering-title"
            className="relative overflow-x-clip bg-background"
        >
            <Container>
                <div className="grid gap-8 px-5 py-12 sm:gap-10 sm:px-8 sm:py-14 md:px-10 lg:grid-cols-[180px_1fr] lg:gap-16 lg:px-12">
                    <div>
                        <SectionHeading label="ENGINEERING" align="left" />
                    </div>

                    <div>
                        <SectionHeading
                            supporting="How the interface was structured and implemented."
                            supportingId="project-engineering-title"
                            align="left"
                            size="compact"
                        />

                        <div className="mt-8 sm:mt-10">
                            <ProjectEngineeringList
                                items={engineering}
                                reduced={reduced}
                            />
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
