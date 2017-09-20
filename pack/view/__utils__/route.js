const ROUTE_MAP = {
  HOME: '/',
  HOME_ALIAS: '/v/home',
  SERVER_STATUS: '/v/server-status',
  STATIC_FILE_LIST: '/v/static-file-list',
  TEST_AUTH: '/v/test-auth',
  TEST_WEBSOCKET: '/v/test-websocket',
  INFO: '/v/info'
}

const ROUTE_INFO_MAP = {
  [ROUTE_MAP.HOME]: { title: 'Home', iconName: 'home', onClick: () => (window.location.href = ROUTE_MAP.HOME) },
  [ROUTE_MAP.SERVER_STATUS]: { title: 'Status', iconName: 'assignment', onClick: () => (window.location.href = ROUTE_MAP.SERVER_STATUS) },
  [ROUTE_MAP.STATIC_FILE_LIST]: { title: 'File', iconName: 'folder', onClick: () => (window.location.href = ROUTE_MAP.STATIC_FILE_LIST) },
  [ROUTE_MAP.TEST_AUTH]: { title: 'Test Auth', iconName: 'extension', onClick: () => (window.location.href = ROUTE_MAP.TEST_AUTH) },
  [ROUTE_MAP.TEST_WEBSOCKET]: { title: 'Test WebSocket', iconName: 'extension', onClick: () => (window.location.href = ROUTE_MAP.TEST_WEBSOCKET) },
  [ROUTE_MAP.INFO]: { title: 'Info', iconName: 'info', onClick: () => (window.location.href = ROUTE_MAP.INFO) }
}

export { ROUTE_MAP, ROUTE_INFO_MAP }
