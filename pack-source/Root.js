import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ROUTE_MAP } from 'pack-source/__utils__'
import { Layout, ErrorSnackbarConnected } from './view'

class RootComponent extends PureComponent {
  static propTypes = {
    routeData: PropTypes.object,
    user: PropTypes.object,
    dispatch: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.setRoute = (route) => {
      const urlObject = new window.URL(window.location.href)
      urlObject.pathname = route
      this.props.dispatch({ type: 'state:router:set', payload: { url: urlObject.toString() } })
    }
  }

  componentDidCatch (error, info) {
    __DEV__ && console.log('[Root] componentDidCatch', error, info)
    this.props.dispatch({ type: 'state:router:set', payload: { url: (new window.URL(ROUTE_MAP.VIEW_MAIN, window.location.origin)).toString() } })
    this.props.dispatch({ type: 'state:error:add', payload: { error, retryFunc: () => window.location.reload() } })
  }

  render () {
    const { routeData, user } = this.props
    if (!routeData) return null

    const { viewKey, component, render } = routeData.data
    __DEV__ && console.log('[Root]', routeData)

    return <Layout {...{ setRoute: this.setRoute, route: viewKey, user }} >
      {
        component ||
        (render && render(routeData)) ||
        'missing route content'
      }
      <ErrorSnackbarConnected />
    </Layout>
  }
}

const Root = connect(({ router: { routeData }, auth: { user }, error: { errorList } }) => ({
  routeData,
  user,
  errorList
}))(RootComponent)

export { Root }
