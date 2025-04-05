import React, { useEffect } from 'react';

export default function AnimatedBackground() {
  useEffect(() => {
    const createSVGBackground = () => {
      const existingSVG = document.querySelector(".svg-background");
      if (existingSVG) return;

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "svg-background fixed inset-0 w-full h-full -z-10 pointer-events-none");
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

      const width = window.innerWidth;
      const height = window.innerHeight;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.setAttribute("preserveAspectRatio", "xMinYMin slice");

      svg.innerHTML = `
        <defs>
          <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(28, 25, 23, 1)" stop-opacity="1"/>
            <stop offset="100%" stop-color="rgba(41, 37, 36, 1)" stop-opacity="1"/>
          </linearGradient>
        
          <filter id="softBlur">
            <feGaussianBlur stdDeviation="3">
              <animate
                attributeName="stdDeviation"
                values="3;2;3.5;2.5;3"
                dur="20s"
                repeatCount="indefinite"
              />
            </feGaussianBlur>
          </filter>

          <filter id="glowEffect">
            <feGaussianBlur stdDeviation="4" result="blurOut"/>
            <feColorMatrix 
              type="matrix" 
              values="1 0 0 0 0 
                      0 1 0 0 0 
                      0 0 1 0 0 
                      0 0 0 0.7 0"
              in="blurOut"
              result="matrix"
            />
            <feBlend mode="screen" in="SourceGraphic" in2="matrix"/>
          </filter>
        </defs>
        
        <rect width="${width}" height="${height}" fill="url(#backgroundGradient)" />
        
        <!-- Curved Animated Paths -->
        <g filter="url(#softBlur)">
          ${[
            { color: "rgba(239, 68, 68, 0.3)", amplitude: 50, frequency: 0.002, speed: 8 },
            { color: "rgba(248, 113, 113, 0.2)", amplitude: 40, frequency: 0.0015, speed: 10 },
            { color: "rgba(252, 165, 165, 0.15)", amplitude: 30, frequency: 0.001, speed: 12 }
          ].map((pathConfig, index) => `
            <path
              d="M-100 ${height/2} 
                 Q${width/4} ${height/2 + pathConfig.amplitude * Math.sin(index)}, 
                 ${width/2} ${height/2}
                 Q${width*3/4} ${height/2 - pathConfig.amplitude * Math.cos(index)}, 
                 ${width+100} ${height/2}"
              fill="none"
              stroke="${pathConfig.color}"
              stroke-width="${3 - index * 0.5}"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to="${pathConfig.amplitude * Math.sin(index * 0.5)} ${pathConfig.amplitude * Math.cos(index * 0.5)}"
                dur="${pathConfig.speed}s"
                repeatCount="indefinite"
              />
            </path>
          `).join('')}
        </g>

        <!-- Vertical Animated Lines -->
        <g opacity="0.2" filter="url(#glowEffect)">
          ${[0.2, 0.4, 0.6, 0.8].map((position, index) => `
            <line 
              x1="${width * position}" 
              y1="-50" 
              x2="${width * position}" 
              y2="${height + 50}" 
              stroke="rgba(248, 113, 113, ${0.1 + index * 0.05})" 
              stroke-width="0.5"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to="${index % 2 === 0 ? 5 : -5} ${Math.sin(index) * 10}"
                dur="${15 + index * 3}s"
                repeatCount="indefinite"
              />
            </line>
          `).join('')}
        </g>

        <!-- Wavy Layers -->
        <g opacity="0.4">
          ${[
            { color: "rgba(252, 165, 165, 0.1)", yOffset: 0.7, duration: 15 },
            { color: "rgba(248, 113, 113, 0.15)", yOffset: 0.8, duration: 18 },
            { color: "rgba(239, 68, 68, 0.2)", yOffset: 0.9, duration: 20 }
          ].map((waveConfig, index) => `
            <path
              d="M0 ${height * waveConfig.yOffset} 
                 C${width * 0.25} ${height * (waveConfig.yOffset - 0.05)}, 
                 ${width * 0.5} ${height * (waveConfig.yOffset + 0.05)}, 
                 ${width * 0.75} ${height * waveConfig.yOffset} 
                 S${width} ${height * (waveConfig.yOffset - 0.1)}, 
                 ${width} ${height * waveConfig.yOffset}"
              fill="${waveConfig.color}"
              stroke="${waveConfig.color.replace('0.1)', '0.3)')}"
              stroke-width="${1 - index * 0.2}"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to="${5 * Math.sin(index)} ${5 * Math.cos(index)}"
                dur="${waveConfig.duration}s"
                repeatCount="indefinite"
              />
            </path>
          `).join('')}
        </g>
      `;

      document.body.insertBefore(svg, document.body.firstChild);
    };

    const handleResize = () => {
      const existingSVG = document.querySelector(".svg-background");
      if (existingSVG) {
        existingSVG.remove();
      }
      createSVGBackground();
    };

    createSVGBackground();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      const existingSVG = document.querySelector(".svg-background");
      if (existingSVG) {
        existingSVG.remove();
      }
    };
  }, []);

  return null;
} 