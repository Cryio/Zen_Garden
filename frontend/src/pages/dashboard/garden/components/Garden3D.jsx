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

function LoadingFallback() {
  return (
    <div className="w-full h-[600px] flex items-center justify-center bg-gradient-to-b from-wax-flower-900/50 to-wax-flower-950/50 rounded-lg">
      <div className="text-wax-flower-200">Loading garden...</div>
    </div>
  );
}

function GardenScene({ params }) {
  const sceneRef = useRef();
  const groundRef = useRef();
  const mousePosition = useRef({ x: 0.5, y: 0.5 });
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0));
  const currentPosition = useRef(new THREE.Vector3(0, 0, 0));
  const { scene } = useThree();

  // Generate grid of patches
  const patches = useMemo(() => {
    const patches = [];
    const offset = (GRID_SIZE * PATCH_SIZE) / 2;
    
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const x = (i * PATCH_SIZE) - offset;
        const z = (j * PATCH_SIZE) - offset;
        const color = `hsl(${(i * j * 360) / (GRID_SIZE * GRID_SIZE)}, 70%, 50%)`;
        patches.push({ position: [x, 0, z], color });
      }
    }
    return patches;
  }, []);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const rect = event.target.getBoundingClientRect();
      mousePosition.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height
      };
    };

    const handleMouseLeave = () => {
      mousePosition.current = null;
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  useFrame((state, delta) => {
    if (mousePosition.current) {
      const x = (mousePosition.current.x - 0.5) * 2;
      const y = (mousePosition.current.y - 0.5) * 2;
      
      targetPosition.current.set(
        x * 0.2,
        y * 0.1,
        0
      );
    } else {
      targetPosition.current.set(0, 0, 0);
    }

    currentPosition.current.lerp(targetPosition.current, delta * 1.5);
    sceneRef.current.position.copy(currentPosition.current);
    
    // Update ground position to follow camera (create infinite ground effect)
    if (groundRef.current) {
      const cameraPos = state.camera.position;
      groundRef.current.position.x = cameraPos.x;
      groundRef.current.position.z = cameraPos.z;
    }
  });

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
        <Patches goals={mockGoals} />

        {/* Lighting */}
        <ambientLight intensity={params.ambientIntensity} />
        <directionalLight
          position={[params.lightX, params.lightY, params.lightZ]}
          intensity={params.lightIntensity}
          castShadow
        />
      </group>
      <ParallaxCamera />
    </>
  );
}

function GardenCanvas({ params, showDebug }) {
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
        position: [0, 5, 10],
        fov: 50,
        near: 0.1,
        far: 100
      }}
    >
      <color attach="background" args={[params.fogColor]} />
      <fog attach="fog" args={[params.fogColor, 10, 35]} />
      <GardenScene params={params} />
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
  const [isLoading, setIsLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [params, setParams] = useState({
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

      // Ground folder
      const groundFolder = pane.addFolder({
        title: 'Ground',
        expanded: false,
      });
      groundFolder.addBinding(params, 'groundColor', {
        label: 'Color',
      });
      groundFolder.addBinding(params, 'groundRoughness', {
        label: 'Roughness',
        min: 0,
        max: 1,
        step: 0.1,
      });


      // Lighting folder
      const lightFolder = pane.addFolder({
        title: 'Lighting',
        expanded: false,
      });
      lightFolder.addBinding(params, 'ambientIntensity', {
        label: 'Ambient Intensity',
        min: 0,
        max: 2,
        step: 0.1,
      });
      lightFolder.addBinding(params, 'lightX', {
        label: 'Light X',
        min: -20,
        max: 20,
        step: 0.5,
      });
      lightFolder.addBinding(params, 'lightY', {
        label: 'Light Y',
        min: -20,
        max: 20,
        step: 0.5,
      });
      lightFolder.addBinding(params, 'lightZ', {
        label: 'Light Z',
        min: -20,
        max: 20,
        step: 0.5,
      });
      lightFolder.addBinding(params, 'lightIntensity', {
        label: 'Light Intensity',
        min: 0,
        max: 5,
        step: 0.1,
      });

      // Grass folder
      const grassFolder = pane.addFolder({
        title: 'Grass',
        expanded: false,
      });

      // Add blade count control with presets
      const bladeCountInput = grassFolder.addBinding(params, 'bladeCount', {
        label: 'Blade Count',
        min: 1000,
        max: 1000000,
        step: 1000,
      });
      
      // Add preset buttons
      grassFolder.addButton({
        title: 'Low Density',
        label: 'Low',
      }).on('click', () => {
        params.bladeCount = 10000;
        bladeCountInput.refresh();
      });
      
      grassFolder.addButton({
        title: 'Medium Density',
        label: 'Medium',
      }).on('click', () => {
        params.bladeCount = 100000;
        bladeCountInput.refresh();
      });
      
      grassFolder.addButton({
        title: 'High Density',
        label: 'High',
      }).on('click', () => {
        params.bladeCount = 500000;
        bladeCountInput.refresh();
      });

      // Existing grass controls
      grassFolder.addBinding(params, 'waveSize', {
        label: 'Wave Size',
        min: 0,
        max: 20,
        step: 0.5,
      });
      grassFolder.addBinding(params, 'waveSpeed', {
        label: 'Wave Speed',
        min: 100,
        max: 1000,
        step: 50,
      });
      grassFolder.addBinding(params, 'windStrength', {
        label: 'Wind Strength',
        min: 0,
        max: 2,
        step: 0.1,
      });
      grassFolder.addBinding(params, 'windFrequency', {
        label: 'Wind Frequency',
        min: 0,
        max: 2,
        step: 0.1,
      });

      // Fog folder
      const fogFolder = pane.addFolder({
        title: 'Fog',
        expanded: false,
      });
      fogFolder.addBinding(params, 'fogColor', {
        label: 'Color',
      });
      fogFolder.addBinding(params, 'fogNear', {
        label: 'Near',
        min: 1,
        max: 20,
        step: 0.5,
      });
      fogFolder.addBinding(params, 'fogFar', {
        label: 'Far',
        min: 20,
        max: 100,
        step: 1,
      });

      // Add change handlers
      pane.on('change', (ev) => {
        setParams(prev => ({
          ...prev,
          [ev.target.key]: ev.value
        }));
      });

      paneRef.current = pane;
    }

    return () => {
      if (paneRef.current) {
        paneRef.current.dispose();
        paneRef.current = null;
      }
    };
  }, [showDebug]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden bg-gradient-to-b from-wax-flower-900 to-wax-flower-950">
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
        <GardenCanvas params={params} showDebug={showDebug} />
      </Suspense>
    </div>
  );
} 