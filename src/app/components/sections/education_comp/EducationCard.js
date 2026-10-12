"use client";

import { motion } from "motion/react";

import EducationCardMeta from "./EducationCardMeta";

export default function EducationCard({
    item,
    contentOpacity = 1,
}) {
    return (
        <article className="relative isolate flex min-h-[280px] w-full flex-col overflow-hidden rounded-[18px] border border-border-subtle bg-surface-1 p-6 text-left shadow-sm sm:min-h-[300px] sm:p-8 md:min-h-[340px] md:p-9 lg:p-10">
            <motion.div
                className="relative flex min-h-0 flex-1 flex-col"
                style={{ opacity: contentOpacity }}
            >
                <header className="relative shrink-0">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-text-muted">
                        Academic record
                    </p>
                </header>

                <div className="flex min-h-0 flex-1 flex-col justify-start pt-8 md:pt-10">
                    <h3 className="font-display text-[clamp(2.75rem,5.6vw,4.4rem)] font-normal leading-[0.98] tracking-[-0.02em] text-text-primary">
                        {item.degree}
                    </h3>

                    <p className="mt-2.5 max-w-[34ch] font-body text-[15px] leading-relaxed text-text-secondary">
                        {item.institution}
                    </p>
                </div>

                <EducationCardMeta
                    record={item.record}
                    total={item.total}
                    year={item.year}
                />
            </motion.div>
        </article>
    );
}