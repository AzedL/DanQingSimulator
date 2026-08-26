import { applyTianGongDamageBoosts, getCards } from '../cards'
import {
  isActiveCard,
  type ActiveCard,
  type Card,
  type CardId,
  type SkillUpgrade,
} from '../cards/Card'
import { Damage } from './Damage'
import { Fire } from './Fire'
import { Ice } from './Ice'
import { Queue } from './Queue'
import { Thunder } from './Thunder'
import { Wood } from './Wood'

export interface CardOptions {
  id: CardId
  level: number
  upgrade?: SkillUpgrade
}

export interface CoreOptions {
  cards: CardOptions[]
  duration: number
  burstDps: number
  sustainedDps: number
  useRandom: boolean
  useLightMode?: boolean
  enhancementLevel?: number
}

export class Core {
  readonly coreOptions: CoreOptions
  readonly queue: Queue
  readonly damage: Damage
  readonly fire: Fire
  readonly ice: Ice
  readonly thunder: Thunder
  readonly wood: Wood
  readonly cardsMap = new Map<CardId, Card>()
  readonly actions: ActiveCard[] = []
  private _lingYunValueBoost = 0

  constructor(coreOptions: CoreOptions) {
    this.coreOptions = coreOptions
    this.queue = new Queue()
    this.damage = new Damage(this)
    this.fire = new Fire(this.damage)
    this.ice = new Ice(this.damage)
    this.thunder = new Thunder(this.damage)
    this.wood = new Wood(this.damage)

    applyTianGongDamageBoosts(this)
    getCards(this).forEach((card) => {
      this.cardsMap.set(card.id, card)
      if (isActiveCard(card)) this.actions.push(card)
    })
  }

  exec() {
    for (let time = 0; time < this.coreOptions.duration; time++) {
      this.tick()
    }
  }

  reset() {
    this.queue.reset()
    this.damage.reset()
    this.fire.reset()
    this.ice.reset()
    this.thunder.reset()
    this.wood.reset()
    this._lingYunValueBoost = 0
    applyTianGongDamageBoosts(this)
    this.cardsMap.forEach((card) => card.reset())
  }

  get lingYunValueMultiplier() {
    return 1 + this._lingYunValueBoost
  }

  addLingYunValueBoost(boost: number) {
    this._lingYunValueBoost += boost
  }

  removeLingYunValueBoost(boost: number) {
    this._lingYunValueBoost -= boost
  }

  private tick() {
    this.queue.process(0.5)
    this.actions.forEach((card) => card.tick())
    this.queue.process(0.5)
    this.damage.commitTick()
  }
}
