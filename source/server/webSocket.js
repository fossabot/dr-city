import { packBufferPacket, parseBufferPacket } from 'dr-js/module/node/buffer'
import { createResponderRouter, createRouteMap, getRouteParamAny, createResponderParseURL } from 'dr-js/module/node/server/Responder'
import { WEB_SOCKET_EVENT_MAP, DATA_TYPE_MAP, enableWebSocketServer, createUpdateRequestListener } from 'dr-js/module/node/server/WebSocket'

import { saveBufferToFile } from './Task'
import { responderAuthVerifyToken } from './Responder'

const DEFAULT_FRAME_LENGTH_LIMIT = 2 * 1024 * 1024 // 2 MiB
const AUTH_FRAME_LENGTH_LIMIT = 32 * 1024 * 1024 // 32 MiB
const REGEXP_AUTH_TOKEN = /auth-token!(.+)/

// common protocol
const wrapFrameTextJSON = (onData) => async (webSocket, { dataType, dataBuffer }) => {
  __DEV__ && console.log(`>> FRAME:`, dataType, dataBuffer.length, dataBuffer.toString().slice(0, 20))
  __DEV__ && console.log(`>> FRAME:`, dataType, dataBuffer.length, dataBuffer.toString().slice(0, 20))
  if (dataType !== DATA_TYPE_MAP.OPCODE_TEXT) return webSocket.close(1000, 'OPCODE_TEXT expected')
  try { await onData(JSON.parse(dataBuffer.toString())) } catch (error) {
    __DEV__ && console.warn('[ERROR][wrapFrameTextJSON]', error)
    webSocket.close(1000, error.toString())
  }
}
const wrapFrameBufferPacket = (onData) => async (webSocket, { dataType, dataBuffer }) => {
  __DEV__ && console.log(`>> FRAME:`, dataType, dataBuffer.length, dataBuffer.toString().slice(0, 20))
  if (dataType !== DATA_TYPE_MAP.OPCODE_BINARY) return webSocket.close(1000, 'OPCODE_BINARY expected')
  try { await onData(parseBufferPacket(dataBuffer)) } catch (error) {
    __DEV__ && console.warn('[ERROR][wrapFrameBufferPacket]', error)
    webSocket.close(1000, error.toString())
  }
}

const getUpgradeRequestProtocolMap = ({ pathUser }) => {
  const authGroupInfoListMap = {}
  const protocolMap = {
    'echo-text-json': (store) => {
      const { webSocket } = store
      webSocket.on(WEB_SOCKET_EVENT_MAP.FRAME, wrapFrameTextJSON(({ type, payload }) => (
        type === 'close'
          ? webSocket.close(1000, 'CLOSE received')
          : webSocket.sendText(JSON.stringify({ type, payload }))
      )))
    },
    'echo-binary-packet': (store) => {
      const { webSocket } = store
      webSocket.on(WEB_SOCKET_EVENT_MAP.FRAME, wrapFrameBufferPacket(([ headerString, payloadBuffer ]) => (
        JSON.parse(headerString).type === 'close'
          ? webSocket.close(1000, 'CLOSE received')
          : webSocket.sendBuffer(packBufferPacket(headerString, payloadBuffer))
      )))
    }
  }
  const authProtocolMap = {
    ...protocolMap,
    'group-text-json': (store) => {
      const { webSocket } = store
      const { groupPath, name, user: { id } } = store.getState()
      let groupInfoList
      const sendGroupUpdate = () => {
        const text = JSON.stringify({ type: 'groupInfo', payload: groupInfoList.map(({ name, id }) => ({ name, id })) })
        groupInfoList.forEach((v) => v.webSocket.sendText(text))
      }
      webSocket.on(WEB_SOCKET_EVENT_MAP.OPEN, () => {
        if (authGroupInfoListMap[ groupPath ] === undefined) authGroupInfoListMap[ groupPath ] = []
        groupInfoList = authGroupInfoListMap[ groupPath ]
        groupInfoList.push({ name, id, webSocket })
        sendGroupUpdate()
        __DEV__ && console.log(`[responderUpdateRequestAuth] >> OPEN, current group: ${groupInfoList.length} (self included)`, groupPath)
      })
      webSocket.on(WEB_SOCKET_EVENT_MAP.CLOSE, () => {
        const groupInfoIndex = groupInfoList.findIndex((v) => v.webSocket === webSocket)
        groupInfoList.splice(groupInfoIndex, 1)
        if (groupInfoList.length === 0) delete authGroupInfoListMap[ groupPath ]
        sendGroupUpdate()
        __DEV__ && console.log(`[responderUpdateRequestAuth] >> CLOSE, current group: ${groupInfoList.length} (self included)`, groupPath)
      })
      webSocket.on(WEB_SOCKET_EVENT_MAP.FRAME, wrapFrameTextJSON(({ type, payload }) => { // test for chat room
        if (type === 'close') return webSocket.close(1000, 'CLOSE received')
        if (type === 'text') {
          const text = JSON.stringify({ type, payload: { ...payload, name, id } })
          groupInfoList.forEach((v) => v.webSocket !== webSocket && v.webSocket.sendText(text))
        }
      }))
    },
    'group-binary-packet': (store) => {
      const { webSocket } = store
      const { groupPath, name, user: { id } } = store.getState()
      let groupInfoList
      const sendGroupUpdate = () => {
        const buffer = packBufferPacket(JSON.stringify({ type: 'groupInfo', payload: groupInfoList.map(({ name, id }) => ({ name, id })) }))
        groupInfoList.forEach((v) => v.webSocket.sendBuffer(buffer))
      }
      webSocket.on(WEB_SOCKET_EVENT_MAP.OPEN, () => {
        if (authGroupInfoListMap[ groupPath ] === undefined) authGroupInfoListMap[ groupPath ] = []
        groupInfoList = authGroupInfoListMap[ groupPath ]
        groupInfoList.push({ name, id, webSocket })
        sendGroupUpdate()
        __DEV__ && console.log(`[responderUpdateRequestAuth] >> OPEN, current group: ${groupInfoList.length} (self included)`, groupPath)
      })
      webSocket.on(WEB_SOCKET_EVENT_MAP.CLOSE, () => {
        const groupInfoIndex = groupInfoList.findIndex((v) => v.webSocket === webSocket)
        groupInfoList.splice(groupInfoIndex, 1)
        if (groupInfoList.length === 0) delete authGroupInfoListMap[ groupPath ]
        sendGroupUpdate()
        __DEV__ && console.log(`[responderUpdateRequestAuth] >> CLOSE, current group: ${groupInfoList.length} (self included)`, groupPath)
      })
      webSocket.on(WEB_SOCKET_EVENT_MAP.FRAME, wrapFrameBufferPacket(([ headerString, payloadBuffer ]) => {
        const { type, payload } = JSON.parse(headerString)
        if (type === 'close') return webSocket.close(1000, 'CLOSE received')
        if (type === 'buffer') {
          const headerString = JSON.stringify({ type, payload: { ...payload, name, id } })
          const buffer = packBufferPacket(headerString, payloadBuffer)
          groupInfoList.forEach((v) => v.webSocket !== webSocket && v.webSocket.sendBuffer(buffer))
        }
      }))
    },
    'upload-binary-packet': (store) => {
      const { webSocket } = store
      const { user: { id } } = store.getState()
      webSocket.on(WEB_SOCKET_EVENT_MAP.FRAME, wrapFrameBufferPacket(async ([ headerString, payloadBuffer ]) => {
        __DEV__ && console.log('[upload-binary-packet] get', headerString)
        const { type, payload } = JSON.parse(headerString)
        if (type === 'close') return webSocket.close(1000, 'CLOSE received')
        __DEV__ && console.log('[upload-binary-packet]', { type, payload }, payloadBuffer.length)
        await saveBufferToFile(`${pathUser}/${id}/upload`, payload.fileName, payloadBuffer)
        __DEV__ && console.log('[upload-binary-packet] done', { type, payload }, payloadBuffer.length)
      }))
    }
  }
  return {
    protocolMap,
    authProtocolMap,
    protocolTypeSet: new Set(Object.keys(protocolMap)),
    authProtocolTypeSet: new Set(Object.keys(authProtocolMap)),
    authGroupProtocolTypeSet: new Set([ 'group-text-json', 'group-binary-packet' ])
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
  const { protocolMap, protocolTypeSet, authProtocolMap, authProtocolTypeSet, authGroupProtocolTypeSet } = getUpgradeRequestProtocolMap({ pathUser })

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
    const name = store.getState().url.searchParams.get('name') // TODO: should verify name
    if (!name) return
    __DEV__ && console.log('[responderWebsocketGroupAuthUpgrade] pass groupPath', groupPath)
    const protocol = getProtocol(protocolList, authGroupProtocolTypeSet)
    if (!protocol) return
    __DEV__ && console.log('[responderWebsocketGroupAuthUpgrade] pass protocol', protocol)
    const authToken = getAuthToken(protocolList)
    if (!authToken) return
    __DEV__ && console.log('[responderWebsocketGroupAuthUpgrade] pass authToken', authToken)
    await responderAuthVerifyToken(store, firebaseAdminApp, authToken)
    store.setState({ protocol, groupPath, name })
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
          [ '/websocket-auth/group/*', 'GET', responderWebsocketGroupAuthUpgrade ]
        ]))
      ]
    }),
    frameLengthLimit: DEFAULT_FRAME_LENGTH_LIMIT
  })
}

export { configureWebSocketServer }
