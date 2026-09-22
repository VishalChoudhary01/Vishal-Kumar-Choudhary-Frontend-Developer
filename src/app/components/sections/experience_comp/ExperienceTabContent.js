"use client";

export default function ExperienceTabContent({
    experience,
    activeTab,
}) {
    return (
        <div
            id={`exp-panel-${activeTab.toLowerCase()}`}
            role="tabpanel"
            aria-labelledby={`exp-tab-${activeTab.toLowerCase()}`}
            tabIndex={0}
            className="outline-none"
        >
            {activeTab === "Overview" && (
                <p className="type-body max-w-[780px] leading-relaxed text-text-secondary">
                    {experience.overview}
                </p>
            )}

            {activeTab === "Build" && (
                <ol role="list">
                    {experience.build.map((step, index) => (
                        <li
                            key={index}
                            className="flex gap-5 border-t border-border py-4 first:border-t-0"
                        >
                            <span className="type-caption pt-1 tabular-nums text-brand">
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            <p className="type-body text-text-secondary">
                                {step}
                            </p>
                        </li>
                    ))}
                </ol>
            )}

            {activeTab === "Impact" && (
                <ul role="list">
                    {experience.impact.map((outcome, index) => (
                        <li
                            key={index}
                            className="flex gap-5 border-t border-border py-4 first:border-t-0"
                        >
                            <span
                                className="mt-[0.72em] block h-px w-5 shrink-0 bg-brand"
                                aria-hidden="true"
                            />

                            <p className="type-body text-text-secondary">
                                {outcome}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}