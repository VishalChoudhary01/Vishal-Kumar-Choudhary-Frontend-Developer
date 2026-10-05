"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, useMotionValueEvent, useScroll } from "motion/react";
import { useMobileMenu } from "@/app/providers/MobileMenuProvider";
import MobileMenu from "./MobileMenu";
import DesktopNavigation from "./DesktopNavigation";
import { ArrowUpRightIcon } from "@/app/components/ui/Icons";
import { portfolio } from "@/app/data/portfolio";
import VKrLogo from "../common/logo/VKrLogo";
import { ThemeToggle } from "../ui/ThemeToggle";
import HamburgerSVGButton from "../ui/HamburgerSVGButton";
import { flattenNavLinks } from "@/app/helper/flattenNav.Links";
import Link from "next/link";
import { cn } from "@/app/lib/utils";
import SocialIcon from "../ui/SocialIcon";
import ActionButton from "../common/buttons/ActionButton";

export default function Navbar({ context = "site" }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState("");
  const [pendingNavigation, setPendingNavigation] = useState(null);

  const { mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useMobileMenu();

  const menuButtonRef = useRef(null);
  const headerRef = useRef(null);
  const previousMenuOpen = useRef(false);

  const navLinks = portfolio.navigation || [];
  const socialLinks = portfolio.socialLinks || [];

  const isProjectContext = context === "project";

  const { scrollY } = useScroll();

  // ---------------------------------------------------------------------------
  // SCROLL-AWARE NAVBAR
  // ---------------------------------------------------------------------------

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  useEffect(() => {
    setScrolled(scrollY.get() > 24);
  }, [scrollY]);

  // ---------------------------------------------------------------------------
  // INITIAL ACTIVE SECTION
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (typeof window === "undefined") return;

    const flat = flattenNavLinks(navLinks);
    const hash = window.location.hash;

    if (hash) {
      const match = flat.find((entry) => entry.href === hash);

      setActiveHref(match ? match.activeHref : hash);

      return;
    }

    if (flat.length > 0) {
      setActiveHref(flat[0].activeHref);
    }
  }, [navLinks]);

  // ---------------------------------------------------------------------------
  // ACTIVE SECTION TRACKING
  //
  // Only meaningful on the main portfolio page.
  // Project pages do not contain these sections.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isProjectContext) return;

    const flat = flattenNavLinks(navLinks);

    const sections = flat
      .map((entry) => {
        if (!entry.href?.startsWith("#")) {
          return null;
        }

        const section = document.getElementById(entry.href.slice(1));

        return section
          ? {
            section,
            activeHref: entry.activeHref,
          }
          : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio -
              a.intersectionRatio,
          );

        const current = visibleSections[0];

        const target = sections.find(
          (item) => item.section === current?.target,
        );

        if (target) {
          setActiveHref(target.activeHref);
        }
      },
      {
        root: null,
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
      },
    );

    sections.forEach((item) => {
      observer.observe(item.section);
    });

    return () => {
      observer.disconnect();
    };
  }, [navLinks, isProjectContext]);

  // ---------------------------------------------------------------------------
  // SCROLL TO SECTION
  // ---------------------------------------------------------------------------

  const scrollToSection = (href) => {
    if (
      typeof window === "undefined" ||
      !href ||
      !href.startsWith("#")
    ) {
      return;
    }

    const target = document.querySelector(href);

    if (!target) {
      return;
    }

    const headerHeight =
      headerRef.current?.getBoundingClientRect().height ?? 60;

    const extraOffset = 16;

    const targetTop =
      target.getBoundingClientRect().top +
      window.scrollY -
      headerHeight -
      extraOffset;

    const normalizedTop = Math.max(0, targetTop);

    window.history.replaceState(null, "", href);

    window.scrollTo({
      top: normalizedTop,
      behavior: "smooth",
    });
  };

  // ---------------------------------------------------------------------------
  // DESKTOP NAVIGATION
  // ---------------------------------------------------------------------------

  const handleDesktopNavigation = (event, href) => {
    if (!href?.startsWith("#")) {
      return;
    }

    event?.preventDefault?.();

    scrollToSection(href);
  };

  // ---------------------------------------------------------------------------
  // MOBILE NAVIGATION
  // ---------------------------------------------------------------------------

  const handleMobileNavigate = (href) => {
    if (!href) return;

    setPendingNavigation(href);

    closeMobileMenu();
  };

  const handleMobileExitComplete = () => {
    if (!pendingNavigation) {
      return;
    }

    const href = pendingNavigation;

    setPendingNavigation(null);

    window.requestAnimationFrame(() => {
      scrollToSection(href);
    });
  };

  // ---------------------------------------------------------------------------
  // ESCAPE CLOSE
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen, closeMobileMenu]);

  // ---------------------------------------------------------------------------
  // RESTORE FOCUS TO HAMBURGER
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (previousMenuOpen.current && !mobileMenuOpen) {
      window.requestAnimationFrame(() => {
        menuButtonRef.current?.focus();
      });
    }

    previousMenuOpen.current = mobileMenuOpen;
  }, [mobileMenuOpen]);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed left-0 right-0 z-50 border",
          "backdrop-blur-[24px]",
          "transition-[top,height,margin,border-radius,background-color,border-color,box-shadow]",
          "duration-[380ms]",
          "ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrolled
            ? [
              "top-0.5 mx-2.5 h-[56px] rounded-full",
              "border-border",
              "bg-surface-elevated/85",
              "shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12),0_16px_40px_-20px_rgb(0_0_0/0.08)]",
              "md:top-1",
              "lg:top-3 lg:mx-18 lg:h-[68px]",
              "lg:bg-surface-elevated/60",
              "lg:shadow-[0_1px_2px_rgb(0_0_0/0.04),0_10px_28px_-14px_rgb(0_0_0/0.14),0_20px_48px_-24px_rgb(0_0_0/0.1)]",
            ]
            : [
              "top-0 h-[60px]",
              "border-border/70",
              "bg-surface-elevated/70",
              "lg:h-[78px]",
              "lg:bg-surface-elevated/60",
            ],
        )}
      >
        <nav
          className={cn(
            "flex h-full w-full items-center justify-between",
            !isProjectContext &&
            "lg:grid lg:grid-cols-[1fr_auto_1fr] lg:[grid-template-rows:100%] lg:justify-between",
            scrolled
              ? "px-2 sm:px-3 lg:pr-2"
              : "mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8",
          )}
          aria-label="Primary navigation"
        >
          {/* -----------------------------------------------------------------
              LOGO
          ----------------------------------------------------------------- */}

          <div className="relative -left-5 flex h-full items-center justify-self-start">
            <Link
              href={isProjectContext ? "/" : "#hero"}
              onClick={(event) => {
                if (isProjectContext) {
                  return;
                }

                event.preventDefault();

                if (mobileMenuOpen) {
                  handleMobileNavigate("#hero");
                  return;
                }

                handleDesktopNavigation(event, "#hero");
              }}
              aria-label="Home"
            >
              <VKrLogo
                className={cn(
                  "origin-left transition-transform duration-300",
                  scrolled ? "scale-[0.92]" : "scale-100",
                )}
              />
            </Link>
          </div>

          {/* -----------------------------------------------------------------
              DESKTOP SECTION NAVIGATION

              Hidden entirely in project context.
          ----------------------------------------------------------------- */}

          {!isProjectContext && (
            <div className="hidden h-full items-center justify-center lg:flex">
              <DesktopNavigation
                navLinks={navLinks}
                activeHref={activeHref}
                onNavigate={handleDesktopNavigation}
              />
            </div>
          )}

          {/* -----------------------------------------------------------------
              RIGHT SIDE
          ----------------------------------------------------------------- */}

          <div className="flex h-full items-center justify-end gap-1.5 lg:justify-self-end lg:gap-0">
            {/* SOCIAL LINKS — portfolio context only */}

            {!isProjectContext && (
              <div className="hidden items-center lg:flex">
                {socialLinks.map((link) => (
                  <SocialIcon
                    key={link.href}
                    link={link}
                  />
                ))}
              </div>
            )}

            {/* DIVIDER — portfolio context only */}

            {!isProjectContext && (
              <div
                aria-hidden="true"
                className="hidden h-[22px] w-px bg-border/15 lg:ml-2 lg:mr-[17px] lg:block"
              />
            )}

            {/* THEME */}

            <div className="flex h-10 w-10 shrink-0 items-center justify-center">
              <ThemeToggle />
            </div>

            {/* RESUME — portfolio context only */}

            {!isProjectContext && (
              <div className="hidden items-center lg:ml-5 lg:flex">
                <Link
                  target="_blank"
                  href="/resume/vishal_kumar_choudhary_frontend_developer.pdf"
                >
                  <ActionButton
                    type="button"
                    label="Resume"
                    icon={ArrowUpRightIcon}
                    iconMotion={{
                      direction: "up-right",
                      distance: 4,
                      rotate: 8,
                      scale: 1,
                      duration: 0.25,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </Link>
              </div>
            )}

            {/* MOBILE MENU BUTTON */}

            {!isProjectContext && (
              <HamburgerSVGButton
                ref={menuButtonRef}
                isOpen={mobileMenuOpen}
                onClick={toggleMobileMenu}
                className="lg:hidden"
              />
            )}
          </div>
        </nav>
      </header>

      {/* ---------------------------------------------------------------------
          MOBILE MENU
      --------------------------------------------------------------------- */}

      <AnimatePresence
        mode="wait"
        onExitComplete={handleMobileExitComplete}
      >
        {mobileMenuOpen && (
          <MobileMenu
            navLinks={navLinks}
            socialLinks={socialLinks}
            activeHref={activeHref}
            onNavigate={handleMobileNavigate}
            onClose={closeMobileMenu}
          />
        )}
      </AnimatePresence>
    </>
  );
}