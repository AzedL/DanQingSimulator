import type { Core } from '../core/Core'
import type { CardId } from '@/domain/cards/cardIds'

export abstract class Card {
  _id: CardId
  _key: string
  _core: Core

  constructor(core: Core, id: CardId, key: string) {
    this._id = id
    this._key = key
    this._core = core
  }

  abstract action(): void

  abstract settle(): void

  abstract reset(): void
}
