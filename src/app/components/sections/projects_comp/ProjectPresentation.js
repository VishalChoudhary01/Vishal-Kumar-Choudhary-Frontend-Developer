"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";

import ProjectMedia from "./ProjectMedia";
import ProjectMeta from "./ProjectMeta";
import ProjectActions from "@/app/components/common/ProjectActions";

import {
    resolvePreset,
    toTransition,
    ENTRANCE_PRESETS,
} from "@/app/lib/motion/projectPresets";

import {
    getProjectCardMeta,
    getProjectCardTechnologies,
} from "@/app/lib/projectHelpers";

import {
    PROJECT_VARIANTS,
    PRESENTATION_DEFAULTS,
} from "./project.constants";

/* Discovery card technology limits — desktop shows more, mobile fewer.
   `technologies` in the project data stays the canonical complete list. */
const CARD_TECH_LIMIT_DESKTOP = 6;
const CARD_TECH_LIMIT_MOBILE = 4;

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

    const cardMeta = getProjectCardMeta(project);

    const cardTechnologies = getProjectCardTechnologies(
        project,
        CARD_TECH_LIMIT_DESKTOP
    );

    const isActive = titleHovered || mediaHovered;

    const mediaFirst = mode === "visual";

    const mediaFlagship = Boolean(project.featured) && mode === "editorial";

    return (
        <article ref={cardRef} className="group relative" aria-label={`Project: ${project.name}`}>
            <div className="min-w-0">
                <ProjectMetaLine
                    label={cardMeta}
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

                <div className="mt-4 sm:mt-5">
                    <ProjectMedia
                        media={project.media}
                        liveHref={project.links?.live}
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
                    technologies={cardTechnologies}
                    mobileLimit={CARD_TECH_LIMIT_MOBILE}
                    entrance={entrance.meta}
                    isInView={isInView}
                    className="mt-4 sm:mt-5"
                />

                <ProjectActions
                    project={project}
                    context="card"
                    entrance={entrance.actions}
                    isInView={isInView}
                    className="mt-4 sm:mt-5"
                />
            </div>
        </article>
    );
}

function ProjectMetaLine({
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
            className="mb-3 sm:mb-4"
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

function getDefaultEntrance(mode) {
    if (mode === "interactive") {
        return "interactiveReveal";
    }

    if (mode === "product") {
        return "productReveal";
    }

    return "editorialReveal";
}
