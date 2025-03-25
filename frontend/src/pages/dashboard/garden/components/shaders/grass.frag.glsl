precision highp float;

varying vec2 vUv;
varying vec3 vColor;

void main() {
  // Base grass color
  vec3 grassColor = vec3(0.2, 0.8, 0.2); // Green color
  
  // Add variation based on height
  float heightFactor = vColor.g;
  grassColor *= 0.8 + heightFactor * 0.4;
  
  // Add some brightness variation
  float brightness = 0.1;
  grassColor += vec3(brightness, brightness, brightness);
  
  gl_FragColor = vec4(grassColor, 1.0);
}