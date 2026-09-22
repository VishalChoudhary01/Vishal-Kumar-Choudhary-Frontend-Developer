"use client";

import ProjectApproachItem from "./ProjectApproachItem";

export default function ProjectApproachList({ items, visible, reduced }) {
    return (
        <div className="border-t border-border">
            {items.map((item, index) => (
                <ProjectApproachItem
                    key={`${item.title}-${index}`}
                    item={item}
                    index={index}
                    visible={visible}
                    reduced={reduced}
                />
            ))}
        </div>
    );
}