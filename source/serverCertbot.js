import { Node } from 'dr-js/library/Dr.node'

const {
  createServer,
  applyResponseReducerList,
  ResponseReducer: {
    createRouterMapBuilder,
    createResponseReducerRouter,
    createResponseReducerParseURL,
    createResponseReducerServeStatic
  }
} = Node.Server

// NOTE: this server is solely used for `Certbot` to verify and assign a `Let's Encrypt` certificate
// pathCertSSL should have './.well-known/[hash-file]'
const configureServerCertBot = ({ hostName, pathResource }) => {
  const responseReducerServeStatic = createResponseReducerServeStatic({ staticRoot: pathResource })

  // set router
  const routerMapBuilder = createRouterMapBuilder()
  routerMapBuilder.addRoute('/*', 'GET', (store) => {
    store.setState({ filePath: store.getState().paramMap[ routerMapBuilder.ROUTE_ANY ] })
    return responseReducerServeStatic(store)
  })

  // create server
  const { server, start } = createServer({ hostName }, 'HTTP')
  applyResponseReducerList(server, [
    createResponseReducerParseURL(),
    createResponseReducerRouter(routerMapBuilder.getRouterMap())
  ])

  return { server, start }
}

export {
  configureServerCertBot
}
