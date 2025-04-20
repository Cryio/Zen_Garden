import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

// Grid configuration
const GRID_SIZE = 3; // 3x3 grid for better spacing
const PATCH_SIZE = 3; // Increased patch size
const PATCH_GAP = 4; // Increased gap between patches

// Calculate habit performance score (0-1)
const calculateHabitScore = (habit) => {
  if (!habit.lastCompleted) return 0;
  
  const now = new Date();
  const lastCompleted = new Date(habit.lastCompleted);
  const daysSinceCompletion = (now - lastCompleted) / (1000 * 60 * 60 * 24);
  
  // Score based on frequency and completion
  switch (habit.frequency) {
    case 'daily':
      return daysSinceCompletion <= 1 ? 1 : Math.max(0, 1 - (daysSinceCompletion - 1) * 0.2);
    case 'weekly':
      return daysSinceCompletion <= 7 ? 1 : Math.max(0, 1 - (daysSinceCompletion - 7) * 0.1);
    case 'monthly':
      return daysSinceCompletion <= 30 ? 1 : Math.max(0, 1 - (daysSinceCompletion - 30) * 0.05);
    default:
      return 0;
  }
};

// Get flower stage based on habit score
const getFlowerStage = (score) => {
  if (score >= 0.8) return 5;
  if (score >= 0.6) return 4;
  if (score >= 0.4) return 3;
  if (score >= 0.2) return 2;
  return 1;
};

export function Patches({ goals = [] }) {
  const { scene: patchModel } = useGLTF('/models/patch.glb');
  
  // Load all flower stage models
  const flowerModels = useMemo(() => ({
    stage1: useGLTF('/models/stylized_flowers_stage1.glb').scene,
    stage2: useGLTF('/models/stylized_flowers_stage2.glb').scene,
    stage3: useGLTF('/models/stylized_flowers_stage3.glb').scene,
    stage4: useGLTF('/models/stylized_flowers_stage4.glb').scene,
    stage5: useGLTF('/models/stylized_flowers_stage5.glb').scene,
  }), []);

  // Generate patches with goals and habits
  const patches = useMemo(() => {
    const patches = [];
    const offset = (GRID_SIZE * (PATCH_SIZE + PATCH_GAP)) / 2;
    
    goals.forEach((goal, index) => {
      if (index >= GRID_SIZE * GRID_SIZE) return; // Skip if we run out of patches
      
      const row = Math.floor(index / GRID_SIZE);
      const col = index % GRID_SIZE;
      const x = (col * (PATCH_SIZE + PATCH_GAP)) - offset;
      const z = (row * (PATCH_SIZE + PATCH_GAP)) - offset;
      
      // Calculate flower positions for habits
      const flowerPositions = goal.habits.map((habit, hIndex) => {
        const score = calculateHabitScore(habit);
        const stage = getFlowerStage(score);
        
        // Calculate position in a circular pattern
        const angle = (hIndex / goal.habits.length) * Math.PI * 2;
        const radius = PATCH_SIZE * 0.3; // Adjust radius based on patch size
        const px = Math.cos(angle) * radius;
        const pz = Math.sin(angle) * radius;
        
        return {
          pos: [px, 0, pz],
          rot: Math.random() * Math.PI * 2,
          scale: 0.15 + (score * 0.1), // Size increases with better performance
          stage,
          habitId: habit.id,
          habitName: habit.name
        };
      });

      patches.push({ 
        position: [x, 0, z],
        rotation: [0, Math.random() * Math.PI * 2, 0],
        flowerPositions,
        goalId: goal.id,
        goalName: goal.name
      });
    });
    
    return patches;
  }, [goals]);

  return (
    <>
      {patches.map((patch, index) => (
        <group key={patch.goalId || index} position={patch.position} rotation={patch.rotation}>
          {/* Base patch */}
          <primitive 
            object={patchModel.clone()} 
            scale={[PATCH_SIZE * 0.4, 0.8, PATCH_SIZE * 0.4]}
            position={[0, 0.2, 0]}
          />
          
          {/* Flowers representing habits */}
          {patch.flowerPositions.map((flower, flowerIndex) => (
            <group 
              key={flower.habitId || flowerIndex}
              position={[
                flower.pos[0] * PATCH_SIZE, 
                0.25, // Height above patch
                flower.pos[2] * PATCH_SIZE
              ]}
              rotation={[0, flower.rot, 0]}
              scale={[flower.scale, flower.scale, flower.scale]}
            >
              <primitive 
                object={flowerModels[`stage${flower.stage}`].clone()}
                // Add metadata for interactivity
                userData={{
                  type: 'habit',
                  habitId: flower.habitId,
                  habitName: flower.habitName,
                  goalId: patch.goalId,
                  goalName: patch.goalName,
                  stage: flower.stage
                }}
              />
            </group>
          ))}
        </group>
      ))}
    </>
  );
}

// Preload all models
useGLTF.preload('/models/patch.glb');
useGLTF.preload('/models/stylized_flowers_stage1.glb');
useGLTF.preload('/models/stylized_flowers_stage2.glb');
useGLTF.preload('/models/stylized_flowers_stage3.glb');
useGLTF.preload('/models/stylized_flowers_stage4.glb');
useGLTF.preload('/models/stylized_flowers_stage5.glb');

// Export patch collision data for grass placement
export const getPatchCollisionData = () => {
  const patches = [];
  const offset = (GRID_SIZE * (PATCH_SIZE + PATCH_GAP)) / 2;
  
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const x = (i * (PATCH_SIZE + PATCH_GAP)) - offset;
      const z = (j * (PATCH_SIZE + PATCH_GAP)) - offset;
      patches.push({ 
        type: 'patch',
        position: [x, 0.1, z],
        radius: PATCH_SIZE / 2 + 1,
        scale: 1
      });
    }
  }
  return patches;
}; 