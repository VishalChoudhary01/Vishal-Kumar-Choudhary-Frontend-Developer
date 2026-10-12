"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import { cn } from "@/app/lib/utils";
import { CONTACT_MOTION } from "./contact.motion";

export default function ContactIntro({
    text = "Have an idea, a product, or an interesting problem? Tell me about it.",
    className = "",
}) {
    const reduced = useReducedMotion();

    const ref = useRef(null);

    const isInView = useInView(ref, {
        once: true,
        margin: "-60px 0px",
    });

    const visible = reduced || isInView;

    return (
        <motion.p
            ref={ref}
            className={cn(
                "max-w-[54ch] font-body text-[15px] leading-relaxed text-text-secondary",
                className
            )}
            initial={false}
            animate={
                visible
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 14 }
            }
            transition={{
                duration: CONTACT_MOTION.reveal.duration,
                ease: CONTACT_MOTION.reveal.ease,
                delay: visible && !reduced ? 0.08 : 0,
            }}
        >
            {text}
        </motion.p>
    );
}