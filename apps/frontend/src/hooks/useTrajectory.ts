import { useMemo } from "react";
import * as THREE from "three";
import { TRAJECTORY } from "../data/trajectoryData";
import type { SceneWaypoint } from "../data/trajectoryData";

interface TrajectoryData {
  points: SceneWaypoint[];
  curve: THREE.CatmullRomCurve3;
  /** Get interpolated scene position at a given timestamp */
  getPositionAt: (t: number) => THREE.Vector3;
  /** Get velocity (km/s) at a given timestamp */
  getVelocityAt: (t: number) => number;
  /** Get altitude (km from Earth center) at a given timestamp */
  getAltitudeAt: (t: number) => number;
  loading: boolean;
}

export function useTrajectory(): TrajectoryData {
  const points = TRAJECTORY;

  const curve = useMemo(() => {
    const vectors = points.map((pt) => new THREE.Vector3(...pt.p));
    return new THREE.CatmullRomCurve3(vectors, false, "catmullrom", 0.5);
  }, [points]);

  const getPositionAt = useMemo(() => {
    const startT = points[0].t;
    const endT = points[points.length - 1].t;
    const duration = endT - startT;
    return (t: number): THREE.Vector3 => {
      // Normalize time to 0–1 progress, use arc-length parameterized
      // getPointAt so the spacecraft moves at constant visual speed.
      const progress = Math.max(0, Math.min(1, (t - startT) / duration));
      return curve.getPointAt(progress);
    };
  }, [points, curve]);

  const getVelocityAt = useMemo(() => {
    return (t: number): number => {
      const idx = findSegmentIndex(points, t);
      const p0 = points[idx];
      const p1 = points[Math.min(idx + 1, points.length - 1)];
      if (p0.t === p1.t) return p0.vel;
      const frac = (t - p0.t) / (p1.t - p0.t);
      return p0.vel + (p1.vel - p0.vel) * frac;
    };
  }, [points]);

  const getAltitudeAt = useMemo(() => {
    return (t: number): number => {
      const idx = findSegmentIndex(points, t);
      const p0 = points[idx];
      const p1 = points[Math.min(idx + 1, points.length - 1)];
      if (p0.t === p1.t) return p0.alt;
      const frac = (t - p0.t) / (p1.t - p0.t);
      return p0.alt + (p1.alt - p0.alt) * frac;
    };
  }, [points]);

  return {
    points,
    curve,
    getPositionAt,
    getVelocityAt,
    getAltitudeAt,
    loading: false,
  };
}

function findSegmentIndex(pts: SceneWaypoint[], t: number): number {
  for (let i = 0; i < pts.length - 1; i++) {
    if (pts[i + 1].t >= t) return i;
  }
  return pts.length - 1;
}
