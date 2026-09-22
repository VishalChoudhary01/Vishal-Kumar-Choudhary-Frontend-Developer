"use client";

import { useState, useRef, useEffect } from "react";

import Skeleton from "@/app/components/ui/Skeleton";

export default function ProjectShowcaseTile({
    item,
}) {
    const isVideo =
        item.type === "video" &&
        item.src;
    const [loaded, setLoaded] = useState(false);
    const [inView, setInView] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
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
        <figure ref={ref} className="group relative h-full w-full overflow-hidden rounded-[14px] border border-border-subtle bg-surface-2">
            {!loaded && (
                <Skeleton className="absolute inset-0 z-10" rounded="rounded-[14px]" />
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
                        className="absolute inset-0 h-full w-full select-none object-cover"
                    />
                )
            ) : (
                inView && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={item.src}
                        alt={item.alt || item.caption || ""}
                        loading="lazy"
                        decoding="async"
                        draggable="false"
                        onLoad={() => setLoaded(true)}
                        className="absolute inset-0 h-full w-full select-none object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    />
                )
            )}

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
            />

            {item.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <p className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/95">
                        {item.caption}
                    </p>
                </figcaption>
            )}
        </figure>
    );
}