"use client";

import { motion } from "motion/react";

import { CONTACT_MOTION } from "./contact.motion";

export default function ContactRevealRow({
    active,
    delay = 0,
    className = "",
    children,
}) {
    return (
        <motion.div
            className={className}
            initial={false}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: CONTACT_MOTION.reveal.duration, ease: CONTACT_MOTION.reveal.ease, delay: active ? delay : 0 }}
        >
            {children}
        </motion.div>
    );
}