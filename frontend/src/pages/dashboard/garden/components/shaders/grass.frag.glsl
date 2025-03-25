precision highp float;

varying vec2 vUv;
varying vec3 vColor;

uniform float time;
uniform float windStrength;
uniform float windFrequency;

// Function to generate random value
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    // Base grass color with height-based variation
    vec3 grassColor = vec3(0.2, 0.8, 0.2);
    
    // Add more complex position-based variation with different scales
    float randomValue1 = random(vUv * 10.0);
    float randomValue2 = random(vUv * 20.0);
    float randomValue3 = random(vUv * 30.0);
    float randomValue4 = random(vUv * 40.0);
    
    // Create more varied color patterns with wider ranges
    grassColor.r *= 0.8 + randomValue1 * 0.4;  // More red variation
    grassColor.g *= 0.85 + randomValue2 * 0.5; // More green variation
    grassColor.b *= 0.75 + randomValue3 * 0.3; // More blue variation
    
    // Add extra variation based on position
    float extraVariation = randomValue4 * 0.2;
    grassColor += vec3(extraVariation, extraVariation * 0.5, extraVariation * 0.3);
    
    // Add height-based gradient with more contrast
    float heightFactor = vColor.g;
    grassColor *= 0.65 + heightFactor * 0.7; // More contrast between base and tip
    
    // Add subtle wind-based variation
    float windEffect = sin(vUv.x * 10.0 + time * windFrequency) * windStrength * 0.05;
    grassColor += vec3(windEffect, windEffect * 0.5, windEffect * 0.2);
    
    // Ensure colors stay within reasonable bounds
    grassColor = clamp(grassColor, 0.0, 1.0);
    
    gl_FragColor = vec4(grassColor, 1.0);
}