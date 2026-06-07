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

  // ⚡ Bolt: Initialize instance-level mutable caches inside a useMemo hook with
  // an empty dependency array to avoid pure-render violations with module-level globals
  const { cachedPositions, cachedVectors, sharedCurve, pointsArray } = useMemo(() => {
    return {
      cachedPositions: [] as [number, number, number][],
      cachedVectors: [] as THREE.Vector3[],
      sharedCurve: new THREE.CatmullRomCurve3([], false, "catmullrom", 0.5),
      pointsArray: Array.from({ length: 501 }, () => [0, 0, 0] as [number, number, number])
    };
  }, []);

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
    sharedCurve.points = cachedVectors.slice(0, positions.length);

    for (let i = 0; i < positions.length; i++) {
      sharedCurve.points[i].set(positions[i][0], positions[i][1], positions[i][2]);
    }

    // Sample points reusing a single target vector
    for (let i = 0; i <= 500; i++) {
      sharedCurve.getPoint(i / 500, _target);
      pointsArray[i][0] = _target.x;
      pointsArray[i][1] = _target.y;
      pointsArray[i][2] = _target.z;
    }

    // Return a shallow copy so React detects the array change for Drei's Line,
    // while still saving 501 tuple allocations per render.
    return [...pointsArray];
  }, [currentTime, cachedPositions, cachedVectors, sharedCurve, pointsArray]);

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
