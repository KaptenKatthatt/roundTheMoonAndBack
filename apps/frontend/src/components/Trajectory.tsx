import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useTimeline } from "../hooks/useTimeline";
import { getShiftedTrajectoryPositions } from "../data/trajectoryData";

const THROTTLE_INTERVAL = 3_600_000; // Throttle to 1 simulated hour

const CACHED_VECTORS: THREE.Vector3[] = [];
const CACHED_POSITIONS: [number, number, number][] = [];
const SHARED_CURVE = new THREE.CatmullRomCurve3(CACHED_VECTORS, false, "catmullrom", 0.5);
const _target = new THREE.Vector3();

export function Trajectory() {
  // ⚡ Bolt: Throttle React subscription to 1-hour intervals since the expensive
  // useMemo trajectory calculation only needs to update as the moon moves
  const currentTime = useTimeline((s) =>
    Math.floor(s.currentTime / THROTTLE_INTERVAL) * THROTTLE_INTERVAL
  );

  // ⚡ Bolt: Pre-allocate static curve and target vector to prevent ~535 THREE.Vector3
  // garbage collection allocations per update during high-speed playback
  const linePoints = useMemo(() => {
    // ⚡ Bolt: Pass module-level CACHED_POSITIONS to avoid mapping a new array every time
    const positions = getShiftedTrajectoryPositions(currentTime, CACHED_POSITIONS);

    // Update vector coordinates in-place instead of instantiating new ones
    while (CACHED_VECTORS.length < positions.length) {
      CACHED_VECTORS.push(new THREE.Vector3());
    }
    // If positions is smaller, only update up to positions.length and update the curve's points reference
    SHARED_CURVE.points = CACHED_VECTORS.slice(0, positions.length);

    for (let i = 0; i < positions.length; i++) {
      SHARED_CURVE.points[i].set(positions[i][0], positions[i][1], positions[i][2]);
    }

    // Sample points reusing a single target vector
    const pointsArray: [number, number, number][] = new Array(501);
    for (let i = 0; i <= 500; i++) {
      SHARED_CURVE.getPoint(i / 500, _target);
      pointsArray[i] = [_target.x, _target.y, _target.z];
    }

    return pointsArray;
  }, [currentTime]);

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
