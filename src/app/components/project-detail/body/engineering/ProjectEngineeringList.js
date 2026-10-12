"use client";

import ProjectEngineeringItem from "./ProjectEngineeringItem";

export default function ProjectEngineeringList({
    items,
    reduced,
}) {
    return (
        <div>
            {items.map((item, index) => (
                <ProjectEngineeringItem
                    key={`${item.title}-${index}`}
                    item={item}
                    index={index}
                    reduced={reduced}
                />
            ))}
        </div>
    );
}
