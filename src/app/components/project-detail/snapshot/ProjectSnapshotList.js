"use client";

import ProjectSnapshotRow from "./ProjectSnapshotRow";

export default function ProjectSnapshotList({ rows, visible, reduced }) {
    return (
        <div className="border-t border-border">
            {rows.map((row, index) => (
                <ProjectSnapshotRow key={`${row.label}-${index}`} label={row.label} value={row.value} index={index} visible={visible} reduced={reduced} />
            ))}
        </div>
    );
} 