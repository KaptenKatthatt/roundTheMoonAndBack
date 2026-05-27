
## 2024-05-16 - R3F Zustand Subscription Performance
**Learning:** In React Three Fiber, components subscribing directly to a rapidly changing Zustand state (like `currentTime` at 60fps) within the component body will cause expensive React re-renders on every frame.
**Action:** Always read high-frequency state using `useStore.getState()` inside a `useFrame` loop instead of a standard React hook subscription. If a React component must react to high-frequency state for things like `useMemo` dependency arrays, throttle the subscription by returning a rounded value (e.g. `Math.floor(s.currentTime / INTERVAL) * INTERVAL`).
## 2024-05-18 - Zustand Throttling Effectiveness
**Learning:** If a Zustand subscription relies on `Math.floor(currentTime / INTERVAL) * INTERVAL`, it correctly throttles React re-renders. Replacing this with an internal `useFrame` polling loop often introduces complexity and edge case regressions (e.g., missed first-renders) with negligible performance gain over the native throttling mechanism, even at high fast-forward speeds.
**Action:** Do not attempt to bypass React rendering for UI components that are already throttled via Zustand selector intervals unless there is a verified bottleneck beyond the throttling rate.
## 2024-05-26 - Three.js Object Allocation in useFrame
**Learning:** Instantiating new objects like `THREE.Vector3` on every frame inside `useFrame` leads to high garbage collection pressure, dropping frame rates and causing visual stutter in Three.js applications.
**Action:** Pre-allocate static vectors outside the component, and use optional `target` parameters in data hooks (e.g. `getPositionAt(t, _scPos)`) to mutate and reuse these pre-allocated vectors. This avoids generating new instances within render loops.
## 2025-05-27 - Object Allocation in Frequently Called Functions
**Learning:** Functions called within `useFrame` or high-frequency loops (like `getMissionPhase`) that declare static arrays or objects internally will re-allocate memory 60 times a second, causing garbage collection spikes.
**Action:** Always hoist static arrays and objects (like mission phases mappings) to module-level constants outside of frequently called functions to prevent unnecessary memory allocations and GC pauses.
