import type { Queue } from '../core/Queue'

export interface StackedEffectOptions {
  interval: number
  duration: number
  maxLayers?: number
  onTick: (layers: number) => void
}

export class StackedEffect {
  private readonly _queue: Queue
  private readonly _options: StackedEffectOptions
  private _layers = 0
  private _running = false

  constructor(queue: Queue, options: StackedEffectOptions) {
    this._queue = queue
    this._options = options
  }

  add(count = 1) {
    if (count <= 0) return

    this._layers += count

    if (!this._running) {
      this._running = true
      this._queue.enqueue(() => this.tick(), this._options.interval)
    }

    this._queue.enqueue(() => {
      this._layers = Math.max(0, this._layers - count)
    }, this._options.duration)
  }

  reset() {
    this._layers = 0
    this._running = false
  }

  private tick() {
    if (this._layers <= 0) {
      this._running = false
      return
    }

    this._queue.enqueue(() => this.tick(), this._options.interval)

    this._options.onTick(
      Math.min(
        this._layers,
        this._options.maxLayers ?? Number.POSITIVE_INFINITY,
      ),
    )
  }
}
