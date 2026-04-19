import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Sphere } from "@react-three/drei";
import { MOON_RADIUS_KM, EARTH_RADIUS_KM } from "@rtmab/shared";
import { useMoonPosition } from "../hooks/useMoonPosition";
import { useTimeline } from "../hooks/useTimeline";
import * as THREE from "three";
import type { Group } from "three";

const MOON_RADIUS = MOON_RADIUS_KM / EARTH_RADIUS_KM;
const MOON_VISUAL_SCALE = 4; // Cinematic: 4× real proportional size
const MOON_VIS_R = MOON_RADIUS * MOON_VISUAL_SCALE;

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
      <Sphere args={[MOON_VIS_R, 64, 64]}>
        <meshBasicMaterial map={moonMap} />
      </Sphere>
      {/* Inner glow halo */}
      <Sphere args={[MOON_VIS_R * 1.08, 48, 48]}>
        <meshBasicMaterial
          color="#b8c8ee"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sphere>
      {/* Outer glow halo */}
      <Sphere args={[MOON_VIS_R * 1.25, 48, 48]}>
        <meshBasicMaterial
          color="#8899bb"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sphere>
      {/* Illuminate nearby spacecraft during flyby */}
      <pointLight intensity={0.5} distance={12} color="#ddddef" />
    </group>
  );
}
