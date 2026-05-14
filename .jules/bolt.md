## 2024-05-24 - React Three Fiber Zustand Subscription Performance
**Learning:** Subscribing to rapidly changing Zustand state (like `currentTime` during animation playback) directly in the component body of a React Three Fiber component causes the entire component to re-render 60 times per second, leading to significant performance degradation.
**Action:** Always read rapidly changing state directly from the store inside the `useFrame` loop using `useStore.getState()` instead of subscribing to it with the `useStore(selector)` hook.
