import nodeModulePath from 'path'
import { createGetPathFromRoot } from 'dr-js/module/node/file/Modify'
import { getRouteParamAny, createResponderServeStatic } from 'dr-js/module/node/server/Responder'

const CACHE_EXPIRE_TIME = __DEV__ ? 0 : 60 * 1000 // in msec, 1min

const configureServeStatic = ({ pathResource, pathShare, pathUser, serveCacheMap }) => {
  const fromResourceRoot = createGetPathFromRoot(pathResource)
  const fromShareRoot = createGetPathFromRoot(pathShare)
  const fromUserRoot = createGetPathFromRoot(pathUser)
  const responderServeStatic = createResponderServeStatic({ isEnableGzip: true, expireTime: CACHE_EXPIRE_TIME, serveCacheMap })
  return {
    fromResourceRoot,
    fromShareRoot,
    fromUserRoot,
    getResourceParamFilePath: (store) => fromResourceRoot(decodeURI(getRouteParamAny(store))),
    getShareParamFilePath: (store) => fromShareRoot(decodeURI(getRouteParamAny(store))),
    getUserParamFilePath: (store, user) => fromUserRoot(nodeModulePath.join(user.id, decodeURI(getRouteParamAny(store)))),
    responderServeStatic: (store, filePath) => {
      store.response.setHeader('cache-control', __DEV__ ? 'no-cache' : 'public, max-age=2592000') // in seconds, 30days = 2592000 = 30 * 24 * 60 * 60
      return responderServeStatic(store, filePath)
    }
  }
}

export { configureServeStatic }
