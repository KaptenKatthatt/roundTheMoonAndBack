interface CacheEntry<T> {
  data: T
  expires: number
}

const store = new Map<string, CacheEntry<unknown>>()

export function getCache<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() > entry.expires) {
    store.delete(key)
    return null
  }
  return entry.data
}

const MAX_CACHE_SIZE = 1000

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  if (store.size >= MAX_CACHE_SIZE) {
    // 🛡️ Sentinel: Use FIFO eviction strategy (deleting oldest entry)
    // instead of store.clear() to prevent DoS via cache thrashing
    const oldestKey = store.keys().next().value;
    if (oldestKey !== undefined) {
      store.delete(oldestKey);
    }
  }
  store.set(key, { data, expires: Date.now() + ttlMs })
}
