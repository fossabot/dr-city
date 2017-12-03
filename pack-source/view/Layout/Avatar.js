import React from 'react'
import PropTypes from 'prop-types'
import { Avatar, Icon, IconButton, withStyles } from 'material-ui'
import { metrics } from 'pack-source/theme/metrics'

const UserAvatar = ({ user }) => !user ? <Avatar><Icon>person</Icon></Avatar>
  : !user.avatar ? <Avatar>{(user.name || '')[ 0 ].toUpperCase()}</Avatar>
    : <Avatar src={user.avatar} />
UserAvatar.propTypes = {
  user: PropTypes.object
}

const UserAvatarButton = withStyles((theme) => ({
  avatar: { width: metrics.iconS, height: metrics.iconS }
}))(({ user, onClick, classes }) => !user
  ? <IconButton onClick={onClick}>account_circle</IconButton>
  : !user.avatar
    ? <IconButton onClick={onClick}><Avatar className={classes.avatar}>{(user.name || '')[ 0 ].toUpperCase()}</Avatar></IconButton>
    : <IconButton onClick={onClick}><Avatar className={classes.avatar} src={user.avatar} /></IconButton>)
UserAvatarButton.propTypes = {
  user: PropTypes.object,
  onClick: PropTypes.func,
  classes: PropTypes.object
}

export { UserAvatar, UserAvatarButton }
