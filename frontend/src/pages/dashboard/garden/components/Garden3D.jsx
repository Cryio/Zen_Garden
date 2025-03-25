import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Pane } from 'tweakpane';
import { Grass } from './Grass';
import { ParallaxCamera } from './ParallaxCamera';
import { CustomCursor } from './CustomCursor';
import * as THREE from 'three';

function LoadingFallback() {
  return (
    <div className="w-full h-[600px] flex items-center justify-center bg-gradient-to-b from-wax-flower-900/50 to-wax-flower-950/50 rounded-lg">
      <div className="text-wax-flower-200">Loading garden...</div>
    </div>
  );
}

function GardenScene({ params }) {
  const sceneRef = useRef();
  const mousePosition = useRef({ x: 0.5, y: 0.5 });
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0));
  const currentPosition = useRef(new THREE.Vector3(0, 0, 0));

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
      const x = (mousePosition.current.x - 0.5) * 2; // -1 to 1
      const y = (mousePosition.current.y - 0.5) * 2; // -1 to 1
      
      // Scale the movement (more subtle values)
      targetPosition.current.set(
        x * 0.2, // Subtle movement
        y * 0.1, // Subtle movement
        0       // No forward/backward movement
      );
    } else {
      // Reset to default position when mouse is not available
      targetPosition.current.set(0, 0, 0);
    }

    // Smooth interpolation
    currentPosition.current.lerp(targetPosition.current, delta * 1.5);
    sceneRef.current.position.copy(currentPosition.current);
  });

  return (
    <>
      <group ref={sceneRef}>
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial 
            color={params.groundColor}
            roughness={params.groundRoughness}
            metalness={params.groundMetalness}
            side={2}
          />
        </mesh>

        {/* Grass */}
        <Grass params={params} />

        {/* Lighting */}
        <ambientLight intensity={params.ambientIntensity} />
        <directionalLight
          position={[params.lightX, params.lightY, params.lightZ]}
          intensity={params.lightIntensity}
          castShadow
        />

        {/* Flower */}
        <group position={[0, 0, 0]}>
          {/* Stem */}
          <mesh castShadow>
            <cylinderGeometry args={[0.1, 0.1, params.stemHeight, 8]} />
            <meshStandardMaterial 
              color={params.stemColor}
              roughness={params.stemRoughness}
              metalness={params.stemMetalness}
            />
          </mesh>
          {/* Flower Head */}
          <mesh position={[0, params.stemHeight, 0]} castShadow>
            <sphereGeometry args={[params.flowerSize, 16, 16]} />
            <meshStandardMaterial 
              color={params.flowerColor}
              roughness={params.flowerRoughness}
              metalness={params.flowerMetalness}
            />
          </mesh>
        </group>
      </group>
      <ParallaxCamera />
    </>
  );
}

function GardenCanvas({ params }) {
  return (
    <Canvas
      shadows
      gl={{ 
        antialias: true,
        alpha: true
      }}
      style={{ 
        background: '#1a1a1a',
        width: '100%',
        height: '100%',
        cursor: 'none' // Hide the cursor but allow mouse events
      }}
    >
      <GardenScene params={params} />
      <Environment preset="sunset" background={false} />
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
    bladeCount: 500000,
    waveSize: 1.0, // Reduced from 3.0 for more subtle movement
    waveSpeed: 0.5, // Slower wave speed for more natural movement
    windStrength: 0.8, // Reduced wind strength for gentler movement
    windFrequency: 0.5, // Lower frequency for more natural wind patterns
    pathWidth: 2.0,
    pathDensity: 0.1
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
      {showDebug && <div id="tweakpane-container" className="absolute top-4 right-4 z-10" />}
      <CustomCursor />
      <Suspense fallback={<LoadingFallback />}>
        <GardenCanvas params={params} />
      </Suspense>
    </div>
  );
} 