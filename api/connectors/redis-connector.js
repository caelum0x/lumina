const redis = require('redis')

let client = null
let isConnecting = false

async function connect() {
    if (client) return client
    if (isConnecting) return null
    
    if (!process.env.REDIS_URL) {
        console.log('Redis not configured, using in-memory cache')
        return null
    }

    isConnecting = true
    try {
        client = redis.createClient({
            url: process.env.REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) return false
                    return Math.min(retries * 50, 500)
                }
            }
        })

        client.on('error', (err) => {
            console.error('Redis error:', err)
            client = null
        })

        client.on('disconnect', () => {
            console.log('Redis disconnected')
            client = null
        })

        await client.connect()
        console.log('Redis connected')
        isConnecting = false
        return client
    } catch (err) {
        console.error('Redis connection failed:', err)
        client = null
        isConnecting = false
        return null
    }
}

async function get(key) {
    if (!client) return null
    try {
        const value = await client.get(key)
        return value ? JSON.parse(value) : null
    } catch (err) {
        console.error('Redis get error:', err)
        return null
    }
}

async function set(key, value, ttl = 300) {
    if (!client) return false
    try {
        await client.setEx(key, ttl, JSON.stringify(value))
        return true
    } catch (err) {
        console.error('Redis set error:', err)
        return false
    }
}

async function del(key) {
    if (!client) return false
    try {
        await client.del(key)
        return true
    } catch (err) {
        console.error('Redis del error:', err)
        return false
    }
}

async function disconnect() {
    if (client) {
        try {
            await client.quit()
            client = null
        } catch (err) {
            console.error('Redis disconnect error:', err)
        }
    }
}

module.exports = {connect, get, set, del, disconnect}
