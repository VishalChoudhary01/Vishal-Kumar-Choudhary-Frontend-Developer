const ORBIT_SPECS = [
  {
    radiusX: 1.56,
    radiusY: 0.91,
    rotation: [0.92, 0.12, -0.15],
    opacity: 0.15,
    start: -Math.PI * 0.92,
    end: Math.PI * 0.88,
  },
  {
    radiusX: 1.43,
    radiusY: 0.73,
    rotation: [1.26, -0.34, 0.48],
    opacity: 0.105,
    start: -Math.PI * 0.76,
    end: Math.PI * 0.98,
  },
  {
    radiusX: 1.7,
    radiusY: 0.82,
    rotation: [0.48, 0.42, -0.62],
    opacity: 0.075,
    start: -Math.PI * 0.84,
    end: Math.PI * 0.78,
  },
];

export function createParticleOrbits(THREE) {
  const group = new THREE.Group();

  ORBIT_SPECS.forEach((spec) => {
    const points = [];
    const segments = 220;
    const span = spec.end - spec.start;

    for (let index = 0; index <= segments; index += 1) {
      const progress = index / segments;
      const angle = spec.start + span * progress;

      points.push(
        new THREE.Vector3(
          Math.cos(angle) * spec.radiusX,
          Math.sin(angle) * spec.radiusY,
          Math.sin(angle * 2) * 0.045,
        ),
      );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x3a9b91,
      transparent: true,
      opacity: spec.opacity,
      depthWrite: false,
    });
    const orbit = new THREE.Line(geometry, material);

    orbit.rotation.set(...spec.rotation);
    group.add(orbit);
  });

  return group;
}
