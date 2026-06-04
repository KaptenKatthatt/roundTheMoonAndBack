import * as THREE from "three"
import { getMoonScenePosition } from "../data/moonOrbit"

interface MoonPositionData {
  getPositionAt: (t: number, target?: THREE.Vector3) => THREE.Vector3
  loading: boolean
}

// ⚡ Bolt: Hoisted the returned object literal to a module-level constant to prevent
// GC allocations and preserve referential equality when called frequently in useFrame.
const MOON_POSITION_DATA: MoonPositionData = {
  getPositionAt: (t: number, target?: THREE.Vector3): THREE.Vector3 => {
    return getMoonScenePosition(t, target)
  },
  loading: false,
}

export function useMoonPosition(): MoonPositionData {
  return MOON_POSITION_DATA
}
