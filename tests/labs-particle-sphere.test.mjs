import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createSphereParticleData } from "../src/app/components/labs/landing/particle-sphere/particle-geometry.mjs";
import {
  getParticleBurstEnvelope,
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
  const radius = 1.14;
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
    orbitRadius: 1.9,
    fillRatio: 0.92,
  });
  const desktopDistance = getParticleCameraDistance({
    width: 1440,
    height: 820,
    fovDegrees: 42,
    orbitRadius: 1.9,
    fillRatio: 0.92,
  });

  assert.ok(Number.isFinite(mobileDistance));
  assert.ok(Number.isFinite(desktopDistance));
  assert.ok(mobileDistance > desktopDistance);
  assert.match(rendererSource, /camera\.position\.z = getParticleCameraDistance/);
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
  assert.equal(light.sparkleColor, "#041816");
  assert.equal(light.glowColor, "#0a2926");
  assert.equal(dark.particleColor, "#58b7ae");
  assert.equal(dark.sparkleColor, "#e1fff9");
  assert.equal(dark.glowColor, "#061c18");
  assert.equal(dark.glowOpacity, 0.028);
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
  assert.match(rendererSource, /frameInterval = 1000 \/\s*\(qualityProfile\?\.maxFps/);
  assert.match(rendererSource, /lastRenderTime = 0/);
  assert.match(rendererSource, /viewportWidth: window\.innerWidth/);
  assert.match(rendererSource, /themeObserver/);
  assert.match(rendererSource, /syncThemeColor/);
  assert.match(rendererSource, /getParticleSphereThemePalette/);
  assert.ok(rendererSource.includes('classList.contains("dark")'));
  assert.match(rendererSource, /initialPalette\.particleColor/);
  assert.match(rendererSource, /palette\.particleColor/);
  assert.match(rendererSource, /uSparkleColor/);
  assert.match(rendererSource, /glow\.material\.color\.set\(palette\.glowColor\)/);
  assert.match(rendererSource, /case "orbit-particle"/);
  assert.match(rendererSource, /case "orbit-particle-glow"/);
  assert.match(rendererSource, /getParticleCameraDistance/);
  assert.match(rendererSource, /orbitGroup\.userData\.update\?\.\(elapsed\)/);
  assert.doesNotMatch(rendererSource, /uContraction|getSphereScale|getSphereContraction|\.scale\.setScalar/);
  assert.ok(rendererSource.includes("renderer?.dispose()"));
  assert.match(rendererSource, /webglcontextlost/);
  assert.match(rendererSource, /disposed = false/);
  assert.match(rendererSource, /if \(disposed\) return/);
});

test("particle burst expands quickly and recovers without changing base geometry", () => {
  assert.equal(getParticleBurstEnvelope(-1), 0);
  assert.equal(getParticleBurstEnvelope(0), 0);
  assert.equal(getParticleBurstEnvelope(0.45), 1);
  assert.equal(getParticleBurstEnvelope(1.35), 0);
  assert.equal(getParticleBurstEnvelope(Number.NaN), 0);

  assert.equal(getOrbitBurstSpeed(0), 1);
  assert.equal(getOrbitBurstSpeed(0.45), 1.65);
  assert.equal(getOrbitBurstSpeed(1.35), 1);
  assert.equal(isParticleBurstActive(0.8), true);
  assert.equal(isParticleBurstActive(1.35), false);
});

test("renderer maps pointer hits to the sphere and restarts burst on a short tap", () => {
  assert.match(rendererSource, /raycaster\.intersectObject\(sphereHitArea, false\)/);
  assert.match(rendererSource, /sphereGroup\.worldToLocal\(pointerLocal\)/);
  assert.match(rendererSource, /addEventListener\("pointerdown"/);
  assert.match(rendererSource, /addEventListener\("pointerup"/);
  assert.match(rendererSource, /addEventListener\("pointermove"/);
  assert.match(rendererSource, /startedOnSphere/);
  assert.match(rendererSource, /setPointerCapture\?\.\(event\.pointerId\)/);
  assert.match(rendererSource, /distance <= 12 && hitSphere/);
  assert.match(rendererSource, /burstStartedAt = elapsed/);
  assert.match(rendererSource, /touchAction = "pan-y"/);
  assert.match(rendererSource, /removeEventListener\("pointercancel"/);
  assert.match(rendererSource, /releasePointerCapture\?\.\(event\.pointerId\)/);
});

test("orbit particles move continuously and retain their orbital path", () => {
  assert.match(orbitSource, /group\.userData\.update = \(elapsed\)/);
  assert.match(orbitSource, /runner\.position\.copy\(getOrbitPoint\(THREE, spec, progress\)\)/);
  assert.match(orbitSource, /ORBIT_BURST_SPEED_MULTIPLIER - 1/);
  assert.equal(ORBIT_BURST_SPEED_MULTIPLIER, 1.65);
  assert.match(orbitSource, /delta \* spec\.speed \* burstSpeed/);
  assert.match(orbitSource, /end: Math\.PI \* 2/);
  assert.match(orbitSource, /orbit-particle-glow/);
  assert.match(rendererSource, /orbitGroup\.userData\.update\?\.\(elapsed\)/);
});

test("Labs hero keeps its content layout and adds a dark-only right artwork gradient", async () => {
  const heroSource = await readFile(
    new URL("../src/app/components/labs/LabsIntroduction.js", import.meta.url),
    "utf8",
  );

  assert.match(heroSource, /dark:bg-\[radial-gradient\(ellipse_at_68%_48%/);
  assert.match(heroSource, /dark:w-\[60%\]/);
  assert.match(heroSource, /#010302_100%/);
  assert.match(heroSource, /transparent_0%/);
  assert.match(heroSource, /A space for|labs-heading/);
  assert.match(heroSource, /Published experiments/);
  assert.match(heroSource, /LabsHeroArtwork/);

  const artworkSource = await readFile(
    new URL("../src/app/components/labs/landing/LabsHeroArtwork.js", import.meta.url),
    "utf8",
  );
  assert.match(artworkSource, /dark:opacity-15/);
  assert.match(artworkSource, /dark:opacity-\[0\.035\]/);
  assert.match(artworkSource, /dark:bg-\[#030b08\]\/\[0\.018\]/);
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
  assert.match(shaderSource, /sparkleThreshold/);
  assert.match(shaderSource, /uBrandColor/);
  assert.match(shaderSource, /uSparkleColor/);
  assert.match(shaderSource, /sparkle \* 1\.1/);
  assert.match(shaderSource, /starRays/);
  assert.match(shaderSource, /uniform float uBurst/);
  assert.match(shaderSource, /uniform vec3 uPointerPosition/);
  assert.match(shaderSource, /uniform float uPointerActive/);
  assert.match(shaderSource, /length\(position\) \* 0\.72 \* uBurst/);
  assert.match(shaderSource, /pointerInfluence/);
  assert.match(shaderSource, /float sphereLayer = 1\.0 - ambientLayer/);
  assert.match(shaderSource, /smoothstep\(-0\.24, 0\.32, viewNormal\.z\)/);
  assert.match(shaderSource, /depthFade/);
  assert.match(shaderSource, /rimLight/);
  assert.match(shaderSource, /hemisphereFill/);
  assert.match(shaderSource, /aSize \* ambientSize \* uPixelRatio \* \(5\.0 \/ viewDepth\)/);
  assert.match(orbitSource, /baseOpacity = spec\.opacity/);
  assert.match(orbitSource, /themeRole = "orbit-particle"/);
  assert.match(orbitSource, /themeRole = "orbit-particle-glow"/);
  assert.match(orbitSource, /opacity: 0\.12/);
  assert.match(orbitSource, /opacity: 0\.082/);
  assert.match(orbitSource, /opacity: 0\.058/);
});
