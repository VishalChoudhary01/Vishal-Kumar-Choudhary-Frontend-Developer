/* ==========================================================================
   HERO CONTENT CONSTANTS
   ========================================================================== */

export const NAME = "VISHAL KUMAR CHOUDHARY";

export const DESCRIPTION =
  "I build interactive interfaces where design, motion, and frontend engineering work as one.";

export const CTA_TEXT = "Explore Projects";

/* ==========================================================================
   MOTION CONFIG
   ========================================================================== */

export const MOTION = {
  desktop: {
    height: "300svh",
    imageX: ["0vw", "-1vw", "-6vw", "-12vw", "-16vw", "-18vw"],
    imageScale: [1, 1.01, 1.04, 1.08, 1.1, 1.1],
    imageY: ["0vh", "0vh", "-1vh", "-2.5vh", "-4vh", "-5vh"],
    titleScale: [1, 0.98, 0.9, 0.78, 0.64, 0.55],
    nameSize: [20, 21, 23, 28, 30, 32],
    cursorX: 5,
    cursorY: 3,
    imageRevealDuration: 1100,
    contentRevealDuration: 700,
    contentOpacity: [0, 0.4, 0.65, 0.82, 1],
    contentOpacityValues: [1, 1, 1, 1, 1],
  },

  tablet: {
    height: "280svh",
    imageX: ["0vw", "-1vw", "-4vw", "-8vw", "-10vw"],
    imageScale: [1, 1.01, 1.04, 1.08, 1.1],
    imageY: ["0vh", "0vh", "-1vh", "-2vh", "-3vh"],
    titleScale: [1, 0.98, 0.9, 0.78, 0.62],
    nameSize: [16, 17, 19, 26, 32],
    cursorX: 3,
    cursorY: 2,
    imageRevealDuration: 900,
    contentRevealDuration: 650,
    contentOpacity: [0, 0.4, 0.65, 0.82, 1],
    contentOpacityValues: [1, 1, 1, 1, 1],
  },

  largeMobile: {
    height: "200svh",
    frameScale: [1, 1.02, 1.2, 1.42, 1.52, 1.55],
    imageX: ["0vw", "-0.5vw", "-1vw", "-1.5vw", "-2vw", "-2vw"],
    imageScale: [1.12, 1.13, 1.14, 1.15, 1.16, 1.18],
    imageY: ["0px", "-2px", "-4px", "-6px", "-8px", "-10px"],
    titleScale: [1, 0.99, 0.97, 0.93, 0.9, 0.88],
    nameSize: [18, 18, 19, 20, 20, 20],
    cursorX: 0,
    cursorY: 0,
    imageRevealDuration: 850,
    contentRevealDuration: 550,
    contentOpacity: [0, 0.4, 0.65, 0.82, 1],
    contentOpacityValues: [1, 1, 1, 1, 1],
  },

  mobile: {
    height: "180svh",
    frameScale: [1, 1.02, 1.2, 1.42, 1.52, 1.55],
    imageX: ["0vw", "-0.5vw", "-1vw", "-1.5vw", "-2vw", "-2vw"],
    imageScale: [1.12, 1.13, 1.14, 1.15, 1.16, 1.18],
    imageY: ["0px", "-2px", "-4px", "-6px", "-8px", "-10px"],
    titleScale: [1, 0.99, 0.97, 0.93, 0.9, 0.88],
    nameSize: [18, 18, 19, 20, 20, 20],
    cursorX: 0,
    cursorY: 0,
    imageRevealDuration: 850,
    contentRevealDuration: 550,
    contentOpacity: [0, 0.4, 0.65, 0.82, 1],
    contentOpacityValues: [1, 1, 1, 1, 1],
  },

  scrollPhases: {
    desktop: {
      read: [0, 0.12],
      takeover: [0.12, 0.45],
      settle: [0.45, 0.8],
      handoff: [0.8, 1.0],
    },

    tablet: {
      read: [0, 0.12],
      takeover: [0.12, 0.45],
      settle: [0.45, 0.8],
      handoff: [0.8, 1.0],
    },

    mobile: {
      read: [0, 0.1],
      takeover: [0.1, 0.5],
      settle: [0.5, 0.8],
      handoff: [0.8, 1.0],
    },
  },

  imageEntrance: {
    desktop: {
      initial: {
        opacity: 0,
        scale: 1.08,
        y: 12,
      },

      animate: {
        opacity: 1,
        scale: 1,
        y: 0,
      },

      transition: {
        duration: 1.1,
        ease: [0.16, 1, 0.3, 1],
      },
    },

    tablet: {
      initial: {
        opacity: 0,
        scale: 1.06,
        y: 10,
      },

      animate: {
        opacity: 1,
        scale: 1,
        y: 0,
      },

      transition: {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
      },
    },

    mobile: {
      initial: {
        opacity: 0,
      },

      animate: {
        opacity: 1,
      },

      transition: {
        duration: 0.85,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },

  contentEntrance: {
    name: {
      delay: 0,
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },

    title: {
      delay: 0.09,
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },

    description: {
      delay: 0.2,
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1],
    },

    cta: {
      delay: 0.3,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },

  mobileIntroEntrance: {
    heading: {
      delay: 0.1,
      duration: 0.6,
      y: 14,
    },

    description: {
      delay: 0.2,
      duration: 0.55,
      y: 12,
    },

    cta: {
      delay: 0.3,
      duration: 0.5,
      y: 10,
    },
  },

  cursorSpring: {
    stiffness: 120,
    damping: 20,
    mass: 0.15,
  },
};
