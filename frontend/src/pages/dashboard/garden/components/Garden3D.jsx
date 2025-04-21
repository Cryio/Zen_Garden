import React, { useEffect, useRef, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Stats, PerspectiveCamera } from '@react-three/drei';
import { Pane } from 'tweakpane';
import { Grass } from './Grass';
import { Patches } from './Patches';
import { ParallaxCamera } from './ParallaxCamera';
import { CustomCursor } from './CustomCursor';
import { Environment3D } from './Environment3D';
import * as THREE from 'three';
import { useAuth } from '@/context/AuthContext';
import { habitApi } from '@/lib/api';
import { toast } from 'sonner';

// Grid configuration
const GRID_SIZE = 8; // 8x8 grid
const PATCH_SIZE = 4; // Size of each patch

// Mock goals data for development
const mockGoals = [
  {
    id: '1',
    name: 'Exercise More',
    habits: [
      {
        id: '1-1',
        name: 'Morning Yoga',
        frequency: 'daily',
        lastCompleted: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
      {
        id: '1-2',
        name: 'Evening Walk',
        frequency: 'daily',
        lastCompleted: new Date(), // Today
      }
    ]
  },
  {
    id: '2',
    name: 'Healthy Eating',
    habits: [
      {
        id: '2-1',
        name: 'Eat Vegetables',
        frequency: 'daily',
        lastCompleted: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      },
      {
        id: '2-2',
        name: 'No Snacks',
        frequency: 'daily',
        lastCompleted: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
      },
      {
        id: '2-3',
        name: 'Drink Water',
        frequency: 'daily',
        lastCompleted: new Date(), // Today
      }
    ]
  },
  {
    id: '3',
    name: 'Learning',
    habits: [
      {
        id: '3-1',
        name: 'Read Books',
        frequency: 'daily',
        lastCompleted: new Date(), // Today
      },
      {
        id: '3-2',
        name: 'Study Math',
        frequency: 'weekly',
        lastCompleted: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      }
    ]
  }
];

// Add CSS for tooltip animations
const TOOLTIP_STYLES = `
  .garden-tooltip {
    position: fixed;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-size: 14px;
    color: #1a1a1a;
    pointer-events: none;
    z-index: 1000;
    transition: all 0.2s ease;
    transform-origin: top center;
  }

  .garden-tooltip.entering {
    opacity: 0;
    transform: scale(0.95) translateY(-5px);
  }

  .garden-tooltip.visible {
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  .garden-tooltip .title {
    font-weight: 600;
    margin-bottom: 4px;
    color: #2d3748;
  }

  .garden-tooltip .subtitle {
    font-size: 12px;
    color: #4a5568;
    margin-bottom: 2px;
  }

  .garden-tooltip .progress {
    margin-top: 8px;
    height: 4px;
    background: #e2e8f0;
    border-radius: 2px;
    overflow: hidden;
  }

  .garden-tooltip .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #68D391 0%, #38A169 100%);
    transition: width 0.3s ease;
  }

  .garden-tooltip .stats {
    display: flex;
    gap: 8px;
    margin-top: 6px;
    font-size: 12px;
    color: #718096;
  }

  .garden-tooltip .divider {
    height: 12px;
    width: 1px;
    background: #CBD5E0;
    margin: 0 4px;
  }
`;

function LoadingFallback() {
  return (
    <div className="w-full h-full overflow-hidden bg-gradient-to-b from-wax-flower-900/50 to-wax-flower-950/50 rounded-lg">
      <div className="text-wax-flower-200">Loading garden...</div>
    </div>
  );
}

function GardenScene({ params, goals }) {
  const sceneRef = useRef();
  const groundRef = useRef();
  const mousePosition = useRef({ x: 0.5, y: 0.5 });
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0));
  const currentPosition = useRef(new THREE.Vector3(0, 0, 0));
  const fogDensity = useRef(0);
  const { scene, camera, gl } = useThree();
  const [hovered, setHovered] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const cameraAngle = useRef(0);
  const lastInteractionTime = useRef(0);
  const lastDragDirection = useRef(1); // 1 for clockwise, -1 for counter-clockwise
  const rotationSpeed = useRef(0);
  const radius = 20; // Distance from center
  const RESUME_DELAY = 1000; // Delay in milliseconds before resuming auto-rotation
  const BASE_ROTATION_SPEED = 0.1;
  const SMOOTH_FACTOR = 0.05; // Lower = smoother transition

  // Camera control setup
  useEffect(() => {
    const handleMouseDown = (event) => {
      setIsDragging(true);
      lastMousePos.current = {
        x: event.clientX,
        y: event.clientY
      };
      // Store current camera angle
      cameraAngle.current = Math.atan2(camera.position.z, camera.position.x);
      rotationSpeed.current = 0; // Reset rotation speed when starting drag
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      lastInteractionTime.current = Date.now();
    };

    const handleMouseMove = (event) => {
      if (!isDragging) return;

      const deltaX = event.clientX - lastMousePos.current.x;
      lastMousePos.current = {
        x: event.clientX,
        y: event.clientY
      };

      // Update camera angle based on mouse movement
      const angleChange = deltaX * 0.01;
      cameraAngle.current += angleChange;

      // Store the direction of movement
      if (Math.abs(deltaX) > 1) { // Threshold to avoid tiny movements
        lastDragDirection.current = Math.sign(deltaX);
        // Update rotation speed based on mouse movement
        rotationSpeed.current = Math.min(Math.abs(deltaX) * 0.001, BASE_ROTATION_SPEED * 2);
      }

      // Update camera position
      camera.position.x = Math.cos(cameraAngle.current) * radius;
      camera.position.z = Math.sin(cameraAngle.current) * radius;
      camera.lookAt(0, 0, 0);
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [camera, isDragging]);

  // Camera rotation
  useFrame((state, delta) => {
    const timeSinceLastInteraction = Date.now() - lastInteractionTime.current;
    
    if (!isDragging) {
      if (timeSinceLastInteraction > RESUME_DELAY) {
        // Smoothly transition to base rotation speed
        const targetSpeed = BASE_ROTATION_SPEED * lastDragDirection.current;
        rotationSpeed.current += (targetSpeed - rotationSpeed.current) * SMOOTH_FACTOR;
      } else {
        // Gradually slow down after user interaction
        rotationSpeed.current *= 0.95;
      }
      
      // Apply rotation
      cameraAngle.current += rotationSpeed.current * delta;
      
      // Update camera position
      camera.position.x = Math.cos(cameraAngle.current) * radius;
      camera.position.z = Math.sin(cameraAngle.current) * radius;
    }
    
    camera.position.y = 8; // Keep constant height
    camera.lookAt(0, 0, 0); // Always look at center

    // Update ground position to follow camera
    if (groundRef.current) {
      groundRef.current.position.x = camera.position.x;
      groundRef.current.position.z = camera.position.z;
    }

    // Animate fog
    const time = state.clock.getElapsedTime();
    
    // Base fog density with subtle sine wave variation
    const baseDensity = 0.015; // Lighter base density
    const waveMagnitude = 0.005; // Subtle variation
    const waveSpeed = 0.2; // Slow wave movement
    
    // Add multiple sine waves for more natural variation
    const variation = 
      Math.sin(time * waveSpeed) * waveMagnitude +
      Math.sin(time * waveSpeed * 0.5) * waveMagnitude * 0.5 +
      Math.sin(time * waveSpeed * 0.25) * waveMagnitude * 0.25;
    
    // Apply fog density with smooth transition
    fogDensity.current += (baseDensity + variation - fogDensity.current) * 0.01;
    
    // Update fog
    if (scene.fog) {
      scene.fog.density = fogDensity.current;
    }
  });

  // Initialize fog
  useEffect(() => {
    if (scene && !scene.fog) {
      scene.fog = new THREE.FogExp2(params.fogColor, 0.015);
    }
    return () => {
      if (scene.fog) {
        scene.fog = null;
      }
    };
  }, [scene, params.fogColor]);

  // Add styles to document
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = TOOLTIP_STYLES;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  // Hover state management
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      // Add tooltip element if it doesn't exist
      let tooltip = document.getElementById('garden-tooltip');
      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'garden-tooltip';
        tooltip.className = 'garden-tooltip entering';
        document.body.appendChild(tooltip);
      }

      // Update tooltip position and content
      const updateTooltip = (event) => {
        if (hovered) {
          const x = event.clientX + 10;
          const y = event.clientY + 10;
          
          // Ensure tooltip stays within viewport
          const rect = tooltip.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          const finalX = Math.min(x, viewportWidth - rect.width - 10);
          const finalY = Math.min(y, viewportHeight - rect.height - 10);

          tooltip.style.left = `${finalX}px`;
          tooltip.style.top = `${finalY}px`;
          
          if (hovered.type === 'habit') {
            const progress = Math.round(hovered.health * 100);
            tooltip.innerHTML = `
              <div class="title">${hovered.habitName}</div>
              <div class="subtitle">Goal: ${hovered.goalName}</div>
              <div class="progress">
                <div class="progress-bar" style="width: ${progress}%"></div>
              </div>
              <div class="stats">
                <span>Stage ${hovered.stage}/5</span>
                <span class="divider"></span>
                <span>${progress}% Progress</span>
              </div>
            `;
          } else if (hovered.type === 'patch') {
            tooltip.innerHTML = `
              <div class="title">${hovered.goalName}</div>
              <div class="subtitle">${hovered.habitCount} habit${hovered.habitCount !== 1 ? 's' : ''}</div>
            `;
          }
          
          // Show tooltip with animation
          tooltip.classList.remove('entering');
          tooltip.classList.add('visible');
          tooltip.style.display = 'block';
        } else {
          // Hide tooltip with animation
          tooltip.classList.remove('visible');
          tooltip.classList.add('entering');
          setTimeout(() => {
            if (!hovered) {
              tooltip.style.display = 'none';
            }
          }, 200);
        }
      };

      canvas.addEventListener('mousemove', updateTooltip);
      return () => {
        canvas.removeEventListener('mousemove', updateTooltip);
        if (tooltip && tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      };
    }
  }, [hovered]);

  return (
    <>
      <group ref={sceneRef}>
        {/* Infinite Ground */}
        <mesh 
          ref={groundRef}
          rotation={[-Math.PI / 2, 0, 0]} 
          receiveShadow
          position={[0, -0.01, 0]}
        >
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial 
            color={params.groundColor}
            roughness={params.groundRoughness}
            metalness={params.groundMetalness}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Background Environment */}
        <Environment3D />

        {/* Garden Patches */}
        <Patches goals={goals} onHover={setHovered} />

        {/* Lighting */}
        <ambientLight intensity={params.ambientIntensity} />
        <directionalLight
          position={[params.lightX, params.lightY, params.lightZ]}
          intensity={params.lightIntensity}
          castShadow
        />
      </group>
    </>
  );
}

function GardenCanvas({ params, showDebug, goals }) {
  return (
    <Canvas
      shadows
      gl={{ 
        antialias: true,
        alpha: false
      }}
      style={{ 
        background: 'transparent',
        width: '100%',
        height: '100%',
        cursor: 'none'
      }}
      camera={{
        position: [0, 8, 15],
        fov: 45,
        near: 0.1,
        far: 100
      }}
    >
      <color attach="background" args={[params.fogColor]} />
      <GardenScene params={params} goals={goals} />
      <Environment 
        files="/HDRI/wildflower_field_1k.hdr"
        background={false}
        blur={0.3}
        intensity={0.5}
      />
    </Canvas>
  );
}

export default function Garden3D() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [goals, setGoals] = useState([]);
  const [params] = useState({
    // Ground parameters
    groundColor: '#4d4327',
    groundRoughness: 0.8,
    groundMetalness: 0.2,

    // Lighting parameters
    ambientIntensity: 1,
    lightX: 10,
    lightY: 10,
    lightZ: 5,
    lightIntensity: 2,

    // Stem parameters
    stemColor: '#2d5a27',
    stemHeight: 2,
    stemRoughness: 0.8,
    stemMetalness: 0.2,

    // Flower parameters
    flowerColor: '#ff69b4',
    flowerSize: 0.5,
    flowerRoughness: 0.5,
    flowerMetalness: 0.1,

    // Grass parameters
    bladeCount: 100000,
    waveSize: 1.0,
    waveSpeed: 0.5,
    windStrength: 0.8,
    windFrequency: 0.5,
    pathWidth: 2.0,
    pathDensity: 0.1,

    // Fog parameters
    fogColor: '#87CEEB', // Sky blue color
    fogNear: 15,
    fogFar: 50
  });

  const paneRef = useRef(null);
  const paramsRef = useRef(params);

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user?._id) return;
      
      try {
        setIsLoading(true);
        const response = await habitApi.getGoals(user._id);
        if (response?.data) {
          setGoals(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        toast.error('Failed to fetch goals for garden');
        console.error('Error fetching goals:', error);
        setGoals([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, [user?._id]);

  useEffect(() => {
    // Check if URL contains #debug
    setShowDebug(window.location.hash === '#debug');

    // Listen for hash changes
    const handleHashChange = () => {
      setShowDebug(window.location.hash === '#debug');
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (!paneRef.current && showDebug) {
      const pane = new Pane({
        container: document.getElementById('tweakpane-container'),
      });

      // Update parameters through ref to avoid re-renders
      const updateParams = (key, value) => {
        paramsRef.current = {
          ...paramsRef.current,
          [key]: value
        };
      };

      // Ground folder
      const groundFolder = pane.addFolder({
        title: 'Ground',
        expanded: false,
      });
      groundFolder.addBinding(paramsRef.current, 'groundColor', {
        label: 'Color',
      }).on('change', (ev) => updateParams('groundColor', ev.value));
      
      // Add other controls similarly...

      paneRef.current = pane;
    }

    return () => {
      if (paneRef.current) {
        paneRef.current.dispose();
        paneRef.current = null;
      }
    };
  }, [showDebug]);

  if (isLoading) {
    return (
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-b from-wax-flower-900 to-wax-flower-950 flex items-center justify-center">
        <div className="text-wax-flower-200">Loading garden...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-b from-wax-flower-900 to-wax-flower-950">
      {showDebug && (
        <>
          <div id="tweakpane-container" className="absolute top-4 right-4 z-10" />
          <div className="absolute top-4 left-4 z-10">
            <Stats />
          </div>
        </>
      )}
      <CustomCursor />
      <Suspense fallback={<LoadingFallback />}>
        <GardenCanvas params={paramsRef.current} showDebug={showDebug} goals={goals} />
      </Suspense>
    </div>
  );
} 