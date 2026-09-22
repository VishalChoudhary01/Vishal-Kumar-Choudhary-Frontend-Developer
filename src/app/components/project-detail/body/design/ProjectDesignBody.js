"use client";

export default function ProjectDesignBody({ body }) {
    const paragraphs = Array.isArray(body) ? body : [body];

    return (
        <div className="space-y-5 sm:space-y-6">
            {paragraphs.filter(Boolean).map((paragraph, index) => (
                <p key={`${index}-${paragraph}`} className="font-body text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
                    {paragraph}
                </p>
            ))}
        </div>
    );
}