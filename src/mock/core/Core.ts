import { getCards } from '../cards'
import type { Card } from '../cards/Card'
import type { TCardIds } from '../dataBase/dataBase'
import { Damage } from './Damage'
import { Fire } from './Fire'
import { Ice } from './Ice'
import { getOptions, type Options } from './options'
import { Pulse } from './Pulse'
import { Queue } from './Queue'

export interface CardOptions {
  id: TCardIds
  level: number
}
export interface CoreOptions {
  cards: CardOptions[]
  cost: number
  coreAttribute: number
  _coreAttribute: number
  attackPower: number
  basicDamage: number
  _basicDamage: number
  duration: number
  useRandom: boolean
}

export class Core {
  coreOptions: CoreOptions
  options: Options
  queue: Queue
  dps: Damage
  fire: Fire
  ice: Ice
  pulse: Pulse
  cards: Card[] = []

  constructor(coreOptions: CoreOptions) {
    this.coreOptions = coreOptions
    this.options = getOptions(coreOptions)
    this.queue = new Queue()
    this.dps = new Damage(this)
    this.fire = new Fire(this)
    this.pulse = new Pulse(this)
    this.ice = new Ice(this)
    this.cards = getCards(this)
  }

  exec() {
    const duration = this.coreOptions.duration
    for (let t = 0; t < duration; t++) {
      tick(this)
    }
  }

  reset() {
    this.queue.reset()
    this.dps.reset()
    this.fire.reset()
    this.pulse.reset()
    this.ice.reset()
    this.cards.forEach((card) => {
      card.reset()
    })
  }
}

const tick = (core: Core) => {
  core.queue.process()

  core.cards.forEach((card) => {
    card.action()
  })

  core.ice.settle()
  core.pulse.settle()
  core.fire.settle()
  core.dps.settle()
}
