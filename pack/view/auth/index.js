import React from 'react'
import ReactDOM from 'react-dom'

import { ROUTE_MAP, Layout, createFirebaseAuth } from 'view/__utils__'
import { Auth } from './Auth'

window.main = (rootElement) => {
  ReactDOM.render(<Layout route={ROUTE_MAP.TEST_AUTH} />, rootElement)
  const { stateStore, doAuthGrantGoogle, doAuthGrantGithub, doAuthRevoke, doAuthCheck } = createFirebaseAuth()
  stateStore.subscribe(() => ReactDOM.render(<Layout route={ROUTE_MAP.TEST_AUTH}>
    <Auth {...{ authState: stateStore.getState(), doAuthGrantGoogle, doAuthGrantGithub, doAuthRevoke, doAuthCheck }} />
  </Layout>, rootElement))
}
