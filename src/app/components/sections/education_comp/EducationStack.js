"use client";

import { motion, useTransform } from "motion/react";

import EducationCard from "./EducationCard";
import { educationData } from "./education.data";
import {
    depthOf,
    focalFraction,
} from "./education.motion";

export default function EducationStack({
    profile,
    pinProgress,
}) {
    const { records, total } = educationData;

    return (
        <ol
            aria-label="Academic archive"
            className="relative grid h-full list-none grid-cols-[100%] grid-rows-[100%]"
            style={{
                perspective: `${profile.perspective}px`,
                transformStyle: "preserve-3d",
            }}
        >
            {records.map((item, index) => (
                <PinnedRecord
                    key={item.id}
                    item={item}
                    index={index}
                    total={total}
                    pinProgress={pinProgress}
                    profile={profile}
                />
            ))}
        </ol>
    );
}

function PinnedRecord({
    item,
    index,
    total,
    pinProgress,
    profile,
}) {
    const r = useTransform(
        pinProgress,
        (progress) =>
            index - focalFraction(progress, total)
    );

    const y = useTransform(r, (value) =>
        depthOf(value, profile).y
    );

    const z = useTransform(r, (value) =>
        depthOf(value, profile).z
    );

    const scale = useTransform(r, (value) =>
        depthOf(value, profile).scale
    );

    const opacity = useTransform(r, (value) =>
        depthOf(value, profile).opacity
    );

    const content = useTransform(r, (value) =>
        depthOf(value, profile).content
    );

    const rotate = useTransform(r, (value) =>
        depthOf(value, profile).rotate
    );

    return (
        <motion.li
            data-index={index}
            className="relative min-w-0 w-[min(100%,640px)] place-self-center will-change-[transform,opacity] [grid-area:1/1]"
            style={{
                y,
                z,
                scale,
                opacity,
                rotate,
            }}
        >
            <EducationCard
                item={item}
                contentOpacity={content}
            />
        </motion.li>
    );
}