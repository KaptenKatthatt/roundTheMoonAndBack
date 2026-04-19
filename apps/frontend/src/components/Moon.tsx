import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useTexture, Sphere } from "@react-three/drei"
import { MOON_RADIUS_KM, EARTH_RADIUS_KM } from "@rtmab/shared"
import { useMoonPosition } from "../hooks/useMoonPosition"
import { useTimeline } from "../hooks/useTimeline"
import type { Group } from "three"

const MOON_RADIUS = MOON_RADIUS_KM / EARTH_RADIUS_KM

export function Moon() {
  const groupRef = useRef<Group>(null)
  const moonMap = useTexture("/textures/2k_moon.jpg")
  const { getPositionAt } = useMoonPosition()
  const currentTime = useTimeline((s) => s.currentTime)

  useFrame(() => {
    if (!groupRef.current) return
    const pos = getPositionAt(currentTime)
    groupRef.current.position.copy(pos)
  })

  return (
    <group ref={groupRef}>
      <Sphere args={[MOON_RADIUS, 48, 48]}>
        <meshStandardMaterial
          map={moonMap}
          roughness={1}
          metalness={0}
          emissive="#222222"
          emissiveIntensity={0.15}
        />
      </Sphere>
      {/* Soft point light so Moon is always slightly visible */}
      <pointLight intensity={0.3} distance={8} color="#aab4cc" />
    </group>
  )
}
