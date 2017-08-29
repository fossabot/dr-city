import { Node } from 'dr-js/library/Dr.node'
import { responderAuthVerifyToken } from './auth'

const {
  packBufferPacket,
  parseBufferPacket
} = Node.Buffer
const {
  WEB_SOCKET_EVENT_MAP,
  DATA_TYPE_MAP,
  enableWebSocketServer,
  createUpdateRequestListener
} = Node.Server.WebSocket
const {
  createRouterMapBuilder,
  createResponderRouter,
  createResponderParseURL
} = Node.Server.Responder

// common protocol
const enableProtocolTextJSON = (store, onData) => store.webSocket.on(WEB_SOCKET_EVENT_MAP.FRAME, (webSocket, { dataType, dataBuffer }) => {
  __DEV__ && console.log(`>> FRAME:`, dataType, dataBuffer.length, dataBuffer.toString().slice(0, 20))
  if (dataType !== DATA_TYPE_MAP.OPCODE_TEXT) return webSocket.close(1000, 'OPCODE_TEXT opcode expected')
  try { onData(store, JSON.parse(dataBuffer.toString())) } catch (error) {
    __DEV__ && console.log('[enableProtocolTextJSON]', error)
    webSocket.close(1000, error.toString())
  }
})

const enableProtocolBufferPacket = (store, onData) => store.webSocket.on(WEB_SOCKET_EVENT_MAP.FRAME, (webSocket, { dataType, dataBuffer }) => {
  __DEV__ && console.log(`>> FRAME:`, dataType, dataBuffer.length, dataBuffer.toString().slice(0, 20))
  if (dataType !== DATA_TYPE_MAP.OPCODE_BINARY) return webSocket.close(1000, 'OPCODE_BINARY opcode expected')
  try { onData(store, parseBufferPacket(dataBuffer)) } catch (error) {
    __DEV__ && console.log('[enableProtocolBufferPacket]', error)
    webSocket.close(1000, error.toString())
  }
})

const PROTOCOL_MAP = {
  'echo-text-json': (store) => enableProtocolTextJSON(store, (store, { type, payload }) => {
    if (type === 'close') return store.webSocket.close(1000, 'CLOSE received')
    store.webSocket.sendText(JSON.stringify({ type, payload }))
  }),
  'echo-buffer-packet': (store) => enableProtocolBufferPacket(store, (store, [ headerString, payloadBuffer ]) => {
    __DEV__ && console.log('[echo-packet] get', headerString)
    const { type, payload } = JSON.parse(headerString)
    if (type === 'close') return store.webSocket.close(1000, 'CLOSE received')
    __DEV__ && console.log('[echo-packet]', { type, payload }, payloadBuffer.length)
    store.webSocket.sendBuffer(packBufferPacket(headerString, payloadBuffer))
  }),
  'group-text-json': (store) => enableProtocolTextJSON(store, (store, { type, payload }) => {
    if (type === 'close') return store.webSocket.close(1000, 'CLOSE received')
    const text = JSON.stringify({ type, payload })
    store.groupSet.forEach((webSocket) => webSocket !== store.webSocket && webSocket.sendText(text))
  })
}
const PROTOCOL_TYPE_SET = new Set(Object.keys(PROTOCOL_MAP))

const DEFAULT_FRAME_LENGTH_LIMIT = 0.5 * 1024 * 1024 // 0.5 MiB
const AUTH_FRAME_LENGTH_LIMIT = 32 * 1024 * 1024 // 32 MiB
const REGEXP_AUTH_TOKEN = /auth-token!(.+)/

const applyWebSocketServer = (server, firebaseAdminApp) => {
  const responderUpdateRequest = (store) => {
    const { origin, protocolList, isSecure } = store.webSocket
    __DEV__ && console.log('[responderUpdateRequest]', { origin, protocolList, isSecure }, store.bodyHeadBuffer.length)
    const protocol = protocolList.find(PROTOCOL_TYPE_SET.has, PROTOCOL_TYPE_SET)
    __DEV__ && !protocol && console.log('[responderUpdateRequest] no valid protocol', protocolList)
    if (!protocol) return
    store.setState({ protocol })
    PROTOCOL_MAP[ protocol ](store)
    __DEV__ && store.webSocket.on(WEB_SOCKET_EVENT_MAP.OPEN, () => console.log(`[responderUpdateRequest] >> OPEN, ${protocol}, current active: ${webSocketSet.size} (self excluded)`))
  }
  const responderUpdateRequestAuth = async (store) => {
    const { origin, protocolList, isSecure } = store.webSocket
    __DEV__ && console.log('[responderUpdateRequestAuth]', { origin, protocolList, isSecure }, store.bodyHeadBuffer.length)
    let protocol = null
    let authToken = null
    for (const protocolString of protocolList) {
      if (!protocol && PROTOCOL_TYPE_SET.has(protocolString)) protocol = protocolString
      if (!authToken && REGEXP_AUTH_TOKEN.test(protocolString)) authToken = decodeURIComponent(REGEXP_AUTH_TOKEN.exec(protocolString)[ 1 ])
      if (protocol && authToken) break
    }
    __DEV__ && !protocol && console.log('[responderUpdateRequest] no valid protocol', protocolList)
    __DEV__ && !authToken && console.log('[responderUpdateRequest] no valid authToken', protocolList)
    if (!protocol || !authToken) return
    // await responderAuthVerifyToken(store, firebaseAdminApp, authToken)
    authToken && store.setState({ user: { test: 'test', authToken } })
    __DEV__ && !store.getState().user && console.log('[responderUpdateRequest] failed to verify authToken', authToken)
    if (!store.getState().user) return
    store.webSocket.setFrameLengthLimit(AUTH_FRAME_LENGTH_LIMIT)
    store.setState({ protocol })
    PROTOCOL_MAP[ protocol ](store)
    __DEV__ && store.webSocket.on(WEB_SOCKET_EVENT_MAP.OPEN, () => console.log(`[responderUpdateRequestAuth] >> OPEN, ${protocol}, current active: ${webSocketSet.size} (self excluded)`))
  }

  // set router
  const routerMapBuilder = createRouterMapBuilder()
  routerMapBuilder.addRoute('/websocket', 'GET', responderUpdateRequest)
  routerMapBuilder.addRoute('/websocket-auth', 'GET', responderUpdateRequestAuth)

  const groupSetMap = {}
  routerMapBuilder.addRoute('/websocket-auth-group/*', 'GET', async (store) => {
    await responderUpdateRequestAuth(store)
    const { protocol, user, paramMap } = store.getState()
    if (!protocol || !user) return
    const groupPath = paramMap[ routerMapBuilder.ROUTE_ANY ]
    store.webSocket.on(WEB_SOCKET_EVENT_MAP.OPEN, () => {
      if (groupSetMap[ groupPath ] === undefined) groupSetMap[ groupPath ] = new Set()
      store.groupSet = groupSetMap[ groupPath ]
      store.groupSet.add(store.webSocket)
      console.log(`[responderUpdateRequestAuth] >> OPEN, current group: ${store.groupSet.size} (self included)`, protocol, groupPath)
    })
    store.webSocket.on(WEB_SOCKET_EVENT_MAP.CLOSE, () => {
      store.groupSet.delete(store.webSocket)
      if (store.groupSet.size === 0) delete groupSetMap[ groupPath ]
      console.log(`[responderUpdateRequestAuth] >> CLOSE, current group: ${store.groupSet.size} (self included)`, protocol, groupPath)
    })
  })

  const webSocketSet = enableWebSocketServer({
    server,
    onUpgradeRequest: createUpdateRequestListener({
      responderList: [
        createResponderParseURL(),
        createResponderRouter(routerMapBuilder.getRouterMap())
      ]
    }),
    frameLengthLimit: DEFAULT_FRAME_LENGTH_LIMIT
  })
}

export {
  applyWebSocketServer
}
