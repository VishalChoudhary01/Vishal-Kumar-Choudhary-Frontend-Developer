"use client";

import { useEffect, useRef } from "react";
import useReducedMotion from "@/app/hooks/useReducedMotion";

const DEFAULT_COLOR = "#07A290";
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const MAX_DEVICE_PIXEL_RATIO = 1.5;
const TARGET_FRAME_INTERVAL = 1000 / 30;

function getNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function getRgb(hex) {
  const normalized = hex.slice(1);
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function createParticles(count, width, height) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.65,
    vy: (Math.random() - 0.5) * 0.65,
    radius: 1 + Math.random() * 1.25,
  }));
}

export default function GenerativeParticleField({ settings = {} }) {
  const canvasRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const particleCount = Math.round(
    getNumber(settings.particleCount, 28, 120, 72)
  );
  const speed = getNumber(settings.speed, 0, 2, 0.7);
  const connectionDistance = getNumber(
    settings.connectionDistance,
    50,
    180,
    125
  );
  const color =
    typeof settings.color === "string" && HEX_COLOR_PATTERN.test(settings.color)
      ? settings.color
      : DEFAULT_COLOR;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });

    if (!canvas || !context) return undefined;

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let particles = [];
    let frameId = 0;
    let lastFrameTime = 0;
    let disposed = false;

    const [red, green, blue] = getRgb(color);

    const draw = () => {
      context.clearRect(0, 0, width, height);

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];

        for (
          let otherIndex = index + 1;
          otherIndex < particles.length;
          otherIndex += 1
        ) {
          const other = particles[otherIndex];
          const distanceX = particle.x - other.x;
          const distanceY = particle.y - other.y;
          const distance = Math.hypot(distanceX, distanceY);

          if (distance >= connectionDistance) continue;

          const opacity = (1 - distance / connectionDistance) * 0.32;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
          context.lineWidth = 0.75;
          context.stroke();
        }
      }

      context.fillStyle = `rgba(${red}, ${green}, ${blue}, 0.9)`;

      for (const particle of particles) {
        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2
        );
        context.fill();
      }
    };

    const resize = () => {
      if (disposed) return;

      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        MAX_DEVICE_PIXEL_RATIO
      );

      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      particles = createParticles(particleCount, width, height);

      if (prefersReducedMotion || speed === 0) {
        draw();
      }
    };

    const animate = (timestamp) => {
      if (disposed) return;

      if (timestamp - lastFrameTime < TARGET_FRAME_INTERVAL) {
        frameId = window.requestAnimationFrame(animate);
        return;
      }

      const delta = lastFrameTime
        ? Math.min((timestamp - lastFrameTime) / 16.67, 2)
        : 1;
      lastFrameTime = timestamp;

      for (const particle of particles) {
        particle.x += particle.vx * speed * delta;
        particle.y += particle.vy * speed * delta;

        if (particle.x <= 0 || particle.x >= width) {
          particle.vx *= -1;
          particle.x = Math.min(Math.max(particle.x, 0), width);
        }

        if (particle.y <= 0 || particle.y >= height) {
          particle.vy *= -1;
          particle.y = Math.min(Math.max(particle.y, 0), height);
        }
      }

      draw();
      frameId = window.requestAnimationFrame(animate);
    };

    resize();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(resize)
        : null;

    resizeObserver?.observe(canvas);

    if (!prefersReducedMotion && speed > 0) {
      frameId = window.requestAnimationFrame(animate);
    }

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      context.clearRect(0, 0, width, height);
    };
  }, [
    color,
    connectionDistance,
    particleCount,
    prefersReducedMotion,
    speed,
  ]);

  return (
    <section
      role="img"
      aria-label="Generative particle network. Small points drift and connect with nearby points."
      className="relative h-full w-full overflow-hidden bg-background"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,var(--brand-soft),transparent_72%)] opacity-60"
      />

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      />

      <div className="pointer-events-none absolute left-6 top-6 z-10 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.2em] text-text-muted sm:left-9 sm:top-9">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        Generative study / 04
      </div>

      <div className="pointer-events-none absolute bottom-6 left-6 right-6 z-10 flex items-end justify-between gap-4 sm:bottom-9 sm:left-9 sm:right-9">
        <div>
          <p className="font-display text-2xl font-normal tracking-[-0.04em] text-text-primary sm:text-4xl">
            Connected
            <span className="block" style={{ color }}>
              by chance.
            </span>
          </p>
          <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.16em] text-text-muted">
            {prefersReducedMotion
              ? "Static view · reduced motion"
              : speed === 0
                ? "Field paused"
                : "Particles in motion"}
          </p>
        </div>

        <div className="text-right font-mono text-[8px] uppercase tracking-[0.14em] text-text-muted">
          <span className="block">{particleCount} nodes</span>
          <span className="mt-1 block">{connectionDistance}px links</span>
        </div>
      </div>
    </section>
  );
}
