/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
};
