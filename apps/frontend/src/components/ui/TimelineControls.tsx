import { useTimeline } from "../../hooks/useTimeline";
import { LAUNCH_TIME, SPLASHDOWN_TIME } from "@rtmab/shared";
import styles from "./TimelineControls.module.css";

const ZOOMS = [
  { fraction: 0.05, label: "5%" },
  { fraction: 0.1, label: "10%" },
  { fraction: 0.2, label: "20%" },
];

const SPEEDS = [
  { value: 100, label: "Slow" },
  { value: 1_000, label: "Normal" },
  { value: 10_000, label: "Fast" },
  { value: 100_000, label: "Superfast" },
];
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
    fireCameraCommand,
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
      <div className={styles.timeRow}>
        <span className={styles.time}>T+ {formatMissionTime(elapsed)}</span>
      </div>
      <div className={styles.controls}>
        <button className={styles.playBtn} onClick={togglePlaying}>
          {isPlaying ? "⏸" : "▶"}
        </button>
        <div className={styles.divider} />
        <span className={styles.rowLabel}>SPEED</span>
        {SPEEDS.map(({ value, label }) => (
          <button
            key={value}
            className={`${styles.speedBtn} ${value === playbackSpeed ? styles.active : ""}`}
            onClick={() => setPlaybackSpeed(value)}
          >
            {label}
          </button>
        ))}
        <div className={styles.divider} />
        <span className={styles.rowLabel}>VIEW</span>
        <button
          className={styles.iconBtn}
          onClick={() => fireCameraCommand({ type: "view", mode: "side" })}
          title="Side view"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="3"
              y="6.5"
              width="10"
              height="3"
              rx="1"
              fill="currentColor"
            />
            <line
              x1="13"
              y1="2"
              x2="10"
              y2="6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <polyline
              points="8,3 10,6 13,5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          className={styles.iconBtn}
          onClick={() => fireCameraCommand({ type: "view", mode: "rear" })}
          title="Rear view"
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
              cy="7"
              r="2.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <line
              x1="1"
              y1="7"
              x2="5.5"
              y2="7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="10.5"
              y1="7"
              x2="15"
              y2="7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="14"
              y1="14"
              x2="10"
              y2="10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <polyline
              points="10,13 10,10 13,10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className={styles.divider} />
        <span className={styles.rowLabel}>ZOOM</span>
        {ZOOMS.map(({ fraction, label }) => (
          <button
            key={fraction}
            className={styles.speedBtn}
            onClick={() => fireCameraCommand({ type: "zoom", fraction })}
            title={`Show spacecraft at ${label} screen coverage`}
          >
            {label}
          </button>
        ))}
        <div className={styles.divider} />
        <div className={styles.labeledBtn}>
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
          <span className={styles.rowLabel}>RESTART</span>
        </div>
        <div className={styles.labeledBtn}>
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
          <span className={styles.rowLabel}>CENTER</span>
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
  );
}
