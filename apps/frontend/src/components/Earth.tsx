import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Mesh } from "three";

// ⚡ Bolt: Pre-allocate a single base sphere geometry and reuse it across all
// Earth layers with different scales. This prevents creating 4 distinct
// SphereGeometries with 64x64 segments (16,384 vertices each), saving memory
// and speeding up instantiation.
const sharedEarthGeometry = new THREE.SphereGeometry(1, 64, 64);

export function Earth() {
  const cloudRef = useRef<Mesh>(null);

  const [dayMap, cloudMap] = useTexture([
    "/textures/2k_earth_daymap.jpg",
    "/textures/2k_earth_clouds.jpg",
  ]);

  useFrame((_, delta) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group>
      {/* Earth surface */}
      <mesh geometry={sharedEarthGeometry} scale={1} renderOrder={0}>
        <meshStandardMaterial
          map={dayMap}
          metalness={0.1}
          roughness={0.7}
          emissive="#000510"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Cloud layer */}
      <mesh ref={cloudRef} geometry={sharedEarthGeometry} scale={1.005} renderOrder={1}>
        <meshStandardMaterial
          map={cloudMap}
          transparent
          opacity={0.3}
          depthWrite={false}
          depthTest={true}
        />
      </mesh>

      {/* Inner atmosphere — tight crisp rim */}
      <mesh geometry={sharedEarthGeometry} scale={1.015} renderOrder={2}>
        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={true}
        />
      </mesh>

      {/* Outer atmosphere — soft wide halo */}
      <mesh geometry={sharedEarthGeometry} scale={1.04} renderOrder={3}>
        <meshBasicMaterial
          color="#3a8fd4"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={true}
        />
      </mesh>
    </group>
  );
}
