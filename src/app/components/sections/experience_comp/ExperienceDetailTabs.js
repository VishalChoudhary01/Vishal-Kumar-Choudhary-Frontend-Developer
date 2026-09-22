"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/app/lib/utils";

import { EASE } from "./experience.constants";

export default function ExperienceDetailTabs({
    tabs,
    activeTab,
    onSelect,
    reducedMotion = false,
}) {
    const refs = useRef([]);
    const listRef = useRef(null);

    const [indicator, setIndicator] = useState({
        left: 0,
        width: 0,
    });

    const measure = useCallback(() => {
        const list = listRef.current;
        const activeIndex = tabs.indexOf(activeTab);
        const button = refs.current[activeIndex];

        if (!list || !button) {
            return;
        }

        const text =
            button.querySelector("[data-tab-text]");

        const target = text || button;

        setIndicator({
            left: target.offsetLeft,
            width: target.offsetWidth,
        });
    }, [activeTab, tabs]);

    useLayoutEffect(() => {
        measure();

        window.addEventListener("resize", measure);

        return () => {
            window.removeEventListener(
                "resize",
                measure
            );
        };
    }, [measure]);

    const handleKeyDown = (event) => {
        const index = tabs.indexOf(activeTab);

        let next = null;

        if (event.key === "ArrowRight") {
            next = (index + 1) % tabs.length;
        }

        if (event.key === "ArrowLeft") {
            next =
                (index - 1 + tabs.length) %
                tabs.length;
        }

        if (next === null) {
            return;
        }

        event.preventDefault();

        onSelect(tabs[next]);

        refs.current[next]?.focus();
    };

    return (
        <div
            ref={listRef}
            role="tablist"
            aria-label="Role details"
            onKeyDown={handleKeyDown}
            className="relative flex gap-1 border-b border-border md:gap-2"
        >
            {tabs.map((tab, index) => {
                const active = tab === activeTab;

                return (
                    <button
                        key={tab}
                        ref={(element) => {
                            refs.current[index] = element;
                        }}
                        id={`exp-tab-${tab.toLowerCase()}`}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        aria-controls={`exp-panel-${tab.toLowerCase()}`}
                        tabIndex={active ? 0 : -1}
                        onClick={() => onSelect(tab)}
                        className={cn(
                            "min-h-11 shrink-0 flex-1 whitespace-nowrap px-1 uppercase type-metadata",
                            "transition-colors duration-200",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                            "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            "md:min-h-12 md:flex-none md:px-5",
                            active
                                ? "text-brand"
                                : "text-text-tertiary hover:text-text-secondary"
                        )}
                    >
                        <span data-tab-text>
                            {tab}
                        </span>
                    </button>
                );
            })}

            {reducedMotion ? (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-px h-[2px] bg-brand"
                    style={{
                        left: indicator.left,
                        width: indicator.width,
                    }}
                />
            ) : (
                <motion.span
                    aria-hidden="true"
                    initial={false}
                    animate={{
                        left: indicator.left,
                        width: indicator.width,
                    }}
                    transition={{
                        duration: 0.35,
                        ease: EASE,
                    }}
                    className="pointer-events-none absolute -bottom-px h-[2px] bg-brand"
                />
            )}
        </div>
    );
}