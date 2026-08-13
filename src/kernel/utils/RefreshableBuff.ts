import type { Queue } from '../core/Queue'

interface BuffSession {}

export interface RefreshableBuffOptions {
  onStart: () => void
  onEnd: () => void
}

export class RefreshableBuff {
  private readonly _queue: Queue
  private readonly _options: RefreshableBuffOptions
  private _current?: BuffSession

  constructor(queue: Queue, options: RefreshableBuffOptions) {
    this._queue = queue
    this._options = options
  }

  refresh(duration: number) {
    if (!this._current) this._options.onStart()

    const session = {}
    this._current = session
    this._queue.enqueue(() => {
      if (this._current !== session) return

      this._current = undefined
      this._options.onEnd()
    }, duration)
  }

  reset() {
    this._current = undefined
  }
}
