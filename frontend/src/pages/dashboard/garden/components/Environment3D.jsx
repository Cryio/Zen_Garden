import React, { useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Cloud } from '@react-three/drei';
import { Grass } from './Grass';
import { getPatchCollisionData } from './Patches';

function Tree({ position, scale = 1, rotation }) {
  const { scene } = useGLTF('/models/low_poly_tree.glb');
  
  const clonedScene = useMemo(() => {
    return scene.clone();
  }, [scene]);

  return (
    <group position={position} scale={scale} rotation-y={rotation}>
      <primitive object={clonedScene} />
    </group>
  );
}

function Rock({ position, scale = 1, rotation }) {
  const { scene } = useGLTF('/models/rocks_stylized.glb');
  
  const clonedScene = useMemo(() => {
    return scene.clone();
  }, [scene]);

  return (
    <group position={position} scale={scale} rotation-y={rotation}>
      <primitive object={clonedScene} />
    </group>
  );
}

function FlowerPool({ position, scale = 1, rotation }) {
  const { scene } = useGLTF('/models/flower_pool.glb');
  
  const clonedScene = useMemo(() => {
    return scene.clone();
  }, [scene]);

  return (
    <group position={position} scale={scale} rotation-y={rotation}>
      <primitive object={clonedScene} />
    </group>
  );
}

function Frog({ position, scale = 1, rotation }) {
  const { scene } = useGLTF('/models/cartoon_frog.glb');
  const groupRef = React.useRef();
  
  const clonedScene = useMemo(() => {
    return scene.clone();
  }, [scene]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Create a figure-8 pattern movement
    const x = Math.sin(t * 0.5) * 3;
    const z = Math.sin(t * 0.25) * 2;
    groupRef.current.position.x = x;
    groupRef.current.position.z = z;
    // Rotate frog to face movement direction
    groupRef.current.rotation.y = Math.atan2(
      Math.cos(t * 0.5) * 3,
      Math.cos(t * 0.25) * 2
    ) + Math.PI / 2;
  });

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Pre-load the models
useGLTF.preload('/models/low_poly_tree.glb');
useGLTF.preload('/models/cartoon_frog.glb');
useGLTF.preload('/models/rocks_stylized.glb');

export function Environment3D() {
  const elements = useMemo(() => {
    const items = [];
    const innerRadius = 20; // Radius for the inner circle (around patches)
    const outerRadius = 28; // Radius for the outer circle
    const count = {
      trees: 100,
      rocks: 30,
      clouds: 10
    };

    // Helper function to check for minimum distance between positions
    const isTooClose = (newPos, existingItems, minDistance) => {
      return existingItems.some(item => {
        const dx = item.position[0] - newPos[0];
        const dz = item.position[2] - newPos[2];
        return Math.sqrt(dx * dx + dz * dz) < minDistance;
      });
    };

    // Add trees in a circular pattern around the patches
    for (let i = 0; i < count.trees; i++) {
      let attempts = 0;
      let position;
      do {
        // Create a more natural distribution by varying the radius
        const angle = (i / count.trees) * Math.PI * 2;
        const radiusVariation = Math.random() * 0.3; // Add some randomness to the radius
        const r = innerRadius + (outerRadius - innerRadius) * (0.7 + radiusVariation);
        
        // Add some randomness to the angle for a more natural look
        const angleVariation = (Math.random() - 0.5) * 0.4;
        const x = Math.cos(angle + angleVariation) * r;
        const z = Math.sin(angle + angleVariation) * r;
        position = [x, 0, z];
        attempts++;
      } while (isTooClose(position, items, 3.5) && attempts < 10);

      const scale = 0.7 + Math.random() * 0.4; // Increased tree size range
      const rotation = Math.random() * Math.PI * 2;
      items.push({
        type: 'tree',
        position,
        scale,
        rotation,
        radius: 3.0 // Increased collision radius for larger trees
      });
    }

    // Add rocks in a more scattered pattern between trees
    for (let i = 0; i < count.rocks; i++) {
      let attempts = 0;
      let position;
      do {
        // Create a more scattered distribution
        const angle = (i / count.rocks) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
        const radiusVariation = Math.random() * 0.4;
        const r = innerRadius + (outerRadius - innerRadius) * (0.5 + radiusVariation);
        
        const x = Math.cos(angle) * r + (Math.random() - 0.5) * 3;
        const z = Math.sin(angle) * r + (Math.random() - 0.5) * 3;
        position = [x, 0, z];
        attempts++;
      } while (isTooClose(position, items, 1.5) && attempts < 10);

      const scale = 0.3 + Math.random() * 0.4; // More varied rock sizes
      const rotation = Math.random() * Math.PI * 2;
      items.push({
        type: 'rock',
        position,
        scale,
        rotation,
        radius: 1.2
      });
    }

    return items;
  }, []);

  // Grass parameters with collision data
  const grassParams = useMemo(() => {
    const collisionElements = [
      ...elements,
      ...getPatchCollisionData(),
      {
        type: 'frogArea',
        position: [0, 0, 0],
        radius: 4.0
      }
    ];

    return {
      bladeCount: 100000,
      waveSize: 0.5,
      waveSpeed: 0.5,
      windStrength: 0.5,
      windFrequency: 0.5,
      collisionElements
    };
  }, [elements]);

  // Generate cloud positions in a more scattered pattern
  const cloudPositions = useMemo(() => {
    const positions = [];
    const cloudRadius = 25; // Larger radius for clouds
    const heightRange = [3, 8]; // Cloud height range

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + Math.random() * 0.5;
      const radius = cloudRadius * (0.7 + Math.random() * 0.3);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);
      positions.push([x, y, z]);
    }
    return positions;
  }, []);

  return (
    <Suspense fallback={null}>
      <group>
        {elements.map((element, index) => {
          if (element.type === 'tree') {
            return (
              <Tree
                key={`tree-${index}`}
                position={element.position}
                scale={element.scale}
                rotation={element.rotation}
              />
            );
          } else if (element.type === 'rock') {
            return (
              <Rock
                key={`rock-${index}`}
                position={element.position}
                scale={element.scale}
                rotation={element.rotation}
              />
            );
          }
          return null;
        })}

        {/* Animated frog */}
        <Frog
          scale={1.5}
          rotation={0}
        />

        {/* Grass with collision avoidance */}
        <Grass params={grassParams} />

        {/* Scattered clouds */}
        {cloudPositions.map((position, index) => (
          <Cloud
            key={`cloud-${index}`}
            opacity={0.2 + Math.random() * 0.15}
            speed={0.08 + Math.random() * 0.07}
            width={6 + Math.random() * 6}
            depth={0.8 + Math.random() * 0.4}
            segments={8 + Math.floor(Math.random() * 7)}
            position={position}
          />
        ))}
      </group>
    </Suspense>
  );
} 