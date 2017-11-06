import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  Grid, Card, CardContent, CardHeader, CardActions,
  Avatar, Button, Typography
} from 'material-ui'

import { GridContainer } from 'view/__utils__'

class Auth extends PureComponent {
  static propTypes = {
    authState: PropTypes.object,
    doAuthGrantGoogle: PropTypes.func,
    doAuthGrantGithub: PropTypes.func,
    doAuthRevoke: PropTypes.func,
    doAuthCheck: PropTypes.func
  }

  render () {
    const { authState: { user, authCheckResultText = '' }, doAuthGrantGoogle, doAuthGrantGithub, doAuthRevoke, doAuthCheck } = this.props
    const isAuth = Boolean(user)
    const userAvatar = isAuth
      ? <Avatar src={user.photoURL || null}>
        {user.photoURL ? null : (user.displayName || '')[ 0 ].toUpperCase()}
      </Avatar>
      : <Avatar>?</Avatar>
    return <GridContainer>
      <Grid item xs={12} sm={8} lg={6}>
        <Card>
          <CardHeader title={isAuth ? user.displayName : blankSpan} subheader={isAuth ? user.email : blankSpan} avatar={userAvatar} />
          <CardContent>
            <Typography paragraph>{isAuth ? `Signed in with ${user.providerId}` : 'Not signed in'}</Typography>
            <Typography paragraph>{authCheckResultText || ''}</Typography>
          </CardContent>
          <CardActions>
            {!isAuth && <Button color="primary" onClick={doAuthGrantGoogle}>Sign in with Google</Button>}
            {!isAuth && <Button color="primary" onClick={doAuthGrantGithub}>Sign in with GitHub</Button>}
            {isAuth && <Button onClick={doAuthCheck}>Auth Check</Button>}
            {isAuth && <Button onClick={doAuthRevoke}>Sign Out</Button>}
          </CardActions>
        </Card>
      </Grid>
    </GridContainer>
  }
}

const blankSpan = <span>&nbsp;</span>

export { Auth }
