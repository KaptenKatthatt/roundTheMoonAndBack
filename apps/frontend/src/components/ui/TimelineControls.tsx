import { useTimeline } from "../../hooks/useTimeline"
import { LAUNCH_TIME, SPLASHDOWN_TIME } from "@rtmab/shared"
import styles from "./TimelineControls.module.css"

const SPEEDS = [1, 10, 100, 500, 1000]
const MISSION_DURATION = SPLASHDOWN_TIME - LAUNCH_TIME

function formatMissionTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60

  return `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function TimelineControls() {
  const { currentTime, isPlaying, playbackSpeed, togglePlaying, setCurrentTime, setPlaybackSpeed } =
    useTimeline()

  const elapsed = currentTime - LAUNCH_TIME
  const progress = elapsed / MISSION_DURATION

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setCurrentTime(LAUNCH_TIME + value * MISSION_DURATION)
  }

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <button className={styles.playBtn} onClick={togglePlaying}>
          {isPlaying ? "⏸" : "▶"}
        </button>
        <span className={styles.time}>T+ {formatMissionTime(elapsed)}</span>
        <div className={styles.speeds}>
          {SPEEDS.map((s) => (
            <button
              key={s}
              className={`${styles.speedBtn} ${s === playbackSpeed ? styles.active : ""}`}
              onClick={() => setPlaybackSpeed(s)}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
      <input
        type="range"
        className={styles.slider}
        min={0}
        max={1}
        step={0.0001}
        value={progress}
        onChange={handleSliderChange}
      />
    </div>
  )
}
