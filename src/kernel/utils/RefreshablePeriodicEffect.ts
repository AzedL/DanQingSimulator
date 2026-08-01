import type { Queue } from '../core/Queue'

interface PeriodicSession {
  interval: number
  remainingTicks: number
}

export interface RefreshablePeriodicEffectOptions {
  onTick: () => void
  onEnd?: () => void
}

export class RefreshablePeriodicEffect {
  private readonly _queue: Queue
  private readonly _options: RefreshablePeriodicEffectOptions
  private _current?: PeriodicSession

  constructor(
    queue: Queue,
    options: RefreshablePeriodicEffectOptions,
  ) {
    this._queue = queue
    this._options = options
  }

  refresh(interval: number, totalTicks: number) {
    const coveredRemainingTicks = this._current?.remainingTicks
    const session = { interval, remainingTicks: totalTicks }

    this._current = session
    this._queue.enqueue(() => this.tick(session), interval)

    return coveredRemainingTicks
  }

  reset() {
    this._current = undefined
  }

  private tick(session: PeriodicSession) {
    if (this._current !== session) return

    session.remainingTicks--
    const ended = session.remainingTicks === 0

    if (ended) {
      this._current = undefined
    } else {
      this._queue.enqueue(
        () => this.tick(session),
        session.interval,
      )
    }

    this._options.onTick()
    if (ended) this._options.onEnd?.()
  }
}
