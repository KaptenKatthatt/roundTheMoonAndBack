import { useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { latLonToVector3, easeInOutCubic } from "../utils/coordinates"
import * as THREE from "three"
import { useTimeline } from "../hooks/useTimeline"
import { useTrajectory } from "../hooks/useTrajectory"

const SWEDEN_LAT = 62
const SWEDEN_LON = 15
const KSC_LAT = 28.6 // Kennedy Space Center
const KSC_LON = -80.6
const START_RADIUS = 2.2 // Satellite view
const END_RADIUS = 2.6 // Distance at launch pad
const WAIT_TIME = 1.0 // seconds to wait before zooming
const ZOOM_DURATION = 4.0 // seconds

// Camera start position over Sweden
const startPos = latLonToVector3(SWEDEN_LAT, SWEDEN_LON, START_RADIUS)
// Camera end position — Kennedy Space Center
const endPos = latLonToVector3(KSC_LAT, KSC_LON, END_RADIUS)
// Point on Earth to look at during the pan
const centerPos = new THREE.Vector3(0, 0, 0)

export function CameraAnimation() {
  const { camera } = useThree()
  const waitRef = useRef(0)
  const progressRef = useRef(0)
  const [animationDone, setAnimationDone] = useState(false)
  const controlsRef = useRef<any>(null)

  // Follow logic
  const isPlaying = useTimeline((s) => s.isPlaying)
  const currentTime = useTimeline((s) => s.currentTime)
  const { getPositionAt } = useTrajectory()
  const lastTarget = useRef(new THREE.Vector3(0, 0, 0))
  const [hasStartedFollowing, setHasStartedFollowing] = useState(false)

  // Ensure camera starts at correct exact position
  useFrame(() => {
    if (waitRef.current === 0 && !animationDone) {
      camera.position.copy(startPos)
      camera.lookAt(centerPos)
    }
  })

  useFrame((_, delta) => {
    // 1. Initial wait & zoom animation
    if (!animationDone) {
      waitRef.current += delta
      if (waitRef.current < WAIT_TIME) return

      progressRef.current += delta / ZOOM_DURATION
      const t = Math.min(1, progressRef.current)
      const eased = easeInOutCubic(t)

      // Interpolate camera position from Sweden to KSC
      camera.position.lerpVectors(startPos, endPos, eased)
      camera.lookAt(centerPos)

      if (t >= 1) {
        setAnimationDone(true)
        // Store the exact target we are currently looking at
        lastTarget.current.copy(centerPos)
        if (controlsRef.current) {
          controlsRef.current.target.copy(centerPos)
        }
      }
      return
    }

    // 2. Following the spacecraft after clicking play
    if (controlsRef.current) {
      // If we've hit play, our goal focus is the spacecraft
      // Otherwise, stay looking where OrbitControls is currently looking
      const scPos = getPositionAt(currentTime)
      
      const currentTarget = controlsRef.current.target.clone()
      const nextTarget = currentTarget.clone()

      if (isPlaying) {
        // Smoothly lerp target towards the spacecraft
        nextTarget.lerp(scPos, 0.04)
        
        // Find how much the target moved this frame
        const deltaTarget = nextTarget.clone().sub(currentTarget)
        
        // Move the camera by the same amount to preserve orbiting distance/angle
        camera.position.add(deltaTarget)
        
        // Apply the new target
        controlsRef.current.target.copy(nextTarget)
      } else {
        // Not playing: user might be orbiting. Let them do whatever,
        // and we just keep lastTarget updated to current state so that
        // when play IS clicked, we start translating from whatever target they left it at.
        lastTarget.current.copy(controlsRef.current.target)
      }
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={animationDone}
      enableDamping
      dampingFactor={0.05}
      minDistance={1.05} // allow getting really close to spacecraft/earth
      maxDistance={500}
      target={[0, 0, 0]}
    />
  )
}
