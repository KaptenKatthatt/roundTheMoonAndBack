import { useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import type { CelestialPosition, MoonResponse } from "@rtmab/shared";
import { kmToScene } from "../utils/coordinates";

interface MoonPositionData {
  positions: CelestialPosition[];
  getPositionAt: (t: number) => THREE.Vector3;
  loading: boolean;
}

export function useMoonPosition(): MoonPositionData {
  const [positions, setPositions] = useState<CelestialPosition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/moon?start=2026-04-01&stop=2026-04-12&step=1h")
      .then((res) => res.json())
      .then((data: MoonResponse) => {
        setPositions(data.positions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getPositionAt = useMemo(() => {
    return (t: number): THREE.Vector3 => {
      if (positions.length < 2) {
        // Fallback: place Moon at average distance along +X
        return new THREE.Vector3(60, 0, 0);
      }

      // Find surrounding data points and linearly interpolate
      let i = 0;
      for (; i < positions.length - 1; i++) {
        if (positions[i + 1].t >= t) break;
      }

      const p0 = positions[i];
      const p1 = positions[Math.min(i + 1, positions.length - 1)];

      if (p0.t === p1.t) return kmToScene(p0.p);

      const frac = (t - p0.t) / (p1.t - p0.t);
      const v0 = kmToScene(p0.p);
      const v1 = kmToScene(p1.p);

      return v0.lerp(v1, Math.max(0, Math.min(1, frac)));
    };
  }, [positions]);

  return { positions, getPositionAt, loading };
}
