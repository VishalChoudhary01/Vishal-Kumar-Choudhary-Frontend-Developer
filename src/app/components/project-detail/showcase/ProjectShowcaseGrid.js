"use client";

import { useState } from "react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import ProjectShowcaseMedia from "./ProjectShowcaseMedia";
import ProjectShowcaseLightbox from "./ProjectShowcaseLightbox";

/**
 * Conditional mosaic grid:
 *   1 image  → single centered feature image
 *   2 images → equal two-column grid
 *   3 images → first image spans full width, two below
 *   4 images → 2×2 equal grid
 *   5+ images → mosaic: first image featured (full-width),
 *               then 2-col grid for the rest
 */
function getSpanClass(index, count) {
    /* ── Single image ──────────────────────────────────── */
    if (count === 1) {
        return "mx-auto aspect-[16/10] max-w-4xl rounded-[14px]";
    }

    /* ── Two images ────────────────────────────────────── */
    if (count === 2) {
        return "aspect-[4/3] rounded-[14px]";
    }

    /* ── Three images ──────────────────────────────────── */
    if (count === 3) {
        if (index === 0) {
            return "col-span-full aspect-[16/9] rounded-[14px]";
        }
        return "aspect-[4/3] rounded-[14px]";
    }

    /* ── Four images ──────────────────────────────────── */
    if (count === 4) {
        return "aspect-[4/3] rounded-[14px]";
    }

    /* ── Five+ images (mosaic) ────────────────────────── */
    if (index === 0) {
        // Featured: full-width hero image
        return "col-span-full aspect-[16/9] rounded-[14px]";
    }
    if (index % 5 === 1 || index % 5 === 2) {
        // Alternate between taller and shorter tiles
        return "aspect-[4/3] rounded-[14px]";
    }
    return "aspect-[4/3] rounded-[14px]";
}

function getGridClass(count) {
    if (count === 1) {
        return "grid grid-cols-1 gap-5 sm:gap-6";
    }
    if (count === 2) {
        return "grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6";
    }
    if (count === 3) {
        return "grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6";
    }
    // 4+ → two-column mosaic
    return "grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6";
}

export default function ProjectShowcaseGrid({ items }) {
    const validItems = items?.filter((item) => item?.src);
    const [activeIndex, setActiveIndex] = useState(null);
    const reduced = useReducedMotion();

    if (!validItems?.length) return null;

    const count = validItems.length;
    // Only image items participate in the lightbox; videos keep native playback.
    const imageItems = validItems.filter(
        (item) => item?.type !== "video"
    );

    // Position of each tile within the lightbox image list (null for videos).
    const lightboxIndexByTile = new Map();
    let cursor = 0;
    for (const item of validItems) {
        if (item?.type !== "video") {
            lightboxIndexByTile.set(item, cursor);
            cursor += 1;
        }
    }

    return (
        <>
            <div className={getGridClass(count)}>
                {validItems.map((item, index) => {
                    const isImage = item?.type !== "video";

                    return (
                        <ProjectShowcaseMedia
                            key={`${item.src}-${index}`}
                            item={item}
                            index={index}
                            count={count}
                            spanClass={getSpanClass(index, count)}
                            lightboxIndex={isImage ? lightboxIndexByTile.get(item) : null}
                            onActivate={
                                isImage && imageItems.length > 0
                                    ? setActiveIndex
                                    : null
                            }
                        />
                    );
                })}
            </div>

            <ProjectShowcaseLightbox
                items={imageItems}
                index={activeIndex}
                reduced={reduced}
                onClose={() => setActiveIndex(null)}
                onIndexChange={setActiveIndex}
            />
        </>
    );
}
