import type WsClient from './index'

// 心跳配置
export type HeartbeatOptions = Partial<{
  enable: boolean, // 是否启用

  interval: number, // 心跳默认 30s
  maxRetryNumber: number, // 最大重试次数 - 超过后重连

  sendContent: string, // 心跳发送内容
  receiveContent: string // 心跳接收内容
}>

export default class HeartbeatDetect {
  private readonly interval: number = 30000 // 心跳间隔

  private readonly maxRetryNumber: number = 0 // 最大 重试次数

  private readonly sendContent: string = 'ping' // 最大 重试次数

  private readonly receiveContent: string = 'pong' // 最大 重试次数

  private timer: any // 定时器

  private retryNumber = 0 // 当前 重试次数

  private pongStatus = 0 // pong 响应状态，0：初始化 1：服务端未响应 2：服务端已响应

  private readonly ws: WsClient

  constructor(ws: WsClient, options?: HeartbeatOptions) {
    this.ws = ws

    if (options?.interval) {
      this.interval = options.interval
    }
    if (options?.maxRetryNumber) {
      this.maxRetryNumber = options.maxRetryNumber
    }
    if (options?.sendContent) {
      this.sendContent = options.sendContent
    }
    if (options?.receiveContent) {
      this.receiveContent = options.receiveContent
    }
  }

  start(): void {
    this.stop()

    this.timer = setInterval(() => {
      if (this.pongStatus === 1) {
        // 未响应次数
        this.retryNumber++

        this.ws.console('heartbeat retryNumber', this.retryNumber)

        if (this.retryNumber >= this.maxRetryNumber) {
          // 心跳未响应次数超过最大重试次数
          this.stop()
          this.resetParams()
          // 重连
          this.ws.reconnectStart()
          return
        }
      }

      this.send()

      this.pongStatus = 1
    }, this.interval)
  }

  stop(): void {
    clearInterval(this.timer)
  }

  // 发送
  send(): void {
    this.ws.send(this.sendContent)
  }

  // 接收到 pong
  pong(): void {
    this.pongStatus = 2
  }

  // 重置参数
  private resetParams(): void {
    this.retryNumber = 0
    this.pongStatus = 0
  }

  // 判断是否是心跳响应
  isHeartbeatResponse(data: string): boolean {
    return data === this.receiveContent
  }
}
