import ReactDOM from 'react-dom'
import React from 'react'
import { Provider } from 'react-redux'
import { Common } from 'dr-js/module/Dr.browser'

import { ROUTE_MAP } from 'pack-source/__utils__'
import { configure } from './configure'
import { Root } from './Root'

import {
  AuthConnected,
  StatusConnected,
  ShareFileConnected,
  UserFileConnected,
  WebSocketConnected,

  Main,
  Info,
  TestError,
  TestErrorAsync
} from './view'

const { getRouteParamAny } = Common.Module

window.main = (rootElement) => {
  const { store } = configure({})

  // const routerConfigList = Object.entries(ROUTE_MAP).map(([ routeKey, route ]) => [ route, { routeKey } ])

  const routerConfigList = [
    [ ROUTE_MAP.VIEW_MAIN, { viewKey: ROUTE_MAP.VIEW_MAIN, component: <Main /> } ],
    [ ROUTE_MAP.VIEW_USER, { viewKey: ROUTE_MAP.VIEW_USER, component: <AuthConnected /> } ],
    [ ROUTE_MAP.VIEW_STATUS, { viewKey: ROUTE_MAP.VIEW_STATUS, component: <StatusConnected /> } ],
    [
      [ ROUTE_MAP.VIEW_FILE, `${ROUTE_MAP.VIEW_FILE}/`, `${ROUTE_MAP.VIEW_FILE}/*` ],
      { viewKey: ROUTE_MAP.VIEW_FILE, render: (routeData) => <ShareFileConnected relativePath={getRouteParamAny(routeData) || ''} /> }
    ],
    [ ROUTE_MAP.VIEW_INFO, { viewKey: ROUTE_MAP.VIEW_INFO, component: <Info /> } ],
    [ ROUTE_MAP.VIEW_TEST_WEBSOCKET, { viewKey: ROUTE_MAP.VIEW_TEST_WEBSOCKET, component: <WebSocketConnected /> } ],
    [ ROUTE_MAP.VIEW_TEST_ERROR, { viewKey: ROUTE_MAP.VIEW_TEST_ERROR, component: <TestError /> } ],
    [ ROUTE_MAP.VIEW_TEST_ERROR_ASYNC, { viewKey: ROUTE_MAP.VIEW_TEST_ERROR_ASYNC, component: <TestErrorAsync /> } ],
    [
      [ ROUTE_MAP.AUTH_VIEW_USER_FILE, `${ROUTE_MAP.AUTH_VIEW_USER_FILE}/`, `${ROUTE_MAP.AUTH_VIEW_USER_FILE}/*` ],
      { viewKey: ROUTE_MAP.AUTH_VIEW_USER_FILE, render: (routeData) => <UserFileConnected relativePath={getRouteParamAny(routeData) || ''} /> }
    ]
  ]

  store.dispatch({ type: 'state:router:init', payload: { routerConfigList } })
  store.dispatch({ type: 'state:auth:init' })

  ReactDOM.render(<Provider store={store}><Root /></Provider>, rootElement)

  if (__DEV__) window.D = { store }
}
