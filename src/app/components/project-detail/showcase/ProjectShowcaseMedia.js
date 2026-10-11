"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

import Skeleton from "@/app/components/ui/Skeleton";
import { cn } from "@/app/lib/utils";

export default function ProjectShowcaseMedia({
    item,
    index,
    count,
    spanClass,
    lightboxIndex = null,
    onActivate = null,
}) {
    const isSingle = count === 1;
    const isVideo = item.type === "video" && item.src;
    const canOpenLightbox = Boolean(
        onActivate && lightboxIndex !== null && item.src && !isVideo
    );
    const [loaded, setLoaded] = useState(false);
    const [inView, setInView] = useState(false);
    const figureRef = useRef(null);

    useEffect(() => {
        const el = figureRef.current;
        if (!el) return;

        if (typeof IntersectionObserver === "undefined") {
            // Fallback for environments without IntersectionObserver:
            // resolve asynchronously so it matches an effect callback.
            Promise.resolve().then(() => setInView(true));
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "300px 0px" }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const handleActivate = () => {
        if (canOpenLightbox) {
            onActivate(lightboxIndex);
        }
    };

    const caption = Boolean(item.caption) && (
        <>
            {/* Gradient overlay */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/65 via-black/15 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
            />
            <figcaption
                className={cn(
                    "pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5",
                    "translate-y-2 opacity-0 transition-[opacity,transform] duration-500 ease-out",
                    "group-hover:translate-y-0 group-hover:opacity-100",
                    "group-focus-within:translate-y-0 group-focus-within:opacity-100"
                )}
            >
                <p className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/95 drop-shadow-sm">
                    {item.caption}
                </p>
            </figcaption>
        </>
    );

    return (
        <figure
            ref={figureRef}
            className={cn(
                "group relative w-full overflow-hidden",
                "bg-surface-2",
                spanClass
            )}
        >
            {!loaded && (
                <Skeleton className="absolute inset-0 z-20 rounded-none pointer-events-none" />
            )}

            {isVideo ? (
                inView && (
                    <video
                        src={item.src}
                        poster={item.poster}
                        muted
                        playsInline
                        controls
                        preload="metadata"
                        onLoadedData={() => setLoaded(true)}
                        className="absolute inset-0 h-full w-full object-cover"
                        onClick={(event) => event.stopPropagation()}
                    />
                )
            ) : inView ? (
                <>
                    {canOpenLightbox ? (
                        <button
                            type="button"
                            onClick={handleActivate}
                            aria-label={
                                item.caption ||
                                item.alt ||
                                "Open image viewer"
                            }
                            className="absolute inset-0 z-0 cursor-zoom-in rounded-[inherit] ring-inset focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-surface-overlay focus-visible:outline-solid"
                        >
                            <span className="sr-only">
                                {item.caption || item.alt || "Open image viewer"}
                            </span>
                        </button>
                    ) : null}

                    <Image
                        src={item.src}
                        alt={item.alt || ""}
                        fill
                        priority={index === 0}
                        sizes={
                            isSingle
                                ? "(max-width: 768px) 100vw, 896px"
                                : index === 0 && count >= 3
                                    ? "(max-width: 768px) 100vw, 100%"
                                    : "(max-width: 768px) 100vw, 50vw"
                        }
                        onLoad={() => setLoaded(true)}
                        className="pointer-events-none object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] object-top-left"
                    />
                </>
            ) : null}

            {caption}
        </figure>
    );
}
