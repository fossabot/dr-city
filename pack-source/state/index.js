import { createStateStoreMergeReducer } from 'pack-source/__utils__'

import Error from './Error'
import Auth, { authFetch } from './Auth'
import Router from './Router'
import WebSocket from './WebSocket'

const asyncTaskMap = {
  ...Error.asyncTaskMap,
  ...Router.asyncTaskMap,
  ...Auth.asyncTaskMap,
  ...WebSocket.asyncTaskMap
}

const entryMap = {
  ...Error.entryMap,
  ...Router.entryMap,
  ...Auth.entryMap,
  ...WebSocket.entryMap
}

const reducerMap = {
  error: createStateStoreMergeReducer('reducer:error:update', Error),
  router: createStateStoreMergeReducer('reducer:router:update', Router),
  auth: createStateStoreMergeReducer('reducer:auth:update', Auth),
  websocket: createStateStoreMergeReducer('reducer:websocket:update', WebSocket)
}

const stateMap = {
  error: 'reducer:error:update',
  router: 'reducer:router:update',
  auth: 'reducer:auth:update',
  websocket: 'reducer:websocket:update'
}
const setInitialState = (store, initialState) => Object.entries(stateMap).forEach(([ name, type ]) => initialState[ name ] && store.dispatch({ type, payload: initialState[ name ] }))

export {
  asyncTaskMap,
  entryMap,
  reducerMap,
  setInitialState,

  authFetch
}
