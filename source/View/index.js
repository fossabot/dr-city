import { Common, Node } from 'dr-js/library/Dr.node'
import { renderDefault } from './default'
import { renderHome } from './home'
import { renderAuth } from './auth'
import { renderWebSocket } from './webSocket'
import { renderServerStatus } from './serverStatus'
import { renderStaticFileList } from './staticFileList'

const { Format } = Common
const { createResponseReducerBufferCache } = Node.Server.ResponseReducer

const createResponseReducerRenderView = ({ staticRoot, staticRoute }) => {
  const renderKeyMap = {
    'default': renderDefault,
    'home': renderHome,
    'auth': renderAuth,
    'websocket': renderWebSocket,
    'server-status': renderServerStatus,
    'static-file-list': renderStaticFileList.bind(null, staticRoot, staticRoute)
  }

  return createResponseReducerBufferCache({
    getKey: (store) => {
      let { viewKey } = store.getState()
      if (renderKeyMap[ viewKey ] === undefined) {
        viewKey = 'default'
        store.setState({ viewKey })
      }
      __DEV__ && console.log(`[responseReducerRenderView] getKey ${viewKey}`)
      return viewKey
    },
    getBufferData: async (store, viewKey) => {
      __DEV__ && console.log(`[responseReducerRenderView] render ${viewKey}`)
      const buffer = Buffer.from(await renderKeyMap[ viewKey ]())
      __DEV__ && console.log(`[responseReducerRenderView] rendered ${viewKey} ${Format.binary(buffer.length)}B`)
      return { buffer, length: buffer.length, type: 'text/html' }
    }
  })
}

export {
  createResponseReducerRenderView
}
