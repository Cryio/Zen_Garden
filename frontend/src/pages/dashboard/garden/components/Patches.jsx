import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';

// Grid configuration
const GRID_SIZE = 3;
const PATCH_SIZE = 3;
const PATCH_GAP = 4;
const FLOWER_MARGIN = 0.8;
const CENTER_WEIGHT = 0.7;

// Calculate habit health score (0-1)
const calculateHabitHealth = (habit) => {
  if (!habit?.completionHistory || !habit?.frequency) return 0;
  
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Get required completions based on frequency
  const getRequiredCompletions = () => {
    switch (habit.frequency) {
      case 'daily': return 7; // Last 7 days
      case 'weekly': return 4; // Last 4 weeks
      case 'monthly': return 3; // Last 3 months
      default: return 7;
    }
  };

  // Calculate streak based on frequency
  let streak = 0;
  let currentStreak = 0;
  const requiredCompletions = getRequiredCompletions();
  
  // If completed today, start with 1
  const isCompletedToday = habit.lastCompleted && 
    new Date(habit.lastCompleted).toISOString().split('T')[0] === today;
  
  if (isCompletedToday) {
    currentStreak = 1;
    streak = 1;
  }

  // Check completion history
  for (let i = 0; i < Math.min(habit.completionHistory.length, requiredCompletions); i++) {
    if (habit.completionHistory[i]) {
      if (i !== 0 || !isCompletedToday) { // Don't double count today
        currentStreak++;
        streak = Math.max(streak, currentStreak);
      }
    } else {
      currentStreak = 0;
    }
  }
  
  // Calculate completion rate over the relevant period
  const relevantHistory = habit.completionHistory.slice(0, requiredCompletions);
  const totalCompletions = relevantHistory.filter(Boolean).length + (isCompletedToday ? 1 : 0);
  const completionRate = totalCompletions / requiredCompletions;
  
  // Calculate recency score
  const daysSinceLastCompletion = habit.lastCompleted 
    ? (now - new Date(habit.lastCompleted)) / (1000 * 60 * 60 * 24)
    : Infinity;
    
  // Adjust recency threshold based on frequency
  const recencyThreshold = habit.frequency === 'daily' ? 2 : 
                          habit.frequency === 'weekly' ? 8 : 31;
  
  const recencyScore = Math.max(0, 1 - (daysSinceLastCompletion / recencyThreshold));
  
  // Weight the components based on frequency
  const weights = {
    streak: habit.frequency === 'daily' ? 0.4 : 0.3,
    completion: 0.4,
    recency: habit.frequency === 'daily' ? 0.2 : 0.3
  };
  
  return Math.min(1, Math.max(0, 
    (streak / requiredCompletions) * weights.streak + 
    completionRate * weights.completion + 
    recencyScore * weights.recency
  ));
};

// Get flower stage based on habit health
const getFlowerStage = (health) => {
  if (health >= 0.8) return 5;
  if (health >= 0.6) return 4;
  if (health >= 0.4) return 3;
  if (health >= 0.2) return 2;
  return 1;
};

// Calculate flower position within patch
const calculateFlowerPosition = (index, totalFlowers, patchSize) => {
  const angle = (index / totalFlowers) * Math.PI * 2;
  const radiusMax = (patchSize * 0.5) * FLOWER_MARGIN;
  const radiusBase = Math.sqrt(index / totalFlowers);
  const radius = radiusMax * (radiusBase * (1 - CENTER_WEIGHT) + (radiusBase * radiusBase) * CENTER_WEIGHT);
  
  return new THREE.Vector3(
    Math.cos(angle) * radius,
    0.25, // Elevate flowers above the patch surface
    Math.sin(angle) * radius
  );
};

function Patch({ goal, position, onHover }) {
  const { scene: patchModel } = useGLTF('/models/patch.glb');
  const flowerModels = useMemo(() => ({
    stage1: useGLTF('/models/stylized_flowers_stage1.glb').scene,
    stage2: useGLTF('/models/stylized_flowers_stage2.glb').scene,
    stage3: useGLTF('/models/stylized_flowers_stage3.glb').scene,
    stage4: useGLTF('/models/stylized_flowers_stage4.glb').scene,
    stage5: useGLTF('/models/stylized_flowers_stage5.glb').scene,
  }), []);

  const flowers = useMemo(() => {
    if (!goal?.habits) return [];
    
    return goal.habits.map((habit, index) => {
      if (!habit) return null;
      
      const health = calculateHabitHealth(habit);
      const stage = getFlowerStage(health);
      const pos = calculateFlowerPosition(index, goal.habits.length, PATCH_SIZE);
      
      return {
        position: pos,
        rotation: new THREE.Euler(0, 0, 0),
        scale: 0.15 + (health * 0.1),
        stage,
        id: habit._id || `habit-${index}`,
        name: habit.name || '',
        health
      };
    }).filter(Boolean);
  }, [goal]);

  // Create a clone of the patch model with proper event handling
  const patchModelWithEvents = useMemo(() => {
    const clone = patchModel.clone();
    clone.traverse((child) => {
      if (child.isMesh) {
        child.userData = {
          type: 'patch',
          goalName: goal.name,
          goalId: goal._id,
          habitCount: goal.habits?.length || 0
        };
      }
    });
    return clone;
  }, [patchModel, goal]);

  // Create clones of flower models with proper event handling
  const flowerModelsWithEvents = useMemo(() => {
    const models = {};
    Object.entries(flowerModels).forEach(([stage, model]) => {
      const clone = model.clone();
      clone.traverse((child) => {
        if (child.isMesh) {
          child.userData = { type: 'flower' };
        }
      });
      models[stage] = clone;
    });
    return models;
  }, [flowerModels]);

  const handlePointerOver = (event) => {
    event.stopPropagation();
    const userData = event.object.userData;
    
    if (userData.type === 'patch') {
      onHover({
        type: 'patch',
        goalName: goal.name,
        goalId: goal._id,
        habitCount: goal.habits?.length || 0
      });
    } else if (userData.type === 'flower') {
      const flower = flowers.find(f => 
        f.position.equals(event.object.parent.position) ||
        f.position.distanceTo(event.object.parent.position) < 0.1
      );
      if (flower) {
        onHover({
          type: 'habit',
          habitName: flower.name,
          habitId: flower.id,
          goalName: goal.name,
          goalId: goal._id,
          stage: flower.stage,
          health: flower.health
        });
      }
    }
  };

  const handlePointerOut = (event) => {
    event.stopPropagation();
    onHover(null);
  };

  return (
    <group position={position}>
      <primitive 
        object={patchModelWithEvents}
        scale={[PATCH_SIZE * 0.4, 0.8, PATCH_SIZE * 0.4]}
        position={[0, 0.2, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      {flowers.map((flower) => (
        <group 
          key={flower.id}
          position={flower.position}
          rotation={flower.rotation}
          scale={flower.scale}
        >
          <primitive 
            object={flowerModelsWithEvents[`stage${flower.stage}`]}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          />
        </group>
      ))}
    </group>
  );
}

export function Patches({ goals = [], onHover }) {
  const patches = useMemo(() => {
    const offset = (GRID_SIZE * (PATCH_SIZE + PATCH_GAP)) / 2;
    return goals.slice(0, GRID_SIZE * GRID_SIZE).map((goal, index) => {
      if (!goal) return null;
      
      const row = Math.floor(index / GRID_SIZE);
      const col = index % GRID_SIZE;
      const x = (col * (PATCH_SIZE + PATCH_GAP)) - offset;
      const z = (row * (PATCH_SIZE + PATCH_GAP)) - offset;
      
      return {
        position: new THREE.Vector3(x, 0, z),
        goal
      };
    }).filter(Boolean);
  }, [goals]);

  return (
    <group>
      {patches.map((patch, index) => (
        <Patch 
          key={patch.goal._id || `goal-${index}`}
          goal={patch.goal}
          position={patch.position}
          onHover={onHover}
        />
      ))}
    </group>
  );
}

// Preload models
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