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
                <p className="max-w-[780px] text-[0.9rem] leading-relaxed text-text-secondary md:text-[1rem]">
                    {experience.overview}
                </p>
            )}

            {activeTab === "Build" && (
                <ol role="list">
                    {experience.build.map((step, index) => (
                        <li
                            key={index}
                            className="flex gap-4 border-t border-border py-3 first:border-t-0 md:gap-5 md:py-4"
                        >
                            <span className="pt-1 text-[11px] leading-[1.45] tabular-nums text-brand md:text-[12px]">
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            <p className="text-[0.9rem] leading-[1.6] text-text-secondary md:text-[1rem]">
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
                            className="flex gap-4 border-t border-border py-3 first:border-t-0 md:gap-5 md:py-4"
                        >
                            <span
                                className="mt-[0.72em] block h-px w-5 shrink-0 bg-brand"
                                aria-hidden="true"
                            />

                            <p className="text-[0.9rem] leading-[1.6] text-text-secondary md:text-[1rem]">
                                {outcome}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}