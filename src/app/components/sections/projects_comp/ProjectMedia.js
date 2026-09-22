"use client";

import Link from "next/link";
import { useCallback, useRef, useState, useEffect } from "react";
import { motion } from "motion/react";

import {
    resolvePreset,
    toTransition,
    HOVER_PRESETS,
} from "@/app/lib/motion/projectPresets";

import Skeleton from "@/app/components/ui/Skeleton";

const EASE = [0.22, 1, 0.36, 1];

function ProjectImageButton({ slug, visible }) {
    if (!slug) {
        return null;
    }

    return (
        <motion.div
            className="pointer-events-none absolute bottom-4 right-4 z-20 sm:bottom-5 sm:right-5"
            initial={false}
            animate={{
                opacity: visible ? 1 : 0,
                y: visible ? 0 : 6,
                scale: visible ? 1 : 0.96,
            }}
            transition={{
                duration: 0.24,
                ease: EASE,
            }}
        >
            <Link
                href={`/projects/${slug}`}
                tabIndex={visible ? 0 : -1}
                aria-label="View project"
                className="pointer-events-auto group/project relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/35 bg-surface-1/75 px-4 py-2.5 font-mono text-[0.7rem] font-medium tracking-[0.01em] text-text-primary shadow-[0_5px_20px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-surface-1/90 hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/15"
            >
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover/project:opacity-100"
                />

                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white/65 opacity-70"
                />

                <span className="relative z-10">
                    View project
                </span>

                <span
                    aria-hidden="true"
                    className="relative z-10 text-[0.8rem] leading-none text-text-primary transition-transform duration-250 group-hover/project:translate-x-0.5 group-hover/project:-translate-y-px"
                >
                    ↗
                </span>
            </Link>
        </motion.div>
    );
}

export default function ProjectMedia({
    media,
    projectSlug,
    hoverPreset = "mediaScale",
    aspect = "16/9",
    radiusClass = "rounded-2xl",
    isFlagship = false,
    isInView = true,
    entrance,
    titleHovered = false,
    onHoverChange,
}) {
    const containerRef = useRef(null);

    const [hovered, setHovered] = useState(false);

    const [mousePos, setMousePos] = useState({
        x: 0,
        y: 0,
    });

    if (!media?.src) {
        return null;
    }

    const config = resolvePreset(
        HOVER_PRESETS,
        hoverPreset
    );

    const entranceConfig = entrance || {
        initial: {
            opacity: 0,
            y: 20,
        },
        animate: {
            opacity: 1,
            y: 0,
        },
        duration: 0.65,
        ease: EASE,
    };

    const isVideo = media.type === "video";

    const targetScale = hovered
        ? config.scale.hovered
        : titleHovered
            ? config.scale.titleHovered
            : config.scale.rest;

    const useDepth =
        Boolean(config.perspective) &&
        config.rotateMax > 0;

    const rotX =
        useDepth && hovered
            ? mousePos.y * -config.rotateMax
            : 0;

    const rotY =
        useDepth && hovered
            ? mousePos.x * config.rotateMax
            : 0;

    const tx =
        useDepth && hovered
            ? mousePos.x * -config.translateMax
            : 0;

    const ty =
        useDepth && hovered
            ? mousePos.y * -config.translateMax * 0.6
            : 0;

    const handleMouseMove = useCallback((event) => {
        if (!containerRef.current) {
            return;
        }

        const rect =
            containerRef.current.getBoundingClientRect();

        const x =
            (event.clientX - rect.left) /
            rect.width -
            0.5;

        const y =
            (event.clientY - rect.top) /
            rect.height -
            0.5;

        setMousePos({
            x,
            y,
        });
    }, []);

    const handleEnter = () => {
        setHovered(true);
        onHoverChange?.(true);
    };

    const handleLeave = () => {
        setHovered(false);

        setMousePos({
            x: 0,
            y: 0,
        });

        onHoverChange?.(false);
    };

    /* ---- lazy load observer ---- */
    const [mediaLoaded, setMediaLoaded] = useState(false);
    const [mediaInView, setMediaInView] = useState(false);
    const lazyRef = useRef(null);

    useEffect(() => {
        const el = lazyRef.current || containerRef.current;
        if (!el) return;

        if (typeof IntersectionObserver === "undefined") {
            setMediaInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setMediaInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "300px 0px" }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <motion.div
            ref={lazyRef}
            className="relative w-full"
            style={{
                perspective: config.perspective
                    ? `${config.perspective}px`
                    : undefined,
            }}
            initial={
                isInView
                    ? entranceConfig.initial
                    : false
            }
            animate={
                isInView
                    ? entranceConfig.animate
                    : entranceConfig.initial
            }
            transition={toTransition(
                entranceConfig
            )}
        >
            <div
                ref={containerRef}
                className={[
                    "relative w-full overflow-hidden",
                    "bg-surface-2",
                    radiusClass,
                    isFlagship
                        ? "aspect-[16/9]"
                        : "",
                ].join(" ")}
                style={
                    isFlagship
                        ? undefined
                        : {
                            aspectRatio: aspect,
                        }
                }
                onMouseMove={handleMouseMove}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                onFocus={handleEnter}
                onBlur={handleLeave}
                tabIndex={0}
                role="img"
                aria-label={media.alt || ""}
            >
                {/* skeleton while loading */}
                {!mediaLoaded && (
                    <Skeleton
                        className="absolute inset-0 z-10"
                        rounded="rounded-none"
                    />
                )}

                {isVideo ? (
                    <video
                        src={mediaInView ? media.src : undefined}
                        poster={media.poster}
                        className="absolute inset-0 h-full w-full select-none object-cover"
                        preload="metadata"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(event) => {
                            event.currentTarget.play();
                        }}
                        onMouseLeave={(event) => {
                            event.currentTarget.pause();
                            event.currentTarget.currentTime = 0;
                        }}
                    />
                ) : (
                    mediaInView && (
                        <motion.img
                            src={media.src}
                            alt={media.alt || ""}
                            width={
                                isFlagship
                                    ? 1200
                                    : 960
                            }
                            height={
                                isFlagship
                                    ? 675
                                    : 600
                            }
                            loading="lazy"
                            decoding="async"
                            draggable="false"
                            onLoad={() => setMediaLoaded(true)}
                            className="absolute inset-0 h-full w-full select-none object-cover"
                            animate={{
                                scale: targetScale,
                                x: tx,
                                y: ty,
                                rotateX: rotX,
                                rotateY: rotY,
                            }}
                            transition={{
                                scale: config.transition,
                                x: config.transition,
                                y: config.transition,
                                rotateX: config.transition,
                                rotateY: config.transition,
                            }}
                            style={{
                                transformStyle: "preserve-3d",
                            }}
                        />
                    )
                )}

                <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-black"
                    animate={{
                        opacity: hovered ? 0.08 : 0,
                    }}
                    transition={{
                        duration: 0.3,
                        ease: "easeOut",
                    }}
                />

                <ProjectImageButton
                    slug={projectSlug}
                    visible={hovered}
                />
            </div>
        </motion.div>
    );
}