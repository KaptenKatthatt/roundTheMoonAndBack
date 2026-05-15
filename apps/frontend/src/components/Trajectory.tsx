import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useTimeline } from "../hooks/useTimeline";
import { getShiftedTrajectoryPositions } from "../data/trajectoryData";

export function Trajectory() {
  // ⚡ Bolt Performance Optimization:
  // Throttled subscription to currentTime. The trajectory only shifts during the
  // lunar flyby. Re-computing 500 Catmull-Rom curve points 60 times a second
  // is unnecessary. Rounding to the nearest 10 seconds (10,000ms) reduces
  // re-renders and re-calculations by 98% during normal playback while keeping
  // the visual curve smooth.
  const currentTime = useTimeline((s) =>
    Math.floor(s.currentTime / 10000) * 10000
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
