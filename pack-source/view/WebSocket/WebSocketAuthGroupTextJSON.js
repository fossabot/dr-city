import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Card, CardContent, CardActions, Grid, Button, TextField, Typography } from 'material-ui'

class WebSocketAuthGroupTextJSON extends PureComponent {
  static propTypes = {
    authGroupTextJSONWebSocket: PropTypes.object,
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
      this.props.dispatch({ type: 'state:websocket:auth-group-text-json:open', payload: { groupPath, name } })
    }
    this.closeWebSocket = () => this.props.dispatch({ type: 'state:websocket:auth-group-text-json:close' })
    this.sendWebSocket = () => {
      const { authGroupTextJSONWebSocket } = this.props
      const { name } = this.state
      if (!authGroupTextJSONWebSocket) return
      const text = this.textJSONPayloadRef.value
      authGroupTextJSONWebSocket.send(JSON.stringify({ type: 'text', payload: { text } }))
      this.addLog(`[${name}] ${text}`)
      // this.addLog(`[?|${formatDataSize(data)}] ${truncate(data)}`)
    }

    this.setGroupPathRef = (ref) => (this.groupPathRef = ref)
    this.setNameRef = (ref) => (this.nameRef = ref)
    this.setTextJSONPayloadRef = (ref) => (this.textJSONPayloadRef = ref)
    this.groupPathRef = null
    this.nameRef = null
    this.textJSONPayloadRef = null

    this.state = { groupPath: '', name: '', logText: '', groupInfoList: [] }
  }

  componentDidUpdate (prevProps, prevState) {
    if (!prevProps.authGroupTextJSONWebSocket && this.props.authGroupTextJSONWebSocket) {
      const socket = this.props.authGroupTextJSONWebSocket
      // __DEV__ && addLogListener(socket, this.addLog)

      socket.addEventListener('open', () => {
        this.addLog(`-- [open] --`)
      })
      socket.addEventListener('close', () => {
        this.addLog(`-- [close] --`)
        this.setState({ groupInfoList: [] })
      })
      socket.addEventListener('message', async ({ data }) => {
        const { type, payload } = JSON.parse(data)
        if (type === 'groupInfo') {
          const groupInfoList = payload
          this.addLog(`-- [group size: ${groupInfoList.length}] --`)
          this.setState({ groupInfoList })
        }
        if (type === 'text') {
          const { name, text } = payload
          this.addLog(`[${name}] ${text}`)
        }
      })
    }
  }

  render () {
    const { authGroupTextJSONWebSocket, classes } = this.props
    const { logText, groupInfoList } = this.state
    const hasWebSocket = Boolean(authGroupTextJSONWebSocket)
    const allowSend = hasWebSocket && Boolean(groupInfoList.length >= 2)
    return <Card>
      <CardContent>
        <Typography type="title" className={classes.title}>Auth Group Text JSON{groupInfoList.length ? ` (x${groupInfoList.length})` : ''}</Typography>
        <TextField inputRef={this.setGroupPathRef} disabled={hasWebSocket} label="Group" placeholder="data-type" margin="normal" fullWidth />
        <TextField inputRef={this.setNameRef} disabled={hasWebSocket} label="Name" placeholder="data-type" margin="normal" fullWidth />
        <TextField inputRef={this.setTextJSONPayloadRef} disabled={!allowSend} label="Text" placeholder="data-payload" margin="normal" fullWidth multiline rowsMax={8} />
      </CardContent>
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

export { WebSocketAuthGroupTextJSON }
