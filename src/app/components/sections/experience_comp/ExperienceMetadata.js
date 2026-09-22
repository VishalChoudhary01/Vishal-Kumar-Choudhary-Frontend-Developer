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
        <dl className="mt-8 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
            {items.map(({ label, value }) => (
                <div key={label}>
                    <dt className="type-metadata text-text-muted">
                        {label}
                    </dt>

                    <dd className="mt-2 type-body-small text-text-primary">
                        {value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}