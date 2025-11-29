import {CacheItem} from './cache-item'

export class InMemoryClientCache {
    /**
     * Create new instance of ClientCache with simple in-memory storage
     * @param {Number} cleanupInterval - Interval (in seconds) between cache cleanup worker launches
     */
    constructor(cleanupInterval = 2 * 60) {
        this.cleanupInterval = cleanupInterval
        this.storage = {}

        const cleanupApiCache = () => {
            for (const key of this.keys())
                this.get(key) //the getter will cleanup stale entries automatically
            setTimeout(cleanupApiCache, cleanupInterval * 1000)
        }
        cleanupApiCache()
    }


    /**
     * @param {String} key
     * @return {String}
     */
    formatKey(key) {
        return key
    }

    /**
     * Check whether cache contains given item
     * @param {String} key
     * @return {Boolean}
     */
    has(key) {
        return !!this.storage[this.formatKey(key)]
    }

    /**
     * Try to retrieve an item from the cache
     * @param {String} key
     * @return {CacheItem|null}
     */
    get(key) {
        let item = this.storage[this.formatKey(key)]
        if (!item) return null
        if (item.isStale) {
            //the data is too old
            delete this.storage[this.formatKey(key)]
            return null
        }
        return item
    }

    /**
     * Add/replace cache object
     * @param {String} key - Unique key
     * @param {Object} value - Associsated value to stoe
     * @param {Number} [ttl] - Time-to-live in seconds (equals cleanupInterval by default). Once elapsed – the data is considered expired. After 3*ttl – stale.
     * @returns {CacheItem}
     */
    set(key, value, ttl) {
        const cacheItem = new CacheItem(value, Math.round(new Date().getTime() / 1000), ttl || this.cleanupInterval)
        this.storage[this.formatKey(key)] = cacheItem
        return cacheItem
    }

    /**
     * Get all stored cache keys
     * @return {String[]}
     */
    keys() {
        return Object.keys(this.storage)
    }

    /**
     * Remove an item from cache
     * @param {String} key
     */
    delete(key) {
        delete this.storage[this.formatKey(key)]
    }

    /**
     * Remove all cache entries
     */
    clear() {
        for (const key of this.keys()) {
            this.delete(key)
        }
    }
}