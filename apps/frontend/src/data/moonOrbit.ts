import { LAUNCH_TIME } from "@rtmab/shared"
import * as THREE from "three"

/**
 * Analytical Moon position for the Artemis II mission window.
 *
 * The Moon orbits Earth at ~13.19°/day. We compress the orbital radius
 * to 25 scene-units (vs the real ~60) to match the trajectory compression.
 *
 * The base angle is chosen so the Moon is at the correct position during
 * the lunar flyby on mission day 4 (~17.2, 2, -18.2 in scene coords).
 */
const MOON_ORBIT_RADIUS = 25
const MOON_DEG_PER_DAY = 13.19
const MOON_BASE_ANGLE_DEG = -99.4 // angle at LAUNCH_TIME
const MOON_Y = 2.0

export function getMoonScenePosition(t: number): THREE.Vector3 {
  const daysSinceLaunch = (t - LAUNCH_TIME) / 86_400_000
  const angleDeg = MOON_BASE_ANGLE_DEG + daysSinceLaunch * MOON_DEG_PER_DAY
  const angleRad = angleDeg * (Math.PI / 180)

  const x = MOON_ORBIT_RADIUS * Math.cos(angleRad)
  const z = MOON_ORBIT_RADIUS * Math.sin(angleRad)

  return new THREE.Vector3(x, MOON_Y, z)
}
