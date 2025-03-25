import React, { useEffect, useRef } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ParallaxCamera() {
  const cameraRef = useRef();
  const mousePosition = useRef({ x: 0.5, y: 0.5 });
  const targetCameraPosition = useRef(new THREE.Vector3(5, 5, 5));
  const currentCameraPosition = useRef(new THREE.Vector3(5, 5, 5));

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
      const x = (mousePosition.current.x - 0.5) * 20; // -5 to 5
      const y = (mousePosition.current.y - 0.5) * 20; // -5 to 5
      
      // Calculate camera movement (opposite direction for parallax)
      targetCameraPosition.current.set(
        5 - x * 0.6, // Subtle parallax effect
        5 - y * 0.2, // Subtle parallax effect
        5           // Keep camera at same distance
      );
    } else {
      // Reset to default position when mouse is not available
      targetCameraPosition.current.set(5, 5, 5);
    }

    // Smooth interpolation for camera
    currentCameraPosition.current.lerp(targetCameraPosition.current, delta * 1.5);
    if (cameraRef.current) {
      cameraRef.current.position.copy(currentCameraPosition.current);
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[5, 5, 5]} fov={75} />;
} 