export class CacheItem {
    constructor(data, ts, ttl) {
        this.data = data
        this.ts = ts
        this.ttl = ttl
        Object.freeze(this)
    }

    data

    ts

    ttl

    get isExpired() {
        return new Date().getTime() / 1000 > this.ts + this.ttl
    }

    get isStale() {
        return new Date().getTime() / 1000 > this.ts + this.ttl * 3
    }

    toJSON() {
        return {
            data: this.data,
            ts: this.ts,
            ttl: this.ttl
        }
    }
}