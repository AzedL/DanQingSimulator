interface QueueItem {
  task: () => void
  delay: number
}

export class Queue {
  private _queue: QueueItem[] = []

  constructor() {}

  public enqueue(task: () => void, delay = 0) {
    if (delay <= 0) {
      task()
      return
    }

    this._queue.push({ task, delay })
  }

  public process() {
    if (!this._queue.length) return

    const queue = this._queue
    this._queue = []
    queue.forEach(({ task, delay }) => {
      let newDelay = delay - 1
      this.enqueue(task, newDelay)
    })
  }

  public reset() {
    this._queue = []
  }
}
