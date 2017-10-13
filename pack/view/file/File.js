import React, { PureComponent } from 'react'
import { Card, List, ListItem, ListItemIcon, ListItemText, Grid, Snackbar, Button } from 'material-ui'

import { GridContainer } from 'view/__utils__'
import { getTag } from './Tag'

class File extends PureComponent {
  constructor (props) {
    super(props)

    this.doResetError = () => this.setState({ error: null })
    this.doFetchData = () => window.fetch('/t/static-file-list')
      .then((result) => result.json())
      .then(({ staticRoutePrefix, relativeFilePathList }) => this.setState({ staticRoutePrefix, relativeFilePathList }))
      .catch((error) => this.setState({ error }))
    this.doRetryFetchData = () => {
      this.doResetError()
      this.doFetchData()
    }

    this.state = { staticRoutePrefix: '', relativeFilePathList: [], error: null }
  }

  componentDidMount () { this.doFetchData() }

  renderErrorSnackbar () {
    const { error } = this.state
    return <Snackbar
      open={Boolean(error)}
      onRequestClose={this.doResetError}
      message={error ? <span>{error.message}</span> : null}
      action={<Button color="accent" dense onClick={this.doRetryFetchData}>retry</Button>}
    />
  }

  render () {
    const { staticRoutePrefix, relativeFilePathList } = this.state
    return <GridContainer>
      <Grid item xs={12} sm={6}><Card>
        {relativeFilePathList.length !== 0 && <List dense>{
          relativeFilePathList.map((relativeFilePath) => renderTagLink(
            (REGEXP_EXTNAME.exec(relativeFilePath) || ' ')[ 0 ].slice(1).toUpperCase(),
            `${staticRoutePrefix}/${relativeFilePath}`,
            relativeFilePath
          ))
        }</List>}
        {this.renderErrorSnackbar()}
      </Card></Grid>
    </GridContainer>
  }
}

const renderTagLink = (tagText, linkUri, linkText) => <ListItem key={linkUri} button component="a" href={linkUri}>
  <ListItemIcon>{getTag(tagText)}</ListItemIcon>
  <ListItemText primary={linkText} />
</ListItem>
const REGEXP_EXTNAME = /\.\w+$/

export { File }
