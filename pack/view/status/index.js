import React from 'react'
import ReactDOM from 'react-dom'

import { ROUTE_MAP, Layout } from 'view/__utils__'
import { Status } from './Status'

window.main = (rootElement) => ReactDOM.render(<Layout route={ROUTE_MAP.SERVER_STATUS}><Status /></Layout>, rootElement)
