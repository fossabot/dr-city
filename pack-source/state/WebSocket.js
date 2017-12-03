import { createStateStore } from 'pack-source/__utils__'

const ROUTE_WEBSOCKET = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/websocket`

const initialState = {
  textJSONWebSocket: null,
  binaryPacketWebSocket: null
}

const { getState, setState, wrapEntry } = createStateStore(initialState)

const asyncTaskMap = {}

const entryMap = {
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
    textJSONWebSocket.send(JSON.stringify({ type: 'close' }))
    store.dispatch({ type: 'reducer:websocket:update', payload: { textJSONWebSocket: null } })
  }),
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
    binaryPacketWebSocket.send(JSON.stringify({ type: 'close' }))
    store.dispatch({ type: 'reducer:websocket:update', payload: { binaryPacketWebSocket: null } })
  })
}

export default {
  asyncTaskMap,
  entryMap,
  getState,
  setState
}
