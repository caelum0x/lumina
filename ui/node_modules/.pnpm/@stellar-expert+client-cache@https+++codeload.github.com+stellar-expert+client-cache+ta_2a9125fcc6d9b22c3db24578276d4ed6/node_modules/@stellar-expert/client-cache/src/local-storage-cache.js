import {InMemoryClientCache} from './in-memory-cache'

export class LocalStorageClientCache extends InMemoryClientCache {
    /**
     * Create new instance of LocalStorage-backed client cache
     * @param {String} prefix - Instance-wide cache prefix to differentiate between unrelated LocalStorage entries and other cache instances
     * @param {Number} cleanupInterval - Interval (in seconds) between cache cleanup worker launches
     */
    constructor(prefix, cleanupInterval = 2 * 60) {
        super(cleanupInterval)
        this.cachePrefix = prefix
    }

    formatKey(key) {
        return this.cachePrefix + ':' + key
    }

    keys() {
        const {cachePrefix} = this
        return Object.keys(this.storage)
            .filter(key => key.startsWith(cachePrefix))
            .map(key => key.substring(cachePrefix.length))
    }
}