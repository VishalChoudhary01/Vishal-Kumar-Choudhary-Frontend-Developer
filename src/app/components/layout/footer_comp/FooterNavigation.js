"use client";

import Link from "next/link";
import { cn } from "@/app/lib/utils";

export default function FooterNavigation({ items = [] }) {
    return (
        <nav aria-label="Footer navigation">
            <ul className="grid grid-cols-2 gap-x-7 gap-y-3 md:flex md:flex-wrap md:items-baseline md:gap-x-9 md:gap-y-4 ">
                {items.map((item) => {
                    if (!item.href) {
                        return null;
                    }

                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={cn(
                                    "group relative inline-block py-0.5 font-mono text-[0.68rem] uppercase tracking-[0.12em]",
                                    "text-text-secondary transition-colors duration-200",
                                    "hover:text-text-primary",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                                    "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                )}
                            >
                                {item.label}

                                <span
                                    aria-hidden="true"
                                    className="absolute bottom-[-2px] left-0 h-px w-full origin-left scale-x-0 bg-brand transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
                                />
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}