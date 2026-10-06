"use client";

import ProjectResponsiveItem from "./ProjectResponsiveItem";

/**
 * RESPONSIVE SECTION CONTENT.
 *
 * Renders the project's own responsive story (`story.responsive.desktop`,
 * `.tablet`, `.mobile`) — PROJECT-DETAIL-V2.md §5: generic filler that
 * applies to every project is removed, not displayed.
 */
export default function ProjectResponsiveList({ responsive, visible, reduced }) {
    if (!responsive) {
        return null;
    }

    const items = [
        {
            title: "Desktop",
            body: responsive.desktop,
        },
        {
            title: "Tablet",
            body: responsive.tablet,
        },
        {
            title: "Mobile",
            body: responsive.mobile,
        },
    ].filter((item) => item.body);

    if (!items.length) {
        return null;
    }

    return (
        <div>
            {items.map((item, index) => (
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