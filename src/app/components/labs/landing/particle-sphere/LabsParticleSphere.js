"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { createSphereParticleData } from "./particle-geometry.mjs";
import {
  particleFragmentShader,
  particleVertexShader,
} from "./particle-shaders";
import { createParticleOrbits } from "./particle-orbits";
import { getParticleCameraDistance } from "./particle-responsive.mjs";
import { getParticleSphereThemePalette } from "./particle-theme.mjs";
import {
  getParticleBurstEnvelope,
  getParticleBurstRadius,
  getParticleCameraChoreography,
  PARTICLE_CAMERA_ANTICIPATION_DISTANCE_RATIO,
  PARTICLE_BURST_EXPANSION,
  PARTICLE_BURST_STAGGER_SECONDS,
  PARTICLE_BURST_OUTWARD_SECONDS,
  PARTICLE_BURST_RECOVERY_SECONDS,
  PARTICLE_BURST_PARTICLE_RECOVERY_MIN,
  PARTICLE_BURST_PARTICLE_RECOVERY_VARIATION,
  PARTICLE_BURST_TANGENTIAL_STRENGTH,
  PARTICLE_BURST_TANGENTIAL_VARIATION,
  PARTICLE_BURST_DRIFT_STRENGTH,
} from "./particle-interaction.mjs";
import { PARTICLE_SPHERE_CONFIG } from "./particle-constants";
import {
  areParticleQualityProfilesEqual,
  getParticleQualityProfile,
  hasParticleBudgetChanged,
} from "./particle-quality.mjs";

function createParticleGeometry(profile) {
  const data = createSphereParticleData({
    surfaceCount: profile.surfaceCount,
    innerCount: profile.innerCount,
    ambientCount: profile.ambientCount,
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
    let particles;
    let qualityProfile;
    let orbitGroup;
    let glow;
    let resizeObserver;
    let intersectionObserver;
    let themeObserver;
    let handleContextLost;
    let handlePointerMove;
    let handlePointerDown;
    let handlePointerUp;
    let handlePointerCancel;
    let handlePointerLeave;
    let sphereHitArea;
    let pointerDown = null;
    let burstStartedAt = Number.NEGATIVE_INFINITY;
    let disposed = false;
    let animationFrame = 0;
    let isRunning = false;
    let isInView = true;
    let elapsed = 0;
    let previousTime = 0;
    let lastRenderTime = 0;

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const pointerLocal = new THREE.Vector3();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      PARTICLE_SPHERE_CONFIG.cameraFov,
      1,
      0.1,
      30,
    );

    camera.position.set(0, 0, PARTICLE_SPHERE_CONFIG.cameraDistance);
    let idleCameraDistance = PARTICLE_SPHERE_CONFIG.cameraDistance;
    let burstCameraDistance = PARTICLE_SPHERE_CONFIG.cameraDistance;

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

      const frameInterval = 1000 / (qualityProfile?.maxFps ?? 60);
      if (lastRenderTime && time - lastRenderTime < frameInterval) return;

      const delta = previousTime
        ? Math.min((time - previousTime) / 1000, PARTICLE_SPHERE_CONFIG.maxDelta)
        : 0;
      previousTime = time;
      lastRenderTime = time;
      elapsed += delta;

      const burstTime = Number.isFinite(burstStartedAt) ? elapsed - burstStartedAt : -1;
      const burstAmount = getParticleBurstEnvelope(burstTime);
      const cameraChoreography = getParticleCameraChoreography(burstTime);
      const burstCameraTarget = THREE.MathUtils.lerp(
        idleCameraDistance,
        burstCameraDistance,
        cameraChoreography.pullback,
      );
      const targetCameraDistance = burstCameraTarget
        - idleCameraDistance
          * PARTICLE_CAMERA_ANTICIPATION_DISTANCE_RATIO
          * cameraChoreography.anticipation;
      const cameraPullingBack = targetCameraDistance > camera.position.z;
      const cameraFollowSpeed = cameraPullingBack ? 8 : 5.2;
      const cameraEase = 1 - Math.exp(-delta * cameraFollowSpeed);
      camera.position.z += (targetCameraDistance - camera.position.z) * cameraEase;

      if (particleMaterial) {
        particleMaterial.uniforms.uTime.value = elapsed;
        particleMaterial.uniforms.uBurst.value = burstAmount;
        particleMaterial.uniforms.uBurstTime.value = burstTime;
      }

      sphereGroup.rotation.y = elapsed * PARTICLE_SPHERE_CONFIG.rotationSpeed;
      sphereGroup.rotation.x = Math.sin(elapsed * 0.16) * 0.035;
      sphereGroup.rotation.z = Math.sin(elapsed * 0.11) * 0.018;

      if (orbitGroup) {
        orbitGroup.rotation.y = -elapsed * PARTICLE_SPHERE_CONFIG.orbitSpeed;
        orbitGroup.rotation.z = Math.sin(elapsed * 0.08) * 0.012;
        orbitGroup.userData.update?.(elapsed, burstAmount);
      }


      renderer.render(scene, camera);
    };

    const start = () => {
      if (isRunning || !isInView || document.hidden || !renderer) return;

      isRunning = true;
      previousTime = 0;
      lastRenderTime = 0;
      animationFrame = requestAnimationFrame(renderFrame);
    };

    const disposeScene = () => {
      if (disposed) return;
      disposed = true;

      stop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      themeObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", resize);
      renderer?.domElement?.removeEventListener("webglcontextlost", handleContextLost);
      renderer?.domElement?.removeEventListener("pointermove", handlePointerMove);
      renderer?.domElement?.removeEventListener("pointerdown", handlePointerDown);
      renderer?.domElement?.removeEventListener("pointerup", handlePointerUp);
      renderer?.domElement?.removeEventListener("pointercancel", handlePointerCancel);
      renderer?.domElement?.removeEventListener("pointerleave", handlePointerLeave);

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
      idleCameraDistance = getParticleCameraDistance({
        width,
        height,
        fovDegrees: PARTICLE_SPHERE_CONFIG.cameraFov,
        orbitRadius: 2.02,
        fillRatio: 0.94,
      });
      burstCameraDistance = getParticleCameraDistance({
        width,
        height,
        fovDegrees: PARTICLE_SPHERE_CONFIG.cameraFov,
        orbitRadius: getParticleBurstRadius(PARTICLE_SPHERE_CONFIG.radius),
        fillRatio: 0.9,
      });
      const resizeBurstTime = Number.isFinite(burstStartedAt) ? elapsed - burstStartedAt : -1;
      const resizeCameraChoreography = getParticleCameraChoreography(resizeBurstTime);
      const resizeBurstCameraTarget = THREE.MathUtils.lerp(
        idleCameraDistance,
        burstCameraDistance,
        resizeCameraChoreography.pullback,
      );
      camera.position.z = resizeBurstCameraTarget
        - idleCameraDistance
          * PARTICLE_CAMERA_ANTICIPATION_DISTANCE_RATIO
          * resizeCameraChoreography.anticipation;
      camera.updateProjectionMatrix();

      const nextProfile = getParticleQualityProfile({
        viewportWidth: window.innerWidth,
        deviceMemory: window.navigator.deviceMemory,
        hardwareConcurrency: window.navigator.hardwareConcurrency,
      });

      if (!areParticleQualityProfilesEqual(qualityProfile, nextProfile)) {
        const shouldReplaceGeometry = hasParticleBudgetChanged(
          qualityProfile,
          nextProfile,
        );
        const previousGeometry = shouldReplaceGeometry ? particles?.geometry : null;

        qualityProfile = nextProfile;

        if (particles && shouldReplaceGeometry) {
          particles.geometry = createParticleGeometry(qualityProfile);
          previousGeometry?.dispose();
        }
      }

      const nextPixelRatio = Math.min(
        window.devicePixelRatio || 1,
        qualityProfile?.maxPixelRatio ?? PARTICLE_SPHERE_CONFIG.maxPixelRatio,
      );
      if (renderer.getPixelRatio() !== nextPixelRatio) {
        renderer.setPixelRatio(nextPixelRatio);
        if (particleMaterial) {
          particleMaterial.uniforms.uPixelRatio.value = nextPixelRatio;
        }
      }

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
      qualityProfile = getParticleQualityProfile({
        viewportWidth: window.innerWidth,
        deviceMemory: window.navigator.deviceMemory,
        hardwareConcurrency: window.navigator.hardwareConcurrency,
      });

      const initialPalette = getParticleSphereThemePalette(
        document.documentElement.classList.contains("dark"),
      );
      const initialBrandColor = initialPalette.particleColor;

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
        stencil: false,
        depth: true,
      });
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, qualityProfile.maxPixelRatio),
      );
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";

      mount.appendChild(renderer.domElement);

      particleGeometry = createParticleGeometry(qualityProfile);
      particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: renderer.getPixelRatio() },
          uMotionEnabled: { value: 1 },
          uBrandColor: { value: new THREE.Color(initialBrandColor) },
          uInnerParticleColor: { value: new THREE.Color(initialPalette.innerParticleColor) },
          uInnerParticleOpacity: { value: initialPalette.innerParticleOpacity },
          uSparkleColor: { value: new THREE.Color(initialPalette.sparkleColor) },
          uBurst: { value: 0 },
          uBurstTime: { value: -1 },
          uBurstExpansion: { value: PARTICLE_BURST_EXPANSION },
          uBurstStagger: { value: PARTICLE_BURST_STAGGER_SECONDS },
          uBurstOutwardSeconds: { value: PARTICLE_BURST_OUTWARD_SECONDS },
          uBurstRecoverySeconds: { value: PARTICLE_BURST_RECOVERY_SECONDS },
          uBurstRecoveryMin: { value: PARTICLE_BURST_PARTICLE_RECOVERY_MIN },
          uBurstRecoveryVariation: { value: PARTICLE_BURST_PARTICLE_RECOVERY_VARIATION },
          uBurstTangentialStrength: { value: PARTICLE_BURST_TANGENTIAL_STRENGTH },
          uBurstTangentialVariation: { value: PARTICLE_BURST_TANGENTIAL_VARIATION },
          uBurstDriftStrength: { value: PARTICLE_BURST_DRIFT_STRENGTH },
          uPointerPosition: { value: new THREE.Vector3() },
          uPointerActive: { value: 0 },
        },
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      particles = new THREE.Points(particleGeometry, particleMaterial);
      // Burst positions extend beyond the resting geometry bounds. Let the
      // GPU clip individual points against the fixed canvas rather than
      // culling the complete point cloud from its undeformed base bounds.
      particles.frustumCulled = false;
      sphereGroup.add(particles);

      // Invisible raycast surface detects clicks and taps on the 3D sphere.
      // It is not rendered and does not alter the visible sphere geometry.
      sphereHitArea = new THREE.Mesh(
        new THREE.SphereGeometry(1.52, 24, 18),
        new THREE.MeshBasicMaterial({
          colorWrite: false,
          depthWrite: false,
          transparent: true,
          opacity: 0,
        }),
      );
      sphereHitArea.userData.interactionOnly = true;
      sphereGroup.add(sphereHitArea);

      orbitGroup = createParticleOrbits(THREE);
      scene.add(orbitGroup);

      const syncThemeColor = () => {
        const palette = getParticleSphereThemePalette(
          document.documentElement.classList.contains("dark"),
        );

        const brandColor = palette.particleColor;

        particleMaterial.uniforms.uBrandColor.value.set(brandColor);
        particleMaterial.uniforms.uInnerParticleColor.value.set(palette.innerParticleColor);
        particleMaterial.uniforms.uInnerParticleOpacity.value = palette.innerParticleOpacity;
        particleMaterial.uniforms.uSparkleColor.value.set(palette.sparkleColor);

        orbitGroup.traverse((object) => {
          const material = object.material;
          if (!material) return;

          switch (material.userData.themeRole) {
            case "orbit-line":
              material.color.set(brandColor);
              material.opacity = material.userData.baseOpacity * palette.orbitOpacityScale;
              break;
            case "orbit-particle":
              material.color.set(palette.orbitParticleColor);
              material.opacity = palette.orbitParticleOpacity;
              break;
            case "orbit-particle-glow":
              material.color.set(palette.orbitParticleGlowColor);
              material.opacity = palette.orbitParticleGlowOpacity;
              break;
            default:
              break;
          }
        });

        if (glow) {
          glow.material.color.set(palette.glowColor);
          glow.material.opacity = palette.glowOpacity;
        }
      };

      if (typeof MutationObserver !== "undefined") {
        themeObserver = new MutationObserver(syncThemeColor);
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        });
      }

      glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.94, 28, 20),
        new THREE.MeshBasicMaterial({
          color: initialPalette.glowColor,
          transparent: true,
          opacity: initialPalette.glowOpacity,
          side: THREE.BackSide,
          depthWrite: false,
        }),
      );
      sphereGroup.add(glow);
      syncThemeColor();

      const setPointerFromEvent = (event) => {
        const bounds = renderer.domElement.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return false;

        pointerNdc.set(
          ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
          -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
        );
        raycaster.setFromCamera(pointerNdc, camera);

        const hit = raycaster.intersectObject(sphereHitArea, false)[0];
        if (!hit) {
          particleMaterial.uniforms.uPointerActive.value = 0;
          return false;
        }

        pointerLocal.copy(hit.point);
        sphereGroup.worldToLocal(pointerLocal);
        particleMaterial.uniforms.uPointerPosition.value.copy(pointerLocal);
        particleMaterial.uniforms.uPointerActive.value = 1;
        return true;
      };

      handlePointerMove = (event) => {
        setPointerFromEvent(event);
      };

      handlePointerDown = (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;

        const startedOnSphere = setPointerFromEvent(event);
        pointerDown = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          startedOnSphere,
        };

        if (startedOnSphere) {
          renderer.domElement.setPointerCapture?.(event.pointerId);
        }
      };

      handlePointerUp = (event) => {
        if (!pointerDown || pointerDown.pointerId !== event.pointerId) return;

        const distance = Math.hypot(
          event.clientX - pointerDown.x,
          event.clientY - pointerDown.y,
        );
        const hitSphere = setPointerFromEvent(event);

        if (distance <= 12 && pointerDown.startedOnSphere && hitSphere) {
          // A new tap restarts the current burst rather than stacking forces.
          burstStartedAt = elapsed;
        }

        pointerDown = null;
        if (renderer.domElement.hasPointerCapture?.(event.pointerId)) {
          renderer.domElement.releasePointerCapture?.(event.pointerId);
        }
      };

      handlePointerCancel = (event) => {
        pointerDown = null;
        particleMaterial.uniforms.uPointerActive.value = 0;

        if (renderer.domElement.hasPointerCapture?.(event.pointerId)) {
          renderer.domElement.releasePointerCapture?.(event.pointerId);
        }
      };

      handlePointerLeave = () => {
        if (!pointerDown) {
          particleMaterial.uniforms.uPointerActive.value = 0;
        }
      };

      renderer.domElement.style.touchAction = "pan-y";
      renderer.domElement.style.cursor = "pointer";
      renderer.domElement.addEventListener("pointermove", handlePointerMove, { passive: true });
      renderer.domElement.addEventListener("pointerdown", handlePointerDown, { passive: true });
      renderer.domElement.addEventListener("pointerup", handlePointerUp, { passive: true });
      renderer.domElement.addEventListener("pointercancel", handlePointerCancel, { passive: true });
      renderer.domElement.addEventListener("pointerleave", handlePointerLeave, { passive: true });

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
      className="absolute inset-0 h-full w-full overflow-hidden"
    />
  );
}

function StaticSphereFallback() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle_at_48%_48%,rgba(23,107,104,0.14),transparent_68%)] dark:bg-[radial-gradient(circle_at_48%_48%,rgba(105,189,185,0.20),transparent_68%)]" />
      <div className="absolute left-1/2 top-1/2 aspect-square w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/25 bg-[radial-gradient(circle_at_34%_28%,rgba(23,107,104,0.14),rgba(23,107,104,0.04)_48%,transparent_74%)] shadow-[inset_-18px_-14px_42px_rgba(0,0,0,0.12),0_0_58px_rgba(23,107,104,0.08)] dark:bg-[radial-gradient(circle_at_34%_28%,rgba(145,231,221,0.22),rgba(15,65,60,0.20)_48%,transparent_74%)] dark:shadow-[inset_-18px_-14px_42px_rgba(0,0,0,0.30),0_0_58px_rgba(65,190,178,0.16)]" />
      <div className="absolute left-1/2 top-1/2 aspect-square w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-55 [background-image:radial-gradient(circle,rgba(23,107,104,0.66)_0.8px,transparent_1.4px)] [background-size:8px_8px] [mask-image:radial-gradient(circle,black_40%,transparent_72%)] dark:opacity-75 dark:[background-image:radial-gradient(circle,rgba(190,255,248,0.86)_0.8px,transparent_1.4px)]" />
      <div className="absolute left-1/2 top-1/2 aspect-[1.6/1] w-[88%] -translate-x-1/2 -translate-y-1/2 rotate-[-22deg] rounded-[50%] border border-brand/20 dark:border-brand/30" />
    </div>
  );
}
