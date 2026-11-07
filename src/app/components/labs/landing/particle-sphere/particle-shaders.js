export const particleVertexShader = `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  attribute float aLayer;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uMotionEnabled;
  uniform vec3 uBrandColor;
  uniform vec3 uSparkleColor;
  uniform float uBurst;
  uniform vec3 uPointerPosition;
  uniform float uPointerActive;

  varying vec3 vColor;
  varying float vOpacity;
  varying float vSparkle;

  void main() {
    vec3 transformed = position;
    vec3 direction = normalize(position + vec3(0.0001));

    float ambientLayer = step(1.5, aLayer);
    float sphereLayer = 1.0 - ambientLayer;

    // Burst is a temporary radial displacement. The source geometry and
    // resting sphere radius are never changed.
    float burstVariation = 0.78 + fract(aSeed * 19.73) * 0.40;
    float burstDistance = length(position) * 0.72 * uBurst * burstVariation;
    transformed += direction * burstDistance * sphereLayer;

    // A local magnetic push affects only particles near the pointer hit.
    vec3 pointerDelta = transformed - uPointerPosition;
    float pointerDistance = length(pointerDelta);
    float pointerInfluence = 1.0 - smoothstep(0.06, 0.58, pointerDistance);
    vec3 pointerDirection = normalize(pointerDelta + vec3(0.0001));
    transformed += pointerDirection
      * pointerInfluence
      * 0.16
      * uPointerActive
      * sphereLayer;

    float microDrift = sin(uTime * 0.34 + aSeed * 6.28318)
      * 0.0035
      * uMotionEnabled;
    transformed += direction * microDrift;

    float ambientPhase = aSeed * 6.28318;
    vec3 ambientDrift = vec3(
      sin(uTime * 0.24 + ambientPhase),
      cos(uTime * 0.19 + ambientPhase * 1.31),
      sin(uTime * 0.17 + ambientPhase * 0.73)
    ) * 0.018 * ambientLayer * uMotionEnabled;
    transformed += ambientDrift;

    vec4 modelPosition = modelViewMatrix * vec4(transformed, 1.0);
    float viewDepth = max(1.0, -modelPosition.z);

    vec3 viewNormal = normalize(mat3(modelViewMatrix) * direction);
    vec3 lightDirection = normalize(vec3(-0.46, 0.38, 0.82));
    float directionalLight = 0.50
      + 0.50 * max(dot(viewNormal, lightDirection), 0.0);
    float rimLight = pow(1.0 - abs(viewNormal.z), 2.1);
    float hemisphereFill = 0.24 + 0.76 * max(viewNormal.y * 0.5 + 0.5, 0.0);
    float facing = smoothstep(-0.24, 0.32, viewNormal.z);
    float layerOpacity = aLayer > 1.5
      ? 0.68
      : (aLayer > 0.5 ? 0.28 : 1.0);
    float depthFade = 1.0 / (1.0 + max(0.0, viewDepth - 4.0) * 0.14);

    float sparkleThreshold = mix(0.958, 0.90, step(1.5, aLayer));
    float sparkleMask = step(sparkleThreshold, fract(aSeed * 37.0));
    float sparkleRate = 0.68 + fract(aSeed * 17.4) * 1.45;
    float sparkleWave = pow(
      max(0.0, sin(uTime * sparkleRate + aSeed * 31.4)),
      10.0
    );
    float sparkle = sparkleMask * sparkleWave * uMotionEnabled;
    sparkle = min(1.0, sparkle + uBurst * 0.18 * sparkleMask);

    float ambientSize = mix(1.0, 1.18, ambientLayer);
    float burstSize = 1.0 + uBurst * 0.35 * sphereLayer;

    gl_PointSize = clamp(
      aSize * ambientSize * burstSize * uPixelRatio
        * (5.0 / viewDepth) * (1.0 + sparkle * 1.75),
      1.0,
      9.0 * uPixelRatio
    );

    gl_Position = projectionMatrix * modelPosition;

    vec3 particleColor = mix(uBrandColor, aColor, 0.28);
    vec3 litColor = particleColor * (
      directionalLight * hemisphereFill + rimLight * 0.48
    );
    vec3 sparkleColor = uSparkleColor * (0.7 + sparkle * 2.4);

    vColor = mix(litColor, sparkleColor, clamp(sparkle * 1.3, 0.0, 1.0));
    vColor *= 1.0 + sparkle * 2.4 + uBurst * 0.16 * sphereLayer;
    vOpacity = (
      mix(0.012, 0.92, facing) * layerOpacity
      + sparkle * 1.1
      + uBurst * 0.08 * sphereLayer
    ) * depthFade;
    vSparkle = sparkle;
  }
`;

export const particleFragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  varying float vSparkle;

  void main() {
    vec2 centered = gl_PointCoord - vec2(0.5);
    float distanceFromCenter = length(centered);

    float core = 1.0 - smoothstep(0.05, 0.44, distanceFromCenter);
    float halo = exp(-distanceFromCenter * distanceFromCenter * 25.0) * 0.24;
    float sparkleHalo = exp(-distanceFromCenter * distanceFromCenter * 10.0)
      * vSparkle
      * 0.92;

    float rayX = 1.0 - smoothstep(0.0, 0.045, abs(centered.x));
    float rayY = 1.0 - smoothstep(0.0, 0.045, abs(centered.y));
    float rayFade = 1.0 - smoothstep(0.08, 0.5, distanceFromCenter);
    float starRays = max(rayX, rayY) * rayFade * vSparkle * 0.48;

    float alpha = (core * 0.78 + halo + sparkleHalo + starRays) * vOpacity;

    if (alpha < 0.012) discard;

    gl_FragColor = vec4(vColor * (1.0 + vSparkle * 2.0), alpha);
  }
`;
