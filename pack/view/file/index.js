import React from 'react'
import ReactDOM from 'react-dom'

import { ROUTE_MAP, Layout } from 'view/__utils__'
import { File } from './File'

window.main = (rootElement) => ReactDOM.render(<Layout route={ROUTE_MAP.STATIC_FILE_LIST}><File /></Layout>, rootElement)
