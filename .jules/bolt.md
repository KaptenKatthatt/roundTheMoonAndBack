## 2024-05-28 - Avoid 60fps garbage collection in useFrame when mapping standard arrays
**Learning:** In Three.js applications, standard array methods like `.map(() => new THREE.Vector3(...p))` inside React hooks (like useMemo connected to throttled state) can still trigger thousands of GC allocations during high-speed playback, causing noticeable frame drops as the timeline speeds up.
**Action:** Always pre-allocate module-level `THREE.Vector3` arrays matching the expected size, along with single module-level `_target` vectors for `getPoint()` methods, updating coordinates via `.set()` to completely eliminate GC spikes during rapid updates.

## 2026-05-29 - Module-level Singletons for Static Three.js Objects in Hooks
**Learning:** Using `useMemo` inside custom hooks to cache Three.js objects (e.g., `CatmullRomCurve3`) and helper functions derived from static constant data creates redundant memory allocations and closures for every component instance using the hook. This is a subtle bottleneck when multiple components use the same hook.
**Action:** When a hook relies solely on static data, hoist the data processing, object instantiations, and helper functions to module-level singletons outside the hook. Return the shared references to avoid per-component memory overhead.
