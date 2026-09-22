"use client";

import ProjectMotionItem from "./ProjectMotionItem";

const motionPrinciples = [
    {
        title: "Purposeful movement",
        body: "Motion is used to guide attention, communicate change, and make interactions feel intentional.",
    },
    {
        title: "Editorial pacing",
        body: "Transitions create rhythm between sections and states without competing with the content.",
    },
    {
        title: "Subtle feedback",
        body: "Small changes in position, opacity, and scale provide feedback while keeping the interface calm.",
    },
];

export default function ProjectMotionList({ visible, reduced }) {
    return (
        <div className="border-t border-border">
            {motionPrinciples.map((item, index) => (
                <ProjectMotionItem
                    key={item.title}
                    item={item}
                    index={index}
                    visible={visible}
                    reduced={reduced}
                />
            ))}
        </div>
    );
}