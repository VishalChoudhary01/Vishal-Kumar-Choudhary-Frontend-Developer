"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useScroll, useTransform, } from "motion/react";
import EditorialCta from "@/app/components/ui/EditorialCta";
import HeroAmbientBackground from "@/app/components/common/HeroAmbientBackground";
import { usePageLoader } from "@/app/providers/PageLoaderProvider";
import useBreakpoint from "@/app/hooks/useBreakpoint";
import { DrawnTitle } from "./DrawnTitle";
import { MobileIntro } from "./MobileIntro";
import { TakeoverOverlay, ImageMeta, } from "./HeroImageOverlays";
import { NAME, DESCRIPTION, CTA_TEXT, MOTION, } from "./heroMotionConfig";
import SectionEyebrow from "../../common/SectionEyebrow";

function CinematicHero() {
  const heroRef = useRef(null);

  const bp = useBreakpoint();
  const { heroReady } = usePageLoader();

  const isMobile = bp === "mobile";
  const isLargeMobile = bp === "largeMobile";
  const isTablet = bp === "tablet";
  const isDesktop = bp === "desktop";
  const isMobileLike = isMobile || isLargeMobile;

  const config = isMobile
    ? MOTION.mobile
    : isLargeMobile
      ? MOTION.largeMobile
      : isTablet
        ? MOTION.tablet
        : MOTION.desktop;

  const entrance = isMobileLike
    ? MOTION.imageEntrance.mobile
    : isTablet
      ? MOTION.imageEntrance.tablet
      : MOTION.imageEntrance.desktop;

  /* Gate entrance animations on loader completion */
  const gatedEntrance = heroReady
    ? entrance
    : { ...entrance, animate: entrance.initial };

  /* Helper: returns gated content entrance props */
  const gatedContentAnim = heroReady
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 12 };

  /* ------------------------------------------------------------------------
     CURSOR PARALLAX
     ------------------------------------------------------------------------ */

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    if (isMobileLike || typeof window === "undefined") {
      return;
    }

    function onMove(e) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;

      mouseX.set((e.clientX - cx) / cx);
      mouseY.set((e.clientY - cy) / cy);
    }

    window.addEventListener("mousemove", onMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
    };
  }, [isMobileLike, mouseX, mouseY]);

  const cursorPX = useTransform(
    mouseX,
    (v) => v * config.cursorX,
  );

  const cursorPY = useTransform(
    mouseY,
    (v) => v * config.cursorY,
  );

  /* ------------------------------------------------------------------------
     TITLE BOX
     ------------------------------------------------------------------------ */

  const titleBoxRef = useRef(null);
  const titleBoxHeightRef = useRef(0);

  useEffect(() => {
    if (isMobileLike) {
      return;
    }

    const measure = () => {
      const el = titleBoxRef.current;

      if (el) {
        titleBoxHeightRef.current = el.offsetHeight;
      }
    };

    measure();

    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
    };
  }, [isMobileLike]);

  /* ------------------------------------------------------------------------
     SCROLL
     ------------------------------------------------------------------------ */

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroEnd = isMobileLike
    ? 0.52
    : isTablet
      ? 0.56
      : 0.6;

  /*
   * EXISTING SCROLL SYSTEM.
   * This is intentionally untouched by the title drawing animation.
   */
  const heroTimeline = useTransform(
    scrollYProgress,
    [0, heroEnd],
    [0, 1],
  );

  const exitTimeline = useTransform(
    scrollYProgress,
    [heroEnd, 1],
    [0, 1],
  );

  /* ------------------------------------------------------------------------
     SCROLL CUE
     ------------------------------------------------------------------------ */

  const cueOp = useTransform(
    heroTimeline,
    [0, 0.1],
    [1, 0],
  );

  const cueY = useTransform(
    heroTimeline,
    [0, 0.2],
    [0, 14],
  );

  /* ------------------------------------------------------------------------
     GLOW
     ------------------------------------------------------------------------ */

  const glowScale = useTransform(
    scrollYProgress,
    [0, 1],
    [0.8, 1.08],
  );

  const glowOp = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.07, 0.035, 0],
  );

  /* ------------------------------------------------------------------------
     INPUT RANGES
     ------------------------------------------------------------------------ */

  const desktopInputRange = [
    0,
    0.18,
    0.4,
    0.65,
    0.82,
    1,
  ];

  const tabletInputRange = [
    0,
    0.18,
    0.4,
    0.65,
    1,
  ];

  const mobileInputRange = [
    0,
    0.12,
    0.3,
    0.5,
    0.7,
    1,
  ];

  /* ------------------------------------------------------------------------
     TITLE SCALE — EXISTING SYSTEM
     ------------------------------------------------------------------------ */

  const titleScale = useTransform(
    heroTimeline,

    isDesktop
      ? desktopInputRange
      : isTablet
        ? tabletInputRange
        : mobileInputRange,

    isDesktop
      ? MOTION.desktop.titleScale
      : isTablet
        ? MOTION.tablet.titleScale
        : MOTION.mobile.titleScale,
  );

  /* ------------------------------------------------------------------------
     NAME SIZE
     ------------------------------------------------------------------------ */

  const nameSize = useTransform(
    heroTimeline,

    isDesktop
      ? desktopInputRange
      : isTablet
        ? tabletInputRange
        : mobileInputRange,

    isDesktop
      ? MOTION.desktop.nameSize
      : isTablet
        ? MOTION.tablet.nameSize
        : MOTION.mobile.nameSize,
  );

  const nameSizePx = useTransform(
    nameSize,
    (v) => `${Math.round(v)}px`,
  );

  /* ------------------------------------------------------------------------
     INTRO LIFT
     ------------------------------------------------------------------------ */

  const introLift = useTransform(
    titleScale,
    (scaleValue) => {
      const h = titleBoxHeightRef.current;

      if (!h) {
        return 0;
      }

      return -h * Math.max(
        0,
        1 - scaleValue,
      );
    },
  );

  /* ------------------------------------------------------------------------
     DESKTOP / TABLET IMAGE
     ------------------------------------------------------------------------ */

  const imgFrameX = useTransform(
    heroTimeline,
    isDesktop
      ? desktopInputRange
      : tabletInputRange,
    isDesktop
      ? MOTION.desktop.imageX
      : MOTION.tablet.imageX,
  );

  const imgFrameScale = useTransform(
    heroTimeline,
    isDesktop
      ? desktopInputRange
      : tabletInputRange,
    isDesktop
      ? MOTION.desktop.imageScale
      : MOTION.tablet.imageScale,
  );

  const imgFrameY = useTransform(
    heroTimeline,
    isDesktop
      ? desktopInputRange
      : tabletInputRange,
    isDesktop
      ? MOTION.desktop.imageY
      : MOTION.tablet.imageY,
  );

  const imgFrameOp = useTransform(
    exitTimeline,
    [0.55, 0.9, 1],
    [1, 0.7, 0.5],
  );

  /* ------------------------------------------------------------------------
     IMAGE OVERLAY
     ------------------------------------------------------------------------ */

  const overlayOp = useTransform(
    heroTimeline,
    [0.13, 0.5],
    [0, 0.12],
  );

  const captionScrimOp = useTransform(
    heroTimeline,
    [0.02, 0.1],
    [0, 1],
  );

  /* ------------------------------------------------------------------------
     FRAME RADIUS
     ------------------------------------------------------------------------ */

  const desktopFrameRadius = useTransform(
    heroTimeline,

    isDesktop
      ? desktopInputRange
      : tabletInputRange,

    isDesktop
      ? [
        "18px",
        "18px",
        "16px",
        "10px",
        "6px",
        "6px",
      ]
      : [
        "16px",
        "16px",
        "14px",
        "8px",
        "6px",
      ],
  );

  /* ------------------------------------------------------------------------
     IMAGE META
     ------------------------------------------------------------------------ */

  const imgMetaOp = useTransform(
    heroTimeline,
    [0.06, 0.22],
    [0, 1],
  );

  const imgMetaY = useTransform(
    heroTimeline,
    [0.06, 0.22],
    [12, 0],
  );

  /* ------------------------------------------------------------------------
     IMAGE CROP
     ------------------------------------------------------------------------ */

  const imgCropX = useTransform(
    scrollYProgress,
    [0, 0.5, 0.9, 1],
    [0, 2, 0, 1],
  );

  const imgCropY = useTransform(
    scrollYProgress,
    [0, 0.5, 0.9, 1],
    [0, 1, 0, -1],
  );

  const imgInnerX = useTransform(
    [imgCropX, cursorPX],
    ([cx, cpx]) => cx + cpx,
  );

  const imgInnerY = useTransform(
    [imgCropY, cursorPY],
    ([cy, cpy]) => cy + cpy,
  );

  /* ------------------------------------------------------------------------
     CONTENT OPACITY
     ------------------------------------------------------------------------ */

  const contentOp = useTransform(
    heroTimeline,
    config.contentOpacity,
    config.contentOpacityValues,
  );

  /* ------------------------------------------------------------------------
     MOBILE IMAGE
     ------------------------------------------------------------------------ */

  /* Use the matching input range length for each breakpoint's config arrays */
  const cfgInputRange = isDesktop
    ? desktopInputRange
    : isTablet
      ? tabletInputRange
      : mobileInputRange;

  const mobileImgScale = useTransform(
    heroTimeline,
    cfgInputRange,
    config.imageScale,
  );

  const mobileImgY = useTransform(
    heroTimeline,
    cfgInputRange,
    config.imageY,
  );

  const mobileImgX = useTransform(
    heroTimeline,
    cfgInputRange,
    config.imageX,
  );

  const mobileFrameScale = useTransform(
    heroTimeline,
    cfgInputRange,
    config.frameScale ||
    (isTablet
      ? [1, 1.02, 1.15, 1.35, 1.48]
      : MOTION.mobile.frameScale),
  );

  const mobileFrameRadius = useTransform(
    heroTimeline,
    cfgInputRange,
    isTablet
      ? ["16px", "15px", "12px", "9px", "0px"]
      : [
          "16px",
          "15px",
          "12px",
          "9px",
          "5px",
          "0px",
        ],
  );

  const mobileImageFilter = useTransform(
    heroTimeline,
    cfgInputRange,
    isTablet
      ? [
          "contrast(1) brightness(1) saturate(1)",
          "contrast(1.03) brightness(0.99) saturate(0.98)",
          "contrast(1.07) brightness(0.97) saturate(0.95)",
          "contrast(1.15) brightness(0.93) saturate(0.88)",
          "contrast(1.18) brightness(0.92) saturate(0.85)",
        ]
      : [
          "contrast(1) brightness(1) saturate(1)",
          "contrast(1.03) brightness(0.99) saturate(0.98)",
          "contrast(1.07) brightness(0.97) saturate(0.95)",
          "contrast(1.11) brightness(0.95) saturate(0.91)",
          "contrast(1.15) brightness(0.93) saturate(0.88)",
          "contrast(1.18) brightness(0.92) saturate(0.85)",
        ],
  );

  const mobileImgOp = useTransform(
    exitTimeline,
    [0.7, 0.92, 1],
    [1, 1, 1],
  );

  /* ==========================================================================
     JSX
     ========================================================================== */

  return (
    <>
      <section
        ref={heroRef}
        id="hero"
        className="relative bg-background"
        style={{
          height: config.height,
        }}
      >
        <div className="sticky top-0 h-svh w-full overflow-hidden bg-background">
          <HeroAmbientBackground />

          <div className="absolute inset-0 z-10">

            {/* MOBILE */}

            {isMobileLike ? (
              <div
                className="flex h-full flex-col overflow-hidden"
                style={{
                  paddingTop:
                    "calc(env(safe-area-inset-top, 0px) + 96px)",
                }}
              >
                {/* Name */}
                <motion.p
                  className="type-metadata whitespace-nowrap px-[5vw] text-center tracking-[0.12em] text-text-secondary"
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={gatedContentAnim}
                  transition={
                    MOTION.contentEntrance.name
                  }
                  style={{
                    fontSize: nameSizePx,
                  }}
                >
                  {NAME}
                </motion.p>

                {/* Title */}
                <motion.h1
                  className="mt-[4px]  text-center font-normal dark:text-text-primary text-text-primary  "
                  initial={{
                    opacity: 0,
                    y: 16,
                  }}
                  animate={gatedContentAnim}
                  transition={
                    MOTION.contentEntrance.title
                  }
                  style={{
                    fontFamily:
                      "var(--font-display)",
                    fontSize:
                      "clamp(36px, 10vw, 42px)",
                    lineHeight: 0.96,
                    letterSpacing: "-0.04em",
                    scale: titleScale,
                    transformOrigin:
                      "center center",
                  }}
                >
                  <DrawnTitle />
                </motion.h1>

                {/* Image */}
                <div className="relative mt-[22px] flex justify-center">
                  <motion.div
                    className="relative overflow-hidden "
                    style={{
                      width:
                        "calc(100vw - 40px)",
                      height:
                        "min(320px, 44svh)",
                      borderRadius:
                        mobileFrameRadius,
                      transformOrigin:
                        "50% 0%",
                      scale:
                        mobileFrameScale,
                      opacity:
                        mobileImgOp,
                    }}
                  >
                    <motion.img
                      src="/images/png/laptop-me.png"
                      alt="Vishal working at a laptop — frontend developer focused on interactive interfaces"
                      width={500}
                      height={625}
                      loading="eager"
                      decoding="async"
                      className="absolute inset-0 h-full w-full select-none object-cover object-[45%_center]"
                      draggable="false"
                      style={{
                        scale:
                          mobileImgScale,
                        x: mobileImgX,
                        y: mobileImgY,
                        filter:
                          mobileImageFilter,
                      }}
                      {...(heroReady ? MOTION.imageEntrance.mobile : { ...MOTION.imageEntrance.mobile, animate: MOTION.imageEntrance.mobile.initial })}
                    />

                    <TakeoverOverlay
                      opacity={overlayOp}
                    />
                  </motion.div>
                </div>
              </div>
            ) : (
              /* ==============================================================
                 DESKTOP / TABLET
                 ============================================================== */

              <div
                className={`grid h-full gap-4 px-[4vw] ${isTablet
                    ? "grid-cols-[28%_72%]"
                    : "grid-cols-12"
                  }`}
              >
                {/* Left */}
                <div
                  className={`relative flex flex-col justify-center ${isTablet
                      ? "col-span-1"
                      : "col-span-12 lg:col-span-8"
                    }`}
                >
                  <motion.div
                    className="absolute inset-0 flex flex-col justify-center"
                    style={{
                      opacity: contentOp,
                    }}
                  >
                    {/* Name */}
                    <div
                      className="relative mb-2"
                      style={{
                        height: isTablet
                          ? 24
                          : 30,
                      }}
                    >
                      <motion.p
                        className="type-metadata absolute bottom-0 left-0 whitespace-nowrap tracking-[0.12em] text-text-secondary"
                        initial={{
                          opacity: 0,
                          y: 14,
                        }}
                        animate={gatedContentAnim}
                        transition={
                          MOTION
                            .contentEntrance
                            .name
                        }
                        style={{
                          fontSize: nameSizePx,
                        }}
                      >
                        {NAME}
                      </motion.p>
                    </div>

                    {/* ======================================================
                        FRONTEND DEVELOPER
                        ====================================================== */}

                    <motion.h1
                      ref={titleBoxRef}
                        className="font-normal text-text-secondary "
                      initial={{
                        opacity: 0,
                        y: 16,
                      }}
                      animate={gatedContentAnim}
                      transition={
                        MOTION.contentEntrance.title
                      }
                      style={{
                        fontFamily:
                          "var(--font-display)",
                        fontSize: isTablet
                          ? "clamp(48px, 7vw, 100px)"
                          : "clamp(64px, 9vw, 150px)",
                        lineHeight: 0.86,
                        letterSpacing: "-0.045em",
                        transformOrigin:
                          "left top",
                        scale: titleScale,
                      }}
                    >
                      <DrawnTitle />
                    </motion.h1>

                    {/* Intro */}
                    <motion.div
                      style={{
                        y: introLift,
                      }}
                    >
                      <motion.p
                        className="mt-2 lg:mt-[28px]"
                        initial={{
                          opacity: 0,
                          y: 12,
                        }}
                        animate={gatedContentAnim}
                        transition={{
                          ...MOTION
                            .contentEntrance
                            .description,
                          delay: 0.15,
                        }}
                        aria-hidden="true"
                      >
                        <SectionEyebrow />
                      </motion.p>

                      <motion.p
                        className="type-body mt-3 max-w-[min(38vw,560px)] text-text-tertiary"
                        initial={{
                          opacity: 0,
                          y: 14,
                        }}
                        animate={gatedContentAnim}
                        transition={
                          MOTION
                            .contentEntrance
                            .description
                        }
                      >
                        {DESCRIPTION}
                      </motion.p>

                      <motion.div
                        className="mt-4"
                        initial={{
                          opacity: 0,
                          y: 12,
                        }}
                        animate={gatedContentAnim}
                        transition={
                          MOTION
                            .contentEntrance
                            .cta
                        }
                      >
                        <EditorialCta
                          href="#projects"
                          label={CTA_TEXT}
                        />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Right image */}
                <div
                  className={`relative flex items-center justify-center ${isTablet
                      ? "col-span-1"
                      : "col-span-12 lg:col-span-4"
                    }`}
                >
                  <motion.div
                    className="relative aspect-[4/5] w-full overflow-hidden "
                    style={{
                      maxWidth: isTablet
                        ? "clamp(360px, 30vw, 500px)"
                        : "clamp(520px, 36vw, 700px)",

                      x: imgFrameX,
                      y: imgFrameY,
                      scale: imgFrameScale,
                      opacity: imgFrameOp,

                      borderRadius:
                        desktopFrameRadius,

                      transformOrigin:
                        "center center",
                    }}
                  >
                    <motion.img
                      src="/images/png/laptop-me.png"
                      alt="Vishal working at a laptop — frontend developer focused on interactive interfaces"
                      width={500}
                      height={625}
                      loading="eager"
                      decoding="async"
                      className="absolute inset-0 h-full w-full select-none object-cover object-center"
                      draggable="false"
                      style={{
                        x: imgInnerX,
                        y: imgInnerY,
                      }}
                      {...gatedEntrance}
                    />

                    <TakeoverOverlay
                      opacity={overlayOp}
                    />

                    {!isTablet && (
                      <>
                        <motion.div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%]"
                          style={{
                            opacity:
                              captionScrimOp,
                            background:
                              "linear-gradient(to top, rgb(20 18 15 / 0.62), rgb(20 18 15 / 0.24) 55%, transparent)",
                          }}
                        />

                        <ImageMeta
                          opacity={imgMetaOp}
                          y={imgMetaY}
                        />
                      </>
                    )}
                  </motion.div>
                </div>
              </div>
            )}
          </div>

          {/* Scroll cue */}
          <motion.div
            className="pointer-events-none absolute bottom-[7vh] left-1/2 z-50 -translate-x-1/2 text-center"
            style={{
              opacity: cueOp,
              y: cueY,
            }}
          >
            <p className="type-metadata text-text-muted">
              Scroll to explore
            </p>

            <div className="mx-auto mt-4 flex h-11 w-6 items-start justify-center rounded-full border border-border pt-2">
              <span className="h-2 w-[2px] rounded-full bg-text-muted" />
            </div>
          </motion.div>

        </div>
      </section>

      {isMobileLike && <MobileIntro />}
    </>
  );
}

export default CinematicHero;
