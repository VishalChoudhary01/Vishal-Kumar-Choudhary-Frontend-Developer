"use client";

import AboutCapabilityCard from "./AboutCapabilityCard";
import { portfolio } from "@/app/data/portfolio";

export default function AboutCapabilities({ isMobile = false }) {
    const { capabilities } = portfolio.about;

    const layoutMode = isMobile ? "mobile" : "desktop";

    return (
        <div
            className={`mt-16 ${isMobile ? "flex flex-col gap-px rounded-[16px]" : "grid grid-cols-3 gap-px"} overflow-hidden border border-border-subtle/60 bg-border-subtle/60`}
        >
            {capabilities.map((capability, index) => (
                <AboutCapabilityCard
                    key={`${capability.title}-${layoutMode}`}
                    capability={capability}
                    index={index}
                    isMobile={isMobile}
                    entranceDelay={0.35}
                />
            ))}
        </div>
    );
}