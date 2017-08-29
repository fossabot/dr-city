import { Common, Node } from 'dr-js/library/Dr.node'
import { renderDefault } from './default'
import { renderHome } from './home'
import { renderAuth } from './auth'
import { renderWebSocket } from './webSocket'
import { renderServerStatus } from './serverStatus'
import { renderStaticFileList } from './staticFileList'

const { Format } = Common
const { createResponderBufferCache } = Node.Server.Responder

const createResponderRenderView = ({ staticRoot, staticRoute }) => {
  const renderKeyMap = {
    'default': renderDefault,
    'home': renderHome,
    'auth': renderAuth,
    'websocket': renderWebSocket,
    'server-status': renderServerStatus,
    'static-file-list': renderStaticFileList.bind(null, staticRoot, staticRoute)
  }

  return createResponderBufferCache({
    getKey: (store) => {
      let { viewKey } = store.getState()
      if (renderKeyMap[ viewKey ] === undefined) {
        viewKey = 'default'
        store.setState({ viewKey })
      }
      __DEV__ && console.log(`[responderRenderView] getKey ${viewKey}`)
      return viewKey
    },
    getBufferData: async (store, viewKey) => {
      __DEV__ && console.log(`[responderRenderView] render ${viewKey}`)
      const buffer = Buffer.from(await renderKeyMap[ viewKey ]())
      __DEV__ && console.log(`[responderRenderView] rendered ${viewKey} ${Format.binary(buffer.length)}B`)
      return { buffer, length: buffer.length, type: 'text/html' }
    }
  })
}

export {
  createResponderRenderView
}
