import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Card, CardHeader, Grid, Snackbar, Button, withStyles } from 'material-ui'
import { getLogStyle } from 'theme/style'
import { GridContainer } from 'view/__utils__'

class StatusComponent extends PureComponent {
  static propTypes = {
    classes: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)

    this.doResetError = () => this.setState({ error: null })
    this.doFetchData = () => window.fetch('/t/server-status')
      .then((result) => result.json())
      .then(({ serverStatusList }) => this.setState({ serverStatusList }))
      .catch((error) => this.setState({ error }))
    this.doRetryFetchData = () => {
      this.doResetError()
      this.doFetchData()
    }

    this.state = { serverStatusList: [], error: null }
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

  renderStatusCard ({ config, status }, index) {
    const { classes } = this.props
    if (!status) return <Grid key={index} item xs={12} sm={8}><Card><CardHeader title={config.name} subheader={config.command} /></Card></Grid>
    const { code, signal, stdoutString, stderrString } = status
    return <Grid key={index} item xs={12} sm={8}><Card>
      <CardHeader title={config.name} subheader={config.command} />
      {code !== 0 && <Grid component="pre" className={classes.log}>[{code}] {signal || ''}</Grid>}
      {stdoutString && <Grid component="pre" className={classes.log}>{stdoutString}</Grid>}
      {stderrString && <Grid component="pre" className={classes.log}>{stderrString}</Grid>}
    </Card></Grid>
  }

  render () {
    const { serverStatusList } = this.state
    return <GridContainer>
      {serverStatusList.map(this.renderStatusCard, this)}
      {this.renderErrorSnackbar()}
    </GridContainer>
  }
}

const Status = withStyles((theme) => ({
  log: getLogStyle(theme)
}))(StatusComponent)

export { Status }
