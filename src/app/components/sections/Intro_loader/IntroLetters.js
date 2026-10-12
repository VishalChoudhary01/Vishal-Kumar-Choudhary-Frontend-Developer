"use client";

import { motion } from "motion/react";

function IntroLetters({ reducedMotion, LETTERS, LETTERS_REDUCED, }) {
    const letters = reducedMotion ? LETTERS_REDUCED : LETTERS;

    /*
     * Wait until the final letter has completely finished.
     *
     * Final letter:
     * delay    = 1.18s
     * duration = 0.65s
     *
     * Finish = 1.83s
     *
     * Then wait another 0.15s before revealing the dots.
     */
    const lastLetter = letters[letters.length - 1];

    const dotsDelay = reducedMotion
        ? 0
        : lastLetter.transition.delay +
        lastLetter.transition.duration +
        0.15;

    return (
        <div className=" flex items-baseline justify-center whitespace-nowrap font-display font-normal text-text-primary text-[clamp(1.8rem,10vw,3rem)] tracking-[0.08em] sm:text-[clamp(2.2rem,6vw,4rem)] sm:tracking-[0.14em] lg:text-[clamp(2.5rem,5vw,4.5rem)] lg:tracking-[0.16em] " aria-label="Crafting" >
            {/* CRAFTING LETTERS */}

            {letters.map((letter, index) => (
                <motion.span
                    key={`crafting-${letter.char}-${index}`}
                    className=" inline-block will-change-[transform,opacity] "
                    initial={letter.initial}
                    animate={letter.animate}
                    transition={letter.transition}
                >
                    {letter.char}
                </motion.span>
            ))}

            {/* ANIMATED DOTS */}

            <motion.span className=" ml-[0.12em] inline-flex items-baseline gap-[0.08em] align-baseline "
                aria-hidden="true"
                initial={{
                    opacity: reducedMotion ? 1 : 0,
                }}
                animate={{
                    opacity: 1,
                }}
                transition={{
                    duration: reducedMotion ? 0 : 0.3,
                    delay: dotsDelay,
                    ease: [0.16, 1, 0.3, 1],
                }}
            >
                {[0, 1, 2].map((index) => (
                    <motion.span key={`crafting-dot-${index}`} className=" inline-block shrink-0 h-[0.12em] w-[0.12em] rounded-full bg-text-primary align-baseline will-change-[transform,opacity] "
                        initial={{
                            opacity: reducedMotion ? 1 : 0.35,
                            y: 0,
                        }}
                        animate={
                            reducedMotion
                                ? {
                                    opacity: 1,
                                    y: 0,
                                }
                                : {
                                    opacity: [0.35, 1, 0.35],
                                    y: [0, -2, 0],
                                }
                        }
                        transition={{
                            duration: 0.8,
                            delay: reducedMotion
                                ? 0
                                : dotsDelay + index * 0.12,
                            repeat: reducedMotion ? 0 : Infinity,
                            repeatDelay: 0.15,
                            ease: [0.4, 0, 0.2, 1],
                        }}
                    />
                ))}
            </motion.span>
        </div>
    );
}

export default IntroLetters;