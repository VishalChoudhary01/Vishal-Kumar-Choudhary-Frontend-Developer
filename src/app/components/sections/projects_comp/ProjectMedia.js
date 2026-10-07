"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { motion } from "motion/react";

import {
    resolvePreset,
    toTransition,
    HOVER_PRESETS,
} from "@/app/lib/motion/projectPresets";

import ProjectResumeButton from "@/app/components/common/ProjectResumeButton";

import useReducedMotion from "@/app/hooks/useReducedMotion";

import Skeleton from "@/app/components/ui/Skeleton";

const EASE = [0.22, 1, 0.36, 1];

export default function ProjectMedia({
    media,
    liveHref,
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

    const reduced = useReducedMotion();

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

                {/*
                    CONTEXTUAL LIVE ACTION

                    Live is a SECONDARY, contextual action — it is
                    revealed only when the project image is hovered,
                    and only on desktop (hidden below lg, so mobile
                    and tablet stay quiet with a single
                    "View Project" below the image).

                    At rest the overlay is opacity 0 and `inert`,
                    so it is neither hit-testable nor focusable.
                    Reduced motion: reveal without animation.
                */}
                {liveHref && (
                    <motion.div
                        className="
                            pointer-events-none
                            absolute
                            bottom-4 right-4
                            z-20
                            hidden
                            lg:block
                            sm:bottom-5 sm:right-5
                        "
                        initial={false}
                        animate={{
                            opacity: hovered ? 1 : 0,
                            y: hovered ? 0 : 6,
                            scale: hovered ? 1 : 0.97,
                        }}
                        transition={{
                            duration: reduced ? 0 : 0.28,
                            ease: EASE,
                        }}
                        inert={!hovered}
                    >
                        <ProjectResumeButton
                            href={liveHref}
                            label="Live"
                            external
                            size="sm"
                            className="pointer-events-auto"
                        />
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}