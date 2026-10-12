"use client";

import { cn } from "@/app/lib/utils";

export default function Skeleton({ className = "", rounded = "rounded-xl", shimmer = true, ...props }) {
    return (
        <div role="presentation" aria-hidden="true" className={cn("skeleton relative isolate overflow-hidden bg-surface-2 motion-safe:animate-[skeleton-pulse_2.4s_ease-in-out_infinite]", rounded, className)} {...props}>
            {shimmer && (
                <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", rounded)}>
                    <div className="absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] bg-linear-to-r from-transparent via-black/[0.04] to-transparent dark:via-white/[0.055] motion-safe:animate-[skeleton-shimmer_2.2s_ease-in-out_infinite]" />
                </div>
            )}
            <style>{`
                @keyframes skeleton-pulse {
                    0%, 100% { opacity: 0.72; }
                    50% { opacity: 1; }
                }
                @keyframes skeleton-shimmer {
                    0% { transform: translateX(-20%) skewX(-18deg); }
                    100% { transform: translateX(320%) skewX(-18deg); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .skeleton, .skeleton > div > div { animation: none !important; }
                }
            `}</style>
        </div>
    );
}