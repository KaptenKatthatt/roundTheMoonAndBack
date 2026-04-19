import { useCallback } from "react"
import * as THREE from "three"
import { getMoonScenePosition } from "../data/moonOrbit"

interface MoonPositionData {
  getPositionAt: (t: number) => THREE.Vector3
  loading: boolean
}

export function useMoonPosition(): MoonPositionData {
  const getPositionAt = useCallback((t: number): THREE.Vector3 => {
    return getMoonScenePosition(t)
  }, [])

  return { getPositionAt, loading: false }
}
