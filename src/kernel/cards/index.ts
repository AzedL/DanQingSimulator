import type { Core } from '../core/Core'
import { getRuntimeCards } from '@/domain/rules/cardDefinitions'

export function getCards(core: Core) {
  return getRuntimeCards(core)
}
