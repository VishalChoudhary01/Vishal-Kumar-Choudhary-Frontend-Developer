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

    /*
     * Icon fallback (e.g. Cloudily Scripts) occupies the EXACT
     * same footprint as the image logos: same width bucket and
     * the same 2:1 box, scaled to fill its height like an
     * object-contained image.
     */
    const imageSize = backdrop
        ? "w-[min(230px,60vw)]"
        : breakpoint === "mobile"
            ? "w-[120px]"
            : breakpoint === "tablet"
                ? "w-[170px]"
                : "w-[clamp(150px,14vw,240px)]";

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
            <div
                className={cn(
                    "relative shrink-0 flex items-center justify-center",
                    imageSize,
                    "aspect-[2/1]"
                )}
            >
                <LogoIcon
                    aria-hidden="true"
                    /*
                     * SvgIcon bakes an inline 24×24 style; spreading a
                     * `style` prop AFTER it wins, so the icon fills the
                     * exact same 2:1 logo box and is drawn to its height
                     * (preserveAspectRatio meet — like object-contain),
                     * matching the image logos' footprint precisely.
                     */
                    style={{ width: "100%", height: "100%" }}
                    className={cn(
                        "pointer-events-none select-none",
                        "text-brand",
                        opacityClass
                    )}
                />
            </div>
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