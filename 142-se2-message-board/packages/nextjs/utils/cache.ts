// packages/nextjs/utils/cache.ts
interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiry: number;
}

class MemoryCache {
    private cache = new Map<string, CacheItem<any>>();
    private defaultTTL = 5 * 60 * 1000; // 5 分鐘

    set<T>(key: string, data: T, ttl?: number): void {
        const expiry = Date.now() + (ttl || this.defaultTTL);
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiry,
        });
    }

    get<T>(key: string): T | null {
        const item = this.cache.get(key);

        if (!item) {
            return null;
        }

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    has(key: string): boolean {
        const item = this.cache.get(key);

        if (!item) {
            return false;
        }

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        return this.cache.size;
    }
}

export const ipfsCache = new MemoryCache();