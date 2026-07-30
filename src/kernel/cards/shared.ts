import type { Core } from '../core/Core'
import type { Card, CardId } from './Card'

export function getCard<T extends Card>(core: Core, id: CardId) {
  return core.cardsMap.get(id) as T | undefined
}

export function enqueueRepeated(
  core: Core,
  times: number,
  interval: number,
  task: () => void,
) {
  for (let index = 1; index <= times; index++) {
    core.queue.enqueue(task, interval * index)
  }
}

export function deductBaseDamageDuringCast(
  core: Core,
  duration: number,
) {
  for (let second = 0; second < duration; second++) {
    const multiplier = Math.min(1, duration - second)
    if (second === 0) {
      core.damage.deductBaseDamage(multiplier)
      continue
    }
    core.queue.enqueue(() => {
      core.damage.deductBaseDamage(multiplier)
    }, second)
  }
}

export function forEachIndependentCount(
  count: number,
  task: (weight: number) => void,
) {
  for (let index = 0; index < Math.ceil(count); index++) {
    task(Math.min(1, count - index))
  }
}
