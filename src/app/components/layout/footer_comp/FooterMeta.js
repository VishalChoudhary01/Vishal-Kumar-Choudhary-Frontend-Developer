"use client";

import { cn } from "@/app/lib/utils";

const BASE_META_CLASS = "font-mono uppercase leading-none";

export default function FooterMeta({
    year = new Date().getFullYear(),
    location = "",
    stack = "",
    endMarker = "",
    show = false,
    reduced = false,
}) {
    return (
        <div
            className={cn(
                "mt-12 shrink-0 sm:mt-14 lg:mt-16",
                show ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                reduced ? "transition-none" : "transition-all duration-700 ease-out",
            )}
        >
            <div
                className="mb-5 h-px w-full bg-border-subtle sm:mb-6"
                aria-hidden="true"
            />

            <div className="grid grid-cols-1 items-baseline gap-2.5 text-center sm:grid-cols-2 sm:gap-x-8 sm:gap-y-3 sm:text-left md:grid-cols-[1fr_1fr_1.35fr_auto] md:gap-6">
                <p
                    className={cn(
                        BASE_META_CLASS,
                        "text-[0.6rem] font-medium tracking-[0.1em] text-text-tertiary sm:text-[0.62rem]",
                    )}
                >
                    © {year}
                </p>

                <p
                    className={cn(
                        BASE_META_CLASS,
                        "text-[0.58rem] font-normal tracking-[0.1em] text-text-tertiary sm:text-[0.6rem]",
                    )}
                >
                    {location}
                </p>

                <p
                    className={cn(
                        BASE_META_CLASS,
                        "text-[0.54rem] font-normal tracking-[0.08em] text-text-muted sm:text-[0.56rem]",
                    )}
                >
                    {stack}
                </p>

                <p
                    className={cn(
                        BASE_META_CLASS,
                        "text-[0.52rem] font-normal tracking-[0.14em] text-text-muted sm:text-[0.54rem] md:text-right",
                    )}
                >
                    {endMarker}
                </p>
            </div>
        </div>
    );
}