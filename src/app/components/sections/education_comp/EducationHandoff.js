"use client";

import { motion, useTransform } from "motion/react";

const EASE = [0.22, 1, 0.36, 1];

export default function EducationHandoff({
    progress,
}) {
    const opacity = useTransform(
        progress,
        [0.6, 0.82],
        [0, 1]
    );

    const y = useTransform(
        progress,
        [0.6, 0.82],
        [8, 0]
    );

    return (
        <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+18px)] z-20 flex items-center justify-center gap-4 px-10 md:bottom-[calc(env(safe-area-inset-bottom,0px)+22px)] md:px-12"
            style={{ opacity, y }}
            transition={{
                ease: EASE,
            }}
        >
            <span className="h-px w-8 bg-border sm:w-24 lg:w-40" />

            <HandoffContent />

            <span className="h-px w-8 bg-border sm:w-24 lg:w-40" />
        </motion.div>
    );
}

function HandoffContent() {
    return (
        <span className="flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.26em] text-text-muted">
            <span>Learning</span>

            <span
                aria-hidden="true"
                className="text-brand"
            >
                →
            </span>

            <span>Building</span>
        </span>
    );
}

export function EducationHandoffLine() {
    return (
        <p
            aria-hidden="true"
            className="flex w-full max-w-7xl items-center justify-center gap-4 px-6"
        >
            <span className="h-px flex-1 bg-border" />

            <HandoffContent />

            <span className="h-px flex-1 bg-border" />
        </p>
    );
}