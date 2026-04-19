// ── Trajectory ──

export interface TrajectoryPoint {
  /** Unix timestamp in milliseconds */
  t: number
  /** Position [x, y, z] in km (J2000 Earth-centered) */
  p: [number, number, number]
  /** Velocity [vx, vy, vz] in km/s */
  v: [number, number, number]
}

export interface TrajectoryResponse {
  points: TrajectoryPoint[]
  mission: MissionMeta
}

// ── Moon ──

export interface CelestialPosition {
  /** Unix timestamp in milliseconds */
  t: number
  /** Position [x, y, z] in km (J2000 Earth-centered) */
  p: [number, number, number]
}

export interface MoonResponse {
  positions: CelestialPosition[]
}

// ── Mission ──

export type MissionPhase =
  | "launch"
  | "leo"
  | "high-earth-orbit"
  | "tli"
  | "outbound-coast"
  | "lunar-flyby"
  | "return-coast"
  | "re-entry"

export interface MissionMeta {
  name: string
  launchTime: number
  splashdownTime: number
  phases: MissionPhaseInfo[]
}

export interface MissionPhaseInfo {
  phase: MissionPhase
  startTime: number
  endTime: number
  label: string
}

// ── Constants ──

export const EARTH_RADIUS_KM = 6_371
export const MOON_RADIUS_KM = 1_737.4
export const SCALE_FACTOR = 1 / EARTH_RADIUS_KM

/** Launch: Apr 1, 2026 22:35:12 UTC */
export const LAUNCH_TIME = Date.UTC(2026, 3, 1, 22, 35, 12)

/** Splashdown: Apr 11, 2026 00:07:27 UTC */
export const SPLASHDOWN_TIME = Date.UTC(2026, 3, 11, 0, 7, 27)
