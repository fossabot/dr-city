import { createStateStore } from 'pack-source/__utils__'
import { createAuthWebSocket } from './Auth'
import { Browser } from 'dr-js/module/Dr.browser'

const ROUTE_WEBSOCKET = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/websocket`
const ROUTE_AUTH_WEBSOCKET = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/websocket-auth`

const TEXT_JSON_CLOSE = JSON.stringify({ type: 'close' })
const BLOB_PACKET_CLOSE = Browser.Blob.packBlobPacket(TEXT_JSON_CLOSE)

const initialState = {
  textJSONWebSocket: null,
  binaryPacketWebSocket: null,
  authGroupTextJSONWebSocket: null,
  authGroupBinaryPacketWebSocket: null
}

const { getState, setState, wrapEntry } = createStateStore(initialState)

const asyncTaskMap = {}

const entryMap = {
  // text-json
  'state:websocket:text-json:clear': wrapEntry((state, store) => {
    const { textJSONWebSocket } = getState()
    if (!textJSONWebSocket) return
    textJSONWebSocket.close() // force close
    store.dispatch({ type: 'reducer:websocket:update', payload: { textJSONWebSocket: null } })
  }),
  'state:websocket:text-json:open': wrapEntry((state, store) => {
    const textJSONWebSocket = new window.WebSocket(ROUTE_WEBSOCKET, 'echo-text-json')
    textJSONWebSocket.addEventListener('close', () => store.dispatch({ type: 'reducer:websocket:update', payload: { textJSONWebSocket: null } }))
    textJSONWebSocket.addEventListener('error', (error) => {
      __DEV__ && console.warn(error)
      store.dispatch({ type: 'reducer:websocket:update', payload: { textJSONWebSocket: null } })
    })
    store.dispatch({ type: 'reducer:websocket:update', payload: { textJSONWebSocket } })
  }),
  'state:websocket:text-json:close': wrapEntry((state, store) => {
    const { textJSONWebSocket } = getState()
    if (!textJSONWebSocket) return
    textJSONWebSocket.send(TEXT_JSON_CLOSE)
    store.dispatch({ type: 'reducer:websocket:update', payload: { textJSONWebSocket: null } })
  }),
  // binary-packet
  'state:websocket:binary-packet:clear': wrapEntry((state, store) => {
    const { binaryPacketWebSocket } = getState()
    if (!binaryPacketWebSocket) return
    binaryPacketWebSocket.close() // force close
    store.dispatch({ type: 'reducer:websocket:update', payload: { binaryPacketWebSocket: null } })
  }),
  'state:websocket:binary-packet:open': wrapEntry((state, store) => {
    const binaryPacketWebSocket = new window.WebSocket(ROUTE_WEBSOCKET, 'echo-binary-packet')
    binaryPacketWebSocket.addEventListener('close', () => store.dispatch({ type: 'reducer:websocket:update', payload: { binaryPacketWebSocket: null } }))
    binaryPacketWebSocket.addEventListener('error', (error) => {
      __DEV__ && console.warn(error)
      store.dispatch({ type: 'reducer:websocket:update', payload: { binaryPacketWebSocket: null } })
    })
    store.dispatch({ type: 'reducer:websocket:update', payload: { binaryPacketWebSocket } })
  }),
  'state:websocket:binary-packet:close': wrapEntry((state, store) => {
    const { binaryPacketWebSocket } = getState()
    if (!binaryPacketWebSocket) return
    binaryPacketWebSocket.send(BLOB_PACKET_CLOSE)
    store.dispatch({ type: 'reducer:websocket:update', payload: { binaryPacketWebSocket: null } })
  }),
  // auth-group-text-json
  'state:websocket:auth-group-text-json:clear': wrapEntry((state, store) => {
    const { authGroupTextJSONWebSocket } = getState()
    if (!authGroupTextJSONWebSocket) return
    authGroupTextJSONWebSocket.close() // force close
    store.dispatch({ type: 'reducer:websocket:update', payload: { authGroupTextJSONWebSocket: null } })
  }),
  'state:websocket:auth-group-text-json:open': wrapEntry(async (state, store, { payload: { groupPath, name } }) => {
    const authGroupTextJSONWebSocket = await createAuthWebSocket(`${ROUTE_AUTH_WEBSOCKET}/group/text-json/${encodeURI(groupPath)}?name=${encodeURIComponent(name)}`, 'group-text-json')
    authGroupTextJSONWebSocket.addEventListener('close', () => store.dispatch({ type: 'reducer:websocket:update', payload: { authGroupTextJSONWebSocket: null } }))
    authGroupTextJSONWebSocket.addEventListener('error', (error) => {
      __DEV__ && console.warn(error)
      store.dispatch({ type: 'reducer:websocket:update', payload: { authGroupTextJSONWebSocket: null } })
    })
    store.dispatch({ type: 'reducer:websocket:update', payload: { authGroupTextJSONWebSocket } })
  }),
  'state:websocket:auth-group-text-json:close': wrapEntry((state, store) => {
    const { authGroupTextJSONWebSocket } = getState()
    if (!authGroupTextJSONWebSocket) return
    authGroupTextJSONWebSocket.send(TEXT_JSON_CLOSE)
    store.dispatch({ type: 'reducer:websocket:update', payload: { authGroupTextJSONWebSocket: null } })
  }),
  // auth-group-binary-packet
  'state:websocket:auth-group-binary-packet:clear': wrapEntry((state, store) => {
    const { authGroupBinaryPacketWebSocket } = getState()
    if (!authGroupBinaryPacketWebSocket) return
    authGroupBinaryPacketWebSocket.close() // force close
    store.dispatch({ type: 'reducer:websocket:update', payload: { authGroupBinaryPacketWebSocket: null } })
  }),
  'state:websocket:auth-group-binary-packet:open': wrapEntry(async (state, store, { payload: { groupPath, name } }) => {
    const authGroupBinaryPacketWebSocket = await createAuthWebSocket(`${ROUTE_AUTH_WEBSOCKET}/group/binary-packet/${encodeURI(groupPath)}?name=${encodeURIComponent(name)}`, 'group-binary-packet')
    authGroupBinaryPacketWebSocket.addEventListener('close', () => store.dispatch({ type: 'reducer:websocket:update', payload: { authGroupBinaryPacketWebSocket: null } }))
    authGroupBinaryPacketWebSocket.addEventListener('error', (error) => {
      __DEV__ && console.warn(error)
      store.dispatch({ type: 'reducer:websocket:update', payload: { authGroupBinaryPacketWebSocket: null } })
    })
    store.dispatch({ type: 'reducer:websocket:update', payload: { authGroupBinaryPacketWebSocket } })
  }),
  'state:websocket:auth-group-binary-packet:close': wrapEntry((state, store) => {
    const { authGroupBinaryPacketWebSocket } = getState()
    if (!authGroupBinaryPacketWebSocket) return
    authGroupBinaryPacketWebSocket.send(BLOB_PACKET_CLOSE)
    store.dispatch({ type: 'reducer:websocket:update', payload: { authGroupBinaryPacketWebSocket: null } })
  })
}

export default {
  asyncTaskMap,
  entryMap,
  getState,
  setState
}
