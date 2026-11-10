const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function createRandom(seed) {
  let state = seed >>> 0 || 0x6d2b79f5;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function assertCount(value, name, maximum) {
  if (!Number.isInteger(value) || value < 0 || value > maximum) {
    throw new RangeError(`${name} must be an integer between 0 and ${maximum}.`);
  }
}

/**
 * Creates deterministic spherical surface and interior particles.
 * The result is renderer-independent so geometry can be unit tested in Node.
 */
export function createSphereParticleData({
  surfaceCount = 4400,
  innerCount = 480,
  ambientCount = 0,
  radius = 1.14,
  seed = 0x51f15e,
} = {}) {
  assertCount(surfaceCount, "surfaceCount", 16000);
  assertCount(innerCount, "innerCount", 4000);
  assertCount(ambientCount, "ambientCount", 128);

  if (!Number.isFinite(radius) || radius <= 0 || radius > 10) {
    throw new RangeError("radius must be a finite number greater than 0 and at most 10.");
  }

  const totalCount = surfaceCount + innerCount + ambientCount;
  const positions = new Float32Array(totalCount * 3);
  const sizes = new Float32Array(totalCount);
  const seeds = new Float32Array(totalCount);
  const colors = new Float32Array(totalCount * 3);
  const layers = new Float32Array(totalCount);
  const random = createRandom(seed);

  const writeParticle = (index, direction, particleRadius, layer) => {
    const isInner = layer === 1;
    const isAmbient = layer === 2;
    const offset = index * 3;
    const variation = random();

    positions[offset] = direction.x * particleRadius;
    positions[offset + 1] = direction.y * particleRadius;
    positions[offset + 2] = direction.z * particleRadius;

    sizes[index] = isAmbient
      ? 1.05 + random() * 0.72
      : isInner
        ? 0.58 + random() * 0.56
        : 0.9 + random() * 0.88;
    seeds[index] = random();
    layers[index] = layer;

    if (isAmbient || variation > 0.991) {
      colors[offset] = 0.56;
      colors[offset + 1] = 0.86;
      colors[offset + 2] = 0.81;
    } else if (variation > 0.76) {
      colors[offset] = 0.19;
      colors[offset + 1] = 0.63;
      colors[offset + 2] = 0.58;
    } else {
      colors[offset] = 0.075;
      colors[offset + 1] = 0.34;
      colors[offset + 2] = 0.32;
    }
  };

  for (let index = 0; index < surfaceCount; index += 1) {
    const y = 1 - (2 * (index + 0.5)) / Math.max(surfaceCount, 1);
    const horizontalRadius = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = GOLDEN_ANGLE * index;
    const direction = {
      x: Math.cos(angle) * horizontalRadius,
      y,
      z: Math.sin(angle) * horizontalRadius,
    };
    const radiusVariation = radius * (0.986 + random() * 0.028);

    writeParticle(index, direction, radiusVariation, 0);
  }

  for (let index = 0; index < innerCount; index += 1) {
    const particleIndex = surfaceCount + index;
    const y = 1 - (2 * (index + 0.5)) / Math.max(innerCount, 1);
    const horizontalRadius = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = GOLDEN_ANGLE * index + 0.37;
    const direction = {
      x: Math.cos(angle) * horizontalRadius,
      y,
      z: Math.sin(angle) * horizontalRadius,
    };
    const volumeRadius = radius * (0.16 + Math.cbrt(random()) * 0.68);

    writeParticle(particleIndex, direction, volumeRadius, 1);
  }

  for (let index = 0; index < ambientCount; index += 1) {
    const particleIndex = surfaceCount + innerCount + index;
    const y = random() * 2 - 1;
    const horizontalRadius = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = random() * Math.PI * 2;
    const direction = {
      x: Math.cos(angle) * horizontalRadius,
      y,
      z: Math.sin(angle) * horizontalRadius,
    };
    const ambientRadius = radius * (1.28 + random() * 0.42);

    writeParticle(particleIndex, direction, ambientRadius, 2);
  }

  return {
    positions,
    sizes,
    seeds,
    colors,
    layers,
    count: totalCount,
    surfaceCount,
    innerCount,
    ambientCount,
    radius,
  };
}
