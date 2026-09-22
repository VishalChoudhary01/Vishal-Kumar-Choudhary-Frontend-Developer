"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

function getShortName(name = "") {
    const words = name.trim().split(/\s+/);

    if (words.length <= 2) return name;

    return words.slice(0, 2).join(" ") + "…";
}

export default function ProjectNavigationItem({ project, direction }) {
    const isPrevious = direction === "previous";
    const shortName = getShortName(project.name);

    return (
        <Link
            href={project.href}
            title={project.name}
            aria-label={`${isPrevious ? "Previous" : "Next"} project: ${project.name}`}
            className={`group flex min-w-0 items-center gap-2 py-4 outline-none sm:gap-3 sm:py-5 ${isPrevious ? "justify-start" : "justify-end text-right"
                }`}
        >
            {isPrevious && (
                <ArrowLeft
                    size={14}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="shrink-0 text-text-muted transition-transform duration-300 group-hover:-translate-x-1 group-hover:text-brand group-focus-visible:-translate-x-1 group-focus-visible:text-brand"
                />
            )}

            <div className="min-w-0">
                <p className="font-mono text-[0.58rem]   hover:text-brand uppercase tracking-[0.15em] text-text-muted transition-colors duration-300 group-hover:text-brand group-focus-visible:text-brand sm:text-[0.63rem]">
                    {isPrevious ? "Previous" : "Next"}
                </p>

                <p className="mt-0.5 max-w-[9rem] truncate hover:text-brand hover:scale-110 font-display text-[1.15rem] font-normal transition-all duration-200 leading-none tracking-[-0.02em] text-text-primary sm:max-w-[13rem] sm:text-[1.35rem]">
                    <span className="sm:hidden">{shortName}</span>
                    <span className="hidden sm:inline">{project.name}</span>
                </p>
            </div>

            {!isPrevious && (
                <ArrowRight
                    size={14}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="shrink-0 text-text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand group-focus-visible:translate-x-1 group-focus-visible:text-brand"
                />
            )}
        </Link>
    );
}