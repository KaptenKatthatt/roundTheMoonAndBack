import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { latLonToVector3, easeInOutCubic } from "../utils/coordinates";
import * as THREE from "three";
import { useTimeline } from "../hooks/useTimeline";
import { useTrajectory } from "../hooks/useTrajectory";
import { getMoonScenePosition } from "../data/moonOrbit";
import { LAUNCH_TIME, SPLASHDOWN_TIME } from "@rtmab/shared";

// ─── Intro animation constants ────────────────────────────────────────
const KSC_LAT = 28.6;
const KSC_LON = -80.6;

const PAN_TO_KSC = 2.4; // restart: smooth pan back to KSC
const PULL_BACK = 3.0; // KSC close-up → epic wide shot

const kscPos = latLonToVector3(KSC_LAT, KSC_LON, 2.6);

// Pull-back: slightly pulled back for a cinematic overview of the trajectory.
const widePos = new THREE.Vector3(2, 3, 4);
const wideTarget = new THREE.Vector3(0, 0, 0);
// Lunar flyby zoom: Moon visual radius ≈ 1.09 (4× real). Camera at 2.5 from center fills ~78% of FOV.
const FLYBY_ENTER_DIST = 3.5; // start Moon zoom when spacecraft within this distance
const FLYBY_EXIT_DIST = 0.5; // end Moon zoom (hysteresis — tighter for faster transition)// Camera zoom levels: dist = ZOOM_BASE / fraction. At fraction=0.2 → 0.25 units ≈ 20% fill.
const ZOOM_BASE = 0.05;

// Return coast camera follow — start immediately when flyby zoom ends
const RETURN_FOLLOW_TIME = LAUNCH_TIME + 345_600_000; // T+4d — during flyby so follow kicks in as blend fades
const EARTH_APPROACH_TIME = LAUNCH_TIME + 691_200_000; // T+8d — nearing Earth

// ──────────────────────────────────────────────────────────────────────

export function CameraAnimation() {
  const { camera } = useThree();
  const elapsedRef = useRef(0);
  const [phase, setPhase] = useState<"pan-ksc" | "pullback" | "done">(
    "pullback",
  );
  const controlsRef = useRef<any>(null);
  const flybyBlendRef = useRef(0);
  const panStartRef = useRef(new THREE.Vector3());
  const zoomFractionRef = useRef(0); // 0 = no user zoom active
  const zoomDirRef = useRef(new THREE.Vector3(0.1, 0.08, 0.15).normalize());
  const camAnimRef = useRef({
    active: false,
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    startLook: new THREE.Vector3(),
    endLook: new THREE.Vector3(),
    elapsed: 0,
    duration: 1.0,
  });

  // Watch for camera reset signal
  const cameraResetToken = useTimeline((s) => s.cameraResetToken);
  const prevResetTokenRef = useRef(cameraResetToken);
  if (cameraResetToken !== prevResetTokenRef.current) {
    prevResetTokenRef.current = cameraResetToken;
    elapsedRef.current = 0;
    flybyBlendRef.current = 0;
    zoomFractionRef.current = 0;
    camAnimRef.current.active = false;
    if (cameraResetToken > 0) {
      // Restart: record current position and smoothly pan to KSC
      panStartRef.current.copy(camera.position);
      setPhase("pan-ksc");
    } else {
      setPhase("pullback");
    }
  }

  // Follow logic
  const isPlaying = useTimeline((s) => s.isPlaying);
  const currentTime = useTimeline((s) => s.currentTime);
  const { getPositionAt } = useTrajectory();

  // Smoothed lookAt target for the controls
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));

  // Set camera to KSC on first frame
  useFrame(() => {
    if (elapsedRef.current === 0 && phase === "pullback") {
      camera.position.copy(kscPos);
      camera.lookAt(0, 0, 0);
    }
  });

  useFrame((_, delta) => {
    elapsedRef.current += delta;

    // Phase "pan-ksc": smooth pan from recorded start position to KSC (on restart)
    if (phase === "pan-ksc") {
      const t = Math.min(1, elapsedRef.current / PAN_TO_KSC);
      const eased = easeInOutCubic(t);
      camera.position.lerpVectors(panStartRef.current, kscPos, eased);
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

    // Phase 4: Done — follow spacecraft; handle view/zoom/focus commands
    if (controlsRef.current) {
      const scPos = getPositionAt(currentTime);
      const moonPos = getMoonScenePosition(currentTime);
      const currentTarget = controlsRef.current.target as THREE.Vector3;
      const UP = new THREE.Vector3(0, 1, 0);

      // Update lunar-flyby zoom blend based on spacecraft–Moon distance
      const moonDist = scPos.distanceTo(moonPos);
      if (moonDist < FLYBY_ENTER_DIST) {
        flybyBlendRef.current = Math.min(
          1,
          flybyBlendRef.current + delta * 0.5,
        );
      } else if (moonDist > FLYBY_EXIT_DIST) {
        // Faster decay so return-coast follow picks up immediately
        flybyBlendRef.current = Math.max(
          0,
          flybyBlendRef.current - delta * 1.5,
        );
      }

      const {
        shouldFocusSpacecraft,
        clearFocusSpacecraft,
        cameraCommand,
        clearCameraCommand,
      } = useTimeline.getState();

      // Focus on spacecraft: snap camera close to it
      if (shouldFocusSpacecraft) {
        flybyBlendRef.current = 0;
        zoomFractionRef.current = 0;
        camAnimRef.current.active = false;
        clearFocusSpacecraft();
        const offset = new THREE.Vector3(0.1, 0.08, 0.15)
          .normalize()
          .multiplyScalar(0.25);
        camera.position.copy(scPos).add(offset);
        controlsRef.current.target.copy(scPos);
        return;
      }

      // Handle view/zoom command: trigger smooth camera animation
      if (cameraCommand !== null) {
        flybyBlendRef.current = 0;
        clearCameraCommand();
        if (cameraCommand.type === "view") zoomFractionRef.current = 0;
        const anim = camAnimRef.current;
        anim.startPos.copy(camera.position);
        anim.startLook.copy(currentTarget);
        anim.endLook.copy(scPos);
        anim.elapsed = 0;
        anim.duration = 1.2;
        const earthDir = scPos.clone().normalize();
        const sideDir = new THREE.Vector3()
          .crossVectors(earthDir, UP)
          .normalize();
        if (cameraCommand.type === "view") {
          // Preserve the current camera distance — only rotate the viewing angle
          const currentDist = Math.max(
            camera.position.distanceTo(scPos),
            ZOOM_BASE / 0.6,
          );
          if (cameraCommand.mode === "side") {
            // Camera to the side of spacecraft, slightly beyond (Earth visible in bg)
            const viewDir = sideDir
              .clone()
              .multiplyScalar(0.7)
              .addScaledVector(earthDir, 1.0)
              .normalize();
            anim.endPos.copy(scPos).addScaledVector(viewDir, currentDist);
          } else {
            // Rear view: diagonally from behind + above + to the side
            const posAhead = getPositionAt(currentTime + 60_000);
            const velDir = posAhead.clone().sub(scPos).normalize();
            const rearDir = velDir
              .clone()
              .multiplyScalar(-0.8)
              .addScaledVector(UP, 0.5)
              .addScaledVector(sideDir, 0.35)
              .normalize();
            anim.endPos.copy(scPos).addScaledVector(rearDir, currentDist);
          }
        } else {
          // Zoom: keep current viewing direction, change distance only
          zoomFractionRef.current = cameraCommand.fraction;
          const newDist = ZOOM_BASE / cameraCommand.fraction;
          const dir = camera.position.clone().sub(scPos);
          if (dir.length() < 0.001) dir.set(0.1, 0.08, 0.15);
          dir.normalize();
          zoomDirRef.current.copy(dir);
          anim.endPos.copy(scPos).addScaledVector(dir, newDist);
          anim.duration = 0.8;
        }
        anim.active = true;
      }

      // Run smooth camera animation (takes priority over follow while active)
      if (camAnimRef.current.active) {
        const anim = camAnimRef.current;
        anim.elapsed += delta;
        const t = Math.min(1, anim.elapsed / anim.duration);
        const eased = easeInOutCubic(t);
        camera.position.lerpVectors(anim.startPos, anim.endPos, eased);
        controlsRef.current.target.lerpVectors(
          anim.startLook,
          anim.endLook,
          eased,
        );
        if (t >= 1) anim.active = false;
        return;
      }

      // ── Follow mode: flyby zoom → return coast → gentle outbound ──

      // If user has zoomed, maintain that zoom level instead of default follow
      if (zoomFractionRef.current > 0 && !camAnimRef.current.active) {
        const zoomDist = ZOOM_BASE / zoomFractionRef.current;
        const desiredPos = scPos
          .clone()
          .addScaledVector(zoomDirRef.current, zoomDist);
        const smooth = 1 - Math.exp(-6.0 * delta);
        camera.position.lerp(desiredPos, smooth);
        currentTarget.lerp(scPos, smooth);
        controlsRef.current.target.copy(currentTarget);
      } else if (flybyBlendRef.current > 0.01) {
        // Lunar flyby zoom: camera tracks Moon from the side
        const moonDir = moonPos.clone().normalize();
        const flybySideDir = new THREE.Vector3()
          .crossVectors(moonDir, new THREE.Vector3(0, 1, 0))
          .normalize();
        const flybyCamPos = moonPos
          .clone()
          .sub(flybySideDir.clone().multiplyScalar(2.5))
          .add(new THREE.Vector3(0, 0.3, 0));
        const smooth = 1 - Math.exp(-2.0 * delta);
        camera.position.lerp(flybyCamPos, flybyBlendRef.current * smooth);
        currentTarget.lerp(moonPos, flybyBlendRef.current * smooth);
        controlsRef.current.target.copy(currentTarget);
      } else if (currentTime > RETURN_FOLLOW_TIME) {
        // Return coast: active side tracking with Earth approach from above
        const posAhead = getPositionAt(currentTime + 120_000);
        const velDir = posAhead.clone().sub(scPos);
        if (velDir.lengthSq() > 0.00001) velDir.normalize();
        else velDir.set(-1, 0, 0);
        const sideDir = new THREE.Vector3()
          .crossVectors(velDir, UP)
          .normalize();

        // Blend from side tracking to overhead re-entry view
        const earthFrac = Math.max(
          0,
          Math.min(
            1,
            (currentTime - EARTH_APPROACH_TIME) /
              (SPLASHDOWN_TIME - EARTH_APPROACH_TIME),
          ),
        );
        const easedEarth = easeInOutCubic(earthFrac);

        // Side-tracking offset (used during coast)
        const coastDist = 3.5;
        const coastOffset = sideDir
          .clone()
          .multiplyScalar(coastDist * 0.8)
          .addScaledVector(UP, coastDist * 0.35)
          .addScaledVector(velDir, -coastDist * 0.25);

        // Re-entry overhead offset: camera above spacecraft, outward from Earth
        const scOutward = scPos.clone().normalize();
        const reentryDist = 2.5;
        const reentryOffset = scOutward
          .clone()
          .multiplyScalar(reentryDist)
          .addScaledVector(UP, reentryDist * 0.6)
          .addScaledVector(velDir, -reentryDist * 0.3);

        // Blend the offsets
        const offset = coastOffset.clone().lerp(reentryOffset, easedEarth);

        // Look target: spacecraft during coast, spacecraft during re-entry too
        const lookTarget = scPos.clone();

        const desiredPos = scPos.clone().add(offset);

        // Ensure camera stays outside Earth (radius > 1.05)
        const camR = desiredPos.length();
        if (camR < 1.3) {
          desiredPos.normalize().multiplyScalar(1.3);
        }

        const smooth = 1 - Math.exp(-6.0 * delta);
        camera.position.lerp(desiredPos, smooth);
        currentTarget.lerp(lookTarget, smooth);
        controlsRef.current.target.copy(currentTarget);
      } else if (isPlaying) {
        // Outbound coast: gentle follow
        const followStrength = 1 - flybyBlendRef.current;
        if (followStrength > 0.01) {
          const nextTarget = currentTarget
            .clone()
            .lerp(scPos, 0.04 * followStrength);
          const deltaTarget = nextTarget.clone().sub(currentTarget);
          camera.position.add(deltaTarget);
          controlsRef.current.target.copy(nextTarget);
        }
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={phase === "done"}
      enableDamping
      dampingFactor={0.05}
      minDistance={0.15}
      maxDistance={500}
      onStart={() => {
        // User interacted (scroll / drag) — release zoom lock
        zoomFractionRef.current = 0;
      }}
    />
  );
}
