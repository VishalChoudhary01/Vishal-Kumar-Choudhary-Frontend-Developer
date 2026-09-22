"use client";

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

    return (
        <>
            {words.map((word, index) => (
                <span
                    key={`${word}-${index}`}
                    className="inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em] mr-[0.26em] last:mr-0"
                >
                    <motion.span
                        className="inline-block will-change-transform"
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