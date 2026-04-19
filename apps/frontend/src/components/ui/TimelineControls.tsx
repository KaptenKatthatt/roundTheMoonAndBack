import { useTimeline } from "../../hooks/useTimeline";
import { LAUNCH_TIME, SPLASHDOWN_TIME } from "@rtmab/shared";
import styles from "./TimelineControls.module.css";

const SPEEDS = [100, 1000, 10_000, 100_000];
const MISSION_DURATION = SPLASHDOWN_TIME - LAUNCH_TIME;

function formatMissionTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function TimelineControls() {
  const {
    currentTime,
    isPlaying,
    playbackSpeed,
    togglePlaying,
    setCurrentTime,
    setIsPlaying,
    setPlaybackSpeed,
    focusSpacecraft,
    resetCamera,
  } = useTimeline();

  const elapsed = currentTime - LAUNCH_TIME;
  const progress = elapsed / MISSION_DURATION;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setCurrentTime(LAUNCH_TIME + value * MISSION_DURATION);
  };

  const handleRestart = () => {
    setCurrentTime(LAUNCH_TIME);
    setIsPlaying(false);
    resetCamera();
  };

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
              {s >= 1000 ? `${s / 1000}k×` : `${s}×`}
            </button>
          ))}
        </div>
        <button
          className={styles.iconBtn}
          onClick={handleRestart}
          title="Restart mission"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 8a6 6 0 1 0 6-6V0L4 3l4 3V4a4 4 0 1 1-4 4H2z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button
          className={styles.iconBtn}
          onClick={focusSpacecraft}
          title="Center on spacecraft"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="8"
              cy="8"
              r="3"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <line
              x1="8"
              y1="1"
              x2="8"
              y2="4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="8"
              y1="11.5"
              x2="8"
              y2="15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="1"
              y1="8"
              x2="4.5"
              y2="8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="11.5"
              y1="8"
              x2="15"
              y2="8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
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
  );
}
