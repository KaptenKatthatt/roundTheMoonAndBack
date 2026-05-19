
## 2024-05-16 - R3F Zustand Subscription Performance
**Learning:** In React Three Fiber, components subscribing directly to a rapidly changing Zustand state (like `currentTime` at 60fps) within the component body will cause expensive React re-renders on every frame.
**Action:** Always read high-frequency state using `useStore.getState()` inside a `useFrame` loop instead of a standard React hook subscription. If a React component must react to high-frequency state for things like `useMemo` dependency arrays, throttle the subscription by returning a rounded value (e.g. `Math.floor(s.currentTime / INTERVAL) * INTERVAL`).
## 2024-05-18 - Zustand Throttling Effectiveness
**Learning:** If a Zustand subscription relies on `Math.floor(currentTime / INTERVAL) * INTERVAL`, it correctly throttles React re-renders. Replacing this with an internal `useFrame` polling loop often introduces complexity and edge case regressions (e.g., missed first-renders) with negligible performance gain over the native throttling mechanism, even at high fast-forward speeds.
**Action:** Do not attempt to bypass React rendering for UI components that are already throttled via Zustand selector intervals unless there is a verified bottleneck beyond the throttling rate.

## 2026-05-19 - Pre-allocating vectors to reduce GC
**Learning:** In Three.js and React Three Fiber, instantiating `THREE.Vector3` inside `useFrame` causes significant garbage collection overhead, leading to frame drops. Passing optional target vectors to data accessor functions avoids the need for object instantiation per frame.
**Action:** Pre-allocate vectors at module scope to act as reusable scratchpads for `useFrame` and pass them into functions like `curve.getPoint` and `getMoonScenePosition` to allow in-place mutation.
