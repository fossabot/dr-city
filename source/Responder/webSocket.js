import { Node } from 'dr-js/library/Dr.node'

const {
  packBufferPacket,
  parseBufferPacket
} = Node.Buffer
const {
  WEB_SOCKET_EVENT_MAP,
  DATA_TYPE_MAP,
  enableWebSocketServer
} = Node.Server.WebSocket

// common protocol
const enableProtocolTextJSON = (webSocket, onData) => webSocket.on(WEB_SOCKET_EVENT_MAP.FRAME, (webSocket, { dataType, dataBuffer }) => {
  __DEV__ && console.log(`>> FRAME:`, dataType, dataBuffer.length, dataBuffer.toString().slice(0, 20))
  if (dataType !== DATA_TYPE_MAP.OPCODE_TEXT) return webSocket.close(1000, 'OPCODE_TEXT opcode expected')
  try {
    onData(webSocket, JSON.parse(dataBuffer.toString()))
  } catch (error) {
    __DEV__ && console.log('[enableProtocolTextJSON]', error)
    webSocket.close(1000, error.toString())
  }
})

const enableProtocolBufferPacket = (webSocket, onData) => webSocket.on(WEB_SOCKET_EVENT_MAP.FRAME, (webSocket, { dataType, dataBuffer }) => {
  __DEV__ && console.log(`>> FRAME:`, dataType, dataBuffer.length, dataBuffer.toString().slice(0, 20))
  if (dataType !== DATA_TYPE_MAP.OPCODE_BINARY) return webSocket.close(1000, 'OPCODE_BINARY opcode expected')
  try {
    onData(webSocket, parseBufferPacket(dataBuffer))
  } catch (error) {
    __DEV__ && console.log('[enableProtocolBufferPacket]', error)
    webSocket.close(1000, error.toString())
  }
})

const PROTOCOL_MAP = {
  'echo-text-json': (webSocket) => enableProtocolTextJSON(webSocket, (webSocket, { type, payload }) => {
    if (type === 'close') return webSocket.close(1000, 'CLOSE received')
    webSocket.sendText(JSON.stringify({ type, payload }))
  }),
  'echo-buffer-packet': (webSocket) => enableProtocolBufferPacket(webSocket, (webSocket, [ headerString, payloadBuffer ]) => {
    __DEV__ && console.log('[echo-packet] get', headerString)
    const { type, payload } = JSON.parse(headerString)
    if (type === 'close') return webSocket.close(1000, 'CLOSE received')
    __DEV__ && console.log('[echo-packet]', { type, payload }, payloadBuffer.length)
    webSocket.sendBuffer(packBufferPacket(headerString, payloadBuffer))
  })
}
const PROTOCOL_TYPE_SET = new Set(Object.keys(PROTOCOL_MAP))

const applyWebSocketServer = (server) => {
  const webSocketSet = enableWebSocketServer({
    server,
    onUpgradeRequest: (webSocket, request, bodyHeadBuffer) => {
      const { origin, protocolList, isSecure } = webSocket
      __DEV__ && console.log('[onUpgradeRequest]', { origin, protocolList, isSecure }, bodyHeadBuffer.length)
      const protocol = protocolList.find(PROTOCOL_TYPE_SET.has, PROTOCOL_TYPE_SET)
      if (!protocol) webSocket.doCloseSocket()
      PROTOCOL_MAP[ protocol ](webSocket)
      __DEV__ && webSocket.on(WEB_SOCKET_EVENT_MAP.OPEN, () => console.log(`>> OPEN, current active: ${webSocketSet.size} (self excluded)`))
      return protocol
    }
  })
}

export {
  applyWebSocketServer
}
