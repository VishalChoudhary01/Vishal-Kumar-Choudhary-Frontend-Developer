"use client";

import { motion } from "motion/react";
import { projectItemReveal } from "@/app/lib/motion/projectPresets";

/**
 * "What I would improve" stays a single content block — heading + prose
 * reveal together as one viewport-triggered unit.
 */
export default function ProjectReflectionImprove({ improve, reduced }) {
    return (
        <motion.div
            {...projectItemReveal(0, reduced)}
            className="border-b border-border pt-7 sm:pt-8"
        >
            <div className="max-w-2xl">
                <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">
                    What I would improve
                </h3>

                <p className="mt-3 font-body text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
                    {improve}
                </p>
            </div>
        </motion.div>
    );
}
