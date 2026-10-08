"use client";

import { motion } from "motion/react";
import { cn } from "@/app/lib/utils";
import { projectItemReveal } from "@/app/lib/motion/projectPresets";

/**
 * MOTION SECTION CONTENT.
 *
 * Renders the project's own motion story (`story.motion.body`) beneath the
 * statement, which the section heading now carries — PROJECT-DETAIL-V2.md §5:
 * generic filler that applies to every project is removed, not displayed.
 *
 * Each paragraph is its own content unit and reveals on its own viewport
 * entry; there is no section-level block animation.
 */
export default function ProjectMotionList({ motion: motionStory, reduced }) {
    if (!motionStory) {
        return null;
    }

    const paragraphs = (
        Array.isArray(motionStory.body)
            ? motionStory.body
            : [motionStory.body]
    ).filter(Boolean);

    if (!paragraphs.length) {
        return null;
    }

    return (
        <div className="max-w-2xl pt-6 sm:pt-7">
            {paragraphs.map((paragraph, index) => (
                <motion.p
                    key={`${index}-${paragraph}`}
                    {...projectItemReveal(index, reduced)}
                    className={cn(
                        "font-body text-base leading-7 text-text-secondary sm:text-lg sm:leading-8",
                        index > 0 && "mt-5"
                    )}
                >
                    {paragraph}
                </motion.p>
            ))}
        </div>
    );
}
