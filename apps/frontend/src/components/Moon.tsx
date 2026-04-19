import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Sphere } from "@react-three/drei";
import { MOON_RADIUS_KM, EARTH_RADIUS_KM } from "@rtmab/shared";
import { useMoonPosition } from "../hooks/useMoonPosition";
import { useTimeline } from "../hooks/useTimeline";
import * as THREE from "three";
import type { Group } from "three";

const MOON_RADIUS = MOON_RADIUS_KM / EARTH_RADIUS_KM;

export function Moon() {
  const groupRef = useRef<Group>(null);
  const moonMap = useTexture("/textures/2k_moon.jpg");
  const { getPositionAt } = useMoonPosition();
  const currentTime = useTimeline((s) => s.currentTime);

  useFrame(() => {
    if (!groupRef.current) return;
    const pos = getPositionAt(currentTime);
    groupRef.current.position.copy(pos);
  });

  return (
    <group ref={groupRef}>
      {/* Always full-lit — meshBasicMaterial ignores scene lighting */}
      <Sphere args={[MOON_RADIUS, 48, 48]}>
        <meshBasicMaterial map={moonMap} />
      </Sphere>
      {/* Glow halo for visibility at distance */}
      <Sphere args={[MOON_RADIUS * 1.2, 48, 48]}>
        <meshBasicMaterial
          color="#aabbdd"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sphere>
      {/* Illuminate nearby spacecraft during flyby */}
      <pointLight intensity={0.3} distance={8} color="#ccccdd" />
    </group>
  );
}
