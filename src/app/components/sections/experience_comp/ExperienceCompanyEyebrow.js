"use client";

export default function ExperienceCompanyEyebrow({
    number,
    company,
    active = false,
}) {
    return (
        <span className="relative inline-block align-top font-mono">
            <span className="relative block">
                <span
                    className={`relative z-10 block text-[12px] font-medium uppercase tracking-[0.09em] transition-colors duration-300 sm:text-[13px] lg:text-[13px] ${active
                            ? "text-text-primary"
                            : "text-text-muted group-hover:text-text-secondary"
                        }`}
                >
                    {company}
                </span>

                <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-0 top-1/2 z-0 -translate-y-1/2 select-none whitespace-nowrap font-display text-[clamp(2.75rem,3.6vw,4.25rem)] font-medium leading-[0.8] tracking-[-0.015em] transition-opacity duration-300 ${active
                            ? "text-brand opacity-[0.12]"
                            : "text-brand opacity-[0.05] group-hover:opacity-[0.09]"
                        }`}
                >
                    {number}
                </span>
            </span>

            <span
                aria-hidden="true"
                className="mt-1 block select-none text-[clamp(1.5rem,1.8vw,2rem)] leading-[0.8]"
            />
        </span>
    );
}