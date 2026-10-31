"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, Grip, Sparkles } from "lucide-react";
import { createPortal } from "react-dom";

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
  const [mascotPosition, setMascotPosition] = useState({ x: 0, y: 0 });
  const footerActiveRef = useRef(false);
  const dragStartRef = useRef(null);
  const dragMovedRef = useRef(false);
  const [reacting, setReacting] = useState(false);

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
    let leftLeg;
    let rightLeg;
    let antenna;
    let eyeLeft;
    let eyeRight;
    let glow;
    let pointerX = 0;
    let pointerY = 0;
    let targetPointerX = 0;
    let targetPointerY = 0;
    let activeIndex = 0;
    let progress = 0;
    let reactionUntil = 0;
    let startTime = 0;
    let resizeObserver;
    let targetFacingX = 0;
    let targetFacingY = 0;
    let lastScrollTime = performance.now();

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
      reactionUntil = performance.now() + 1100;
      setReacting(true);
      window.setTimeout(() => setReacting(false), 1150);
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
      const mascotWidth = isMobile ? 48 : 94;
      const mascotHeight = isMobile ? 76 : 142;
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

        const shell = new THREE.MeshStandardMaterial({ color: 0xf4f0e6, roughness: 0.31, metalness: 0.22 });
        const shellShade = new THREE.MeshStandardMaterial({ color: 0xcacfc5, roughness: 0.38, metalness: 0.28 });
        const dark = new THREE.MeshStandardMaterial({ color: 0x101b18, roughness: 0.22, metalness: 0.32 });
        const teal = new THREE.MeshStandardMaterial({ color: 0x5fe0d5, emissive: 0x168f83, emissiveIntensity: 2.3, roughness: 0.2 });
        const orange = new THREE.MeshStandardMaterial({ color: 0xf3a45f, emissive: 0x7a3511, emissiveIntensity: 0.45, metalness: 0.38, roughness: 0.28 });

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

        // Shoulder pivots let each section use a recognisable pose.
        leftArm = new THREE.Group();
        leftArm.position.set(-0.7, -0.16, 0);
        torso.add(leftArm);
        sphere(shellShade, leftArm, [0, 0, 0], [0.22, 0.22, 0.22]);
        capsule(shell, leftArm, [0, -0.34, 0], [0.2, 0.56, 0.2]);
        sphere(shell, leftArm, [0, -0.68, 0.05], [0.22, 0.2, 0.22]);
        // Rounded glove-like hand with three short, softly fanned fingers and a thumb.
        sphere(shell, leftArm, [0, -0.82, 0.12], [0.19, 0.17, 0.15]);
        capsule(shellShade, leftArm, [-0.085, -0.94, 0.17], [0.052, 0.105, 0.05]);
        capsule(shellShade, leftArm, [0, -0.97, 0.19], [0.052, 0.11, 0.05]);
        capsule(shellShade, leftArm, [0.085, -0.94, 0.17], [0.052, 0.105, 0.05]);
        sphere(shellShade, leftArm, [0.16, -0.82, 0.19], [0.075, 0.105, 0.065]);
        rightArm = new THREE.Group();
        rightArm.position.set(0.7, -0.16, 0);
        torso.add(rightArm);
        sphere(shellShade, rightArm, [0, 0, 0], [0.22, 0.22, 0.22]);
        capsule(shell, rightArm, [0, -0.34, 0], [0.2, 0.56, 0.2]);
        sphere(shell, rightArm, [0, -0.68, 0.05], [0.22, 0.2, 0.22]);
        sphere(shell, rightArm, [0, -0.82, 0.12], [0.19, 0.17, 0.15]);
        // A distinct index finger keeps pointing gestures readable; the remaining fingers stay compact.
        capsule(shellShade, rightArm, [0.16, -0.78, 0.19], [0.052, 0.17, 0.05]);
        capsule(shellShade, rightArm, [-0.075, -0.94, 0.17], [0.052, 0.105, 0.05]);
        capsule(shellShade, rightArm, [0.015, -0.97, 0.19], [0.052, 0.11, 0.05]);
        capsule(shellShade, rightArm, [0.095, -0.94, 0.17], [0.052, 0.105, 0.05]);
        sphere(shellShade, rightArm, [-0.15, -0.82, 0.19], [0.075, 0.105, 0.065]);

        // Oversized helmet, inset visor, bright eyes and antenna.
        head = new THREE.Group();
        head.position.set(0, 0.78, 0.02);
        root.add(head);
        sphere(shell, head, [0, 0.03, 0], [0.83, 0.76, 0.65], 32);
        sphere(dark, head, [0, -0.02, 0.53], [0.67, 0.43, 0.2], 32);
        eyeLeft = sphere(teal, head, [-0.25, 0.03, 0.7], [0.09, 0.12, 0.045], 20);
        eyeRight = sphere(teal, head, [0.25, 0.03, 0.7], [0.09, 0.12, 0.045], 20);
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
        antenna.position.set(0.2, 0.68, 0);
        head.add(antenna);
        makeMesh(new THREE.CylinderGeometry(0.035, 0.055, 0.32, 12), orange, antenna, [0, 0.12, 0]);
        sphere(teal, antenna, [0, 0.31, 0], [0.09, 0.09, 0.09], 18);


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
          wave: { left: 0.12, right: -2.25, lean: -0.04, head: 0.03, legs: 0.04 },
          curious: { left: -0.15, right: -0.18, lean: 0.04, head: -0.17, legs: 0.02 },
          inspect: { left: -0.9, right: -0.22, lean: 0.08, head: 0.16, legs: -0.04 },
          excited: { left: -1.2, right: -1.2, lean: -0.02, head: 0, legs: 0.1 },
          work: { left: -0.25, right: -0.7, lean: 0.02, head: -0.04, legs: 0 },
          point: { left: -0.2, right: -1.65, lean: -0.08, head: -0.12, legs: 0.05 },
          welcome: { left: -1.05, right: -1.05, lean: 0, head: 0.02, legs: 0 },
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
          // When the page is idle, Vee stays lively with gentle face-scanning and a small alternating hand wave.
          const idlePlay = !reducedMotion && !footerSettled && time - lastScrollTime > 1600 && !reactingNow;
          const idleLook = idlePlay ? Math.sin(seconds * 1.25) * 0.34 : 0;
          const idleWave = idlePlay ? Math.max(0, Math.sin(seconds * 2.2)) * 0.24 : 0;
          root.position.y = footerSettled ? -0.18 + idle * 0.25 : idle + (reactingNow ? Math.sin(seconds * 13) * 0.08 : 0);
          root.rotation.x = smooth(root.rotation.x, footerSettled ? -0.12 : 0, 0.06);
          root.rotation.y = smooth(root.rotation.y, pointerX * 0.55 + (activeIndex === 5 ? -0.13 : 0), 0.055);
          root.rotation.z = smooth(root.rotation.z, pose.lean + pointerY * 0.1, 0.055);
          // The face looks toward the active heading/form/card, not only toward the cursor.
          const faceYaw = idlePlay ? idleLook + pointerX * 0.12 : targetFacingX * 0.48 + pointerX * 0.22 + pose.head;
          const facePitch = idlePlay ? Math.sin(seconds * 1.7) * 0.08 - pointerY * 0.08 : -targetFacingY * 0.2 - pointerY * 0.16;
          head.rotation.y = smooth(head.rotation.y, faceYaw, 0.075);
          head.rotation.x = smooth(head.rotation.x, facePitch, 0.075);
          leftArm.rotation.z = smooth(leftArm.rotation.z, pose.left + (reactingNow ? Math.sin(seconds * 18) * 0.65 : idleWave), 0.07);
          const pointingRight = targetFacingX >= 0;
          const rightArmTarget = SECTIONS[activeIndex]?.pose === "point"
            ? (pointingRight ? -1.65 : 1.65)
            : pose.right;
          const playfulArm = idlePlay ? Math.sin(seconds * 2.2 + Math.PI) * 0.22 : 0;
          rightArm.rotation.z = smooth(rightArm.rotation.z, rightArmTarget + (reactingNow ? Math.sin(seconds * 18) * 0.65 : playfulArm), 0.07);
          leftLeg.rotation.z = smooth(leftLeg.rotation.z, footerSettled ? -0.42 : -pose.legs + (reactingNow ? -0.14 : 0), 0.05);
          rightLeg.rotation.z = smooth(rightLeg.rotation.z, footerSettled ? 0.42 : pose.legs + (reactingNow ? 0.14 : 0), 0.05);
          antenna.rotation.z = Math.sin(seconds * 2.7) * (reducedMotion ? 0.015 : 0.09);
          eyeLeft.scale.y = eyeRight.scale.y = 0.12 * (Math.sin(seconds * 0.8) > 0.997 ? 0.15 : 1);
          // Give Vee a living expression: the smile gently widens and relaxes instead of staying static.
          smile.scale.y = reducedMotion ? 1 : 0.88 + (Math.sin(seconds * 2.4) + 1) * 0.13;
          smile.rotation.z = reducedMotion ? 0 : Math.sin(seconds * 1.35) * 0.035;
          renderer.render(scene, camera);
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

  return (
    <div
      ref={hostRef}
      className={`pointer-events-none fixed z-40 flex flex-col items-center ${isMobile ? "w-[48px]" : "hidden w-[94px] md:flex"}`}
      style={{
        left: mascotPosition.x,
        top: mascotPosition.y,
        transition: reducedMotion || isDragging ? "none" : "left 650ms cubic-bezier(.2,.75,.25,1), top 650ms cubic-bezier(.2,.75,.25,1)",
      }}
      aria-label="Interactive 3D portfolio companion"
    >
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
            x: clamp(event.clientX - offset.x, 8, window.innerWidth - (isMobile ? 48 : 94) - 8),
            y: clamp(event.clientY - offset.y, 8, window.innerHeight - (isMobile ? 94 : 164)),
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
        className={`pointer-events-auto relative block w-full ${isDragging ? "cursor-grabbing" : "cursor-grab"} touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background ${isMobile ? "h-[66px]" : "h-[132px]"}`}
        onClick={() => {
          if (dragMovedRef.current) {
            dragMovedRef.current = false;
            return;
          }
          if (hasSectionMessage) setMessageOpen((open) => !open);
          setReacting(true);
          window.setTimeout(() => setReacting(false), 1100);
        }}
        aria-label={messageOpen ? "Close mascot message" : "Interact with the 3D portfolio mascot"}
        aria-expanded={messageOpen}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        />
        {!webglReady && (
          <span className="absolute inset-x-0 top-6 flex justify-center" aria-hidden="true">
            <span className="relative flex h-[82px] w-[68px] items-center justify-center rounded-[2rem] border border-[#b8c9c0] bg-[#f4f0e6] shadow-[0_14px_40px_-20px_rgba(12,38,32,.65)]">
              <span className="absolute inset-x-2 top-5 h-8 rounded-2xl bg-[#101b18]" />
              <span className="relative z-10 mt-1 flex gap-3">
                <span className="h-2 w-2 rounded-full bg-[#5fe0d5] shadow-[0_0_8px_#5fe0d5]" />
                <span className="h-2 w-2 rounded-full bg-[#5fe0d5] shadow-[0_0_8px_#5fe0d5]" />
              </span>
            </span>
          </span>
        )}
        <span className="sr-only">Currently exploring: {section.label}</span>
      </button>

      {messageOpen && hasSectionMessage && typeof document !== "undefined" && createPortal(
        <div
          key={section.id + "-message"}
          className="pointer-events-auto fixed z-[99999] rounded-lg border border-border/70 bg-background p-3 text-foreground shadow-xl"
          style={isMobile
            ? { top: "calc(env(safe-area-inset-top, 0px) + 84px)", left: "12px", right: "12px", width: "auto", maxHeight: "calc(100dvh - env(safe-area-inset-top, 0px) - 104px)", overflowY: "auto" }
            : { left: Math.max(12, Math.min(window.innerWidth - 232, mascotPosition.x > window.innerWidth / 2 ? mascotPosition.x - 244 : mascotPosition.x + 104)), top: Math.max(80, Math.min(window.innerHeight - 260, mascotPosition.y - 12)), width: "220px", maxHeight: "min(70vh, 480px)", overflowY: "auto" }}
          role="dialog"
          aria-label={section.label}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">VEE</p>
            <button type="button" onClick={() => setMessageOpen(false)} className="shrink-0 rounded-sm px-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand" aria-label="Close message">×</button>
          </div>
          <p className="mt-2 text-sm leading-snug">{section.note}</p>
          <button
            type="button"
            className="mt-2 text-xs font-semibold text-brand underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
        </div>,
        document.body
      )}
      {reacting && <span className="sr-only" aria-live="polite">Mascot reacted to your interaction.</span>}
    </div>
  );
}
