import { useMemo } from "react"
import { Line } from "@react-three/drei"
import { useTrajectory } from "../hooks/useTrajectory"
import { kmToScene } from "../utils/coordinates"

export function Trajectory() {
  const { points, loading } = useTrajectory()

  const linePoints = useMemo(() => {
    if (points.length < 2) return []
    return points.map((pt) => {
      const v = kmToScene(pt.p)
      return [v.x, v.y, v.z] as [number, number, number]
    })
  }, [points])

  if (loading || linePoints.length < 2) return null

  return (
    <group>
      {/* Glow layer — wider, softer */}
      <Line
        points={linePoints}
        color="#00ffcc"
        lineWidth={5}
        transparent
        opacity={0.1}
      />
      {/* Core line — bright neon */}
      <Line
        points={linePoints}
        color="#00ffee"
        lineWidth={2}
        transparent
        opacity={0.9}
      />
    </group>
  )
}
