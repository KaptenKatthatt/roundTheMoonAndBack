import { useCallback } from "react"
import * as THREE from "three"
import { getMoonScenePosition } from "../data/moonOrbit"

interface MoonPositionData {
  getPositionAt: (t: number, target?: THREE.Vector3) => THREE.Vector3
  loading: boolean
}

export function useMoonPosition(): MoonPositionData {
  const getPositionAt = useCallback(
    (t: number, target?: THREE.Vector3): THREE.Vector3 => {
      return getMoonScenePosition(t, target)
    },
    [],
  )

  return { getPositionAt, loading: false }
}
