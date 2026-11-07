import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createSphereParticleData } from "../src/app/components/labs/landing/particle-sphere/particle-geometry.mjs";
import { getSphereSqueeze, SPHERE_PULSE_PERIOD } from "../src/app/components/labs/landing/particle-sphere/particle-animation.mjs";
import { getParticleQualityProfile } from "../src/app/components/labs/landing/particle-sphere/particle-quality.mjs";

const rendererSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/LabsParticleSphere.js", import.meta.url),
  "utf8",
);
const shaderSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/particle-shaders.js", import.meta.url),
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

test("sphere squeeze eases in and recovers on a stable pulse cycle", () => {
  assert.equal(getSphereSqueeze(0), 0);
  assert.equal(getSphereSqueeze(2.5), 1);
  assert.equal(getSphereSqueeze(2.5 + SPHERE_PULSE_PERIOD), 1);
  assert.equal(getSphereSqueeze(7.0), 0);
  assert.equal(getSphereSqueeze(-1), 0);
  assert.equal(getSphereSqueeze(Number.NaN), 0);

  const attack = getSphereSqueeze(2.2);
  const recovery = getSphereSqueeze(3.4);

  assert.ok(attack > 0 && attack < 1);
  assert.ok(recovery > 0 && recovery < 1);
});

test("particle quality profiles adapt density and pixel ratio to viewport size", () => {
  const desktop = getParticleQualityProfile({ viewportWidth: 1440 });
  const tablet = getParticleQualityProfile({ viewportWidth: 900 });
  const mobile = getParticleQualityProfile({ viewportWidth: 390 });

  assert.equal(desktop.tier, "high");
  assert.equal(desktop.surfaceCount, 4400);
  assert.equal(tablet.tier, "medium");
  assert.equal(tablet.surfaceCount, 3400);
  assert.equal(mobile.tier, "compact");
  assert.equal(mobile.surfaceCount, 2400);
  assert.ok(mobile.maxPixelRatio < desktop.maxPixelRatio);
});

test("constrained devices receive a lower particle budget", () => {
  const constrained = getParticleQualityProfile({
    viewportWidth: 1440,
    deviceMemory: 2,
    hardwareConcurrency: 2,
  });

  assert.equal(constrained.tier, "low");
  assert.equal(constrained.surfaceCount, 2800);
  assert.ok(constrained.maxPixelRatio <= 1.2);
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
  assert.match(rendererSource, /viewportWidth: window\.innerWidth/);
  assert.match(rendererSource, /themeObserver/);
  assert.match(rendererSource, /syncThemeColor/);
  assert.ok(rendererSource.includes("renderer?.dispose()"));
  assert.match(rendererSource, /webglcontextlost/);
  assert.match(rendererSource, /disposed = false/);
  assert.match(rendererSource, /if \(disposed\) return/);
});

test("particle shader provides depth shading and soft point halos", () => {
  assert.match(shaderSource, /viewDepth/);
  assert.match(shaderSource, /directionalLight/);
  assert.match(shaderSource, /gl_PointCoord/);
  assert.match(shaderSource, /smoothstep/);
  assert.match(shaderSource, /uSqueeze/);
  assert.match(shaderSource, /sparkleMask/);
  assert.match(shaderSource, /sparkleWave/);
  assert.match(shaderSource, /ambientDrift/);
  assert.match(shaderSource, /sparkleThreshold/);
  assert.match(shaderSource, /uBrandColor/);
  assert.match(shaderSource, /smoothstep\(-0\.24, 0\.32, viewNormal\.z\)/);
  assert.match(shaderSource, /depthFade/);
});
