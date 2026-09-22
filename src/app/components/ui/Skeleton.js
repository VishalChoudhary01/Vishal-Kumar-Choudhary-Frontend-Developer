"use client";

/**
 * Skeleton — minimal animated placeholder.
 *
 * Accepts Tailwind classes via `className` so it can take any shape.
 * Uses the project's CSS custom properties for brand-consistent colors.
 */
export default function Skeleton({
    className = "",
    rounded = "rounded-xl",
    ...props
}) {
    return (
        <div
            role="presentation"
            aria-hidden="true"
            className={[
                "relative overflow-hidden",
                "bg-surface-2",
                rounded,
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            {...props}
        >
            {/* shimmer sweep */}
            <div
                className={[
                    "absolute inset-0",
                    "-translate-x-full",
                    "animate-[shimmer_1.8s_ease-in-out_infinite]",
                    "bg-gradient-to-r",
                    "from-transparent via-white/15 to-transparent",
                ].join(" ")}
            />

            <style>{`
                @keyframes shimmer {
                    0%   { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
