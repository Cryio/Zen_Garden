import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import grassVertShader from './shaders/grass.vert.glsl';
import grassFragShader from './shaders/grass.frag.glsl';

// Parameters
const PLANE_SIZE = 100;
const BLADE_WIDTH = 0.15;
const BLADE_HEIGHT = 0.8;
const BLADE_HEIGHT_VARIATION = 0.6;

function convertRange(val, oldMin, oldMax, newMin, newMax) {
  return (((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin;
}

function generateBlade(center, vArrOffset, uv) {
  const height = BLADE_HEIGHT + (Math.random() * BLADE_HEIGHT_VARIATION);

  const yaw = Math.random() * Math.PI * 2;
  const yawUnitVec = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw));

  // Simplified blade geometry - just one triangle
  const bl = new THREE.Vector3().addVectors(center, new THREE.Vector3().copy(yawUnitVec).multiplyScalar(BLADE_WIDTH / 2));
  const br = new THREE.Vector3().addVectors(center, new THREE.Vector3().copy(yawUnitVec).multiplyScalar(-BLADE_WIDTH / 2));
  const tc = new THREE.Vector3(center.x, center.y + height, center.z);

  // Vertex Colors
  const black = [0, 0, 0];
  const gray = [0.5, 0.5, 0.5];
  const white = [1.0, 1.0, 1.0];

  const verts = [
    { pos: bl.toArray(), uv: uv, color: black },
    { pos: br.toArray(), uv: uv, color: black },
    { pos: tc.toArray(), uv: uv, color: white }
  ];

  const indices = [
    vArrOffset,
    vArrOffset + 1,
    vArrOffset + 2
  ];

  return { verts, indices };
}

export function Grass({ params }) {
  const meshRef = useRef();
  const startTime = useRef(Date.now());
  const { camera, gl } = useThree();

  const { geometry, material } = useMemo(() => {
    const positions = [];
    const indices = [];
    const uvs = [];
    const colors = [];
    const timeOffsets = [];

    for (let i = 0; i < params.bladeCount; i++) {
      const VERTEX_COUNT = 3;
      const surfaceMin = PLANE_SIZE / 2 * -1;
      const surfaceMax = PLANE_SIZE / 2;
      const radius = PLANE_SIZE / 2;

      const r = radius * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);

      const pos = new THREE.Vector3(x, 0, y);
      const uv = [convertRange(pos.x, surfaceMin, surfaceMax, 0, 1), convertRange(pos.z, surfaceMin, surfaceMax, 0, 1)];
      const timeOffset = Math.random() * Math.PI * 2;

      const blade = generateBlade(pos, i * VERTEX_COUNT, uv);
      blade.verts.forEach(vert => {
        positions.push(...vert.pos);
        uvs.push(...vert.uv);
        colors.push(...vert.color);
        timeOffsets.push(timeOffset);
      });
      blade.indices.forEach(indice => indices.push(indice));
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    geometry.setAttribute('timeOffset', new THREE.BufferAttribute(new Float32Array(timeOffsets), 1));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.ShaderMaterial({
      vertexShader: grassVertShader,
      fragmentShader: grassFragShader,
      uniforms: {
        time: { value: 0 },
        waveSize: { value: params.waveSize },
        waveSpeed: { value: params.waveSpeed },
        windStrength: { value: params.windStrength },
        windFrequency: { value: params.windFrequency }
      },
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true
    });

    return { geometry, material };
  }, [params]);

  useEffect(() => {
    const handleResize = () => {
      camera.updateProjectionMatrix();
      gl.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [camera, gl]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const elapsedTime = Date.now() - startTime.current;
      material.uniforms.time.value = elapsedTime * 0.001; // Convert to seconds
    }
  });

  return (
    <>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={1.1}
        maxPolarAngle={1.45}
        enableDamping
        dampingFactor={0.1}
        target={[0, 0, 0]}
      />
      <mesh ref={meshRef} geometry={geometry} material={material} />
    </>
  );
}
