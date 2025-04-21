import React, { useEffect, useRef } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Smooth easing function
const smoothStep = (t) => t * t * (3 - 2 * t);

export function ParallaxCamera() {
  const cameraRef = useRef();
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));
  const currentRef = useRef(new THREE.Vector3(0, 0, 0));
  const lastTimeRef = useRef(0);
  const movementSpeed = 0.5; // Slower movement speed

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const timeDelta = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // Calculate target position to focus on patches
    const patchesCenter = new THREE.Vector3(0, 0, 0);
    targetRef.current.copy(patchesCenter);

    // Smooth interpolation with easing
    const t = smoothStep(Math.min(1, delta * movementSpeed));
    currentRef.current.lerp(targetRef.current, t);
    
    // Smooth camera lookAt
    const lookAtTarget = new THREE.Vector3();
    lookAtTarget.copy(currentRef.current);
    lookAtTarget.y += 0.5; // Slightly above the center for better view
    state.camera.lookAt(lookAtTarget);

    // Smoother camera movement
    const offset = new THREE.Vector3(
      Math.sin(time * 0.05) * 0.3, // Slower, smaller movement
      Math.sin(time * 0.025) * 0.1, // Slower, smaller movement
      Math.cos(time * 0.05) * 0.3  // Slower, smaller movement
    );
    
    // Apply movement with smooth interpolation
    const currentPosition = state.camera.position.clone();
    const targetPosition = currentPosition.clone().add(offset.multiplyScalar(delta));
    state.camera.position.lerp(targetPosition, smoothStep(Math.min(1, delta * 0.5)));
  });

  return null;
} 