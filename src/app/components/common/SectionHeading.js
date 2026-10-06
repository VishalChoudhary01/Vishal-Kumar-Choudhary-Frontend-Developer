"use client";

import { useRef } from "react";
import { useInView } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";

import SectionHeadingWords from "./section_heading_comp/SectionHeadingWords";
import SectionHeadingDatum from "./section_heading_comp/SectionHeadingDatum";
import SectionEyebrow from "./SectionEyebrow";

const TEXT_ALIGN = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
};

export default function SectionHeading({
    label,
    supporting,
    align = "left",
    supportingId,
    number,
}) {
    const ref = useRef(null);

    const reducedMotion = useReducedMotion();

    const isInView = useInView(ref, {
        once: true,
        margin: "-60px 0px",
    });

    const shouldAnimate = !reducedMotion;
    const show = reducedMotion || isInView;

    const wordCount = supporting
        ? supporting.trim().split(/\s+/).length
        : 0;

    const wordSteps =
        wordCount > 0
            ? 0.1 + (wordCount - 1) * 0.055
            : 0.1;

    return (
        <div
            ref={ref}
            className="select-none"
        >
            {label && (
                <SectionEyebrow
                    label={label}
                    number={number}
                    align={align}
                />
            )}

            {supporting && (
                <h2
                    id={supportingId}
                    className={[
                        "mt-4",
                        "md:mt-6",
                        "font-display",
                        "font-normal",
                        "text-text-primary",
                        "opacity-85",

                        "text-[clamp(1.75rem,3.2vw,3.25rem)]",
                        "leading-[1.02]",
                        "tracking-[-0.03em]",

                        TEXT_ALIGN[align],
                    ].join(" ")}
                >
                    <SectionHeadingWords
                        text={supporting}
                        mask={shouldAnimate}
                        show={show}
                    />
                </h2>
            )}

            {supporting && (
                <SectionHeadingDatum
                    mask={shouldAnimate}
                    show={show}
                    align={align}
                    delayBase={wordSteps}
                />
            )}
        </div>
    );
}