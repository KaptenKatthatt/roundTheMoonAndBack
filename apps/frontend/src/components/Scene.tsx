import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { Earth } from "./Earth";
import { Moon } from "./Moon";
import { Trajectory } from "./Trajectory";
import { Spacecraft } from "./Spacecraft";
import { CameraAnimation } from "./CameraAnimation";
import { useTimeline } from "../hooks/useTimeline";

export function Scene() {
  const tick = useTimeline((s) => s.tick);

  useFrame((_, delta) => {
    tick(delta);
  });

  return (
    <>
      <ambientLight intensity={0.03} />
      <directionalLight
        position={[100, 30, 60]}
        intensity={2.0}
        color="#fff5e6"
        castShadow={false}
      />
      <Stars radius={300} depth={60} count={8000} factor={7} fade speed={0.5} />
      <Earth />
      <Moon />
      <Trajectory />
      <Spacecraft />
      <CameraAnimation />
    </>
  );
}
