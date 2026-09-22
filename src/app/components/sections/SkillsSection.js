"use client";

import { useCallback, useState } from "react";

import SectionHeading from "@/app/components/common/SectionHeading";
import useReducedMotion from "@/app/hooks/useReducedMotion";
import SkillCategory from "./skills_comp/SkillCategory";
import { portfolio } from "@/app/data/portfolio";

export default function SkillsSection() {
    const reducedMotion = useReducedMotion();
    const { skills } = portfolio;

    if (reducedMotion) {
        return <StaticSkills skills={skills} />;
    }

    return <DynamicSkills skills={skills} />;
}

function DynamicSkills({ skills }) {
    const [activeId, setActiveId] = useState(null);

    const handleVisible = useCallback((id) => {
        setActiveId(id);
    }, []);

    return (
        <section
            id="skills"
            aria-labelledby="skills-heading"
            className="relative bg-background px-5 py-20 sm:px-8 sm:py-28 md:px-10 lg:py-44"
        >
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-10 md:gap-14 lg:grid-cols-[180px_1fr] lg:gap-16">
                    <div>
                        <SectionHeading
                            heading="SKILLS"
                            align="left"
                            number={"04"}
                        />
                    </div>

                    <div>
                        <SectionHeading
                            supporting="What I build with."
                            align="left"
                            supportingId="skills-heading"
                        />

                        <ol
                            aria-label="Capabilities"
                            className="mt-14 list-none sm:mt-16 lg:mt-20"
                        >
                            {skills.map((category) => (
                                <SkillCategory
                                    key={category.id}
                                    category={category}
                                    animate
                                    active={activeId === category.id}
                                    onVisible={handleVisible}
                                />
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </section>
    );
}

function StaticSkills({ skills }) {
    return (
        <section
            id="skills"
            aria-labelledby="skills-heading"
            className="relative bg-background px-5 py-20 sm:px-8 sm:py-28 md:px-10 lg:py-44"
        >
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-10 md:gap-14 lg:grid-cols-[180px_1fr] lg:gap-16">
                    <div>
                        <SectionHeading
                            heading="SKILLS"
                            align="left"
                        />
                    </div>

                    <div>
                        <SectionHeading
                            supporting="What I build with."
                            align="left"
                            supportingId="skills-heading"
                        />

                        <ol
                            aria-label="Capabilities"
                            className="mt-14 list-none sm:mt-16 lg:mt-20"
                        >
                            {skills.map((category) => (
                                <SkillCategory
                                    key={category.id}
                                    category={category}
                                    animate={false}
                                />
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </section>
    );
}