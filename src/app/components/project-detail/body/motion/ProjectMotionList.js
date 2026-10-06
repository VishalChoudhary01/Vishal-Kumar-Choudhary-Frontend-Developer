"use client";

import ProjectMotionItem from "./ProjectMotionItem";

/**
 * MOTION SECTION CONTENT.
 *
 * Renders the project's own motion story (`story.motion.statement` +
 * `story.motion.body`) — PROJECT-DETAIL-V2.md §5: generic filler that
 * applies to every project is removed, not displayed.
 */
export default function ProjectMotionList({ motion, visible, reduced }) {
    if (!motion) {
        return null;
    }

    const paragraphs = Array.isArray(motion.body) ? motion.body : [motion.body];

    return (
        <div className="border-t border-border">
            <ProjectMotionItem
                item={{
                    title: motion.statement,
                    body: paragraphs.filter(Boolean).join(" "),
                }}
                index={0}
                visible={visible}
                reduced={reduced}
            />
        </div>
    );
}