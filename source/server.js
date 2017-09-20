import nodeModulePath from 'path'
import nodeModuleFs from 'fs'
import { promisify } from 'util'
import { Common, Node } from 'dr-js/module/Dr.node'
import { createStatisticLogger, wrapSetHSTS, wrapSetCacheControl } from './__utils__'
import { initFirebaseAdminApp, responderAuthVerifyToken, applyWebSocketServer } from './Responder'
import { createResponderTask } from './Task'
import { createResponderRenderView } from './View'

const readFileAsync = promisify(nodeModuleFs.readFile)
const { Format, Time: { clock }, Data: { CacheMap } } = Common
const {
  System: { addProcessExitListener },
  Server: {
    createServer,
    createRequestListener,
    Responder: {
      responderEnd,
      createRouterMapBuilder,
      createResponderRouter,
      createResponderParseURL,
      createResponderServeStatic,
      createResponderLogRequestHeader,
      // createResponderLogTimeStep,
      createResponderLogEnd
    }
  }
} = Node

const CACHE_BUFFER_SIZE_SUM_MAX = 32 * 1024 * 1024 // in byte, 32mB
const CACHE_EXPIRE_TIME = __DEV__ ? 0 : 60 * 1000 // in msec, 1min

const configureServer = async ({ protocol, hostName, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam, fileFirebaseAdminToken, pathResource, pathLog, logFilePrefix }) => {
  const packManifestMap = {
    ...JSON.parse(await readFileAsync(nodeModulePath.join(pathResource, 'pack/manifest/common.json'), 'utf8')),
    ...JSON.parse(await readFileAsync(nodeModulePath.join(pathResource, 'pack/manifest/dll-vendor.json'), 'utf8')),
    ...JSON.parse(await readFileAsync(nodeModulePath.join(pathResource, 'pack/manifest/dll-vendor-firebase.json'), 'utf8'))
  }
  const firebaseAdminApp = initFirebaseAdminApp(JSON.parse(await readFileAsync(fileFirebaseAdminToken, 'utf8')))

  const { logStatistic, endStatistic } = await createStatisticLogger({ logRoot: pathLog, logFilePrefix })
  addProcessExitListener((exitState) => {
    __DEV__ && console.log('onExit', exitState)
    logStatistic(`${clock()} [SERVER DOWN] exitState: ${JSON.stringify(exitState)}`)
    endStatistic()
  })

  const serveCacheMap = new CacheMap({
    valueSizeSumMax: CACHE_BUFFER_SIZE_SUM_MAX,
    onCacheAdd: __DEV__ ? (cache) => console.log('[onCacheAdd]', cache.key) : null,
    onCacheDelete: __DEV__ ? (cache) => console.log('[onCacheDelete]', cache.key) : null
  })

  const responderLogEnd = createResponderLogEnd((data, state) => {
    __DEV__ && state.error && console.error(state.error)
    const errorLog = state.error ? ` [ERROR] ${data.finished ? 'finished' : 'not-finished'} ${state.error}` : ''
    logStatistic(`${state.time} [END] ${Format.time(data.duration)} ${data.statusCode}${errorLog}`)
  })
  const responderTask = createResponderTask({
    staticRoot: `${pathResource}/static`,
    staticRoutePrefix: '/r/static',
    serveCacheMap
  })
  const responderRenderView = createResponderRenderView({
    getStatic: (path) => `/r/static/${path}`,
    getPack: (path) => `/r/pack/${packManifestMap[ path ]}`,
    route: '/v',
    staticRoot: `${pathResource}/static`,
    staticRoutePrefix: '/r/static',
    serveCacheMap
  })
  const responderServeStatic = wrapSetCacheControl(createResponderServeStatic({ staticRoot: pathResource, isEnableGzip: true, expireTime: CACHE_EXPIRE_TIME, serveCacheMap }))
  const routeProcessorFavicon = (store) => {
    store.setState({ filePath: 'static/favicon.ico' })
    return responderServeStatic(store)
  }

  // set router
  const routerMapBuilder = createRouterMapBuilder()
  routerMapBuilder.addRoute('/', 'GET', (store) => {
    store.setState({ viewKey: 'view:home' })
    return responderRenderView(store)
  })
  routerMapBuilder.addRoute('/favicon', 'GET', routeProcessorFavicon)
  routerMapBuilder.addRoute('/favicon.ico', 'GET', routeProcessorFavicon)
  routerMapBuilder.addRoute('/r/*', 'GET', (store) => {
    store.setState({ filePath: store.getState().paramMap[ routerMapBuilder.ROUTE_ANY ] })
    return responderServeStatic(store)
  })
  routerMapBuilder.addRoute('/t/*', 'GET', (store) => {
    store.setState({ taskKey: `task:${store.getState().paramMap[ routerMapBuilder.ROUTE_ANY ]}` })
    return responderTask(store)
  })
  routerMapBuilder.addRoute('/v/*', 'GET', (store) => {
    store.setState({ viewKey: `view:${store.getState().paramMap[ routerMapBuilder.ROUTE_ANY ]}` })
    return responderRenderView(store)
  })
  routerMapBuilder.addRoute('/auth/*', 'GET', async (store) => {
    await responderAuthVerifyToken(store, firebaseAdminApp, store.request.headers[ 'auth-token' ])
    store.response.write(`verified user: ${JSON.stringify(store.getState().user)}`)
  })
  routerMapBuilder.addRoute('/auth-check', 'GET', async (store) => {
    await responderAuthVerifyToken(store, firebaseAdminApp, store.request.headers[ 'auth-token' ])
    store.response.write(`verified user: ${JSON.stringify(store.getState().user)}`)
  })

  // create server
  const { server, start } = createServer({
    hostName,
    port,
    key: fileSSLKey ? await readFileAsync(fileSSLKey) : null,
    cert: fileSSLCert ? await readFileAsync(fileSSLCert) : null,
    ca: fileSSLChain ? await readFileAsync(fileSSLChain) : null,
    dhparam: fileSSLDHParam ? await readFileAsync(fileSSLDHParam) : null // Diffie-Hellman Key Exchange
  }, protocol)

  server.on('request', createRequestListener({
    responderList: [
      createResponderLogRequestHeader((data, state) => logStatistic(`${state.time} [REQUEST] ${data.method} ${data.host} ${data.url} ${data.remoteAddress} ${data.remotePort} ${data.userAgent}`)),
      createResponderParseURL(),
      // createResponderLogTimeStep((stepTime, state) => logStatistic(`${state.time} [STEP] ${Format.time(stepTime)}`)),
      protocol === 'HTTPS'
        ? wrapSetHSTS(createResponderRouter(routerMapBuilder.getRouterMap()))
        : createResponderRouter(routerMapBuilder.getRouterMap())
    ],
    responderEnd: async (store) => {
      await responderEnd(store)
      await responderLogEnd(store)
    }
  }))

  // enable websocket
  applyWebSocketServer(server, firebaseAdminApp)

  logStatistic(`${clock()} [SERVER UP] server config: ${JSON.stringify({ hostName, port })}`)

  return { server, start }
}

export { configureServer }
