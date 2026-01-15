"use client";

import { useRef, useEffect, useCallback } from "react";
import useDarkMode from "@/app/hooks/useDarkMode";

export default function ParticleOverlayBackground() {
  const canvasRef = useRef(null);
  const animationId = useRef(null);
  const particles = useRef([]);

  const { isDarkMode } = useDarkMode();

  const PARTICLE_COUNT = 70;
  const GLOW_INTENSITY = 0.9;
  const MAX_GLOW_FRAMES = 60;
  const MAX_BLUR_FRAMES = 90;

  const getPalette = useCallback(() => {
    return isDarkMode
      ? [
          { r: 255, g: 255, b: 255, a: 0.35 },
          { r: 210, g: 210, b: 210, a: 0.25 },
        ]
      : [
          { r: 0, g: 122, b: 255, a: 0.25 },
          { r: 0, g: 180, b: 216, a: 0.22 },
          { r: 80, g: 80, b: 80, a: 0.12 },
        ];
  }, [isDarkMode]);

  const createParticles = useCallback((width, height) => {
    const colors = getPalette();
    particles.current = Array.from({ length: PARTICLE_COUNT }).map(() => {
      const baseColor = colors[Math.floor(Math.random() * colors.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        baseRadius: Math.random() * 1.6 + 0.6,
        radius: Math.random() * 1.6 + 0.6,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: (Math.random() - 0.5) * 0.25,
        baseColor,
        currentColor: { ...baseColor },
        state: "alive",
        collisionTimer: 0,
        collidingWith: null,
      };
    });
  }, [getPalette]);

  const checkCollisions = useCallback(() => {
    const arr = particles.current;

    for (let i = 0; i < arr.length; i++) {
      const p1 = arr[i];
      if (p1.state !== "alive") continue;

      for (let j = i + 1; j < arr.length; j++) {
        const p2 = arr[j];
        if (p2.state !== "alive") continue;

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < p1.radius + p2.radius + 2) {
          p1.state = p2.state = "colliding";
          p1.collidingWith = p2;
          p2.collidingWith = p1;
          p1.collisionTimer = p2.collisionTimer = 0;
          p1.speedX = p1.speedY = 0;
          p2.speedX = p2.speedY = 0;
        }
      }
    }
  }, []);

  const updateParticles = useCallback(
    (width, height) => {
      particles.current.forEach((p) => {
        if (p.state === "alive") {
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        } else {
          p.collisionTimer++;

          if (p.state === "colliding" && p.collisionTimer < MAX_GLOW_FRAMES) {
            const t = p.collisionTimer / MAX_GLOW_FRAMES;
            p.radius = p.baseRadius * (1 + t * 2);
            p.currentColor.a = p.baseColor.a * (1 + t * 3);
          } else if (p.state === "colliding") {
            p.state = "disappearing";
          } else if (p.state === "disappearing") {
            const t =
              (p.collisionTimer - MAX_GLOW_FRAMES) /
              (MAX_BLUR_FRAMES - MAX_GLOW_FRAMES);
            p.radius = p.baseRadius * (3 + t * 5);
            p.currentColor.a = p.baseColor.a * (1 - t);

            if (p.collisionTimer >= MAX_BLUR_FRAMES) {
              p.state = "dead";
            }
          } else if (p.state === "dead") {
            const baseColor =
              getPalette()[Math.floor(Math.random() * getPalette().length)];
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.baseRadius = Math.random() * 1.6 + 0.6;
            p.radius = p.baseRadius;
            p.speedX = (Math.random() - 0.5) * 0.25;
            p.speedY = (Math.random() - 0.5) * 0.25;
            p.baseColor = baseColor;
            p.currentColor = { ...baseColor };
            p.state = "alive";
            p.collisionTimer = 0;
            p.collidingWith = null;
          }
        }
      });
    },
    [getPalette]
  );

  const draw = useCallback(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      checkCollisions();
      updateParticles(w, h);

      particles.current.forEach((p) => {
        if (p.state === "dead") return;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.currentColor.r},${p.currentColor.g},${p.currentColor.b},${p.currentColor.a})`;
        ctx.fill();

        if (p.collidingWith) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.collidingWith.x, p.collidingWith.y);
          ctx.strokeStyle = `rgba(255,255,255,${p.currentColor.a * 0.6})`;
          ctx.stroke();
        }
      });
    },
    [checkCollisions, updateParticles]
  );

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    draw(ctx, canvas.width, canvas.height);
    animationId.current = requestAnimationFrame(animate);
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);
    animationId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId.current);
    };
  }, [animate, createParticles]);

  // Re-seed particles on theme change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      createParticles(canvas.width, canvas.height);
    }
  }, [isDarkMode, createParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}
