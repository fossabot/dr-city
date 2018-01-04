import { connect } from 'react-redux'
import { Layout } from './Layout'

// connect
import { ErrorSnackbar } from './ErrorSnackbar'
import { Auth } from './Auth'
import { ShareFile, UserFile } from './File'
import { Status } from './Status'
import { WebSocket, AuthWebSocket } from './WebSocket'

// direct
import { Main } from './Main'
import { Info } from './Info'
import { TestError, TestErrorAsync } from './__dev__'

const ErrorSnackbarConnected = connect(({ error: { errorList } }) => ({ errorList }))(ErrorSnackbar)
const AuthConnected = connect(({ auth: { user } }) => ({ user }))(Auth)
const ShareFileConnected = connect()(ShareFile)
const UserFileConnected = connect()(UserFile)
const StatusConnected = connect()(Status)
const WebSocketConnected = connect(({
  websocket: { textJSONWebSocket, binaryPacketWebSocket }
}) => ({ textJSONWebSocket, binaryPacketWebSocket }))(WebSocket)
const AuthWebSocketConnected = connect(({
  auth: { user },
  websocket: { authGroupTextJSONWebSocket, authGroupBinaryPacketWebSocket }
}) => ({ user, authGroupTextJSONWebSocket, authGroupBinaryPacketWebSocket }))(AuthWebSocket)

export {
  Layout,

  ErrorSnackbarConnected,
  AuthConnected,
  StatusConnected,
  ShareFileConnected,
  UserFileConnected,
  WebSocketConnected,
  AuthWebSocketConnected,

  Main,
  Info,
  TestError,
  TestErrorAsync
}
