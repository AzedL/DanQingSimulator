export class StackedBuffState {
  private readonly _useRandom: boolean
  private _layers = 0
  private _probabilities = new Map<number, number>([[0, 1]])

  constructor(useRandom: boolean) {
    this._useRandom = useRandom
  }

  addFixed(layers: number) {
    if (layers <= 0) return

    if (this._useRandom) {
      this._layers += layers
      return
    }

    this._probabilities = new Map(
      [...this._probabilities].map(([current, probability]) => [
        current + layers,
        probability,
      ]),
    )
  }

  addUniform(min: number, max: number) {
    if (min < 0 || max < min) {
      throw new RangeError('Invalid stacked buff range')
    }

    if (this._useRandom) {
      this._layers +=
        Math.floor(Math.random() * (max - min + 1)) + min
      return
    }

    const next = new Map<number, number>()
    const count = max - min + 1
    this._probabilities.forEach((probability, current) => {
      for (let layers = min; layers <= max; layers++) {
        const total = current + layers
        next.set(
          total,
          (next.get(total) ?? 0) + probability / count,
        )
      }
    })
    this._probabilities = next
  }

  consume() {
    if (this._useRandom) {
      if (this._layers <= 0) return 0
      this._layers--
      return 1
    }

    const activeProbability = 1 - (this._probabilities.get(0) ?? 0)
    const next = new Map<number, number>()
    this._probabilities.forEach((probability, current) => {
      const remaining = Math.max(0, current - 1)
      next.set(
        remaining,
        (next.get(remaining) ?? 0) + probability,
      )
    })
    this._probabilities = next
    return activeProbability
  }

  reset() {
    this._layers = 0
    this._probabilities = new Map([[0, 1]])
  }
}
