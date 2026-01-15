import { Core, type CoreOptions } from './core/Core'
import { normalizeMockOptions, type MockOptions } from './utils/normalizeMockOptions'

export function normalizeOption(mockOptions: MockOptions) {
  return normalizeMockOptions(mockOptions)
}

export function mock(coreOptions: CoreOptions) {
  const core = new Core({ ...coreOptions })
  core.exec()
  return core
}
