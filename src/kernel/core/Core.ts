import { getCards } from '../cards'
import { isActiveCard, type ActiveCard, type Card, type CardId } from '../cards/Card'
import { Damage } from './Damage'
import { Fire } from './Fire'
import { Ice } from './Ice'
import { Queue } from './Queue'
import { Thunder } from './Thunder'
import { Wood } from './Wood'

export interface CardOptions {
  id: CardId
  level: number
}

export interface CoreOptions {
  cards: CardOptions[]
  duration: number
  burstDps: number
  sustainedDps: number
  useRandom: boolean
  useLightMode?: boolean
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

  constructor(coreOptions: CoreOptions) {
    this.coreOptions = coreOptions
    this.queue = new Queue()
    this.damage = new Damage(this)
    this.fire = new Fire(this.damage)
    this.ice = new Ice(this.damage)
    this.thunder = new Thunder(this.damage)
    this.wood = new Wood(this.damage)

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
    this.cardsMap.forEach((card) => card.reset())
  }

  private tick() {
    this.queue.process(0.5)
    this.actions.forEach((card) => card.tick())
    this.queue.process(0.5)
    this.damage.commitTick()
  }
}
