"use client";

export default function ExperienceMetadata({
    metadata,
}) {
    const items = [
        {
            label: "Stack",
            value: metadata.stack,
        },
        {
            label: "Focus",
            value: metadata.focus,
        },
    ];

    return (
        <dl className="mt-6 grid gap-5 border-t border-border pt-5 sm:grid-cols-2 md:mt-8 md:gap-6 md:pt-6">
            {items.map(({ label, value }) => (
                <div key={label}>
                    <dt className="text-[11px] leading-[1.5] text-text-muted md:text-[12px]">
                        {label}
                    </dt>

                    <dd className="mt-2 text-[0.875rem] leading-[1.55] text-text-primary md:text-[1rem]">
                        {value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}