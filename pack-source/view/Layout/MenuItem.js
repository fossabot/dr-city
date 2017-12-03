import React from 'react'
import PropTypes from 'prop-types'
import {
  ListItem, ListItemIcon, ListItemText,
  Icon, Typography,
  withStyles
} from 'material-ui'

import { metrics } from 'pack-source/theme/metrics'
import { UserAvatar } from './Avatar'

const DrawerItemComponent = ({ title, iconName, onClick, isSelect, classes }) => <ListItem button onClick={isSelect ? null : onClick}>
  <ListItemIcon><Icon className={isSelect ? classes.select : null}>{iconName}</Icon></ListItemIcon>
  <ListItemText primary={<Typography className={isSelect ? classes.select : null}>{title}</Typography>} />
</ListItem>
DrawerItemComponent.propTypes = {
  title: PropTypes.string,
  iconName: PropTypes.string,
  onClick: PropTypes.func,
  isSelect: PropTypes.bool,
  classes: PropTypes.object.isRequired
}

const DrawerItemAuthComponent = ({ onClick, isSelect, user }) => <ListItem button onClick={isSelect ? null : onClick}>
  <UserAvatar user={user} />
  <ListItemText primary={user ? user.name : blankSpan} secondary={user ? user.email : blankSpan} />
</ListItem>
DrawerItemAuthComponent.propTypes = {
  ...DrawerItemComponent.propTypes,
  user: PropTypes.object
}

const DrawerContainerComponent = ({ classes, children }) => <div className={classes.drawer}>{children}</div>
DrawerContainerComponent.propTypes = { classes: PropTypes.object.isRequired, children: PropTypes.node }

const blankSpan = <span>&nbsp;</span>

const DrawerItem = withStyles((theme) => ({ select: { color: theme.palette.primary[ 900 ] } }))(DrawerItemComponent)
const DrawerItemAuth = withStyles((theme) => ({ select: { color: theme.palette.primary[ 900 ] } }))(DrawerItemAuthComponent)
const DrawerContainer = withStyles((theme) => ({ drawer: { width: metrics.lengthDrawer } }))(DrawerContainerComponent)

export { DrawerItem, DrawerItemAuth, DrawerContainer }
