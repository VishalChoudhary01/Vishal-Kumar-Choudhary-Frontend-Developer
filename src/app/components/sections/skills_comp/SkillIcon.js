"use client";

/*
 * Redux Toolkit has no separate brand mark — the official Redux logo
 * (TbBrandRedux from the installed react-icons set) is the accurate
 * mark for it, unlike the previous generic shield placeholder.
 */
import { TbBrandRedux } from "react-icons/tb";

const ICONS = {
    react: ({ className, ...props }) => (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
            <circle cx="12" cy="12" r="2.5" />
            <ellipse cx="12" cy="12" rx="11" ry="4.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <ellipse cx="12" cy="12" rx="11" ry="4.5" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="11" ry="4.5" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(120 12 12)" />
        </svg>
    ),
    nextjs: ({ className, ...props }) => (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm-1.5 19.2V9.6L6 19.2h-3l7.5-10.08V5.52L21 19.2h-3l-5.5-7.68v.08L18 19.2h-3z" />
        </svg>
    ),
    javascript: ({ className, ...props }) => (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
            <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.405-.6-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" />
        </svg>
    ),
    tailwind: ({ className, ...props }) => (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
            <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
        </svg>
    ),
    redux: TbBrandRedux,
    json: ({ className, ...props }) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true" {...props}>
            <circle cx="12" cy="12" r="10" />
            <path d="M9 8l-3 4 3 4M15 8l3 4-3 4M14 6l-4 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    "react-hook-form": ({ className, ...props }) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true" {...props}>
            <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinejoin="round" />
            <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
};

export default function SkillIcon({ name, className }) {
    const Icon = ICONS[name];
    if (!Icon) return null;
    return <Icon aria-hidden="true" className={className} />;
}
