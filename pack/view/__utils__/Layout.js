import { Common } from 'dr-js/module/Dr.browser'
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  AppBar, Toolbar, Drawer, Divider,
  List, ListItem, ListItemIcon, ListItemText,
  IconButton, Icon,
  Typography,
  MuiThemeProvider, withStyles
} from 'material-ui'

import { MuiTheme } from 'theme/material-ui'
import CSS_METRICS from 'theme/metrics.pcss'

import { ROUTE_MAP, ROUTE_INFO_MAP } from './route'

const CSS_MAIN = CSS_METRICS[ 'fill-overflow-vertical' ]
const CSS_DRAWER_LIST = CSS_METRICS[ 'drawer-content' ]
const CSS_MENU_BUTTON = CSS_METRICS[ 'toolbar-menu-button' ]

const { Immutable: { immutableTransformCache } } = Common

class Layout extends PureComponent {
  static propTypes = {
    route: PropTypes.string,
    children: PropTypes.node
  }

  constructor (props) {
    super(props)
    this.doDrawerOpen = () => this.setState({ isDrawerOpen: true })
    this.doDrawerClose = () => this.setState({ isDrawerOpen: false })
    this.state = { isDrawerOpen: false }
  }

  render () {
    const { route, children } = this.props
    const { isDrawerOpen } = this.state
    const { title, drawerContent } = getRouteDataCached(route)
    return <MuiThemeProvider theme={MuiTheme}>
      <div className={CSS_MAIN}>
        <AppBar><Toolbar disableGutters>
          <IconButton className={CSS_MENU_BUTTON} onClick={this.doDrawerOpen}><Icon>menu</Icon></IconButton>
          <Typography type="title" color="inherit" noWrap>{title}</Typography>
        </Toolbar></AppBar>
        <AppBarPlaceholder />
        {children}
        <Drawer open={isDrawerOpen} onRequestClose={this.doDrawerClose} onClick={this.doDrawerClose}>{drawerContent}</Drawer>
      </div>
    </MuiThemeProvider>
  }
}

const getRouteDataCached = immutableTransformCache((route) => ({ title: ROUTE_INFO_MAP(route).title, drawerContent: getDrawerContent(route) }))

const DrawerList = ({ children }) => <div className={CSS_DRAWER_LIST}><List>{children}</List></div>
DrawerList.propTypes = { children: PropTypes.node }

const DrawerItemComponent = ({ title, iconName, onClick, isSelect, classes }) => <ListItem button onClick={isSelect ? null : onClick}>
  <ListItemIcon><Icon className={isSelect ? classes.select : null}>{iconName}</Icon></ListItemIcon>
  <ListItemText primary={<Typography className={isSelect ? classes.select : null}>{title}</Typography>} />
</ListItem>
DrawerItemComponent.propTypes = {
  title: PropTypes.string,
  iconName: PropTypes.string,
  onClick: PropTypes.func,
  isSelect: PropTypes.bool,
  classes: PropTypes.object.isRequired // from withStyles
}
const DrawerItem = withStyles((theme) => ({ select: { color: theme.palette.primary[ 900 ] } }))(DrawerItemComponent)

const AppBarPlaceholderComponent = ({ classes }) => <AppBar position="static" className={classes.placeholder}><Toolbar /></AppBar>
AppBarPlaceholderComponent.propTypes = { classes: PropTypes.object.isRequired } // from withStyles
const AppBarPlaceholder = withStyles((theme) => ({ placeholder: { visibility: 'hidden' } }))(AppBarPlaceholderComponent)

const getDrawerContent = (currentRoute) => <div className={CSS_DRAWER_LIST}><List>
  <DrawerItem {...ROUTE_INFO_MAP[ ROUTE_MAP.HOME ]} isSelect={currentRoute === ROUTE_MAP.HOME || currentRoute === ROUTE_MAP.HOME_ALIAS} />
</List><Divider /><List>
  <DrawerItem {...ROUTE_INFO_MAP[ ROUTE_MAP.SERVER_STATUS ]} isSelect={currentRoute === ROUTE_MAP.SERVER_STATUS} />
  <DrawerItem {...ROUTE_INFO_MAP[ ROUTE_MAP.STATIC_FILE_LIST ]} isSelect={currentRoute === ROUTE_MAP.STATIC_FILE_LIST} />
</List><Divider /><List>
  <DrawerItem {...ROUTE_INFO_MAP[ ROUTE_MAP.TEST_AUTH ]} isSelect={currentRoute === ROUTE_MAP.TEST_AUTH} />
  <DrawerItem {...ROUTE_INFO_MAP[ ROUTE_MAP.TEST_WEBSOCKET ]} isSelect={currentRoute === ROUTE_MAP.TEST_WEBSOCKET} />
</List><Divider /><List>
  <DrawerItem {...ROUTE_INFO_MAP[ ROUTE_MAP.INFO ]} isSelect={currentRoute === ROUTE_MAP.INFO} />
</List></div>

export {
  Layout,
  DrawerList,
  DrawerItem,
  getDrawerContent
}
