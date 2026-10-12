"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

export default function AboutMaskedWords({
    text,
    className = "",
    delay = 0,
}) {
    const ref = useRef(null);

    const isInView = useInView(ref, {
        once: true,
        margin: "-40px 0px",
    });

    /*
     * Phase 11: will-change promotes each word to its own compositor layer.
     * Useful while the entrance transform animates, wasteful once the words
     * rest at y:0%. Release the hint after the last word lands so the settled
     * paragraph folds back into a shared layer.
     */
    const [entered, setEntered] = useState(false);

    useEffect(() => {
        if (!isInView || entered) return;
        const total = 0.5 + delay + text.split(" ").length * 0.045;
        const t = setTimeout(() => setEntered(true), (total + 0.15) * 1000);
        return () => clearTimeout(t);
    }, [isInView, entered, delay, text]);

    const willChange = entered ? undefined : "transform";

    return (
        <p
            ref={ref}
            className={className}
        >
            {text.split(" ").map((word, index) => (
                <span
                    key={`${word}-${index}`}
                    className="inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em] mr-[0.28em] last:mr-0"
                >
                    <motion.span
                    className="inline-block"
                    style={{ willChange }}
                    initial={{
                        y: "118%",
                    }}
                        animate={
                            isInView
                                ? {
                                    y: "0%",
                                }
                                : {
                                    y: "118%",
                                }
                        }
                        transition={{
                            duration: 0.5,
                            delay: delay + index * 0.045,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        {word}
                    </motion.span>
                </span>
            ))}
        </p>
    );
}