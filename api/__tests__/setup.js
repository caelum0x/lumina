/**
 * Test setup for API tests
 */

// Set test environment
process.env.NODE_ENV = 'test'

// Mock MongoDB connection
jest.mock('../connectors/mongodb-connector', () => ({
    init: jest.fn(() => Promise.resolve()),
    public: {
        collection: jest.fn(() => ({
            find: jest.fn(() => ({
                toArray: jest.fn(() => Promise.resolve([])),
                sort: jest.fn(function() { return this }),
                limit: jest.fn(function() { return this }),
                skip: jest.fn(function() { return this })
            })),
            findOne: jest.fn(() => Promise.resolve(null)),
            insertOne: jest.fn(() => Promise.resolve({insertedId: 'test-id'})),
            updateOne: jest.fn(() => Promise.resolve({modifiedCount: 1}))
        }))
    },
    testnet: {
        collection: jest.fn(() => ({
            find: jest.fn(() => ({
                toArray: jest.fn(() => Promise.resolve([])),
                sort: jest.fn(function() { return this }),
                limit: jest.fn(function() { return this })
            })),
            findOne: jest.fn(() => Promise.resolve(null))
        }))
    }
}))

// Mock Elasticsearch connection
jest.mock('../connectors/elastic-connector', () => ({
    enumerateIndexes: jest.fn(() => Promise.resolve())
}))

// Increase timeout for async tests
jest.setTimeout(10000)

