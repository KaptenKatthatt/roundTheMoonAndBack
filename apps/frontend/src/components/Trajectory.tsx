import { useMemo } from "react"
import { Line } from "@react-three/drei"
import { useTrajectory } from "../hooks/useTrajectory"

export function Trajectory() {
  const { curve, loading } = useTrajectory()

  const linePoints = useMemo(() => {
    // Sample 500 points along the CatmullRom curve for a smooth line
    return curve.getPoints(500).map(
      (v) => [v.x, v.y, v.z] as [number, number, number],
    )
  }, [curve])

  if (loading || linePoints.length < 2) return null

  return (
    <group>
      {/* Glow layer — wider, softer */}
      <Line
        points={linePoints}
        color="#00ffcc"
        lineWidth={4}
        transparent
        opacity={0.08}
      />
      {/* Core line — bright neon */}
      <Line
        points={linePoints}
        color="#00ffee"
        lineWidth={1.5}
        transparent
        opacity={0.85}
      />
    </group>
  )
}
