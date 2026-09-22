"use client";

export default function ProjectHeroMeta({ project }) {
    const year = project.year || project.date || null;
    const type = project.type || project.category || null;

    if (!year && !type) {
        return null;
    }

    return (
        <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-muted sm:mt-8">
            {type && <span>{type}</span>}

            {type && year && (
                <span
                    aria-hidden="true"
                    className="size-[3px] rounded-full bg-brand"
                />
            )}

            {year && <span>{year}</span>}
        </div>
    );
}