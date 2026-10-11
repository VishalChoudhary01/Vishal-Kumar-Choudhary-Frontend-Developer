"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, useInView } from "motion/react";

import { portfolio } from "@/app/data/portfolio";
import { usePageLoader } from "@/app/providers/PageLoaderProvider";
import useReducedMotion from "@/app/hooks/useReducedMotion";

import FooterAtmosphere from "./footer_comp/FooterAtmosphere";
import FooterClosing from "./footer_comp/FooterClosing";
import FooterNavigation from "./footer_comp/FooterNavigation";
import FooterSocials from "./footer_comp/FooterSocials";
import FooterMeta from "./footer_comp/FooterMeta";
import FooterShutter from "./footer_comp/FooterShutter";

const NAV_ITEMS = [
    { label: "About", href: "#about" },
    { label: "Experience", href: "#experience" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" },
];

const YEAR = new Date().getFullYear();

const FOOTER_REVEAL = {
    duration: 0.9,
    ease: [0.16, 1, 0.3, 1],
};

export default function Footer() {
    const sectionRef = useRef(null);

    const reduced = useReducedMotion();

    const { heroReady } = usePageLoader();

    /* The four section links (#about, #experience, #projects, #contact)
       only have targets on the homepage, so the footer navigation is
       rendered on "/" and hidden on every other route (project detail
       pages, 404, …) while the rest of the footer stays intact. */
    const pathname = usePathname();
    const isHome = pathname === "/";

    const isInView = useInView(sectionRef, {
        once: true,
        amount: 0.18,
        margin: "0px 0px -4% 0px",
    });

    /*
     * The shutter can only open when:
     *
     * 1. Page loader has completed
     * 2. Footer has entered the viewport
     */
    const revealReady = heroReady && isInView;

    const show = reduced || revealReady;

    return (
        <footer
            ref={sectionRef}
            id="footer"
            className="relative overflow-hidden bg-background"
            aria-label="Site footer"
        >
            <FooterAtmosphere
                reduced={reduced}
                active={revealReady}
            />

            {/* ============================================================
                FOOTER CONTENT
            ============================================================ */}

            <div className="relative z-10">
                <div className="mx-auto flex w-full max-w-[1280px] flex-col px-6 py-7 sm:px-8 sm:py-8 md:px-12 lg:px-20 lg:py-10">
                    {/* Top divider */}

                    <motion.div
                        initial={
                            reduced
                                ? false
                                : {
                                    scaleX: 0,
                                    opacity: 0,
                                }
                        }
                        animate={
                            show
                                ? {
                                    scaleX: 1,
                                    opacity: 1,
                                }
                                : {
                                    scaleX: 0,
                                    opacity: 0,
                                }
                        }
                        transition={
                            reduced
                                ? { duration: 0 }
                                : {
                                    duration: 0.8,
                                    ease: [0.16, 1, 0.3, 1],
                                }
                        }
                        style={{
                            transformOrigin: "left center",
                        }}
                        className="h-px w-full bg-border-subtle"
                        aria-hidden="true"
                    />

                    {/* Closing */}

                    <div className="mb-7 mt-8 sm:mb-8 sm:mt-10 lg:mb-4 lg:mt-12">
                        <FooterClosing
                            show={show}
                            reduced={reduced}
                        />
                    </div>

                    {/* Navigation + Socials */}

                    <motion.div
                        initial={
                            reduced
                                ? false
                                : {
                                    y: 8,
                                    opacity: 0,
                                }
                        }
                        animate={
                            show
                                ? {
                                    y: 0,
                                    opacity: 1,
                                }
                                : {
                                    y: 8,
                                    opacity: 0,
                                }
                        }
                        transition={
                            reduced
                                ? { duration: 0 }
                                : {
                                    ...FOOTER_REVEAL,
                                    delay: 0.15,
                                }
                        }
                        className={`flex shrink-0 flex-col gap-5 md:flex-row md:items-center md:gap-10 ${
                            isHome
                                ? "md:justify-between"
                                : "md:justify-end"
                        }`}
                    >
                        {isHome && (
                            <FooterNavigation items={NAV_ITEMS} />
                        )}

                        <FooterSocials
                            links={portfolio.socialLinks}
                        />
                    </motion.div>

                    {/* Meta */}

                    <FooterMeta
                        year={YEAR}
                        location="BASED IN PATNA"
                        stack="NEXT.JS · MOTION · TAILWIND"
                        endMarker="END OF PAGE"
                        show={show}
                        reduced={reduced}
                    />
                </div>
            </div>

            {/* ============================================================
                SHUTTER
            ============================================================ */}

            <FooterShutter
                active={revealReady}
                reduced={reduced}
            />
        </footer>
    );
}