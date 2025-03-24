import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Sky } from '@react-three/drei';

function LoadingFallback() {
  return (
    <div className="w-full h-[600px] flex items-center justify-center bg-gradient-to-b from-wax-flower-900 to-wax-flower-950 rounded-lg">
      <div className="text-wax-flower-200">Loading garden...</div>
    </div>
  );
}

function GardenScene() {
  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#2d5a27"
          roughness={0.8}
          metalness={0.2}
          side={2}
        />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={1} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={2}
        castShadow
      />

      {/* Example Flower */}
      <group position={[0, 0, 0]}>
        {/* Stem */}
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
          <meshStandardMaterial 
            color="#2d5a27"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
        {/* Flower Head */}
        <mesh position={[0, 2, 0]} castShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial 
            color="#ff69b4"
            roughness={0.5}
            metalness={0.1}
          />
        </mesh>
      </group>
    </>
  );
}

export default function Garden3D() {
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-gradient-to-b from-wax-flower-900 to-wax-flower-950">
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
        <GardenScene />
        <Environment preset="sunset" background={false} />
      </Canvas>
    </div>
  );
} 