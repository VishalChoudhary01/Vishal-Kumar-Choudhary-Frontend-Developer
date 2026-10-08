"use client";

import { motion } from "motion/react";
import { cn } from "@/app/lib/utils";
import { projectItemReveal } from "@/app/lib/motion/projectPresets";

export default function ProjectContextBody({ body, reduced }) {
    const paragraphs = Array.isArray(body) ? body : [body];

    return (
        <div className="max-w-2xl">
            {paragraphs.filter(Boolean).map((paragraph, index) => (
                <motion.p
                    key={`${index}-${paragraph}`}
                    {...projectItemReveal(index, reduced)}
                    className={cn(
                        "font-body text-base leading-7 text-text-secondary sm:text-lg sm:leading-8",
                        index > 0 && "mt-5 sm:mt-6"
                    )}
                >
                    {paragraph}
                </motion.p>
            ))}
        </div>
    );
}
