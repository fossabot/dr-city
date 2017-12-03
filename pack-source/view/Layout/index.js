import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  AppBar, Toolbar, Drawer, Menu, Divider, Grid, List,
  IconButton, Icon, Typography,
  MuiThemeProvider, withStyles
} from 'material-ui'

import { metrics } from 'pack-source/theme/metrics'
import { MuiTheme } from 'pack-source/theme/material-ui'
import { ROUTE_MAP, ROUTE_INFO_MAP } from 'pack-source/__utils__'
import { DrawerItem, DrawerItemAuth, DrawerContainer } from './DrawerItem'
import { UserAvatarButton } from './Avatar'

class LayoutComponent extends PureComponent {
  static propTypes = {
    route: PropTypes.string,
    user: PropTypes.object,
    setRoute: PropTypes.func,
    children: PropTypes.node,
    classes: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)

    const routePropsMap = Object.entries(ROUTE_INFO_MAP).reduce((o, [ route, routeInfo ]) => {
      o[ route ] = { ...routeInfo, route, onClick: () => this.props.setRoute(route) }
      return o
    }, {})

    this.drawerProps = {
      doDrawerOpen: () => this.setState({ isDrawerOpen: true }),
      doDrawerClose: () => this.setState({ isDrawerOpen: false }),
      routePropsMap
    }

    this.menuProps = {
      doMenuOpen: (event) => this.setState({ menuElement: event.currentTarget }),
      doMenuClose: () => this.setState({ menuElement: null }),
      routePropsMap
    }

    this.routeToAuth = routePropsMap[ ROUTE_MAP.VIEW_USER ].onClick

    this.state = {
      isDrawerOpen: false,
      menuElement: null
    }
  }

  render () {
    const { route, user, classes, children } = this.props
    const { isDrawerOpen, menuElement } = this.state
    const { title } = ROUTE_INFO_MAP[ route ]
    return <MuiThemeProvider theme={MuiTheme}>
      <div className={classes.fill}>
        <AppBar><Toolbar>
          <IconButton className={classes.menuButton} onClick={this.drawerProps.doDrawerOpen}>
            <Icon>menu</Icon>
          </IconButton>

          <Typography className={classes.title} type="title" color="inherit" noWrap>{title}</Typography>

          <UserAvatarButton user={user} onClick={user ? this.menuProps.doMenuOpen : this.routeToAuth} />
          {user && <MenuComponent {...{ ...this.menuProps, menuElement, route, user }} />}
        </Toolbar></AppBar>
        <AppBarPlaceholder />

        {children}

        <DrawerComponent {...{ ...this.drawerProps, isDrawerOpen, route }} />
      </div>
    </MuiThemeProvider>
  }
}

const Layout = withStyles((theme) => ({
  fill: { width: '100%', overflow: 'hidden' },
  menuButton: { marginRight: metrics.lengthS },
  title: { flex: 1 }
}))(LayoutComponent)

const AppBarPlaceholder = withStyles((theme) => ({
  placeholder: { visibility: 'hidden' }
}))(({ classes }) => <AppBar position="static" className={classes.placeholder}><Toolbar /></AppBar>)

const GridContainer = withStyles((theme) => ({
  paddingM: { padding: metrics.lengthM }
}))(({ classes, children }) => <Grid className={classes.paddingM} container justify="center">{children}</Grid>)

class DrawerComponent extends PureComponent {
  static propTypes = {
    isDrawerOpen: PropTypes.bool,
    doDrawerClose: PropTypes.func,
    routePropsMap: PropTypes.object,
    route: PropTypes.string
  }

  render () {
    const { isDrawerOpen, doDrawerClose, routePropsMap, route } = this.props
    return <Drawer open={isDrawerOpen} onClose={doDrawerClose} onClick={doDrawerClose}>
      {isDrawerOpen && <DrawerContainer>
        <AppBarPlaceholder />
        <Divider />
        <List>
          <DrawerItem {...routePropsMap[ ROUTE_MAP.VIEW_MAIN ]} isSelect={route === ROUTE_MAP.VIEW_MAIN} />
          <DrawerItem {...routePropsMap[ ROUTE_MAP.VIEW_STATUS ]} isSelect={route === ROUTE_MAP.VIEW_STATUS} />
          <DrawerItem {...routePropsMap[ ROUTE_MAP.VIEW_FILE ]} isSelect={route === ROUTE_MAP.VIEW_FILE} />
        </List>
        <Divider />
        <List>
          <DrawerItem {...routePropsMap[ ROUTE_MAP.VIEW_TEST_WEBSOCKET ]} isSelect={route === ROUTE_MAP.VIEW_TEST_WEBSOCKET} />
          {__DEV__ && <DrawerItem {...routePropsMap[ ROUTE_MAP.VIEW_TEST_ERROR ]} isSelect={route === ROUTE_MAP.VIEW_TEST_ERROR} />}
          {__DEV__ && <DrawerItem {...routePropsMap[ ROUTE_MAP.VIEW_TEST_ERROR_ASYNC ]} isSelect={route === ROUTE_MAP.VIEW_TEST_ERROR_ASYNC} />}
        </List>
        <Divider />
        <List>
          <DrawerItem {...routePropsMap[ ROUTE_MAP.VIEW_INFO ]} isSelect={route === ROUTE_MAP.VIEW_INFO} />
        </List>
      </DrawerContainer>}
    </Drawer>
  }
}

class MenuComponent extends PureComponent {
  static propTypes = {
    menuElement: PropTypes.any,
    doMenuClose: PropTypes.func,
    routePropsMap: PropTypes.object,
    route: PropTypes.string,
    user: PropTypes.object
  }

  render () {
    const { menuElement, doMenuClose, routePropsMap, route, user } = this.props
    const isMenuOpen = Boolean(menuElement)
    return <Menu open={isMenuOpen} anchorEl={menuElement} onClose={doMenuClose} onClick={doMenuClose}>
      <DrawerItemAuth {...routePropsMap[ ROUTE_MAP.VIEW_USER ]} isSelect={route === ROUTE_MAP.VIEW_USER} user={user} />
      <DrawerItem {...routePropsMap[ ROUTE_MAP.AUTH_VIEW_USER_FILE ]} isSelect={route === ROUTE_MAP.AUTH_VIEW_USER_FILE} />
    </Menu>
  }
}

export { Layout, GridContainer }
