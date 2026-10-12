"use client";

import SectionHeading from "@/app/components/common/SectionHeading";
import Container from "@/app/components/common/Container";

import useReducedMotion from "@/app/hooks/useReducedMotion";

import ProjectDesignBody from "./ProjectDesignBody";

export default function ProjectDesign({ project }) {
    const reduced = useReducedMotion();

    const design = project?.story?.design;

    if (!design) {
        return null;
    }

    const statement = design.statement;
    const body = design.body;

    if (!statement && !body) {
        return null;
    }

    return (
        <section id="project-design" aria-labelledby="project-design-title" className="relative overflow-x-clip bg-background">
            <Container>
                <div className="grid gap-8 px-5 py-12 sm:gap-10 sm:px-8 sm:py-14 md:px-10 lg:grid-cols-[180px_1fr] lg:gap-16 lg:px-12">
                    <div>
                        <SectionHeading label="DESIGN" align="left" />
                    </div>

                    <div>
                        <SectionHeading supporting={statement} supportingId="project-design-title" align="left" size="compact"/>

                        {body && (
                            <div className="mt-8 max-w-2xl sm:mt-10">
                                <ProjectDesignBody body={body} reduced={reduced} />
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </section>
    );
}
