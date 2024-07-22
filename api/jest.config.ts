// module.exports = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   modulePaths: ['<rootDir>/src'],
//   setupFilesAfterEnv: ['<rootDir>/src/controllers/__tests__/setupTests.ts'], // Arquivo para setup de testes
//   collectCoverage: true, // Habilita a coleta de cobertura de testes
//   coverageDirectory: '<rootDir>/coverage', // Diretório onde será gerado o relatório de cobertura
//   coverageReporters: ['lcov', 'text', 'text-summary'], // Tipos de relatórios de cobertura

// }

/*
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePaths: ['<rootDir>/src'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['lcov', 'text', 'text-summary'],
  moduleNameMapper: {
    '^@prisma/client$': '<rootDir>/src/controllers/__mocks__/prisma.ts'
  }
};

export default config;

*/

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@prisma/client$': '<rootDir>/src/controllers/__mocks__/prismaClient.ts',
  },
};