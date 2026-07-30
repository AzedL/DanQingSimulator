import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'src/kernel/**/*.test.ts',
      'src/features/autoMock/**/*.test.ts',
      'src/features/simulator/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      include: [
        'src/kernel/**/*.ts',
        'src/features/autoMock/autoMock.ts',
        'src/features/simulator/result.ts',
      ],
      exclude: ['src/**/*.test.ts'],
      reporter: ['text', 'html'],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
})
