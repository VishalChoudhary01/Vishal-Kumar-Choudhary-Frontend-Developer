import { useEffect, useMemo, useRef, useState } from "react";

import { createSphereParticleData } from "./particle-geometry.mjs";
import { PARTICLE_SPHERE_CONFIG } from "./particle-constants";
import { ORBIT_SPECS } from "./particle-orbits";
import { getParticleCameraDistance } from "./particle-responsive.mjs";

const VIEW_SIZE = 600;
const DEFAULT_CAMERA_DISTANCE = 6.3;
const FOCAL_LENGTH = VIEW_SIZE / (2 * Math.tan(
  (PARTICLE_SPHERE_CONFIG.cameraFov * Math.PI) / 360,
));

const STATIC_PARTICLE_DATA = createSphereParticleData({
  surfaceCount: 1120,
  innerCount: 220,
  ambientCount: 20,
  radius: PARTICLE_SPHERE_CONFIG.radius,
  seed: 0x51f15e,
});

function rotateXYZ(point, rotation) {
  const [rotateX, rotateY, rotateZ] = rotation;
  const sinX = Math.sin(rotateX);
  const cosX = Math.cos(rotateX);
  const sinY = Math.sin(rotateY);
  const cosY = Math.cos(rotateY);
  const sinZ = Math.sin(rotateZ);
  const cosZ = Math.cos(rotateZ);

  const yAfterX = point.y * cosX - point.z * sinX;
  const zAfterX = point.y * sinX + point.z * cosX;
  const xAfterY = point.x * cosY + zAfterX * sinY;
  const zAfterY = -point.x * sinY + zAfterX * cosY;

  return {
    x: xAfterY * cosZ - yAfterX * sinZ,
    y: xAfterY * sinZ + yAfterX * cosZ,
    z: zAfterY,
  };
}

function projectPoint(point, cameraDistance) {
  const depth = Math.max(0.5, cameraDistance - point.z);
  const scale = FOCAL_LENGTH / depth;

  return {
    x: VIEW_SIZE / 2 + point.x * scale,
    y: VIEW_SIZE / 2 - point.y * scale,
    z: point.z,
    scale,
  };
}

function createStaticParticles(cameraDistance) {
  const data = STATIC_PARTICLE_DATA;
  const particles = [];

  for (let index = 0; index < data.count; index += 1) {
    const offset = index * 3;
    const layer = data.layers[index];
    const seed = data.seeds[index];
    const worldPoint = {
      x: data.positions[offset],
      y: data.positions[offset + 1],
      z: data.positions[offset + 2],
    };
    const projected = projectPoint(worldPoint, cameraDistance);
    const normalizedDepth = Math.min(
      1,
      Math.max(0, (worldPoint.z / data.radius + 1) / 2),
    );
    const isAmbient = layer === 2;
    const isInner = layer === 1;
    const isBright = !isInner && !isAmbient && seed > 0.985;
    const depthBrightness = 0.74 + normalizedDepth * 0.38;
    const baseOpacity = isAmbient
      ? 0.54 + seed * 0.18
      : isInner
        ? 0.16 + seed * 0.1
        : 0.5 + seed * 0.12;
    const opacity = baseOpacity * depthBrightness;
    const surfaceRadius = (0.28 + data.sizes[index] * 0.22) * 1.15;
    const radius = isAmbient
      ? 0.7 + data.sizes[index] * 0.28
      : isInner
        ? 0.24 + data.sizes[index] * 0.18
        : isBright
          ? 1.35 + seed * 1.05
          : surfaceRadius;

    particles.push({
      key: index,
      ...projected,
      radius,
      opacity: isBright ? Math.max(0.82, opacity) : opacity,
      bright: isBright,
      ambient: isAmbient,
      inner: isInner,
    });
  }

  return particles.sort((a, b) => a.z - b.z);
}

function createOrbitPath(spec, cameraDistance) {
  const points = [];
  const segments = 240;

  for (let index = 0; index <= segments; index += 1) {
    const angle = spec.start + ((spec.end - spec.start) * index) / segments;
    const localPoint = {
      x: Math.cos(angle) * spec.radiusX,
      y: Math.sin(angle) * spec.radiusY,
      z: Math.sin(angle * 2) * 0.045,
    };
    points.push(projectPoint(rotateXYZ(localPoint, spec.rotation), cameraDistance));
  }

  const fullPath = points.map((point, index) => (
    (index === 0 ? "M" : "L") + point.x.toFixed(2) + "," + point.y.toFixed(2)
  )).join(" ");

  const frontSegments = [];
  let currentSegment = [];
  points.forEach((point) => {
    if (point.z > 0.025) {
      currentSegment.push(point);
    } else if (currentSegment.length > 1) {
      frontSegments.push(currentSegment);
      currentSegment = [];
    } else {
      currentSegment = [];
    }
  });
  if (currentSegment.length > 1) frontSegments.push(currentSegment);

  const frontPath = frontSegments.map((segment) => (
    segment.map((point, index) => (
      (index === 0 ? "M" : "L") + point.x.toFixed(2) + "," + point.y.toFixed(2)
    )).join(" ")
  )).join(" ");

  const runnerAngle = spec.start + (spec.end - spec.start) * spec.phase;
  const runnerPoint = projectPoint(rotateXYZ({
    x: Math.cos(runnerAngle) * spec.radiusX,
    y: Math.sin(runnerAngle) * spec.radiusY,
    z: Math.sin(runnerAngle * 2) * 0.045,
  }, spec.rotation), cameraDistance);

  return {
    key: spec.phase,
    fullPath,
    frontPath,
    opacity: spec.opacity,
    runner: runnerPoint,
  };
}

export default function StaticParticleSphereArtwork({ className = "" } = {}) {
  const artworkRef = useRef(null);
  const [cameraDistance, setCameraDistance] = useState(DEFAULT_CAMERA_DISTANCE);
  const particles = useMemo(
    () => createStaticParticles(cameraDistance),
    [cameraDistance],
  );
  const orbits = useMemo(
    () => ORBIT_SPECS.map((spec) => createOrbitPath(spec, cameraDistance)),
    [cameraDistance],
  );

  useEffect(() => {
    const artwork = artworkRef.current;
    const renderRoot = artwork?.closest("[data-labs-hero-root]") ?? artwork;

    if (!artwork || !renderRoot || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const measureCamera = () => {
      const bounds = renderRoot.getBoundingClientRect();
      const artworkBounds = artwork.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));
      const artworkHeight = Math.max(1, artworkBounds.height);

      const fittedCameraDistance = getParticleCameraDistance({
        width,
        height,
        fitWidth: Math.max(1, artworkBounds.width),
        fitHeight: artworkHeight,
        fovDegrees: PARTICLE_SPHERE_CONFIG.cameraFov,
        orbitRadius: 2.373,
        fillRatio: 0.94,
      });

      const svgCameraDistance = fittedCameraDistance * (artworkHeight / height);
      setCameraDistance((current) => (
        Math.abs(current - svgCameraDistance) < 0.015
          ? current
          : svgCameraDistance
      ));
    };

    measureCamera();

    const resizeObserver = new ResizeObserver(measureCamera);
    resizeObserver.observe(artwork);
    if (renderRoot !== artwork) resizeObserver.observe(renderRoot);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      ref={artworkRef}
      aria-hidden="true"
      data-static-particle-sphere=""
      className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-300 ease-out ${className}`}
    >
      <div className="absolute left-1/2 top-1/2 aspect-square w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#0b2926]/16 bg-[radial-gradient(circle_at_50%_50%,rgba(10,41,38,0.09),rgba(10,41,38,0.055)_72%,rgba(10,41,38,0.025)_100%)] dark:border-[#8ce8dc]/12 dark:bg-[radial-gradient(circle_at_50%_50%,rgba(52,143,131,0.08),rgba(52,143,131,0.045)_72%,rgba(52,143,131,0.018)_100%)]" />
      <svg
        aria-hidden="true"
        viewBox="0 0 600 600"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <filter id="static-particle-glow" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        <g fill="none" stroke="#0a3d37" className="dark:[&>path]:stroke-[#78d9cf]" strokeWidth="1.1">
          {orbits.map((orbit) => (
            <path
              key={orbit.key}
              d={orbit.fullPath}
              strokeOpacity={orbit.opacity * 1.25}
            />
          ))}
        </g>

        <g>
          {particles.map((particle) => (
            <g key={particle.key}>
              {particle.bright ? (
                <circle
                  cx={particle.x}
                  cy={particle.y}
                  r={particle.radius * 3.1}
                  className="fill-[#0b5548] dark:fill-[#edfffb]"
                  opacity="0.22"
                  filter="url(#static-particle-glow)"
                />
              ) : null}
              <circle
                cx={particle.x}
                cy={particle.y}
                r={particle.radius}
                className={
                  particle.bright
                    ? "fill-[#000000] dark:fill-[#fbfffe]"
                    : particle.ambient
                      ? "fill-[#0d5d53] dark:fill-[#4eaaa2]"
                    : particle.inner
                      ? "fill-[#0b5148] dark:fill-[#75dcd1]"
                      : "fill-[#087b6f] dark:fill-[#d5fff9] opacity-[0.96] dark:opacity-[0.98]"
                }
                opacity={particle.opacity}
              />
            </g>
          ))}
        </g>

        <g fill="none" stroke="#24564f" strokeWidth="1.15">
          {orbits.map((orbit) => (
            <path
              key={orbit.key}
              d={orbit.frontPath}
              strokeOpacity={orbit.opacity * 1.55}
            />
          ))}
        </g>

        <g>
          {orbits.map((orbit) => (
            <g key={orbit.key}>
              <circle
                cx={orbit.runner.x}
                cy={orbit.runner.y}
                r="5.2"
                fill="#59cbbd"
                opacity="0.34"
                filter="url(#static-particle-glow)"
              />
              <circle
                cx={orbit.runner.x}
                cy={orbit.runner.y}
                r="1.6"
                fill="#78d9cf"
                opacity="0.96"
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
