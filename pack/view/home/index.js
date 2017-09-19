import React from 'react'
import ReactDOM from 'react-dom'

import { ROUTE_MAP, Layout } from 'view/__utils__'
import { Home } from './Home'

window.main = (rootElement) => ReactDOM.render(<Layout route={ROUTE_MAP.HOME}><Home /></Layout>, rootElement)

