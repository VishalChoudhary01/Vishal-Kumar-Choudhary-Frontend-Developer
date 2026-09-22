"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

import SkillPrimary from "./SkillPrimary";
import SkillSupporting from "./SkillSupporting";
import SkillContext from "./SkillContext";

const EASE = [0.22, 1, 0.36, 1];

const RISE = {
    number: {
        y: 16,
        delay: 0,
    },
    title: {
        y: 12,
        delay: 0.06,
    },
    primary: {
        y: 10,
        delay: 0.12,
    },
    supporting: {
        y: 8,
        delay: 0.18,
    },
    context: {
        y: 6,
        delay: 0.24,
    },
};

export default function SkillCategory({
    category,
    animate = false,
    active = false,
    onVisible,
}) {
    const ref = useRef(null);

    const isInView = useInView(ref, {
        once: true,
        margin: "-25% 0px -10% 0px",
    });

    const [hoverNote, setHoverNote] = useState(null);
    const [selectedSkill, setSelectedSkill] = useState(null);

    useEffect(() => {
        if (isInView && onVisible) {
            onVisible(category.id);
        }
    }, [isInView, onVisible, category.id]);

    const contextText =
        hoverNote ??
        selectedSkill?.note ??
        category.context;

    const getMotionProps = (key) => {
        if (!animate) {
            return {};
        }

        return {
            initial: {
                opacity: 0,
                y: RISE[key].y,
            },
            animate: isInView
                ? {
                    opacity: 1,
                    y: 0,
                }
                : {
                    opacity: 0,
                    y: RISE[key].y,
                },
            transition: {
                duration: 0.6,
                delay: RISE[key].delay,
                ease: EASE,
            },
        };
    };

    const handleHoverStart = (skill) => {
        if (!skill?.note) {
            return;
        }

        setHoverNote(skill.note);
    };

    const handleHoverEnd = () => {
        setHoverNote(null);
    };

    const handleSkillSelect = (skill) => {
        if (!skill?.note) {
            return;
        }

        setSelectedSkill((current) =>
            current?.name === skill.name
                ? null
                : skill
        );
    };

    return (
        <li
            ref={ref}
            className={`group relative border-t border-border py-6 sm:py-7 md:py-9 ${animate ? "md:[perspective:1200px]" : ""}`}
        >
            {animate && (
                <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-brand to-transparent transition-[width,opacity] duration-500 ease-out ${active ? "w-[30%] opacity-40 md:group-hover:w-full md:group-hover:opacity-60" : "w-0 opacity-0 md:group-hover:w-full md:group-hover:opacity-60"}`}
                />
            )}

            <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-baseline gap-x-4 sm:grid-cols-[3.75rem_minmax(0,1fr)] sm:gap-x-6 md:grid-cols-[4.5rem_minmax(0,1fr)] md:gap-x-8 lg:gap-x-10">
                <SkillNumeral
                    number={category.number}
                    animate={animate}
                    active={active}
                    motionProps={getMotionProps("number")}
                    interactive={animate}
                />

                <div
                    className={`min-w-0 ${animate ? "transition-transform duration-300 ease-out md:group-hover:translate-x-1.5" : ""}`}
                >
                    <SkillTitle
                        title={category.title}
                        animate={animate}
                        motionProps={getMotionProps("title")}
                    />

                    <SkillPrimary
                        category={category}
                        animate={animate}
                        interactive
                        selectedSkill={selectedSkill}
                        motionProps={getMotionProps("primary")}
                        onHoverStart={handleHoverStart}
                        onHoverEnd={handleHoverEnd}
                        onSelect={handleSkillSelect}
                    />

                    <SkillSupporting
                        skills={category.supporting}
                        animate={animate}
                        interactive={animate}
                        motionProps={getMotionProps("supporting")}
                    />

                    <SkillContext
                        text={contextText}
                        hoverNote={hoverNote}
                        animate={animate}
                        interactive={animate}
                        motionProps={getMotionProps("context")}
                    />
                </div>
            </div>
        </li>
    );
}

function SkillNumeral({
    number,
    animate,
    active,
    motionProps,
    interactive,
}) {
    const className = `block font-mono text-[clamp(1.6rem,2.4vw,2.25rem)] font-normal tabular-nums leading-none tracking-[-0.02em] text-brand transition-[opacity,transform] duration-300 ease-out will-change-transform ${active ? "opacity-90" : "opacity-60"} ${interactive ? "md:group-hover:opacity-100 md:group-hover:[transform:rotateX(6deg)_translateY(-2px)_scale(1.05)]" : ""}`;

    if (!animate) {
        return (
            <span
                aria-hidden="true"
                className={className}
            >
                {number}
            </span>
        );
    }

    return (
        <motion.span
            className="block"
            {...motionProps}
        >
            <span
                aria-hidden="true"
                className={className}
            >
                {number}
            </span>
        </motion.span>
    );
}

function SkillTitle({
    title,
    animate,
    motionProps,
}) {
    if (!animate) {
        return (
            <h3 className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-text-primary">
                {title}
            </h3>
        );
    }

    return (
        <motion.h3
            className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-text-primary"
            {...motionProps}
        >
            {title}
        </motion.h3>
    );
}