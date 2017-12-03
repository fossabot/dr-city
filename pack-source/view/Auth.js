import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  Grid, Card, CardContent, CardHeader, CardActions,
  Avatar, Button, Typography,
  withStyles
} from 'material-ui'
import { ROUTE_MAP } from 'pack-source/__utils__'
import { LogStyle } from 'pack-source/theme/style'
import { authFetch } from 'pack-source/state'
import { GridContainer } from 'pack-source/view/Layout'

class AuthComponent extends PureComponent {
  static propTypes = {
    user: PropTypes.object,
    dispatch: PropTypes.func,
    classes: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)

    this.doAuthGrantGoogle = () => { this.props.dispatch({ type: 'state:auth:grant-google', payload: {} }) }
    this.doAuthGrantGithub = () => { this.props.dispatch({ type: 'state:auth:grant-github', payload: {} }) }
    this.doAuthRevoke = () => { this.props.dispatch({ type: 'state:auth:revoke', payload: {} }) }
    this.doAuthCheck = async () => {
      try {
        const response = await authFetch(ROUTE_MAP.AUTH_TASK_TOKEN_CHECK, { method: 'POST' })
        const resultObject = await response.json()
        this.setState({ authCheckResultText: JSON.stringify(resultObject, null, '  ') })
      } catch (error) {
        __DEV__ && console.warn(error)
        this.props.dispatch({ type: 'state:error:add', payload: { error, retryFunc: this.doAuthCheck } })
      }
    }

    this.state = { authCheckResultText: '' }
  }

  render () {
    const { user, classes } = this.props
    const { authCheckResultText = '' } = this.state
    const isAuth = Boolean(user)
    const userAvatar = isAuth
      ? <Avatar src={user.avatar || null}>
        {user.avatar ? null : (user.name || '')[ 0 ].toUpperCase()}
      </Avatar>
      : <Avatar>?</Avatar>
    return <GridContainer>
      <Grid item xs={12} sm={8} lg={6}>
        <Card>
          <CardHeader title={isAuth ? user.name : blankSpan} subheader={isAuth ? user.email : blankSpan} avatar={userAvatar} />
          <CardContent>
            <Typography paragraph>{isAuth ? `Signed in with ${user.providerId}` : 'Not signed in'}</Typography>
          </CardContent>
          {authCheckResultText && <Grid component="pre" className={classes.log}>{authCheckResultText}</Grid>}
          <CardActions>
            {!isAuth && <Button color="primary" onClick={this.doAuthGrantGoogle}>Sign in with Google</Button>}
            {!isAuth && <Button color="primary" onClick={this.doAuthGrantGithub}>Sign in with GitHub</Button>}
            {isAuth && <Button onClick={this.doAuthCheck}>Auth Check</Button>}
            {isAuth && <Button onClick={this.doAuthRevoke}>Sign Out</Button>}
          </CardActions>
        </Card>
      </Grid>
    </GridContainer>
  }
}

const Auth = withStyles((theme) => ({ log: LogStyle }))(AuthComponent)

const blankSpan = <span>&nbsp;</span>

export { Auth }
