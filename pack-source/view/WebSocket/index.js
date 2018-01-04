import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Grid, withStyles } from 'material-ui'
import { LogStyle } from 'pack-source/theme/style'
import { GridContainer } from 'pack-source/view/Layout'
import { WebSocketTextJSON } from './WebSocketTextJSON'
import { WebSocketBinaryPacket } from './WebSocketBinaryPacket'
import { WebSocketAuthGroupTextJSON } from './WebSocketAuthGroupTextJSON'
import { WebSocketAuthGroupBinaryPacket } from './WebSocketAuthGroupBinaryPacket'

class WebSocketComponent extends PureComponent {
  static propTypes = {
    textJSONWebSocket: PropTypes.object,
    binaryPacketWebSocket: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired
  }

  render () {
    const { textJSONWebSocket, binaryPacketWebSocket, dispatch, classes } = this.props
    return <GridContainer>
      <Grid item xs={12} lg={6}>
        <WebSocketTextJSON {...{ textJSONWebSocket, dispatch, classes }} />
      </Grid>
      <Grid item xs={12} lg={6}>
        <WebSocketBinaryPacket {...{ binaryPacketWebSocket, dispatch, classes }} />
      </Grid>
    </GridContainer>
  }
}

class AuthWebSocketComponent extends PureComponent {
  static propTypes = {
    user: PropTypes.object,
    authGroupTextJSONWebSocket: PropTypes.object,
    authGroupBinaryPacketWebSocket: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired
  }

  render () {
    const { user, authGroupTextJSONWebSocket, authGroupBinaryPacketWebSocket, dispatch, classes } = this.props
    return <GridContainer>
      <Grid item xs={12} lg={6}>
        <WebSocketAuthGroupTextJSON {...{ authGroupTextJSONWebSocket, user, dispatch, classes }} />
      </Grid>
      <Grid item xs={12} lg={6}>
        <WebSocketAuthGroupBinaryPacket {...{ authGroupBinaryPacketWebSocket, user, dispatch, classes }} />
      </Grid>
    </GridContainer>
  }
}

const WebSocket = withStyles((theme) => ({ log: LogStyle }))(WebSocketComponent)
const AuthWebSocket = withStyles((theme) => ({ log: LogStyle }))(AuthWebSocketComponent)

export { WebSocket, AuthWebSocket }
