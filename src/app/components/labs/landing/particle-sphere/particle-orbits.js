import { ORBIT_BURST_SPEED_MULTIPLIER } from "./particle-interaction.mjs";

export const ORBIT_SPECS = [
  {
    radiusX: 1.56,
    radiusY: 0.91,
    rotation: [0.92, 0.12, -0.15],
    opacity: 0.12,
    start: 0,
    end: Math.PI * 2,
    speed: 0.035,
    phase: 0.04,
    particleSize: 0.012,
  },
  {
    radiusX: 1.43,
    radiusY: 0.73,
    rotation: [1.26, -0.34, 0.48],
    opacity: 0.082,
    start: 0,
    end: Math.PI * 2,
    speed: 0.046,
    phase: 0.38,
    particleSize: 0.01,
  },
  {
    radiusX: 1.7,
    radiusY: 0.82,
    rotation: [0.48, 0.42, -0.62],
    opacity: 0.058,
    start: 0,
    end: Math.PI * 2,
    speed: 0.029,
    phase: 0.72,
    particleSize: 0.011,
  },
];

function getOrbitPoint(THREE, spec, progress) {
  const angle = spec.start + (spec.end - spec.start) * progress;

  return new THREE.Vector3(
    Math.cos(angle) * spec.radiusX,
    Math.sin(angle) * spec.radiusY,
    Math.sin(angle * 2) * 0.045,
  );
}

export function createParticleOrbits(THREE) {
  const group = new THREE.Group();
  const orbiters = [];

  ORBIT_SPECS.forEach((spec) => {
    const points = [];
    const segments = 240;

    for (let index = 0; index <= segments; index += 1) {
      points.push(getOrbitPoint(THREE, spec, index / segments));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x3a9b91,
      transparent: true,
      opacity: spec.opacity,
      depthWrite: false,
    });
    material.userData.baseOpacity = spec.opacity;
    material.userData.themeRole = "orbit-line";

    const orbitFrame = new THREE.Group();
    orbitFrame.rotation.set(...spec.rotation);
    orbitFrame.add(new THREE.Line(geometry, material));

    const runner = new THREE.Group();
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    coreMaterial.userData.themeRole = "orbit-particle";

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    glowMaterial.userData.themeRole = "orbit-particle-glow";

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(spec.particleSize, 12, 10),
      coreMaterial,
    );
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(spec.particleSize * 2.15, 12, 10),
      glowMaterial,
    );

    runner.add(glow);
    runner.add(core);
    runner.position.copy(getOrbitPoint(THREE, spec, spec.phase));
    orbitFrame.add(runner);
    group.add(orbitFrame);

    orbiters.push({ runner, spec });
  });

  let lastElapsed = 0;
  const progressByRunner = orbiters.map(({ spec }) => spec.phase);

  group.userData.update = (elapsed, burstAmount = 0) => {
    const delta = Math.max(0, elapsed - lastElapsed);
    const burstSpeed = 1 + Math.max(0, Math.min(1, burstAmount)) * (ORBIT_BURST_SPEED_MULTIPLIER - 1);
    lastElapsed = elapsed;

    orbiters.forEach(({ runner, spec }, index) => {
      progressByRunner[index] = (progressByRunner[index] + delta * spec.speed * burstSpeed) % 1;
      runner.position.copy(getOrbitPoint(THREE, spec, progressByRunner[index]));
    });
  };

  return group;
}
