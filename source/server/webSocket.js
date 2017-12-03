import { Node } from 'dr-js/module/Dr.node'
import { saveBufferToFile } from './Task'
import { responderAuthVerifyToken } from './Responder'

const {
  Buffer: { packBufferPacket, parseBufferPacket },
  Server: {
    WebSocket: { WEB_SOCKET_EVENT_MAP, DATA_TYPE_MAP, enableWebSocketServer, createUpdateRequestListener },
    Responder: {
      createResponderRouter, createRouteMap, getRouteParamAny,
      createResponderParseURL
    }
  }
} = Node

const DEFAULT_FRAME_LENGTH_LIMIT = 2 * 1024 * 1024 // 2 MiB
const AUTH_FRAME_LENGTH_LIMIT = 32 * 1024 * 1024 // 32 MiB
const REGEXP_AUTH_TOKEN = /auth-token!(.+)/

// common protocol
const enableProtocolTextJSON = (webSocket, onData) => webSocket.on(WEB_SOCKET_EVENT_MAP.FRAME, async (webSocket, { dataType, dataBuffer }) => {
  __DEV__ && console.log(`>> FRAME:`, dataType, dataBuffer.length, dataBuffer.toString().slice(0, 20))
  if (dataType !== DATA_TYPE_MAP.OPCODE_TEXT) return webSocket.close(1000, 'OPCODE_TEXT opcode expected')
  try { await onData(webSocket, JSON.parse(dataBuffer.toString())) } catch (error) {
    __DEV__ && console.warn('[ERROR][enableProtocolTextJSON]', error)
    webSocket.close(1000, error.toString())
  }
})
const enableProtocolBufferPacket = (webSocket, onData) => webSocket.on(WEB_SOCKET_EVENT_MAP.FRAME, async (webSocket, { dataType, dataBuffer }) => {
  __DEV__ && console.log(`>> FRAME:`, dataType, dataBuffer.length, dataBuffer.toString().slice(0, 20))
  if (dataType !== DATA_TYPE_MAP.OPCODE_BINARY) return webSocket.close(1000, 'OPCODE_BINARY opcode expected')
  try { await onData(webSocket, parseBufferPacket(dataBuffer)) } catch (error) {
    __DEV__ && console.warn('[ERROR][enableProtocolBufferPacket]', error)
    webSocket.close(1000, error.toString())
  }
})

const getUpgradeRequestProtocolMap = ({ pathUser }) => {
  const authGroupSetMap = {}
  const protocolMap = {
    'echo-text-json': (store) => enableProtocolTextJSON(
      store.webSocket,
      (webSocket, { type, payload }) => type === 'close'
        ? webSocket.close(1000, 'CLOSE received')
        : webSocket.sendText(JSON.stringify({ type, payload }))
    ),
    'echo-binary-packet': (store) => enableProtocolBufferPacket(
      store.webSocket,
      (webSocket, [ headerString, payloadBuffer ]) => JSON.parse(headerString).type === 'close'
        ? webSocket.close(1000, 'CLOSE received')
        : webSocket.sendBuffer(packBufferPacket(headerString, payloadBuffer))
    )
  }
  const authProtocolMap = {
    ...protocolMap,
    'group-text-json': (store) => {
      const { groupPath } = store.getState()
      store.webSocket.on(WEB_SOCKET_EVENT_MAP.OPEN, () => {
        if (authGroupSetMap[ groupPath ] === undefined) authGroupSetMap[ groupPath ] = new Set()
        store.groupSet = authGroupSetMap[ groupPath ]
        store.groupSet.add(store.webSocket)
        __DEV__ && console.log(`[responderUpdateRequestAuth] >> OPEN, current group: ${store.groupSet.size} (self included)`, groupPath)
      })
      store.webSocket.on(WEB_SOCKET_EVENT_MAP.CLOSE, () => {
        store.groupSet.delete(store.webSocket)
        if (store.groupSet.size === 0) delete authGroupSetMap[ groupPath ]
        __DEV__ && console.log(`[responderUpdateRequestAuth] >> CLOSE, current group: ${store.groupSet.size} (self included)`, groupPath)
      })
      enableProtocolTextJSON(store.webSocket, (webSocket, { type, payload }) => { // test for chat room
        if (type === 'close') return webSocket.close(1000, 'CLOSE received')
        const text = JSON.stringify({ type, payload })
        store.groupSet.forEach((groupWebSocket) => groupWebSocket !== webSocket && groupWebSocket.sendText(text))
      })
    },
    'upload-binary-packet': (store) => enableProtocolBufferPacket(store, async (store, [ headerString, payloadBuffer ]) => {
      __DEV__ && console.log('[upload-binary-packet] get', headerString)
      const { type, payload } = JSON.parse(headerString)
      if (type === 'close') return store.webSocket.close(1000, 'CLOSE received')
      __DEV__ && console.log('[upload-binary-packet]', { type, payload }, payloadBuffer.length)
      await saveBufferToFile(`${pathUser}/${store.getState().user.id}/upload`, payload.fileName, payloadBuffer)
    })
  }
  return {
    authGroupSetMap,
    protocolMap,
    authProtocolMap,
    protocolTypeSet: new Set(Object.keys(protocolMap)),
    authProtocolTypeSet: new Set(Object.keys(authProtocolMap))
  }
}

const getProtocol = (protocolList, protocolTypeSet) => {
  const protocol = protocolList.find(protocolTypeSet.has, protocolTypeSet)
  __DEV__ && !protocol && console.log('[getProtocol] no valid protocol:', protocolList)
  return protocol
}
const getAuthToken = (protocolList) => {
  const protocolString = protocolList.find(REGEXP_AUTH_TOKEN.test, REGEXP_AUTH_TOKEN)
  const authToken = protocolString && decodeURIComponent(REGEXP_AUTH_TOKEN.exec(protocolString)[ 1 ])
  __DEV__ && !authToken && console.log('[getAuthToken] no valid authToken:', protocolList)
  return authToken
}

const configureWebSocketServer = ({ server, option, firebaseAdminApp, pathUser }) => {
  const { protocolMap, protocolTypeSet, authProtocolMap, authProtocolTypeSet } = getUpgradeRequestProtocolMap({ pathUser })

  const responderWebsocketUpgrade = async (store) => {
    const { origin, protocolList, isSecure } = store.webSocket
    __DEV__ && console.log('[responderWebsocketUpgrade]', { origin, protocolList, isSecure }, store.bodyHeadBuffer.length)
    const protocol = getProtocol(protocolList, protocolTypeSet)
    if (!protocol) return
    store.setState({ protocol })
    protocolMap[ protocol ](store)
    __DEV__ && store.webSocket.on(WEB_SOCKET_EVENT_MAP.OPEN, () => console.log(`[responderWebsocketUpgrade] >> OPEN, ${protocol}, current active: ${webSocketSet.size} (self excluded)`))
  }

  const responderWebsocketAuthUpgrade = async (store) => {
    const { origin, protocolList, isSecure } = store.webSocket
    __DEV__ && console.log('[responderWebsocketAuthUpgrade]', { origin, protocolList, isSecure }, store.bodyHeadBuffer.length)
    const protocol = getProtocol(protocolList, authProtocolTypeSet)
    if (!protocol) return
    const authToken = getAuthToken(protocolList)
    if (!authToken) return
    await responderAuthVerifyToken(store, firebaseAdminApp, authToken)
    store.setState({ protocol })
    store.webSocket.setFrameLengthLimit(AUTH_FRAME_LENGTH_LIMIT)
    authProtocolMap[ protocol ](store)
    __DEV__ && store.webSocket.on(WEB_SOCKET_EVENT_MAP.OPEN, () => console.log(`[responderWebsocketAuthUpgrade] >> OPEN, ${protocol}, current active: ${webSocketSet.size} (self excluded)`))
  }

  const responderWebsocketGroupAuthUpgrade = async (store) => {
    const { origin, protocolList, isSecure } = store.webSocket
    __DEV__ && console.log('[responderWebsocketGroupAuthUpgrade]', { origin, protocolList, isSecure }, store.bodyHeadBuffer.length)
    const groupPath = getRouteParamAny(store) // TODO: should verify groupPath
    if (!groupPath) return
    const protocol = protocolList.includes('group-text-json') && 'group-text-json'
    if (!protocol) return
    const authToken = getAuthToken(protocolList)
    if (!authToken) return
    await responderAuthVerifyToken(store, firebaseAdminApp, authToken)
    store.setState({ protocol, groupPath })
    store.webSocket.setFrameLengthLimit(AUTH_FRAME_LENGTH_LIMIT)
    authProtocolMap[ protocol ](store)
    __DEV__ && store.webSocket.on(WEB_SOCKET_EVENT_MAP.OPEN, () => console.log(`[responderWebsocketGroupAuthUpgrade] >> OPEN, ${protocol}, current active: ${webSocketSet.size} (self excluded)`))
  }

  const webSocketSet = enableWebSocketServer({
    server,
    onUpgradeRequest: createUpdateRequestListener({
      responderList: [
        createResponderParseURL(option),
        createResponderRouter(createRouteMap([
          [ '/websocket', 'GET', responderWebsocketUpgrade ],
          [ '/websocket-auth', 'GET', responderWebsocketAuthUpgrade ],
          [ '/websocket-group-auth/*', 'GET', responderWebsocketGroupAuthUpgrade ]
        ]))
      ]
    }),
    frameLengthLimit: DEFAULT_FRAME_LENGTH_LIMIT
  })
}

export { configureWebSocketServer }
