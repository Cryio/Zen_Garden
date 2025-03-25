precision highp float;

attribute float timeOffset;

uniform float time;
uniform float waveSize;
uniform float waveSpeed;
uniform float windStrength;
uniform float windFrequency;

varying vec3 vColor;
varying vec2 vUv;

void main() {
  vColor = color;
  vUv = uv;
  vec3 pos = position;
  
  if (position.y > 0.0) {
    float wave = sin(time * waveSpeed + timeOffset) * waveSize * 0.3;
    float heightFactor = position.y;
    float wind = sin(time * windFrequency + position.x) * windStrength * heightFactor * 0.2;
    
    pos.x += wave * heightFactor;
    pos.z += wind;
    pos.y += sin(time * waveSpeed * 0.3) * waveSize * 0.05 * heightFactor;
  }
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}