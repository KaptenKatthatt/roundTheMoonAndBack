import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { Group } from "three"
import { useTimeline } from "../hooks/useTimeline"
import { useTrajectory } from "../hooks/useTrajectory"

// Sun direction — must match directionalLight position in Scene.tsx
const SUN_DIR = new THREE.Vector3(80, 20, 60).normalize()

/**
 * Geometric Orion spacecraft fallback.
 * Cone (capsule) + cylinder (service module) + solar panels.
 */
export function Spacecraft() {
  const groupRef = useRef<Group>(null)
  const { getPositionAt } = useTrajectory()
  const currentTime = useTimeline((s) => s.currentTime)

  useFrame(() => {
    if (!groupRef.current) return
    const pos = getPositionAt(currentTime)
    groupRef.current.position.copy(pos)

    // Orient along trajectory tangent (look ahead slightly)
    const ahead = getPositionAt(currentTime + 60_000) // 1 min ahead
    if (ahead.distanceTo(pos) > 0.001) {
      // Set up vector so solar panels (local ±X normals) face the sun
      const forward = ahead.clone().sub(pos).normalize()
      groupRef.current.up.crossVectors(forward, SUN_DIR).normalize()
      groupRef.current.lookAt(ahead)
    }
  })

  return (
    <group ref={groupRef} scale={0.3}>
      {/* Capsule (cone) */}
      <mesh position={[0, 0, 0.4]}>
        <coneGeometry args={[0.15, 0.4, 16]} />
        <meshStandardMaterial color="#c8c8c8" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Service module (cylinder) */}
      <mesh position={[0, 0, -0.1]}>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Solar panels */}
      <mesh position={[0.6, 0, -0.1]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.5, 0.02, 0.2]} />
        <meshStandardMaterial color="#1a237e" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[-0.6, 0, -0.1]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.5, 0.02, 0.2]} />
        <meshStandardMaterial color="#1a237e" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Point light to make spacecraft visible */}
      <pointLight intensity={0.5} distance={3} color="#ffffff" />
    </group>
  )
}
