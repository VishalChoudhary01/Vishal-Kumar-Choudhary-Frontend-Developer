"use client";

import useBreakpoint from "@/app/hooks/useBreakpoint";

import SectionHeading from "@/app/components/common/SectionHeading";

import AboutMaskedWords from "./AboutMaskedWords";
import AboutCapabilities from "./AboutCapabilities";

import { portfolio } from "@/app/data/portfolio";

export default function AboutContent() {
    const bp = useBreakpoint();
    const isMobile = bp === "mobile";

    const { about } = portfolio;

    return (
        <section
            id="about"
            className="relative overflow-hidden bg-background px-5 py-28 sm:px-8 sm:py-36 md:px-10 lg:py-44"
        >
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-10 md:gap-14 lg:grid-cols-[180px_1fr] lg:gap-16">
                    <div>
                        <SectionHeading label={"ABOUT"} number={"02"} />
                    </div>

                    <div>
                        <SectionHeading supporting={about.heading} align="left" />

                        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-8">
                            <AboutMaskedWords
                                text={about.paragraphs[0]}
                                className="type-body text-text-secondary"
                                delay={0.1}
                            />

                            <AboutMaskedWords
                                text={about.paragraphs[1]}
                                className="type-body text-text-secondary"
                                delay={0.2}
                            />
                        </div>

                        <div className="mt-10 max-w-3xl">
                            <AboutMaskedWords
                                text={about.paragraphs[2]}
                                className="type-body text-text-secondary"
                                delay={0.3}
                            />
                        </div>

                        <AboutCapabilities isMobile={isMobile} />
                    </div>
                </div>
            </div>
        </section>
    );
}