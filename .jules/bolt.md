
## 2024-05-16 - R3F Zustand Subscription Performance
**Learning:** In React Three Fiber, components subscribing directly to a rapidly changing Zustand state (like `currentTime` at 60fps) within the component body will cause expensive React re-renders on every frame.
**Action:** Always read high-frequency state using `useStore.getState()` inside a `useFrame` loop instead of a standard React hook subscription. If a React component must react to high-frequency state for things like `useMemo` dependency arrays, throttle the subscription by returning a rounded value (e.g. `Math.floor(s.currentTime / INTERVAL) * INTERVAL`).
## 2024-05-18 - Zustand Throttling Effectiveness
**Learning:** If a Zustand subscription relies on `Math.floor(currentTime / INTERVAL) * INTERVAL`, it correctly throttles React re-renders. Replacing this with an internal `useFrame` polling loop often introduces complexity and edge case regressions (e.g., missed first-renders) with negligible performance gain over the native throttling mechanism, even at high fast-forward speeds.
**Action:** Do not attempt to bypass React rendering for UI components that are already throttled via Zustand selector intervals unless there is a verified bottleneck beyond the throttling rate.
## 2026-05-22 - Pre-allocating Vector3 in useFrame
**Learning:** Instantiating objects like `new THREE.Vector3()` inside a React Three Fiber `useFrame` loop creates significant garbage collection overhead and can cause frame drops at 60fps.
**Action:** Always pre-allocate static 'scratchpad' vectors outside the component scope and update utility functions to accept an optional `target?: THREE.Vector3` parameter. Pass these pre-allocated vectors into utility functions and Three.js methods to reuse memory instead of creating new objects per frame.
