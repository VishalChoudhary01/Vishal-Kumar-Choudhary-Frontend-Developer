"use client";

import { motion } from "motion/react";
import { cn } from "@/app/lib/utils";

/**
 * MOTION SECTION CONTENT.
 *
 * Renders the project's own motion story (`story.motion.body`) beneath the
 * statement, which the section heading now carries — PROJECT-DETAIL-V2.md §5:
 * generic filler that applies to every project is removed, not displayed.
 */
export default function ProjectMotionList({ motion: motionStory, visible, reduced }) {
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
        <div className="max-w-2xl border-t border-border pt-6 sm:pt-7">
            {paragraphs.map((paragraph, index) => (
                <motion.p
                    key={`${index}-${paragraph}`}
                    initial={reduced ? false : { opacity: 0, y: 20 }}
                    animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={reduced ? { duration: 0 } : { duration: 0.7, delay: 0.08 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
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
