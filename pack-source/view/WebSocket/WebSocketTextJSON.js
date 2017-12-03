import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Card, CardContent, CardActions, Grid, Button, TextField, Typography } from 'material-ui'
import { addLogListener, formatDataSize } from './__utils__'

class WebSocketTextJSON extends PureComponent {
  static propTypes = {
    textJSONWebSocket: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)

    this.clearLog = () => this.setState({ logText: '' })
    this.addLog = (logText) => this.setState({ logText: `${this.state.logText}${logText}\n` })
    this.openWebSocket = () => this.props.dispatch({ type: 'state:websocket:text-json:open' })
    this.closeWebSocket = () => this.props.dispatch({ type: 'state:websocket:text-json:close' })
    this.sendWebSocket = () => {
      const { textJSONWebSocket } = this.props
      if (!textJSONWebSocket) return
      const data = JSON.stringify({ type: this.textJSONTypeRef.value, payload: this.textJSONPayloadRef.value })
      textJSONWebSocket.send(data)
      this.addLog(`[>>|${formatDataSize(data)}] ${data.length > 48 ? `${data.slice(0, 32)}...` : data}`)
    }

    this.setTextJSONTypeRef = (ref) => (this.textJSONTypeRef = ref)
    this.setTextJSONPayloadRef = (ref) => (this.textJSONPayloadRef = ref)
    this.textJSONTypeRef = null
    this.textJSONPayloadRef = null

    this.state = { logText: '' }
  }

  componentDidUpdate (prevProps, prevState) {
    !prevProps.textJSONWebSocket && this.props.textJSONWebSocket && addLogListener(this.props.textJSONWebSocket, this.addLog)
  }

  render () {
    const { textJSONWebSocket, classes } = this.props
    const { logText } = this.state
    const hasWebSocket = Boolean(textJSONWebSocket)
    return <Card>
      <CardContent>
        <Typography type="title" className={classes.title}>Text JSON</Typography>
        <TextField inputRef={this.setTextJSONTypeRef} disabled={!hasWebSocket} label="Type" placeholder="data-type" margin="normal" fullWidth />
        <TextField inputRef={this.setTextJSONPayloadRef} disabled={!hasWebSocket} label="Payload" placeholder="data-payload" margin="normal" fullWidth multiline rowsMax={8} />
      </CardContent>
      <Grid component="pre" className={classes.log}>{logText || 'LOG'}</Grid>
      <CardActions>
        {hasWebSocket
          ? <Button onClick={this.closeWebSocket}>Close</Button>
          : <Button onClick={this.openWebSocket}>Open</Button>
        }
        <Button onClick={this.sendWebSocket} disabled={!hasWebSocket}>Send</Button>
        <Button onClick={this.clearLog} disabled={!logText}>Clear Log</Button>
      </CardActions>
    </Card>
  }
}

export { WebSocketTextJSON }
