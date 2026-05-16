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

  const linePoints = useMemo(() => {
    const positions = getShiftedTrajectoryPositions(currentTime);
    const vectors = positions.map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(vectors, false, "catmullrom", 0.5);
    return curve
      .getPoints(500)
      .map((v) => [v.x, v.y, v.z] as [number, number, number]);
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
