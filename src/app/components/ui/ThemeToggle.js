
"use client";

import { AnimatePresence, motion } from "motion/react";
import { IoIosSunny } from "react-icons/io";
import { IoMoon } from "react-icons/io5";

import { cn } from "@/app/lib/utils";
import { useThemeToggle } from "@/app/hooks/useThemeToggle";
import useUiSound from "@/app/hooks/useUiSound";

export function ThemeToggle({
    variant = "rectangle",
    start = "bottom-up",
    className,
    iconClassName,
    onClick: onClickProp,
    ...rest
}) {
    const { isDark, mounted, toggle } = useThemeToggle({
        variant,
        start,
    });

    const { play: playThemeToggleSound } = useUiSound(
        "/mp3/chop.mp3", 
        {
            volume: 0.25,
            interrupt: true,
        },
    );

    const handleToggle = (event) => {
        if (onClickProp) {
            onClickProp(event);
        }

        if (event.defaultPrevented) {
            return;
        }

        // Play sound directly from the user's interaction.
        playThemeToggleSound();

        // Preserve the existing theme-switch behavior.
        toggle();
    };

    return (
        <motion.button
            type="button"
            aria-label={
                mounted && isDark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
            aria-pressed={mounted ? isDark : undefined}
            onClick={handleToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 0.5,
            }}
            className={cn(
                "group relative flex h-9 w-9 shrink-0 items-center justify-center cursor-pointer",
                "rounded-full",
                "text-zinc-600 dark:text-zinc-300",
                "transition-colors duration-300",
                "hover:bg-zinc-100 hover:text-zinc-950",
                "dark:hover:bg-white/10 dark:hover:text-white",
                "focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-zinc-400/50",
                "dark:focus-visible:ring-white/30",
                className,
            )}
            {...rest}
        >
            {!mounted ? (
                <span
                    className="h-4 w-4"
                    aria-hidden="true"
                />
            ) : (
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                        key={isDark ? "dark" : "light"}
                        initial={{
                            opacity: 0,
                            scale: 0.5,
                            rotate: isDark ? -90 : 90,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            rotate: 0,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.5,
                            rotate: isDark ? 90 : -90,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 24,
                            mass: 0.45,
                        }}
                        className="flex items-center justify-center"
                    >
                        {isDark ? (
                            <IoIosSunny
                                className={cn(
                                    "h-[17px] w-[17px]",
                                    iconClassName,
                                )}
                            />
                        ) : (
                            <IoMoon
                                className={cn(
                                    "h-[15px] w-[15px]",
                                    iconClassName,
                                )}
                            />
                        )}
                    </motion.span>
                </AnimatePresence>
            )}
        </motion.button>
    );
}
