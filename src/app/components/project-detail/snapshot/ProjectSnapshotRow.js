"use client";

import { motion } from "motion/react";
import { cn } from "@/app/lib/utils";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

export default function ProjectSnapshotRow({ label, value, index, visible, reduced }) {
    return (
        <motion.div initial={reduced ? false : { opacity: 0, y: 18 }} animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }} transition={reduced ? { duration: 0 } : { duration: 0.65, delay: 0.06 * index, ease: EASE_EDITORIAL }} className={cn("grid border-b border-border py-6 sm:py-7 md:grid-cols-[minmax(160px,0.35fr)_minmax(0,1fr)] md:items-baseline md:gap-10 md:py-8 lg:grid-cols-[minmax(220px,0.4fr)_minmax(0,1fr)] lg:gap-16 lg:py-9")}>
            <motion.p initial={reduced ? false : { opacity: 0, x: -8 }} animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }} transition={reduced ? { duration: 0 } : { duration: 0.5, delay: 0.1 + 0.06 * index, ease: EASE_EDITORIAL }} className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.18em] text-text-muted sm:text-[0.72rem]">
                {label}
            </motion.p>

            <motion.p initial={reduced ? false : { opacity: 0, x: 10 }} animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }} transition={reduced ? { duration: 0 } : { duration: 0.6, delay: 0.13 + 0.06 * index, ease: EASE_EDITORIAL }} className="mt-3 max-w-[72ch] font-body text-[15px] leading-[1.6] text-text-primary sm:text-base md:mt-0 lg:text-[17px]">
                {value}
            </motion.p>
        </motion.div>
    );
}