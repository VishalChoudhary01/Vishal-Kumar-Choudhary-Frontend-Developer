"use client";

import SectionHeading from "@/app/components/common/SectionHeading";
import { educationData } from "./education.data";

export default function EducationHeader({
    pinned = false,
    headingId,
    headingSize,
}) {
    const { totalLabel, period } = educationData;

    const periodText =
        period.start && period.end
            ? `${period.start} — ${period.end}`
            : "";

    const containerClass = pinned
        ? "relative w-full"
        : "relative mx-auto w-full max-w-7xl px-5 pb-6 pt-16 sm:px-8 sm:pb-8 sm:pt-20 md:px-10 md:pb-0 md:pt-28 lg:pt-32";

    const gridClass = pinned
        ? "grid gap-4 md:gap-12 lg:grid-cols-[minmax(0,11rem)_1fr] lg:gap-16"
        : "grid gap-8 md:gap-12 lg:grid-cols-[minmax(0,11rem)_1fr] lg:gap-16";

    return (
        <div className={containerClass}>
            <div className={gridClass}>
                <div>
                    <SectionHeading
                        label={educationData.eyebrow}
                        align="left"

                        number={"03"} 
                    />
                </div>

                <div>
                    <SectionHeading
                        supporting={educationData.heading}
                        align="left"
                        supportingId={headingId}
                        size={
                            headingSize ??
                            (pinned ? "compact" : "default")
                        }
                    />

                    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-muted md:mt-5">
                        {periodText && (
                            <span>{periodText}</span>
                        )}

                        {periodText && (
                            <span
                                aria-hidden="true"
                                className="h-px w-6 bg-border"
                            />
                        )}

                        <span>{totalLabel} records</span>
                    </p>
                </div>
            </div>
        </div>
    );
}