"use client";

export default function ProjectHeroMeta({ project }) {
    const year = project.year || null;
    const type = project.type || project.categoryLabel || null;
    const role = project.role || null;

    const items = [year, type, role].filter(Boolean);

    if (!items.length) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-muted">
            {items.map((item, index) => (
                <span key={item} className="flex items-center gap-3">
                    {index > 0 && (
                        <span aria-hidden="true" className="size-[3px] rounded-full bg-brand" />
                    )}
                    <span>{item}</span>
                </span>
            ))}
        </div>
    );
}