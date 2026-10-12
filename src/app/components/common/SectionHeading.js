"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useInView } from "motion/react";

import { cn } from "@/app/lib/utils";

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
    datum = true,
}) {
    const ref = useRef(null);

    /* Hydration-safe reduced-motion signal: the server pass and the first
       client render MUST agree (both assume animated-enabled), otherwise
       React reports a hydration mismatch on the masked word spans. The
       actual preference is subscribed afterwards via useSyncExternalStore,
       which re-renders without touching the server-rendered markup. */
    const subscribeMedia = (callback) => {
        const mediaQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );
        mediaQuery.addEventListener("change", callback);
        return () => mediaQuery.removeEventListener("change", callback);
    };
    const reducedMotion = useSyncExternalStore(
        subscribeMedia,
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        () => false
    );

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
                    className={cn(
                        "mt-4",
                        "md:mt-6",
                        "font-display",
                        "font-normal",
                        "text-text-primary",
                        "opacity-85",
                        "text-[clamp(1.75rem,3.2vw,3.25rem)]",
                        "leading-[1.02]",
                        "tracking-[-0.03em]",
                        TEXT_ALIGN[align]
                    )}
                >
                    <SectionHeadingWords
                        text={supporting}
                        mask={shouldAnimate}
                        show={show}
                    />
                </h2>
            )}

            {supporting && datum && (
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