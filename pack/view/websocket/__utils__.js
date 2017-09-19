import { Common, Browser } from 'dr-js/module/Dr.browser'

const { createStateStore } = Common.Immutable
const { packBlobPacket, parseBlobPacket } = Browser.Blob

const initialState = {
  textJSONWebSocket: null,
  textJSONLog: '',
  bufferPacketWebSocket: null,
  bufferPacketLog: ''
}

const createWebSocketTest = (stateStore = createStateStore(initialState)) => {
  const ROUTE_WEBSOCKET = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/websocket`

  const addLogListener = (socket, log) => {
    socket.addEventListener('open', (event) => log('open', event))
    socket.addEventListener('error', (event) => log('error', event))
    socket.addEventListener('close', (event) => log('close', event))
    socket.addEventListener('message', (event) => log('message', event, `dataType: "${typeof (event.data)}" | dataSize: ${typeof (event.data) === 'string' ? event.data.length : event.data.size}`))
  }

  const logTextJSON = (...args) => {
    console.log(...args)
    stateStore.setState({ textJSONLog: stateStore.getState().textJSONLog + args.map(JSON.stringify).join(' ') + '\n' })
  }
  const logTextJSONReset = () => stateStore.setState({ textJSONLog: '' })

  const openTextJSONWebSocket = () => {
    const textJSONWebSocket = new window.WebSocket(ROUTE_WEBSOCKET, 'echo-text-json')
    stateStore.setState({ textJSONWebSocket })
    addLogListener(textJSONWebSocket, logTextJSON)
    textJSONWebSocket.addEventListener('close', () => stateStore.setState({ textJSONWebSocket: null }))
    textJSONWebSocket.addEventListener('error', () => stateStore.setState({ textJSONWebSocket: null }))
  }
  const sendTextJSONWebSocket = (type, payload) => {
    const { textJSONWebSocket } = stateStore.getState()
    if (!textJSONWebSocket) return
    const data = JSON.stringify({ type, payload })
    textJSONWebSocket.send(data)
    logTextJSON(data)
  }
  const closeTextJSONWebSocket = () => {
    const { textJSONWebSocket } = stateStore.getState()
    if (!textJSONWebSocket) return
    textJSONWebSocket.send(JSON.stringify({ type: 'close' }))
    stateStore.setState({ textJSONWebSocket: null })
  }

  const logBufferPacket = (...args) => {
    console.log(...args)
    stateStore.setState({ bufferPacketLog: stateStore.getState().bufferPacketLog + args.map(JSON.stringify).join(' ') + '\n' })
  }
  const logBufferPacketReset = () => stateStore.setState({ bufferPacketLog: '' })

  const openBufferPacketWebSocket = () => {
    const bufferPacketWebSocket = new window.WebSocket(ROUTE_WEBSOCKET, 'echo-buffer-packet')
    stateStore.setState({ bufferPacketWebSocket })
    addLogListener(bufferPacketWebSocket, logBufferPacket)
    bufferPacketWebSocket.addEventListener('close', () => stateStore.setState({ bufferPacketWebSocket: null }))
    bufferPacketWebSocket.addEventListener('error', () => stateStore.setState({ bufferPacketWebSocket: null }))
    bufferPacketWebSocket.addEventListener('message', async (event) => {
      const [ headerString, payloadBlob ] = await parseBlobPacket(event.data)
      logBufferPacket('message decoded', [ headerString, payloadBlob.size ])
    })
  }
  const sendBufferPacketWebSocket = (type, payload, payloadBlob) => {
    const { bufferPacketWebSocket } = stateStore.getState()
    if (!bufferPacketWebSocket) return
    const headerString = JSON.stringify({ type, payload })
    bufferPacketWebSocket.send(packBlobPacket(headerString, payloadBlob))
    logBufferPacket(headerString, payloadBlob && payloadBlob.size)
  }
  const closeBufferPacketWebSocket = () => {
    const { bufferPacketWebSocket } = stateStore.getState()
    if (!bufferPacketWebSocket) return
    bufferPacketWebSocket.send(packBlobPacket(JSON.stringify({ type: 'close' })))
    stateStore.setState({ bufferPacketWebSocket: null })
  }

  return {
    stateStore,

    logTextJSONReset,
    openTextJSONWebSocket,
    sendTextJSONWebSocket,
    closeTextJSONWebSocket,

    logBufferPacketReset,
    openBufferPacketWebSocket,
    sendBufferPacketWebSocket,
    closeBufferPacketWebSocket
  }
}

export { createWebSocketTest }
