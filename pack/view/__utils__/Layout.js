import { Common } from 'dr-js/module/Dr.browser'
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  AppBar, Toolbar, Drawer, Divider, Grid,
  List, ListItem, ListItemIcon, ListItemText,
  IconButton, Icon, Typography,
  MuiThemeProvider, withStyles
} from 'material-ui'

import { metrics } from 'theme/metrics'
import { MuiTheme } from 'theme/material-ui'

import { ROUTE_MAP, ROUTE_INFO_MAP } from './route'

const { Immutable: { immutableTransformCache } } = Common

class LayoutComponent extends PureComponent {
  static propTypes = {
    route: PropTypes.string,
    classes: PropTypes.object.isRequired,
    children: PropTypes.node
  }

  constructor (props) {
    super(props)
    this.getRouteDataCached = immutableTransformCache((route) => ({ title: ROUTE_INFO_MAP[ route ].title, drawerContent: getDrawerContent(route) }))
    this.doDrawerOpen = () => this.setState({ isDrawerOpen: true })
    this.doDrawerClose = () => this.setState({ isDrawerOpen: false })
    this.state = { isDrawerOpen: false }
  }

  render () {
    const { route, classes, children } = this.props
    const { isDrawerOpen } = this.state
    const { title, drawerContent } = this.getRouteDataCached(route)
    return <MuiThemeProvider theme={MuiTheme}>
      <div className={classes.fill}>
        <AppBar><Toolbar disableGutters>
          <IconButton className={classes.menuButton} onClick={this.doDrawerOpen}><Icon>menu</Icon></IconButton>
          <Typography type="title" color="inherit" noWrap>{title}</Typography>
        </Toolbar></AppBar>
        <AppBarPlaceholder />
        {children}
        <Drawer open={isDrawerOpen} onRequestClose={this.doDrawerClose} onClick={this.doDrawerClose}>{drawerContent}</Drawer>
      </div>
    </MuiThemeProvider>
  }
}

const Layout = withStyles((theme) => ({ fill: { width: '100%', overflow: 'hidden' }, menuButton: { margin: `0 ${metrics.lengthS}` } }))(LayoutComponent)

const DrawerContainerComponent = ({ classes, children }) => <div className={classes.drawer}>{children}</div>
DrawerContainerComponent.propTypes = { classes: PropTypes.object.isRequired, children: PropTypes.node }
const DrawerContainer = withStyles((theme) => ({ drawer: { width: metrics.lengthDrawer } }))(DrawerContainerComponent)

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
const DrawerItem = withStyles((theme) => ({ select: { color: theme.palette.primary[ 900 ] } }))(DrawerItemComponent)

const AppBarPlaceholderComponent = ({ classes }) => <AppBar position="static" className={classes.placeholder}><Toolbar /></AppBar>
AppBarPlaceholderComponent.propTypes = { classes: PropTypes.object.isRequired }
const AppBarPlaceholder = withStyles((theme) => ({ placeholder: { visibility: 'hidden' } }))(AppBarPlaceholderComponent)

const GridContainerComponent = ({ classes, children }) => <Grid className={classes.paddingM} container justify="center">{children}</Grid>
GridContainerComponent.propTypes = { classes: PropTypes.object.isRequired, children: PropTypes.node }
const GridContainer = withStyles((theme) => ({ paddingM: { padding: metrics.lengthM } }))(GridContainerComponent)

const getDrawerContent = (currentRoute) => <DrawerContainer><List>
  <DrawerItem {...ROUTE_INFO_MAP[ ROUTE_MAP.HOME ]} isSelect={currentRoute === ROUTE_MAP.HOME || currentRoute === ROUTE_MAP.HOME_ALIAS} />
</List><Divider /><List>
  <DrawerItem {...ROUTE_INFO_MAP[ ROUTE_MAP.SERVER_STATUS ]} isSelect={currentRoute === ROUTE_MAP.SERVER_STATUS} />
  <DrawerItem {...ROUTE_INFO_MAP[ ROUTE_MAP.STATIC_FILE_LIST ]} isSelect={currentRoute === ROUTE_MAP.STATIC_FILE_LIST} />
</List><Divider /><List>
  <DrawerItem {...ROUTE_INFO_MAP[ ROUTE_MAP.TEST_AUTH ]} isSelect={currentRoute === ROUTE_MAP.TEST_AUTH} />
  <DrawerItem {...ROUTE_INFO_MAP[ ROUTE_MAP.TEST_WEBSOCKET ]} isSelect={currentRoute === ROUTE_MAP.TEST_WEBSOCKET} />
  {/* </List><Divider /><List> */}
  {/* <DrawerItem {...ROUTE_INFO_MAP[ ROUTE_MAP.INFO ]} isSelect={currentRoute === ROUTE_MAP.INFO} /> */}
</List></DrawerContainer>

export {
  Layout,
  DrawerContainer,
  GridContainer,
  getDrawerContent
}
