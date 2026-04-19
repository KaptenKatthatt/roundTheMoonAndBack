import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { latLonToVector3, easeInOutCubic } from "../utils/coordinates";
import * as THREE from "three";
import { useTimeline } from "../hooks/useTimeline";
import { useTrajectory } from "../hooks/useTrajectory";

// ─── Intro animation constants ────────────────────────────────────────
const SWEDEN_LAT = 62;
const SWEDEN_LON = 15;
const KSC_LAT = 28.6;
const KSC_LON = -80.6;

const WAIT_SWEDEN = 2.0; // hold over Sweden (seconds)
const PAN_TO_KSC = 2.4; // Sweden → KSC
const PULL_BACK = 3.0; // KSC close-up → epic wide shot

const swedenPos = latLonToVector3(SWEDEN_LAT, SWEDEN_LON, 2.2);
const kscPos = latLonToVector3(KSC_LAT, KSC_LON, 2.6);

// Pull-back: just far enough that the whole Earth fills the screen.
// At fov=55 and distance ~3.5, Earth (r=1) takes up most of the frame.
const widePos = new THREE.Vector3(1.5, 2.0, 2.5);
const wideTarget = new THREE.Vector3(0, 0, 0);
// ──────────────────────────────────────────────────────────────────────

export function CameraAnimation() {
  const { camera } = useThree();
  const elapsedRef = useRef(0);
  const [phase, setPhase] = useState<"sweden" | "pan" | "pullback" | "done">(
    "sweden",
  );
  const controlsRef = useRef<any>(null);

  // Watch for camera reset signal
  const cameraResetToken = useTimeline((s) => s.cameraResetToken);
  const prevResetTokenRef = useRef(cameraResetToken);
  if (cameraResetToken !== prevResetTokenRef.current) {
    prevResetTokenRef.current = cameraResetToken;
    elapsedRef.current = 0;
    if (cameraResetToken > 0) {
      // Restart: skip Sweden, jump straight to KSC pull-back
      camera.position.copy(kscPos);
      camera.lookAt(0, 0, 0);
      setPhase("pullback");
    } else {
      setPhase("sweden");
    }
  }

  // Follow logic
  const isPlaying = useTimeline((s) => s.isPlaying);
  const currentTime = useTimeline((s) => s.currentTime);
  const { getPositionAt } = useTrajectory();

  // Smoothed lookAt target for the controls
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));

  // Set camera to Sweden on first frame
  useFrame(() => {
    if (elapsedRef.current === 0 && phase === "sweden") {
      camera.position.copy(swedenPos);
      camera.lookAt(0, 0, 0);
    }
  });

  useFrame((_, delta) => {
    elapsedRef.current += delta;

    // Phase 1: Hold at Sweden
    if (phase === "sweden") {
      camera.position.copy(swedenPos);
      camera.lookAt(0, 0, 0);
      if (elapsedRef.current >= WAIT_SWEDEN) {
        setPhase("pan");
        elapsedRef.current = 0;
      }
      return;
    }

    // Phase 2: Pan from Sweden to KSC
    if (phase === "pan") {
      const t = Math.min(1, elapsedRef.current / PAN_TO_KSC);
      const eased = easeInOutCubic(t);
      camera.position.lerpVectors(swedenPos, kscPos, eased);
      camera.lookAt(0, 0, 0);
      if (t >= 1) {
        setPhase("pullback");
        elapsedRef.current = 0;
      }
      return;
    }

    // Phase 3: Pull back from KSC to epic wide shot
    if (phase === "pullback") {
      const t = Math.min(1, elapsedRef.current / PULL_BACK);
      const eased = easeInOutCubic(t);
      camera.position.lerpVectors(kscPos, widePos, eased);
      // Smoothly shift look-at from Earth center to wide target
      const lookAt = new THREE.Vector3().lerpVectors(
        new THREE.Vector3(0, 0, 0),
        wideTarget,
        eased,
      );
      camera.lookAt(lookAt);
      if (t >= 1) {
        setPhase("done");
        targetRef.current.copy(wideTarget);
        if (controlsRef.current) {
          controlsRef.current.target.copy(wideTarget);
        }
      }
      return;
    }

    // Phase 4: Done — follow spacecraft when playing or handle focus request
    if (controlsRef.current) {
      const scPos = getPositionAt(currentTime);
      const currentTarget = controlsRef.current.target as THREE.Vector3;

      // Focus on spacecraft: snap camera close to it
      const { shouldFocusSpacecraft, clearFocusSpacecraft } =
        useTimeline.getState();
      if (shouldFocusSpacecraft) {
        clearFocusSpacecraft();
        // Place camera 0.25 units away from spacecraft (fills ~20% of screen)
        const offset = new THREE.Vector3(0.1, 0.08, 0.15)
          .normalize()
          .multiplyScalar(0.25);
        camera.position.copy(scPos).add(offset);
        controlsRef.current.target.copy(scPos);
        return;
      }

      if (isPlaying) {
        const nextTarget = currentTarget.clone().lerp(scPos, 0.04);
        const deltaTarget = nextTarget.clone().sub(currentTarget);
        camera.position.add(deltaTarget);
        controlsRef.current.target.copy(nextTarget);
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={phase === "done"}
      enableDamping
      dampingFactor={0.05}
      minDistance={1.05}
      maxDistance={500}
    />
  );
}
