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
    // Basic eviction strategy to prevent memory leak
    store.clear()
  }
  store.set(key, { data, expires: Date.now() + ttlMs })
}
