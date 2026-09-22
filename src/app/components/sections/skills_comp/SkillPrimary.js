"use client";

import { Fragment } from "react";
import { motion } from "motion/react";

import SkillIcon from "./SkillIcon";

export default function SkillPrimary({
    category,
    animate,
    interactive,
    selectedSkill,
    motionProps,
    onHoverStart,
    onHoverEnd,
    onSelect,
}) {
    const content = (
        <>
            {category.primary.map((skill, index) => (
                <Fragment key={skill.name}>
                    {index > 0 && <SkillSeparator />}

                    <SkillItem
                        skill={skill}
                        interactive={interactive}
                        selected={
                            selectedSkill?.name === skill.name
                        }
                        onHoverStart={onHoverStart}
                        onHoverEnd={onHoverEnd}
                        onSelect={onSelect}
                    />
                </Fragment>
            ))}
        </>
    );

    if (!animate) {
        return (
            <p className="mt-3 flex flex-wrap items-center gap-2 font-body text-base text-text-secondary">
                {content}
            </p>
        );
    }

    return (
        <motion.div
            className="mt-3"
            {...motionProps}
        >
            <div className="flex flex-wrap items-center gap-2 md:items-baseline md:gap-x-2.5 md:gap-y-2">
                {content}
            </div>
        </motion.div>
    );
}

function SkillItem({
    skill,
    interactive,
    selected,
    onHoverStart,
    onHoverEnd,
    onSelect,
}) {
    const canInteract =
        interactive && Boolean(skill.note);

    if (!canInteract) {
        return (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-body text-base font-medium text-text-secondary md:items-baseline">
                {skill.icon && (
                    <SkillIcon
                        name={skill.icon}
                        className="h-[0.95em] w-[0.95em] shrink-0"
                    />
                )}

                <span>{skill.name}</span>
            </span>
        );
    }

    return (
        <button
            type="button"
            aria-label={`Explore ${skill.name}`}
            aria-pressed={selected}
            onMouseEnter={() => onHoverStart(skill)}
            onMouseLeave={onHoverEnd}
            onFocus={() => onHoverStart(skill)}
            onBlur={onHoverEnd}
            onClick={() => onSelect(skill)}
            className={[
                "group/item relative inline-flex cursor-pointer items-center gap-1.5",
                "font-body text-sm font-medium leading-none",
                "outline-none",
                "transition-[transform,color,background-color,border-color] duration-200 ease-out",
                "focus-visible:outline-none",
                "focus-visible:ring-1 focus-visible:ring-brand/50",

                "rounded-full border border-border-subtle",
                "px-2.5 py-1.5",
                "bg-surface-1/40",

                "text-text-secondary",

                "hover:-translate-y-px",
                "hover:border-brand/40",
                "hover:text-brand",

                selected
                    ? "border-brand/50 bg-brand/5 text-brand"
                    : "",

                "md:rounded-none",
                "md:border-0",
                "md:border-b",
                "md:border-border-subtle",
                "md:bg-transparent",
                "md:px-0",
                "md:py-0.5",
                "md:text-base",
                "md:leading-normal",
                "md:hover:-translate-y-[1.5px]",
                "md:hover:scale-[1.02]",
                selected
                    ? "md:border-brand md:bg-transparent"
                    : "",
            ].join(" ")}
        >
            {skill.icon && (
                <SkillIcon
                    name={skill.icon}
                    className={[
                        "h-[0.9em] w-[0.9em] shrink-0",
                        "transition-[color,transform] duration-200",
                        selected
                            ? "text-brand"
                            : "text-text-secondary group-hover/item:text-brand group-focus-visible/item:text-brand",
                    ].join(" ")}
                />
            )}

            <span className="whitespace-nowrap">
                {skill.name}
            </span>

            <span
                aria-hidden="true"
                className={[
                    "font-mono text-[0.7em]",
                    "transition-[transform,opacity] duration-200",
                    selected
                        ? "translate-x-0.5 opacity-100"
                        : "opacity-50 group-hover/item:translate-x-0.5 group-hover/item:opacity-100 group-focus-visible/item:translate-x-0.5 group-focus-visible/item:opacity-100",
                ].join(" ")}
            >
                {selected ? "×" : "↗"}
            </span>

            <span className="sr-only">
                {selected
                    ? "Details open"
                    : "Interactive skill"}
            </span>
        </button>
    );
}

function SkillSeparator() {
    return (
        <span
            aria-hidden="true"
            className="hidden select-none text-text-tertiary md:inline"
        >
            ·
        </span>
    );
}