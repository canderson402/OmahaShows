// Simple client-side cache with TTL support
// Used to reduce redundant API calls and improve perceived performance

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL: number;

  constructor(defaultTTL = 60000) { // Default: 1 minute
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get a cached value if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + (ttl ?? this.defaultTTL),
    });
  }

  /**
   * Check if a key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Invalidate a specific key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix
   */
  invalidatePrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    // Clean up expired entries first
    for (const [key, entry] of this.cache.entries()) {
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key);
      }
    }

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Cache instances with different TTLs for different data types
export const eventCache = new QueryCache(60000);      // 1 minute for events
export const historyCache = new QueryCache(300000);   // 5 minutes for history
export const venueCache = new QueryCache(600000);     // 10 minutes for venues (rarely change)
export const sourcesCache = new QueryCache(60000);    // 1 minute for sources

/**
 * Generate a cache key from query parameters
 */
export function getCacheKey(prefix: string, params?: Record<string, unknown>): string {
  if (!params) return prefix;

  const sortedParams = Object.keys(params)
    .sort()
    .map(k => `${k}=${JSON.stringify(params[k])}`)
    .join('&');

  return `${prefix}:${sortedParams}`;
}

/**
 * Helper to wrap a fetch function with caching
 */
export async function withCache<T>(
  cache: QueryCache,
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Check cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch and cache
  const data = await fetcher();
  cache.set(key, data, ttl);
  return data;
}

/**
 * Invalidate all event-related caches
 * Call this after admin actions (approve, reject, edit, delete)
 */
export function invalidateEventCaches(): void {
  eventCache.clear();
  historyCache.clear();
  sourcesCache.clear();
}
