"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, Grip, ScanLine, Sparkles } from "lucide-react";
import { createPortal } from "react-dom";
import useUiSound from "@/app/hooks/useUiSound";

const SECTIONS = [
  {
    id: "hero",
    label: "Hey, I'm Vee!",
    note: "I'll show you around Vishal's portfolio. Scroll down and let's explore.",
    detail: "I'm Vee, your little portfolio guide. I'll point out the highlights while you explore Vishal's work.",
    action: "Explore About",
    pose: "wave",
  },
  {
    id: "about",
    label: "Meet Vishal",
    note: "Here's a quick look at the developer behind the work.",
    detail: "Get to know Vishal, his approach to frontend development, and what he enjoys building.",
    action: "Next: Education",
    pose: "curious",
  },
  {
    id: "education",
    label: "Learning journey",
    note: "Take a look at the education and foundations behind his skills.",
    detail: "This section covers Vishal's academic background and the learning that supports his work.",
    action: "Next: Skills",
    pose: "inspect",
  },
  {
    id: "skills",
    label: "Toolbox unlocked",
    note: "Explore the technologies Vishal uses to build polished web experiences.",
    detail: "Browse the stack, libraries, and tools Vishal uses to create responsive interfaces and interactions.",
    action: "Next: Experience",
    pose: "excited",
  },
  {
    id: "experience",
    label: "Work in action",
    note: "See the roles and real-world work that helped shape his experience.",
    detail: "Explore Vishal's professional journey and the practical experience he's gained along the way.",
    action: "Next: Projects",
    pose: "work",
  },
  {
    id: "projects",
    label: "Let's see what's built",
    note: "Pick a project card to explore the work up close.",
    detail: "These projects show how Vishal brings interfaces, functionality, and motion together. Choose a card to learn more.",
    action: "Next: Contact",
    pose: "point",
  },
  {
    id: "contact",
    label: "Let's make something",
    note: "Fill out the contact form here to discuss a role, project, or collaboration.",
    detail: "Have an opportunity or an idea? Fill out the contact form in this section and send Vishal a message. I'll be cheering you on!",
    action: "Find the contact form",
    pose: "welcome",
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function PortfolioMascot() {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [manualPosition, setManualPosition] = useState(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const [welcomeNeedsInteraction, setWelcomeNeedsInteraction] = useState(false);
  const [welcomePromptVisible, setWelcomePromptVisible] = useState(false);
  const welcomeAttentionStartedAtRef = useRef(null);
  const welcomeAudioRef = useRef(null);
  const welcomeAttemptedRef = useRef(false);
  const [mascotPosition, setMascotPosition] = useState({ x: 0, y: 0 });
  const footerActiveRef = useRef(false);
  const dragStartRef = useRef(null);
  const dragMovedRef = useRef(false);
  const [reacting, setReacting] = useState(false);
  const [scanBeam, setScanBeam] = useState(null);
  const [scanImpact, setScanImpact] = useState(null);
  const scanTimerRef = useRef([]);
  const laserOriginRef = useRef(null);
  const laserAimRef = useRef(null);
  const scanCycleRef = useRef({});
  const laserSound = useUiSound("/mp3/laser-large-004.mp3", {
    volume: 0.16,
    interrupt: true,
    preload: "auto",
  });

  const activeSectionRef = useRef("hero");

  useEffect(() => {
    activeSectionRef.current = SECTIONS[active]?.id || "hero";
  }, [active]);

  // Play Vee's introduction once the 3D scene has finished building.
  // Autoplay may be blocked until the visitor interacts with the page.
  useEffect(() => {
    if (!webglReady || welcomeAttemptedRef.current) return undefined;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled || welcomeAttemptedRef.current) return;
      welcomeAttentionStartedAtRef.current = performance.now();
      setWelcomePromptVisible(true);
      welcomeAttemptedRef.current = true;
      const audio = new Audio("/audio/hey-there-im-vee-your.wav");
      audio.preload = "auto";
      audio.volume = 0.85;
      welcomeAudioRef.current = audio;
      audio.play().then(() => {
        if (!cancelled) { setWelcomeNeedsInteraction(false); setWelcomePromptVisible(false); }
      }).catch(() => {
        if (!cancelled) setWelcomeNeedsInteraction(true);
      });
    }, 800);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [webglReady]);

  useEffect(() => () => {
    const audio = welcomeAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const playWelcomeAudio = () => {
    const audio = welcomeAudioRef.current || new Audio("/audio/hey-there-im-vee-your.wav");
    welcomeAudioRef.current = audio;
    audio.play().then(() => { setWelcomeNeedsInteraction(false); setWelcomePromptVisible(false); }).catch(() => { setWelcomeNeedsInteraction(true); setWelcomePromptVisible(true); });
  };

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => {
      setIsDesktop(desktopQuery.matches);
      setIsMobile(mobileQuery.matches);
    };
    syncViewport();
    desktopQuery.addEventListener("change", syncViewport);
    mobileQuery.addEventListener("change", syncViewport);
    return () => {
      desktopQuery.removeEventListener("change", syncViewport);
      mobileQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  useEffect(() => {
    // Keep the companion active on mobile too; the responsive host is smaller there.

    let frame = 0;
    let disposed = false;
    let renderer;
    let scene;
    let camera;
    let root;
    let head;
    let leftArm;
    let rightArm;
    let leftElbow;
    let rightElbow;
    let leftWrist;
    let rightWrist;
    let leftHand;
    let rightHand;
    let leftLeg;
    let rightLeg;
    let antenna;
    let eyeLeft;
    let eyeRight;
    let browLeft;
    let browRight;
    let glow;
    let pointerX = 0;
    let pointerY = 0;
    let targetPointerX = 0;
    let targetPointerY = 0;
    let activeIndex = 0;
    let previousSectionIndex = null;
    let progress = 0;
    let reactionUntil = 0;
    let startTime = 0;
    let resizeObserver;
    let targetFacingX = 0;
    let targetFacingY = 0;
    let lastScrollTime = performance.now();
    let expressionUntil = 0;
    let activeExpression = "happy";
    const expressions = ["happy", "surprised", "curious", "sleepy", "cheeky", "excited", "wink"];
    const chooseExpression = () => {
      const choices = expressions.filter((expression) => expression !== activeExpression);
      activeExpression = choices[Math.floor(Math.random() * choices.length)] || "happy";
      expressionUntil = performance.now() + 1550;
    };

    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return undefined;

    const onPointerMove = (event) => {
      const rect = host.getBoundingClientRect();
      targetPointerX = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 1.2, -0.6, 0.6);
      targetPointerY = clamp(((event.clientY - rect.top) / rect.height - 0.5) * 0.8, -0.4, 0.4);
    };
    const onPointerLeave = () => {
      targetPointerX = 0;
      targetPointerY = 0;
    };
    const onClick = () => {
      reactionUntil = performance.now() + 1550;
      chooseExpression();
      setReacting(true);
      window.setTimeout(() => setReacting(false), 1600);
    };
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerleave", onPointerLeave);
    host.addEventListener("click", onClick);

    const updateScroll = () => {
      lastScrollTime = performance.now();
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress = clamp(window.scrollY / maxScroll, 0, 1);
      let nearest = 0;
      let nearestDistance = Infinity;
      const marker = window.innerHeight * 0.42;
      const footer = document.querySelector("footer, #footer, [data-footer], .site-footer");
      const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 24;
      const footerTop = footer?.getBoundingClientRect().top ?? Infinity;
      // Don't switch to the sitting pose as soon as the footer merely enters view.
      const footerReached = atPageEnd || Boolean(footer && footerTop < window.innerHeight * 0.22 && footer.getBoundingClientRect().bottom > 80);
      footerActiveRef.current = footerReached;
      SECTIONS.forEach((section, index) => {
        const node = document.getElementById(section.id);
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const distance = Math.abs(rect.top + Math.min(rect.height * 0.35, window.innerHeight * 0.35) - marker);
        if (rect.bottom > marker && rect.top < window.innerHeight && distance < nearestDistance) {
          nearestDistance = distance;
          nearest = index;
        }
      });
      // React once when the active portfolio section changes: Vee gives a small
      // bounce, a brief wave, and a fresh expression while adopting the new section pose.
      if (previousSectionIndex !== null && nearest !== previousSectionIndex) {
        reactionUntil = performance.now() + 900;
        chooseExpression();
      }
      previousSectionIndex = nearest;
      activeIndex = nearest;
      setActive(nearest);

      // Follow the active section's content instead of staying pinned to one side.
      // Place the companion beside a heading or primary interactive element, keeping
      // it inside the viewport and away from the center of the target where possible.
      const sectionId = SECTIONS[nearest]?.id;
      const sectionNode = sectionId ? document.getElementById(sectionId) : null;
      const target = footerReached ? footer : sectionNode?.querySelector(
        "[data-mascot-target], form, h1, h2, h3, button, a[href^='#']"
      ) || sectionNode;
      const targetRect = target?.getBoundingClientRect();
      const mascotWidth = isMobile ? 56 : 94;
      const mascotHeight = isMobile ? 88 : 142;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      // Vary the companion's default position around the page, rather than tracking one side.
      const orbit = [
        { x: 0.76, y: 0.16 }, { x: 0.18, y: 0.34 },
        { x: 0.78, y: 0.54 }, { x: 0.16, y: 0.22 },
        { x: 0.74, y: 0.42 }, { x: 0.20, y: 0.58 },
        { x: 0.72, y: 0.30 },
      ][nearest] || { x: 0.75, y: 0.3 };
      let x = viewportWidth * orbit.x;
      let y = viewportHeight * orbit.y;
      if (footerReached && targetRect) {
        // Settle on the footer instead of continuing to float over its content.
        // Park low in the visible footer area so the companion feels settled there.
        x = clamp(viewportWidth - mascotWidth - 12, 8, viewportWidth - mascotWidth - 8);
        // Anchor the mascot to the actual bottom edge, not the footer's top edge.
        y = viewportHeight - mascotHeight - (isMobile ? 4 : 2);
      } else if (!isMobile && targetRect && targetRect.width > 0 && targetRect.height > 0) {
        const preferRight = nearest % 2 === 0;
        x = preferRight ? targetRect.right + 10 : targetRect.left - mascotWidth - 10;
        if (x + mascotWidth > viewportWidth - 8) x = targetRect.left - mascotWidth - 10;
        if (x < 8) x = targetRect.right + 10;
        y = targetRect.top + Math.min(targetRect.height * 0.1, 22);
      }
      x = clamp(x, 8, Math.max(8, viewportWidth - mascotWidth - 8));
      y = footerReached
        ? clamp(y, 8, Math.max(8, viewportHeight - mascotHeight - 2))
        : clamp(y, 72, Math.max(72, viewportHeight - mascotHeight - 42));

      if (targetRect) {
        const mascotCenterX = x + mascotWidth / 2;
        const mascotCenterY = y + mascotHeight / 2;
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;
        targetFacingX = clamp((targetCenterX - mascotCenterX) / Math.max(1, viewportWidth * 0.3), -1, 1);
        targetFacingY = clamp((targetCenterY - mascotCenterY) / Math.max(1, viewportHeight * 0.3), -1, 1);
      } else {
        targetFacingX = 0;
        targetFacingY = 0;
      }
      // Footer parking takes priority over a prior drag position. Otherwise preserve a user-dragged position.
      setMascotPosition(footerReached ? { x, y } : (manualPosition || { x, y }));
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });

    const build = async () => {
      try {
        const THREE = await import("three");
        if (disposed) return;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
        camera.position.set(0, 0.2, 8.5);
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
          stencil: false,
          depth: true,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;

        scene.add(new THREE.HemisphereLight(0xf8f5e9, 0x1b302b, 2.2));
        const keyLight = new THREE.DirectionalLight(0xfff0d6, 3.2);
        keyLight.position.set(3, 5, 6);
        scene.add(keyLight);
        const rimLight = new THREE.PointLight(0x55cfc5, 18, 12);
        rimLight.position.set(-3, 1, -2);
        scene.add(rimLight);
        const accentLight = new THREE.PointLight(0xffa45c, 8, 8);
        accentLight.position.set(2, -2, 4);
        scene.add(accentLight);

        // Local antenna light: a restrained warm glow that pulses with the tip.
        const antennaGlowLight = new THREE.PointLight(0xff321f, 0.5, 3.2, 2);
        antennaGlowLight.position.set(0, 1.75, 0.45);
        scene.add(antennaGlowLight);

        const shell = new THREE.MeshStandardMaterial({ color: 0xf4f0e6, roughness: 0.31, metalness: 0.22 });
        const shellShade = new THREE.MeshStandardMaterial({ color: 0xcacfc5, roughness: 0.38, metalness: 0.28 });
        const dark = new THREE.MeshStandardMaterial({ color: 0x101b18, roughness: 0.22, metalness: 0.32 });
        const teal = new THREE.MeshStandardMaterial({ color: 0x5fe0d5, emissive: 0x168f83, emissiveIntensity: 2.3, roughness: 0.2 });
        const orange = new THREE.MeshStandardMaterial({ color: 0xf3a45f, emissive: 0x7a3511, emissiveIntensity: 0.45, metalness: 0.38, roughness: 0.28 });
        const antennaTipMaterial = new THREE.MeshStandardMaterial({ color: 0xff3b30, emissive: 0xff1b12, emissiveIntensity: 1.8, roughness: 0.2, metalness: 0.08 });

        const makeMesh = (geometry, material, parent, position, scale) => {
          const mesh = new THREE.Mesh(geometry, material);
          if (position) mesh.position.set(position[0], position[1], position[2]);
          if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
          parent.add(mesh);
          return mesh;
        };
        const sphere = (material, parent, position, scale, segments = 24) =>
          makeMesh(new THREE.SphereGeometry(1, segments, Math.max(12, segments - 4)), material, parent, position, scale);
        const capsule = (material, parent, position, scale) =>
          makeMesh(new THREE.CapsuleGeometry(0.5, 0.55, 5, 10), material, parent, position, scale);

        root = new THREE.Group();
        scene.add(root);

        // Legs and magnetic boot soles.
        leftLeg = new THREE.Group();
        leftLeg.position.set(-0.39, -1.03, 0);
        root.add(leftLeg);
        capsule(shellShade, leftLeg, [0, -0.22, 0], [0.27, 0.72, 0.27]);
        makeMesh(new THREE.CapsuleGeometry(0.5, 0.1, 4, 10), dark, leftLeg, [0, -0.62, 0.09], [0.34, 0.34, 0.34]);
        leftLeg.rotation.z = -0.04;
        rightLeg = new THREE.Group();
        rightLeg.position.set(0.39, -1.03, 0);
        root.add(rightLeg);
        capsule(shellShade, rightLeg, [0, -0.22, 0], [0.27, 0.72, 0.27]);
        makeMesh(new THREE.CapsuleGeometry(0.5, 0.1, 4, 10), dark, rightLeg, [0, -0.62, 0.09], [0.34, 0.34, 0.34]);
        rightLeg.rotation.z = 0.04;

        // Compact torso with a luminous status core.
        const torso = new THREE.Group();
        torso.position.y = -0.37;
        root.add(torso);
        capsule(shell, torso, [0, 0, 0], [0.72, 0.82, 0.48]);
        sphere(shellShade, torso, [0, -0.47, 0.02], [0.52, 0.2, 0.43]);
        sphere(dark, torso, [0, 0.08, 0.438], [0.25, 0.22, 0.075]);
        sphere(teal, torso, [0, 0.08, 0.51], [0.105, 0.105, 0.045]);
        sphere(orange, torso, [-0.39, -0.3, 0.38], [0.055, 0.055, 0.035], 16);
        sphere(orange, torso, [0.39, -0.3, 0.38], [0.055, 0.055, 0.035], 16);

        // Articulated arms: overlapping shoulder, upper arm, elbow, forearm, wrist and glove.
        // The extra overlap keeps the silhouette connected when Vee waves or points.
        const makeArm = (side) => {
          const arm = new THREE.Group();
          // Anchor each arm at the upper edge of the torso instead of mid-body.
          arm.position.set(side * 0.68, 0.18, 0.24);
          torso.add(arm);
          sphere(shellShade, arm, [0, 0, 0], [0.225, 0.225, 0.22]);
          capsule(shell, arm, [0, -0.29, 0], [0.195, 0.49, 0.19]);

          const elbow = new THREE.Group();
          elbow.position.set(0, -0.52, 0.015);
          arm.add(elbow);
          sphere(shellShade, elbow, [0, 0, 0], [0.17, 0.17, 0.17]);
          capsule(shell, elbow, [0, -0.19, 0.015], [0.17, 0.36, 0.17]);

          const wrist = new THREE.Group();
          wrist.position.set(0, -0.39, 0.07);
          elbow.add(wrist);
          sphere(shell, wrist, [0, 0, 0], [0.145, 0.13, 0.145]);

          // Slim, finished robot glove: a flatter palm and distinct tapered-looking fingers,
          // avoiding the oversized round mitten silhouette. The whole hand follows the wrist.
          const hand = new THREE.Group();
          hand.position.set(0, -0.105, 0.12);
          wrist.add(hand);
          // Keep the glove compact while preserving its detailed fingers.
          hand.scale.setScalar(0.78);
          sphere(shell, hand, [0, -0.025, 0.045], [0.145, 0.125, 0.095]);
          capsule(shellShade, hand, [0, 0.075, 0.02], [0.112, 0.04, 0.085]);
          // Four separate slim fingers with slightly staggered lengths and rounded ends.
          capsule(shell, hand, [-0.078, -0.125, 0.075], [0.027, 0.105, 0.027]);
          capsule(shell, hand, [-0.026, -0.145, 0.085], [0.028, 0.12, 0.028]);
          capsule(shell, hand, [0.029, -0.14, 0.085], [0.028, 0.115, 0.028]);
          capsule(shell, hand, [0.08, -0.115, 0.07], [0.026, 0.095, 0.026]);
          // A short thumb sits close to the palm rather than sticking out as a round knob.
          capsule(shell, hand, [side * -0.12, -0.045, 0.095], [0.03, 0.075, 0.03]);
          if (side > 0) {
            // Keep the pointing index longer and narrow enough to read as a finger.
            capsule(shell, hand, [0.13, 0.005, 0.09], [0.028, 0.13, 0.028]);
          }
          return { arm, elbow, wrist, hand };
        };
        const leftParts = makeArm(-1);
        leftArm = leftParts.arm;
        leftElbow = leftParts.elbow;
        leftWrist = leftParts.wrist;
        leftHand = leftParts.hand;
        const rightParts = makeArm(1);
        rightArm = rightParts.arm;
        // Keep the raised right hand outside the helmet silhouette during high waves.
        // A small lateral offset plus a slightly more open elbow prevents head intersection.
        rightArm.position.x = 0.68;
        rightElbow = rightParts.elbow;
        rightWrist = rightParts.wrist;
        rightHand = rightParts.hand;

        // Oversized helmet, inset visor, bright eyes and antenna.
        head = new THREE.Group();
        head.position.set(0, 0.78, 0.02);
        root.add(head);
        sphere(shell, head, [0, 0.03, 0], [0.83, 0.76, 0.65], 32);
        sphere(dark, head, [0, -0.02, 0.53], [0.67, 0.43, 0.2], 32);
        eyeLeft = sphere(teal, head, [-0.25, 0.03, 0.7], [0.09, 0.12, 0.045], 20);
        eyeRight = sphere(teal, head, [0.25, 0.03, 0.7], [0.09, 0.12, 0.045], 20);
        const laserHandWorldPosition = new THREE.Vector3();
        const laserHandLocalPosition = new THREE.Vector3(0.08, 0.025, 0.16);
        // Expressive brow plates make curiosity, surprise, and cheekiness readable at a glance.
        browLeft = makeMesh(new THREE.CapsuleGeometry(0.5, 0.12, 4, 10), orange, head, [-0.25, 0.235, 0.675], [0.055, 0.16, 0.035]);
        browRight = makeMesh(new THREE.CapsuleGeometry(0.5, 0.12, 4, 10), orange, head, [0.25, 0.235, 0.675], [0.055, 0.16, 0.035]);
        // A curved, softly glowing smile reads more clearly than a tiny flat mouth.
        const smileCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.19, -0.205, 0.69),
          new THREE.Vector3(-0.11, -0.265, 0.72),
          new THREE.Vector3(0, -0.285, 0.735),
          new THREE.Vector3(0.11, -0.265, 0.72),
          new THREE.Vector3(0.19, -0.205, 0.69),
        ]);
        const smile = new THREE.Mesh(
          new THREE.TubeGeometry(smileCurve, 20, 0.022, 8, false),
          new THREE.MeshStandardMaterial({ color: 0xffbd78, emissive: 0xb75a26, emissiveIntensity: 0.65, roughness: 0.3 }),
        );
        head.add(smile);
        sphere(teal, head, [-0.34, -0.18, 0.57], [0.07, 0.035, 0.018], 16);
        sphere(teal, head, [0.34, -0.18, 0.57], [0.07, 0.035, 0.018], 16);
        // Side ear modules and metallic rings give the character depth.
        sphere(shellShade, head, [-0.82, 0.03, 0], [0.18, 0.29, 0.25]);
        sphere(orange, head, [-0.91, 0.03, 0.13], [0.045, 0.12, 0.12]);
        sphere(shellShade, head, [0.82, 0.03, 0], [0.18, 0.29, 0.25]);
        sphere(teal, head, [0.91, 0.03, 0.13], [0.045, 0.12, 0.12]);
        antenna = new THREE.Group();
        // Center the antenna on the helmet and extend it upward with a clearly visible tip.
        antenna.position.set(0, 0.68, 0);
        head.add(antenna);
        makeMesh(new THREE.CylinderGeometry(0.027, 0.042, 0.48, 12), orange, antenna, [0, 0.22, 0]);
        sphere(antennaTipMaterial, antenna, [0, 0.47, 0], [0.075, 0.075, 0.075], 18);


        const resize = () => {
          if (!renderer || !canvas.parentElement) return;
          const rect = canvas.parentElement.getBoundingClientRect();
          const width = Math.max(1, rect.width);
          const height = Math.max(1, rect.height);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas.parentElement);
        resize();

        const poses = {
          wave: { left: 2.05, right: -2.95, lean: -0.04, head: 0.03, legs: 0.04 },
          curious: { left: 1.25, right: -0.95, lean: 0.04, head: -0.17, legs: 0.02 },
          inspect: { left: 1.4, right: -0.9, lean: 0.08, head: 0.16, legs: -0.04 },
          excited: { left: 1.55, right: -1.55, lean: -0.02, head: 0, legs: 0.1 },
          work: { left: 1.05, right: -1.25, lean: 0.02, head: -0.04, legs: 0 },
          point: { left: 1.0, right: -2.15, lean: -0.08, head: -0.12, legs: 0.05 },
          welcome: { left: 1.5, right: -1.5, lean: 0, head: 0.02, legs: 0 },
        };
        // Hand choreography for each portfolio section. Values are local joint rotations,
        // so the hands visibly change gesture as the active section changes.
        const handGestures = {
          wave:     { leftElbow: -0.02, rightElbow: -0.24, leftWrist: 0.18, rightWrist: 0.22, leftPalm: -0.24, rightPalm: 0.22 },
          curious:  { leftElbow: -0.34, rightElbow: -0.08, leftWrist: -0.12, rightWrist: 0.04, leftPalm: -0.32, rightPalm: 0.08 },
          inspect:  { leftElbow: -0.42, rightElbow: -0.14, leftWrist: 0.08, rightWrist: -0.04, leftPalm: -0.12, rightPalm: 0.04 },
          excited:  { leftElbow: 0.08, rightElbow: -0.08, leftWrist: 0.16, rightWrist: -0.16, leftPalm: -0.2, rightPalm: 0.2 },
          work:     { leftElbow: -0.18, rightElbow: -0.36, leftWrist: 0.02, rightWrist: -0.12, leftPalm: -0.08, rightPalm: 0.14 },
          point:    { leftElbow: -0.12, rightElbow: -0.28, leftWrist: 0.02, rightWrist: -0.2, leftPalm: -0.06, rightPalm: 0.28 },
          welcome:  { leftElbow: -0.04, rightElbow: -0.04, leftWrist: 0.12, rightWrist: -0.12, leftPalm: -0.26, rightPalm: 0.26 },
        };
        const smooth = (current, target, amount) => current + (target - current) * amount;
        const render = (time) => {
          if (disposed) return;
          frame = requestAnimationFrame(render);
          const seconds = time * 0.001;
          if (!startTime) startTime = seconds;
          const footerSettled = footerActiveRef.current;
          const pose = footerSettled
            ? { left: -0.15, right: -0.15, lean: 0.02, head: 0.02, legs: 0.02 }
            : (poses[SECTIONS[activeIndex]?.pose] || poses.wave);
          pointerX = smooth(pointerX, targetPointerX, reducedMotion ? 0.035 : 0.075);
          pointerY = smooth(pointerY, targetPointerY, reducedMotion ? 0.035 : 0.075);
          const idle = reducedMotion ? 0 : Math.sin(seconds * 2.1) * 0.045;
          const reactingNow = time < reactionUntil;
          const expressionActive = time < expressionUntil;
          // Give Vee a short welcoming wave on arrival, then return to its section-specific pose.
          const greeting = !reducedMotion && seconds - startTime < 2.8;
          // When the page is idle, Vee stays lively with gentle face-scanning and a small alternating hand wave.
          const idlePlay = !reducedMotion && !footerSettled && time - lastScrollTime > 1600 && !reactingNow;
          const idleLook = idlePlay ? Math.sin(seconds * 1.25) * 0.34 : 0;
          const idleWave = idlePlay ? Math.max(0, Math.sin(seconds * 2.2)) * 0.24 : 0;
          const welcomeJump = welcomePromptVisible && !welcomeNeedsInteraction
            ? Math.max(0, Math.sin((time - (welcomeAttentionStartedAtRef.current || time)) / 210)) * 0.18
            : 0;
          root.position.y = footerSettled ? -0.18 + idle * 0.25 : idle + welcomeJump + (reactingNow ? Math.sin(seconds * 13) * 0.08 : 0);
          root.rotation.x = smooth(root.rotation.x, footerSettled ? -0.12 : 0, 0.06);
          root.rotation.y = smooth(root.rotation.y, pointerX * 0.55 + (activeIndex === 5 ? -0.13 : 0), 0.055);
          root.rotation.z = smooth(root.rotation.z, pose.lean + pointerY * 0.1, 0.055);
          // The face looks toward the active heading/form/card, not only toward the cursor.
          const faceYaw = idlePlay ? idleLook + pointerX * 0.12 : targetFacingX * 0.48 + pointerX * 0.22 + pose.head;
          const facePitch = idlePlay ? Math.sin(seconds * 1.7) * 0.08 - pointerY * 0.08 : -targetFacingY * 0.2 - pointerY * 0.16;
          head.rotation.y = smooth(head.rotation.y, faceYaw, 0.075);
          head.rotation.x = smooth(head.rotation.x, facePitch, 0.075);
          const greetingWave = greeting ? Math.sin(seconds * 13) * 0.48 : 0;
          const leftWave = reactingNow ? Math.sin(seconds * 18) * 0.65 : idleWave + greetingWave;
          leftArm.rotation.z = smooth(leftArm.rotation.z, pose.left + leftWave, 0.07);
          const pointingRight = targetFacingX >= 0;
          // During a scan, smoothly aim the right arm toward the same screen-space
          // target used by the beam. Outside the short scan window, keep the section pose.
          const scanAim = laserAimRef.current;
          const rightArmTarget = scanAim
            ? clamp(scanAim.angle, -1.3, 1.3)
            : SECTIONS[activeIndex]?.pose === "point"
              ? (pointingRight ? -1.65 : 1.65)
              : pose.right;
          const playfulArm = idlePlay ? Math.sin(seconds * 2.2 + Math.PI) * 0.22 : 0;
          const rightWave = reactingNow ? Math.sin(seconds * 18) * 0.65 : playfulArm + (greeting ? -0.22 : 0);
          rightArm.rotation.z = smooth(rightArm.rotation.z, rightArmTarget + rightWave, 0.07);
          // Secondary joints and palms follow a section-specific gesture with eased transitions.
          const gesture = handGestures[SECTIONS[activeIndex]?.pose] || handGestures.wave;
          const waveMotion = greeting || reactingNow ? Math.sin(seconds * 18) : 0;
          leftElbow.rotation.z = smooth(leftElbow.rotation.z, gesture.leftElbow + Math.max(0, leftWave) * 0.2, 0.09);
          rightElbow.rotation.z = smooth(rightElbow.rotation.z, gesture.rightElbow + Math.max(0, rightWave) * 0.18, 0.09);
          leftWrist.rotation.z = smooth(leftWrist.rotation.z, gesture.leftWrist + waveMotion * 0.18, 0.11);
          rightWrist.rotation.z = smooth(rightWrist.rotation.z, gesture.rightWrist + waveMotion * 0.18, 0.11);
          // Rotate palms to communicate each section's gesture, not just move the whole arm.
          leftHand.rotation.y = smooth(leftHand.rotation.y, gesture.leftPalm + (greeting || reactingNow ? -0.12 : 0), 0.1);
          rightHand.rotation.y = smooth(rightHand.rotation.y, gesture.rightPalm + (greeting || reactingNow ? 0.12 : 0), 0.1);
          // Randomized facial acting: eye shape/spacing, brow angle, smile stretch, and a tiny head tilt.
          const faceExpression = expressionActive ? activeExpression : (idlePlay ? "curious" : "happy");
          const surprised = faceExpression === "surprised";
          const curious = faceExpression === "curious";
          const sleepy = faceExpression === "sleepy";
          const cheeky = faceExpression === "cheeky";
          const excited = faceExpression === "excited";
          const wink = faceExpression === "wink";
          const blink = !reducedMotion && Math.sin(seconds * 0.8) > 0.997;
          const eyeOpenLeft = blink || sleepy ? 0.035 : (surprised || excited ? 0.16 : 0.12);
          const eyeOpenRight = wink ? 0.025 : eyeOpenLeft;
          eyeLeft.scale.y = smooth(eyeLeft.scale.y, eyeOpenLeft, 0.22);
          eyeRight.scale.y = smooth(eyeRight.scale.y, eyeOpenRight, 0.22);
          eyeLeft.position.x = smooth(eyeLeft.position.x, curious ? -0.28 : -0.25, 0.12);
          eyeRight.position.x = smooth(eyeRight.position.x, curious ? 0.22 : 0.25, 0.12);
          browLeft.rotation.z = smooth(browLeft.rotation.z, surprised ? 0.18 : curious ? 0.32 : sleepy ? -0.18 : 0.02, 0.1);
          browRight.rotation.z = smooth(browRight.rotation.z, surprised ? -0.18 : curious ? 0.02 : cheeky ? -0.32 : sleepy ? 0.18 : -0.02, 0.1);
          browLeft.position.y = smooth(browLeft.position.y, surprised || excited ? 0.29 : 0.235, 0.1);
          browRight.position.y = smooth(browRight.position.y, surprised || excited ? 0.29 : 0.235, 0.1);
          smile.scale.x = smooth(smile.scale.x, surprised ? 0.48 : cheeky ? 0.72 : excited ? 1.22 : 1, 0.1);
          smile.scale.y = smooth(smile.scale.y, surprised ? 0.55 : sleepy ? 0.55 : excited ? 1.35 : 0.88 + (Math.sin(seconds * 2.4) + 1) * 0.13, 0.1);
          smile.rotation.z = smooth(smile.rotation.z, cheeky ? -0.18 : curious ? 0.08 : 0, 0.1);
          head.rotation.z = smooth(head.rotation.z, (curious ? -0.12 : cheeky ? 0.1 : 0) + (reducedMotion ? 0 : Math.sin(seconds * 1.1) * 0.012), 0.08);
          leftLeg.rotation.z = smooth(leftLeg.rotation.z, footerSettled ? -0.42 : -pose.legs + (reactingNow ? -0.14 : 0), 0.05);
          rightLeg.rotation.z = smooth(rightLeg.rotation.z, footerSettled ? 0.42 : pose.legs + (reactingNow ? 0.14 : 0), 0.05);
          antenna.rotation.z = Math.sin(seconds * 2.7) * (reducedMotion ? 0.015 : 0.09);
          // Cycle the antenna tip through vivid blood red, orange, and yellow,
          // while pulsing its glow so the signal visibly blinks.
          const signalPulse = (Math.sin(seconds * (reducedMotion ? 1.4 : 5.2)) + 1) * 0.5;
          const signalHue = 0.005 + signalPulse * 0.145; // red → orange → golden yellow
          antennaTipMaterial.color.setHSL(signalHue, 1, 0.52);
          antennaTipMaterial.emissive.setHSL(signalHue, 1, 0.34);
          antennaTipMaterial.emissiveIntensity = 0.45 + signalPulse * 2.6;

          // Environmental response changes gently with the active portfolio section.
          const sectionId = activeSectionRef.current;
          const sectionAccent = sectionId === "skills" || sectionId === "projects"
            ? 0x5fe0d5
            : sectionId === "contact"
              ? 0xffa45c
              : sectionId === "experience"
                ? 0x9ffcdf
                : 0xff6b35;
          const targetGlow = sectionId === "hero" ? 1.35 : sectionId === "contact" ? 1.1 : 0.72;
          antennaGlowLight.color.setHex(sectionAccent);
          antennaGlowLight.intensity = reducedMotion
            ? targetGlow * 0.65
            : targetGlow * (0.35 + signalPulse * 0.9);
          antennaGlowLight.distance = isMobile ? 2.1 : 3.2;
          rimLight.intensity = smooth(rimLight.intensity, sectionId === "skills" || sectionId === "projects" ? 12 : 18, 0.035);
          accentLight.intensity = smooth(accentLight.intensity, sectionId === "contact" ? 11 : sectionId === "experience" ? 6 : 8, 0.035);
          renderer.render(scene, camera);
          // Project a point near the front of the animated right palm so the beam
          // visibly starts at the hand and follows Vee through gestures and movement.
          if (rightHand && canvas && camera) {
            laserHandWorldPosition.copy(laserHandLocalPosition);
            rightHand.localToWorld(laserHandWorldPosition);
            laserHandWorldPosition.project(camera);
            const canvasRect = canvas.getBoundingClientRect();
            const handX = canvasRect.left + ((laserHandWorldPosition.x + 1) * 0.5) * canvasRect.width;
            const handY = canvasRect.top + ((1 - laserHandWorldPosition.y) * 0.5) * canvasRect.height;
            if (Number.isFinite(handX) && Number.isFinite(handY)) {
              laserOriginRef.current = { x: handX, y: handY };
            }
          }
        };
        setWebglReady(true);
        frame = requestAnimationFrame(render);
      } catch (error) {
        console.warn("Portfolio mascot WebGL unavailable; showing lightweight fallback.", error);
      }
    };
    build();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      host.removeEventListener("click", onClick);
      resizeObserver?.disconnect();
      if (scene) {
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((material) => material.dispose());
          }
        });
      }
      renderer?.dispose();
    };
  }, [reducedMotion, isDesktop, isMobile]);

  const section = SECTIONS[active] || SECTIONS[0];
  const hasSectionMessage = Boolean(section?.label?.trim() && section?.note?.trim() && section?.detail?.trim() && section?.action?.trim());
  const activateHolographicScan = () => {
    const host = hostRef.current;
    if (!host || isDragging) return;
    scanTimerRef.current.forEach((timer) => window.clearTimeout(timer));
    scanTimerRef.current = [];
    const rawSectionId = activeSectionRef.current;
    const sectionNode = document.getElementById(rawSectionId);
    const footerNode = document.getElementById("footer");
    const footerTarget = footerNode?.querySelector('[data-mascot-scan-target="footer-building"]');
    const footerRect = footerNode?.getBoundingClientRect();
    const footerTargetRect = footerTarget?.getBoundingClientRect();
    const footerIsActive = Boolean(
      footerActiveRef.current &&
      footerTargetRect &&
      footerTargetRect.width > 0 &&
      footerTargetRect.height > 0 &&
      footerTargetRect.bottom > 0 &&
      footerTargetRect.top < window.innerHeight &&
      footerTargetRect.right > 0 &&
      footerTargetRect.left < window.innerWidth &&
      footerRect &&
      footerRect.bottom > 80
    );

    if (!sectionNode && !footerIsActive) return;

    // Some portfolio sections use singular/custom IDs (for example "skill") while
    // the mascot's section model uses "skills". Resolve the visual section from
    // its ID and visible content so the scan does not silently fall back to generic targets.
    const sectionText = sectionNode
      ? (sectionNode.getAttribute("aria-label") || sectionNode.querySelector("h1, h2, h3, [data-section-label]")?.textContent || "").toLowerCase()
      : "";
    const sectionId = sectionNode
      ? (/skill/i.test(rawSectionId) || /skill/i.test(sectionText) || sectionNode.querySelector("[data-skill-card], [data-skill-icon]") ? "skills"
        : /project/i.test(rawSectionId) || /project/i.test(sectionText) || sectionNode.querySelector("[data-project-card]") ? "projects"
        : rawSectionId)
      : rawSectionId;

    const selectorsBySection = {
      hero: ["img", "picture", "[style*='background-image']", "h1"],
      about: ["h2", "img", "picture", "p"],
      education: ["img", "picture", "h3", "h2", "p"],
      skills: ["[data-skill-card] img", "[data-skill-card] [data-skill-icon]", "[data-skill-card] svg", "[data-skill-icon]", "img", "svg", "[data-skill-card] h3", "[data-skill-card] h4"],
      experience: ["img", "picture", "h3", "h2", "p"],
      projects: ["[data-project-card] img", "article img", "[data-project-card] [style*='background-image']", "article [style*='background-image']", "img", "[data-project-card] h3", "article h3"],
      contact: ["input", "textarea", "select", "button[type='submit']", "label", "h2"],
    };
    const preferred = selectorsBySection[sectionId] || ["img", "svg", "h2", "h3", "button", "a[href]", "input", "textarea"];
    const rank = (node) => {
      const tag = node.tagName.toLowerCase();
      const sectionRanks = {
        hero: { img: 9, picture: 8, h1: 5, a: 4, button: 3 },
        about: { h2: 5, img: 4, picture: 4, p: 2 },
        education: { img: 5, picture: 5, h3: 4, h2: 3, p: 1 },
        skills: { img: 7, svg: 6, h3: 5, h4: 4 },
        experience: { img: 5, picture: 5, h3: 4, h2: 3, p: 1 },
        projects: { img: 5, h3: 4, a: 3, button: 3 },
        contact: { input: 5, textarea: 5, select: 5, button: 4, label: 3, h2: 2 },
      };
      return sectionRanks[sectionId]?.[tag] ?? 1;
    };
    const hostRect = host.getBoundingClientRect();
    // Prefer the live projected hand position; fall back to the mascot hand area if WebGL is unavailable.
    const origin = laserOriginRef.current || {
      x: hostRect.left + hostRect.width * 0.76,
      y: hostRect.top + hostRect.height * 0.68,
    };
    let target = null;

    if (footerIsActive && footerTarget) {
      const rect = footerTarget.getBoundingClientRect();
      target = {
        node: footerTarget,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    } else {
      const seen = new Set();
      let candidates = preferred.flatMap((selector) => [...sectionNode.querySelectorAll(selector)]).filter((node) => {
        if (seen.has(node)) return false;
        seen.add(node);
        if (host.contains(node) || node.closest("[aria-hidden='true']") || node.closest("[inert]")) return false;
        if (node.matches("input:disabled, button:disabled, [aria-hidden='true']")) return false;
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight &&
          rect.right > 0 && rect.left < window.innerWidth && style.visibility !== "hidden" && style.display !== "none" &&
          style.opacity !== "0";
      }).map((node) => {
        const rect = node.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const distance = Math.hypot(x - origin.x, y - origin.y);
        const priority = rank(node);
        const isVisual = node.matches("img, picture, svg, [data-skill-icon], [style*='background-image']");
        const visualBoost = isVisual ? (sectionId === "projects" || sectionId === "skills" ? 260 : 110) : 0;
        return { node, x, y, distance, priority, score: distance - priority * (isMobile ? 34 : 46) - visualBoost };
      }).sort((a, b) => a.score - b.score);
      // Some skill layouts render icon components without data attributes or use
      // CSS backgrounds. If preferred selectors miss, scan the nearest visible
      // visual/text descendant so the beam and impact still happen in this section.
      if (!candidates.length) {
        candidates = [...sectionNode.querySelectorAll("img, svg, canvas, h1, h2, h3, h4, p, a, span, [role='img'], [style*='background-image']")]
          .filter((node) => {
            if (host.contains(node) || node.closest("[aria-hidden='true'], [inert]")) return false;
            const rect = node.getBoundingClientRect();
            const style = window.getComputedStyle(node);
            return rect.width > 8 && rect.height > 8 && rect.bottom > 0 && rect.top < window.innerHeight &&
              rect.right > 0 && rect.left < window.innerWidth && style.visibility !== "hidden" && style.display !== "none" &&
              Number.parseFloat(style.opacity || "1") > 0.05;
          })
          .map((node) => {
            const rect = node.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const visual = node.matches("img, svg, canvas, [role='img'], [style*='background-image']");
            const distance = Math.hypot(x - origin.x, y - origin.y);
            return { node, x, y, distance, score: distance - (visual ? 240 : 0) };
          })
          .sort((a, b) => a.score - b.score);
      }
      // Cycle hero targets between portrait and heading; projects/skills prioritize visuals.
      // This prevents repeated scans from hitting the same text node every time.
      const cycleKey = sectionId === "hero" ? "hero" : sectionId;
      let orderedCandidates = candidates;
      if (sectionId === "skills" && candidates.length) {
        // Keep scans focused on the actual skill visuals, even when the markup
        // nests icons inside wrappers rather than exposing data-skill attributes.
        const skillVisuals = candidates.filter(({ node }) => node.matches("img, svg, canvas, [role='img'], [data-skill-icon], [style*='background-image']"));
        if (skillVisuals.length) orderedCandidates = skillVisuals;
      }
      if (sectionId === "projects" && candidates.length) {
        const projectVisuals = candidates.filter(({ node }) => node.matches("img, canvas, [role='img'], [style*='background-image']"));
        if (projectVisuals.length) orderedCandidates = projectVisuals;
      }
      if (sectionId === "hero") {
        const heroTargets = candidates.filter(({ node }) => node.matches("img, picture, [style*='background-image'], h1"));
        if (heroTargets.length) orderedCandidates = heroTargets.sort((a, b) => {
          const visualA = a.node.matches("img, picture, [style*='background-image']") ? 1 : 0;
          const visualB = b.node.matches("img, picture, [style*='background-image']") ? 1 : 0;
          return visualB - visualA || a.score - b.score;
        });
      }
      const cycleIndex = scanCycleRef.current[cycleKey] || 0;
      target = orderedCandidates.length ? orderedCandidates[cycleIndex % orderedCandidates.length] : null;
      if (orderedCandidates.length > 1) scanCycleRef.current[cycleKey] = cycleIndex + 1;
      if (!target) {
        setReacting(true);
        scanTimerRef.current.push(window.setTimeout(() => setReacting(false), 500));
        return;
      }
  
    }
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const id = Date.now();
    // The right arm pivots from a downward resting direction. Match its temporary
    // rotation to the target vector so the glove points toward the beam's impact.
    // The sign is inverted to match Vee's authored right-arm pointing convention.
    laserAimRef.current = { angle: clamp(-Math.atan2(dx, Math.max(1, -dy)), -1.3, 1.3) };
    laserSound.play();
    setScanBeam({ x: origin.x, y: origin.y, length: Math.hypot(dx, dy), angle: Math.atan2(dy, dx) * 180 / Math.PI, id });
    setReacting(true);
    scanTimerRef.current.push(window.setTimeout(() => {
      if (target.node.isConnected) {
        // A restrained spark burst marks the exact point where the scan reaches its target.
        setScanImpact({ x: target.x, y: target.y, id });
        scanTimerRef.current.push(window.setTimeout(() => setScanImpact(null), reducedMotion ? 80 : 420));
        const targetStyle = window.getComputedStyle(target.node);
        const hasOutlinedText = target.node.matches("h1, h2, h3, h4, p, span") &&
          Number.parseFloat(targetStyle.webkitTextStrokeWidth) > 0 &&
          (targetStyle.webkitTextFillColor === "rgba(0, 0, 0, 0)" || targetStyle.webkitTextFillColor === "transparent");

        if (target.node.matches('[data-mascot-scan-target="footer-building"]')) {
          // The footer component owns its teal fill state so scan and hover
          // share one animation without the generic orange text flash.
          target.node.dispatchEvent(new Event("vee-footer-scan-hit"));
        } else if (hasOutlinedText) {
          // Fill other outlined display text using the existing scan reaction.
          const hoverAnimation = target.node.getAnimations().find((animation) => animation.playState === "running");
          if (hoverAnimation) hoverAnimation.cancel();
          target.node.dispatchEvent(new Event("vee-scan-start"));
          target.node.animate(
            [
              { webkitTextFillColor: "transparent", filter: "brightness(1)" },
              { webkitTextFillColor: "rgb(255, 157, 58)", filter: "brightness(1.12) drop-shadow(0 0 5px rgba(255, 93, 28, 0.5))" },
              { webkitTextFillColor: "rgb(255, 157, 58)", filter: "brightness(1.12) drop-shadow(0 0 5px rgba(255, 93, 28, 0.5))" },
              { webkitTextFillColor: "transparent", filter: "brightness(1)" },
            ],
            { duration: reducedMotion ? 120 : 900, easing: "ease-in-out" },
          );
        } else {
          const isFormControl = target.node.matches("input, textarea, select, button");
          const isProfileImageTarget = sectionId === "hero" &&
            target.node.matches("img, picture, [style*='background-image']");
          const isSkillTarget = sectionId === "skills" || /skills?/i.test(sectionNode.id || "") || Boolean(sectionNode.querySelector("[data-skill-card], [data-skill-icon]"));
          // Keep the reaction on the struck visual itself—no card/container outline.
          // The profile portrait gets a subtle brightness-only flash: no scale or jump.
          // Project previews retain their existing beam animation unchanged.
          const visualTarget = target.node.matches("img, svg, [data-skill-icon], [style*='background-image']")
            ? target.node
            : target.node.querySelector("img, svg, [data-skill-icon], [style*='background-image']") || target.node;
          const originalCaretColor = target.node.style.caretColor;
          if (isFormControl) target.node.style.caretColor = "#ff9a32";
          if (isProfileImageTarget) {
            visualTarget.animate(reducedMotion
              ? [
                  { filter: "brightness(1)" },
                  { filter: "brightness(1.04)" },
                  { filter: "brightness(1)" },
                ]
              : [
                  { filter: "brightness(1) saturate(1)" },
                  { filter: "brightness(1.07) saturate(1.015)" },
                  { filter: "brightness(1.09) saturate(1.02)" },
                  { filter: "brightness(1) saturate(1)" },
                ], { duration: reducedMotion ? 120 : 760, easing: "ease-out" });
          } else {
            visualTarget.animate(reducedMotion
              ? [{ opacity: 0.94 }, { opacity: 1 }]
              : [
                  { filter: "brightness(1) saturate(1) drop-shadow(0 0 0 rgba(255,90,24,0))", transform: "scale(1)" },
                  { filter: "brightness(1.32) saturate(1.12) contrast(1.025) drop-shadow(0 0 4px rgba(255,70,24,0.42)) drop-shadow(0 0 8px rgba(255,190,45,0.22))", transform: "scale(1.025)" },
                  { filter: "brightness(1.2) saturate(1.08) drop-shadow(0 0 3px rgba(255,145,35,0.34))", transform: "scale(1.025)" },
                  { filter: "brightness(1) saturate(1) drop-shadow(0 0 0 rgba(255,90,24,0))", transform: "scale(1)" },
                ], { duration: reducedMotion ? 100 : 760, easing: "ease-out" });
          }
          // Skill icons may be SVGs; also give their exact visual surface a warm beam-colored flash.
          if (isSkillTarget && visualTarget !== target.node) {
            target.node.animate(
              [
                { filter: "brightness(1)" },
                { filter: "brightness(1.18) drop-shadow(0 0 5px rgba(255,110,30,0.24))" },
                { filter: "brightness(1)" },
              ],
              { duration: reducedMotion ? 100 : 680, easing: "ease-out" },
            );
          }
          scanTimerRef.current.push(window.setTimeout(() => {
            if (isFormControl && target.node.isConnected) target.node.style.caretColor = originalCaretColor;
          }, reducedMotion ? 120 : 720));
        }
      }
    }, reducedMotion ? 0 : 420));
    scanTimerRef.current.push(window.setTimeout(() => setScanBeam(null), reducedMotion ? 100 : 620));
    scanTimerRef.current.push(window.setTimeout(() => {
      laserAimRef.current = null;
      setReacting(false);
    }, 850));
  };

  useEffect(() => () => scanTimerRef.current.forEach((timer) => window.clearTimeout(timer)), []);


  // Vee's scan beam and visual reactions are handled by activateHolographicScan.
  // Do not add proximity-based outlines or shadows to surrounding project/section cards.


  return (
    <div
      ref={hostRef}
      className={`pointer-events-none fixed z-40 flex flex-col items-center ${isMobile ? "w-[56px]" : "hidden w-[94px] md:flex"}`}
      style={{
        left: mascotPosition.x,
        top: mascotPosition.y,
        transition: reducedMotion || isDragging ? "none" : "left 650ms cubic-bezier(.2,.75,.25,1), top 650ms cubic-bezier(.2,.75,.25,1)",
      }}
      aria-label="Interactive 3D portfolio companion"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-[12%] right-[12%] -bottom-2 h-3 rounded-[50%] bg-black/25 blur-md dark:bg-black/45"
        animate={reducedMotion ? { opacity: 0.18, scaleX: 1 } : { opacity: isDragging ? 0.12 : [0.16, 0.24, 0.16], scaleX: isDragging ? 1.22 : [0.92, 1.04, 0.92] }}
        transition={reducedMotion ? { duration: 0 } : { duration: isDragging ? 0.18 : 2.4, repeat: isDragging ? 0 : Infinity, ease: "easeInOut" }}
        style={{ pointerEvents: "none" }}
      />
      {scanImpact && typeof document !== "undefined" && createPortal(
        <div
          key={scanImpact.id}
          aria-hidden="true"
          className="pointer-events-none fixed z-[99998]"
          style={{ left: scanImpact.x, top: scanImpact.y }}
        >
          {!reducedMotion && Array.from({ length: 7 }, (_, index) => {
            const angle = (index / 7) * Math.PI * 2;
            const distance = index % 2 === 0 ? 13 : 9;
            return (
              <motion.span
                key={index}
                className="absolute left-0 top-0 block h-1 w-1 rounded-full bg-orange-300/95 shadow-[0_0_5px_rgba(255,92,25,0.72)]"
                initial={{ x: -2, y: -2, opacity: 0.75, scale: 0.8 }}
                animate={{
                  x: Math.cos(angle) * distance - 2,
                  y: Math.sin(angle) * distance - 2,
                  opacity: 0,
                  scale: 0.35,
                }}
                transition={{ duration: 0.34, ease: "easeOut" }}
              />
            );
          })}
          <motion.span
            className="absolute -left-[3px] -top-[3px] block h-[6px] w-[6px] rounded-full bg-red-400/90 shadow-[0_0_4px_rgba(255,92,25,0.58)]"
            initial={{ opacity: 0.45, scale: 0.5 }}
            animate={{ opacity: 0, scale: 1.25 }}
            transition={{ duration: reducedMotion ? 0 : 0.24, ease: "easeOut" }}
          />
        </div>,
        document.body
      )}
      {scanBeam && typeof document !== "undefined" && createPortal(
        <div
          key={scanBeam.id}
          aria-hidden="true"
          className="pointer-events-none fixed z-[99997] h-px rounded-full"
          style={{ left: scanBeam.x, top: scanBeam.y, width: scanBeam.length, rotate: `${scanBeam.angle}deg`, transformOrigin: "left center", opacity: 0.78, background: "linear-gradient(90deg, rgba(176,20,28,0.66) 0%, rgba(255,69,24,0.72) 20%, rgba(255,132,28,0.78) 42%, rgba(255,224,94,0.88) 54%, rgba(255,177,38,0.76) 72%, rgba(255,91,28,0.58) 88%, rgba(184,24,24,0.48) 100%)", boxShadow: "0 0 2px 0.5px rgba(255, 195, 62, 0.42), 0 0 5px 1px rgba(255, 82, 28, 0.22)" }}
        >
          <motion.span
            className="absolute -right-0.5 -top-[1px] h-[3px] w-[3px] rounded-full bg-yellow-100/80 shadow-[0_0_3px_1px_rgba(255,224,95,0.48)]"
            initial={{ left: 0, x: 0, opacity: 0 }}
            animate={{ left: scanBeam.length, x: -2, opacity: [0, 0.72, 0.72, 0] }}
            transition={{ duration: reducedMotion ? 0 : 0.42, ease: "linear" }}
          />
        </div>,
        document.body
      )}
      <motion.div
        aria-hidden="true"
        className="absolute -inset-5 -z-10 rounded-full blur-2xl"
        animate={reducedMotion ? { opacity: 0.16, scale: 1 } : {
          opacity: active === 0 ? [0.22, 0.34, 0.22] : active === 6 ? [0.18, 0.3, 0.18] : [0.12, 0.22, 0.12],
          scale: active === 0 ? [0.92, 1.08, 0.92] : [0.96, 1.04, 0.96],
          background: active === 3 || active === 5
            ? "radial-gradient(circle, rgba(95,224,213,0.32) 0%, rgba(95,224,213,0.08) 42%, transparent 72%)"
            : active === 6
              ? "radial-gradient(circle, rgba(255,164,92,0.34) 0%, rgba(255,164,92,0.08) 42%, transparent 72%)"
              : "radial-gradient(circle, rgba(255,92,48,0.3) 0%, rgba(255,164,92,0.08) 42%, transparent 72%)",
        }}
        transition={reducedMotion ? { duration: 0 } : { duration: active === 0 ? 2.8 : 3.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ pointerEvents: "none" }}
      />
      {(welcomeNeedsInteraction || welcomePromptVisible) && (
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => { event.stopPropagation(); playWelcomeAudio(); }}
          className="pointer-events-auto absolute -top-10 left-1/2 z-[61] -translate-x-1/2 whitespace-nowrap rounded-sm border border-brand/50 bg-background/95 px-3 py-2 text-xs font-semibold text-foreground shadow-[0_0_18px_rgba(255,150,60,0.2)] backdrop-blur-sm transition-transform hover:scale-[1.03] hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand animate-[pulse_2s_ease-in-out_infinite]"
          aria-label="Play Vee's welcome greeting"
        >
          {welcomeNeedsInteraction ? "Tap to hear Vee" : "Meet Vee · Play welcome"}
        </button>
      )}
      <button
        type="button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          activateHolographicScan();
        }}
        className="pointer-events-auto absolute right-0 top-7 z-[60] grid h-7 w-7 translate-x-1/2 place-items-center rounded-full border border-orange-200/35 bg-background/90 text-foreground/75 shadow-[0_2px_12px_rgba(255,105,35,0.14)] backdrop-blur-sm transition-[color,background-color,border-color,box-shadow,transform] duration-200 hover:translate-x-1/2 hover:border-orange-200/65 hover:bg-orange-300/10 hover:text-orange-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-200"
        aria-label="Scan the nearest element with Vee"
        title="Scan nearby element"
      >
        <ScanLine size={14} strokeWidth={1.6} aria-hidden="true" />
      </button>
      <button
        type="button"
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          setIsDragging(true);
          dragMovedRef.current = false;
          dragStartRef.current = { x: event.clientX, y: event.clientY };
          const rect = hostRef.current?.getBoundingClientRect();
          if (rect) hostRef.current.dataset.dragOffset = JSON.stringify({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        }}
        onPointerMove={(event) => {
          if (!isDragging) return;
          const start = dragStartRef.current;
          if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5) dragMovedRef.current = true;
          const offset = JSON.parse(hostRef.current?.dataset.dragOffset || '{"x":0,"y":0}');
          const nextPosition = {
            x: clamp(event.clientX - offset.x, 8, window.innerWidth - (isMobile ? 56 : 94) - 8),
            y: clamp(event.clientY - offset.y, 8, window.innerHeight - (isMobile ? 106 : 164)),
          };
          // Update the rendered position immediately as well as persisting the user's drag.
          setManualPosition(nextPosition);
          setMascotPosition(nextPosition);
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          setIsDragging(false);
          dragStartRef.current = null;
        }}
        onPointerCancel={() => {
          setIsDragging(false);
          dragStartRef.current = null;
        }}
        className={`pointer-events-auto relative block w-full ${isDragging ? "cursor-grabbing" : "cursor-grab"} touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background ${isMobile ? "h-[76px]" : "h-[132px]"}`}
        onClick={() => {
          if (dragMovedRef.current) {
            dragMovedRef.current = false;
            return;
          }
          if (hasSectionMessage) setMessageOpen((open) => !open);
          // The host click listener owns the reaction timer and randomized expression.
        }}
        aria-label={messageOpen ? "Close mascot message" : "Interact with the 3D portfolio mascot"}
        aria-expanded={messageOpen}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        />
        <span className="sr-only">Currently exploring: {section.label}</span>
      </button>

      {messageOpen && hasSectionMessage && typeof document !== "undefined" && createPortal(
        <motion.div
          key={section.id + "-message"}
          initial={reducedMotion ? false : { opacity: 0, y: 8, scale: 0.96, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={reducedMotion ? undefined : { opacity: 0, y: 5, scale: 0.97, filter: "blur(3px)" }}
          transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 30, mass: 0.7 }}
          className="pointer-events-auto fixed z-[99999] overflow-hidden rounded-lg border border-black/10 bg-white/45 p-3 text-[#17211e] shadow-[0_18px_60px_-24px_rgba(0,0,0,0.24)] backdrop-blur-xl before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top_left,rgba(7,162,144,0.13),transparent_58%),linear-gradient(135deg,rgba(255,255,255,0.34),transparent_48%,rgba(7,162,144,0.06))] before:content-[''] [&>*]:relative dark:border-white/15 dark:bg-[#0b100e]/65 dark:text-foreground dark:shadow-[0_18px_60px_-24px_rgba(0,0,0,0.8)] dark:before:bg-[radial-gradient(ellipse_at_top_left,rgba(95,224,213,0.14),transparent_58%),linear-gradient(135deg,rgba(255,255,255,0.07),transparent_48%,rgba(95,224,213,0.04))]"
          style={isMobile
            ? { left: Math.max(12, Math.min(window.innerWidth - 272, mascotPosition.x > window.innerWidth / 2 ? mascotPosition.x - 268 : mascotPosition.x + 56)), top: Math.max(12, Math.min(window.innerHeight - 180, mascotPosition.y - 8)), width: "min(260px, calc(100vw - 72px))", maxWidth: "calc(100vw - 72px)", maxHeight: "calc(100dvh - env(safe-area-inset-top, 0px) - 24px)", overflowY: "auto", padding: "10px" }
            : { left: Math.max(12, Math.min(window.innerWidth - 232, mascotPosition.x > window.innerWidth / 2 ? mascotPosition.x - 244 : mascotPosition.x + 104)), top: Math.max(80, Math.min(window.innerHeight - 260, mascotPosition.y - 12)), width: "220px", maxHeight: "min(70vh, 480px)", overflowY: "auto" }}
          role="dialog"
          aria-label={section.label}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">VEE</p>
            <button type="button" onClick={() => setMessageOpen(false)} className="shrink-0 rounded-sm px-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand" aria-label="Close message">×</button>
          </div>
          <p className="mt-1.5 text-[13px] leading-snug sm:mt-2 sm:text-sm">{section.note}</p>
          <button
            type="button"
            className="mt-1.5 text-xs font-semibold text-brand underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={(event) => {
              event.stopPropagation();
              setMessageOpen(false);
              const nextId = section.id === "contact" ? "contact" : SECTIONS[Math.min(active + 1, SECTIONS.length - 1)].id;
              const targetSection = document.getElementById(nextId);
              const target = section.id === "contact" ? targetSection?.querySelector("form, [data-contact-form], button[type='submit'], input, textarea") : targetSection;
              target?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: section.id === "contact" ? "center" : "start" });
              if (section.id === "contact") window.setTimeout(() => target?.querySelector?.("input, textarea, button")?.focus?.({ preventScroll: true }), reducedMotion ? 0 : 450);
            }}
          >
            {section.action}<ArrowDown size={11} className="ml-1 inline-block" aria-hidden="true" />
          </button>
        </motion.div>,
        document.body
      )}
      {reacting && <span className="sr-only" aria-live="polite">Mascot reacted to your interaction.</span>}
    </div>
  );
}
