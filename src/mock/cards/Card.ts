import type { Core } from '../core/Core'
import type { TCardIds } from '../dataBase/dataBase'

export abstract class Card {
  _id: TCardIds
  _key: string
  _core: Core

  constructor(core: Core, id: TCardIds, key: string) {
    this._id = id
    this._key = key
    this._core = core
  }

  abstract action(): void

  abstract settle(): void

  abstract reset(): void
}
