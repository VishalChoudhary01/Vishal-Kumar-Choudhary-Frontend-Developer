import ActiveDot from "./ActiveDot";
import Link from "next/link";

function NavGroup({ link, active, className }) {
    return (
        <div className="group/nav relative flex items-center">
            <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={className}
            >
                {active && <ActiveDot />}
                <span className="relative z-10 flex items-center gap-1.5">
                    {link.label}
                    {/* Chevron cue — group items only */}
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="pointer-events-none h-2.5 w-2.5 translate-y-px text-text-muted transition-transform duration-200 group-hover/nav:translate-y-[2px]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </span>
            </Link>

            {/* Flyout — hovers open over the group, keyboard-reachable via focus */}
            <div className=" invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2.5 opacity-0 scale-[0.98] transition-[opacity,transform,scale,visibility] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:scale-100 group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:translate-y-0 group-focus-within/nav:scale-100 group-focus-within/nav:opacity-100 " >

                <div className="w-[240px] rounded-[14px] border border-border bg-surface-elevated/95 py-1.5 shadow-[0_2px_6px_rgb(0_0_0/0.04),0_10px_24px_-14px_rgb(0_0_0/0.14)] backdrop-blur-[10px]">
                    <p
                        aria-hidden="true"
                        className="px-4 pt-2 pb-1.5 text-[10px] font-medium tracking-[0.22em] text-text-muted uppercase"
                    >
                        Background
                    </p>

                    <div className="px-1.5 pb-0.5">
                        {link.children.map((child, i) => (
                            <Link
                                key={child.href}
                                href={child.href}
                                className=" group/item flex items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-medium text-text-secondary rounded-[8px] transition-[color,background-color] duration-150 hover:bg-surface-2/70 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background "
                                style={
                                    i > 0
                                        ? { boxShadow: "inset 0 1px 0 var(--border-subtle)" }
                                        : undefined
                                }
                            >
                                <span
                                    aria-hidden="true"
                                    className="h-[3px] w-[3px] shrink-0 rounded-full bg-brand opacity-0 transition-all duration-200 group-hover/item:w-[14px] group-hover/item:rounded-[2px] group-hover/item:opacity-100"
                                />
                                <span className="transition-transform duration-200 group-hover/item:translate-x-[1px]">
                                    {child.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavGroup