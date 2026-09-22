"use client";

import ProjectResponsiveItem from "./ProjectResponsiveItem";

const responsivePrinciples = [
    {
        label: "01",
        title: "Small screens",
        body: "Layouts were designed to remain readable and usable when space becomes constrained, without treating mobile as an afterthought.",
    },
    {
        label: "02",
        title: "Flexible layouts",
        body: "Spacing, typography, media, and content structures adapt progressively instead of relying on fixed dimensions.",
    },
    {
        label: "03",
        title: "Consistent experience",
        body: "The visual language remains consistent across breakpoints while allowing each viewport to use the space it has effectively.",
    },
];

export default function ProjectResponsiveList({ visible, reduced }) {
    return (
        <div className="border-t border-border">
            {responsivePrinciples.map((item, index) => (
                <ProjectResponsiveItem
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