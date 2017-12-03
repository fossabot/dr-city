import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Card, CardContent, CardActions, Grid, Button, TextField, Typography } from 'material-ui'
import { addLogListener, formatDataSize, createBufferPacket } from './__utils__'

class WebSocketBinaryPacket extends PureComponent {
  static propTypes = {
    binaryPacketWebSocket: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)

    this.clearLog = () => this.setState({ logText: '' })
    this.addLog = (logText) => this.setState({ logText: `${this.state.logText}${logText}\n` })

    this.onInputFileChange = () => {
      const blobFileName = this.binaryPacketBlobRef.files[ 0 ] ? this.binaryPacketBlobRef.files[ 0 ].name : ''
      this.setState({ blobFileName })
    }
    this.clearInputFile = () => {
      this.binaryPacketBlobRef.value = ''
      this.setState({ blobFileName: '' })
    }

    this.openWebSocket = () => this.props.dispatch({ type: 'state:websocket:binary-packet:open' })
    this.closeWebSocket = () => this.props.dispatch({ type: 'state:websocket:binary-packet:close' })
    this.sendWebSocket = () => {
      const { binaryPacketWebSocket } = this.props
      if (!binaryPacketWebSocket) return
      const { headerString, payloadBlob, blobPacket: data } = createBufferPacket(
        this.binaryPacketTypeRef.value,
        this.binaryPacketPayloadRef.value,
        this.binaryPacketBlobRef.files[ 0 ]
      )
      binaryPacketWebSocket.send(data)
      this.addLog(`[>>|${formatDataSize(data)}] header: ${headerString.length > 48 ? `${headerString.slice(0, 32)}...` : headerString}, payload: ${formatDataSize(payloadBlob)}`)
    }

    this.setBufferPacketTypeRef = (ref) => (this.binaryPacketTypeRef = ref)
    this.setBufferPacketPayloadRef = (ref) => (this.binaryPacketPayloadRef = ref)
    this.setBufferPacketBlobRef = (ref) => (this.binaryPacketBlobRef = ref)
    this.binaryPacketTypeRef = null
    this.binaryPacketPayloadRef = null
    this.binaryPacketBlobRef = null

    this.state = { logText: '', blobFileName: '' }
  }

  componentDidUpdate (prevProps, prevState) {
    !prevProps.binaryPacketWebSocket && this.props.binaryPacketWebSocket && addLogListener(this.props.binaryPacketWebSocket, this.addLog)
  }

  render () {
    const { binaryPacketWebSocket, classes } = this.props
    const { logText, blobFileName } = this.state
    const hasWebSocket = Boolean(binaryPacketWebSocket)
    return <Card>
      <CardContent>
        <Typography type="title" className={classes.title}>Buffer Packet</Typography>
        <TextField inputRef={this.setBufferPacketTypeRef} disabled={!hasWebSocket} label="Type" placeholder="data-type" margin="normal" fullWidth />
        <TextField inputRef={this.setBufferPacketPayloadRef} disabled={!hasWebSocket} label="Payload" placeholder="data-payload" margin="normal" fullWidth multiline rowsMax={8} />
        <input ref={this.setBufferPacketBlobRef} id="input-file" type="file" accept="*/*" style={{ display: 'none' }} onChange={this.onInputFileChange} disabled={!hasWebSocket} />
      </CardContent>
      <CardActions>
        <label htmlFor="input-file">
          <Button component="span" disabled={!hasWebSocket}>{blobFileName ? `Blob: ${blobFileName}` : 'Select Blob'}</Button>
        </label>
        <Button onClick={this.clearInputFile} disabled={!hasWebSocket}>Clear Blob</Button>
      </CardActions>
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

export { WebSocketBinaryPacket }
