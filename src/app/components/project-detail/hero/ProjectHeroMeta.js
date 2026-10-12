"use client";

/*
 * HERO META — one line of identity metadata.
 *
 * Year and category are already communicated by the hero eyebrow
 * (`CATEGORY · YEAR`), and the stack lives in the Snapshot section.
 * Keeping role here is the single owner for that fact
 * (PROJECT-DETAIL-V2.md §9 — no repeated year/category in the hero).
 */
export default function ProjectHeroMeta({ project }) {
    const role = project?.role || null;

    const items = [role].filter(Boolean);

    if (!items.length) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-text-secondary dark:text-text-tertiary sm:text-[0.8rem]">
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