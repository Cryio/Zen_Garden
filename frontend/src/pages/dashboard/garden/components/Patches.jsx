import React, { useMemo } from 'react';
import * as THREE from 'three';

// Grid configuration
const GRID_SIZE = 10; // 4x4 grid
const PATCH_SIZE = 8; // Size of each patch
const PATCH_GAP = 5; // Gap between patches
const BRICK_HEIGHT = 0.1;
const BRICK_COLOR = '#8B4513';
const PATCH_BASE_COLOR = '#8B7355'; // Warm brown color for the patch base
const PATCH_HEIGHT = 0.3; // Height of the patch base

function GardenPatch({ position, size, color }) {
  const brickGeometry = new THREE.BoxGeometry(size, BRICK_HEIGHT, size);
  const patchGeometry = new THREE.BoxGeometry(size - 0.2, PATCH_HEIGHT, size - 0.2); // Slightly smaller than brick perimeter
  const brickMaterial = new THREE.MeshPhongMaterial({
    color: BRICK_COLOR,
    shininess: 30,
    specular: 0x333333
  });
  const patchMaterial = new THREE.MeshPhongMaterial({
    color: PATCH_BASE_COLOR,
    shininess: 20,
    specular: 0x222222
  });

  return (
    <group position={position}>
      {/* Brick perimeter */}
      <mesh
        geometry={brickGeometry}
        material={brickMaterial}
        position={[0, -0.1, 0]}
      />
      {/* Patch base */}
      <mesh
        geometry={patchGeometry}
        material={patchMaterial}
        position={[0, PATCH_HEIGHT / 2 - 0.1, 0]}
      />
      {/* Flower */}
      <mesh position={[0, PATCH_HEIGHT + 0.1, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshPhongMaterial
          color={color}
          shininess={100}
          specular={0xffffff}
        />
      </mesh>
      {/* Flower stem */}
      <mesh position={[0, PATCH_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        <meshPhongMaterial
          color="#2d5a27"
          shininess={30}
          specular={0x333333}
        />
      </mesh>
    </group>
  );
}

export function Patches() {
  // Generate grid of patches
  const patches = useMemo(() => {
    const patches = [];
    const offset = (GRID_SIZE * (PATCH_SIZE + PATCH_GAP)) / 2;
    
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const x = (i * (PATCH_SIZE + PATCH_GAP)) - offset;
        const z = (j * (PATCH_SIZE + PATCH_GAP)) - offset;
        // More vibrant colors for the flowers
        const color = `hsl(${(i * j * 360) / (GRID_SIZE * GRID_SIZE)}, 80%, 60%)`;
        patches.push({ position: [x, 0, z], color });
      }
    }
    return patches;
  }, []);

  return (
    <>
      {patches.map((patch, index) => (
        <GardenPatch
          key={index}
          position={patch.position}
          size={PATCH_SIZE}
          color={patch.color}
        />
      ))}
    </>
  );
} 