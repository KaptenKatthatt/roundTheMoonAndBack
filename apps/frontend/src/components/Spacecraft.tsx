import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { useTimeline, getMissionPhase } from "../hooks/useTimeline";
import { useTrajectory } from "../hooks/useTrajectory";

// Sun direction — must match directionalLight position in Scene.tsx
const SUN_DIR = new THREE.Vector3(100, 30, 60).normalize();

export function Spacecraft() {
  const groupRef = useRef<Group>(null);
  const serviceModuleRef = useRef<Group>(null);
  const { getPositionAt } = useTrajectory();

  useFrame(() => {
    if (!groupRef.current) return;

    const { currentTime } = useTimeline.getState();
    const pos = getPositionAt(currentTime);
    groupRef.current.position.copy(pos);

    // Orient along trajectory tangent (look ahead slightly)
    const ahead = getPositionAt(currentTime + 60_000);
    if (ahead.distanceTo(pos) > 0.001) {
      const forward = ahead.clone().sub(pos).normalize();
      groupRef.current.up.crossVectors(forward, SUN_DIR).normalize();
      groupRef.current.lookAt(ahead);
    }

    // Hide service module after lunar flyby (return-coast & re-entry)
    if (serviceModuleRef.current) {
      const { phase } = getMissionPhase(currentTime);
      serviceModuleRef.current.visible =
        phase !== "return-coast" && phase !== "re-entry";
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
      <pointLight intensity={0.4} distance={3} color="#ffffff" />
    </group>
  );
}

/** Orion Crew Module — conical capsule + heat shield + docking port */
function CrewModule() {
  return (
    <group>
      {/* Capsule body — truncated cone */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.006, 0.022, 0.04, 16]} />
        <meshStandardMaterial color="#d4d4d4" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Heat shield — dark disk at base */}
      <mesh position={[0, -0.002, 0]}>
        <cylinderGeometry args={[0.023, 0.023, 0.005, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.2} roughness={0.9} />
      </mesh>
      {/* Docking adapter ring */}
      <mesh position={[0, 0.044, 0]}>
        <cylinderGeometry args={[0.004, 0.005, 0.008, 8]} />
        <meshStandardMaterial color="#999999" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

/** European Service Module — cylinder + engine bell + 4 solar-panel wings */
function ServiceModule() {
  return (
    <group>
      {/* ESM body — gold cylinder */}
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.019, 0.019, 0.05, 16]} />
        <meshStandardMaterial
          color="#c4a220"
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>
      {/* Engine nozzle */}
      <mesh position={[0, -0.072, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.01, 0.014, 12]} />
        <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* 4 × Solar-panel wings in X-wing configuration */}
      {[0, 1, 2, 3].map((i) => (
        <group
          key={i}
          rotation={[0, (i * Math.PI) / 2, 0]}
          position={[0, -0.035, 0]}
        >
          <mesh position={[0.055, 0, 0]}>
            <boxGeometry args={[0.07, 0.001, 0.018]} />
            <meshStandardMaterial
              color="#1a2d5a"
              metalness={0.3}
              roughness={0.5}
              emissive="#0a1530"
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
