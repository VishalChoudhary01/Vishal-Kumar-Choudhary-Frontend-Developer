"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

import Skeleton from "@/app/components/ui/Skeleton";

export default function ProjectShowcaseMedia({ item, index, count, spanClass }) {
    const isSingle = count === 1;
    const isVideo = item.type === "video" && item.src;
    const [loaded, setLoaded] = useState(false);
    const [inView, setInView] = useState(false);
    const figureRef = useRef(null);

    useEffect(() => {
        const el = figureRef.current;
        if (!el) return;

        if (typeof IntersectionObserver === "undefined") {
            setInView(true);
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

    return (
        <figure
            ref={figureRef}
            className={[
                "group relative w-full overflow-hidden",
                "bg-surface-2",
                spanClass || "",
            ].join(" ")}
        >
            {!loaded && (
                <Skeleton className="absolute inset-0 z-10" rounded="rounded-none" />
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
                    />
                )
            ) : (
                inView && (
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
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    />
                )
            )}

            {/* Gradient overlay */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 via-black/15 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />

            {item.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
                    <p className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/95 drop-shadow-sm">
                        {item.caption}
                    </p>
                </figcaption>
            )}
        </figure>
    );
}