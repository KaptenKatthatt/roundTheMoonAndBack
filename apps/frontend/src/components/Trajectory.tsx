import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useTimeline } from "../hooks/useTimeline";
import { getShiftedTrajectoryPositions } from "../data/trajectoryData";

const THROTTLE_INTERVAL = 3_600_000; // Throttle to 1 simulated hour

export function Trajectory() {
  // ⚡ Bolt: Throttle React subscription to 1-hour intervals since the expensive
  // useMemo trajectory calculation only needs to update as the moon moves
  const currentTime = useTimeline((s) =>
    Math.floor(s.currentTime / THROTTLE_INTERVAL) * THROTTLE_INTERVAL
  );

  // ⚡ Bolt: Initialize instance-level mutable caches to avoid React pure-render violations
  // and prevent state-corruption bugs if components are reused.
  const cache = useMemo(() => ({
    vectors: [] as THREE.Vector3[],
    positions: [] as [number, number, number][],
    curve: new THREE.CatmullRomCurve3([], false, "catmullrom", 0.5),
    target: new THREE.Vector3(),
    linePointsInner: Array.from({ length: 501 }, () => [0, 0, 0] as [number, number, number])
  }), []);

  // ⚡ Bolt: Pre-allocate static curve and target vector to prevent ~535 THREE.Vector3
  // garbage collection allocations per update during high-speed playback
  const linePoints = useMemo(() => {
    // ⚡ Bolt: Pass module-level CACHED_POSITIONS to avoid mapping a new array every time
    const positions = getShiftedTrajectoryPositions(currentTime, cache.positions);

    // Update vector coordinates in-place instead of instantiating new ones
    while (cache.vectors.length < positions.length) {
      cache.vectors.push(new THREE.Vector3());
    }
    // If positions is smaller, only update up to positions.length and update the curve's points reference
    cache.curve.points = cache.vectors.slice(0, positions.length);

    for (let i = 0; i < positions.length; i++) {
      cache.curve.points[i].set(positions[i][0], positions[i][1], positions[i][2]);
    }

    // ⚡ Bolt: Sample points reusing pre-allocated inner tuples to prevent inner tuple allocations
    // while returning a new outer array to trigger React re-renders for the Line component.
    const pointsArray: [number, number, number][] = new Array(501);
    for (let i = 0; i <= 500; i++) {
      cache.curve.getPoint(i / 500, cache.target);
      const tuple = cache.linePointsInner[i];
      tuple[0] = cache.target.x;
      tuple[1] = cache.target.y;
      tuple[2] = cache.target.z;
      pointsArray[i] = tuple;
    }

    return pointsArray;
  }, [currentTime, cache]);

  if (linePoints.length < 2) return null;

  return (
    <group>
      {/* Outer bloom — wide, soft neon haze */}
      <Line
        points={linePoints}
        color="#00ffcc"
        lineWidth={8}
        transparent
        opacity={0.04}
      />
      {/* Middle glow — neon spread */}
      <Line
        points={linePoints}
        color="#00ffdd"
        lineWidth={3.5}
        transparent
        opacity={0.18}
      />
      {/* Core line — bright vivid neon */}
      <Line
        points={linePoints}
        color="#80fff0"
        lineWidth={1.5}
        transparent
        opacity={0.95}
      />
    </group>
  );
}
