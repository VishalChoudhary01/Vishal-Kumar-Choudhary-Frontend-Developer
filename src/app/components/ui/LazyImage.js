"use client";

import {
    useRef,
    useState,
    useCallback,
    useEffect,
} from "react";

import Skeleton from "./Skeleton";

/**
 * LazyMedia — defers image/video loading until the element enters the
 * viewport (or is about to, based on `rootMargin`).
 *
 * Shows a <Skeleton /> placeholder while loading and fades the real
 * media in once loaded.  Falls back to the native `loading="lazy"`
 * attribute when the IntersectionObserver API is unavailable.
 */
export default function LazyMedia({
    src,
    alt = "",
    poster,
    type = "image",
    className = "",
    imgClassName = "",
    rootMargin = "200px 0px",
    skeletonClassName = "",
    skeletonRounded = "rounded-xl",
    children,
    ...rest
}) {
    const ref = useRef(null);
    const [loaded, setLoaded] = useState(false);
    const [inView, setInView] = useState(false);

    /* ---- intersection observer ---- */
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
            { rootMargin }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [rootMargin]);

    const handleLoad = useCallback(() => setLoaded(true), []);

    const isVideo = type === "video";

    return (
        <div ref={ref} className={`relative ${className}`} {...rest}>
            {/* skeleton placeholder */}
            {!loaded && (
                <Skeleton
                    className={`absolute inset-0 ${skeletonClassName}`}
                    rounded={skeletonRounded}
                />
            )}

            {/* real media */}
            {inView &&
                (isVideo ? (
                    <video
                        src={src}
                        poster={poster}
                        muted
                        playsInline
                        controls
                        preload="metadata"
                        onLoadedData={handleLoad}
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                            loaded ? "opacity-100" : "opacity-0"
                        } ${imgClassName}`}
                    />
                ) : (
                    /* Use a plain <img> here to avoid Next.js Image
                       hydration mismatch when the src is dynamic /
                       unoptimized. The parent can still use next/image
                       if they want — this wrapper is for the common case. */
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={src}
                        alt={alt}
                        loading="lazy"
                        decoding="async"
                        onLoad={handleLoad}
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                            loaded ? "opacity-100" : "opacity-0"
                        } ${imgClassName}`}
                    />
                ))}

            {children}
        </div>
    );
}
