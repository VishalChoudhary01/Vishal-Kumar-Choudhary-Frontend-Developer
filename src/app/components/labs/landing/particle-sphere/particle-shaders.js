export const particleVertexShader = `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  attribute float aLayer;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uMotionEnabled;

  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vec3 transformed = position;
    vec3 direction = normalize(position + vec3(0.0001));

    float microDrift = sin(uTime * 0.34 + aSeed * 6.28318)
      * 0.0035
      * uMotionEnabled;

    transformed += direction * microDrift;

    vec4 modelPosition = modelViewMatrix * vec4(transformed, 1.0);
    float viewDepth = max(1.0, -modelPosition.z);

    gl_PointSize = clamp(
      aSize * uPixelRatio * (4.2 / viewDepth),
      1.0,
      7.0 * uPixelRatio
    );

    gl_Position = projectionMatrix * modelPosition;

    vec3 normalDirection = normalize(position + vec3(0.0001));
    vec3 lightDirection = normalize(vec3(-0.46, 0.38, 0.82));
    float directionalLight = 0.56
      + 0.44 * max(dot(normalDirection, lightDirection), 0.0);
    float facing = smoothstep(-0.78, 0.24, normalDirection.z);
    float layerOpacity = mix(0.88, 0.40, aLayer);

    vColor = aColor * directionalLight;
    vOpacity = mix(0.12, 0.84, facing) * layerOpacity;
  }
`;

export const particleFragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vec2 centered = gl_PointCoord - vec2(0.5);
    float distanceFromCenter = length(centered);

    float core = 1.0 - smoothstep(0.08, 0.46, distanceFromCenter);
    float halo = exp(-distanceFromCenter * distanceFromCenter * 30.0) * 0.22;
    float alpha = (core * 0.76 + halo) * vOpacity;

    if (alpha < 0.012) discard;

    gl_FragColor = vec4(vColor, alpha);
  }
`;
