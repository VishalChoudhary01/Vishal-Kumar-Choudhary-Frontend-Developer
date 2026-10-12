"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/app/lib/utils";

import useReducedMotion from "@/app/hooks/useReducedMotion";

import DownloadButtonCover from "./dounload_button_comp/DownloadButtonCover";
import DownloadButtonProgress from "./dounload_button_comp/DownloadButtonProgress";
import DownloadButtonContent from "./dounload_button_comp/DownloadButtonContent";
import DownloadButtonPercentage from "./dounload_button_comp/DownloadButtonPercentage";

import { DEFAULT_ICON_ANIMATION, DEFAULT_COVER_ANIMATION, DEFAULT_PROGRESS_ANIMATION, } from "./dounload_button_comp/downloadButton.constants";
export default function DownloadButton({
    label = "Download Resume",

    icon = null,

    iconSize = 18,

    iconPosition = "right",

    iconAnimation = DEFAULT_ICON_ANIMATION,

    cover = true,

    coverClassName = "bg-foreground",

    coverAnimation = DEFAULT_COVER_ANIMATION,

    widthClass = "w-[min(180px,calc(100vw-40px))]",

    heightClass = "h-[50px]",

    progress = 0,

    downloading = false,

    completed = false,

    progressMode = "bar",

    downloadingLabel = "Downloading…",

    completedLabel = "Downloaded",

    className = "",

    reduced: forceReduced = false,

    onClick,

    onPointerEnter,

    onPointerLeave,
}) {
    const buttonRef = useRef(null);

    const prefersReduced = useReducedMotion();

    const reduced =
        forceReduced || prefersReduced;

    const [hovered, setHovered] = useState(false);

    const [origin, setOrigin] = useState({
        x: 0,
        y: 0,
    });

    const [coverSize, setCoverSize] = useState(0);

    const calculateCover = (event) => {
        const button = buttonRef.current;

        if (!button) {
            return;
        }

        const rect =
            button.getBoundingClientRect();

        const x =
            event.clientX - rect.left;

        const y =
            event.clientY - rect.top;

        const distances = [
            Math.hypot(x, y),
            Math.hypot(
                rect.width - x,
                y
            ),
            Math.hypot(
                x,
                rect.height - y
            ),
            Math.hypot(
                rect.width - x,
                rect.height - y
            ),
        ];

        const radius =
            Math.max(...distances);

        setOrigin({
            x,
            y,
        });

        setCoverSize(radius * 2);
    };

    const handlePointerEnter = (event) => {
        if (downloading) {
            return;
        }

        if (!reduced && cover) {
            calculateCover(event);
            setHovered(true);
        }

        onPointerEnter?.(event);
    };

    const handlePointerLeave = (event) => {
        if (!reduced) {
            setHovered(false);
        }

        onPointerLeave?.(event);
    };

    const iconInitial = reduced
        ? iconAnimation.to
        : iconAnimation.from;

    const iconAnimate = reduced
        ? iconAnimation.to
        : hovered
            ? iconAnimation.to
            : iconAnimation.from;

    const displayLabel = completed
        ? completedLabel
        : downloading
            ? downloadingLabel
            : label;

    return (
        <motion.button
            ref={buttonRef}
            type="button"
            disabled={downloading}
            aria-busy={downloading}
            onClick={onClick}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            whileTap={
                reduced || downloading
                    ? undefined
                    : {
                        scale: 0.985,
                    }
            }
            className={cn(
                "group relative inline-flex",
                widthClass,
                heightClass,
                "items-center justify-center",
                "overflow-hidden rounded-full",
                "border border-transparent",
                "bg-brand",
                "p-0",
                "font-body",
                "text-brand-contrast",
                "isolate select-none",
                "cursor-pointer",
                "transition-[background-color,border-color]",
                "duration-300",
                "hover:bg-brand-hover",
                "focus-visible:outline",
                "focus-visible:outline-2",
                "focus-visible:outline-offset-[5px]",
                "focus-visible:outline-brand",
                downloading && "cursor-wait",
                downloading && "opacity-80",
                reduced && "motion-reduce:transition-none",
                className
            )}
        >
            <DownloadButtonCover
                enabled={
                    cover && !downloading
                }
                reduced={reduced}
                hovered={hovered}
                origin={origin}
                size={coverSize}
                className={coverClassName}
                animation={coverAnimation}
            />

            <DownloadButtonProgress
                visible={
                    downloading &&
                    progressMode === "bar"
                }
                progress={progress}
                animation={
                    DEFAULT_PROGRESS_ANIMATION
                }
            />

            <DownloadButtonContent
                label={displayLabel}
                icon={icon}
                iconSize={iconSize}
                iconPosition={iconPosition}
                iconInitial={iconInitial}
                iconAnimate={iconAnimate}
                iconAnimation={iconAnimation}
                downloading={downloading}
                completed={completed}
                reduced={reduced}
            />

            <DownloadButtonPercentage
                visible={
                    downloading &&
                    progressMode ===
                    "percentage"
                }
                progress={progress}
            />
        </motion.button>
    );
}