import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';

// Grid configuration
const GRID_SIZE = 3;
const PATCH_SIZE = 5;
const PATCH_GAP = 4;
const FLOWER_MARGIN = 0.75;
const CENTER_WEIGHT = 0.7;

// Calculate habit health score (0-1) - Keep for potential future use or complexity
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

// Get flower stage based on streak
const getFlowerStage = (streak = 0) => {
  if (streak >= 30) return 5; // Example thresholds
  if (streak >= 14) return 4;
  if (streak >= 7) return 3;
  if (streak >= 3) return 2;
  return 1; // Stage 1 for 0-2 day streak
};

// Calculate flower position within patch
const calculateFlowerPosition = (index, totalFlowers, patchSize) => {
  const radiusMax = (patchSize * 0.5) * FLOWER_MARGIN;
  
  // Use Fibonacci spiral (Phyllotaxis) for more even distribution
  const goldenAngle = Math.PI * (3.0 - Math.sqrt(5.0)); // ~137.5 degrees
  const i = index + 0.5; // Offset index slightly
  const angle = i * goldenAngle;
  const radius = radiusMax * Math.sqrt(i / totalFlowers); // Radius grows outwards
  
  return new THREE.Vector3(
    Math.cos(angle) * radius,
    0.15,
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

  // Calculate data for flowers within this patch
  const flowers = useMemo(() => {
    if (!goal?.habits) return [];
    console.log(`[Patch: ${goal.name}] Received ${goal.habits.length} habits.`); // Log habit count per goal
    
    const calculatedFlowers = goal.habits.map((habit, index) => {
      if (!habit) return null;
      console.log(`[Patch: ${goal.name}] Processing habit:`, habit?._id, `Streak: ${habit?.streak}`); // Log habit being processed
      
      const streak = habit.streak || 0;
      const stage = getFlowerStage(streak);
      const pos = calculateFlowerPosition(index, goal.habits.length, PATCH_SIZE);
      // Scale based on stage/streak (max scale capped)
      const baseScale = 0.32; // Increased base scale
      const maxScaleAddition = 0.38; // Increased max added scale for more variation
      const scaleMultiplier = baseScale + Math.min((streak / 30) * maxScaleAddition, maxScaleAddition);

      console.log(`[Patch: ${goal.name}] Habit ${habit?._id} -> Stage: ${stage}, Scale: ${scaleMultiplier.toFixed(2)}`); // Log calculated values

      return {
        position: pos,
        rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0), // Random Y rotation
        scale: scaleMultiplier,
        stage,
        id: habit._id || `habit-${index}`,
        name: habit.name || '',
        streak // Include streak for hover data
      };
    }).filter(Boolean); // Filter out any null results if habit was invalid

    console.log(`[Patch: ${goal.name}] Generated ${calculatedFlowers.length} flower data objects.`); // Log generated flower count
    return calculatedFlowers;
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

  // Handler for pointer over events on patch or flowers
  const handlePointerOver = (event) => {
    event.stopPropagation();
    const userData = event.object.userData;

    if (userData.type === 'patch') {
      onHover({
        type: 'patch',
        goalName: userData.goalName,
        goalId: userData.goalId,
        habitCount: userData.habitCount
      });
    } else if (userData.type === 'flower') {
       // Find the corresponding flower data by matching the parent group's position (approximately)
       const parentGroup = event.object.parent?.parent; // Go up levels to find the <group> holding the flower
       if (parentGroup) {
           const flowerData = flowers.find(f => 
               parentGroup.position.distanceTo(f.position) < 0.01 // Compare position
           );
           if (flowerData) {
             onHover({
               type: 'habit',
               habitName: flowerData.name,
               habitId: flowerData.id,
               goalName: goal.name, // Get goal name from prop
               goalId: goal._id,   // Get goal id from prop
               stage: flowerData.stage,
               streak: flowerData.streak
             });
           }
       }
    }
  };

  // Handler for pointer out events
  const handlePointerOut = (event) => {
    event.stopPropagation();
    onHover(null);
  };

  return (
    <group position={position}>
      {/* Render the patch base */}
      <primitive 
        object={patchModelWithEvents}
        scale={[2, 0.8, 2]}
        position={[0, 0.05, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      {/* Render flowers on top of the patch */}
      {flowers.map((flower) => (
        <group 
          key={flower.id}
          position={flower.position} // Position calculated relative to patch center
          rotation={flower.rotation}
          scale={flower.scale}
        >
          {/* Clone the appropriate model stage for each instance */}
          {useMemo(() => {
            const modelToClone = flowerModels[`stage${flower.stage}`];
            if (!modelToClone) return null; // Handle cases where model might not be loaded
            const clone = modelToClone.clone();
            // Add user data to children meshes for hover detection *on the clone*
            clone.traverse((child) => {
              if (child.isMesh) {
                child.userData = { type: 'flower' }; 
              }
            });
            return (
              <primitive 
                object={clone} 
                onPointerOver={handlePointerOver} // Add hover handlers to the flower model itself
                onPointerOut={handlePointerOut}
              />
            );
          }, [flower, flowerModels, handlePointerOver, handlePointerOut])}
        </group>
      ))}
    </group>
  );
}

// Main component to render all patches
export function Patches({ goals = [], onHover }) {
  const patches = useMemo(() => {
    const offset = (GRID_SIZE * (PATCH_SIZE + PATCH_GAP)) / 2 - (PATCH_SIZE + PATCH_GAP)/2; // Center grid
    
    return goals.slice(0, GRID_SIZE * GRID_SIZE).map((goal, index) => {
      if (!goal) return null;
      
      const row = Math.floor(index / GRID_SIZE);
      const col = index % GRID_SIZE;
      
      // Calculate position in the grid
      const x = (col * (PATCH_SIZE + PATCH_GAP)) - offset;
      const z = (row * (PATCH_SIZE + PATCH_GAP)) - offset;
        
        return {
        position: new THREE.Vector3(x, 0, z),
        goal
      };
    }).filter(Boolean);
  }, [goals]);

  // Removed console logs

  return (
    <group>
      {/* Map over calculated patch positions and render each Patch */}
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

// Preload models (essential for performance)
useGLTF.preload('/models/patch.glb');
useGLTF.preload('/models/stylized_flowers_stage1.glb');
useGLTF.preload('/models/stylized_flowers_stage2.glb');
useGLTF.preload('/models/stylized_flowers_stage3.glb');
useGLTF.preload('/models/stylized_flowers_stage4.glb');
useGLTF.preload('/models/stylized_flowers_stage5.glb');

// Export patch collision data for grass placement (if needed by Grass component)
export const getPatchCollisionData = () => {
  const patchData = [];
  const offset = (GRID_SIZE * (PATCH_SIZE + PATCH_GAP)) / 2 - (PATCH_SIZE + PATCH_GAP)/2;
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const x = (col * (PATCH_SIZE + PATCH_GAP)) - offset;
      const z = (row * (PATCH_SIZE + PATCH_GAP)) - offset;
      patchData.push({ 
        type: 'patch',
        position: [x, 0.1, z],
        radius: 4,
        scale: 1 // Or actual scale if needed elsewhere
      });
    }
  }
  return patchData;
}; 