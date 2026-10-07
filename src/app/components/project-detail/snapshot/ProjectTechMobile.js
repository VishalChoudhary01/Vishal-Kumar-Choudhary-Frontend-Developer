"use client";

import {
    motion,
    useMotionValue,
    useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";

/*
 * ---------------------------------------------------------
 * MOBILE FOCAL VALUES
 * ---------------------------------------------------------
 *
 * Deliberately softer than the desktop lens: a 320-767px
 * viewport cannot carry the desktop treatment without pushing
 * neighbouring technologies out of a readable size.
 *
 *   focal  -> scale 1.08, opacity 1
 *   near   -> scale ~1.01, opacity ~0.75
 *   far    -> scale 0.95, opacity 0.5
 */
const FOCAL_RADIUS = 200;
const FADE_RADIUS = 320;
const FOCAL_SCALE = 1.08;
const DISTANT_SCALE = 0.95;
const DISTANT_OPACITY = 0.5;

const smoothstep = (progress) =>
    progress * progress * (3 - 2 * progress);

function ProjectTechMobileItem({
    technology,
    tick,
    reducedMotion,
}) {
    const itemRef = useRef(null);

    /*
     * Distance from the optical focus (the vertical center of the
     * screen). Kept in a MotionValue so scale/opacity update
     * without ever touching React state.
     */
    const distance = useMotionValue(0);

    useEffect(() => {
        const item = itemRef.current;

        if (!item) {
            return;
        }

        const update = () => {
            const rect = item.getBoundingClientRect();

            const itemCenter =
                rect.top + rect.height / 2;

            const viewportCenter =
                window.innerHeight * 0.5;

            distance.set(
                Math.abs(
                    itemCenter - viewportCenter
                )
            );
        };

        update();

        /*
         * The parent publishes one rAF-coalesced tick per scroll
         * frame; every item re-measures from that single listener
         * instead of registering its own.
         */
        const unsubscribe = tick.on("change", update);

        window.addEventListener("resize", update);

        return () => {
            unsubscribe();

            window.removeEventListener("resize", update);
        };
    }, [tick, distance]);

    const scale = useTransform(distance, (value) => {
        const progress = Math.min(
            value / FOCAL_RADIUS,
            1
        );

        return (
            FOCAL_SCALE -
            smoothstep(progress) *
            (FOCAL_SCALE - DISTANT_SCALE)
        );
    });

    const opacity = useTransform(
        distance,
        (value) => {
            const progress = Math.min(
                value / FADE_RADIUS,
                1
            );

            return (
                1 -
                smoothstep(progress) *
                (1 - DISTANT_OPACITY)
            );
        }
    );

    return (
        <motion.li
            ref={itemRef}
            style={{
                scale: reducedMotion ? 1 : scale,
                opacity: reducedMotion ? 1 : opacity,
            }}
            className="
                whitespace-nowrap
                py-4
                font-body
                text-[1rem]
                leading-none
                tracking-[-0.015em]
                text-text-primary
                will-change-transform
                sm:py-5
                sm:text-[1.05rem]
            "
        >
            {technology}
        </motion.li>
    );
}

/*
 * ---------------------------------------------------------
 * VERTICAL KINETIC TECHNOLOGY LIST (MOBILE)
 * ---------------------------------------------------------
 *
 * Desktop turns vertical page scroll into horizontal travel.
 * Mobile does not have the horizontal room for that composition,
 * so the same optical idea is rotated 90 degrees:
 *
 *   the list scrolls vertically with the page
 *   the technology nearest the screen center becomes dominant
 *
 * No horizontal rail, no swipe, no carousel — the page's normal
 * vertical scroll IS the interaction.
 */
export default function ProjectTechMobile({
    technologies,
    reducedMotion,
}) {
    /*
     * A monotonically increasing tick: it always changes, so every
     * subscribed item re-measures on each scroll frame (rAF
     * coalesced by the scheduler below).
     */
    const tick = useMotionValue(0);

    useEffect(() => {
        let frame = 0;

        const update = () => {
            frame = 0;
            tick.set(tick.get() + 1);
        };

        const schedule = () => {
            if (frame) {
                return;
            }

            frame = requestAnimationFrame(update);
        };

        schedule();

        window.addEventListener("scroll", schedule, {
            passive: true,
        });

        window.addEventListener("resize", schedule);

        return () => {
            if (frame) {
                cancelAnimationFrame(frame);
            }

            window.removeEventListener(
                "scroll",
                schedule
            );

            window.removeEventListener(
                "resize",
                schedule
            );
        };
    }, [tick]);

    return (
        <ul
            className="
                flex
                flex-col
                items-center
                pt-2
                pb-4
                text-center
            "
        >
            {technologies.map((technology, index) => (
                <ProjectTechMobileItem
                    key={`${technology}-${index}`}
                    technology={technology}
                    tick={tick}
                    reducedMotion={reducedMotion}
                />
            ))}
        </ul>
    );
}
