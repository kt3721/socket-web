# socket-web

浏览器端使用的 webSocket 客户端

## 安装

```shell
npm i socket-web -S

# 或

yarn add socket-web
```

## 使用

```ts
import SocketWeb from 'socket-web'

const ws = new SocketWeb('wss://example.com')

ws.on('message', ({ data }: MessageEvent) => {
  console.log('new message:', data)
})
```

## 配置

### 语法

> const ws = new SocketWeb(url [, protocols, options])

#### url

**与 `Websocket` 参数一致**

要连接的URL；这应该是WebSocket服务器将响应的URL。

#### protocols

**与 `Websocket` 参数一致**

一个协议字符串或者一个包含协议字符串的数组。这些字符串用于指定子协议，这样单个服务器可以实现多个WebSocket子协议（例如，您可能希望一台服务器能够根据指定的协议（`protocol`）处理不同类型的交互）。如果不指定协议字符串，则假定为空字符串。

#### options

```ts
interface Options {
  debug?: boolean, // 是否输出调试信息，默认 false
  autoConnect?: boolean, // 是否在实例化时立即连接，默认 true

  // 断开重新连接配置
  reconnect?: {
    enable?: boolean, // 是否启用，默认 false
    interval?: number, // 重连之前 延迟时间间隔，单位 ms，默认 1000
    maxInterval?: number, // 重连之前 最大 延迟时间间隔，单位 ms，默认 30000
    decay?: number, // 重新连接延迟的增加速率 - 每次重连的延迟时间是上次的 decay 倍，默认 2
    maxNumber?: number // 最大重连次数 - 默认 Infinity（无穷大，不限制）
  },

  // 心跳配置
  heartbeat?: {
    enable?: boolean, // 是否启用，默认 false
    interval?: number, // 心跳间隔，单位 ms，默认 30000
    maxRetryNumber?: number, // 最大重试次数 - 超过后重连（需启用断开重连），默认 0（下一次发送心跳时若上一次心跳无响应则关闭连接，若开启重连，则会在断开后重新连接）
    sendContent?: string, // 自定义心跳发送内容，默认 ping
    receiveContent?: string // 自定义心跳接收内容， 默认 pong
  }
}
```

## API

### 方法

#### ws.connect

连接 WebSocket，默认在实例化时立即连接，当`autoConnect=false`时可以使用

#### ws.reconnectStart

开始重新连接 WebSocket（需启用断开重连），若当前连接未断开则会先断开当前连接

#### ws.send

发送消息，在 [WebSocket.send()](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket/send) 基础上增加支持传入`JavaScript 对象`，在实际发送前先会使用 `JSON.stringify` 转换为 JSON 字符串

```ts
ws.send('hello')

type Send = (data: string | ArrayBufferLike | Blob | ArrayBufferView | Record<any, any>) => void
```

#### ws.close

关闭 WebSocket 连接，与 [WebSocket.close()](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket/close) 一致

```ts
ws.close()

type Close = (code?: number, reason?: string) => void
```

### 事件

#### ws.on('open', function(Event))

```ts
ws.on('open', (event: Event) => {
  console.log('open:', event)
})
```

#### ws.on('message', function(MessageEvent))

```ts
ws.on('message', (event: MessageEvent) => {
  console.log('message:', event)
})
```

#### ws.on('close', function(CloseEvent))

```ts
ws.on('close', (event: CloseEvent) => {
  console.log('close:', event)
})
```

#### ws.on('error', function(Event))

```ts
ws.on('error', (event: Event) => {
  console.log('error:', event)
})
```
