varying vec2 vUv;
varying vec3 vColor;

uniform float iTime;
uniform float waveSize;
uniform float tipDistance;
uniform float centerDistance;
uniform float waveSpeed;
uniform float windStrength;
uniform float windFrequency;

void main() {
  vUv = uv;
  vColor = color;
  vec3 cpos = position;

  float windOffset = iTime * windFrequency;
  float wave = sin(windOffset + (uv.x * waveSize)) * windStrength;

  if (color.x > 0.6) {
    cpos.x += wave * tipDistance;
  } else if (color.x > 0.0) {
    cpos.x += wave * centerDistance;
  }

  vec4 mvPosition = projectionMatrix * modelViewMatrix * vec4(cpos, 1.0);
  gl_Position = mvPosition;
}