"use client";

import { motion } from "motion/react";
import { projectItemReveal } from "@/app/lib/motion/projectPresets";

export default function ProjectDesignBody({ body, reduced }) {
    const paragraphs = Array.isArray(body) ? body : [body];

    return (
        <div className="space-y-5 sm:space-y-6">
            {paragraphs.filter(Boolean).map((paragraph, index) => (
                <motion.p
                    key={`${index}-${paragraph}`}
                    {...projectItemReveal(index, reduced)}
                    className="font-body text-base leading-7 text-text-secondary sm:text-lg sm:leading-8"
                >
                    {paragraph}
                </motion.p>
            ))}
        </div>
    );
}
