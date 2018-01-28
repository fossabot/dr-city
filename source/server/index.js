import { readFileSync } from 'fs'
import { clock } from 'dr-js/module/common/time'
import { CacheMap } from 'dr-js/module/common/data/CacheMap'
import { time as formatTime } from 'dr-js/module/common/format'
import { createServer, createRequestListener } from 'dr-js/module/node/server'
import {
  responderEnd, responderEndWithRedirect,
  createResponderRouter, createRouteMap, getRouteParam, getRouteParamAny,
  createResponderParseURL
} from 'dr-js/module/node/server/Responder'

import { PATH_RESOURCE, GET_PACK_MANIFEST_MAP, ROUTE_MAP } from 'config'

import { initFirebaseAdminApp, responderAuthVerifyToken, configureServeStatic } from './Responder'
import { createResponderRenderView } from './View'
import { createResponderTask, createResponderAuthTask } from './Task'
import { configureWebSocketServer } from './webSocket'

const CACHE_BUFFER_SIZE_SUM_MAX = 64 * 1024 * 1024 // in byte, 64mB

const configureServer = async ({
  protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam,
  pathShare, pathUser,
  fileFirebaseAdminToken
}, { logger }) => {
  const firebaseAdminApp = initFirebaseAdminApp(JSON.parse(readFileSync(fileFirebaseAdminToken, 'utf8')))
  const wrapAuth = (next) => async (store) => next(store, await responderAuthVerifyToken(store, firebaseAdminApp, store.request.headers[ 'auth-token' ]))

  const packManifestMap = await GET_PACK_MANIFEST_MAP()

  const serveCacheMap = new CacheMap({
    valueSizeSumMax: CACHE_BUFFER_SIZE_SUM_MAX,
    onCacheAdd: __DEV__ ? (cache) => console.log('[onCacheAdd]', cache.key) : null,
    onCacheDelete: __DEV__ ? (cache) => console.log('[onCacheDelete]', cache.key) : null
  })

  const {
    fromResourceRoot,
    getResourceParamFilePath,
    getShareParamFilePath,
    getUserParamFilePath,
    responderServeStatic
  } = configureServeStatic({ pathResource: PATH_RESOURCE, pathShare, pathUser, serveCacheMap })

  const responderRenderView = createResponderRenderView({
    getResourcePack: (path) => `${ROUTE_MAP.STATIC_RESOURCE_PACK}/${packManifestMap[ path ]}`,
    getResource: (path) => `${ROUTE_MAP.STATIC_RESOURCE}/${path}`,
    getShare: (path) => `${ROUTE_MAP.STATIC_SHARE}/${path}`,
    getUser: (userId, path) => `${ROUTE_MAP.AUTH_STATIC_USER}/${userId}/${path}`,
    route: ROUTE_MAP.VIEW,
    serveCacheMap
  })

  const responderTask = createResponderTask({ pathShare, routeShare: ROUTE_MAP.STATIC_SHARE, serveCacheMap })
  const responderAuthTask = createResponderAuthTask({ pathUser, routeUser: ROUTE_MAP.AUTH_STATIC_USER })

  const responderLogHeader = (store) => {
    const { url, method, headers, socket: { remoteAddress, remotePort } } = store.request
    const host = headers[ 'host' ] || ''
    const userAgent = headers[ 'user-agent' ] || ''
    logger.add(`[REQUEST] ${method} ${host}${url} ${remoteAddress}:${remotePort} ${userAgent}`)
  }
  const responderLogEnd = (store) => {
    const state = store.getState()
    __DEV__ && state.error && console.error(state.error)
    const errorLog = state.error
      ? `[ERROR] ${store.request.method} ${store.request.url} ${store.response.finished ? 'finished' : 'not-finished'} ${state.error}`
      : ''
    logger.add(`[END] ${formatTime(clock() - state.time)} ${store.response.statusCode} ${errorLog}`)
  }

  // create server
  const { server, start, stop, option } = createServer({
    protocol,
    hostname,
    port,
    key: fileSSLKey ? readFileSync(fileSSLKey) : null,
    cert: fileSSLCert ? readFileSync(fileSSLCert) : null,
    ca: fileSSLChain ? readFileSync(fileSSLChain) : null,
    dhparam: fileSSLDHParam ? readFileSync(fileSSLDHParam) : null // Diffie-Hellman Key Exchange
  })

  server.on('request', createRequestListener({
    responderList: [
      responderLogHeader,
      createResponderParseURL(option),
      wrapSetHSTS(createResponderRouter(createRouteMap([
        [ '/favicon.ico', 'GET', (store) => responderServeStatic(store, fromResourceRoot('favicon.ico')) ],
        [ [ '/', `${ROUTE_MAP.VIEW}/*` ], 'GET', (store) => responderEndWithRedirect(store, { redirectUrl: ROUTE_MAP.VIEW_MAIN }) ],
        [ [ `${ROUTE_MAP.VIEW}/:key`, `${ROUTE_MAP.VIEW}/:key/*` ], 'GET', (store) => responderRenderView(store, `${ROUTE_MAP.VIEW}/${getRouteParam(store, 'key')}`, getRouteParamAny(store)) ],
        [ [ `${ROUTE_MAP.AUTH_VIEW}/:key`, `${ROUTE_MAP.AUTH_VIEW}/:key/*` ], 'GET', wrapAuth((store) => responderRenderView(store, `${ROUTE_MAP.AUTH_VIEW}/${getRouteParam(store, 'key')}`, getRouteParamAny(store))) ],
        [ `${ROUTE_MAP.TASK}/:key`, 'POST', (store) => responderTask(store, `${ROUTE_MAP.TASK}/${getRouteParam(store, 'key')}`) ],
        [ `${ROUTE_MAP.AUTH_TASK}/:key`, 'POST', wrapAuth((store, { user }) => responderAuthTask(store, `${ROUTE_MAP.AUTH_TASK}/${getRouteParam(store, 'key')}`, user)) ],
        [ `${ROUTE_MAP.STATIC_RESOURCE}/*`, 'GET', (store) => responderServeStatic(store, getResourceParamFilePath(store)) ],
        [ `${ROUTE_MAP.STATIC_SHARE}/*`, 'GET', (store) => responderServeStatic(store, getShareParamFilePath(store)) ],
        [ `${ROUTE_MAP.AUTH_STATIC_USER}/*`, 'GET', wrapAuth((store, { user }) => responderServeStatic(store, getUserParamFilePath(store, user))) ]
      ])), protocol)
    ],
    responderEnd: async (store) => {
      await responderEnd(store)
      await responderLogEnd(store)
    }
  }))

  configureWebSocketServer({ server, option, firebaseAdminApp, pathUser }) // enable websocket

  start()

  logger.add(`[SERVER UP] ${option.baseUrl}`)

  return { server, start, stop, option }
}

const wrapSetHSTS = (next, protocol) => protocol === 'https:'
  ? (store) => {
    store.response.setHeader('strict-transport-security', 'max-age=31536000; includeSubDomains; preload')
    return next(store)
  }
  : next

export { configureServer }
