module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
    testMatch: [
        '**/__tests__/**/*.test.js'
    ],
    collectCoverageFrom: [
        'business-logic/**/*.js',
        'api/**/*.js',
        '!**/__tests__/**',
        '!**/node_modules/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1'
    }
}

