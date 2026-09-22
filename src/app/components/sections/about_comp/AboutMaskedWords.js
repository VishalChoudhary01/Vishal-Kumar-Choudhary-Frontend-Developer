"use client";

import { useRef } from "react";
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
                        className="inline-block will-change-transform"
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