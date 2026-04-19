import { create } from "zustand";
import { LAUNCH_TIME, SPLASHDOWN_TIME } from "@rtmab/shared";
import type { MissionPhase } from "@rtmab/shared";

export type CameraCmd =
  | { type: "view"; mode: "side" | "rear" }
  | { type: "zoom"; fraction: number };

interface TimelineState {
  currentTime: number; // Unix ms
  isPlaying: boolean;
  playbackSpeed: number;
  shouldFocusSpacecraft: boolean;
  cameraResetToken: number;
  cameraCommand: CameraCmd | null;
  setCurrentTime: (t: number) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlaying: () => void;
  setPlaybackSpeed: (speed: number) => void;
  focusSpacecraft: () => void;
  clearFocusSpacecraft: () => void;
  resetCamera: () => void;
  fireCameraCommand: (cmd: CameraCmd) => void;
  clearCameraCommand: () => void;
  /** Advance time by real-world delta (seconds). Call from useFrame. */
  tick: (deltaSec: number) => void;
}

export const useTimeline = create<TimelineState>((set, get) => ({
  currentTime: LAUNCH_TIME,
  isPlaying: false,
  playbackSpeed: 1_000, // Normal speed by default
  shouldFocusSpacecraft: false,
  cameraResetToken: 0,
  cameraCommand: null,

  setCurrentTime: (t) =>
    set({ currentTime: Math.max(LAUNCH_TIME, Math.min(SPLASHDOWN_TIME, t)) }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  togglePlaying: () => set((s) => ({ isPlaying: !s.isPlaying })),

  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  focusSpacecraft: () => set({ shouldFocusSpacecraft: true }),
  clearFocusSpacecraft: () => set({ shouldFocusSpacecraft: false }),

  resetCamera: () => set((s) => ({ cameraResetToken: s.cameraResetToken + 1 })),

  fireCameraCommand: (cmd) => set({ cameraCommand: cmd }),
  clearCameraCommand: () => set({ cameraCommand: null }),

  tick: (deltaSec) => {
    const { isPlaying, playbackSpeed, currentTime } = get();
    if (!isPlaying) return;
    const newTime = currentTime + deltaSec * 1000 * playbackSpeed;
    if (newTime >= SPLASHDOWN_TIME) {
      set({ currentTime: SPLASHDOWN_TIME, isPlaying: false });
    } else {
      set({ currentTime: newTime });
    }
  },
}));

/**
 * Determine mission phase from timestamp.
 */
export function getMissionPhase(t: number): {
  phase: MissionPhase;
  label: string;
} {
  const phases: { phase: MissionPhase; start: number; label: string }[] = [
    { phase: "launch", start: LAUNCH_TIME, label: "Launch & Ascent" },
    { phase: "leo", start: LAUNCH_TIME + 888_000, label: "Low Earth Orbit" },
    {
      phase: "high-earth-orbit",
      start: LAUNCH_TIME + 3_600_000,
      label: "High Earth Orbit",
    },
    {
      phase: "tli",
      start: LAUNCH_TIME + 86_400_000,
      label: "Trans-Lunar Injection",
    },
    {
      phase: "outbound-coast",
      start: LAUNCH_TIME + 86_750_000,
      label: "Outbound Coast",
    },
    {
      phase: "lunar-flyby",
      start: LAUNCH_TIME + 428_688_000,
      label: "Lunar Flyby",
    },
    {
      phase: "return-coast",
      start: LAUNCH_TIME + 446_688_000,
      label: "Return Coast",
    },
    { phase: "re-entry", start: LAUNCH_TIME + 770_688_000, label: "Re-entry" },
  ];

  for (let i = phases.length - 1; i >= 0; i--) {
    if (t >= phases[i].start)
      return { phase: phases[i].phase, label: phases[i].label };
  }
  return { phase: "launch", label: "Launch & Ascent" };
}
