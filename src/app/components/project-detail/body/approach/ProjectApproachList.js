"use client";

import ProjectApproachItem from "./ProjectApproachItem";

export default function ProjectApproachList({ items, reduced }) {
    return (
        <div>
            {items.map((item, index) => (
                <ProjectApproachItem
                    key={`${item.title}-${index}`}
                    item={item}
                    index={index}
                    reduced={reduced}
                />
            ))}
        </div>
    );
}
