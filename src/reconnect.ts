import type WsClient from './index'

export type ReconnectOptions = Partial<{
  enable: boolean, // 是否启用

  interval: number, // 重连之前 延迟时间间隔 - 1s
  maxInterval: number, // 重连之前 最大 延迟时间间隔 - 30s
  decay: number, // 重新连接延迟的增加速率 - 每次重连的延迟时间是上次的 decay 倍
  maxNumber: number // 最大重连次数 - 默认无穷大（不限制）
}>

export default class Reconnect {
  // 重连之前 延迟时间间隔（初始） - 1s
  private readonly interval: number = 1000

  // 重连之前 最大 延迟时间间隔 - 30s
  private readonly maxInterval: number = 30000

  // 重新连接延迟的增加速率 - 每次重连的延迟时间是上次的 decay 倍
  private readonly decay: number = 2

  // 最大重连次数 - 默认无穷大（不限制）
  private readonly maxNumber: number = Infinity

  // 重连 定时器
  private timer: any

  // 已重连次数
  private reconnectNumber = 0

  // 当前重连延迟时间 - 会根据已重连次数变化
  private currentInterval = 0

  private readonly ws: WsClient

  constructor(ws: WsClient, options?: ReconnectOptions) {
    this.ws = ws

    if (options?.interval) {
      this.interval = options.interval
    }
    if (options?.maxInterval) {
      this.maxInterval = options.maxInterval
    }
    if (options?.decay) {
      this.decay = options.decay
    }
    if (options?.maxNumber) {
      this.maxNumber = options.maxNumber
    }
  }

  // 开始重连
  start(): void {
    // 校验是否需要重连
    if (this.timer) {
      return
    }

    // 校验重连次数是否超限
    if (this.reconnectNumber >= this.maxNumber) {
      this.ws.console('reconnect', 'connection times out of limit')

      return
    }
    this.ws.console('reconnect', 'reconnectNumber', this.reconnectNumber)

    // 获取延迟时间
    this.currentInterval = this.getInterval()
    this.ws.console('reconnect', 'interval', this.currentInterval)

    this.timer = setTimeout(() => {
      this.timer = null

      this.reconnectWs()
    }, this.currentInterval)
  }

  // 计算 重连 延迟时间间隔
  private getInterval(): number {
    let res = this.currentInterval * this.decay

    if (res >= this.maxInterval) {
      res = this.maxInterval
    } else if (res === 0) {
      res = this.interval
    }

    return res
  }

  private reconnectWs(): void {
    this.ws.console('reconnect start')

    this.ws.connect()

    // 更新 重连次数
    this.reconnectNumber++
  }

  resetParams(): void {
    this.reconnectNumber = 0
    this.currentInterval = 0
  }
}
