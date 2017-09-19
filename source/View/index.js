import { Common, Node } from 'dr-js/module/Dr.node'
import { renderDefault } from './default'
import { renderHome } from './home'
import { renderAuth } from './auth'
import { renderWebSocket } from './webSocket'
import { renderServerStatus } from './serverStatus'
import { renderStaticFileList } from './staticFileList'

const { Format } = Common
const { getEntityTagByContentHash } = Node.Module
const { createResponderBufferCache } = Node.Server.Responder

const CACHE_EXPIRE_TIME = __DEV__ ? 0 : 60 * 1000 // in msec, 1min

const createResponderRenderView = ({ getStatic, getPack, route, staticRoot, staticRoutePrefix, serveCacheMap }) => {
  const renderKeyMap = new Map()
  renderKeyMap.set('default', renderDefault)
  renderKeyMap.set('home', renderHome)
  renderKeyMap.set('server-status', renderServerStatus)
  renderKeyMap.set('static-file-list', renderStaticFileList)
  renderKeyMap.set('test-auth', renderAuth)
  renderKeyMap.set('test-websocket', renderWebSocket)

  const data = { getStatic, getPack, route, staticRoot, staticRoutePrefix, viewKeyList: Array.from(renderKeyMap.keys()) }

  return createResponderBufferCache({
    getKey: (store) => {
      let { viewKey } = store.getState()
      if (!renderKeyMap.has(viewKey)) {
        viewKey = 'default'
        store.setState({ viewKey })
      }
      __DEV__ && console.log(`[responderRenderView] getKey ${viewKey}`)
      return viewKey
    },
    getBufferData: async (store, viewKey) => {
      __DEV__ && console.log(`[responderRenderView] render ${viewKey}`)
      const buffer = Buffer.from(await renderKeyMap.get(viewKey)(data))
      __DEV__ && console.log(`[responderRenderView] rendered ${viewKey} ${Format.binary(buffer.length)}B`)
      return { buffer, length: buffer.length, type: 'text/html', entityTag: getEntityTagByContentHash(buffer) }
    },
    expireTime: CACHE_EXPIRE_TIME,
    serveCacheMap
  })
}

export {
  createResponderRenderView
}
