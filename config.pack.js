// firebase
const FIREBASE_API_KEY = 'AIzaSyAePZVxWgZHUEPvFI4n4QbknQ-nTpP8PWw'
const FIREBASE_AUTH_DOMAIN = 'drcity-e3377.firebaseapp.com'

// route
const ROUTE_MAP = {
  // view
  VIEW: '/v',
  VIEW_DEFAULT: '/v/default',
  VIEW_MAIN: '/v/main',
  VIEW_USER: '/v/user',
  VIEW_FILE: '/v/file',
  VIEW_STATUS: '/v/status',
  VIEW_INFO: '/v/info',
  // VIEW_TEST: '/v/test',
  VIEW_TEST_WEBSOCKET: '/v/test-websocket',
  VIEW_TEST_ERROR: '/v/test-error',
  VIEW_TEST_ERROR_ASYNC: '/v/test-error-async',

  AUTH_VIEW: '/~v',
  AUTH_VIEW_WEBSOCKET: '/~v/websocket',
  AUTH_VIEW_USER_FILE: '/~v/file',

  // task
  TASK: '/t',

  TASK_SERVER_STATUS: '/t/server-status',
  TASK_FILE_LIST_SHARE: '/t/file-list-share',

  AUTH_TASK: '/~t',
  AUTH_TASK_TOKEN_CHECK: '/~t/token-check',
  AUTH_TASK_SERVER_STATUS: '/~t/server-status',
  AUTH_TASK_FILE_LIST_USER: '/~t/file-list-user',

  // static
  STATIC_RESOURCE: '/r', // from package
  STATIC_RESOURCE_PACK: '/r/pack',
  STATIC_SHARE: '/s', // public local file
  AUTH_STATIC_USER: '/~u', // user private local file

  // webSocket
  WEBSOCKET: '/w',
  WEBSOCKET_GROUP: '/wg',
  AUTH_WEBSOCKET: '/~w',
  AUTH_WEBSOCKET_GROUP: '/~wg'
}

module.exports = {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,

  ROUTE_MAP
}
