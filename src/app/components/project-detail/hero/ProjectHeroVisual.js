/* ------------------------------------------------------------------
   LAYER 3/4 — PRODUCT VISUAL (the hero's primary artifact).
   Next.js Image, natural 2:1 screenshot ratio, thin border,
   restrained radius, controlled depth. On mobile it breaks out of
   the text padding for an immersive presentation; on desktop it
   extends slightly past the content grid (clipped by the hero).
   Parallax lives on the outer wrapper so the entrance animation
   and the scroll transform never fight over the same `y`.
------------------------------------------------------------------ */
"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";

import Skeleton from "@/app/components/ui/Skeleton";
import { EASE, DURATION, DELAY } from "./projectHeroMotion";

export default function ProjectHeroVisual({ project, reduced = false, parallaxStyle }) {
    const image = project?.hero?.media?.src || project?.media?.src || null;
    const imageAlt =
        project?.hero?.media?.alt ||
        project?.media?.alt ||
        `${project?.name || "Project"} interface preview`;

    const [loaded, setLoaded] = useState(false);

    if (!image) {
        return null;
    }

    return (
        <motion.div style={parallaxStyle} className="relative min-w-0">
            <motion.div
                initial={reduced ? false : { opacity: 0, y: 34, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: reduced ? 0 : DURATION.visual, delay: reduced ? 0 : DELAY.visual, ease: EASE }}
                className="relative -mx-5 aspect-[2/1] overflow-hidden rounded-md border border-border-subtle bg-surface-1 shadow-lg sm:-mx-8 md:-mx-10 lg:mx-0 lg:-mr-10 lg:rounded-lg xl:-mr-16 2xl:-mr-24"
            >
                {!loaded && <Skeleton className="absolute inset-0 z-10" rounded="rounded-md" />}

                <Image
                    src={image}
                    alt={imageAlt}
                    fill
                    priority
                    quality={90}
                    sizes="(max-width: 639px) 110vw, (max-width: 1023px) 100vw, (max-width: 1279px) 60vw, 760px"
                    onLoad={() => setLoaded(true)}
                    className="object-cover"
                />
            </motion.div>
        </motion.div>
    );
}
