import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useTimeline } from "../hooks/useTimeline";
import { getShiftedTrajectoryPositions } from "../data/trajectoryData";

const THROTTLE_INTERVAL = 3_600_000; // Throttle to 1 simulated hour

const _target = new THREE.Vector3();

export function Trajectory() {
  // ⚡ Bolt: Throttle React subscription to 1-hour intervals since the expensive
  // useMemo trajectory calculation only needs to update as the moon moves
  const currentTime = useTimeline((s) =>
    Math.floor(s.currentTime / THROTTLE_INTERVAL) * THROTTLE_INTERVAL
  );

  // ⚡ Bolt: Memoize instance-specific cache arrays to prevent pure-render violations
  // from mutating module-level arrays, and pre-allocate target tuples to prevent
  // 501 array allocations per update.
  const { cachedPositions, cachedVectors, curve, targetPoints } = useMemo(() => ({
    cachedPositions: [] as [number, number, number][],
    cachedVectors: [] as THREE.Vector3[],
    curve: new THREE.CatmullRomCurve3([], false, "catmullrom", 0.5),
    targetPoints: Array.from({ length: 501 }, () => [0, 0, 0] as [number, number, number]),
  }), []);

  // ⚡ Bolt: Pre-allocate static curve and target vector to prevent ~535 THREE.Vector3
  // garbage collection allocations per update during high-speed playback
  const linePoints = useMemo(() => {
    // ⚡ Bolt: Pass instance-level cachedPositions to avoid mapping a new array every time
    const positions = getShiftedTrajectoryPositions(currentTime, cachedPositions);

    // Update vector coordinates in-place instead of instantiating new ones
    while (cachedVectors.length < positions.length) {
      cachedVectors.push(new THREE.Vector3());
    }
    // If positions is smaller, only update up to positions.length and update the curve's points reference
    curve.points = cachedVectors.slice(0, positions.length);

    for (let i = 0; i < positions.length; i++) {
      curve.points[i].set(positions[i][0], positions[i][1], positions[i][2]);
    }

    // Sample points reusing a single target vector and mutating tuples in-place
    const pointsArray: [number, number, number][] = new Array(501);
    for (let i = 0; i <= 500; i++) {
      curve.getPoint(i / 500, _target);
      targetPoints[i][0] = _target.x;
      targetPoints[i][1] = _target.y;
      targetPoints[i][2] = _target.z;
      pointsArray[i] = targetPoints[i];
    }

    return pointsArray;
  }, [currentTime, cachedPositions, cachedVectors, curve, targetPoints]);

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
