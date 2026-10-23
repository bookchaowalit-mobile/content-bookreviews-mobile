module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '<rootDir>/lib/**/*.test.[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Count every screen and lib file, including ones no test imports yet,
  // so the CI coverage gate reflects the whole app.
  collectCoverageFrom: ['app/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', '!**/*.test.{ts,tsx}'],
};
