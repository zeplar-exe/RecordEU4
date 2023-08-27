const jestConfig = {
    verbose: true,
    'transform': {
        '^.+\\.jsx?$': 'babel-jest',
    },
    testMatch: ['**/__tests__/*.test.js?(x)'],
}

module.exports = jestConfig