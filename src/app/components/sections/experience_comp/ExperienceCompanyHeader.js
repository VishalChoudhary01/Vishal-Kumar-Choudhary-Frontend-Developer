"use client";

export default function ExperienceCompanyHeader({
    experience,
}) {
    return (
        <div className="relative">
            <h3 className="font-display text-[1.4rem] font-normal leading-[1.05] tracking-[-0.03em] text-text-primary md:text-[clamp(1.625rem,2.4vw,2.625rem)]">
                {experience.company}
            </h3>

            <p className="mt-2 text-[0.875rem] leading-[1.6] text-text-secondary md:mt-3 md:text-[1rem]">
                {experience.role}
            </p>

            <p className="mt-1 text-[11px] leading-[1.45] text-text-muted md:mt-1.5 md:text-[12px]">
                {experience.date}
            </p>
        </div>
    );
}