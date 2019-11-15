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
    '.d.ts'
  ],
  transformIgnorePatterns: [
    '/node_modules/',
    '/tests/',
  ]
};