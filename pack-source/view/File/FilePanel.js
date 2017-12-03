import { Browser } from 'dr-js/module/Dr.browser'
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Grid } from 'material-ui'
import { authFetch } from 'pack-source/state'
import { GridContainer } from 'pack-source/view/Layout'

import { FileList } from './FileList'

const { createDownloadBlob } = Browser.Resource

class FilePanel extends PureComponent {
  static propTypes = {
    relativePath: PropTypes.string.isRequired,
    isAuth: PropTypes.bool.isRequired,
    taskUrl: PropTypes.string.isRequired,
    viewRoute: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.toDirectory = async (nextRelativePath) => {
      if (this.state.relativePath === nextRelativePath) return
      try {
        const { taskUrl, viewRoute, isAuth } = this.props
        const { routePrefix, relativePath, directoryList, fileList, nextRouteUrl } = await fetchFileListData({ nextRelativePath, isAuth, taskUrl, viewRoute })
        this.props.dispatch({ type: 'state:router:set', payload: { url: nextRouteUrl } })
        this.setState({ routePrefix, relativePath, directoryList, fileList })
      } catch (error) { this.props.dispatch({ type: 'state:error:add', payload: { error, retryFunc: this.doFetchData } }) }
    }

    this.toFile = async (url, name) => {
      if (this.props.isAuth) {
        const response = await authFetch(url)
        const contentBlob = await response.blob()
        createDownloadBlob(name, [ contentBlob ])
      } else { window.open(url, '_blank') }
    }

    this.state = {
      routePrefix: '',
      relativePath: null,
      directoryList: [], // name only
      fileList: [] // name only
    }
  }

  componentDidMount () { this.toDirectory(this.props.relativePath) }

  componentDidUpdate () { this.toDirectory(this.props.relativePath) }

  render () {
    const { routePrefix, relativePath, directoryList, fileList } = this.state
    return <GridContainer>
      <Grid item xs={12} sm={8} lg={6}>
        {routePrefix && <FileList {...{ routePrefix, relativePath, directoryList, fileList, toDirectory: this.toDirectory, toFile: this.toFile }} />}
      </Grid>
    </GridContainer>
  }
}

const fetchFileListData = async ({ nextRelativePath, isAuth, taskUrl, viewRoute }) => {
  const response = await (isAuth ? authFetch : window.fetch)(taskUrl, { method: 'POST', body: JSON.stringify({ relativePath: nextRelativePath }) })
  const { routePrefix, relativePath, directoryList, fileList } = await response.json()
  const nextRouteUrl = (new window.URL(`${viewRoute}/${relativePath}`, window.location.origin)).toString()
  return { routePrefix, relativePath, directoryList, fileList, nextRouteUrl }
}

export { FilePanel }
