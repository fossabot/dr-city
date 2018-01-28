import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Card, CardContent, CardActions, Grid, Button, TextField, Typography } from 'material-ui'
import { Browser } from 'dr-js/module/Dr.browser'

const { createDownload } = Browser.Resource
const { packBlobPacket, parseBlobPacket, parseBlobAsDataURL } = Browser.Blob

class WebSocketAuthGroupBinaryPacket extends PureComponent {
  static propTypes = {
    authGroupBinaryPacketWebSocket: PropTypes.object,
    user: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)

    this.clearLog = () => this.setState({ logText: '' })
    this.addLog = (logText) => this.setState({ logText: `${this.state.logText}${logText}\n` })
    this.openWebSocket = () => {
      const groupPath = this.groupPathRef.value
      if (!groupPath) return this.props.dispatch({ type: 'state:error:add', payload: { message: 'Group Required!' } })
      const name = this.nameRef.value || this.props.user.name
      this.setState({ groupPath, name })
      this.props.dispatch({ type: 'state:websocket:auth-group-binary-packet:open', payload: { groupPath, name } })
    }
    this.closeWebSocket = () => this.props.dispatch({ type: 'state:websocket:auth-group-binary-packet:close' })
    this.sendWebSocket = () => {
      const { authGroupBinaryPacketWebSocket } = this.props
      const { name } = this.state
      if (!authGroupBinaryPacketWebSocket) return
      const text = this.binaryPacketPayloadRef.value
      const file = this.binaryPacketBlobRef.files[ 0 ]
      const fileName = file ? file.name : ''
      authGroupBinaryPacketWebSocket.send(packBlobPacket(JSON.stringify({ type: 'buffer', payload: { text, fileName } }), file))
      this.addLog(`[${name}] ${text} [${fileName}]`)
    }

    this.onInputFileChange = () => {
      const blobFileName = this.binaryPacketBlobRef.files[ 0 ] ? this.binaryPacketBlobRef.files[ 0 ].name : ''
      this.setState({ blobFileName })
    }
    this.clearInputFile = () => {
      this.binaryPacketBlobRef.value = ''
      this.setState({ blobFileName: '' })
    }

    this.setGroupPathRef = (ref) => (this.groupPathRef = ref)
    this.setNameRef = (ref) => (this.nameRef = ref)
    this.setBufferPacketPayloadRef = (ref) => (this.binaryPacketPayloadRef = ref)
    this.setBufferPacketBlobRef = (ref) => (this.binaryPacketBlobRef = ref)
    this.groupPathRef = null
    this.nameRef = null
    this.binaryPacketPayloadRef = null
    this.binaryPacketBlobRef = null

    this.state = { groupPath: '', name: '', groupInfoList: [], logText: '', blobFileName: '' }
  }

  componentDidUpdate (prevProps, prevState) {
    if (!prevProps.authGroupBinaryPacketWebSocket && this.props.authGroupBinaryPacketWebSocket) {
      const socket = this.props.authGroupBinaryPacketWebSocket
      // __DEV__ && addLogListener(socket, this.addLog)

      socket.addEventListener('open', () => {
        this.addLog(`-- [open] --`)
      })
      socket.addEventListener('close', () => {
        this.addLog(`-- [close] --`)
        this.setState({ groupInfoList: [] })
      })
      socket.addEventListener('message', async ({ data }) => {
        const [ headerString, payloadBlob ] = await parseBlobPacket(data)
        const { type, payload } = JSON.parse(headerString)
        if (type === 'groupInfo') {
          const groupInfoList = payload
          this.addLog(`-- [group size: ${groupInfoList.length}] --`)
          this.setState({ groupInfoList })
        }
        if (type === 'buffer') {
          const { name, text, fileName } = payload
          this.addLog(`[${name}] ${text} [${fileName}]`)
          fileName && createDownload(fileName, await parseBlobAsDataURL(payloadBlob))
        }
      })
    }
  }

  render () {
    const { authGroupBinaryPacketWebSocket, classes } = this.props
    const { groupPath, name, groupInfoList, logText, blobFileName } = this.state
    const hasWebSocket = Boolean(authGroupBinaryPacketWebSocket)
    const allowSend = hasWebSocket && Boolean(groupInfoList.length >= 2)
    return <Card>
      <CardContent>
        <Typography type="title" className={classes.title}>Auth Group Buffer Packet</Typography>
        {!hasWebSocket && <TextField inputRef={this.setGroupPathRef} label="Group" placeholder="group-path" margin="normal" fullWidth />}
        {!hasWebSocket && <TextField inputRef={this.setNameRef} label="Name" placeholder="display-name" margin="normal" fullWidth />}
        {hasWebSocket && <Typography>{name}@{groupPath} #{groupInfoList.length}</Typography>}
        {hasWebSocket && <TextField inputRef={this.setBufferPacketPayloadRef} label="Text" placeholder="message-text" margin="normal" fullWidth multiline rowsMax={8} disabled={!allowSend} />}
        <input ref={this.setBufferPacketBlobRef} id="input-file" type="file" accept="*/*" style={{ display: 'none' }} onChange={this.onInputFileChange} disabled={!hasWebSocket} />
      </CardContent>
      {hasWebSocket && <CardActions>
        <label htmlFor="input-file">
          <Button component="span" disabled={!hasWebSocket}>{blobFileName ? `Blob: ${blobFileName}` : 'Select Blob'}</Button>
        </label>
        <Button onClick={this.clearInputFile} disabled={!hasWebSocket}>Clear Blob</Button>
      </CardActions>}
      <Grid component="pre" className={classes.log}>{logText || 'LOG'}</Grid>
      <CardActions>
        {hasWebSocket
          ? <Button onClick={this.closeWebSocket}>Close</Button>
          : <Button onClick={this.openWebSocket}>Open</Button>
        }
        <Button onClick={this.sendWebSocket} disabled={!allowSend}>Send</Button>
        <Button onClick={this.clearLog} disabled={!logText}>Clear Log</Button>
      </CardActions>
    </Card>
  }
}

export { WebSocketAuthGroupBinaryPacket }
