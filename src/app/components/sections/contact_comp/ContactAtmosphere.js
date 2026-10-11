"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import useReducedMotion from "@/app/hooks/useReducedMotion";
import { CONTACT_MOTION } from "./contact.motion";

export default function ContactAtmosphere() {
    const reduced = useReducedMotion();

    /*
     * The background blobs breathe in an infinite loop on 120–140px-blurred
     * layers. The contact section is last on the page, so without this gate
     * the loop ran for the whole session while off-screen (Phase 7: off-screen
     * work). Mount it only while the section is in view.
     */
    const rootRef = useRef(null);
    const inView = useInView(rootRef);

    return (
        <div
            ref={rootRef}
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
        >
            <div className="absolute inset-0 bg-background" />

            {reduced || !inView ? null : (
                <motion.div
                    className="absolute inset-0 overflow-hidden"
                    initial={false}
                    animate={{
                        scale: [1, 1.04, 1],
                    }}
                    transition={{
                        duration:
                            CONTACT_MOTION.background.duration,
                        ease: CONTACT_MOTION.background.ease,
                        repeat: Infinity,
                    }}
                >
                    <div className="absolute -right-1/3 top-1/4 h-[60vmax] w-[60vmax] rounded-full bg-brand-soft opacity-30 blur-[120px]" />

                    <div className="absolute -left-1/4 bottom-0 h-[50vmax] w-[50vmax] rounded-full bg-surface-2 opacity-40 blur-[140px]" />
                </motion.div>
            )}
        </div>
    );
}