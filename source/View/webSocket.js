import { getRender } from './__utils__'

export const renderWebSocket = getRender({
  title: 'WebSocket',
  packScriptList: [ 'dll-vendor.js', 'dll-vendor-firebase.js', 'runtime.js', 'websocket.js' ],
  packStyleList: [ 'runtime.css' ]
})
