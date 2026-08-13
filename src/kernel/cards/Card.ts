import type { Core } from '../core/Core'
import type { CardId } from './cardIds'
import type { SkillUpgrade } from './skillUpgrades'

export type CardType = 'active' | 'passive'
export type { CardId } from './cardIds'
export type { SkillUpgrade } from './skillUpgrades'

export abstract class Card {
  protected readonly _core: Core
  protected readonly _type: CardType
  protected readonly _id: CardId
  protected readonly _key: string
  protected readonly _level: number
  protected readonly _upgrade?: SkillUpgrade

  constructor(core: Core, type: CardType, id: CardId, key: string, level: number) {
    this._core = core
    this._type = type
    this._id = id
    this._key = key
    this._level = level
    this._upgrade = core.coreOptions.cards.find(
      (card) => card.id === id,
    )?.upgrade
    this.init()
  }

  get core() {
    return this._core
  }

  get type() {
    return this._type
  }

  get id() {
    return this._id
  }

  get key() {
    return this._key
  }

  get level() {
    return this._level
  }

  get upgrade() {
    return this._upgrade
  }

  protected abstract init(): void
  abstract reset(): void
}

export interface ActiveCard extends Card {
  tick(): void
}

export function isActiveCard(card: Card): card is ActiveCard {
  return card.type === 'active'
}
