import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { Pane } from 'tweakpane';

function LoadingFallback() {
  return (
    <div className="w-full h-[600px] flex items-center justify-center bg-gradient-to-b from-wax-flower-900 to-wax-flower-950 rounded-lg">
      <div className="text-wax-flower-200">Loading garden...</div>
    </div>
  );
}

function GardenScene({ params }) {
  return (
    <>
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

      {/* Lighting */}
      <ambientLight intensity={params.ambientIntensity} />
      <directionalLight
        position={[params.lightX, params.lightY, params.lightZ]}
        intensity={params.lightIntensity}
        castShadow
      />

      {/* Example Flower */}
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
    </>
  );
}

export default function Garden3D() {
  const [params, setParams] = useState({
    // Ground parameters
    groundColor: '#2d5a27',
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
  });

  const paneRef = useRef(null);

  useEffect(() => {
    if (!paneRef.current) {
      const pane = new Pane({
        container: document.getElementById('tweakpane-container'),
      });

      // Ground folder
      const groundFolder = pane.addFolder({
        title: 'Ground',
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
      groundFolder.addBinding(params, 'groundMetalness', {
        label: 'Metalness',
        min: 0,
        max: 1,
        step: 0.1,
      });

      // Lighting folder
      const lightFolder = pane.addFolder({
        title: 'Lighting',
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

      // Stem folder
      const stemFolder = pane.addFolder({
        title: 'Stem',
      });
      stemFolder.addBinding(params, 'stemColor', {
        label: 'Color',
      });
      stemFolder.addBinding(params, 'stemHeight', {
        label: 'Height',
        min: 0.5,
        max: 5,
        step: 0.1,
      });
      stemFolder.addBinding(params, 'stemRoughness', {
        label: 'Roughness',
        min: 0,
        max: 1,
        step: 0.1,
      });
      stemFolder.addBinding(params, 'stemMetalness', {
        label: 'Metalness',
        min: 0,
        max: 1,
        step: 0.1,
      });

      // Flower folder
      const flowerFolder = pane.addFolder({
        title: 'Flower',
      });
      flowerFolder.addBinding(params, 'flowerColor', {
        label: 'Color',
      });
      flowerFolder.addBinding(params, 'flowerSize', {
        label: 'Size',
        min: 0.1,
        max: 2,
        step: 0.1,
      });
      flowerFolder.addBinding(params, 'flowerRoughness', {
        label: 'Roughness',
        min: 0,
        max: 1,
        step: 0.1,
      });
      flowerFolder.addBinding(params, 'flowerMetalness', {
        label: 'Metalness',
        min: 0,
        max: 1,
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
  }, []);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden bg-gradient-to-b from-wax-flower-900 to-wax-flower-950">
      <div id="tweakpane-container" className="absolute top-4 right-4 z-10" />
      <Canvas
        shadows
        camera={{ position: [5, 5, 5], fov: 75 }}
        gl={{ 
          antialias: true,
          alpha: true
        }}
        style={{ 
          background: '#1a1a1a',
          width: '100%',
          height: '100%'
        }}
      >
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={10}
          maxPolarAngle={Math.PI / 2}
        />
        <GardenScene params={params} />
        <Environment preset="sunset" background={false} />
      </Canvas>
    </div>
  );
} 