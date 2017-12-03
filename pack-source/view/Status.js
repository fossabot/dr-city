import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Card, CardHeader, Grid, withStyles } from 'material-ui'
import { ROUTE_MAP } from 'pack-source/__utils__'
import { LogStyle } from 'pack-source/theme/style'
import { GridContainer } from 'pack-source/view/Layout'

class StatusComponent extends PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)

    this.doFetchData = async () => {
      try {
        const response = await window.fetch(ROUTE_MAP.TASK_SERVER_STATUS, { method: 'POST' })
        const { serverStatusList } = await response.json()
        this.setState({ serverStatusList })
      } catch (error) {
        this.props.dispatch({ type: 'state:error:add', payload: { error, retryFunc: this.doFetchData } })
      }
    }

    this.state = { serverStatusList: [] }
  }

  componentDidMount () { this.doFetchData() }

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
    </GridContainer>
  }
}

const Status = withStyles((theme) => ({ log: LogStyle }))(StatusComponent)

export { Status }
