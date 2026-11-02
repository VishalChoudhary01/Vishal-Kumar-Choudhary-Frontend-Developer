"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";

import {
    resolvePreset,
    toTransition,
    HOVER_PRESETS,
    SCROLL_PRESETS,
} from "@/app/lib/motion/projectPresets";

import ProjectResumeButton from "@/app/components/common/ProjectResumeButton";

import useReducedMotion from "@/app/hooks/useReducedMotion";

import Skeleton from "@/app/components/ui/Skeleton";
import { cn } from "@/app/lib/utils";

const EASE = [0.22, 1, 0.36, 1];

export default function ProjectMedia({
    media,
    liveHref,
    hoverPreset = "mediaScale",
    scrollPreset = "softDepth",
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

    /* ---- scroll-linked grow-in ----
     * As the card scrolls up from the bottom of the viewport, the media
     * starts visibly smaller (scale preset drives the value pair, default
     * 0.82 → 1) and grows continuously to natural size, finishing when the
     * media's top reaches the viewport's vertical center. Motion values
     * only — no per-frame React state, no scroll listeners; fully
     * reversible on scroll-up. Rendered on its own wrapper so the hover
     * scale, entrance, and 3D-depth animations keep their own graphs.
     * Reduced motion renders the wrapper at identity (scale 1).
     */
    const scrollConfig =
        reduced || !scrollPreset
            ? null
            : SCROLL_PRESETS[scrollPreset] || SCROLL_PRESETS.softDepth;

    const scrollWrapRef = useRef(null);

    const { scrollYProgress: mediaScrollProgress } = useScroll({
        target: scrollWrapRef,
        offset: ["start end", "center center"],
    });

    const scrollScale = useTransform(
        mediaScrollProgress,
        [0, 1],
        scrollConfig?.scale || [1, 1]
    );

    /* ---- lazy load observer ---- */
    const [mediaLoaded, setMediaLoaded] = useState(false);
    const [mediaInView, setMediaInView] = useState(false);
    const lazyRef = useRef(null);

    useEffect(() => {
        const el = lazyRef.current || containerRef.current;
        if (!el) return;

        if (typeof IntersectionObserver === "undefined") {
            /* No IntersectionObserver support: satisfy the lazy-render
               contract via a task callback (not synchronous setState,
               which the lint rules flag as a cascading render). */
            const id = requestAnimationFrame(() => setMediaInView(true));
            return () => cancelAnimationFrame(id);
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

    /* Render bail-out stays AFTER every hook so hook order is stable
       across renders regardless of the media prop. */
    if (!media?.src) {
        return null;
    }

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
            {/*
              * Scroll-linked grow-in wrapper.
              *
              * The media starts slightly smaller and softly desaturated,
              * then grows to natural size as the card travels from the
              * bottom of the viewport to mid-screen. This lives on its own
              * wrapper — separate from the hover scale on the <img> — so
              * the two motion graphs never fight for the same transform.
              * Reduced motion renders the wrapper at identity.
              */}
            <motion.div
                ref={scrollWrapRef}
                style={scrollConfig ? { scale: scrollScale } : undefined}
            >
            <div
                ref={containerRef}
                className={cn(
                    "relative w-full overflow-hidden",
                    "bg-surface-2",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    radiusClass,
                    isFlagship ? "aspect-[16/9]" : ""
                )}
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
                            className="absolute inset-0 h-full w-full select-none object-cover object-top-left "
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
                        className="pointer-events-none absolute bottom-4 right-4 z-20 hidden lg:block sm:bottom-5 sm:right-5"
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
        </motion.div>
    );
}