
## 2024-05-16 - R3F Zustand Subscription Performance
**Learning:** In React Three Fiber, components subscribing directly to a rapidly changing Zustand state (like `currentTime` at 60fps) within the component body will cause expensive React re-renders on every frame.
**Action:** Always read high-frequency state using `useStore.getState()` inside a `useFrame` loop instead of a standard React hook subscription. If a React component must react to high-frequency state for things like `useMemo` dependency arrays, throttle the subscription by returning a rounded value (e.g. `Math.floor(s.currentTime / INTERVAL) * INTERVAL`).
## 2024-05-18 - Zustand Throttling Effectiveness
**Learning:** If a Zustand subscription relies on `Math.floor(currentTime / INTERVAL) * INTERVAL`, it correctly throttles React re-renders. Replacing this with an internal `useFrame` polling loop often introduces complexity and edge case regressions (e.g., missed first-renders) with negligible performance gain over the native throttling mechanism, even at high fast-forward speeds.
**Action:** Do not attempt to bypass React rendering for UI components that are already throttled via Zustand selector intervals unless there is a verified bottleneck beyond the throttling rate.
## 2024-05-23 - THREE.Vector3 object instantiation inside useFrame
**Learning:** Instantiating new objects (e.g., `new THREE.Vector3()`, `ahead.clone()`) inside React Three Fiber's `useFrame` render loop causes hundreds of allocations per second, leading to garbage collection spikes and micro-stutters that degrade the framerate.
**Action:** Always pre-allocate static vectors outside the component function block and leverage `target` parameters in methods like `curve.getPoint(u, target)` to reuse memory, avoiding object allocations in the critical 60fps path.
