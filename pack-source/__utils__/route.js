import { ROUTE_MAP } from 'config.pack'

const ROUTE_INFO_MAP = {
  [ ROUTE_MAP.VIEW_MAIN ]: { title: 'Home', iconName: 'home' },
  [ ROUTE_MAP.VIEW_STATUS ]: { title: 'Status', iconName: 'assessment' },
  [ ROUTE_MAP.VIEW_FILE ]: { title: 'File', iconName: 'folder' },
  [ ROUTE_MAP.VIEW_INFO ]: { title: 'Info', iconName: 'info' },

  [ ROUTE_MAP.VIEW_USER ]: { title: 'User', iconName: 'account_box' },
  [ ROUTE_MAP.AUTH_VIEW_USER_FILE ]: { title: 'User File', iconName: 'folder' },

  [ ROUTE_MAP.VIEW_TEST_WEBSOCKET ]: { title: 'Test WebSocket', iconName: 'extension' },
  ...(__DEV__ ? {
    [ ROUTE_MAP.VIEW_TEST_ERROR ]: { title: 'Test Error', iconName: 'extension' },
    [ ROUTE_MAP.VIEW_TEST_ERROR_ASYNC ]: { title: 'Test Error Async', iconName: 'extension' }
  } : null)
}

Object.entries(ROUTE_INFO_MAP).forEach(([ route, routeInfo ]) => { routeInfo.route = route })

export { ROUTE_MAP, ROUTE_INFO_MAP }
