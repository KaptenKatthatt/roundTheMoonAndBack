import { LAUNCH_TIME, SPLASHDOWN_TIME } from "@rtmab/shared";
import { getMoonScenePosition } from "./moonOrbit";

/**
 * Hardcoded Artemis II trajectory waypoints.
 *
 * Positions are in SCENE coordinates (Earth radius = 1 unit, Y-up).
 * Distances beyond LEO are compressed so the Moon orbit sits at ~25 units
 * instead of the real 60+ units — this keeps both Earth and Moon visible
 * in a single cinematic frame.
 *
 * Velocity and altitude are stored in real-world km/s and km for the HUD.
 */
export interface SceneWaypoint {
  /** Unix timestamp in ms */
  t: number;
  /** Scene position [x, y, z] — Earth radius = 1 unit */
  p: [number, number, number];
  /** Velocity magnitude in km/s (for display) */
  vel: number;
  /** Distance from Earth center in km (for display) */
  alt: number;
}

// prettier-ignore
export const TRAJECTORY: SceneWaypoint[] = [
  // ═══ Phase 1: Launch & Ascent (T+0 to T+15 min) ═══
  { t: LAUNCH_TIME,                      p: [ 0.16,  0.49,  0.89], vel:  0.4,  alt:   6_371 },
  { t: LAUNCH_TIME +     180_000,        p: [ 0.14,  0.52,  0.94], vel:  2.5,  alt:   6_421 },
  { t: LAUNCH_TIME +     360_000,        p: [ 0.10,  0.57,  0.98], vel:  5.8,  alt:   6_471 },
  { t: LAUNCH_TIME +     540_000,        p: [ 0.04,  0.62,  1.01], vel:  7.5,  alt:   6_551 },
  { t: LAUNCH_TIME +     900_000,        p: [-0.05,  0.68,  0.98], vel:  7.8,  alt:   6_571 },

  // ═══ Phase 2: Low Earth Orbit (T+15 min to T+1.5 h) ═══
  { t: LAUNCH_TIME +   1_800_000,        p: [-0.43,  0.90,  0.56], vel:  7.8,  alt:   6_571 },
  { t: LAUNCH_TIME +   2_700_000,        p: [-0.84,  0.77, -0.13], vel:  7.8,  alt:   6_571 },
  { t: LAUNCH_TIME +   3_600_000,        p: [-0.65,  0.42, -0.85], vel:  7.8,  alt:   6_571 },
  { t: LAUNCH_TIME +   4_500_000,        p: [-0.09, -0.11, -1.14], vel:  7.8,  alt:   6_571 },

  // ═══ Phase 3: High Earth Orbit (T+1.5 h to T+24 h) ═══
  { t: LAUNCH_TIME +   5_400_000,        p: [ 0.60, -0.58, -0.79], vel:  7.6,  alt:   6_571 },
  { t: LAUNCH_TIME +  10_800_000,        p: [ 1.20,  0.30, -0.80], vel:  6.5,  alt:   9_500 },
  { t: LAUNCH_TIME +  21_600_000,        p: [ 1.80,  1.20,  0.50], vel:  4.0,  alt:  14_300 },
  { t: LAUNCH_TIME +  36_000_000,        p: [ 1.00,  2.50,  1.50], vel:  2.5,  alt:  19_600 },
  { t: LAUNCH_TIME +  57_600_000,        p: [-1.00,  2.80,  1.00], vel:  2.5,  alt:  19_900 },
  { t: LAUNCH_TIME +  72_000_000,        p: [ 0.30,  1.80,  1.50], vel:  4.0,  alt:  15_200 },

  // ═══ Phase 4: Trans-Lunar Injection (T+24 h) ═══
  { t: LAUNCH_TIME +  86_400_000,        p: [ 0.85,  0.55,  0.85], vel: 10.8,  alt:   7_000 },

  // ═══ Phase 5: Outbound Coast (T+1 d to T+4 d) ═══
  { t: LAUNCH_TIME + 100_800_000,        p: [ 2.50,  1.20, -0.50], vel:  4.5,  alt:  30_000 },
  { t: LAUNCH_TIME + 115_200_000,        p: [ 4.50,  1.80, -2.50], vel:  2.8,  alt:  70_000 },
  { t: LAUNCH_TIME + 129_600_000,        p: [ 6.50,  2.20, -4.50], vel:  2.0,  alt: 120_000 },
  { t: LAUNCH_TIME + 151_200_000,        p: [ 8.50,  2.40, -7.00], vel:  1.6,  alt: 180_000 },
  { t: LAUNCH_TIME + 172_800_000,        p: [10.50,  2.50, -9.50], vel:  1.3,  alt: 230_000 },
  { t: LAUNCH_TIME + 216_000_000,        p: [13.00,  2.60,-13.00], vel:  1.0,  alt: 300_000 },
  { t: LAUNCH_TIME + 259_200_000,        p: [15.00,  2.70,-15.50], vel:  0.85, alt: 350_000 },
  { t: LAUNCH_TIME + 302_400_000,        p: [16.50,  2.50,-17.00], vel:  0.75, alt: 370_000 },

  // ═══ Phase 6: Lunar Flyby (T+3.8 d to T+4.5 d) ═══
  // Trajectory wraps AROUND the Moon in a free-return slingshot.
  // Arc radius 1.3 units from Moon center (Moon visual radius ≈ 1.09 at 4× scale).
  // Moon moves during flyby; each point computed relative to Moon position at that timestamp.
  { t: LAUNCH_TIME + 331_200_000,        p: [16.80,  2.30,-17.10], vel:  0.82, alt: 380_000 },  // pre-approach
  { t: LAUNCH_TIME + 340_000_000,        p: [17.33,  2.10,-17.14], vel:  1.50, alt: 384_000 },  // arc entry (Earth-side)
  { t: LAUNCH_TIME + 342_500_000,        p: [18.31,  2.05,-18.00], vel:  2.00, alt: 384_800 },  // quarter arc
  { t: LAUNCH_TIME + 345_600_000,        p: [18.00,  2.00,-19.17], vel:  2.30, alt: 385_000 },  // behind Moon (far side)
  { t: LAUNCH_TIME + 348_500_000,        p: [16.96,  1.95,-19.29], vel:  2.10, alt: 384_800 },  // quarter arc (other side)
  { t: LAUNCH_TIME + 351_000_000,        p: [16.14,  1.90,-18.27], vel:  1.80, alt: 384_000 },  // arc exit
  { t: LAUNCH_TIME + 360_000_000,        p: [15.80,  1.70,-17.00], vel:  1.50, alt: 380_000 },  // post-flyby departure
  { t: LAUNCH_TIME + 374_400_000,        p: [15.00,  1.20,-15.00], vel:  1.30, alt: 370_000 },  // departing
  { t: LAUNCH_TIME + 388_800_000,        p: [14.20,  0.80,-13.00], vel:  1.20, alt: 365_000 },  // en route home

  // ═══ Phase 7: Return Coast (T+5 d to T+9.5 d) ═══
  { t: LAUNCH_TIME + 432_000_000,        p: [14.00,  0.10,-10.00], vel:  1.00, alt: 320_000 },
  { t: LAUNCH_TIME + 475_200_000,        p: [11.50, -0.30, -7.00], vel:  1.10, alt: 265_000 },
  { t: LAUNCH_TIME + 518_400_000,        p: [ 9.00, -0.60, -4.50], vel:  1.20, alt: 210_000 },
  { t: LAUNCH_TIME + 604_800_000,        p: [ 5.50, -0.80, -1.00], vel:  1.50, alt: 130_000 },
  { t: LAUNCH_TIME + 691_200_000,        p: [ 2.50, -0.50,  1.50], vel:  2.50, alt:  55_000 },
  { t: LAUNCH_TIME + 734_400_000,        p: [ 1.50, -0.30,  2.00], vel:  4.00, alt:  25_000 },

  // ═══ Phase 8: Re-entry & Splashdown (T+8.9 d to splashdown) ═══
  { t: LAUNCH_TIME + 768_000_000,        p: [ 0.50,  0.00,  1.30], vel:  7.50, alt:  10_000 },
  { t: LAUNCH_TIME + 778_200_000,        p: [-0.20,  0.20,  1.05], vel:  9.50, alt:   6_800 },
  { t: LAUNCH_TIME + 780_600_000,        p: [-0.52,  0.31,  0.92], vel: 11.00, alt:   6_471 },
  { t: SPLASHDOWN_TIME,                   p: [-0.89, -0.22,  0.61], vel: 11.10, alt:   6_371 },
]

// ── Flyby Moon-tracking ──────────────────────────────────────────────

export const FLYBY_FIRST_IDX = 24;
export const FLYBY_LAST_IDX = 31;

/** Blend: how much each flyby waypoint tracks the Moon's current position */
const FLYBY_BLEND = [0.3, 1, 1, 1, 1, 1, 0.7, 0.3];

/** Pre-computed Moon positions at each flyby waypoint's timestamp */
const FLYBY_MOON_POS: [number, number, number][] = [];
for (let i = FLYBY_FIRST_IDX; i <= FLYBY_LAST_IDX; i++) {
  const m = getMoonScenePosition(TRAJECTORY[i].t);
  FLYBY_MOON_POS.push([m.x, m.y, m.z]);
}

/**
 * Return trajectory positions with flyby waypoints shifted so the arc
 * visually wraps around the Moon's position at `displayTime`.
 *
 * Non-flyby waypoints are returned unchanged.
 */
export function getShiftedTrajectoryPositions(
  displayTime: number,
): [number, number, number][] {
  const moonNow = getMoonScenePosition(displayTime);
  return TRAJECTORY.map((wp, i) => {
    if (i < FLYBY_FIRST_IDX || i > FLYBY_LAST_IDX) return wp.p;
    const fi = i - FLYBY_FIRST_IDX;
    const blend = FLYBY_BLEND[fi];
    const [mx, my, mz] = FLYBY_MOON_POS[fi];
    return [
      wp.p[0] + (moonNow.x - mx) * blend,
      wp.p[1] + (moonNow.y - my) * blend,
      wp.p[2] + (moonNow.z - mz) * blend,
    ] as [number, number, number];
  });
}
