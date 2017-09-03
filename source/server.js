import nodeModuleFs from 'fs'
import { promisify } from 'util'
import { Common, Node } from 'dr-js/library/Dr.node'
import { initFirebaseAdmin, responderAuthVerifyToken, applyWebSocketServer } from './Responder'
import { createResponderRenderView } from './View'
import { createStatisticLogger } from './Task/saveStatistics'

const readFileAsync = promisify(nodeModuleFs.readFile)

const { Format, Time: { clock } } = Common
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

  const { logStatistic, endStatistic } = await createStatisticLogger({ logRoot: pathLog, logFilePrefix })
  addProcessExitListener((exitState) => {
    __DEV__ && console.log('onExit', exitState)
    logStatistic(`${clock()} [SERVER DOWN] exitState: ${JSON.stringify(exitState)}`)
    endStatistic()
  })

  const responderLogEnd = createResponderLogEnd((data, state) => logStatistic(`${state.time} [END] ${Format.time(data.duration)} ${data.statusCode}${state.error ? ` [ERROR] ${data.finished ? 'finished' : 'not-finished'} ${state.error}` : ''}`))
  const responderRenderView = createResponderRenderView({ route: '/view', staticRoot: pathResource, staticRoute: '/static' })
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

export {
  configureServer
}
