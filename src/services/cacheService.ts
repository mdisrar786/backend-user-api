import { CacheStats, CacheEntry } from '../types';

export class CacheService {
  private cache: Map<string, CacheEntry>;
  private stats: CacheStats;
  private maxSize: number;
  private staleCleanupInterval: NodeJS.Timeout;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      averageResponseTime: 0,
      totalRequests: 0
    };
    
    // Clean up stale entries every 30 seconds
    this.staleCleanupInterval = setInterval(() => {
      this.cleanupStaleEntries();
    }, 30000);
  }

  get(key: string): any {
    const entry = this.cache.get(key);
    
    if (entry && !this.isStale(entry)) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, entry);
      this.stats.hits++;
      return entry.data;
    }
    
    if (entry) {
      this.cache.delete(key);
      this.stats.size--;
    }
    
    this.stats.misses++;
    return null;
  }

  set(key: string, data: any, ttl: number = 60000): void {
    // If cache is full, remove least recently used item
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.getFirstKey();
      if (firstKey) {
        this.cache.delete(firstKey);
        this.stats.size--;
      }
    }

    if (!this.cache.has(key)) {
      this.stats.size++;
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size--;
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  updateStats(responseTime: number): void {
    this.stats.totalRequests++;
    this.stats.averageResponseTime = 
      (this.stats.averageResponseTime * (this.stats.totalRequests - 1) + responseTime) / 
      this.stats.totalRequests;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private isStale(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private cleanupStaleEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.stats.size--;
      }
    }
  }

  private getFirstKey(): string | null {
    const firstEntry = this.cache.keys().next();
    return firstEntry.done ? null : firstEntry.value;
  }

  destroy(): void {
    clearInterval(this.staleCleanupInterval);
    this.cache.clear();
  }
}