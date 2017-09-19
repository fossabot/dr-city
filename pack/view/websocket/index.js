import React from 'react'
import ReactDOM from 'react-dom'

import { ROUTE_MAP, Layout } from 'view/__utils__'
import { createWebSocketTest } from './__utils__'
import { WebSocket } from './WebSocket'

window.main = (rootElement) => {
  const {
    stateStore,
    logTextJSONReset,
    openTextJSONWebSocket,
    sendTextJSONWebSocket,
    closeTextJSONWebSocket,
    logBufferPacketReset,
    openBufferPacketWebSocket,
    sendBufferPacketWebSocket,
    closeBufferPacketWebSocket
  } = createWebSocketTest()
  const renderMain = () => {
    console.log(stateStore.getState())
    ReactDOM.render(<Layout route={ROUTE_MAP.TEST_WEBSOCKET}><WebSocket {...{
      websocketState: stateStore.getState(),
      logTextJSONReset,
      openTextJSONWebSocket,
      sendTextJSONWebSocket,
      closeTextJSONWebSocket,
      logBufferPacketReset,
      openBufferPacketWebSocket,
      sendBufferPacketWebSocket,
      closeBufferPacketWebSocket
    }} /></Layout>, rootElement)
  }
  stateStore.subscribe(renderMain)
  renderMain()
}
