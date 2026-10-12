"use client";

import MotionNumber from "@/app/components/motion/MotionNumber/MotionNumber";
import { cn } from "@/app/lib/utils";

export default function ContactMessageCounter({
    value = "",
    maxLength = 1200,
}) {
    const count = value.length;
    const isLimitReached = count >= maxLength;

    return (
        <p
            className={cn(
                "pointer-events-none mt-2 text-right font-mono text-[10px]",
                isLimitReached ? "text-error" : "text-text-tertiary",
            )}
            aria-live="polite"
        >
            <MotionNumber
                value={count}
                digitClassName="min-w-[0.58em]"
            />
            <span aria-hidden="true">
                {" / "}
                {maxLength}
            </span>
        </p>
    );
}