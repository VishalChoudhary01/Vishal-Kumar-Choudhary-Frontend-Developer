"use client";

import { useRef, useState } from "react";
import { motion,useInView } from "motion/react";

import ProjectMedia from "./ProjectMedia";
import ProjectMeta from "./ProjectMeta";
import ProjectContribution from "./ProjectContribution";
import ProjectActions from "./ProjectActions";

import {
    resolvePreset,
    toTransition,
    ENTRANCE_PRESETS,
} from "@/app/lib/motion/projectPresets";

import {
    EASE_EDITORIAL,
    PROJECT_TYPE_LABELS,
    PROJECT_VARIANTS,
    PRESENTATION_DEFAULTS,
} from "./project.constants";

export default function ProjectPresentation({
    project,
    index = 0,
    mode = "editorial",
}) {
    const cardRef = useRef(null);

    const isInView = useInView(cardRef, {
        once: true,
        margin: "-60px 0px",
    });

    const [titleHovered, setTitleHovered] = useState(false);
    const [mediaHovered, setMediaHovered] = useState(false);

    const defaults = PRESENTATION_DEFAULTS[mode] || PRESENTATION_DEFAULTS.editorial;

    const variantKey = project.presentation?.variant || defaults.variant;

    const variant = PROJECT_VARIANTS[mode]?.[variantKey] || PROJECT_VARIANTS[mode]?.[defaults.variant] || PROJECT_VARIANTS.editorial.featured;

    const entranceName = project.motion?.entrance || getDefaultEntrance(mode);

    const entrance = resolvePreset(ENTRANCE_PRESETS, entranceName);

    const hoverPreset = project.motion?.hover || defaults.hover;

    const categoryLabel = project.categoryLabel || PROJECT_TYPE_LABELS[project.type] || project.type?.toUpperCase() || null;

    const isActive = titleHovered || mediaHovered;

    const mediaFirst = mode === "visual";

    const mediaFlagship = Boolean(project.featured) && mode === "editorial";

    const projectSlug = project.slug || project.id;

    return (
        <article ref={cardRef} className="group relative" aria-label={`Project ${project.displayNumber}: ${project.name}`}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(80px,0.18fr)_minmax(0,1fr)] lg:gap-10">
                <ProjectIndex
                    project={project}
                    isActive={isActive}
                    isInView={isInView}
                    entrance={entrance.label}
                    index={index}
                />

                <div className="min-w-0">
                    <ProjectMobileIndex
                        project={project}
                        isInView={isInView}
                        entrance={entrance.label}
                        index={index}
                    />

                    <ProjectCategory
                        label={categoryLabel}
                        isInView={isInView}
                        entrance={entrance.category}
                        index={index}
                    />

                    <ProjectTitle
                        name={project.name}
                        isInView={isInView}
                        entrance={entrance.title}
                        index={index}
                        onHoverChange={setTitleHovered}
                        isActive={isActive}
                    />

                    {!mediaFirst && (
                        <ProjectDescription
                            description={project.description}
                            isInView={isInView}
                            entrance={entrance.description}
                            index={index}
                        />
                    )}

                    <div className="mt-6 sm:mt-8">
                        <ProjectMedia
                            media={project.media}
                            projectSlug={projectSlug}
                            hoverPreset={hoverPreset}
                            aspect={variant.aspect}
                            radiusClass={variant.radius}
                            isFlagship={mediaFlagship}
                            isInView={isInView}
                            entrance={entrance.media}
                            titleHovered={titleHovered}
                            onHoverChange={setMediaHovered}
                        />
                    </div>

                    {mediaFirst && (
                        <ProjectDescription
                            description={project.description}
                            isInView={isInView}
                            entrance={entrance.description}
                            index={index}
                        />
                    )}

                    <ProjectMeta
                        technologies={project.technologies || project.tags}
                        entrance={entrance.meta}
                        isInView={isInView}
                        className="mt-6 sm:mt-8"
                    />

                    <ProjectContribution
                        text={project.contribution}
                        entrance={entrance.contribution}
                        isInView={isInView}
                        className="mt-6 sm:mt-8"
                    />

                    <ProjectFeatures
                        features={project.features}
                        entrance={entrance.features}
                        isInView={isInView}
                        index={index}
                    />

                    <ProjectActions
                        slug={projectSlug}
                        links={project.links}
                        entrance={entrance.actions}
                        isInView={isInView}
                        className="mt-6"
                    />
                </div>
            </div>
        </article>
    );
}

function ProjectIndex({
    project,
    isActive,
    isInView,
    entrance,
    index,
}) {
    return (
        <motion.div
            initial={isInView ? entrance.initial : false}
            animate={isInView ? entrance.animate : entrance.initial}
            transition={{
                ...toTransition(entrance),
                delay: (entrance.delay || 0) + index * 0.06,
            }}
            className="hidden lg:flex lg:flex-col lg:pt-1"
        >
            <motion.span
                className="font-mono text-[clamp(1.8rem,3vw,2.75rem)] font-normal tabular-nums leading-none tracking-[-0.02em] text-text-muted transition-colors duration-300 ease-out"
                animate={{
                    color: isActive ? "var(--brand)" : "var(--text-muted)",
                    scale: isActive ? 1.04 : 1,
                    y: isActive ? -3 : 0,
                }}
                transition={{
                    duration: 0.3,
                    ease: EASE_EDITORIAL,
                }}
            >
                {project.displayNumber}
            </motion.span>

            {project.year && (
                <span className="mt-2 font-mono text-[0.68rem] tabular-nums tracking-[0.14em] text-text-muted">
                    {project.year}
                </span>
            )}
        </motion.div>
    );
}

function ProjectMobileIndex({
    project,
    isInView,
    entrance,
    index,
}) {
    return (
        <motion.div
            initial={isInView ? entrance.initial : false}
            animate={isInView ? entrance.animate : entrance.initial}
            transition={{
                ...toTransition(entrance),
                delay: (entrance.delay || 0) + index * 0.06,
            }}
            className="mb-5 lg:hidden"
        >
            <span className="inline-flex items-baseline gap-2.5">
                <span className="font-mono text-[1.35rem] font-normal tabular-nums leading-none tracking-[-0.02em] text-brand">
                    {project.displayNumber}
                </span>

                {project.year && (
                    <span className="font-mono text-[0.68rem] tabular-nums tracking-[0.14em] text-text-muted">
                        {project.year}
                    </span>
                )}
            </span>
        </motion.div>
    );
}

function ProjectCategory({
    label,
    isInView,
    entrance,
    index,
}) {
    if (!label) return null;

    return (
        <motion.div
            initial={isInView ? entrance.initial : false}
            animate={isInView ? entrance.animate : entrance.initial}
            transition={{
                ...toTransition(entrance),
                delay: (entrance.delay || 0) + index * 0.06,
            }}
            className="mb-2"
        >
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-muted">
                {label}
            </span>
        </motion.div>
    );
}

function ProjectTitle({
    name,
    isInView,
    entrance,
    index,
    onHoverChange,
    isActive,
}) {
    return (
        <motion.div
            initial={isInView ? entrance.initial : false}
            animate={isInView ? entrance.animate : entrance.initial}
            transition={{
                ...toTransition(entrance),
                delay: (entrance.delay || 0) + index * 0.06,
            }}
            onMouseEnter={() => onHoverChange(true)}
            onMouseLeave={() => onHoverChange(false)}
        >
            <h3
                className={[
                    "cursor-default font-display font-normal",
                    "text-[clamp(1.625rem,2.8vw,2.625rem)]",
                    "leading-[1.06] tracking-[-0.025em]",
                    "text-text-primary",
                    "transition-[transform,color] duration-300 ease-out",
                    isActive ? "text-text-primary" : "",
                ].join(" ")}
            >
                {name}
            </h3>
        </motion.div>
    );
}

function ProjectDescription({
    description,
    isInView,
    entrance,
    index,
}) {
    if (!description) return null;

    return (
        <motion.p
            initial={isInView ? entrance.initial : false}
            animate={isInView ? entrance.animate : entrance.initial}
            transition={{
                ...toTransition(entrance),
                delay: (entrance.delay || 0) + index * 0.06,
            }}
            className="mt-4 max-w-2xl font-body text-base leading-relaxed text-text-secondary"
        >
            {description}
        </motion.p>
    );
}

function ProjectFeatures({
    features,
    entrance,
    isInView,
    index,
}) {
    if (!features?.length) return null;

    return (
        <motion.ul
            initial={isInView ? entrance.initial : false}
            animate={isInView ? entrance.animate : entrance.initial}
            transition={{
                ...toTransition(entrance),
                delay: (entrance.delay || 0) + index * 0.06,
            }}
            className="mt-5 space-y-1.5"
            aria-label="Key features"
        >
            {features.slice(0, 4).map((feature) => (
                <li
                    key={feature}
                    className="flex items-baseline gap-2 font-body text-sm leading-relaxed text-text-tertiary"
                >
                    <span
                        aria-hidden="true"
                        className="mt-[0.4em] h-[3px] w-[3px] shrink-0 rounded-full bg-brand opacity-60"
                    />

                    <span>{feature}</span>
                </li>
            ))}
        </motion.ul>
    );
}

function getDefaultEntrance(mode) {
    if (mode === "interactive") {
        return "interactiveReveal";
    }

    if (mode === "product") {
        return "productReveal";
    }

    return "editorialReveal";
}