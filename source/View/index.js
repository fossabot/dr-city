import { Common, Node } from 'dr-js/library/Dr.node'

import { renderDefault } from './default'
import { renderHome } from './home'
import { renderAuth } from './auth'
import { renderServerStatus } from './serverStatus'

const { Format } = Common
const { createResponseReducerBufferCache } = Node.Server.ResponseReducer

const renderKeyMap = {
  'home': renderHome,
  'auth': renderAuth,
  'server-status': renderServerStatus,
  'default': renderDefault
}

const responseReducerRenderView = createResponseReducerBufferCache({
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

export {
  renderKeyMap,
  responseReducerRenderView
}
