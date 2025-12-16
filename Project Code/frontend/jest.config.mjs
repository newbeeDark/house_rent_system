export default {
  testEnvironment: 'node',
  verbose: true,
  roots: ['<rootDir>/tests'],
  testMatch: ['**/tests/**/*_test.js', '**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageReporters: ['text', 'json', 'lcov'],
};

