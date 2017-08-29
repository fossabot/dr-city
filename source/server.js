import nodeModuleFs from 'fs'
import { promisify } from 'util'
import { Common, Node } from 'dr-js/library/Dr.node'
import { initFirebaseAdmin, responderAuthVerifyToken, applyWebSocketServer } from './Responder'
import { createResponderRenderView } from './View'
import { createStatisticLogger } from './Task/saveStatistics'

const readFileAsync = promisify(nodeModuleFs.readFile)

const { Format } = Common
const {
  System: { addProcessExitListener },
  Server: {
    createServer,
    createRequestListener,
    Responder: {
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

const wrapSetHSTS = (next) => (store) => {
  store.response.setHeader('strict-transport-security', 'max-age=31536000; includeSubDomains; preload')
  return next(store)
}

const wrapSetCacheControl = (next) => (store) => {
  store.response.setHeader('cache-control', 'public, max-age=3600') // in seconds, 1h
  return next(store)
}

const configureServer = async ({ protocol, hostName, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam, fileFirebaseAdminToken, pathResource, pathLog, logFilePrefix }) => {
  const firebaseAdminApp = initFirebaseAdmin(JSON.parse(await readFileAsync(fileFirebaseAdminToken, 'utf8')))

  const { log: logStatistic, endSaveLog } = createStatisticLogger({ logRoot: pathLog, logFilePrefix })
  addProcessExitListener((exitState) => {
    __DEV__ && console.log('onExit', exitState)
    endSaveLog()
  })

  const responderRenderView = createResponderRenderView({ staticRoot: pathResource, staticRoute: '/static' })
  const responderServeStatic = wrapSetCacheControl(createResponderServeStatic({ staticRoot: pathResource }))
  const routeProcessorFavicon = (store) => {
    store.setState({ filePath: 'favicon.ico' })
    return responderServeStatic(store)
  }

  // set router
  const routerMapBuilder = createRouterMapBuilder()
  routerMapBuilder.addRoute('/', 'GET', (store) => {
    store.setState({ viewKey: 'home' })
    return responderRenderView(store)
  })
  routerMapBuilder.addRoute('/favicon', 'GET', routeProcessorFavicon)
  routerMapBuilder.addRoute('/favicon.ico', 'GET', routeProcessorFavicon)
  routerMapBuilder.addRoute('/static/*', 'GET', (store) => {
    store.setState({ filePath: store.getState().paramMap[ routerMapBuilder.ROUTE_ANY ] })
    return responderServeStatic(store)
  })
  routerMapBuilder.addRoute('/view/*', 'GET', (store) => {
    store.setState({ viewKey: store.getState().paramMap[ routerMapBuilder.ROUTE_ANY ] })
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
      createResponderLogRequestHeader((data) => logStatistic(`[REQUEST] ${data.method} ${data.host} ${data.url} ${data.remoteAddress} ${data.remotePort} ${data.userAgent}`)),
      createResponderParseURL(),
      // createResponderLogTimeStep((stepTime) => logStatistic(`[STEP] ${Format.time(stepTime)}`)),
      protocol === 'HTTPS'
        ? wrapSetHSTS(createResponderRouter(routerMapBuilder.getRouterMap()))
        : createResponderRouter(routerMapBuilder.getRouterMap()),
      createResponderLogEnd((data, state) => logStatistic(
        !state.error
          ? `[END] ${Format.time(data.duration)} ${data.statusCode}`
          : `[ERROR] ${Format.time(data.duration)} ${data.statusCode} ${data.error} ${data.finished}`
      ))
    ]
  }))

  // enable websocket
  applyWebSocketServer(server, firebaseAdminApp)

  return { server, start }
}

export {
  configureServer
}
