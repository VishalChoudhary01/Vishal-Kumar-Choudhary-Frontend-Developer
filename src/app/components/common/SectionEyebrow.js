"use client";

import { cn } from "@/app/lib/utils";

import SectionNumber from "./eyebrow/SectionNumber";
import StaggeredEyebrow from "./eyebrow/StaggeredEyebrow";

export default function SectionEyebrow({
    label = "INTRODUCTION",
    number = "01",
    align = "left",
    className = "",
}) {
    return (
        <span
            className={cn(
                "relative inline-block overflow-visible",
                className
            )}
        >
            <SectionNumber
                number={number}
                align={align}
            />

            <StaggeredEyebrow
                label={label}
            />
        </span>
    );
}