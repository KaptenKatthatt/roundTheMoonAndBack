import { useTimeline, getMissionPhase } from "../../hooks/useTimeline"
import { useTrajectory } from "../../hooks/useTrajectory"
import { LAUNCH_TIME, SPLASHDOWN_TIME, EARTH_RADIUS_KM } from "@rtmab/shared"
import styles from "./MissionData.module.css"

export function MissionData() {
  const currentTime = useTimeline((s) => s.currentTime)
  const { getPositionAt, getVelocityAt, loading } = useTrajectory()

  if (loading) return null

  const pos = getPositionAt(currentTime)
  const velocity = getVelocityAt(currentTime)
  const distanceFromEarth = pos.length() * EARTH_RADIUS_KM
  const { label: phaseLabel } = getMissionPhase(currentTime)

  const timeRemaining = SPLASHDOWN_TIME - currentTime
  const hoursRemaining = Math.max(0, timeRemaining / 3_600_000)

  return (
    <div className={styles.container}>
      <div className={styles.header}>ARTEMIS II</div>
      <div className={styles.grid}>
        <div className={styles.item}>
          <span className={styles.label}>PHASE</span>
          <span className={styles.value}>{phaseLabel}</span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>VELOCITY</span>
          <span className={styles.value}>{velocity.toFixed(2)} km/s</span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>ALTITUDE</span>
          <span className={styles.value}>
            {distanceFromEarth > 10000
              ? `${(distanceFromEarth / 1000).toFixed(1)}k km`
              : `${distanceFromEarth.toFixed(0)} km`}
          </span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>ETA SPLASHDOWN</span>
          <span className={styles.value}>
            {hoursRemaining > 24
              ? `${(hoursRemaining / 24).toFixed(1)} days`
              : `${hoursRemaining.toFixed(1)} hrs`}
          </span>
        </div>
      </div>
    </div>
  )
}
