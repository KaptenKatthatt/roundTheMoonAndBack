import * as THREE from "three"
import { getMoonScenePosition } from "../data/moonOrbit"

interface MoonPositionData {
  getPositionAt: (t: number, target?: THREE.Vector3) => THREE.Vector3
  loading: boolean
}

// ⚡ Bolt: Hoist the returned object from the hook to a module-level constant
// to prevent GC spikes in React components that call this frequently.
const MOON_POSITION_DATA: MoonPositionData = {
  getPositionAt: getMoonScenePosition,
  loading: false,
};

export function useMoonPosition(): MoonPositionData {
  return MOON_POSITION_DATA;
}
