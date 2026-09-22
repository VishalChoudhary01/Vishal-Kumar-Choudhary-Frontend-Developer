"use client";

import {
    useCallback,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { cn } from "@/app/lib/utils";

import ExperienceCompanyEyebrow from "./ExperienceCompanyEyebrow";
import {
    MOBILE_EDGE_BUFFER,
} from "./experience.constants";

export default function ExperienceCompanySelector({
    experiences,
    activeIndex,
    onSelect,
}) {
    const verticalRefs = useRef([]);
    const horizontalRefs = useRef([]);
    const horizontalScrollRef = useRef(null);

    const [canScrollLeft, setCanScrollLeft] =
        useState(false);

    const [canScrollRight, setCanScrollRight] =
        useState(false);

    const ensureActiveTabVisible =
        useCallback(() => {
            const container =
                horizontalScrollRef.current;

            const button =
                horizontalRefs.current[activeIndex];

            if (!container || !button) {
                return;
            }

            const containerRect =
                container.getBoundingClientRect();

            const buttonRect =
                button.getBoundingClientRect();

            const tabLeft =
                buttonRect.left -
                containerRect.left;

            const tabRight =
                buttonRect.right -
                containerRect.left;

            if (
                tabLeft <
                MOBILE_EDGE_BUFFER
            ) {
                const scrollTarget =
                    container.scrollLeft +
                    tabLeft -
                    MOBILE_EDGE_BUFFER;

                container.scrollTo({
                    left: Math.max(
                        0,
                        scrollTarget
                    ),
                    behavior: "smooth",
                });
            } else if (
                tabRight >
                containerRect.width -
                MOBILE_EDGE_BUFFER
            ) {
                const scrollTarget =
                    container.scrollLeft +
                    tabRight -
                    containerRect.width +
                    MOBILE_EDGE_BUFFER;

                container.scrollTo({
                    left: scrollTarget,
                    behavior: "smooth",
                });
            }
        }, [activeIndex]);

    const updateScrollState =
        useCallback(() => {
            const element =
                horizontalScrollRef.current;

            if (!element) {
                return;
            }

            const maxScrollLeft =
                element.scrollWidth -
                element.clientWidth;

            setCanScrollLeft(
                element.scrollLeft > 1
            );

            setCanScrollRight(
                element.scrollLeft <
                maxScrollLeft - 1
            );
        }, []);

    useLayoutEffect(() => {
        ensureActiveTabVisible();
    }, [
        activeIndex,
        ensureActiveTabVisible,
    ]);

    useLayoutEffect(() => {
        updateScrollState();

        const container =
            horizontalScrollRef.current;

        if (!container) {
            return;
        }

        const handleScroll = () => {
            updateScrollState();
        };

        container.addEventListener(
            "scroll",
            handleScroll,
            {
                passive: true,
            }
        );

        let resizeObserver;

        if (
            typeof ResizeObserver !==
            "undefined"
        ) {
            resizeObserver =
                new ResizeObserver(
                    updateScrollState
                );

            resizeObserver.observe(
                container
            );
        }

        return () => {
            container.removeEventListener(
                "scroll",
                handleScroll
            );

            resizeObserver?.disconnect();
        };
    }, [updateScrollState]);

    const handleVerticalKeyDown = (
        event
    ) => {
        let next = null;

        if (event.key === "ArrowDown") {
            next = activeIndex + 1;
        } else if (
            event.key === "ArrowUp"
        ) {
            next = activeIndex - 1;
        }

        if (next === null) {
            return;
        }

        event.preventDefault();

        const target =
            (next + experiences.length) %
            experiences.length;

        onSelect(target);

        verticalRefs.current[
            target
        ]?.focus();
    };

    const handleHorizontalKeyDown = (
        event
    ) => {
        let next = null;

        if (
            event.key === "ArrowRight"
        ) {
            next = activeIndex + 1;
        } else if (
            event.key === "ArrowLeft"
        ) {
            next = activeIndex - 1;
        }

        if (next === null) {
            return;
        }

        event.preventDefault();

        const target =
            (next + experiences.length) %
            experiences.length;

        onSelect(target);

        horizontalRefs.current[
            target
        ]?.focus();
    };

    return (
        <>
            <nav
                aria-label="Companies"
                onKeyDown={
                    handleHorizontalKeyDown
                }
                className="relative overflow-hidden md:hidden"
            >
                {canScrollLeft && (
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-6 bg-gradient-to-r from-background to-transparent"
                    />
                )}

                {canScrollRight && (
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-6 bg-gradient-to-l from-background to-transparent"
                    />
                )}

                <div
                    ref={horizontalScrollRef}
                    className="scroll-smooth snap-x snap-mandatory overflow-x-auto pl-5 pr-20 pt-1 pb-1 scroll-px-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:pl-8 sm:pr-24 sm:scroll-px-8"
                >
                    <ol
                        role="list"
                        className="flex items-start gap-6 sm:gap-8"
                    >
                        {experiences.map(
                            (
                                experience,
                                index
                            ) => {
                                const active =
                                    index ===
                                    activeIndex;

                                return (
                                    <li
                                        key={
                                            experience.id
                                        }
                                        className="shrink-0 snap-start"
                                    >
                                        <button
                                            ref={(
                                                element
                                            ) => {
                                                horizontalRefs.current[
                                                    index
                                                ] =
                                                    element;
                                            }}
                                            type="button"
                                            onClick={() =>
                                                onSelect(
                                                    index
                                                )
                                            }
                                            aria-current={
                                                active
                                                    ? "true"
                                                    : undefined
                                            }
                                            className={cn(
                                                "group flex min-h-11 flex-col justify-end rounded-md text-left",
                                                "transition-all duration-300",
                                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                                                "focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "border-b-[2px] pb-1.5 transition-colors duration-300",
                                                    active
                                                        ? "border-brand"
                                                        : "border-transparent group-hover:border-border"
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "font-body text-[12px] font-medium uppercase tracking-[0.09em] transition-colors duration-300 sm:text-[13px]",
                                                        active
                                                            ? "text-text-primary"
                                                            : "text-text-muted"
                                                    )}
                                                >
                                                    {experience.shortCompany ||
                                                        experience.company}
                                                </span>
                                            </span>
                                        </button>
                                    </li>
                                );
                            }
                        )}
                    </ol>
                </div>
            </nav>

            <nav
                aria-label="Companies"
                onKeyDown={
                    handleVerticalKeyDown
                }
                className="hidden self-start md:sticky md:top-[140px] md:block"
            >
                <ol
                    role="list"
                    className="flex flex-col"
                >
                    {experiences.map(
                        (
                            experience,
                            index
                        ) => {
                            const active =
                                index ===
                                activeIndex;

                            return (
                                <li
                                    key={
                                        experience.id
                                    }
                                >
                                    <button
                                        ref={(
                                            element
                                        ) => {
                                            verticalRefs.current[
                                                index
                                            ] =
                                                element;
                                        }}
                                        type="button"
                                        onClick={() =>
                                            onSelect(
                                                index
                                            )
                                        }
                                        aria-current={
                                            active
                                                ? "true"
                                                : undefined
                                        }
                                        className="group flex w-full items-stretch gap-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                        style={{
                                            paddingTop:
                                                "1.5rem",
                                            paddingBottom:
                                                "1.5rem",
                                        }}
                                    >
                                        <span className="flex flex-col items-center">
                                            <span
                                                className={cn(
                                                    "mt-[0.15rem] block rounded-full transition-all duration-300",
                                                    active
                                                        ? "size-2.5 bg-brand"
                                                        : "size-1.5 bg-border-strong"
                                                )}
                                            />

                                            {index <
                                                experiences.length -
                                                1 && (
                                                    <span className="w-px flex-1 bg-border-subtle" />
                                                )}
                                        </span>

                                        <span className="flex flex-col">
                                            <ExperienceCompanyEyebrow
                                                number={
                                                    experience.number
                                                }
                                                company={
                                                    experience.company
                                                }
                                                active={
                                                    active
                                                }
                                            />
                                        </span>
                                    </button>
                                </li>
                            );
                        }
                    )}
                </ol>
            </nav>
        </>
    );
}