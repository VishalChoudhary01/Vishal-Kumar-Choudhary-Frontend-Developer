"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/app/lib/utils";

export default function ExperienceWatermark({
    experience,
    breakpoint,
    backdrop = false,
}) {
    const [hidden, setHidden] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const imageRef = useRef(null);

    const LogoIcon = experience.logoIcon;

    const imageSize = backdrop
        ? "w-[min(230px,60vw)]"
        : breakpoint === "mobile"
            ? "w-[120px]"
            : breakpoint === "tablet"
                ? "w-[170px]"
                : "w-[clamp(150px,14vw,240px)]";

    const iconSize = backdrop
        ? "text-[clamp(120px,44vw,190px)]"
        : breakpoint === "mobile"
            ? "text-[64px]"
            : breakpoint === "tablet"
                ? "text-[96px]"
                : "text-[clamp(100px,8vw,140px)]";

    const opacityClass = backdrop
        ? "opacity-10"
        : "opacity-[0.28]";

    useEffect(() => {
        const image = imageRef.current;

        if (!image) {
            return;
        }

        if (image.complete) {
            if (image.naturalWidth === 0) {
                setHidden(true);
            } else {
                setLoaded(true);
            }
        }
    }, []);

    if (LogoIcon) {
        return (
            <LogoIcon
                aria-hidden="true"
                className={cn(
                    "pointer-events-none select-none",
                    "text-brand",
                    iconSize,
                    opacityClass
                )}
                strokeWidth={1.5}
            />
        );
    }

    if (!experience.logo || hidden) {
        return null;
    }

    return (
        <div
            className={cn(
                "relative shrink-0",
                imageSize,
                "aspect-[2/1]"
            )}
        >
            <Image
                ref={imageRef}
                src={experience.logo}
                alt=""
                aria-hidden="true"
                fill
                draggable={false}
                onError={() => setHidden(true)}
                onLoad={() => setLoaded(true)}
                className={cn(
                    "pointer-events-none select-none object-contain transition-opacity duration-500 ease-out",
                    loaded ? opacityClass : "opacity-0"
                )}
                sizes={backdrop ? "60vw" : "240px"}
            />
        </div>
    );
}