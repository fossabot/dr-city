import nodeModuleFs from 'fs'
import { promisify } from 'util'
import { Common, Node } from 'dr-js/library/Dr.node'
import { initFirebaseAdmin, responseReducerAuthVerifyToken } from './Responder'
import { responseReducerRenderView } from './View'
import { createStatisticLogger } from './Task/saveStatistics'

const readFileAsync = promisify(nodeModuleFs.readFile)

const { Format } = Common
const {
  System: { addProcessExitListener },
  Server: {
    createServer,
    applyResponseReducerList,
    ResponseReducer: {
      createRouterMapBuilder,
      createResponseReducerRouter,
      createResponseReducerParseURL,
      createResponseReducerServeStatic,
      createResponseReducerLogRequestHeader,
      createResponseReducerLogTimeStep,
      createResponseReducerLogEnd
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

  const responseReducerServeStatic = wrapSetCacheControl(createResponseReducerServeStatic({ staticRoot: pathResource }))
  const routeProcessorFavicon = (store) => {
    store.setState({ filePath: 'favicon.ico' })
    return responseReducerServeStatic(store)
  }

  const responseReducerLogRequestHeader = createResponseReducerLogRequestHeader((data) => logStatistic(`[REQUEST] ${data.method} ${data.host} ${data.url} ${data.remoteAddress} ${data.remotePort} ${data.userAgent}`))
  const responseReducerLogEnd = createResponseReducerLogEnd((data, state) => logStatistic(!state.error ? `[END] ${Format.time(data.duration)} ${data.statusCode}` : `[ERROR] ${Format.time(data.duration)} ${data.statusCode} ${data.error} ${data.finished}`))
  // const responseReducerLogTimeStep = createResponseReducerLogTimeStep((stepTime) => logStatistic(`[STEP] ${Format.time(stepTime)}`))

  // set router
  const routerMapBuilder = createRouterMapBuilder()
  routerMapBuilder.addRoute('/', 'GET', (store) => {
    store.setState({ viewKey: 'home' })
    return responseReducerRenderView(store)
  })
  routerMapBuilder.addRoute('/favicon', 'GET', routeProcessorFavicon)
  routerMapBuilder.addRoute('/favicon.ico', 'GET', routeProcessorFavicon)
  routerMapBuilder.addRoute('/static/*', 'GET', (store) => {
    store.setState({ filePath: store.getState().paramMap[ routerMapBuilder.ROUTE_ANY ] })
    return responseReducerServeStatic(store)
  })
  routerMapBuilder.addRoute('/auth/check', 'GET', (store) => responseReducerAuthVerifyToken(store, firebaseAdminApp).then((store) => {
    store.response.write(`verified user: ${JSON.stringify(store.getState().user)}`)
    return store
  }))
  routerMapBuilder.addRoute('/view/*', 'GET', (store) => {
    store.setState({ viewKey: store.getState().paramMap[ routerMapBuilder.ROUTE_ANY ] })
    return responseReducerRenderView(store)
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

  applyResponseReducerList(server, [
    responseReducerLogRequestHeader,
    createResponseReducerParseURL(),
    protocol === 'HTTPS'
      ? wrapSetHSTS(createResponseReducerRouter(routerMapBuilder.getRouterMap()))
      : createResponseReducerRouter(routerMapBuilder.getRouterMap()),
    responseReducerLogEnd
  ])

  return { server, start }
}

export {
  configureServer
}
