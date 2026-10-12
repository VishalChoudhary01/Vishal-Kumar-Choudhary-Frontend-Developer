export const PIN_RUNWAY = 210;
export const PIN_HEIGHT = 100;

export const PIN_SCROLL_FACTOR =
  (PIN_HEIGHT + PIN_RUNWAY) / PIN_RUNWAY;

const FOCAL_START = 0.1;
const FOCAL_END = 0.82;

export function focalFraction(p, total = 4) {
  if (p <= FOCAL_START) {
    return 0;
  }

  if (p >= FOCAL_END) {
    return total - 1;
  }

  const t =
    (p - FOCAL_START) /
    (FOCAL_END - FOCAL_START);

  return t * (total - 1);
}

export const DEPTH_PROFILES = {
  desktop: {
    perspective: 1500,
    zMax: 104,
    yMax: 92,
    scaleMin: 0.9,
    opacityMin: 0.14,
    opacityReach: 1.6,
    rotateAmp: 1.1,
    zSpread: 1.2,
  },

  tablet: {
    perspective: 1300,
    zMax: 64,
    yMax: 70,
    scaleMin: 0.94,
    opacityMin: 0.16,
    opacityReach: 1.3,
    rotateAmp: 0.7,
    zSpread: 1.3,
  },

  mobile: {
    perspective: 1100,
    zMax: 56,
    yMax: 58,
    scaleMin: 0.94,
    opacityMin: 0.16,
    opacityReach: 1.15,
    rotateAmp: 0.5,
    zSpread: 1.1,
  },
};

const clamp01 = (value) =>
  Math.min(1, Math.max(0, value));

const smooth = (value) => {
  const t = clamp01(value);

  return t * t * (3 - 2 * t);
};

export function depthOf(
  r,
  profile = DEPTH_PROFILES.desktop
) {
  const distance = Math.abs(r);

  const surfaceT = clamp01(
    (distance - 0.1) /
    (profile.opacityReach - 0.1)
  );

  const reveal = clamp01(
    ((r < 0 ? 0.45 : 0.62) - distance) /
    0.18
  );

  return {
    y:
      profile.yMax *
      Math.tanh(r),

    z:
      -profile.zMax *
      smooth(
        distance /
        profile.zSpread
      ),

    scale:
      1 -
      (1 - profile.scaleMin) *
      Math.tanh(distance * 1.2),

    opacity:
      1 -
      (1 - profile.opacityMin) *
      smooth(surfaceT),

    content: smooth(reveal),

    rotate:
      profile.rotateAmp *
      Math.sin(
        clamp01(
          distance * 1.05
        ) * Math.PI
      ) *
      (r < 0 ? -1 : 1),
  };
}

export function focalIndex(
  p,
  total = 4
) {
  const f = focalFraction(
    clamp01(p),
    total
  );

  return Math.min(
    total - 1,
    Math.max(0, Math.round(f))
  );
}