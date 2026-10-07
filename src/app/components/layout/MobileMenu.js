"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, } from "motion/react";
import { easeStandard } from "@/app/lib/motion/easings";
import VKrLogo from "../common/logo/TwoRingLogo";
import HamburgerSVGButton from "../ui/HamburgerSVGButton";
import { cn } from "@/app/lib/utils";
import EditorialNumber from "../ui/EditorialNumber";
import ProjectResumeButton from "../common/ProjectResumeButton";
import Link from "next/link";

const RESUME_PDF = "/resume/vishal_kumar_choudhary_frontend_developer.pdf";

export default function MobileMenu({ navLinks = [], socialLinks = [], activeHref = "", onNavigate, onClose, }) {
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);

  const [openGroups, setOpenGroups] = useState({});

  /* ==========================================================================
     BODY SCROLL LOCK
  ========================================================================== */

  useEffect(() => {
    const scrollY = window.scrollY;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 80);

    return () => {
      window.clearTimeout(focusTimer);

      /* Always restore to clean state — no fragile previous-value capture */
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";

      window.scrollTo({
        top: scrollY,
        left: 0,
        behavior: "auto",
      });
    };
  }, []);

  /* ==========================================================================
     FOCUS TRAP + ESCAPE
  ========================================================================== */

  useEffect(() => {
    const panel = panelRef.current;

    if (!panel) return;

    const getFocusableElements = () => {
      return Array.from(
        panel.querySelectorAll(
          [
            "a[href]",
            "button:not([disabled])",
            "input:not([disabled])",
            "textarea:not([disabled])",
            "select:not([disabled])",
            '[tabindex]:not([tabindex="-1"])',
          ].join(", ")
        )
      );
    };

    const handleKeyDown = (event) => {
      /* ESCAPE */

      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      /* FOCUS TRAP */

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements();

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    panel.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      panel.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  /* ==========================================================================
     NAVIGATION
  ========================================================================== */

  const handleMenuNav = (event, href) => {
    event?.preventDefault?.();

    if (!href) return;

    onNavigate?.(href);
  };

  /* ==========================================================================
     GROUP TOGGLE

     About:
       First tap  → expand
       Second tap → navigate
  ========================================================================== */

  const handleGroupToggle = (event, link) => {
    event?.preventDefault?.();

    const isOpen = Boolean(openGroups[link.href]);

    if (isOpen) {
      handleMenuNav(null, link.href);
      return;
    }

    setOpenGroups((prev) => ({
      ...prev,
      [link.href]: true,
    }));
  };

  /* ==========================================================================
     MOTION
  ========================================================================== */

  const staggerBase = 0.035;

  const linkDelay = (index) => 0.08 + index * staggerBase;

  const bottomDelay = 0.08 + navLinks.length * staggerBase + 0.08;


  return (
    <motion.div ref={panelRef} id="mobile-menu" className=" fixed inset-0 z-[100] flex flex-col overflow-hidden bg-background lg:hidden "
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: 8,
      }}
      transition={{
        duration: 0.32,
        ease: easeStandard,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >


      <motion.header className=" flex h-[72px] shrink-0 items-center justify-between px-4 pt-[env(safe-area-inset-top)] sm:px-6 "
        initial={{
          opacity: 0,
          y: -8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: -6,
        }}
        transition={{
          duration: 0.28,
          delay: 0.03,
          ease: easeStandard,
        }}
      >

        {/* LOGO */}

        <Link
          href="#hero"
          onClick={(event) =>
            handleMenuNav(
              event,
              "#hero"
            )
          }
          aria-label="Go to home">
          <VKrLogo size="sm" />
        </Link>


        {/* CLOSE  */}

        <HamburgerSVGButton
          ref={closeButtonRef}
          isOpen={true}
          onClick={onClose}
          size={40}
          className=""
        />
      </motion.header>

      {/* MAIN NAVIGATION */}

      <main className=" flex min-h-0 flex-1 items-center px-5 sm:px-8 md:px-10 " >
        <nav className="w-full" aria-label="Mobile navigation" >
          <ul className="flex flex-col">
            {navLinks.map(
              (link, index) => {
                const number = String(
                  index + 1
                ).padStart(2, "0");

                const withChildren =
                  (link.children?.length ??
                    0) > 0;

                const isOpen = Boolean(
                  openGroups[link.href]
                );

                const isActive =
                  activeHref === link.href;

                return (
                  <li
                    key={link.href}
                  >
                    {/* =======================================================
                        MAIN LINK
                    ======================================================== */}

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: 8,
                      }}
                      transition={{
                        duration: 0.38,
                        delay: linkDelay(index),
                        ease: easeStandard,
                      }}
                      className="relative"
                    >
                      {withChildren ? (
                        <button
                          type="button"
                          onClick={(event) =>
                            handleGroupToggle(
                              event,
                              link
                            )
                          }
                          aria-expanded={
                            isOpen
                          }
                          aria-current={
                            isActive
                              ? "location"
                              : undefined
                          }
                          className={cn("group relative block w-full cursor-pointer text-left", "pl-[clamp(1.35rem,5vw,3rem)]", "pr-3 py-[clamp(0.95rem,1.4vw,1rem)]", "font-display text-[clamp(2.5rem,7vw,5rem)]", "font-normal leading-[0.9] tracking-[-0.035em]", "transition-colors duration-250", "focus-visible:outline-none", isActive ? "text-brand" : "text-text-primary")}
                        >
                          <EditorialNumber
                            number={number}
                            isActive={isActive}
                          />

                          <span className=" relative z-10 inline-block [text-shadow:0_1px_1px_rgb(0_0_0_/_10%)] dark:[text-shadow:0_1px_2px_rgb(0_0_0_/_38%)] " >
                            <span className="flex items-baseline gap-3">
                              {link.label}

                              <motion.svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                className="h-3.5 w-3.5 translate-y-[-0.12em] text-text-muted"
                                animate={{
                                  rotate:
                                    isOpen
                                      ? 180
                                      : 0,
                                }}
                                transition={{
                                  duration: 0.3,
                                  ease: easeStandard,
                                }}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="m6 9 6 6 6-6" />
                              </motion.svg>
                            </span>
                          </span>
                        </button>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={(event) =>
                            handleMenuNav(
                              event,
                              link.href
                            )
                          }
                          aria-current={
                            isActive
                              ? "location"
                              : undefined
                          }
                          className={cn("group relative block", "pl-[clamp(1.35rem,5vw,3rem)]", "pr-3", "py-[clamp(0.95rem,1.4vw,1rem)]", "font-display", "text-[clamp(2.5rem,7vw,5rem)]", "font-normal", "leading-[0.9]", "tracking-[-0.035em]", "transition-colors duration-250", "focus-visible:outline-none", isActive ? "text-brand" : "text-text-primary")}
                        >
                          <EditorialNumber
                            number={number}
                            isActive={isActive}
                          />

                          <span className=" relative z-10 inline-block [text-shadow:0_1px_1px_rgb(0_0_0_/_10%)] dark:[text-shadow:0_1px_2px_rgb(0_0_0_/_38%)] " >
                            {link.label}
                          </span>
                        </Link>
                      )}
                    </motion.div>

                    {/* =======================================================
                        NESTED SECTIONS
                    ======================================================== */}

                    <AnimatePresence
                      initial={false}
                    >
                      {withChildren &&
                        isOpen && (
                          <motion.ol
                            aria-label={`${link.label} sub-sections`}
                            initial={{
                              height: 0,
                              opacity: 0,
                            }}
                            animate={{
                              height: "auto",
                              opacity: 1,
                            }}
                            exit={{
                              height: 0,
                              opacity: 0,
                            }}
                            transition={{
                              duration: 0.3,
                              ease: easeStandard,
                            }}
                            className=" mb-3 mt-1 overflow-hidden border-l border-border-subtle pl-5 pr-3 ml-[clamp(1.35rem,5vw,3rem)] "  >
                            {link.children.map(
                              (
                                child,
                                childIndex
                              ) => (
                                <li
                                  key={
                                    child.href
                                  }
                                >
                                  <Link
                                    href={
                                      child.href
                                    }
                                    onClick={(
                                      event
                                    ) =>
                                      handleMenuNav(
                                        event,
                                        child.href
                                      )
                                    }
                                    className=" group relative flex items-baseline gap-3 py-[0.65rem] font-display text-[clamp(1.55rem,4.4vw,2.4rem)] font-normal leading-[0.95] tracking-[-0.02em] text-text-secondary transition-colors duration-200 hover:text-brand focus-visible:outline-none " >
                                    <motion.span aria-hidden="true" className=" h-1 w-1 shrink-0 translate-y-[-0.15em] rounded-[1px] bg-brand "
                                      animate={{
                                        opacity:
                                          0.5,
                                      }}
                                      whileHover={{
                                        opacity: 1,
                                      }}
                                    />

                                    <motion.span
                                      initial={{
                                        opacity: 0,
                                        x: -8,
                                      }}
                                      animate={{
                                        opacity: 1,
                                        x: 0,
                                      }}
                                      exit={{
                                        opacity: 0,
                                        x: -8,
                                      }}
                                      transition={{
                                        duration: 0.28,
                                        delay:
                                          0.04 +
                                          childIndex *
                                          0.035,
                                        ease: easeStandard,
                                      }}
                                    >
                                      {
                                        child.label
                                      }
                                    </motion.span>
                                  </Link>
                                </li>
                              )
                            )}
                          </motion.ol>
                        )}
                    </AnimatePresence>
                  </li>
                );
              }
            )}
          </ul>
        </nav>
      </main>

      <footer className=" shrink-0 border-t border-border-subtle px-5 pb-[calc(1.75rem+env(safe-area-inset-bottom))] pt-6 sm:px-8 " >
        {/* RESUME */}

        <motion.div
          className="mb-5 flex justify-center"
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: 8,
          }}
          transition={{
            duration: 0.3,
            delay: bottomDelay,
            ease: easeStandard,
          }}
        >
          <ProjectResumeButton
            href={RESUME_PDF}
            label="Download Resume"
            download="vishal_kumar_choudhary_frontend_developer.pdf"
            ariaLabel="Download resume (PDF)"
            variant="nav"
            className="w-full max-w-sm"
          />
        </motion.div>

        {/* SOCIAL LINKS */}

        <motion.div className=" flex items-center justify-center gap-3 "
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: 8,
          }}
          transition={{
            duration: 0.3,
            delay:
              bottomDelay + 0.05,
            ease: easeStandard,
          }}
        >
          {socialLinks.map((link) => {
            const Icon = link.icon;

            if (!Icon) return null;

            const isEmail =
              link.href?.startsWith(
                "mailto:"
              );

            return (
              <a
                key={link.href}
                href={link.href}
                target={
                  isEmail
                    ? undefined
                    : "_blank"
                }
                rel={
                  isEmail
                    ? undefined
                    : "noopener noreferrer"
                }
                aria-label={link.label}
                className=" flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle text-text-muted transition-all duration-200 hover:border-brand hover:bg-brand-soft hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background " >
                <Icon aria-hidden="true" className="h-5 w-5" />
              </a>
            );
          })}
        </motion.div>
      </footer>
    </motion.div>
  );
}



