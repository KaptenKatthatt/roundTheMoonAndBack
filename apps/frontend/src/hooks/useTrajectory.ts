import * as THREE from "three";
import { TRAJECTORY } from "../data/trajectoryData";
import type { SceneWaypoint } from "../data/trajectoryData";

interface TrajectoryData {
  points: SceneWaypoint[];
  curve: THREE.CatmullRomCurve3;
  /** Get interpolated scene position at a given timestamp */
  getPositionAt: (t: number, target?: THREE.Vector3) => THREE.Vector3;
  /** Get velocity (km/s) at a given timestamp */
  getVelocityAt: (t: number) => number;
  /** Get altitude (km from Earth center) at a given timestamp */
  getAltitudeAt: (t: number) => number;
  loading: boolean;
}

// ⚡ Bolt: Cache static trajectory calculations at module level to prevent redundant
// THREE.CatmullRomCurve3 instantiations and save memory across components.
const SHARED_POINTS = TRAJECTORY;

const SHARED_CURVE = new THREE.CatmullRomCurve3(
  SHARED_POINTS.map((pt) => new THREE.Vector3(...pt.p)),
  false,
  "catmullrom",
  0.5
);

function findSegmentIndex(pts: SceneWaypoint[], t: number): number {
  for (let i = 0; i < pts.length - 1; i++) {
    if (pts[i + 1].t >= t) return i;
  }
  return pts.length - 1;
}

const getPositionAt = (t: number, target?: THREE.Vector3): THREE.Vector3 => {
  const n = SHARED_POINTS.length;
  // Find bracketing waypoints for time t
  let i = 0;
  for (; i < n - 2; i++) {
    if (SHARED_POINTS[i + 1].t >= t) break;
  }
  // Fraction within this time segment
  const segDuration = SHARED_POINTS[i + 1].t - SHARED_POINTS[i].t;
  const f =
    segDuration > 0
      ? Math.max(0, Math.min(1, (t - SHARED_POINTS[i].t) / segDuration))
      : 0;
  // Map to CatmullRom uniform parameter (NOT arc-length)
  const u = (i + f) / (n - 1);
  return SHARED_CURVE.getPoint(u, target);
};

const getVelocityAt = (t: number): number => {
  const idx = findSegmentIndex(SHARED_POINTS, t);
  const p0 = SHARED_POINTS[idx];
  const p1 = SHARED_POINTS[Math.min(idx + 1, SHARED_POINTS.length - 1)];
  if (p0.t === p1.t) return p0.vel;
  const frac = (t - p0.t) / (p1.t - p0.t);
  return p0.vel + (p1.vel - p0.vel) * frac;
};

const getAltitudeAt = (t: number): number => {
  const idx = findSegmentIndex(SHARED_POINTS, t);
  const p0 = SHARED_POINTS[idx];
  const p1 = SHARED_POINTS[Math.min(idx + 1, SHARED_POINTS.length - 1)];
  if (p0.t === p1.t) return p0.alt;
  const frac = (t - p0.t) / (p1.t - p0.t);
  return p0.alt + (p1.alt - p0.alt) * frac;
};

export function useTrajectory(): TrajectoryData {
  return {
    points: SHARED_POINTS,
    curve: SHARED_CURVE,
    getPositionAt,
    getVelocityAt,
    getAltitudeAt,
    loading: false,
  };
}
