"use client";

export default function ExperienceCompanyHeader({
    experience,
}) {
    return (
        <div className="relative">
            <h3 className="font-display text-[clamp(1.625rem,2.4vw,2.625rem)] font-normal leading-[1.05] tracking-[-0.03em] text-text-primary">
                {experience.company}
            </h3>

            <p className="mt-3 type-body text-text-secondary">
                {experience.role}
            </p>

            <p className="mt-1.5 type-caption text-text-muted">
                {experience.date}
            </p>
        </div>
    );
}