"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

import { EASE_EDITORIAL } from "./sectionHeading.constants";

export default function SectionHeadingWords({
    text,
    mask,
    show,
    startDelay = 0,
    step = 0.055,
}) {
    const words = text.split(" ");
    /*
     * Phase 11: will-change promotes each word to its own compositor layer.
     * That's useful while the entrance transform animates, but wasteful once
     * every word rests at y:0% — it was keeping one layer per word alive
     * forever. We hold the hint only until the last word has landed, then
     * drop it so the settled words fold back into a shared layer.
     */
    const [entered, setEntered] = useState(false);

    /* Single release after the last word lands: 0.6s + full stagger. */
    useEffect(() => {
        if (!show || entered) return;
        const total = 0.6 + startDelay + words.length * step;
        const t = setTimeout(() => setEntered(true), (total + 0.15) * 1000);
        return () => clearTimeout(t);
    }, [show, entered, startDelay, words.length, step]);

    /* Hint only before entrance; dropped once entered. */
    const willChange = entered ? undefined : "transform";

    return (
        <>
            {words.map((word, index) => (
                <span
                    key={`${word}-${index}`}
                    className="inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em] mr-[0.26em] last:mr-0"
                >
                    <motion.span
                        className="inline-block"
                        style={{ willChange }}
                        initial={mask ? { y: "118%" } : false}
                        animate={
                            show
                                ? { y: "0%" }
                                : { y: "118%" }
                        }
                        transition={{
                            duration: 0.6,
                            delay: mask && show ? startDelay + index * step : 0,
                            ease: EASE_EDITORIAL,
                        }}
                    >
                        {word}
                    </motion.span>
                </span>
            ))}
        </>
    );
}
