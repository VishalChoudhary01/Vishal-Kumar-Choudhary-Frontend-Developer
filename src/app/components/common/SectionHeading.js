"use client";

import { useRef } from "react";
import { useInView } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";

import SectionHeadingWords from "./section_heading_comp/SectionHeadingWords";
import SectionHeadingDatum from "./section_heading_comp/SectionHeadingDatum";
import SectionEyebrow from "./SectionEyebrow";

import {
    EDITORIAL_SIZE,
    MINIMAL_SIZE,
    TEXT_ALIGN,
} from "./section_heading_comp/sectionHeading.constants";

export default function SectionHeading({
    heading,
    supporting,
    align = "left",
    contentAlign,
    variant = "editorial",
    size = "default",
    className = "",
    supportingClassName = "",
    animate = true,
    once = true,
    supportingId,
    label,
    title,
    number,
}) {
    const resolvedHeading = heading ?? label;
    const resolvedSupporting = supporting ?? title;
    const resolvedContentAlign = contentAlign ?? align;

    const prefersReduced = useReducedMotion();
    const shouldAnimate = animate && !prefersReduced;

    const ref = useRef(null);

    const isInView = useInView(ref, {
        once,
        margin: "-60px 0px",
    });

    const mask = shouldAnimate;
    const show = shouldAnimate ? isInView : true;

    const isEditorial = variant === "editorial";

    const supportingSize = isEditorial
        ? EDITORIAL_SIZE[size] || EDITORIAL_SIZE.default
        : MINIMAL_SIZE[size] || MINIMAL_SIZE.default;

    const wordCount = resolvedSupporting
        ? resolvedSupporting.split(" ").length
        : 0;

    const wordSteps =
        wordCount > 0
            ? 0.1 + (wordCount - 1) * 0.055
            : 0.1;

    return (
        <div
            ref={ref}
            className={`${className} select-none`}
        >
            {resolvedHeading && (
                <SectionEyebrow
                    label={resolvedHeading}
                    number={number}
                    align={align}
                />
            )}

            {resolvedSupporting && (
                <h2
                    id={supportingId}
                    className={`
                        mt-4
                        md:mt-6
                        ${isEditorial
                            ? `
                                    font-display
                                    font-normal
                                    text-text-primary
                                    opacity-85
                                    ${supportingSize}
                                `
                            : `
                                    font-body
                                    font-medium
                                    text-text-primary
                                    ${supportingSize}
                                `
                        }
                        ${TEXT_ALIGN[resolvedContentAlign]}
                        ${supportingClassName}
                    `}
                >
                    <SectionHeadingWords
                        text={resolvedSupporting}
                        mask={mask}
                        show={show}
                        startDelay={0.1}
                    />
                </h2>
            )}

            {isEditorial && resolvedSupporting && (
                <SectionHeadingDatum
                    mask={mask}
                    show={show}
                    align={align}
                    delayBase={wordSteps}
                />
            )}
        </div>
    );
}