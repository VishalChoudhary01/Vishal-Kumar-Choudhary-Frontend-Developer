export const particleVertexShader = `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  attribute float aLayer;

  uniform float uTime;
  uniform float uSqueeze;
  uniform float uPixelRatio;
  uniform float uMotionEnabled;

  varying vec3 vColor;
  varying float vOpacity;
  varying float vSparkle;

  void main() {
    vec3 transformed = position;
    vec3 direction = normalize(position + vec3(0.0001));

    float squeezeVariation = 0.965 + sin(aSeed * 6.28318) * 0.035;
    float squeeze = uSqueeze * squeezeVariation;

    transformed.x *= 1.0 + 0.065 * squeeze;
    transformed.y *= 1.0 - 0.125 * squeeze;
    transformed.z *= 1.0 + 0.035 * squeeze;

    float radialRipple = sin(position.y * 7.5 - uTime * 2.4)
      * 0.008
      * squeeze
      * uMotionEnabled;
    transformed += direction * radialRipple;

    float microDrift = sin(uTime * 0.34 + aSeed * 6.28318)
      * 0.0035
      * uMotionEnabled;
    transformed += direction * microDrift;

    float ambientPhase = aSeed * 6.28318;
    float ambientLayer = step(1.5, aLayer);
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
    float directionalLight = 0.56
      + 0.44 * max(dot(viewNormal, lightDirection), 0.0);
    float facing = smoothstep(-0.82, 0.18, viewNormal.z);
    float layerOpacity = aLayer > 1.5 ? 0.72 : mix(0.88, 0.40, aLayer);

    float sparkleThreshold = mix(0.972, 0.91, step(1.5, aLayer));
    float sparkleMask = step(sparkleThreshold, fract(aSeed * 37.0));
    float sparkleRate = 0.56 + fract(aSeed * 17.4) * 1.1;
    float sparkleWave = pow(
      max(0.0, sin(uTime * sparkleRate + aSeed * 31.4)),
      18.0
    );
    float sparkle = sparkleMask * sparkleWave * uMotionEnabled;

    float pulseHighlight = squeeze * (0.08 + 0.12 * facing);

    float ambientSize = mix(1.0, 1.18, ambientLayer);

    gl_PointSize = clamp(
      aSize * ambientSize * uPixelRatio * (4.2 / viewDepth) * (1.0 + sparkle * 1.15),
      1.0,
      7.0 * uPixelRatio
    );

    gl_Position = projectionMatrix * modelPosition;

    vColor = aColor * (directionalLight + sparkle * 2.8 + pulseHighlight);
    vOpacity = mix(0.12, 0.84, facing) * layerOpacity
      + sparkle * 0.92
      + pulseHighlight;
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

    float core = 1.0 - smoothstep(0.08, 0.46, distanceFromCenter);
    float halo = exp(-distanceFromCenter * distanceFromCenter * 30.0) * 0.22;
    float sparkleHalo = exp(-distanceFromCenter * distanceFromCenter * 16.0)
      * vSparkle
      * 0.48;
    float alpha = (core * 0.76 + halo + sparkleHalo) * vOpacity;

    if (alpha < 0.012) discard;

    gl_FragColor = vec4(vColor * (1.0 + vSparkle * 1.4), alpha);
  }
`;
