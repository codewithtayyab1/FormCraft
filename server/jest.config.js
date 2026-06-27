module.exports = {
  testEnvironment:     'node',
  setupFiles:          ['./__tests__/env.js'],
  setupFilesAfterEnv: ['./__tests__/setup.js'],
  testMatch:           ['**/__tests__/**/*.test.js'],
  testTimeout:         30000,
  verbose:             true,
  forceExit:           true,
}
