"use client";

import SectionHeading from "@/app/components/common/SectionHeading";

import { portfolio } from "@/app/data/portfolio";

export default function AboutReduced() {
    const { about } = portfolio;

    return (
        <section
            id="about"
            className="relative overflow-hidden bg-background px-5 py-28 sm:px-8 sm:py-36 md:px-10 lg:py-44"
        >
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-10 md:gap-14 lg:grid-cols-[180px_1fr] lg:gap-16">
                    {/* LEFT — SECTION LABEL */}

                    <div>
                        <p className="type-label text-brand">
                            ABOUT
                        </p>
                    </div>

                    {/* RIGHT — CONTENT */}

                    <div>
                        <SectionHeading
                            supporting={about.heading}
                            align="left"
                        />

                        <div
                            className="mt-7 h-px w-full bg-border"
                            aria-hidden="true"
                        />

                        {/* BODY */}

                        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-8">
                            <p className="type-body text-text-secondary">
                                {about.paragraphs[0]}
                            </p>

                            <p className="type-body text-text-secondary">
                                {about.paragraphs[1]}
                            </p>
                        </div>

                        <div className="mt-10 max-w-3xl">
                            <p className="type-body text-text-secondary">
                                {about.paragraphs[2]}
                            </p>
                        </div>

                        {/* CAPABILITIES */}

                        <div className="mt-16 grid grid-cols-3 gap-px overflow-hidden border border-border-subtle bg-border-subtle">
                            {about.capabilities.map((capability) => (
                                <div
                                    key={capability.title}
                                    className="relative overflow-hidden bg-surface-1 p-6 sm:p-7"
                                >
                                    {/* WATERMARK */}

                                    <span
                                        className="pointer-events-none absolute font-display leading-1 tracking-[-0.04em] text-[clamp(5rem,8vw,8rem)] bottom-[-0.15em] right-2 select-none font-normal text-brand opacity-[0.07]"
                                        aria-hidden="true"
                                    >
                                        {capability.index}
                                    </span>

                                    <p className="relative type-metadata text-brand">
                                        {capability.title}
                                    </p>

                                    <div
                                        className="relative mt-4 h-px w-full bg-border"
                                        aria-hidden="true"
                                    />

                                    <ul className="relative mt-5 space-y-2">
                                        {capability.items.map((item) => (
                                            <li
                                                key={item}
                                                className="type-body-small text-text-secondary"
                                            >
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}