"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { createSphereParticleData } from "./particle-geometry.mjs";
import {
  particleFragmentShader,
  particleVertexShader,
} from "./particle-shaders";
import { createParticleOrbits } from "./particle-orbits";
import { getSphereSqueeze } from "./particle-animation.mjs";
import { PARTICLE_SPHERE_CONFIG } from "./particle-constants";

function createParticleGeometry() {
  const data = createSphereParticleData({
    surfaceCount: PARTICLE_SPHERE_CONFIG.surfaceCount,
    innerCount: PARTICLE_SPHERE_CONFIG.innerCount,
    ambientCount: PARTICLE_SPHERE_CONFIG.ambientCount,
    radius: PARTICLE_SPHERE_CONFIG.radius,
  });
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(data.positions, 3),
  );
  geometry.setAttribute("aSize", new THREE.BufferAttribute(data.sizes, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(data.seeds, 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(data.colors, 3));
  geometry.setAttribute("aLayer", new THREE.BufferAttribute(data.layers, 1));
  geometry.computeBoundingSphere();

  return geometry;
}

export default function LabsParticleSphere() {
  const mountRef = useRef(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) return undefined;

    let renderer;
    let particleGeometry;
    let particleMaterial;
    let orbitGroup;
    let glow;
    let resizeObserver;
    let intersectionObserver;
    let handleContextLost;
    let disposed = false;
    let animationFrame = 0;
    let isRunning = false;
    let isInView = true;
    let elapsed = 0;
    let previousTime = 0;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      PARTICLE_SPHERE_CONFIG.cameraFov,
      1,
      0.1,
      30,
    );

    camera.position.set(0, 0, PARTICLE_SPHERE_CONFIG.cameraDistance);

    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    const stop = () => {
      isRunning = false;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const renderFrame = (time) => {
      if (!isRunning) return;

      animationFrame = requestAnimationFrame(renderFrame);

      const delta = previousTime
        ? Math.min((time - previousTime) / 1000, PARTICLE_SPHERE_CONFIG.maxDelta)
        : 0;
      previousTime = time;
      elapsed += delta;

      if (particleMaterial) {
        particleMaterial.uniforms.uTime.value = elapsed;
        particleMaterial.uniforms.uSqueeze.value = getSphereSqueeze(elapsed);
      }

      sphereGroup.rotation.y = elapsed * PARTICLE_SPHERE_CONFIG.rotationSpeed;
      sphereGroup.rotation.x = Math.sin(elapsed * 0.16) * 0.035;
      sphereGroup.rotation.z = Math.sin(elapsed * 0.11) * 0.018;

      const squeeze = getSphereSqueeze(elapsed);

      if (orbitGroup) {
        orbitGroup.rotation.y = -elapsed * PARTICLE_SPHERE_CONFIG.orbitSpeed;
        orbitGroup.rotation.z = Math.sin(elapsed * 0.08) * 0.012;
        orbitGroup.scale.set(1 + squeeze * 0.012, 1 - squeeze * 0.018, 1);
      }

      if (glow) {
        glow.scale.set(1 + squeeze * 0.035, 1 - squeeze * 0.075, 1 + squeeze * 0.02);
      }

      renderer.render(scene, camera);
    };

    const start = () => {
      if (isRunning || !isInView || document.hidden || !renderer) return;

      isRunning = true;
      previousTime = 0;
      animationFrame = requestAnimationFrame(renderFrame);
    };

    const disposeScene = () => {
      if (disposed) return;
      disposed = true;

      stop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", resize);
      renderer?.domElement?.removeEventListener("webglcontextlost", handleContextLost);

      const disposeObjects = (root) => {
        root?.traverse((object) => {
          object.geometry?.dispose();

          if (object.material) {
            const materials = Array.isArray(object.material)
              ? object.material
              : [object.material];

            materials.forEach((material) => material.dispose());
          }
        });
      };

      disposeObjects(sphereGroup);
      disposeObjects(orbitGroup);
      renderer?.renderLists?.dispose();
      renderer?.dispose();

      if (renderer?.domElement?.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };

    const resize = () => {
      if (!renderer || !mount) return;

      const bounds = mount.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
        stencil: false,
        depth: true,
      });
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, PARTICLE_SPHERE_CONFIG.maxPixelRatio),
      );
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";

      mount.appendChild(renderer.domElement);

      particleGeometry = createParticleGeometry();
      particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSqueeze: { value: 0 },
          uPixelRatio: { value: renderer.getPixelRatio() },
          uMotionEnabled: { value: 1 },
        },
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      sphereGroup.add(particles);

      orbitGroup = createParticleOrbits(THREE);
      scene.add(orbitGroup);

      glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.94, 28, 20),
        new THREE.MeshBasicMaterial({
          color: 0x0c514b,
          transparent: true,
          opacity: 0.035,
          side: THREE.BackSide,
          depthWrite: false,
        }),
      );
      sphereGroup.add(glow);

      resize();

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(mount);
      } else {
        window.addEventListener("resize", resize, { passive: true });
      }

      if (typeof IntersectionObserver !== "undefined") {
        intersectionObserver = new IntersectionObserver(
          ([entry]) => {
            isInView = Boolean(entry?.isIntersecting);

            if (isInView) {
              start();
            } else {
              stop();
            }
          },
          { threshold: 0.02 },
        );
        intersectionObserver.observe(mount);
      }

      handleContextLost = (event) => {
        event.preventDefault();
        disposeScene();
        setWebglFailed(true);
      };
      renderer.domElement.addEventListener("webglcontextlost", handleContextLost, false);

      document.addEventListener("visibilitychange", handleVisibilityChange);
      start();

      return disposeScene;
    } catch {
      disposeScene();
      setWebglFailed(true);
      return undefined;
    }
  }, []);

  if (webglFailed) {
    return <StaticSphereFallback />;
  }

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}

function StaticSphereFallback() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle_at_48%_48%,rgba(45,150,139,0.16),transparent_68%)]" />
      <div className="absolute left-1/2 top-1/2 aspect-square w-[54%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/20 bg-[radial-gradient(circle_at_34%_28%,rgba(116,205,194,0.18),rgba(15,65,60,0.10)_44%,transparent_72%)] shadow-[inset_-18px_-14px_42px_rgba(0,0,0,0.24),0_0_58px_rgba(30,130,120,0.08)]" />
      <div className="absolute left-1/2 top-1/2 aspect-square w-[49%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 [background-image:radial-gradient(circle,rgba(116,205,194,0.72)_0.8px,transparent_1.4px)] [background-size:8px_8px] [mask-image:radial-gradient(circle,black_40%,transparent_72%)]" />
      <div className="absolute left-1/2 top-1/2 aspect-[1.6/1] w-[78%] -translate-x-1/2 -translate-y-1/2 rotate-[-22deg] rounded-[50%] border border-brand/15" />
    </div>
  );
}
