"use client";

import { Fragment } from "react";
import { motion } from "motion/react";

export default function SkillSupporting({
    skills,
    animate,
    interactive,
    motionProps,
}) {
    const content = (
        <>
            {skills.map((skill, index) => (
                <Fragment key={skill}>
                    {index > 0 && (
                        <SkillSeparator />
                    )}

                    <span>{skill}</span>
                </Fragment>
            ))}
        </>
    );

    const className = `mt-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5 font-body text-sm text-text-muted transition-colors duration-300 ${interactive ? "md:group-hover:text-text-tertiary" : ""}`;

    if (!animate) {
        return (
            <p className={className}>
                {content}
            </p>
        );
    }

    return (
        <motion.p
            className={className}
            {...motionProps}
        >
            {content}
        </motion.p>
    );
}

function SkillSeparator() {
    return (
        <span
            aria-hidden="true"
            className="select-none text-text-tertiary"
        >
            ·
        </span>
    );
}