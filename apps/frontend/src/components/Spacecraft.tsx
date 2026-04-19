import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { useTimeline, getMissionPhase } from "../hooks/useTimeline";
import { useTrajectory } from "../hooks/useTrajectory";
import { getMoonScenePosition } from "../data/moonOrbit";
import { LAUNCH_TIME } from "@rtmab/shared";

// Sun direction — must match directionalLight position in Scene.tsx
const SUN_DIR = new THREE.Vector3(100, 30, 60).normalize();

const FLYBY_START_T = LAUNCH_TIME + 331_200_000; // T+3.83d
const FLYBY_END_T = LAUNCH_TIME + 388_800_000; // T+4.5d
let lastLoggedHour = -1;

export function Spacecraft() {
  const groupRef = useRef<Group>(null);
  const serviceModuleRef = useRef<Group>(null);
  const { getPositionAt } = useTrajectory();

  useFrame(() => {
    if (!groupRef.current) return;

    const { currentTime } = useTimeline.getState();
    const pos = getPositionAt(currentTime);
    groupRef.current.position.copy(pos);

    // Debug: log spacecraft-Moon distance during flyby (once per simulated hour)
    if (currentTime >= FLYBY_START_T && currentTime <= FLYBY_END_T) {
      const hour = Math.floor(currentTime / 3_600_000);
      if (hour !== lastLoggedHour) {
        lastLoggedHour = hour;
        const moonPos = getMoonScenePosition(currentTime);
        const dist = pos.distanceTo(moonPos);
        const days = ((currentTime - LAUNCH_TIME) / 86_400_000).toFixed(2);
        console.log(`[Flyby] T+${days}d  SC↔Moon: ${dist.toFixed(2)} units`);
      }
    }

    // Orient along trajectory tangent (look ahead slightly)
    const ahead = getPositionAt(currentTime + 60_000);
    if (ahead.distanceTo(pos) > 0.001) {
      const forward = ahead.clone().sub(pos).normalize();
      groupRef.current.up.crossVectors(forward, SUN_DIR).normalize();
      groupRef.current.lookAt(ahead);
    }

    // Hide service module only at re-entry (ESM jettisoned just before atmosphere)
    if (serviceModuleRef.current) {
      const { phase } = getMissionPhase(currentTime);
      serviceModuleRef.current.visible = phase !== "re-entry";
    }
  });

  return (
    <group ref={groupRef}>
      {/* Rotate so model +Y (nose) aligns with lookAt forward (-Z) */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <CrewModule />
        <group ref={serviceModuleRef}>
          <ServiceModule />
        </group>
      </group>
      <pointLight intensity={0.5} distance={3} color="#ffffff" />
    </group>
  );
}

/** Orion Crew Module — conical capsule + heat shield + docking port */
function CrewModule() {
  return (
    <group>
      {/* Capsule body — truncated cone, wider at base */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.005, 0.02, 0.035, 24]} />
        <meshStandardMaterial
          color="#e0e0e0"
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>
      {/* Window band ring */}
      <mesh position={[0, 0.032, 0]}>
        <cylinderGeometry args={[0.007, 0.01, 0.005, 24]} />
        <meshStandardMaterial
          color="#222222"
          metalness={0.8}
          roughness={0.15}
        />
      </mesh>
      {/* Heat shield — dark AVCOAT ablator at base */}
      <mesh position={[0, 0.0, 0]}>
        <cylinderGeometry args={[0.021, 0.021, 0.004, 24]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.15}
          roughness={0.95}
        />
      </mesh>
      {/* Backshell cap */}
      <mesh position={[0, 0.04, 0]}>
        <coneGeometry args={[0.005, 0.008, 16]} />
        <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Docking adapter ring */}
      <mesh position={[0, 0.048, 0]}>
        <cylinderGeometry args={[0.003, 0.004, 0.01, 12]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  );
}

/** European Service Module — gold cylinder + engine bell + 4 solar-panel wings + radiators */
function ServiceModule() {
  return (
    <group>
      {/* ESM body — gold/copper MLI blanket */}
      <mesh position={[0, -0.035, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.045, 24]} />
        <meshStandardMaterial
          color="#c9a84c"
          metalness={0.7}
          roughness={0.2}
          emissive="#3a2a00"
          emissiveIntensity={0.1}
        />
      </mesh>
      {/* Engine nozzle bell */}
      <mesh position={[0, -0.065, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.012, 0.018, 16]} />
        <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Engine throat insert */}
      <mesh position={[0, -0.063, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.005, 0.008, 12]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* 4 × Solar-panel wings at 90° intervals */}
      {[0, 1, 2, 3].map((i) => (
        <group
          key={i}
          rotation={[0, (i * Math.PI) / 2, 0]}
          position={[0, -0.03, 0]}
        >
          {/* Panel arm strut */}
          <mesh position={[0.025, 0, 0]}>
            <boxGeometry args={[0.012, 0.002, 0.003]} />
            <meshStandardMaterial
              color="#888888"
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
          {/* Solar panel — dark photovoltaic cells */}
          <mesh position={[0.065, 0, 0]}>
            <boxGeometry args={[0.07, 0.001, 0.022]} />
            <meshStandardMaterial
              color="#0a1a3a"
              metalness={0.4}
              roughness={0.4}
              emissive="#050d1f"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      ))}
      {/* 4 × Radiator panels (between solar panels, angled 45°) */}
      {[0, 1, 2, 3].map((i) => (
        <group
          key={`rad-${i}`}
          rotation={[0, (i * Math.PI) / 2 + Math.PI / 4, 0]}
          position={[0, -0.04, 0]}
        >
          <mesh position={[0.025, 0, 0]}>
            <boxGeometry args={[0.015, 0.012, 0.001]} />
            <meshStandardMaterial
              color="#dddddd"
              metalness={0.3}
              roughness={0.6}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
