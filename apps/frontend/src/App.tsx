import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Analytics } from "@vercel/analytics/react";
import { Scene } from "./components/Scene";
import { TimelineControls } from "./components/ui/TimelineControls";
import { MissionData } from "./components/ui/MissionData";
import { useTimeline } from "./hooks/useTimeline";
import styles from "./App.module.css";

export function App() {
  const togglePlaying = useTimeline((s) => s.togglePlaying);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlaying();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlaying]);

  return (
    <div className={styles.root}>
      <Canvas
        shadows={false}
        camera={{ fov: 60, near: 0.01, far: 10000 }}
        gl={{ antialias: true, alpha: false, toneMapping: 4 }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.0;
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <TimelineControls />
      <MissionData />
      <Analytics />
    </div>
  );
}
