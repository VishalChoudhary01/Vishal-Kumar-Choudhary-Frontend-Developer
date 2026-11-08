"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { createSphereParticleData } from "./particle-geometry.mjs";
import {
  particleFragmentShader,
  particleVertexShader,
} from "./particle-shaders";
import { createParticleOrbits } from "./particle-orbits";
import {
  getParticleBurstSpreadScale,
  getParticleCameraDistance,
  getParticleCameraProjectionShift,
} from "./particle-responsive.mjs";
import { getParticleSphereThemePalette } from "./particle-theme.mjs";
import {
  getParticleBurstEnvelope,
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
import StaticParticleSphereArtwork from "./StaticParticleSphereArtwork";
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

    const renderRoot = mount.closest("[data-labs-hero-root]") ?? mount;

    let renderer;
    let particleGeometry;
    let particleMaterial;
    let sphereShellMaterial;
    let particles;
    let qualityProfile;
    let orbitGroup;
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
    const artworkAnchor = new THREE.Vector3();

    const scene = new THREE.Scene();
    const sphereAmbientLight = new THREE.AmbientLight(0xffffff, 0.78);
    const sphereKeyLight = new THREE.DirectionalLight(0xffffff, 1.05);
    sphereKeyLight.position.set(-3.5, 4.5, 5.5);
    scene.add(sphereAmbientLight, sphereKeyLight);

    const camera = new THREE.PerspectiveCamera(
      PARTICLE_SPHERE_CONFIG.cameraFov,
      1,
      0.1,
      30,
    );

    camera.position.set(0, 0, PARTICLE_SPHERE_CONFIG.cameraDistance);
    let idleCameraDistance = PARTICLE_SPHERE_CONFIG.cameraDistance;

    const artworkGroup = new THREE.Group();
    scene.add(artworkGroup);

    const sphereGroup = new THREE.Group();
    artworkGroup.add(sphereGroup);

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
        orbitGroup.userData.update?.(elapsed);
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

      if (renderer?.domElement?.parentNode === renderRoot) {
        renderRoot.removeChild(renderer.domElement);
      }
    };

    const resize = () => {
      if (!renderer || !mount || !renderRoot) return;

      const bounds = renderRoot.getBoundingClientRect();
      const artworkBounds = mount.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));
      const artworkWidth = Math.max(1, artworkBounds.width);
      const artworkHeight = Math.max(1, artworkBounds.height);
      const artworkOffsetX = artworkBounds.left + artworkBounds.width / 2
        - (bounds.left + bounds.width / 2);
      const artworkOffsetY = artworkBounds.top + artworkBounds.height / 2
        - (bounds.top + bounds.height / 2);

      camera.aspect = width / height;
      idleCameraDistance = getParticleCameraDistance({
        width,
        height,
        fitWidth: artworkWidth,
        fitHeight: artworkHeight,
        fovDegrees: PARTICLE_SPHERE_CONFIG.cameraFov,
        orbitRadius: 2.26,
        fillRatio: 0.94,
      });

      const worldUnitsPerPixel = (
        2 * idleCameraDistance
        * Math.tan((PARTICLE_SPHERE_CONFIG.cameraFov * Math.PI) / 360)
      ) / height;
      artworkAnchor.set(
        artworkOffsetX * worldUnitsPerPixel,
        -artworkOffsetY * worldUnitsPerPixel,
        0,
      );
      artworkGroup.position.copy(artworkAnchor);

      // Aim the camera at the sphere itself, then shift the projection center
      // to keep the artwork in its existing right-hand hero column.
      camera.position.set(artworkAnchor.x, artworkAnchor.y, idleCameraDistance);
      camera.lookAt(artworkAnchor);
      camera.updateProjectionMatrix();
      const projectionShift = getParticleCameraProjectionShift({
        width,
        height,
        offsetX: artworkOffsetX,
        offsetY: artworkOffsetY,
      });
      camera.projectionMatrix.elements[8] = projectionShift.x;
      camera.projectionMatrix.elements[9] = projectionShift.y;
      camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
      camera.updateMatrixWorld();

      const [spreadX, spreadY] = getParticleBurstSpreadScale({
        heroWidth: width,
        heroHeight: height,
        artworkWidth,
        artworkHeight,
        artworkOffsetX,
        artworkOffsetY,
      });
      if (particleMaterial) {
        particleMaterial.uniforms.uBurstSpreadScale.value.set(spreadX, spreadY);
      }

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
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.inset = "0";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.zIndex = "0";
      renderer.domElement.style.pointerEvents = "auto";

      renderRoot.appendChild(renderer.domElement);

      particleGeometry = createParticleGeometry(qualityProfile);
      particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: renderer.getPixelRatio() },
          uMotionEnabled: { value: 1 },
          uBrandColor: { value: new THREE.Color(initialBrandColor) },
          uSurfaceParticleMix: { value: initialPalette.surfaceParticleMix },
          uSurfaceParticleBrightness: { value: initialPalette.surfaceParticleBrightness },
          uSurfaceParticleOpacityFloor: { value: initialPalette.surfaceParticleOpacityFloor },
          uSurfaceDepthFadeFloor: { value: initialPalette.surfaceDepthFadeFloor },
          uSurfaceParticleSizeScale: { value: initialPalette.surfaceParticleSizeScale },
          uSurfaceShimmerIntensity: { value: initialPalette.surfaceShimmerIntensity },
          uSurfaceShimmerOpacity: { value: initialPalette.surfaceShimmerOpacity },
          uInnerParticleColor: { value: new THREE.Color(initialPalette.innerParticleColor) },
          uInnerParticleOpacity: { value: initialPalette.innerParticleOpacity },
          uVolumeColor: { value: new THREE.Color(initialPalette.volumeColor) },
          uVolumeIntensity: { value: initialPalette.volumeIntensity },
          uAmbientParticleColor: { value: new THREE.Color(initialPalette.ambientParticleColor) },
          uAmbientParticleOpacity: { value: initialPalette.ambientParticleOpacity },
          uSphereRadius: { value: PARTICLE_SPHERE_CONFIG.radius },
          uSparkleColor: { value: new THREE.Color(initialPalette.sparkleColor) },
          uSparkleChanceScale: { value: initialPalette.sparkleChanceScale },
          uSparkleIntensity: { value: initialPalette.sparkleIntensity },
          uSparkleSizeScale: { value: initialPalette.sparkleSizeScale },
          uBurst: { value: 0 },
          uBurstTime: { value: -1 },
          uBurstExpansion: { value: PARTICLE_BURST_EXPANSION },
          uBurstSpreadScale: { value: new THREE.Vector2(1, 1) },
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
        blending: initialPalette.particleBlending === "normal"
          ? THREE.NormalBlending
          : THREE.AdditiveBlending,
      });

      sphereShellMaterial = new THREE.MeshPhongMaterial({
        color: initialPalette.centerSphereColor,
        specular: initialPalette.centerSphereSpecular,
        shininess: initialPalette.centerSphereShininess,
        transparent: true,
        opacity: initialPalette.centerSphereOpacity,
        depthWrite: false,
        side: THREE.FrontSide,
      });
      const sphereShell = new THREE.Mesh(
        new THREE.SphereGeometry(PARTICLE_SPHERE_CONFIG.radius * 0.64, 40, 32),
        sphereShellMaterial,
      );
      sphereShell.renderOrder = -1;
      sphereGroup.add(sphereShell);

      particles = new THREE.Points(particleGeometry, particleMaterial);
      // Burst positions extend beyond the resting geometry bounds. Let the
      // GPU clip individual points against the fixed canvas rather than
      // culling the complete point cloud from its undeformed base bounds.
      particles.frustumCulled = false;
      sphereGroup.add(particles);

      // Invisible raycast surface detects clicks and taps on the 3D sphere.
      // It is not rendered and does not alter the visible sphere geometry.
      sphereHitArea = new THREE.Mesh(
        new THREE.SphereGeometry(PARTICLE_SPHERE_CONFIG.radius + 0.14, 24, 18),
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
      artworkGroup.add(orbitGroup);

      const syncThemeColor = () => {
        const isDark = document.documentElement.classList.contains("dark");
        const palette = getParticleSphereThemePalette(isDark);

        const brandColor = palette.particleColor;
        const blending = palette.particleBlending === "normal"
          ? THREE.NormalBlending
          : THREE.AdditiveBlending;
        if (particleMaterial.blending !== blending) {
          particleMaterial.blending = blending;
          particleMaterial.needsUpdate = true;
        }

        particleMaterial.uniforms.uBrandColor.value.set(brandColor);
        particleMaterial.uniforms.uSurfaceParticleMix.value = palette.surfaceParticleMix;
        particleMaterial.uniforms.uSurfaceParticleBrightness.value = palette.surfaceParticleBrightness;
        particleMaterial.uniforms.uSurfaceParticleOpacityFloor.value = palette.surfaceParticleOpacityFloor;
        particleMaterial.uniforms.uSurfaceDepthFadeFloor.value = palette.surfaceDepthFadeFloor;
        particleMaterial.uniforms.uSurfaceParticleSizeScale.value = palette.surfaceParticleSizeScale;
        particleMaterial.uniforms.uSurfaceShimmerIntensity.value = palette.surfaceShimmerIntensity;
        particleMaterial.uniforms.uSurfaceShimmerOpacity.value = palette.surfaceShimmerOpacity;
        particleMaterial.uniforms.uInnerParticleColor.value.set(palette.innerParticleColor);
        particleMaterial.uniforms.uInnerParticleOpacity.value = palette.innerParticleOpacity;
        particleMaterial.uniforms.uVolumeColor.value.set(palette.volumeColor);
        particleMaterial.uniforms.uVolumeIntensity.value = palette.volumeIntensity;
        particleMaterial.uniforms.uAmbientParticleColor.value.set(palette.ambientParticleColor);
        particleMaterial.uniforms.uAmbientParticleOpacity.value = palette.ambientParticleOpacity;
        particleMaterial.uniforms.uSparkleColor.value.set(palette.sparkleColor);
        particleMaterial.uniforms.uSparkleChanceScale.value = palette.sparkleChanceScale;
        particleMaterial.uniforms.uSparkleIntensity.value = palette.sparkleIntensity;
        particleMaterial.uniforms.uSparkleSizeScale.value = palette.sparkleSizeScale;
        sphereShellMaterial.color.set(palette.centerSphereColor);
        sphereShellMaterial.specular.set(palette.centerSphereSpecular);
        sphereShellMaterial.shininess = palette.centerSphereShininess;
        sphereShellMaterial.opacity = palette.centerSphereOpacity;

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

      };

      if (typeof MutationObserver !== "undefined") {
        themeObserver = new MutationObserver(syncThemeColor);
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        });
      }

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
        if (renderRoot !== mount) resizeObserver.observe(renderRoot);
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
    return <StaticParticleSphereArtwork />;
  }

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full overflow-hidden"
    />
  );
}
