import { useState, useEffect, useMemo } from "react"
import * as THREE from "three"
import type { TrajectoryPoint, TrajectoryResponse } from "@rtmab/shared"
import { kmToScene } from "../utils/coordinates"

interface TrajectoryData {
  points: TrajectoryPoint[]
  curve: THREE.CatmullRomCurve3
  /** Get interpolated position at a given timestamp */
  getPositionAt: (t: number) => THREE.Vector3
  /** Get velocity (km/s) at a given timestamp */
  getVelocityAt: (t: number) => number
  loading: boolean
  error: string | null
}

export function useTrajectory(): TrajectoryData {
  const [points, setPoints] = useState<TrajectoryPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/trajectory")
      .then((res) => res.json())
      .then((data: TrajectoryResponse) => {
        setPoints(data.points)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const curve = useMemo(() => {
    if (points.length < 2) return new THREE.CatmullRomCurve3([new THREE.Vector3()])
    const vectors = points.map((pt) => kmToScene(pt.p))
    return new THREE.CatmullRomCurve3(vectors, false, "catmullrom", 0.5)
  }, [points])

  const getPositionAt = useMemo(() => {
    return (t: number): THREE.Vector3 => {
      if (points.length < 2) return new THREE.Vector3()
      const startT = points[0].t
      const endT = points[points.length - 1].t
      const progress = Math.max(0, Math.min(1, (t - startT) / (endT - startT)))
      return curve.getPointAt(progress)
    }
  }, [points, curve])

  const getVelocityAt = useMemo(() => {
    return (t: number): number => {
      if (points.length < 2) return 0
      // Find surrounding points and interpolate velocity magnitude
      let i = 0
      for (; i < points.length - 1; i++) {
        if (points[i + 1].t >= t) break
      }
      const pt = points[Math.min(i, points.length - 1)]
      const [vx, vy, vz] = pt.v
      return Math.sqrt(vx * vx + vy * vy + vz * vz)
    }
  }, [points])

  return { points, curve, getPositionAt, getVelocityAt, loading, error }
}
