import { Common, Node } from 'dr-js/module/Dr.node'
import { ROUTE_MAP } from 'config'
import { renderDefault } from './Default'
import { renderMain } from './Main'

const { Format, Module: { BASIC_EXTENSION_MAP } } = Common
const { getEntityTagByContentHash } = Node.Module
const { createResponderBufferCache } = Node.Server.Responder

const CACHE_EXPIRE_TIME = __DEV__ ? 0 : 60 * 1000 // in msec, 1min

const createResponderRenderView = ({ getResourcePack, getResource, getShare, getUser, route, serveCacheMap }) => {
  const viewMap = new Map()
  viewMap.set(ROUTE_MAP.VIEW_DEFAULT, renderDefault)
  viewMap.set(ROUTE_MAP.VIEW_MAIN, renderMain)
  viewMap.set(ROUTE_MAP.VIEW_USER, renderMain)
  viewMap.set(ROUTE_MAP.VIEW_FILE, renderMain)
  viewMap.set(ROUTE_MAP.VIEW_STATUS, renderMain)
  viewMap.set(ROUTE_MAP.VIEW_INFO, renderMain)
  viewMap.set(ROUTE_MAP.VIEW_TEST_WEBSOCKET, renderMain)
  viewMap.set(ROUTE_MAP.AUTH_VIEW_USER_FILE, renderMain)

  const data = { route, viewKeyList: Array.from(viewMap.keys()), getResourcePack, getResource, getShare, getUser }

  const responderBufferCache = createResponderBufferCache({
    getBufferData: async (store, viewKey) => {
      __DEV__ && console.log(`[View] render ${viewKey}`)
      const buffer = Buffer.from(await viewMap.get(viewKey)(data))
      __DEV__ && console.log(`[View] rendered ${viewKey} ${Format.binary(buffer.length)}B`)
      return { buffer, length: buffer.length, type: BASIC_EXTENSION_MAP.html, entityTag: getEntityTagByContentHash(buffer) }
    },
    expireTime: CACHE_EXPIRE_TIME,
    serveCacheMap
  })

  return (store, viewKey, paramAny) => {
    __DEV__ && console.log(`[View] getKey ${viewKey} ${paramAny}`)
    if (!viewMap.has(viewKey)) viewKey = ROUTE_MAP.VIEW_DEFAULT
    return responderBufferCache(store, viewKey)
  }
}

export { createResponderRenderView }
