interface QueueItem {
  task: () => void
  delay: number
}

export class Queue {
  private _queue: QueueItem[] = []

  enqueue(task: () => void, delay = 0) {
    if (delay <= 0) {
      task()
      return
    }

    this._queue.push({ task, delay })
  }

  process(time: number) {
    if (!this._queue.length) return

    const queue = this._queue
    this._queue = []

    queue.forEach(({ task, delay }) => {
      this.enqueue(task, delay - time)
    })
  }

  reset() {
    this._queue = []
  }
}
