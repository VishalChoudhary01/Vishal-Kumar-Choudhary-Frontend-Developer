"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

const EASE = [0.22, 1, 0.36, 1];

export default function AboutCapabilityCard({
    capability,
    index = 0,
    isMobile = false,
    entranceDelay = 0.25,
}) {
    const ref = useRef(null);

    const isInView = useInView(ref, {
        once: true,
        margin: "-30% 0px -20% 0px",
    });

    const desktopInitialX =
        index === 0 ? 0 : index === 1 ? -150 : -250;

    const initial = isMobile
        ? {
            opacity: 0,
            y: 10,
        }
        : {
            opacity: 0,
            x: desktopInitialX,
            y: index === 0 ? 0 : -3,
        };

    const animate = isInView
        ? isMobile
            ? {
                opacity: 1,
                y: 0,
            }
            : {
                opacity: 1,
                x: 0,
                y: 0,
            }
        : initial;

    const cardDelay =
        entranceDelay + index * (isMobile ? 0.08 : 0.1);

    return (
        <motion.div
            ref={ref}
            className="group relative cursor-pointer overflow-hidden bg-surface-1 p-6 transition-colors sm:p-7"
            initial={initial}
            animate={animate}
            transition={{
                duration: isMobile ? 0.5 : 0.7,
                delay: cardDelay,
                ease: EASE,
            }}
        >
            {/* WATERMARK NUMBER */}

            <span
                className="pointer-events-none absolute bottom-[-0.15em] right-2 select-none font-display text-brand text-[clamp(5rem,8vw,8rem)] leading-[1] tracking-[-0.04em] opacity-[0.07] transition-opacity duration-300 group-hover:opacity-[0.12]"
                aria-hidden="true"
            >
                <motion.span
                    className="block"
                    initial={{
                        opacity: 0,
                        scale: 0.96,
                        y: 8,
                    }}
                    animate={
                        isInView
                            ? {
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }
                            : {
                                opacity: 0,
                                scale: 0.96,
                                y: 8,
                            }
                    }
                    transition={{
                        duration: 0.5,
                        delay: cardDelay + 0.42,
                        ease: EASE,
                    }}
                >
                    {capability.index}
                </motion.span>
            </span>

            {/* TITLE */}

            <motion.p
                className="relative type-metadata text-brand transition-transform duration-200 group-hover:translate-x-[2px]"
                initial={{
                    opacity: 0,
                    y: 6,
                }}
                animate={
                    isInView
                        ? {
                            opacity: 1,
                            y: 0,
                        }
                        : {
                            opacity: 0,
                            y: 6,
                        }
                }
                transition={{
                    duration: 0.4,
                    delay: cardDelay + 0.08,
                    ease: EASE,
                }}
            >
                {capability.title}
            </motion.p>

            {/* SEPARATOR */}

            <div className="relative mt-4 h-px w-[35%] transition-[width] duration-300 group-hover:w-full">
                <motion.div
                    className="absolute inset-0 origin-left bg-foreground/20"
                    initial={{
                        opacity: 0,
                        scaleX: 0,
                    }}
                    animate={
                        isInView
                            ? {
                                opacity: 1,
                                scaleX: 1,
                            }
                            : {
                                opacity: 0,
                                scaleX: 0,
                            }
                    }
                    transition={{
                        duration: 0.4,
                        delay: cardDelay + 0.2,
                        ease: EASE,
                    }}
                />
            </div>

            {/* ITEMS */}

            <ul className="relative mt-5 space-y-2">
                {capability.items.map((item, itemIndex) => (
                    <motion.li
                        key={item}
                        className="type-body-small text-text-secondary transition-colors duration-200 group-hover:text-text-primary"
                        initial={{
                            opacity: 0,
                            y: 5,
                        }}
                        animate={
                            isInView
                                ? {
                                    opacity: 1,
                                    y: 0,
                                }
                                : {
                                    opacity: 0,
                                    y: 5,
                                }
                        }
                        transition={{
                            duration: 0.35,
                            delay:
                                cardDelay +
                                0.28 +
                                itemIndex * 0.055,
                            ease: EASE,
                        }}
                    >
                        {item}
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
}