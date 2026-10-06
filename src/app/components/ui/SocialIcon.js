import Link from "next/link";
import { cn } from "@/app/lib/utils";

function SocialIcon({ link }) {
    const Icon = link.icon;

    if (!Icon) return null;

    const label = link.label?.toLowerCase() ?? "";

    const isGithub = label === "github";
    const isLinkedin = label === "linkedin";
    const isEmail = label === "email";

    return (
        <Link
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className={cn(
                "group relative flex h-10 w-10 items-center justify-center",

                // ---------------------------------------------------------
                // DEFAULT
                // ---------------------------------------------------------

                "text-text-primary/80",

                // Smooth vertical movement
                "transition-transform",
                "duration-500",
                "ease-[cubic-bezier(0.16,1,0.3,1)]",

                "hover:-translate-y-px",

                // ---------------------------------------------------------
                // ACCESSIBILITY
                // ---------------------------------------------------------

                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-brand",
                "focus-visible:ring-offset-2",
                "focus-visible:ring-offset-background",

                // ---------------------------------------------------------
                // GITHUB
                // ---------------------------------------------------------

                isGithub &&
                "hover:text-[#2DA44E] dark:hover:text-[#3FB950]",

                // ---------------------------------------------------------
                // LINKEDIN
                // ---------------------------------------------------------

                isLinkedin && "hover:text-[#0A66C2]",
            )}
        >
            {/* ---------------------------------------------------------
                GMAIL GRADIENT
                Red dominant — yellow intentionally minimized
            --------------------------------------------------------- */}
            {isEmail && (
                <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute h-0 w-0"
                >
                    <defs>
                        <linearGradient
                            id="gmail-brand-gradient"
                            x1="5%"
                            y1="90%"
                            x2="95%"
                            y2="10%"
                        >
                            {/* Deep red */}
                            <stop
                                offset="0%"
                                stopColor="#D93025"
                            />

                            {/* Strong Gmail red */}
                            <stop
                                offset="18%"
                                stopColor="#EA4335"
                            />

                            {/* Bright red */}
                            <stop
                                offset="36%"
                                stopColor="#FF3B30"
                            />

                            {/* Red-orange — very short transition */}
                            <stop
                                offset="48%"
                                stopColor="#FF4F3A"
                            />

                            {/* Tiny amount of orange */}
                            <stop
                                offset="55%"
                                stopColor="#FF7043"
                            />

                            {/* VERY SMALL yellow presence */}
                            <stop
                                offset="61%"
                                stopColor="#FBBC04"
                            />

                            {/* Quickly leave yellow */}
                            <stop
                                offset="64%"
                                stopColor="#34A853"
                            />

                            {/* Green */}
                            <stop
                                offset="76%"
                                stopColor="#34A853"
                            />

                            {/* Blue */}
                            <stop
                                offset="90%"
                                stopColor="#4285F4"
                            />

                            <stop
                                offset="100%"
                                stopColor="#4285F4"
                            />
                        </linearGradient>
                    </defs>
                </svg>
            )}

            <Icon
                aria-hidden="true"
                className={cn(
                    // -----------------------------------------------------
                    // BASE
                    // -----------------------------------------------------

                    "text-base md:text-lg",

                    // Smooth color transition
                    "transition-[color,fill,stroke]",
                    "duration-500",
                    "ease-[cubic-bezier(0.16,1,0.3,1)]",

                    // -----------------------------------------------------
                    // GITHUB
                    // -----------------------------------------------------

                    isGithub && "fill-current",

                    // -----------------------------------------------------
                    // LINKEDIN
                    // -----------------------------------------------------

                    isLinkedin && "fill-current",

                    // -----------------------------------------------------
                    // GMAIL
                    // -----------------------------------------------------

                    isEmail && [
                        "fill-current",
                        "group-hover:[fill:url(#gmail-brand-gradient)]",
                    ],
                )}
            />
        </Link>
    );
}

export default SocialIcon;