"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/app/lib/utils";

export default function FooterSocialButton({
    href,
    label,
    icon: Icon,
    isExternal = true,
}) {
    return (
        <Link
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            aria-label={label}
            title={label}
            className={cn(
                "group relative grid size-10 place-items-center",
                "overflow-hidden rounded-full",

                "border border-border-subtle",
                "bg-surface-1/30",
                "text-text-tertiary",

                "transition-[border-color,background-color,color]",
                "duration-300",

                "hover:border-brand/30",
                "hover:bg-surface-2/60",
                "hover:text-text-primary",

                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-brand",
                "focus-visible:ring-offset-2",
                "focus-visible:ring-offset-background",
            )}
        >
            {/* Subtle hover surface */}
            <span
                aria-hidden="true"
                className={cn(
                    "pointer-events-none absolute inset-0 rounded-full",
                    "bg-brand/[0.035]",
                    "opacity-0",
                    "transition-opacity duration-300",
                    "group-hover:opacity-100",
                    "group-focus-visible:opacity-100",
                )}
            />

            {/* =====================================================
                ORIGINAL SOCIAL ICON
                Center → travels upward
            ===================================================== */}
            <span
                aria-hidden="true"
                className={cn(
                    "grid place-items-center",

                    "text-text-tertiary",

                    // Same animation idea as your reference
                    "transition-transform",
                    "duration-[320ms]",
                    "ease-[cubic-bezier(.22,1,.36,1)]",

                    "group-hover:-translate-y-[260%]",
                    "group-focus-visible:-translate-y-[260%]",

                    "motion-reduce:transition-none",

                    // Keep brand icon visually light
                    "[&_svg]:size-[16px]",
                    "[&_svg]:shrink-0",
                )}
            >
                <Icon className="block" />
            </span>

            {/* =====================================================
                ARROW
                Bottom → center
            ===================================================== */}
            <span
                aria-hidden="true"
                className={cn(
                    "absolute grid place-items-center",

                    // Hidden below button initially
                    "translate-y-[260%]",

                    "text-brand",

                    // EXACT same animation curve/timing
                    "transition-transform",
                    "duration-[320ms]",
                    "ease-[cubic-bezier(.22,1,.36,1)]",

                    "group-hover:translate-y-0",
                    "group-focus-visible:translate-y-0",

                    "motion-reduce:transition-none",
                )}
            >
                <ArrowUpRight
                    size={16}
                    strokeWidth={1.7}
                    className="block"
                />
            </span>
        </Link>
    );
}