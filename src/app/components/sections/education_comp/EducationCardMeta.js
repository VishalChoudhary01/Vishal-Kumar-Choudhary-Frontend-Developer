"use client";

import { cn } from "@/app/lib/utils";

function EducationRecord({ record, total }) {
    return (
        <p className="font-mono text-[0.68rem] tabular-nums uppercase tracking-[0.2em] text-text-muted">
            Record {String(record).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
    );
}

function EducationYear({ year }) {
    return (
        <span
            aria-hidden="true"
            className="pointer-events-none select-none font-mono text-[clamp(3.8rem,7vw,5.5rem)] font-normal leading-[0.82] tabular-nums tracking-[-0.045em] text-brand opacity-[0.1]"
        >
            {year}
        </span>
    );
}

export default function EducationCardMeta({
    record,
    total,
    year,
    className = "",
}) {
    return (
        <footer className={cn("relative mt-9 md:mt-10", className)}>
            <div className="h-px w-full bg-border" />

            <div className="flex min-h-[5.5rem] items-end justify-between gap-6 pt-3">
                <EducationRecord
                    record={record}
                    total={total}
                />

                <div className="flex min-w-0 items-end justify-end">
                    <EducationYear year={year} />

                    <span
                        aria-hidden="true"
                        className="mb-[0.58em] ml-1.5 size-1.5 md:size-2 duration-1000    animate-pulse shrink-0 rounded-[1px] bg-brand"
                    />
                </div>
            </div>
        </footer>
    );
}