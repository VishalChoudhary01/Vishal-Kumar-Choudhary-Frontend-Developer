"use client";

import { cn } from "@/app/lib/utils";

export default function FooterIdentity({
    name = "",
    role = "",
    show = false,
    reduced = false,
}) {
    return (
        <div
            className={cn(
                "shrink-0",
                show ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
                reduced ? "transition-none" : "transition-all duration-700 ease-out",
            )}
        >
            <div className="grid max-w-[60%] grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-text-tertiary">
                    {name}
                </p>

                <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-text-muted">
                    {role}
                </p>
            </div>
        </div>
    );
}