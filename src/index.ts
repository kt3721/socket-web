import { get, isObject } from 'lodash-es'
import EventHub from './event-hub'
import Heartbeat from './heartbeat'
import type { HeartbeatOptions } from './heartbeat'
import Reconnect from './reconnect'
import type { ReconnectOptions } from './reconnect'

export type WsOptions = Partial<{
  debug: boolean,
  autoConnect: boolean,

  reconnect: ReconnectOptions,

  heartbeat: HeartbeatOptions
}>

export default class WsClient extends EventHub {
  private readonly url: string // WebSocket 实例化参数

  private readonly protocols: string[] // WebSocket 实例化参数

  // 配置
  options: WsOptions = {
    debug: false, // 是否输出调试信息
    autoConnect: true // 是否在实例化时立即连接
  }

  // 非空断言，属性后加 ！
  private ws!: WebSocket // WebSocket 实例

  private heartbeat!: Heartbeat // 心跳检测实例

  private reconnect!: Reconnect // 重连实例

  private activeDisconnect = false // 主动关闭连接 - 此时不会重连

  constructor(url: string, protocols?: string[], options?: WsOptions) {
    super()

    this.url = url
    this.protocols = protocols || []
    this.options = {
      ...this.options,
      ...options
    }

    if (this.options.autoConnect) {
      this.connect()
    }

    this.reconnectInit(this.options.reconnect)
    this.heartbeatInit()
  }

  // 重连
  private reconnectInit(options?: HeartbeatOptions): void {
    if (this.reconnectEnable()) {
      this.reconnect = new Reconnect(this, options)
    }
  }

  private reconnectParamsReset(): void {
    if (this.reconnectEnable()) {
      this.reconnect.resetParams()
    }
  }

  reconnectStart(): void {
    if (this.reconnectEnable()) {
      // 主动关闭连接 时 无需重连
      if (this.activeDisconnect) {
        this.activeDisconnect = false // 重置状态 - 避免影响需要重连的情况
        this.console('Active disconnect, no need to reconnect')
        return
      }

      this.console('Close current connection, connection status', this.ws.readyState)

      /*
      * 关闭当前连接，并且此时不需要重连
      * 使用 this.close 会导致无法重连，所以使用 this.ws.close
      * */
      this.ws.close()

      // 重新连接
      this.reconnect.start()
    }
  }

  private reconnectEnable(): boolean {
    return !!get(this.options, 'reconnect.enable')
  }

  // 心跳
  private heartbeatInit(): void {
    if (this.heartbeatEnable()) {
      this.heartbeat = new Heartbeat(this, this.options.heartbeat)
    }
  }

  private heartbeatStart(): void {
    if (this.heartbeatEnable()) {
      this.heartbeat.start()
    }
  }

  private heartbeatStop(): void {
    if (this.heartbeatEnable()) {
      this.heartbeat.stop()
    }
  }

  private heartbeatEnable(): boolean {
    return !!get(this.options, 'heartbeat.enable')
  }

  // 连接 websocket
  connect(): void {
    this.console('connect start')

    this.ws = new WebSocket(this.url, this.protocols)

    this.ws.onopen = this.onOpenListener.bind(this)
    this.ws.onmessage = this.onMessageListener.bind(this)
    this.ws.onclose = this.onCloseListener.bind(this)
    this.ws.onerror = this.onErrorListener.bind(this)
  }

  // 事件监听
  private onOpenListener(event: Event): void {
    this.console('onopen', event)
    this.heartbeatStart()
    this.reconnectParamsReset()

    this.emit('open', event)
  }

  private onMessageListener(event: MessageEvent): void {
    this.console('onmessage', event)
    this.heartbeatStart()

    if (this.heartbeat.isHeartbeatResponse(event.data)) {
      this.heartbeat.pong()
      return
    }

    this.emit('message', event)
  }

  private onCloseListener(event: CloseEvent): void {
    this.console('onclose', event)

    this.heartbeatStop()

    this.emit('close', event)

    this.reconnectStart()
  }

  private onErrorListener(event: Event): void {
    this.console('onerror', event)

    this.heartbeatStop()

    this.emit('error', event)

    this.reconnectStart()
  }

  // 封装 WebSocket 方法
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView | Record<any, any>): void {
    this.console('send', data)

    if (isObject(data)) {
      data = JSON.stringify(data)
    }
    this.ws.send(data)
  }

  // 关闭 连接 - 主动关闭，无需重连
  close: WebSocket['close'] = (code, reason) => {
    this.console('close', code, reason)

    this.activeDisconnect = true

    this.ws.close(code, reason)
  }

  // 日志输出
  console(...data: any[]): void {
    if (this.options.debug) {
      console.info(...data)
    }
  }
}
