import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

// Grid configuration
const GRID_SIZE = 4; // 4x4 grid
const PATCH_SIZE = 4; // Size of each patch
const PATCH_GAP = 2; // Reduced gap between patches
const BRICK_HEIGHT = 0.1;
const BRICK_COLOR = '#8B4513';
const PATCH_BASE_COLOR = '#8B7355'; // Warm brown color for the patch base
const PATCH_HEIGHT = 0.3; // Height of the patch base

function GardenPatch({ position, size }) {
  const { scene: flowerModel } = useGLTF('/models/stylized_flowers_and_dandelions.glb');
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
      {/* Flower model */}
      <primitive 
        object={flowerModel.clone()} 
        position={[0, PATCH_HEIGHT + 0.1, 0]}
        scale={[5, 5, 5]}
        rotation={[0, Math.random() * Math.PI * 2, 0]}
      />
    </group>
  );
}

// Helper function to generate patch data
function generatePatchData() {
  const patches = [];
  const offset = (GRID_SIZE * (PATCH_SIZE + PATCH_GAP)) / 2;
  
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const x = (i * (PATCH_SIZE + PATCH_GAP)) - offset;
      const z = (j * (PATCH_SIZE + PATCH_GAP)) - offset;
      patches.push({ 
        position: [x, 0, z],
        type: 'patch',
        radius: PATCH_SIZE / 2 + 0.5, // Add a small buffer around the patch
        scale: 1
      });
    }
  }
  return patches;
}

export function Patches() {
  // Generate grid of patches
  const patches = useMemo(() => {
    return generatePatchData();
  }, []);

  return (
    <>
      {patches.map((patch, index) => (
        <GardenPatch
          key={index}
          position={patch.position}
          size={PATCH_SIZE}
        />
      ))}
    </>
  );
}

// Export the patch collision data generator
export const getPatchCollisionData = () => generatePatchData(); 