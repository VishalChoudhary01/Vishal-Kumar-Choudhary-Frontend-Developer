"use client";

/**
 * Lightweight SVG icons — replaces react-icons dependency.
 * Each component accepts `className` and `aria-hidden` like any other icon.
 */

/* ─── Helper ─────────────────────────────────────────────── */

function SvgIcon({ children, size = 24, strokeWidth, className, fill = "currentColor", ...props }) {
    const style = {};
    if (size) {
        style.width = size;
        style.height = size;
    }
    return (
        <svg
            viewBox="0 0 24 24"
            fill={fill}
            strokeWidth={strokeWidth}
            className={className}
            aria-hidden="true"
            style={style}
            {...props}
        >
            {children}
        </svg>
    );
}

/* ─── Social / Brand ────────────────────────────────────── */

export function GithubIcon({ size, strokeWidth, className, ...props }) {
    return (
        <SvgIcon size={size} strokeWidth={strokeWidth} className={className} {...props}>
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </SvgIcon>
    );
}

export function LinkedinIcon({ size, strokeWidth, className, ...props }) {
    return (
        <SvgIcon size={size} strokeWidth={strokeWidth} className={className} {...props}>
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </SvgIcon>
    );
}

export function GmailIcon({ size, strokeWidth, className, ...props }) {
    return (
        <SvgIcon size={size} strokeWidth={strokeWidth} className={className} {...props}>
            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
        </SvgIcon>
    );
}

export function CloudIcon({ size, strokeWidth, className, ...props }) {
    return (
        <SvgIcon size={size} strokeWidth={strokeWidth || 2} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
            <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
            <path d="m13 12-3 5h4l-3 5" />
        </SvgIcon>
    );
}

/* ─── Utility ───────────────────────────────────────────── */

export function ArrowUpRightIcon({ size, strokeWidth, className, ...props }) {
    return (
        <SvgIcon size={size} strokeWidth={strokeWidth || 2} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
            <path d="M7 17 17 7" />
            <path d="M7 7h10v10" />
        </SvgIcon>
    );
}

export function ArrowDownToLineIcon({ size, strokeWidth, className, ...props }) {
    return (
        <SvgIcon size={size} strokeWidth={strokeWidth || 2} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
            <path d="M12 3v12" />
            <path d="m8 11 4 4 4-4" />
            <path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4" />
        </SvgIcon>
    );
}

export function SunIcon({ size, strokeWidth, className, ...props }) {
    return (
        <SvgIcon size={size} strokeWidth={strokeWidth} className={className} {...props}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        </SvgIcon>
    );
}

export function MoonIcon({ size, strokeWidth, className, ...props }) {
    return (
        <SvgIcon size={size} strokeWidth={strokeWidth} className={className} {...props}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </SvgIcon>
    );
}
