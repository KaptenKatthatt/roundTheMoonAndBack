import { EARTH_RADIUS_KM } from "@rtmab/shared"
import * as THREE from "three"

/**
 * Convert lat/lon (degrees) to a Three.js Vector3 on a sphere.
 * Convention: Y-up, Greenwich (lon=0) on +Z axis.
 */
export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number = 1,
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}

/**
 * Convert km position (J2000 Earth-centered) to scene units.
 * Scale: Earth radius = 1 unit.
 */
export function kmToScene(p: [number, number, number]): THREE.Vector3 {
  return new THREE.Vector3(
    p[0] / EARTH_RADIUS_KM,
    p[2] / EARTH_RADIUS_KM, // J2000 Z → scene Y (up)
    p[1] / EARTH_RADIUS_KM, // J2000 Y → scene Z
  )
}

/**
 * Easing function: ease in-out cubic
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}
