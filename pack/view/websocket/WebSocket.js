import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Card, CardContent, CardActions, Grid, Button, TextField, Typography, withStyles } from 'material-ui'
import { GridContainer } from 'view/__utils__'

class WebSocketComponent extends PureComponent {
  static propTypes = {
    websocketState: PropTypes.object,
    logTextJSONReset: PropTypes.func,
    openTextJSONWebSocket: PropTypes.func,
    sendTextJSONWebSocket: PropTypes.func,
    closeTextJSONWebSocket: PropTypes.func,
    logBufferPacketReset: PropTypes.func,
    openBufferPacketWebSocket: PropTypes.func,
    sendBufferPacketWebSocket: PropTypes.func,
    closeBufferPacketWebSocket: PropTypes.func,
    classes: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)

    this.sendTextJSONWebSocket = () => this.props.sendTextJSONWebSocket(
      this.textJSONTypeRef.value,
      this.textJSONPayloadRef.value
    )
    this.sendBufferPacketWebSocket = () => this.props.sendBufferPacketWebSocket(
      this.bufferPacketTypeRef.value,
      this.bufferPacketPayloadRef.value,
      this.bufferPacketBlobRef.files[ 0 ]
    )

    this.setTextJSONTypeRef = (ref) => (this.textJSONTypeRef = ref)
    this.setTextJSONPayloadRef = (ref) => (this.textJSONPayloadRef = ref)
    this.textJSONTypeRef = null
    this.textJSONPayloadRef = null

    this.setBufferPacketTypeRef = (ref) => (this.bufferPacketTypeRef = ref)
    this.setBufferPacketPayloadRef = (ref) => (this.bufferPacketPayloadRef = ref)
    this.setBufferPacketBlobRef = (ref) => (this.bufferPacketBlobRef = ref)
    this.bufferPacketTypeRef = null
    this.bufferPacketPayloadRef = null
    this.bufferPacketBlobRef = null
  }

  render () {
    const {
      websocketState: { textJSONWebSocket, textJSONLog, bufferPacketWebSocket, bufferPacketLog },
      logTextJSONReset,
      openTextJSONWebSocket,
      closeTextJSONWebSocket,
      logBufferPacketReset,
      openBufferPacketWebSocket,
      closeBufferPacketWebSocket,
      classes
    } = this.props
    const hasTextJSONWebSocket = Boolean(textJSONWebSocket)
    const hasBufferPacketSocket = Boolean(bufferPacketWebSocket)
    return <GridContainer>
      <Grid item xs={12} sm={6}><Card>
        <CardContent>
          <Typography type="title" className={classes.title}>Text JSON</Typography>
          <TextField inputRef={this.setTextJSONTypeRef} label="Type" placeholder="data-type" margin="normal" fullWidth />
          <TextField inputRef={this.setTextJSONPayloadRef} label="Payload" placeholder="data-payload" margin="normal" fullWidth multiline />
        </CardContent>
        <Grid component="pre" className={classes.log}>{textJSONLog || 'LOG'}</Grid>
        <CardActions>
          <Button onClick={hasTextJSONWebSocket ? closeTextJSONWebSocket : openTextJSONWebSocket}>{hasTextJSONWebSocket ? 'Close' : 'Open'}</Button>
          <Button onClick={this.sendTextJSONWebSocket} disabled={!hasTextJSONWebSocket}>Send</Button>
          <Button onClick={logTextJSONReset} disabled={!textJSONLog}>Clear Log</Button>
        </CardActions>
      </Card></Grid>
      <Grid item xs={12} sm={6}><Card>
        <CardContent>
          <Typography type="title" className={classes.title}>Buffer Packet</Typography>
          <TextField inputRef={this.setBufferPacketTypeRef} label="Type" placeholder="data-type" margin="normal" fullWidth />
          <TextField inputRef={this.setBufferPacketPayloadRef} label="Payload" placeholder="data-payload" margin="normal" fullWidth multiline />
          <TextField inputRef={this.setBufferPacketBlobRef} type="file" label="Blob" margin="normal" fullWidth />
        </CardContent>
        <Grid component="pre" className={classes.log}>{bufferPacketLog || 'LOG'}</Grid>
        <CardActions>
          <Button onClick={hasBufferPacketSocket ? closeBufferPacketWebSocket : openBufferPacketWebSocket}>{hasBufferPacketSocket ? 'Close' : 'Open'}</Button>
          <Button onClick={this.sendBufferPacketWebSocket} disabled={!hasBufferPacketSocket}>Send</Button>
          <Button onClick={logBufferPacketReset} disabled={!bufferPacketLog}>Clear Log</Button>
        </CardActions>
      </Card></Grid>
    </GridContainer>
  }
}

const WebSocket = withStyles((theme) => ({
  log: { overflow: 'auto', padding: '8px', minHeight: '60px', maxHeight: '360px', background: theme.palette.secondary[ 100 ] }
}))(WebSocketComponent)

export { WebSocket }
