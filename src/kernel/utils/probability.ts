function random(probability: number) {
  if (probability < 0) probability = 0
  if (probability > 1) probability = 1
  return +(Math.random() < probability)
}

export function fluctuate(value: number, variance: number = 0) {
  return value + (Math.random() - 0.5) * 2 * variance * value
}

export function handleProbability(probability: number, useRandom = false, count = 1) {
  if (!useRandom) return probability * count

  let result = 0
  for (let i = 0; i < count; i++) {
    result += random(probability)
  }
  return result
}

export type DiscreteStateInitializer<T> = () => T[]

export class DiscreteState<T> {
  private readonly _initial: DiscreteStateInitializer<T>
  private _index = 0
  private _states: T[]

  constructor(initial: DiscreteStateInitializer<T>) {
    this._initial = initial
    this._states = this._initial()
  }

  next() {
    const state = this._states[this._index]
    this._index++

    if (this._index === this._states.length) {
      this.reset()
    }

    return state
  }

  reset() {
    this._index = 0
    this._states = this._initial()
  }
}
