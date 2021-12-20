export type CallbackFunction = (...params: any[]) => any

export default class EventHub {
  private events: Record<string, CallbackFunction[]> = {}

  on(eventName: string, cb: CallbackFunction): void {
    if (Array.isArray(this.events[eventName])) {
      this.events[eventName].push(cb.bind(this))
    } else {
      this.events[eventName] = [cb.bind(this)]
    }
  }

  remove(eventName: string, cb: CallbackFunction): void {
    if (Array.isArray(this.events[eventName])) {
      const index = this.events[eventName].indexOf(cb)
      this.events[eventName].splice(index, 1)
    }
  }

  emit(eventName: string, ...arg: any[]): void {
    if (Array.isArray(this.events[eventName])) {
      this.events[eventName].forEach(cb => {
        if (typeof cb === 'function') {
          cb(...arg)
        }
      })
    }
  }
}
