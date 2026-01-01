const jestUnitConfig = require('@wordpress/scripts/config/jest-unit.config');

const config = structuredClone(jestUnitConfig);

config.moduleNameMapper = {
  ...config.moduleNameMapper,
  '^@src/(.*)$': '<rootDir>/src/$1',
  '^@tests/(.*)$': '<rootDir>/tests/$1',
  '^@public/(.*)$': '<rootDir>/public/$1',
};


module.exports = config;