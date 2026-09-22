"use client";

import ProjectEngineeringItem from "./ProjectEngineeringItem";

export default function ProjectEngineeringList({
    items,
    visible,
    reduced,
}) {
    return (
        <div className="border-t border-border">
            {items.map((item, index) => (
                <ProjectEngineeringItem
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