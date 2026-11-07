import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createSphereParticleData } from "../src/app/components/labs/landing/particle-sphere/particle-geometry.mjs";
import {
  getParticleBurstEnvelope,
  getParticleBurstRadius,
  getParticleBurstParticleEnvelope,
  getParticleCameraChoreography,
  PARTICLE_BURST_EXPANSION,
  getOrbitBurstSpeed,
  ORBIT_BURST_SPEED_MULTIPLIER,
  isParticleBurstActive,
} from "../src/app/components/labs/landing/particle-sphere/particle-interaction.mjs";
import { getParticleCameraDistance } from "../src/app/components/labs/landing/particle-sphere/particle-responsive.mjs";
import { getParticleSphereThemePalette } from "../src/app/components/labs/landing/particle-sphere/particle-theme.mjs";
import {
  areParticleQualityProfilesEqual,
  getParticleQualityProfile,
  hasParticleBudgetChanged,
} from "../src/app/components/labs/landing/particle-sphere/particle-quality.mjs";

const rendererSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/LabsParticleSphere.js", import.meta.url),
  "utf8",
);
const shaderSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/particle-shaders.js", import.meta.url),
  "utf8",
);
const orbitSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/particle-orbits.js", import.meta.url),
  "utf8",
);
const constantsSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/particle-constants.js", import.meta.url),
  "utf8",
);
const interactionSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/particle-interaction.mjs", import.meta.url),
  "utf8",
);
const artworkSource = await readFile(
  new URL("../src/app/components/labs/landing/LabsHeroArtwork.js", import.meta.url),
  "utf8",
);

test("particle geometry creates the configured number of surface and interior points", () => {
  const data = createSphereParticleData({
    surfaceCount: 120,
    innerCount: 24,
    radius: 1.2,
  });

  assert.equal(data.count, 144);
  assert.equal(data.surfaceCount, 120);
  assert.equal(data.innerCount, 24);
  assert.equal(data.positions.length, 144 * 3);
  assert.equal(data.sizes.length, 144);
  assert.equal(data.seeds.length, 144);
  assert.equal(data.colors.length, 144 * 3);
  assert.equal(data.layers.length, 144);
});

test("surface particles remain on a narrow spherical shell", () => {
  const radius = 1.14;
  const data = createSphereParticleData({
    surfaceCount: 500,
    innerCount: 0,
    radius,
  });

  for (let index = 0; index < data.surfaceCount; index += 1) {
    const offset = index * 3;
    const x = data.positions[offset];
    const y = data.positions[offset + 1];
    const z = data.positions[offset + 2];
    const actualRadius = Math.sqrt(x * x + y * y + z * z);

    assert.ok(actualRadius >= radius * 0.986 - 0.0001);
    assert.ok(actualRadius <= radius * 1.014 + 0.0001);
    assert.equal(data.layers[index], 0);
  }
});

test("interior particles are distributed inside the sphere", () => {
  const data = createSphereParticleData({
    surfaceCount: 0,
    innerCount: 250,
    radius: 1.14,
  });

  for (let index = 0; index < data.innerCount; index += 1) {
    const offset = index * 3;
    const x = data.positions[offset];
    const y = data.positions[offset + 1];
    const z = data.positions[offset + 2];
    const actualRadius = Math.sqrt(x * x + y * y + z * z);

    assert.ok(actualRadius > 0);
    assert.ok(actualRadius < 1.14 * 0.841);
    assert.equal(data.layers[index], 1);
  }
});

test("ambient particles remain outside the sphere and use their own layer", () => {
  const data = createSphereParticleData({
    surfaceCount: 100,
    innerCount: 20,
    ambientCount: 30,
    radius: 1.14,
    seed: 9001,
  });

  assert.equal(data.count, 150);
  assert.equal(data.ambientCount, 30);

  for (let index = 120; index < 150; index += 1) {
    const offset = index * 3;
    const x = data.positions[offset];
    const y = data.positions[offset + 1];
    const z = data.positions[offset + 2];
    const actualRadius = Math.sqrt(x * x + y * y + z * z);

    assert.ok(actualRadius >= 1.14 * 1.28);
    assert.ok(actualRadius <= 1.14 * 1.70);
    assert.equal(data.layers[index], 2);
  }
});

test("particle point sizes stay within the tuned visual ranges", () => {
  const data = createSphereParticleData({
    surfaceCount: 120,
    innerCount: 24,
    ambientCount: 12,
  });

  for (let index = 0; index < data.surfaceCount; index += 1) {
    assert.ok(data.sizes[index] >= 0.9);
    assert.ok(data.sizes[index] < 1.78);
  }

  for (let index = data.surfaceCount; index < data.surfaceCount + data.innerCount; index += 1) {
    assert.ok(data.sizes[index] >= 0.58);
    assert.ok(data.sizes[index] < 1.14);
  }

  for (let index = data.surfaceCount + data.innerCount; index < data.count; index += 1) {
    assert.ok(data.sizes[index] >= 1.05);
    assert.ok(data.sizes[index] < 1.77);
  }
});

test("particle geometry is deterministic for a stable seed", () => {
  const options = { surfaceCount: 80, innerCount: 20, seed: 12345 };
  const first = createSphereParticleData(options);
  const second = createSphereParticleData(options);

  assert.deepEqual(first.positions, second.positions);
  assert.deepEqual(first.sizes, second.sizes);
  assert.deepEqual(first.seeds, second.seeds);
  assert.deepEqual(first.colors, second.colors);
  assert.deepEqual(first.layers, second.layers);
});

test("sphere world-space size stays fixed while camera framing adapts to mobile", () => {
  const radius = 1.38;
  const data = createSphereParticleData({
    surfaceCount: 180,
    innerCount: 24,
    radius,
    seed: 742,
  });

  const mobileDistance = getParticleCameraDistance({
    width: 375,
    height: 520,
    fovDegrees: 42,
    orbitRadius: 2.02,
    fillRatio: 0.92,
  });
  const desktopDistance = getParticleCameraDistance({
    width: 1440,
    height: 820,
    fovDegrees: 42,
    orbitRadius: 2.02,
    fillRatio: 0.94,
  });
  const burstRadius = getParticleBurstRadius(radius);
  const mobileBurstDistance = getParticleCameraDistance({
    width: 375,
    height: 520,
    fovDegrees: 42,
    orbitRadius: burstRadius,
    fillRatio: 0.9,
  });
  const desktopBurstDistance = getParticleCameraDistance({
    width: 1440,
    height: 820,
    fovDegrees: 42,
    orbitRadius: burstRadius,
    fillRatio: 0.9,
  });

  assert.ok(Number.isFinite(mobileDistance));
  assert.ok(Number.isFinite(desktopDistance));
  assert.ok(Number.isFinite(mobileBurstDistance));
  assert.ok(Number.isFinite(desktopBurstDistance));
  assert.ok(mobileDistance > desktopDistance);
  assert.ok(mobileBurstDistance > mobileDistance);
  assert.ok(desktopBurstDistance > desktopDistance);
  assert.match(rendererSource, /idleCameraDistance = getParticleCameraDistance/);
  assert.match(rendererSource, /orbitRadius: 2\.02/);
  assert.match(rendererSource, /burstCameraDistance = getParticleCameraDistance/);
  assert.match(rendererSource, /getParticleBurstRadius\(PARTICLE_SPHERE_CONFIG\.radius\)/);
  assert.match(rendererSource, /camera\.position\.z \+= \(targetCameraDistance - camera\.position\.z\) \* cameraEase/);
  assert.ok(constantsSource.includes("radius: 1.38"));
  assert.match(rendererSource, /particles\.frustumCulled = false/);
  assert.match(rendererSource, /className="absolute inset-0 h-full w-full overflow-hidden"/);
  assert.match(artworkSource, /aspect-\[1\.08\/1\] min-h-\[280px\].*overflow-hidden/);
  assert.doesNotMatch(rendererSource, /getSphereScale|getSphereContraction|\.scale\.setScalar/);

  for (let index = 0; index < data.surfaceCount; index += 1) {
    const offset = index * 3;
    const x = data.positions[offset];
    const y = data.positions[offset + 1];
    const z = data.positions[offset + 2];
    const currentRadius = Math.sqrt(x * x + y * y + z * z);

    assert.ok(currentRadius >= radius * 0.986 - 0.0001);
    assert.ok(currentRadius <= radius * 1.014 + 0.0001);
  }
});

test("light and dark themes use distinct particle, sparkle and glow palettes", () => {
  const light = getParticleSphereThemePalette(false);
  const dark = getParticleSphereThemePalette(true);

  assert.notEqual(light.particleColor, dark.particleColor);
  assert.notEqual(light.sparkleColor, dark.sparkleColor);
  assert.notEqual(light.glowColor, dark.glowColor);
  assert.notEqual(light.glowOpacity, dark.glowOpacity);
  assert.equal(light.particleColor, "#103b37");
  assert.equal(light.innerParticleColor, "#0b2926");
  assert.equal(light.innerParticleOpacity, 0.58);
  assert.equal(light.sparkleColor, "#041816");
  assert.equal(light.glowColor, "#0a2926");
  assert.equal(dark.particleColor, "#8ce8dc");
  assert.equal(light.surfaceParticleMix, 0.28);
  assert.equal(dark.surfaceParticleMix, 0.08);
  assert.equal(light.surfaceParticleBrightness, 1);
  assert.equal(dark.surfaceParticleBrightness, 1.45);
  assert.equal(light.surfaceParticleOpacityFloor, 0.012);
  assert.equal(dark.surfaceParticleOpacityFloor, 0.1);
  assert.equal(light.surfaceParticleSizeScale, 1);
  assert.equal(dark.surfaceParticleSizeScale, 1.16);
  assert.equal(dark.innerParticleColor, "#8ae7d8");
  assert.equal(dark.innerParticleOpacity, 0.88);
  assert.equal(dark.sparkleColor, "#e1fff9");
  assert.equal(dark.glowColor, "#061c18");
  assert.equal(dark.glowOpacity, 0.028);
  assert.equal(light.volumeColor, "#17685e");
  assert.equal(dark.volumeColor, "#56ccb9");
  assert.equal(dark.volumeIntensity, 0.38);
  assert.ok(dark.volumeIntensity > light.volumeIntensity);
  assert.equal(light.ambientParticleOpacity, 0.42);
  assert.equal(dark.ambientParticleOpacity, 0.62);
  assert.notEqual(light.orbitParticleColor, dark.orbitParticleColor);
  assert.notEqual(light.orbitParticleGlowColor, dark.orbitParticleGlowColor);
  assert.ok(light.orbitParticleOpacity > 0 && light.orbitParticleOpacity <= 1);
  assert.ok(dark.orbitParticleOpacity > 0 && dark.orbitParticleOpacity <= 1);
  assert.ok(light.orbitOpacityScale > 0 && light.orbitOpacityScale <= 1);
  assert.ok(dark.orbitOpacityScale > 0 && dark.orbitOpacityScale <= 1);
});

test("particle quality profiles adapt density and pixel ratio to viewport size", () => {
  const desktop = getParticleQualityProfile({ viewportWidth: 1440 });
  const tablet = getParticleQualityProfile({ viewportWidth: 900 });
  const mobile = getParticleQualityProfile({ viewportWidth: 390 });

  assert.equal(desktop.tier, "high");
  assert.equal(desktop.surfaceCount, 5200);
  assert.equal(desktop.maxFps, 60);
  assert.equal(tablet.tier, "medium");
  assert.equal(tablet.surfaceCount, 4000);
  assert.equal(tablet.maxFps, 50);
  assert.equal(mobile.tier, "compact");
  assert.equal(mobile.surfaceCount, 2600);
  assert.equal(mobile.maxFps, 40);
  assert.ok(mobile.maxPixelRatio < desktop.maxPixelRatio);
  assert.equal(desktop.sparkleSpeed, 0.36);
  assert.equal(mobile.sparkleSpeed, 0.3);
  assert.equal(mobile.sparkleDensity, 0.42);
  assert.equal(mobile.sparkleIntensity, 0.42);
  assert.ok(mobile.sparkleSpeed < desktop.sparkleSpeed);
  assert.ok(mobile.sparkleDensity < desktop.sparkleDensity);
  assert.ok(mobile.sparkleIntensity < desktop.sparkleIntensity);
});

test("constrained devices receive a lower particle budget", () => {
  const constrained = getParticleQualityProfile({
    viewportWidth: 1440,
    deviceMemory: 2,
    hardwareConcurrency: 2,
  });

  assert.equal(constrained.tier, "low");
  assert.equal(constrained.surfaceCount, 2600);
  assert.equal(constrained.maxFps, 30);
  assert.ok(constrained.maxPixelRatio <= 1.2);
  assert.equal(constrained.sparkleDensity, 0.52);
  assert.equal(constrained.sparkleIntensity, 0.55);
  assert.equal(constrained.sparkleSpeed, 0.3);
});

test("low-tier mobile profile updates its budget even when tier label is unchanged", () => {
  const lowDesktop = getParticleQualityProfile({
    viewportWidth: 1440,
    deviceMemory: 2,
    hardwareConcurrency: 2,
  });
  const lowMobile = getParticleQualityProfile({
    viewportWidth: 390,
    deviceMemory: 2,
    hardwareConcurrency: 2,
  });

  assert.equal(lowDesktop.tier, "low");
  assert.equal(lowMobile.tier, "low");
  assert.notEqual(lowDesktop.surfaceCount, lowMobile.surfaceCount);
  assert.equal(hasParticleBudgetChanged(lowDesktop, lowMobile), true);
  assert.equal(areParticleQualityProfilesEqual(lowDesktop, lowMobile), false);
  assert.equal(lowMobile.sparkleDensity, 0.28);
  assert.equal(lowMobile.sparkleIntensity, 0.3);
  assert.equal(lowMobile.sparkleSpeed, 0.26);
});

test("sparkle-only profile changes update quality equality without rebuilding particle geometry", () => {
  const mobile = getParticleQualityProfile({ viewportWidth: 390 });
  const slowerMobile = { ...mobile, sparkleSpeed: 0.22 };

  assert.equal(hasParticleBudgetChanged(mobile, slowerMobile), false);
  assert.equal(areParticleQualityProfilesEqual(mobile, slowerMobile), false);
});

test("equal particle profiles avoid unnecessary geometry replacement", () => {
  const left = getParticleQualityProfile({ viewportWidth: 1440 });
  const right = getParticleQualityProfile({ viewportWidth: 1440 });

  assert.equal(areParticleQualityProfilesEqual(left, right), true);
  assert.equal(hasParticleBudgetChanged(left, right), false);
});

test("particle geometry rejects unsafe counts and invalid radius values", () => {
  assert.throws(
    () => createSphereParticleData({ surfaceCount: -1 }),
    RangeError,
  );
  assert.throws(
    () => createSphereParticleData({ innerCount: 4001 }),
    RangeError,
  );
  assert.throws(
    () => createSphereParticleData({ radius: 0 }),
    RangeError,
  );
  assert.throws(
    () => createSphereParticleData({ radius: Number.NaN }),
    RangeError,
  );
});

test("renderer uses one GPU point system and pauses when it cannot be seen", () => {
  assert.match(rendererSource, /new THREE\.Points\(particleGeometry, particleMaterial\)/);
  assert.match(rendererSource, /requestAnimationFrame/);
  assert.match(rendererSource, /IntersectionObserver/);
  assert.match(rendererSource, /document\.hidden/);
  assert.match(rendererSource, /cancelAnimationFrame/);
  assert.match(rendererSource, /ResizeObserver/);
  assert.match(rendererSource, /getParticleQualityProfile/);
  assert.match(rendererSource, /areParticleQualityProfilesEqual/);
  assert.match(rendererSource, /hasParticleBudgetChanged/);
  assert.ok(rendererSource.includes("frameInterval = 1000 / (qualityProfile?.maxFps ?? 60)"));
  assert.match(rendererSource, /lastRenderTime = 0/);
  assert.match(rendererSource, /viewportWidth: window\.innerWidth/);
  assert.match(rendererSource, /themeObserver/);
  assert.match(rendererSource, /syncThemeColor/);
  assert.match(rendererSource, /getParticleSphereThemePalette/);
  assert.ok(rendererSource.includes('classList.contains("dark")'));
  assert.match(rendererSource, /initialPalette\.particleColor/);
  assert.match(rendererSource, /palette\.particleColor/);
  assert.match(rendererSource, /uInnerParticleColor/);
  assert.match(rendererSource, /uInnerParticleOpacity/);
  assert.match(rendererSource, /palette\.innerParticleColor/);
  assert.match(rendererSource, /palette\.innerParticleOpacity/);
  assert.match(rendererSource, /uSparkleColor/);
  assert.match(rendererSource, /uSparkleDensity: \{ value: qualityProfile\.sparkleDensity \}/);
  assert.match(rendererSource, /uSparkleIntensity: \{ value: qualityProfile\.sparkleIntensity \}/);
  assert.match(rendererSource, /uSparkleSpeed: \{ value: qualityProfile\.sparkleSpeed \}/);
  assert.match(rendererSource, /particleMaterial\.uniforms\.uSparkleDensity\.value = qualityProfile\.sparkleDensity/);
  assert.match(rendererSource, /particleMaterial\.uniforms\.uSparkleIntensity\.value = qualityProfile\.sparkleIntensity/);
  assert.match(rendererSource, /particleMaterial\.uniforms\.uSparkleSpeed\.value = qualityProfile\.sparkleSpeed/);
  assert.match(rendererSource, /uSurfaceParticleMix/);
  assert.match(rendererSource, /uSurfaceParticleBrightness/);
  assert.match(rendererSource, /uSurfaceParticleOpacityFloor/);
  assert.match(rendererSource, /uSurfaceParticleSizeScale/);
  assert.match(rendererSource, /palette\.surfaceParticleMix/);
  assert.match(rendererSource, /palette\.surfaceParticleBrightness/);
  assert.match(rendererSource, /uVolumeColor/);
  assert.match(rendererSource, /uVolumeIntensity/);
  assert.match(rendererSource, /uAmbientParticleColor/);
  assert.match(rendererSource, /uAmbientParticleOpacity/);
  assert.match(rendererSource, /uSphereRadius/);
  assert.match(rendererSource, /palette\.volumeColor/);
  assert.match(rendererSource, /palette\.ambientParticleOpacity/);
  assert.match(rendererSource, /glow\.material\.color\.set\(palette\.glowColor\)/);
  assert.match(rendererSource, /case "orbit-particle"/);
  assert.match(rendererSource, /case "orbit-particle-glow"/);
  assert.match(rendererSource, /getParticleCameraDistance/);
  assert.match(rendererSource, /orbitGroup\.userData\.update\?\.\(elapsed, burstAmount\)/);
  assert.doesNotMatch(rendererSource, /uContraction|getSphereScale|getSphereContraction|\.scale\.setScalar/);
  assert.ok(rendererSource.includes("renderer?.dispose()"));
  assert.match(rendererSource, /webglcontextlost/);
  assert.match(rendererSource, /disposed = false/);
  assert.match(rendererSource, /if \(disposed\) return/);
});

test("particle burst uses staggered per-particle recovery without changing base geometry", () => {
  assert.equal(getParticleBurstEnvelope(-1), 0);
  assert.equal(getParticleBurstEnvelope(0), 0);
  assert.equal(getParticleBurstEnvelope(0.45), 1);
  assert.ok(getParticleBurstEnvelope(1.35) > 0);
  assert.equal(getParticleBurstEnvelope(2.11), 0);
  assert.equal(getParticleBurstEnvelope(Number.NaN), 0);

  assert.ok(getParticleBurstParticleEnvelope(0.04, 0.1) > 0);
  assert.equal(getParticleBurstParticleEnvelope(0.04, 0.9), 0);
  assert.ok(getParticleBurstParticleEnvelope(0.5, 0.2) > 0);
  assert.equal(getParticleBurstParticleEnvelope(2.2, 0.5), 0);
  assert.equal(getParticleBurstParticleEnvelope(Number.NaN, 0.5), 0);

  assert.equal(PARTICLE_BURST_EXPANSION, 1.85);
  assert.ok(getParticleBurstRadius(1.38) > 4.8);
  assert.throws(() => getParticleBurstRadius(0), RangeError);
  assert.throws(() => getParticleBurstRadius(Number.NaN), RangeError);
  assert.equal(getOrbitBurstSpeed(0), 1);
  assert.equal(getOrbitBurstSpeed(0.45), 1.65);
  assert.ok(getOrbitBurstSpeed(1.35) > 1);
  assert.equal(getOrbitBurstSpeed(2.11), 1);
  assert.equal(isParticleBurstActive(0.8), true);
  assert.equal(isParticleBurstActive(1.35), true);
  assert.equal(isParticleBurstActive(2.11), false);
});

test("camera choreography anticipates the burst before delayed pullback and smooth recovery", () => {
  const idle = getParticleCameraChoreography(-1);
  const launch = getParticleCameraChoreography(0);
  const anticipation = getParticleCameraChoreography(0.12);
  const anticipationRelease = getParticleCameraChoreography(0.28);
  const delayedPullback = getParticleCameraChoreography(0.14);
  const fullPullback = getParticleCameraChoreography(0.59);
  const recovery = getParticleCameraChoreography(1.4);
  const returned = getParticleCameraChoreography(2.25);

  assert.deepEqual(idle, { anticipation: 0, pullback: 0 });
  assert.deepEqual(launch, { anticipation: 0, pullback: 0 });
  assert.equal(anticipation.anticipation, 1);
  assert.equal(anticipation.pullback, 0);
  assert.equal(anticipationRelease.anticipation, 0);
  assert.equal(delayedPullback.pullback, 0);
  assert.equal(fullPullback.pullback, 1);
  assert.ok(recovery.pullback > 0);
  assert.equal(returned.pullback, 0);
});

test("renderer maps pointer hits to the sphere and restarts burst on a short tap", () => {
  assert.match(rendererSource, /raycaster\.intersectObject\(sphereHitArea, false\)/);
  assert.match(rendererSource, /sphereGroup\.worldToLocal\(pointerLocal\)/);
  assert.match(rendererSource, /addEventListener\("pointerdown"/);
  assert.match(rendererSource, /addEventListener\("pointerup"/);
  assert.match(rendererSource, /addEventListener\("pointermove"/);
  assert.match(rendererSource, /startedOnSphere/);
  assert.match(rendererSource, /setPointerCapture\?\.\(event\.pointerId\)/);
  assert.match(rendererSource, /distance <= 12 && pointerDown\.startedOnSphere && hitSphere/);
  assert.match(rendererSource, /burstStartedAt = elapsed/);
  assert.match(rendererSource, /Number\.isFinite\(burstStartedAt\) \? elapsed - burstStartedAt : -1/);
  assert.match(rendererSource, /uBurstTime\.value = burstTime/);
  assert.match(rendererSource, /touchAction = "pan-y"/);
  assert.match(rendererSource, /removeEventListener\("pointercancel"/);
  assert.match(rendererSource, /releasePointerCapture\?\.\(event\.pointerId\)/);
});

test("orbit particles move continuously and retain their orbital path", () => {
  assert.match(orbitSource, /group\.userData\.update = \(elapsed, burstAmount = 0\)/);
  assert.match(orbitSource, /runner\.position\.copy\(getOrbitPoint\(THREE, spec, progressByRunner\[index\]\)\)/);
  assert.match(orbitSource, /ORBIT_BURST_SPEED_MULTIPLIER - 1/);
  assert.equal(ORBIT_BURST_SPEED_MULTIPLIER, 1.65);
  assert.match(orbitSource, /delta \* spec\.speed \* burstSpeed/);
  assert.match(orbitSource, /end: Math\.PI \* 2/);
  const orbitRadii = [...orbitSource.matchAll(/radiusX: ([0-9.]+),\s+radiusY: ([0-9.]+)/g)]
    .map(([, radiusX, radiusY]) => [Number(radiusX), Number(radiusY)]);
  assert.equal(orbitRadii.length, 3);
  orbitRadii.forEach(([radiusX, radiusY]) => {
    assert.equal(radiusX, radiusY);
    assert.ok(radiusY >= 1.38);
  });
  assert.equal(Math.max(...orbitRadii.map(([radiusX]) => radiusX)), 1.7);

  // All viewport sizes use the same orbit planes. Their projected minor axes
  // must clear the widest possible surface-particle radius without enlarging
  // any orbit or shrinking the sphere.
  const orbitRotations = [...orbitSource.matchAll(/rotation: \[([0-9., -]+)\]/g)]
    .map(([, rotation]) => rotation.split(",").map(Number));
  assert.equal(orbitRotations.length, orbitRadii.length);
  orbitRadii.forEach(([radius], index) => {
    const [rotationX, rotationY] = orbitRotations[index];
    const projectedMinorRadius = radius * Math.abs(Math.cos(rotationX) * Math.cos(rotationY));
    assert.ok(projectedMinorRadius > 1.38 * 1.014);
  });
  assert.match(orbitSource, /createParticleOrbits\(THREE\)/);
  assert.doesNotMatch(orbitSource, /desktopRotation|setDesktop/);
  assert.match(rendererSource, /createParticleOrbits\(THREE\)/);
  assert.doesNotMatch(rendererSource, /setDesktop/);
  assert.doesNotMatch(rendererSource, /orbitGroup\.rotation\.y\s*=/);
  assert.match(rendererSource, /orbitGroup\.rotation\.z\s*=\s*Math\.sin/);

  assert.match(orbitSource, /orbit-particle-glow/);
  assert.ok(rendererSource.includes("orbitGroup.userData.update?.(elapsed, burstAmount)"));
});

test("Labs hero applies one responsive dark radial background without a separate overlay", async () => {
  const heroSource = await readFile(
    new URL("../src/app/components/labs/LabsIntroduction.js", import.meta.url),
    "utf8",
  );

  assert.match(
    heroSource,
    /<div className="relative w-full overflow-hidden dark:bg-\[radial-gradient\(/,
  );
  assert.match(heroSource, /lg:dark:bg-\[radial-gradient\(/);
  assert.doesNotMatch(heroSource, /aria-hidden="true"\s+className="pointer-events-none absolute/);
  assert.doesNotMatch(heroSource, /linear-gradient\(90deg/);
  assert.doesNotMatch(heroSource, /bottom-0 left-0 right-0 top-\[68%\]/);
  assert.doesNotMatch(heroSource, /mt-8 h-px w-full bg-border-subtle/);

  assert.match(heroSource, /grid w-full max-w-\[25rem\] grid-cols-2 gap-6 border-t border-border-subtle/);
  assert.match(heroSource, /A space for|labs-heading/);
  assert.match(heroSource, /Published experiments/);
  assert.match(heroSource, /LabsHeroArtwork/);
});

test("particle shader provides depth shading and soft point halos", () => {
  assert.match(shaderSource, /viewDepth/);
  assert.match(shaderSource, /directionalLight/);
  assert.match(shaderSource, /gl_PointCoord/);
  assert.match(shaderSource, /smoothstep/);
  assert.doesNotMatch(shaderSource, /uContraction|radialScale|contractionHighlight/);
  assert.doesNotMatch(shaderSource, /transformed\.[xyz] \*=/);
  assert.match(shaderSource, /sparkleMask/);
  assert.match(shaderSource, /sparkleWave/);
  assert.match(shaderSource, /ambientDrift/);
  assert.match(shaderSource, /uniform float uSparkleDensity/);
  assert.match(shaderSource, /uniform float uSparkleIntensity/);
  assert.match(shaderSource, /uniform float uSparkleSpeed/);
  assert.match(shaderSource, /sparkleChance = mix\(0\.025, 0\.16, sparkleRandom\) \* uSparkleDensity/);
  assert.match(shaderSource, /sparkleRate = \(0\.62 \+ hash11\(aSeed \* 17\.4\) \* 2\.1\) \* uSparkleSpeed/);
  assert.match(shaderSource, /sparkleWave/);
  assert.match(shaderSource, /uSparkleIntensity/);
  assert.match(shaderSource, /sparkleChance/);
  assert.match(shaderSource, /sparkleRandom/);
  assert.match(shaderSource, /burstGlint/);
  assert.match(shaderSource, /particleBurstTime/);
  assert.match(shaderSource, /burstRecovery/);
  assert.match(shaderSource, /burstOffset \+= tangent/);
  assert.match(shaderSource, /burstOffset \+= bitangent/);
  assert.match(shaderSource, /vTrailDirection/);
  assert.match(shaderSource, /trailTail/);
  assert.match(shaderSource, /uBrandColor/);
  assert.match(shaderSource, /uniform float uSurfaceParticleMix/);
  assert.match(shaderSource, /uniform float uSurfaceParticleBrightness/);
  assert.match(shaderSource, /uniform float uSurfaceParticleOpacityFloor/);
  assert.match(shaderSource, /uniform float uSurfaceParticleSizeScale/);
  assert.match(shaderSource, /mix\(uBrandColor, aColor, uSurfaceParticleMix\)/);
  assert.match(shaderSource, /mix\(uSurfaceParticleOpacityFloor, 0\.96, facing\)/);
  assert.match(shaderSource, /surfaceBrightness/);
  assert.match(shaderSource, /uInnerParticleColor/);
  assert.match(shaderSource, /uInnerParticleOpacity/);
  assert.match(shaderSource, /innerLayer/);
  assert.match(shaderSource, /mix\(surfaceOpacity, uInnerParticleOpacity, innerLayer\)/);
  assert.match(shaderSource, /innerLitColor/);
  assert.match(shaderSource, /uSparkleColor/);
  assert.match(shaderSource, /sparkle \* 1\.15/);
  assert.match(shaderSource, /starRays/);
  assert.match(shaderSource, /uniform float uBurst/);
  assert.match(shaderSource, /uniform vec3 uPointerPosition/);
  assert.match(shaderSource, /uniform float uPointerActive/);
  assert.match(shaderSource, /uniform float uBurstExpansion/);
  assert.match(shaderSource, /uniform float uBurstTime/);
  assert.match(shaderSource, /uniform float uBurstStagger/);
  assert.match(shaderSource, /uniform float uBurstRecoverySeconds/);
  assert.match(shaderSource, /vTrailDirection/);
  assert.match(shaderSource, /trailTail/);
  assert.match(shaderSource, /burstDistance = length\(position\)\s*\*\s*uBurstExpansion\s*\*\s*particleBurst\s*\*\s*radialVariation/);
  assert.ok(interactionSource.includes("PARTICLE_BURST_EXPANSION = 1.85"));
  assert.match(shaderSource, /pointerInfluence/);
  assert.match(shaderSource, /float sphereLayer = 1\.0 - ambientLayer/);
  assert.equal((shaderSource.match(/float sphereLayer = 1\.0 - ambientLayer/g) || []).length, 1);
  assert.match(shaderSource, /smoothstep\(-0\.24, 0\.32, viewNormal\.z\)/);
  assert.match(shaderSource, /depthFade/);
  assert.match(shaderSource, /rimLight/);
  assert.match(shaderSource, /hemisphereFill/);
  assert.match(shaderSource, /uniform vec3 uVolumeColor/);
  assert.match(shaderSource, /uniform float uVolumeIntensity/);
  assert.match(shaderSource, /uniform vec3 uAmbientParticleColor/);
  assert.match(shaderSource, /uniform float uAmbientParticleOpacity/);
  assert.match(shaderSource, /uniform float uSphereRadius/);
  assert.match(shaderSource, /normalizedViewDepth/);
  assert.match(shaderSource, /nearParticleBoost/);
  assert.match(shaderSource, /depthAttenuation/);
  assert.match(shaderSource, /innerVolumeFalloff/);
  assert.match(shaderSource, /ambientLitColor/);
  assert.match(shaderSource, /vVolumeGlow/);
  assert.match(shaderSource, /volumeHalo/);
  assert.ok(shaderSource.includes("aSize * ambientSize * burstSize * nearParticleBoost * uPixelRatio"));
  assert.ok(shaderSource.includes("* (5.0 / viewDepth)"));
  assert.match(orbitSource, /baseOpacity = spec\.opacity/);
  assert.match(orbitSource, /themeRole = "orbit-particle"/);
  assert.match(orbitSource, /themeRole = "orbit-particle-glow"/);
  assert.match(orbitSource, /opacity: 0\.12/);
  assert.match(orbitSource, /opacity: 0\.082/);
  assert.match(orbitSource, /opacity: 0\.058/);
});
