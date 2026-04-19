import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Sphere } from "@react-three/drei";
import * as THREE from "three";
import type { Mesh } from "three";

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
      <Sphere args={[1, 64, 64]} renderOrder={0}>
        <meshStandardMaterial
          map={dayMap}
          metalness={0.1}
          roughness={0.7}
          emissive="#000510"
          emissiveIntensity={0.3}
        />
      </Sphere>

      {/* Cloud layer */}
      <Sphere ref={cloudRef} args={[1.005, 64, 64]} renderOrder={1}>
        <meshStandardMaterial
          map={cloudMap}
          transparent
          opacity={0.3}
          depthWrite={false}
          depthTest={true}
        />
      </Sphere>

      {/* Inner atmosphere — tight crisp rim */}
      <Sphere args={[1.015, 64, 64]} renderOrder={2}>
        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={true}
        />
      </Sphere>

      {/* Outer atmosphere — soft wide halo */}
      <Sphere args={[1.04, 64, 64]} renderOrder={3}>
        <meshBasicMaterial
          color="#3a8fd4"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={true}
        />
      </Sphere>
    </group>
  );
}
