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
  System: { setProcessExitListener },
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

const configureServer = async ({
  protocol, hostname, port,
  fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam,
  fileFirebaseAdminToken, filePid,
  pathResource, pathStatic, pathUser, pathLog, logFilePrefix
}) => {
  const packManifestMap = {
    ...JSON.parse(await readFileAsync(nodeModulePath.join(pathResource, 'pack/manifest/common.json'), 'utf8')),
    ...JSON.parse(await readFileAsync(nodeModulePath.join(pathResource, 'pack/manifest/dll-vendor.json'), 'utf8')),
    ...JSON.parse(await readFileAsync(nodeModulePath.join(pathResource, 'pack/manifest/dll-vendor-firebase.json'), 'utf8'))
  }
  const firebaseAdminApp = initFirebaseAdminApp(JSON.parse(await readFileAsync(fileFirebaseAdminToken, 'utf8')))

  const { logStatistic, endStatistic } = await createStatisticLogger({ logRoot: pathLog, logFilePrefix })

  setProcessExitListener({
    listenerAsync: async ({ eventType, ...exitState }) => {
      __DEV__ && console.log('listenerAsync', eventType, exitState)
      logStatistic(`${clock()} [SERVER DOWN] eventType: ${eventType}, exitState: ${JSON.stringify(exitState)}`)
    },
    listenerSync: ({ eventType, code }) => {
      __DEV__ && console.log('listenerSync', eventType, code)
      logStatistic(`${clock()} [SERVER EXIT] eventType: ${eventType}, code: ${code}`)
      endStatistic()
      try { filePid && nodeModuleFs.unlinkSync(filePid) } catch (error) { __DEV__ && console.log('remove pid file', error) }
    }
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
    staticRoot: pathStatic,
    staticRoutePrefix: '/s',
    serveCacheMap
  })
  const responderRenderView = createResponderRenderView({
    getStatic: (path) => `/s/${path}`,
    getPack: (path) => `/r/pack/${packManifestMap[ path ]}`,
    route: '/v',
    staticRoot: pathStatic,
    staticRoutePrefix: '/s',
    serveCacheMap
  })
  const responderServeStaticResource = wrapSetCacheControl(createResponderServeStatic({ staticRoot: pathResource, isEnableGzip: true, expireTime: CACHE_EXPIRE_TIME, serveCacheMap }))
  const responderServeStaticStatic = wrapSetCacheControl(createResponderServeStatic({ staticRoot: pathStatic, isEnableGzip: true, expireTime: CACHE_EXPIRE_TIME, serveCacheMap }))
  const responderServeStaticUser = wrapSetCacheControl(createResponderServeStatic({ staticRoot: pathUser, isEnableGzip: true, expireTime: CACHE_EXPIRE_TIME, serveCacheMap }))
  const routeProcessorFavicon = (store) => {
    store.setState({ filePath: 'favicon.ico' })
    return responderServeStaticStatic(store)
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
    return responderServeStaticResource(store)
  })
  routerMapBuilder.addRoute('/s/*', 'GET', (store) => {
    store.setState({ filePath: store.getState().paramMap[ routerMapBuilder.ROUTE_ANY ] })
    return responderServeStaticStatic(store)
  })
  routerMapBuilder.addRoute('/t/*', 'GET', (store) => {
    store.setState({ taskKey: `task:${store.getState().paramMap[ routerMapBuilder.ROUTE_ANY ]}` })
    return responderTask(store)
  })
  routerMapBuilder.addRoute('/v/*', 'GET', (store) => {
    store.setState({ viewKey: `view:${store.getState().paramMap[ routerMapBuilder.ROUTE_ANY ]}` })
    return responderRenderView(store)
  })
  routerMapBuilder.addRoute('/auth-check', 'GET', async (store) => {
    await responderAuthVerifyToken(store, firebaseAdminApp, store.request.headers[ 'auth-token' ])
    store.response.write(`verified user: ${JSON.stringify(store.getState().user)}`)
  })
  routerMapBuilder.addRoute('/a/r/*', 'GET', async (store) => {
    await responderAuthVerifyToken(store, firebaseAdminApp, store.request.headers[ 'auth-token' ])
    const { user, paramMap } = store.getState()
    store.setState({ filePath: nodeModulePath.join(user.id, paramMap[ routerMapBuilder.ROUTE_ANY ]) })
    return responderServeStaticUser(store)
  })

  // create server
  const { server, start, stop, baseUrl } = createServer({
    protocol,
    hostname,
    port,
    key: fileSSLKey ? await readFileAsync(fileSSLKey) : null,
    cert: fileSSLCert ? await readFileAsync(fileSSLCert) : null,
    ca: fileSSLChain ? await readFileAsync(fileSSLChain) : null,
    dhparam: fileSSLDHParam ? await readFileAsync(fileSSLDHParam) : null // Diffie-Hellman Key Exchange
  })

  server.on('request', createRequestListener({
    responderList: [
      createResponderLogRequestHeader((data, state) => logStatistic(`${state.time} [REQUEST] ${data.method} ${data.host} ${data.url} ${data.remoteAddress} ${data.remotePort} ${data.userAgent}`)),
      createResponderParseURL(baseUrl),
      // createResponderLogTimeStep((stepTime, state) => logStatistic(`${state.time} [STEP] ${Format.time(stepTime)}`)),
      protocol === 'https:'
        ? wrapSetHSTS(createResponderRouter(routerMapBuilder.getRouterMap()))
        : createResponderRouter(routerMapBuilder.getRouterMap())
    ],
    responderEnd: async (store) => {
      await responderEnd(store)
      await responderLogEnd(store)
    }
  }))

  // enable websocket
  applyWebSocketServer({ server, baseUrl, firebaseAdminApp, pathUser })

  filePid && nodeModuleFs.writeFileSync(filePid, `${process.pid}`)

  logStatistic(`${clock()} [SERVER UP] server config: ${JSON.stringify({ hostname, port })}`)

  return { server, start, stop }
}

export { configureServer }
