import { Node } from 'dr-js/module/Dr.node'

const {
  createServer,
  createRequestListener,
  Responder: {
    createRouterMapBuilder,
    createResponderRouter,
    createResponderParseURL,
    createResponderServeStatic
  }
} = Node.Server

// NOTE: this server is solely used for `Certbot` to verify and assign a `Let's Encrypt` certificate
// pathCertSSL should have './.well-known/[hash-file]'
const configureServerCertBot = ({ hostName, pathResource }) => {
  const responderServeStatic = createResponderServeStatic({ staticRoot: pathResource })

  // set router
  const routerMapBuilder = createRouterMapBuilder()
  routerMapBuilder.addRoute('/*', 'GET', (store) => {
    store.setState({ filePath: store.getState().paramMap[ routerMapBuilder.ROUTE_ANY ] })
    return responderServeStatic(store)
  })

  // create server
  const { server, start } = createServer({ hostName }, 'HTTP')
  server.on('request', createRequestListener({
    responderList: [
      createResponderParseURL(),
      createResponderRouter(routerMapBuilder.getRouterMap())
    ]
  }))

  return { server, start }
}

export {
  configureServerCertBot
}
