"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";

import Skeleton from "@/app/components/ui/Skeleton";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

export default function ProjectHeroVisual({ project, reduced = false }) {
    const image =
        project?.hero?.media?.src ||
        project?.heroImage ||
        project?.image ||
        project?.thumbnail ||
        project?.media?.src;

    const imageAlt =
        project?.hero?.media?.alt ||
        project?.imageAlt ||
        project?.media?.alt ||
        `${project?.name || "Project"} project preview`;

    const [imgLoaded, setImgLoaded] = useState(false);
    const [inView, setInView] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        const el = wrapRef.current;
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

    if (!image) {
        return (
            <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[18px] border border-border-subtle bg-surface-1 sm:aspect-[16/10] lg:aspect-[4/3]">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-text-muted">
                    Project visual
                </span>
            </div>
        );
    }

    return (
        <motion.div
            ref={wrapRef}
            initial={
                reduced
                    ? false
                    : {
                        opacity: 0,
                        y: 28,
                        scale: 0.985,
                    }
            }
            animate={{
                opacity: 1,
                y: 0,
                scale: 1,
            }}
            transition={{
                duration: reduced ? 0 : 1,
                delay: reduced ? 0 : 0.22,
                ease: EASE_EDITORIAL,
            }}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] border border-border-subtle bg-surface-1 sm:aspect-[16/10] lg:aspect-[4/3]"
        >
            {!imgLoaded && (
                <Skeleton className="absolute inset-0 z-10" rounded="rounded-[18px]" />
            )}

            {inView && (
                <Image
                    src={image}
                    alt={imageAlt}
                    fill
                    priority
                    sizes="(max-width: 767px) 100vw, (max-width: 1279px) 48vw, 42vw"
                    onLoad={() => setImgLoaded(true)}
                    className="object-cover"
                />
            )}
        </motion.div>
    );
}