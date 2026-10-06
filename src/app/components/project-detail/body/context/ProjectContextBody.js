"use client";

import { motion } from "motion/react";
import { cn } from "@/app/lib/utils";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

export default function ProjectContextBody({ body, visible, reduced }) {
    const paragraphs = Array.isArray(body) ? body : [body];

    return (
        <motion.div initial={reduced ? false : { opacity: 0, y: 24 }} animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={reduced ? { duration: 0 } : { duration: 0.8, delay: 0.12, ease: EASE_EDITORIAL }} className="max-w-2xl">
            {paragraphs.filter(Boolean).map((paragraph, index) => (
                <p key={`${index}-${paragraph}`} className={cn("font-body text-base leading-7 text-text-secondary sm:text-lg sm:leading-8", index > 0 && "mt-5 sm:mt-6")}>
                    {paragraph}
                </p>
            ))}
        </motion.div>
    );
}