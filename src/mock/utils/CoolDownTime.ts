export class CoolDownTime {
  private _currentTime: number
  private _time: number
  private _isReady: boolean = false
  private _isDefaultReady: boolean = false
  private _defaultTick: number = 1

  constructor(time: number, isDefaultReady = false, defaultTick = 1) {
    this._time = time
    this._isDefaultReady = isDefaultReady
    this._defaultTick = defaultTick

    this._currentTime = time - (isDefaultReady ? 0 : defaultTick)
    this._isReady = isDefaultReady
  }

  public tick(t: number = this._defaultTick) {
    if (!t) return

    t = t % this._time || this._defaultTick
    const time = this._currentTime - t
    if (time > 0) {
      this._currentTime = time
    } else if (time === 0) {
      this._currentTime = this._time
      this._isReady = true
    } else {
      this._currentTime = time + this._time
      this._isReady = true
    }
  }

  public settle() {
    const ready = this._isReady
    this._isReady = false
    return ready
  }

  public reset() {
    this._currentTime = this._time - (this._isDefaultReady ? 0 : this._defaultTick)
    this._isReady = this._isDefaultReady
  }
}
