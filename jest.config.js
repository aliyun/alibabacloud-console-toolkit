module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/fixtures/',
    '/templates'
  ],
  transformIgnorePatterns: [
    '/node_modules/'
  ],
  coverageDirectory: "./coverage",
  coverageReporters: ["json", "text", "lcov", "clover"]
};